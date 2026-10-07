using Spectra.Domain.Entities;

namespace Spectra.Domain.Interfaces;

public interface IUserSubscriptionRepository
{
    Task<UserSubscription?> GetByUserIdAsync(string userId);
    Task<UserSubscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId);
    Task<UserSubscription?> GetByStripeCustomerIdAsync(string stripeCustomerId);
    Task<UserSubscription> CreateAsync(UserSubscription subscription);
    Task UpdateAsync(UserSubscription subscription);
    Task DeleteAsync(UserSubscription subscription);
}