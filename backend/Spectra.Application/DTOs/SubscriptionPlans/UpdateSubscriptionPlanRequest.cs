namespace Spectra.Application.DTOs.SubscriptionPlans;

public class UpdateSubscriptionPlanRequest
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required bool HasAccessToGeneralAnalytics { get; set; }
    public required bool HasAccessToUrlAnalytics { get; set; }
    public bool HasCustomAliasAccess { get; set; }
    public bool HasEarlyFeatureAccess { get; set; }
    public int MaxUrlsLimit { get; set; }
    public int AnalyticsRetentionDays { get; set; }
}