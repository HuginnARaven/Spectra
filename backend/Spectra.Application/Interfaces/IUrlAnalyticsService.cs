using System;
using System.Collections.Generic;
using System.Text;
using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces
{
    public interface IUrlAnalyticsService
    {
        Task LogVisitAsync(string shortCode, string ipAddress, string? userAgent, string? referer);
        Task<UrlAnalyticsDto> GetUrlAnalyticsAsync(string id, string userId);
        Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId);
        Task<IEnumerable<DevicesVisitsByDayDto>> GetDevicesVisitsByDaysAsync(string userId);
    }
}
