using Spectra.Domain.Common;

namespace Spectra.Domain.Entities;

public class SubscriptionPlanPrice: BaseEntity
{
    public int Amount { get; set; }
    public string CurrencyCode { get; set; } = "usd";
    public string Interval { get; set; } = "month";
    public bool IsActive { get; set; } = true;

    public string StripePriceId { get; set; } = string.Empty;
    
    public Guid PlanId { get; set; }
    public SubscriptionPlan? Plan { get; set; }
}