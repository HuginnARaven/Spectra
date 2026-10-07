using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Domain.Entities;
using Spectra.Domain.Enums;
using Spectra.Domain.Interfaces;

namespace Spectra.Application.Services;

public class UserSubscriptionService(
    IUserSubscriptionRepository userSubscriptionRepository,
    ISubscriptionPlanRepository subscriptionPlanRepository,
    IPaymentService paymentService,
    IIdentityService identityService,
    IPaymentSynchronizationService paymentSynchronizationService,
    IOptions<FrontendSettings> frontendSettings,
    ILogger<UserSubscriptionService> logger) : IUserSubscriptionService
{
    public async Task<UserSubscriptionDto?> GetSubscriptionAsync(string userId)
    {
        var subscription = await userSubscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null)
            return null;

        var plan = subscription.SubscriptionPlan;
        var price = subscription.SubscriptionPlanPrice;

        return new UserSubscriptionDto
        {
            Id = subscription.Id,
            Status = subscription.Status.ToString(),
            CurrentPeriodStart = subscription.CurrentPeriodStart,
            CurrentPeriodEnd = subscription.CurrentPeriodEnd,
            CanceledAt = subscription.CanceledAt,
            CancelAtPeriodEnd = subscription.CancelAtPeriodEnd,
            SubscriptionPlanId = subscription.SubscriptionPlanId,
            PlanName = plan?.Name ?? string.Empty,
            SubscriptionPlanPriceId = subscription.SubscriptionPlanPriceId,
            Amount = price?.Amount ?? 0,
            CurrencyCode = price?.CurrencyCode ?? string.Empty,
            Interval = price?.Interval ?? string.Empty
        };
    }

    public async Task<string> CreateCheckoutSessionAsync(string userId, string priceId)
    {
        var lockKey = $"lock:checkout:{userId}";
        if (!await paymentSynchronizationService.AcquireLockAsync(lockKey))
            throw new InvalidOperationException("User already has an active checkout session");

        try
        {
            var existingSubscription = await userSubscriptionRepository.GetByUserIdAsync(userId);
            if (existingSubscription != null && existingSubscription.Status == SubscriptionStatus.Active)
                throw new InvalidOperationException("User already has an active subscription");

            var price = await subscriptionPlanRepository.GetSubscriptionPriceAsync(priceId);
            if (price == null)
                throw new KeyNotFoundException($"Price with id {priceId} does not exist");
            
            if (!price.IsActive)
                throw new ArgumentException("Selected price is not active");

            var plan = await subscriptionPlanRepository.GetSubscriptionPlanAsync(price.PlanId.ToString());
            if (plan == null)
                throw new KeyNotFoundException($"Plan for price {priceId} does not exist");

            if (!plan.IsActive)
                throw new ArgumentException("Selected plan is not active");

            if (plan.IsDefault)
                throw new ArgumentException("Cannot subscribe to the default plan");

            // Get or create Stripe Customer
            string stripeCustomerId;
            if (existingSubscription != null && !string.IsNullOrEmpty(existingSubscription.StripeCustomerId))
            {
                // Re-subscribing after cancellation — reuse existing Stripe Customer
                stripeCustomerId = existingSubscription.StripeCustomerId;
            }
            else
            {
                var user = await identityService.GetUserByIdAsync(userId);
                if (user == null)
                    throw new KeyNotFoundException($"User with id {userId} does not exist");

                var customerName = !string.IsNullOrWhiteSpace(user.DisplayName)
                    ? user.DisplayName
                    : (!string.IsNullOrWhiteSpace(user.UserName) ? user.UserName : string.Empty);

                stripeCustomerId = await paymentService.CreateCustomerAsync(
                    customerName,
                    user.Email ?? string.Empty);
            }

            var baseUrl = frontendSettings.Value.BaseUrl.TrimEnd('/');
            var checkoutUrl = await paymentService.CreateCheckoutSessionAsync(
                stripeCustomerId,
                price.StripePriceId,
                $"{baseUrl}/subscription/success",
                $"{baseUrl}/subscription/cancel",
                userId);
            
            return checkoutUrl;
        }
        finally
        {
            await paymentSynchronizationService.ReleaseLockAsync(lockKey);
        }
    }

    public async Task ChangePlanAsync(string userId, string newPriceId)
    {
        var subscription = await userSubscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null || subscription.Status != SubscriptionStatus.Active)
            throw new InvalidOperationException("No active subscription found");

        var newPrice = await subscriptionPlanRepository.GetSubscriptionPriceAsync(newPriceId);
        if (newPrice == null)
            throw new KeyNotFoundException($"Price with id {newPriceId} does not exist");
        
        if (!newPrice.IsActive)
            throw new ArgumentException("Selected price is not active");

        var newPlan = await subscriptionPlanRepository.GetSubscriptionPlanAsync(newPrice.PlanId.ToString());
        if (newPlan == null || !newPlan.IsActive)
            throw new ArgumentException("Selected plan does not exist or is not active");

        if (newPlan.IsDefault)
            throw new ArgumentException("Cannot switch to the default plan");

        if (subscription.SubscriptionPlanPriceId == newPrice.Id)
            throw new ArgumentException("Already subscribed to this price");

        await paymentService.UpdateSubscriptionPriceAsync(subscription.StripeSubscriptionId, newPrice.StripePriceId);
        if (subscription.CancelAtPeriodEnd)
        {
            await paymentService.ResumeSubscriptionAsync(subscription.StripeSubscriptionId);
            subscription.CancelAtPeriodEnd = false;
            subscription.CanceledAt = null;
        }
        
        // Optimistic local update — webhook will confirm
        subscription.SubscriptionPlanId = newPlan.Id;
        subscription.SubscriptionPlanPriceId = newPrice.Id;

        await userSubscriptionRepository.UpdateAsync(subscription);
    }

    public async Task CancelSubscriptionAsync(string userId, bool immediate = false)
    {
        var subscription = await userSubscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null || (subscription.Status != SubscriptionStatus.Active && subscription.Status != SubscriptionStatus.PastDue))
            throw new InvalidOperationException("No active subscription found");

        await paymentService.CancelSubscriptionAsync(
            subscription.StripeSubscriptionId,
            atPeriodEnd: !immediate);

        if (immediate)
        {
            subscription.Status = SubscriptionStatus.Canceled;
            subscription.CancelAtPeriodEnd = false;
            subscription.CanceledAt = DateTime.UtcNow;
        }
        else
        {
            subscription.CancelAtPeriodEnd = true;
            subscription.CanceledAt = DateTime.UtcNow;
        }

        await userSubscriptionRepository.UpdateAsync(subscription);
    }

    public async Task ResumeSubscriptionAsync(string userId)
    {
        var subscription = await userSubscriptionRepository.GetByUserIdAsync(userId);
        if (subscription == null || !subscription.CancelAtPeriodEnd || subscription.Status != SubscriptionStatus.Active)
            throw new InvalidOperationException("No subscription scheduled for cancellation found");

        await paymentService.ResumeSubscriptionAsync(subscription.StripeSubscriptionId);

        subscription.CancelAtPeriodEnd = false;
        subscription.CanceledAt = null;

        await userSubscriptionRepository.UpdateAsync(subscription);
    }
    
    public async Task HandleCheckoutCompletedAsync(string sessionSubscriptionId, string? userId = null)
    {
        var stripeSubscription = await paymentService.GetSubscriptionAsync(sessionSubscriptionId);
        
        var localPrice = await subscriptionPlanRepository.GetSubscriptionPriceByPaymentIdAsync(stripeSubscription.PriceId);
        if (localPrice == null)
        {
            logger.LogWarning("Checkout completed for unknown Stripe Price: {PriceId}", stripeSubscription.PriceId);
            return;
        }

        var existingSubscription = await userSubscriptionRepository.GetByStripeCustomerIdAsync(stripeSubscription.CustomerId);
        
        if (existingSubscription == null && !string.IsNullOrEmpty(userId))
        {
            existingSubscription = await userSubscriptionRepository.GetByUserIdAsync(userId);
        }

        var status = MapStripeStatus(stripeSubscription.Status);

        if (existingSubscription != null)
        {
            // Re-subscribe after cancellation or re-activate existing subscription
            existingSubscription.StripeCustomerId = stripeSubscription.CustomerId;
            existingSubscription.StripeSubscriptionId = stripeSubscription.SubscriptionId;
            existingSubscription.Status = status;
            existingSubscription.SubscriptionPlanId = localPrice.PlanId;
            existingSubscription.SubscriptionPlanPriceId = localPrice.Id;
            existingSubscription.CurrentPeriodStart = stripeSubscription.CurrentPeriodStart;
            existingSubscription.CurrentPeriodEnd = stripeSubscription.CurrentPeriodEnd;
            existingSubscription.CancelAtPeriodEnd = stripeSubscription.CancelAtPeriodEnd;
            existingSubscription.CanceledAt = stripeSubscription.CanceledAt;

            await userSubscriptionRepository.UpdateAsync(existingSubscription);
            logger.LogInformation("Updated subscription {SubscriptionId} for user {UserId}", existingSubscription.Id, existingSubscription.UserId);
        }
        else if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var guidUserId))
        {
            // Brand new subscription
            var newSubscription = new UserSubscription
            {
                UserId = guidUserId,
                StripeCustomerId = stripeSubscription.CustomerId,
                StripeSubscriptionId = stripeSubscription.SubscriptionId,
                Status = status,
                SubscriptionPlanId = localPrice.PlanId,
                SubscriptionPlanPriceId = localPrice.Id,
                CurrentPeriodStart = stripeSubscription.CurrentPeriodStart,
                CurrentPeriodEnd = stripeSubscription.CurrentPeriodEnd,
                CancelAtPeriodEnd = stripeSubscription.CancelAtPeriodEnd,
                CanceledAt = stripeSubscription.CanceledAt
            };

            await userSubscriptionRepository.CreateAsync(newSubscription);
            logger.LogInformation("Created new UserSubscription {SubscriptionId} for user {UserId}", newSubscription.Id, guidUserId);
        }
        else
        {
            logger.LogWarning("Checkout completed for customer {CustomerId} (Subscription: {SubscriptionId}), but user ID could not be identified.",
                stripeSubscription.CustomerId, sessionSubscriptionId);
        }
    }

    public async Task HandleSubscriptionUpdatedAsync(string stripeSubscriptionId, string stripePriceId, string status,
        DateTime currentPeriodStart, DateTime currentPeriodEnd, bool cancelAtPeriodEnd, DateTime? canceledAt)
    {
        var subscription = await userSubscriptionRepository.GetByStripeSubscriptionIdAsync(stripeSubscriptionId);
        if (subscription == null)
        {
            logger.LogWarning("Received subscription.updated for unknown Stripe Subscription: {SubscriptionId}", stripeSubscriptionId);
            return;
        }

        // Update price/plan if changed
        var localPrice = await subscriptionPlanRepository.GetSubscriptionPriceByPaymentIdAsync(stripePriceId);
        if (localPrice != null && subscription.SubscriptionPlanPriceId != localPrice.Id)
        {
            subscription.SubscriptionPlanPriceId = localPrice.Id;
            subscription.SubscriptionPlanId = localPrice.PlanId;
        }

        subscription.Status = MapStripeStatus(status);
        subscription.CurrentPeriodStart = currentPeriodStart;
        subscription.CurrentPeriodEnd = currentPeriodEnd;
        subscription.CancelAtPeriodEnd = cancelAtPeriodEnd;
        subscription.CanceledAt = canceledAt;

        await userSubscriptionRepository.UpdateAsync(subscription);
    }

    public async Task HandleSubscriptionDeletedAsync(string stripeSubscriptionId)
    {
        var subscription = await userSubscriptionRepository.GetByStripeSubscriptionIdAsync(stripeSubscriptionId);
        if (subscription == null)
        {
            logger.LogWarning("Received subscription.deleted for unknown Stripe Subscription: {SubscriptionId}", stripeSubscriptionId);
            return;
        }

        subscription.Status = SubscriptionStatus.Canceled;
        if (subscription.CanceledAt == null)
            subscription.CanceledAt = DateTime.UtcNow;

        await userSubscriptionRepository.UpdateAsync(subscription);
    }

    public async Task HandleInvoicePaymentSucceededAsync(string stripeSubscriptionId, DateTime periodStart, DateTime periodEnd)
    {
        var subscription = await userSubscriptionRepository.GetByStripeSubscriptionIdAsync(stripeSubscriptionId);
        if (subscription == null)
            return;

        subscription.Status = SubscriptionStatus.Active;
        subscription.CurrentPeriodStart = periodStart;
        subscription.CurrentPeriodEnd = periodEnd;

        await userSubscriptionRepository.UpdateAsync(subscription);
    }

    public async Task HandleInvoicePaymentFailedAsync(string stripeSubscriptionId)
    {
        var subscription = await userSubscriptionRepository.GetByStripeSubscriptionIdAsync(stripeSubscriptionId);
        if (subscription == null)
            return;

        subscription.Status = SubscriptionStatus.PastDue;

        await userSubscriptionRepository.UpdateAsync(subscription);
    }

    private static SubscriptionStatus MapStripeStatus(string stripeStatus)
    {
        return stripeStatus switch
        {
            "active" => SubscriptionStatus.Active,
            "past_due" => SubscriptionStatus.PastDue,
            "canceled" => SubscriptionStatus.Canceled,
            "incomplete" => SubscriptionStatus.Incomplete,
            "incomplete_expired" => SubscriptionStatus.Canceled,
            "unpaid" => SubscriptionStatus.PastDue,
            _ => SubscriptionStatus.Incomplete
        };
    }
}
