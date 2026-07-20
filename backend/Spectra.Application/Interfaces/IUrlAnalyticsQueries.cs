using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces;

public interface IUrlAnalyticsQueries
{
    Task<UrlAnalyticsDto> GetUrlAnalyticsByIdAsync(string id, string userId, CancellationToken cancellationToken = default);
    Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<DevicesVisitsByDayDto>> GetDevicesVisitsByDaysAsync(string userId, CancellationToken cancellationToken = default);
}
