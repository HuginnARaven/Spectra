using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces;

public interface IUserSubscriptionService
{
    Task<UserSubscriptionDto?> GetSubscriptionAsync(string userId);
    Task<string> CreateCheckoutSessionAsync(string userId, string priceId);
    Task ChangePlanAsync(string userId, string newPriceId);
    Task CancelSubscriptionAsync(string userId, bool immediate = false);
    Task ResumeSubscriptionAsync(string userId);
    
    // Webhook handlers
    Task HandleCheckoutCompletedAsync(string sessionSubscriptionId, string? userId = null);
    Task HandleSubscriptionUpdatedAsync(string stripeSubscriptionId, string stripePriceId, string status, 
        DateTime currentPeriodStart, DateTime currentPeriodEnd, bool cancelAtPeriodEnd, DateTime? canceledAt);
    Task HandleSubscriptionDeletedAsync(string stripeSubscriptionId);
    Task HandleInvoicePaymentSucceededAsync(string stripeSubscriptionId, DateTime periodStart, DateTime periodEnd);
    Task HandleInvoicePaymentFailedAsync(string stripeSubscriptionId);
}
