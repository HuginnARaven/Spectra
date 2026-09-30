using AutoMapper;
using Microsoft.Extensions.Logging;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;

namespace Spectra.Application.Services;

public class SubscriptionPlanService(ISubscriptionPlanRepository subscriptionPlanRepository, IPaymentService paymentService, IMapper mapper, ILogger<SubscriptionPlanService> logger): ISubscriptionPlanService
{
    public async Task<SubscriptionPlanDto?> GetSubscriptionPlanByIdAsync(string planId)
    {
        var plan = await subscriptionPlanRepository.GetSubscriptionPlanAsync(planId);
        if (plan == null)
            return null;
        
        return mapper.Map<SubscriptionPlanDto>(plan);
    }

    public async Task<IReadOnlyList<SubscriptionPlanDto?>> GetSubscriptionPlansAsync()
    {
        var plans = await subscriptionPlanRepository.GetSubscriptionPlansAsync();
        return mapper.Map<IReadOnlyList<SubscriptionPlanDto?>>(plans);
    }

    public async Task CreateSubscriptionPlanAsync(CreateSubscriptionPlanRequest subscriptionPlanRequest)
    {
        var subPlan = new SubscriptionPlan()
        {
            Name = subscriptionPlanRequest.Name,
            Description =  subscriptionPlanRequest.Description,
            IsDefault = subscriptionPlanRequest.IsDefault,
            HasAccessToGeneralAnalytics =  subscriptionPlanRequest.HasAccessToGeneralAnalytics,
            HasAccessToUrlAnalytics =  subscriptionPlanRequest.HasAccessToUrlAnalytics
        };
        
        if (subscriptionPlanRequest.IsDefault)
        {
            if (await subscriptionPlanRepository.DefaultSubscriptionPlanExistsAsync())
                throw new ArgumentException("Default subscription plan already exists");
            
            await subscriptionPlanRepository.CreateSubscriptionPlanAsync(subPlan);
            return;
        }
        
        await subscriptionPlanRepository.CreateSubscriptionPlanAsync(subPlan);
        (string? ProductId, string? PriceId) paymentIds = (null, null);
        
        try
        {
            paymentIds = await paymentService.CreateSubscriptionPlanAsync(
                subscriptionPlanRequest.Name,
                subscriptionPlanRequest.Description,
                subscriptionPlanRequest.CurrencyCode!,
                (int)subscriptionPlanRequest.Price!,
                subscriptionPlanRequest.Interval!,
                subPlan.Id.ToString());

            subPlan.StripeProductId = paymentIds.ProductId;
            await subscriptionPlanRepository.UpdateSubscriptionPlanAsync(subPlan);

            var newPrice = new SubscriptionPlanPrice()
            {
                Amount = (int)subscriptionPlanRequest.Price,
                CurrencyCode = subscriptionPlanRequest.CurrencyCode!,
                Interval = subscriptionPlanRequest.Interval!,
                StripePriceId = paymentIds.PriceId!,
                PlanId =  subPlan.Id
            };
            
            await subscriptionPlanRepository.AddSubscriptionPlanPriceAsync(newPrice);
        }
        catch (Exception ex)
        {
            await subscriptionPlanRepository.DeleteSubscriptionPlanAsync(subPlan);
            
            if (!string.IsNullOrEmpty(paymentIds.ProductId))
                await paymentService.DeleteSubscriptionPlanAsync(paymentIds.ProductId, true);
            
            throw;
        }
    }

    public async Task AddPriceToSubscriptionPlanAsync(string subscriptionPlanId, CreateSubscriptionPriceRequest request)
    {
        var plan = await subscriptionPlanRepository.GetSubscriptionPlanAsync(subscriptionPlanId);
        if (plan == null)
            throw new KeyNotFoundException($"Subscription plan with id {subscriptionPlanId} does not exists");
        
        if (plan.IsDefault || plan.StripeProductId == null)
            throw new ArgumentException($"Subscription plan is default or does not bound to stripe");
        
        var paymentId= await paymentService.CreateSubscriptionPlanPrice(
            plan.StripeProductId,
            request.CurrencyCode,
            request.Amount,
            request.Interval);

        var newPrice = new SubscriptionPlanPrice()
        {
            Amount =  request.Amount,
            CurrencyCode = request.CurrencyCode,
            Interval = request.Interval,
            IsActive =  request.IsActive,
            StripePriceId = paymentId,
            PlanId = plan.Id
        };

        try
        {
            await subscriptionPlanRepository.AddSubscriptionPlanPriceAsync(newPrice);
        }
        catch (Exception e)
        {
            await paymentService.ChangeActiveStatusInSubscriptionPrice(paymentId, false);
            throw;
        }
    }

