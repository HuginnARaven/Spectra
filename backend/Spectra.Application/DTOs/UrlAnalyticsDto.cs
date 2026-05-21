namespace Spectra.Application.DTOs;

public class UrlAnalyticsDto
{
    public int TotalVisits { get; set; } = 0;
    public List<CountryVisit> TopCountries { get; set; } = new();
    public List<DeviceVisit> DeviceDistribution { get; set; } = new();
    public List<DailyVisit> Last30DaysVisits { get; set; } = new();
}

public class CountryVisit
{
    public string Country { get; set; } = string.Empty;
    public int Visits { get; set; } = 0;
}

public class DeviceVisit
{    
    public string Device { get; set; } = string.Empty;
    public int Visits { get; set; } = 0;
}

public class DailyVisit
{
    public DateTime Date { get; set; }
    public int Visits { get; set; } = 0;
}
