namespace Spectra.Application.DTOs;

public class UpdateSubscriptionPlanRequest
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required bool HasAccessToGeneralAnalytics { get; set; }
    public required bool HasAccessToUrlAnalytics { get; set; }
}