    public async Task UpdateSubscriptionPlanAsync(string subscriptionPlanId, UpdateSubscriptionPlanRequest request)
    {
        var plan = await subscriptionPlanRepository.GetSubscriptionPlanAsync(subscriptionPlanId);
        if (plan == null)
            throw new KeyNotFoundException($"Subscription plan with id {subscriptionPlanId} does not exists");
        
        if (!plan.IsDefault && plan.StripeProductId != null)
            await paymentService.UpdateSubscriptionPlanAsync(plan.StripeProductId, request.Name, request.Description);

        plan.Name = request.Name;
        plan.Description = request.Description;
        plan.HasAccessToGeneralAnalytics = request.HasAccessToGeneralAnalytics;
        plan.HasAccessToUrlAnalytics = request.HasAccessToUrlAnalytics;
        
        await subscriptionPlanRepository.UpdateSubscriptionPlanAsync(plan);
    }

    public async Task UpdatePriceActiveStatusAsync(string priceId, bool isActive)
    {
        var price = await subscriptionPlanRepository.GetSubscriptionPriceAsync(priceId);
        if (price == null)
            throw new KeyNotFoundException($"Subscription plan with id {priceId} does not exists");
        
        await paymentService.ChangeActiveStatusInSubscriptionPrice(price.StripePriceId, isActive);
        
        price.IsActive = isActive;
        
        await subscriptionPlanRepository.UpdatePriceInSubscriptionPlanAsync(price);
    }

    public async Task DeleteSubscriptionPlanAsync(string planId)
    {
        var plan = await subscriptionPlanRepository.GetSubscriptionPlanAsync(planId);
        if (plan == null)
            throw new KeyNotFoundException($"Subscription plan with id {planId} does not exist");
        
        if (!plan.IsDefault && plan.StripeProductId != null)
            await paymentService.DeleteSubscriptionPlanAsync(plan.StripeProductId);
        
        await subscriptionPlanRepository.DeleteSubscriptionPlanAsync(plan);
    }

    public async Task HandleSubscriptionPlanPaymentDeleteAsync(string paymentSubscriptionPlanId)
    {
        var plan = await subscriptionPlanRepository.GetSubscriptionPlanByPaymentIdAsync(paymentSubscriptionPlanId);
        if (plan == null)
            return; // if no plan was found, it has already been deleted
        
        await subscriptionPlanRepository.DeleteSubscriptionPlanAsync(plan);
    }
    
    public async Task HandleSubscriptionPlanPaymentUpdateAsync(string paymentSubscriptionPlanId, string name, string description, bool isActive)
    {
        var plan = await subscriptionPlanRepository.GetSubscriptionPlanByPaymentIdAsync(paymentSubscriptionPlanId);
        if (plan == null)
        {
            //throw new KeyNotFoundException($"Subscription plan with payment id {paymentSubscriptionPlanId} does not exist");
            logger.LogWarning($"Received webhook for an unknown Stripe Product: {paymentSubscriptionPlanId}.");
            return;
        }

        if (plan.Name == name && plan.Description == description)
            return;
        
        plan.Name = name;
        plan.Description = description;
        // plan.Active =  isActive; TODO: add Active field to SubPlan
        
        await subscriptionPlanRepository.UpdateSubscriptionPlanAsync(plan);
    }

    public async Task HandleSubscriptionPricePaymentDeleteAsync(string paymentSubscriptionPlanPriceId)
    {
        await subscriptionPlanRepository.DeletePriceFromSubscriptionPlanAsync(paymentSubscriptionPlanPriceId);
    }

    public async Task HandlePricePaymentStatusChangeAsync(string paymentPriceId, bool isActive)
    {
        var price = await subscriptionPlanRepository.GetSubscriptionPriceByPaymentIdAsync(paymentPriceId);
        if (price == null)
        {
            //throw new KeyNotFoundException($"Price with id {paymentPriceId} does not exists");
            logger.LogWarning($"Received webhook for an unknown Stripe Price: {paymentPriceId}.");
            return;
        }
        
        if (price.IsActive == isActive)
            return;
        
        price.IsActive = isActive;
        
        await subscriptionPlanRepository.UpdatePriceInSubscriptionPlanAsync(price);
    }
}