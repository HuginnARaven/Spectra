namespace Spectra.Application.DTOs;

public class StripeSubscriptionDataDto
{
    public string SubscriptionId { get; set; }
    public string CustomerId { get; set; }
    public string Status { get; set; }
    public string PriceId { get; set; }
    public string ItemId { get; set; }
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    public DateTime? CanceledAt { get; set; }
}