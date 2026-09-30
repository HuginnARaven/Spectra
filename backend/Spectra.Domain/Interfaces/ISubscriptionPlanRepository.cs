using Spectra.Domain.Entities;

namespace Spectra.Domain.Interfaces;

public interface ISubscriptionPlanRepository
{
    Task<bool> DefaultSubscriptionPlanExistsAsync();
    
    Task<SubscriptionPlan> CreateSubscriptionPlanAsync(SubscriptionPlan subscriptionPlan);
    Task<SubscriptionPlan> UpdateSubscriptionPlanAsync(SubscriptionPlan subscriptionPlan);
    Task DeleteSubscriptionPlanAsync(SubscriptionPlan plan, bool isSoftDelete = false);
    Task<SubscriptionPlan?> GetSubscriptionPlanAsync(string planId);
    Task<SubscriptionPlan?> GetSubscriptionPlanByPaymentIdAsync(string planPaymentId);
    Task<IEnumerable<SubscriptionPlan>> GetSubscriptionPlansAsync();
    
    Task<SubscriptionPlanPrice?> GetSubscriptionPriceAsync(string priceId);
    Task<SubscriptionPlanPrice?> GetSubscriptionPriceByPaymentIdAsync(string paymentPriceId);
    Task AddSubscriptionPlanPriceAsync(SubscriptionPlanPrice price);
    Task DeletePriceFromSubscriptionPlanAsync(string paymentPriceId);
    Task<SubscriptionPlanPrice> UpdatePriceInSubscriptionPlanAsync(SubscriptionPlanPrice price);
}