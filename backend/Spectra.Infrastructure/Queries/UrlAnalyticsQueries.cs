using Microsoft.EntityFrameworkCore;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Infrastructure.Data;

namespace Spectra.Infrastructure.Queries;

public class UrlAnalyticsQueries(AppDbContext context): IUrlAnalyticsQueries
{
    public async Task<UrlAnalyticsDto> GetUrlAnalyticsByIdAsync(string id, string userId, CancellationToken cancellationToken = default)
    {
        var baseQuery = context.UrlVisits
            .Where(v => v.UrlId == Guid.Parse(id) && v.Url!.UserId == Guid.Parse(userId))
            .AsNoTracking()
            .AsQueryable();
        
        var totalVisits = await baseQuery.CountAsync(cancellationToken);
        
        var topCountries = await baseQuery
            .Where(c => c.Country != null)
            .GroupBy(v => v.Country)
            .Select(g => new CountryVisit{ Country = g.Key, Visits = g.Count() })
            .OrderByDescending(x => x.Visits)
            .ToListAsync(cancellationToken);
        
        var deviceDistribution = await baseQuery
            .Where(x => x.DeviceType != null)
            .GroupBy(x => x.DeviceType)
            .Select(g => new DeviceVisit{ Device = g.Key, Visits = g.Count() })
            .ToListAsync(cancellationToken);
        
        var last30DaysTask = baseQuery
            .Where(v => v.CreatedAt >= DateTime.UtcNow.AddDays(-30))
            .GroupBy(v => v.CreatedAt.Date)
            .Select(g => new DailyVisit { Date = g.Key, Visits = g.Count() })
            .OrderBy(v => v.Date)
            .ToListAsync(cancellationToken);
        
        
        return new UrlAnalyticsDto
        {
            TotalVisits = totalVisits,
            TopCountries = topCountries,
            DeviceDistribution = deviceDistribution,
            Last30DaysVisits = await last30DaysTask
        };
    }

    public async Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var sixtyDaysAgo = now.AddDays(-60);
        
        var baseQuery = context.UrlVisits
            .Where(v => v.Url!.UserId == Guid.Parse(userId) && v.CreatedAt >= sixtyDaysAgo)
            .AsNoTracking()
            .AsQueryable();

        var visitsStats = await baseQuery
            .GroupBy(v => 1)
            .Select(gv => new
            {
                CurrentVisits = gv.Count(v => v.CreatedAt >= thirtyDaysAgo),
                PreviousVisits = gv.Count(v => v.CreatedAt < thirtyDaysAgo)
            })
            .FirstOrDefaultAsync(cancellationToken);
        
        var referrerStats = await baseQuery
            .GroupBy(v => string.IsNullOrEmpty(v.Referrer) ? "Direct" : v.Referrer)
            .Select(gv => new
            {
                Name = gv.Key,
                CurrentVisits = gv.Count(v => v.CreatedAt >= thirtyDaysAgo),
                PreviousVisits = gv.Count(v => v.CreatedAt < thirtyDaysAgo)
            })
            .OrderByDescending(x => x.CurrentVisits)
            .Take(5)
            .ToListAsync(cancellationToken);

        var deviceStats = await baseQuery
            .GroupBy(v => string.IsNullOrEmpty(v.DeviceType) ? "Unknown" : v.DeviceType)
            .Select(gv => new
            {
                Name = gv.Key,
                CurrentVisits = gv.Count(v => v.CreatedAt >= thirtyDaysAgo),
                PreviousVisits = gv.Count(v => v.CreatedAt < thirtyDaysAgo)
            })
            .OrderByDescending(x => x.CurrentVisits)
            .Take(5)
            .ToListAsync(cancellationToken);
        
        var countriesStats = await baseQuery
            .GroupBy(v => string.IsNullOrEmpty(v.Country) ? "Unknown" : v.Country)
            .Select(gv => new
            {
                Name = gv.Key,
                CurrentVisits = gv.Count(v => v.CreatedAt >= thirtyDaysAgo),
                PreviousVisits = gv.Count(v => v.CreatedAt < thirtyDaysAgo)
            })
            .OrderByDescending(x => x.CurrentVisits)
            .Take(5)
            .ToListAsync(cancellationToken);
        
        var visitsResult = visitsStats ?? new { CurrentVisits = 0, PreviousVisits = 0 };
        
        return new TrendAnalyticsDto
        {
            Visits = new VisitsTrendAnalyticsDto()
            {
                Value = visitsResult!.CurrentVisits,
                TrendPercentage = CalculateTrendPercentage(visitsResult.CurrentVisits, visitsResult.PreviousVisits)
            },
            Devices = deviceStats.Select(stat => new DeviceTrendAnalyticsDto()
            {
                Name =  stat.Name,
                Value = stat.CurrentVisits,
                TrendPercentage = CalculateTrendPercentage(stat.CurrentVisits, stat.PreviousVisits)
            }).ToList(),
            Countries = countriesStats.Select(stat => new CountryTrendAnalyticsDto()
            {
                Name =  stat.Name,
                Value = stat.CurrentVisits,
                TrendPercentage = CalculateTrendPercentage(stat.CurrentVisits, stat.PreviousVisits)
            }).ToList(),
            Referrers = referrerStats.Select(stat => new ReferrerTrendAnalyticsDto()
            {
                Name =  stat.Name,
                Value = stat.CurrentVisits,
                TrendPercentage = CalculateTrendPercentage(stat.CurrentVisits, stat.PreviousVisits)
            }).ToList()
        };
    }

    public async Task<IReadOnlyCollection<DevicesVisitsByDayDto>> GetDevicesVisitsByDaysAsync(string userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        
        var rawData = await context.UrlVisits.AsNoTracking()
            .Where(v => v.Url!.UserId == Guid.Parse(userId) && v.CreatedAt >= thirtyDaysAgo)
            .GroupBy(v => new
            {
                DeviceType = v.DeviceType,
                Date = v.CreatedAt.Date
            })
            .Select(gv => new
            {
                DeviceType = gv.Key.DeviceType,
                Date = gv.Key.Date,
                Visits = gv.Count()
            }).ToListAsync(cancellationToken);

        return rawData
            .GroupBy(d => d.Date)
            .Select(gd => new DevicesVisitsByDayDto() 
            { 
                Date = gd.Key,
                DeviceVisits = gd.Select(d => new DeviceVisitsByDay() 
                { 
                    Device = d.DeviceType, 
                    Visits = d.Visits 
                }).ToList() 
            })
            .ToList();
    }

    private double CalculateTrendPercentage(int current30DaysVisits, int previous30DaysVisits)
    {
        return previous30DaysVisits == 0 ? (current30DaysVisits > 0 ? 100 : 0) : Math.Round((double)(current30DaysVisits - previous30DaysVisits) / previous30DaysVisits * 100, 2);
    }
}
