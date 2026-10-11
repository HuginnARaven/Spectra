namespace Spectra.Application.DTOs;

public class SubscriptionPlanDto : SubscriptionPlanBaseDto
{
    public ICollection<SubscriptionPriceDto?> Prices { get; set; } =  new List<SubscriptionPriceDto?>();
}

public class SubscriptionPriceDto
{
    public Guid Id { get; set; }
    public int Amount { get; set; }
    public string CurrencyCode { get; set; } = "usd";
    public string Interval { get; set; } = "month";
    public bool IsActive { get; set; } = true;
}