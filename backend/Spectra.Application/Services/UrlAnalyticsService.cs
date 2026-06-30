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
    public class UrlAnalyticsService(IUrlRepository repository, IUserAgentParser uaParser, IGeoLocationService geoLocationService, IUrlAnalyticsQueries queries) : IUrlAnalyticsService
    {
        public async Task LogVisitAsync(string shortCode, string ipAddress, string? userAgent, string? referer)
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

            await repository.AddVisitAsync(visit);
        }

        public async Task<UrlAnalyticsDto> GetUrlAnalyticsAsync(string id, string userId)
        {
            return await queries.GetUrlAnalyticsByIdAsync(id, userId);
        }
        
        public async Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId)
        {
            return await queries.GetTrendAnalyticsAsync(userId);
        }
    }
}
