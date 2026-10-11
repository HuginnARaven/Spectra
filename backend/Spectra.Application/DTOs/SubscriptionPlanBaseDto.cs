namespace Spectra.Application.DTOs;

public class SubscriptionPlanBaseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    
    public bool HasAccessToGeneralAnalytics { get; set; }
    public bool HasAccessToUrlAnalytics { get; set; }
    public bool HasCustomAliasAccess { get; set; } = false; // TODO
    public bool HasEarlyFeatureAccess { get; set; } = false; // TODO
    public int MaxUrlsLimit { get; set; } = -1; // TODO
    public int AnalyticsRetentionDays { get; set; } = 7; // TODO ?consideration? prob smth like how long visits last before archiving
}