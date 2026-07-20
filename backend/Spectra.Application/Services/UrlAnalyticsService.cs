using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using Spectra.Application.DTOs;

namespace Spectra.Application.Services
{
    public class UrlAnalyticsService(IUrlRepository repository, IUserAgentParser uaParser, IGeoLocationService geoLocationService, IUrlAnalyticsQueries queries, IUrlCacheService cache) : IUrlAnalyticsService
    {
        public async Task LogVisitAsync(string shortCode, string ipAddress, string? userAgent, string? referer, CancellationToken cancellationToken = default)
        {
            var url = await repository.GetByCodeAsync(shortCode);
            if (url == null) return;

            var clientInfo = uaParser.Parse(userAgent ?? "");
            var location = geoLocationService.GetLocation(ipAddress);

            var visit = new UrlVisit
            {
                Id = Guid.NewGuid(),
                UrlId = url.Id,
                CreatedAt = DateTime.UtcNow,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Browser = clientInfo.Browser,
                DeviceType = clientInfo.Device,
                Country = location.Country,
                City = location.City,
                Referrer = referer
            };

            await repository.AddVisitAsync(visit, cancellationToken);
        }

        public async Task<UrlAnalyticsDto> GetUrlAnalyticsAsync(string id, string userId, CancellationToken cancellationToken = default)
        {
            var urlAnalytics = await cache.GetUrlAnalyticsAsync(id);
            if (urlAnalytics != null)
                return urlAnalytics;

            urlAnalytics = await queries.GetUrlAnalyticsByIdAsync(id, userId, cancellationToken);
            await cache.SetUrlAnalyticsAsync(id, urlAnalytics);
            
            return urlAnalytics;
        }
        
        public async Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId, CancellationToken cancellationToken = default)
        {
            var trendAnalytics = await cache.GetTrendAnalyticsAsync(userId);
            if (trendAnalytics != null)
                return trendAnalytics;
            
            trendAnalytics = await queries.GetTrendAnalyticsAsync(userId, cancellationToken);
            await cache.SetTrendAnalyticsAsync(userId, trendAnalytics);
            
            return trendAnalytics;
        }

        public async Task<IReadOnlyCollection<DevicesVisitsByDayDto>> GetDevicesVisitsByDaysAsync(string userId, CancellationToken cancellationToken = default)
        {
            var devicesVisitsByDays = await cache.GetDevicesVisitsByDaysAsync(userId);
            if (devicesVisitsByDays != null)
                return devicesVisitsByDays;
            
            devicesVisitsByDays = await queries.GetDevicesVisitsByDaysAsync(userId, cancellationToken);
            await cache.SetDevicesVisitsByDaysAsync(userId, devicesVisitsByDays);
            
            return devicesVisitsByDays;
        }
    }
}
