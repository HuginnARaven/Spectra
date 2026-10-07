using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces;

public interface IPaymentService
{
    Task<string> GetCustomerAsync(string customerId);
    Task<string> CreateCustomerAsync(string name, string email);
    Task<string> UpdateCustomerDataAsync(string customerId, string name, string email);
    
    Task<(string ProductId, string PriceId)> CreateSubscriptionPlanAsync(string name, string description,
        string currency, int priceCents, string interval, string localPlanId);
    Task UpdateSubscriptionPlanAsync(string planId, string name, string description);
    Task DeleteSubscriptionPlanAsync(string planId, bool isSoftDelete = false);
    
    Task<string> CreateSubscriptionPlanPrice(string planId, string currency, int priceCents, string interval);
    Task ChangeActiveStatusInSubscriptionPrice(string priceId, bool isActive);

    Task<string> CreateSubscriptionAsync(string customerId, string priceId);
    Task<string> CreateCheckoutSessionAsync(string customerId, string stripePriceId, string successUrl, string cancelUrl, string? clientReferenceId = null);
    Task UpdateSubscriptionPriceAsync(string stripeSubscriptionId, string newStripePriceId);
    Task CancelSubscriptionAsync(string stripeSubscriptionId, bool atPeriodEnd = true);
    Task ResumeSubscriptionAsync(string stripeSubscriptionId);
    Task<StripeSubscriptionDataDto> GetSubscriptionAsync(string stripeSubscriptionId);
}