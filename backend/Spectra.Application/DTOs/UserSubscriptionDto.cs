namespace Spectra.Application.DTOs;

public class UserSubscriptionDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime? CanceledAt { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    
    public Guid SubscriptionPlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    
    public Guid SubscriptionPlanPriceId { get; set; }
    public int Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public string Interval { get; set; } = string.Empty;
}
