using System;
using System.Collections.Generic;
using System.Text;
using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces
{
    public interface IUrlAnalyticsService
    {
        Task LogVisitAsync(string shortCode, string ipAddress, string? userAgent, string? referer, CancellationToken cancellationToken = default);
        Task<UrlAnalyticsDto> GetUrlAnalyticsAsync(string id, string userId, CancellationToken cancellationToken = default);
        Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyCollection<DevicesVisitsByDayDto>> GetDevicesVisitsByDaysAsync(string userId, CancellationToken cancellationToken = default);
    }
}
