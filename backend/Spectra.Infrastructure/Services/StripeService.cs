using Microsoft.Extensions.Options;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace Spectra.Infrastructure.Services;

public class StripeService(StripeClient stripeClient): IPaymentService
{
    private static readonly HashSet<string> _possibleIntervals = new(StringComparer.OrdinalIgnoreCase){ "day", "week", "month", "year"};
    
    public async Task<string> GetCustomerAsync(string customerId)
    {
        var stCustomer = await stripeClient.V1.Customers.GetAsync(customerId);
            
        return stCustomer.Id;
    }

    public async Task<string> CreateCustomerAsync(string name, string email)
    {
        var options = new CustomerCreateOptions
        {
            Name = name,
            Email = email,
        };
        var stCustomer = await stripeClient.V1.Customers.CreateAsync(options);
            
        return stCustomer.Id;
    }
    
    public async Task<string> UpdateCustomerDataAsync(string customerId, string name, string email)
    {
        var options = new CustomerUpdateOptions
        {
            Name = name,
            Email = email,
        };
        var stCustomer = await stripeClient.V1.Customers.UpdateAsync(customerId, options);
        
        return stCustomer.Id;
    }
    
    public async Task<(string ProductId, string PriceId)> CreateSubscriptionPlanAsync(string name, string description, string currency, int priceCents, string interval, string localPlanId)
    {
        if (!_possibleIntervals.Contains(interval))
            throw new ArgumentException("Interval needs to be one of valid stripe intervals");
        
        var product = await stripeClient.V1.Products.CreateAsync(new ProductCreateOptions 
        {
            Name = name,
            Description = description,
            DefaultPriceData = new ProductDefaultPriceDataOptions()
            {
                Currency = currency,
                UnitAmount = priceCents,
                Recurring = new ProductDefaultPriceDataRecurringOptions()
                {
                    Interval = interval.ToLowerInvariant(),
                    IntervalCount = 1
                }
            },
            Metadata = new Dictionary<string, string>()
            {
                {"localPlanId",  localPlanId},
            }
        });
        
        return (product.Id, product.DefaultPriceId);
    }

    public async Task UpdateSubscriptionPlanAsync(string planId, string name, string description)
    {
        var options = new ProductUpdateOptions
        {
            Name = name,
            Description = description,
        };
        
        await stripeClient.V1.Products.UpdateAsync(planId, options);
    }

    public async Task DeleteSubscriptionPlanAsync(string planId, bool isSoftDelete = false)
    {
        if (isSoftDelete)
        {
            await stripeClient.V1.Products.UpdateAsync(planId,  new ProductUpdateOptions
            {
                Active = false,
            });
        }
        
        await stripeClient.V1.Products.DeleteAsync(planId);
    }

    public async Task<string> CreateSubscriptionPlanPrice(string planId, string currency, int priceCents, string interval)
    {
        var price = await stripeClient.V1.Prices.CreateAsync(new PriceCreateOptions()
        {
            Currency = currency,
            UnitAmount =  priceCents,
            Product = planId,
            Recurring = new PriceRecurringOptions()
            {
                Interval = interval,
                IntervalCount = 1
            }
        });
        
        return price.Id;
    }

    public async Task ChangeActiveStatusInSubscriptionPrice(string priceId,  bool isActive)
    {
        await stripeClient.V1.Prices.UpdateAsync(priceId, new PriceUpdateOptions()
        {
            Active = isActive
        });
    }
    
    public async Task<string> CreateSubscriptionAsync(string customerId, string priceId)
    {
        var sub = await stripeClient.V1.Subscriptions.CreateAsync(new SubscriptionCreateOptions()
        {
            Customer = customerId,
            Items = new List<SubscriptionItemOptions>
            {
                new SubscriptionItemOptions { Price = priceId },
            },
        });
        
        return sub.Id;
    }


    public async Task<string> CreateCheckoutSessionAsync(string customerId, string stripePriceId, string successUrl, string cancelUrl, string? clientReferenceId = null)
    {
        var sessionOptions = new SessionCreateOptions
        {
            Customer = customerId,
            Mode = "subscription",
            LineItems = new List<SessionLineItemOptions>
            {
                new() { Price = stripePriceId, Quantity = 1 }
            },
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            ClientReferenceId = clientReferenceId
        };

        if (!string.IsNullOrEmpty(clientReferenceId))
        {
            sessionOptions.SubscriptionData = new SessionSubscriptionDataOptions
            {
                Metadata = new Dictionary<string, string>
                {
                    { "userId", clientReferenceId }
                }
            };
        }

        var session = await stripeClient.V1.Checkout.Sessions.CreateAsync(sessionOptions);

        return session.Url;
    }

    public async Task UpdateSubscriptionPriceAsync(string stripeSubscriptionId, string newStripePriceId)
    {
        var subscription = await stripeClient.V1.Subscriptions.GetAsync(stripeSubscriptionId);
        
        if (subscription.Items.Data.Count != 1)
            throw new InvalidOperationException("Subscription has unexpected number of items");

        var existingItemId = subscription.Items.Data[0].Id;
        
        await stripeClient.V1.Subscriptions.UpdateAsync(stripeSubscriptionId,
            new SubscriptionUpdateOptions
            {
                Items = new List<SubscriptionItemOptions>
                {
                    new() { Id = existingItemId, Price = newStripePriceId }
                },
                ProrationBehavior = "create_prorations"
            });
    }

    public async Task CancelSubscriptionAsync(string stripeSubscriptionId, bool atPeriodEnd = true)
    {
        if(atPeriodEnd)
        {
            await stripeClient.V1.Subscriptions.UpdateAsync(stripeSubscriptionId, new SubscriptionUpdateOptions()
            {
                CancelAtPeriodEnd = atPeriodEnd
            });
            return;
        }
        
        await stripeClient.V1.Subscriptions.CancelAsync(stripeSubscriptionId);
    }
    
    public async Task ResumeSubscriptionAsync(string stripeSubscriptionId)
    {
        await stripeClient.V1.Subscriptions.UpdateAsync(stripeSubscriptionId, new SubscriptionUpdateOptions()
        {
            CancelAtPeriodEnd = false
        });
    }

    public async Task<StripeSubscriptionDataDto> GetSubscriptionAsync(string stripeSubscriptionId)
    {
        var subscription = await stripeClient.V1.Subscriptions.GetAsync(stripeSubscriptionId);
        
        if (subscription.Items.Data.Count != 1)
            throw new InvalidOperationException("Subscription has unexpected number of items");

        return new StripeSubscriptionDataDto()
        {
            SubscriptionId = subscription.Id,
            CustomerId = subscription.CustomerId,
            Status = subscription.Status,
            PriceId = subscription.Items.Data[0].Price.Id,
            ItemId = subscription.Items.Data[0].Id,
            CurrentPeriodStart = subscription.Items.Data[0].CurrentPeriodStart,
            CurrentPeriodEnd = subscription.Items.Data[0].CurrentPeriodEnd,
            CancelAtPeriodEnd = subscription.CancelAtPeriodEnd,
            CanceledAt = subscription.CanceledAt,
        };
    }
}

