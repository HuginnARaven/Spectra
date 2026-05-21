using Microsoft.EntityFrameworkCore;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Infrastructure.Data;

namespace Spectra.Infrastructure.Queries;

public class UrlAnalyticsQueries(AppDbContext context): IUrlAnalyticsQueries
{
    public async Task<UrlAnalyticsDto> GetUrlAnalyticsByIdAsync(string id, string userId)
    {
        var baseQuery = context.UrlVisits
            .Where(v => v.UrlId == Guid.Parse(id) && v.Url!.UserId == Guid.Parse(userId))
            .AsNoTracking()
            .AsQueryable();
        
        var totalVisits = await baseQuery.CountAsync();
        
        var topCountries = await baseQuery
            .Where(c => c.Country != null)
            .GroupBy(v => v.Country)
            .Select(g => new CountryVisit{ Country = g.Key, Visits = g.Count() })
            .OrderByDescending(x => x.Visits)
            .ToListAsync();
        
        var deviceDistribution = await baseQuery
            .Where(x => x.DeviceType != null)
            .GroupBy(x => x.DeviceType)
            .Select(g => new DeviceVisit{ Device = g.Key, Visits = g.Count() })
            .ToListAsync();
        
        var last30DaysTask = baseQuery
            .Where(v => v.CreatedAt >= DateTime.UtcNow.AddDays(-30))
            .GroupBy(v => v.CreatedAt.Date)
            .Select(g => new DailyVisit { Date = g.Key, Visits = g.Count() })
            .OrderBy(v => v.Date)
            .ToListAsync();
        
        
        return new UrlAnalyticsDto
        {
            TotalVisits = totalVisits,
            TopCountries = topCountries,
            DeviceDistribution = deviceDistribution,
            Last30DaysVisits = await last30DaysTask
        };
    }
}