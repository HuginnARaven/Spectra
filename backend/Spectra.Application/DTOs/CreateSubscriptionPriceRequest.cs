namespace Spectra.Application.DTOs;

public class CreateSubscriptionPriceRequest
{
    public required int Amount { get; set; }
    public required string CurrencyCode { get; set; }
    public required string Interval { get; set; }
    public required bool IsActive { get; set; }
}