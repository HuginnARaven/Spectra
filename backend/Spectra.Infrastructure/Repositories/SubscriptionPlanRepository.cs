using Microsoft.EntityFrameworkCore;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;

namespace Spectra.Infrastructure.Repositories;

public class SubscriptionPlanRepository(AppDbContext context): ISubscriptionPlanRepository
{
    public async Task<bool> DefaultSubscriptionPlanExistsAsync()
    {
        return await context.SubscriptionPlans.AsNoTracking().AnyAsync(sp => sp.IsDefault);
    }

    public async Task<SubscriptionPlan> CreateSubscriptionPlanAsync(SubscriptionPlan subscriptionPlan)
    {
        await context.SubscriptionPlans.AddAsync(subscriptionPlan);
        await context.SaveChangesAsync();
        return subscriptionPlan;
    }

    public async Task<SubscriptionPlan> UpdateSubscriptionPlanAsync(SubscriptionPlan subscriptionPlan)
    {
        context.Entry(subscriptionPlan).State = EntityState.Modified;
        await context.SaveChangesAsync();
        return subscriptionPlan;
    }

    public async Task DeleteSubscriptionPlanAsync(SubscriptionPlan plan, bool isSoftDelete = false)
    {
        // if (isSoftDelete)
        // {
        //     plan.IsActive =  false;
        //     await context.SaveChangesAsync();
        // }
        
        context.SubscriptionPlans.Remove(plan);
        await context.SaveChangesAsync();
    }

    public async Task<SubscriptionPlan?> GetSubscriptionPlanAsync(string planId)
    {
        if (!Guid.TryParse(planId, out var guidPlanId)) 
            return null;
        
        return await context.SubscriptionPlans.FindAsync(guidPlanId);
    }

    public async Task<SubscriptionPlan?> GetSubscriptionPlanByPaymentIdAsync(string planPaymentId)
    {
        return await context.SubscriptionPlans.FirstOrDefaultAsync(sp => sp.StripeProductId == planPaymentId);
    }

    public async Task<IEnumerable<SubscriptionPlan>> GetSubscriptionPlansAsync()
    {
        return await context.SubscriptionPlans.Include(sp => sp.Prices).ToListAsync();
    }

    public async Task<SubscriptionPlanPrice?> GetSubscriptionPriceAsync(string priceId)
    {
        if (!Guid.TryParse(priceId, out var guidPriceId)) 
            return null;
        
        return await context.SubscriptionPlanPrices.FindAsync(guidPriceId);
    }

    public async Task<SubscriptionPlanPrice?> GetSubscriptionPriceByPaymentIdAsync(string paymentPriceId)
    {
        return await context.SubscriptionPlanPrices.FirstOrDefaultAsync(spp => spp.StripePriceId == paymentPriceId);
    }

    public async Task AddSubscriptionPlanPriceAsync(SubscriptionPlanPrice price)
    {
        context.SubscriptionPlanPrices.Add(price);
        await context.SaveChangesAsync();
    }

    public async Task DeletePriceFromSubscriptionPlanAsync(string paymentPriceId)
    {
        var price = await context.SubscriptionPlanPrices.FirstOrDefaultAsync(spp => spp.StripePriceId == paymentPriceId);
        if (price == null)
            return;
        
        context.SubscriptionPlanPrices.Remove(price);
        await context.SaveChangesAsync();
    }

    public async Task<SubscriptionPlanPrice> UpdatePriceInSubscriptionPlanAsync(SubscriptionPlanPrice price)
    {
        context.Entry(price).State = EntityState.Modified;
        await context.SaveChangesAsync();
        return price;
    }
}