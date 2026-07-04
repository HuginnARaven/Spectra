namespace Spectra.Application.DTOs;

public class DevicesVisitsByDayDto
{
    public DateTime Date { get; set; }
    public List<DeviceVisitsByDay> DeviceVisits { get; set; } = new();
}

public class DeviceVisitsByDay
{
    public required string Device { get; set; }
    public required int Visits { get; set; }
}