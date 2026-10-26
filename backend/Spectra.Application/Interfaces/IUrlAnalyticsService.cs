using Spectra.Application.Common;
using Spectra.Application.DTOs.Analytics;
using Spectra.Application.DTOs.Urls;

namespace Spectra.Application.Interfaces
{
    public interface IUrlAnalyticsService
    {
        Task LogVisitAsync(string shortCode, string ipAddress, string? userAgent, string? referer, CancellationToken cancellationToken = default);
        Task<PaginatedResult<UrlVisitDto>> GetUrlVisitsAsync(string urlId, string userId, PaginationRequest request, CancellationToken cancellationToken = default);
        Task<PaginatedResult<UrlVisitDto>> GetAllVisitsAsync(string userId, PaginationRequest request, CancellationToken cancellationToken = default);
        Task<UrlAnalyticsDto> GetUrlAnalyticsAsync(string id, string userId, CancellationToken cancellationToken = default);
        Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyCollection<DevicesVisitsByDayDto>> GetDevicesVisitsByDaysAsync(string userId, CancellationToken cancellationToken = default);
    }
}
