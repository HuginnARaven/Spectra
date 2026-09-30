namespace Spectra.Application.DTOs;

public class SubscriptionPlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool HasAccessToGeneralAnalytics { get; set; }
    public bool HasAccessToUrlAnalytics { get; set; }
    
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