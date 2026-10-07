using Microsoft.EntityFrameworkCore;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;

namespace Spectra.Infrastructure.Repositories;

public class UserSubscriptionRepository(AppDbContext context): IUserSubscriptionRepository
{
    public async Task<UserSubscription?> GetByUserIdAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var guidUserId)) 
            return null;
        
        return await context.UserSubscriptions
            .Include(us => us.SubscriptionPlan)
            .Include(us => us.SubscriptionPlanPrice)
            .FirstOrDefaultAsync(us => us.UserId == guidUserId);
    }

    public async Task<UserSubscription?> GetByStripeSubscriptionIdAsync(string stripeSubscriptionId)
    {
        return await context.UserSubscriptions.FirstOrDefaultAsync(us => us.StripeSubscriptionId == stripeSubscriptionId);
    }

    public async Task<UserSubscription?> GetByStripeCustomerIdAsync(string stripeCustomerId)
    {
        return await context.UserSubscriptions.FirstOrDefaultAsync(us => us.StripeCustomerId == stripeCustomerId);
    }

    public async Task<UserSubscription> CreateAsync(UserSubscription subscription)
    {
        await context.UserSubscriptions.AddAsync(subscription);
        await context.SaveChangesAsync();
        return subscription;
    }

    public async Task UpdateAsync(UserSubscription subscription)
    {
        context.Entry(subscription).State = EntityState.Modified;
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(UserSubscription subscription)
    {
        context.UserSubscriptions.Remove(subscription);
        await context.SaveChangesAsync();
    }
}