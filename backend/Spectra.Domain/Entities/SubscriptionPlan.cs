using Spectra.Domain.Common;

namespace Spectra.Domain.Entities;

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
    
    public bool HasAccessToGeneralAnalytics { get; set; }
    public bool HasAccessToUrlAnalytics { get; set; }
    public bool HasCustomAliasAccess { get; set; }
    public bool HasEarlyFeatureAccess { get; set; }
    public int MaxUrlsLimit { get; set; } = 0;
    public int AnalyticsRetentionDays { get; set; } = 0; // TODO: implement
    
    public string? StripeProductId  { get; set; }
    
    public ICollection<SubscriptionPlanPrice> Prices { get; set; } = new List<SubscriptionPlanPrice>();
}