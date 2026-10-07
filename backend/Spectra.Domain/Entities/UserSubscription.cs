using Spectra.Domain.Common;
using Spectra.Domain.Enums;

namespace Spectra.Domain.Entities;

public class UserSubscription: BaseEntity
{
    public SubscriptionStatus Status { get; set; }
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime? CanceledAt { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    
    public string StripeSubscriptionId { get; set; }
    public string StripeCustomerId { get; set; }
    
    public Guid UserId { get; set; }
    public User User { get; set; }
    
    public Guid SubscriptionPlanId { get; set; }
    public SubscriptionPlan SubscriptionPlan { get; set; }
    
    public Guid SubscriptionPlanPriceId { get; set; }
    public SubscriptionPlanPrice SubscriptionPlanPrice { get; set; }
}