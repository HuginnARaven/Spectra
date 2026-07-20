using System;
using System.Collections.Generic;
using System.Text;
using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces
{
    public interface IUrlCacheService
    {
        Task<string?> GetOriginalUrlAsync(string shortCode);
        Task SetUrlAsync(string shortCode, string originalUrl);
        Task RemoveUrlAsync(string shortCode);
        
        Task SetUrlAnalyticsAsync(string urlId, UrlAnalyticsDto urlAnalytics);
        Task<UrlAnalyticsDto?> GetUrlAnalyticsAsync(string urlId);
        
        Task<IReadOnlyCollection<DevicesVisitsByDayDto>?> GetDevicesVisitsByDaysAsync(string userId);
        Task SetDevicesVisitsByDaysAsync(string userId, IReadOnlyCollection<DevicesVisitsByDayDto> devicesVisitsByDays);
        Task<TrendAnalyticsDto?> GetTrendAnalyticsAsync(string userId);
        Task SetTrendAnalyticsAsync(string userId, TrendAnalyticsDto trendAnalytics);
    }
}
