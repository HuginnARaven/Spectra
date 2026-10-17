namespace Spectra.Application.DTOs;

public class CreateSubscriptionPlanRequest
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required bool IsDefault { get; set; }
    public required bool HasAccessToGeneralAnalytics { get; set; }
    public required bool HasAccessToUrlAnalytics { get; set; }
    public bool HasCustomAliasAccess { get; set; }
    public bool HasEarlyFeatureAccess { get; set; }
    public int MaxUrlsLimit { get; set; }
    public int AnalyticsRetentionDays { get; set; }
    
    // Price settings: only if IsDefault = false
    public int? Price { get; set; }
    public string? CurrencyCode { get; set; }
    public string? Interval { get; set; }
}