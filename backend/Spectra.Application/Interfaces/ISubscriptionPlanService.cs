using Spectra.Application.DTOs;
using Spectra.Domain.Entities;

namespace Spectra.Application.Interfaces;

public interface ISubscriptionPlanService
{
    Task<SubscriptionPlanDto?> GetSubscriptionPlanByIdAsync(string planId);
    Task<IReadOnlyList<SubscriptionPlanDto?>> GetSubscriptionPlansAsync();
    Task CreateSubscriptionPlanAsync(CreateSubscriptionPlanRequest subscriptionPlan);
    Task AddPriceToSubscriptionPlanAsync(string subscriptionPlanId, CreateSubscriptionPriceRequest request);
    Task UpdatePriceActiveStatusAsync(string priceId, bool isActive);
    Task UpdateSubscriptionPlanAsync(string subscriptionPlanId, UpdateSubscriptionPlanRequest request);
    Task DeleteSubscriptionPlanAsync(string subscriptionPlanId);
    
    Task HandleSubscriptionPlanPaymentDeleteAsync(string paymentSubscriptionPlanId);
    Task HandleSubscriptionPlanPaymentUpdateAsync(string paymentSubscriptionPlanId, string name, string description, bool isActive);
    Task HandleSubscriptionPricePaymentDeleteAsync(string paymentSubscriptionPlanPriceId);
    Task HandlePricePaymentStatusChangeAsync(string paymentPriceId, bool isActive);
}