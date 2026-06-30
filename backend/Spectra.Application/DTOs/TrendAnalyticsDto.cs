namespace Spectra.Application.DTOs;

public class TrendAnalyticsDto
{
    public required VisitsTrendAnalyticsDto Visits { get; set; }
    public required IEnumerable<DeviceTrendAnalyticsDto> Devices { get; set; }
    public required IEnumerable<CountryTrendAnalyticsDto> Countries { get; set; }
    public required IEnumerable<ReferrerTrendAnalyticsDto> Referrers { get; set; }
}

public class VisitsTrendAnalyticsDto
{
    public int Value { get; set; }
    public double TrendPercentage { get; set; }
}

public class DeviceTrendAnalyticsDto
{
    public required string Name { get; set; }
    public required int Value { get; set; }
    public required double TrendPercentage { get; set; }
}

public class CountryTrendAnalyticsDto
{
    public required string Name { get; set; }
    public required int Value { get; set; }
    public required double TrendPercentage { get; set; }
}

public class ReferrerTrendAnalyticsDto
{
    public required string Name { get; set; }
    public required int Value { get; set; }
    public required double TrendPercentage { get; set; }
}
