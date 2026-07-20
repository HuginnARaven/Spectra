using Spectra.Application.Interfaces;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using Spectra.Application.DTOs;

namespace Spectra.Infrastructure.Services
{
    internal class RedisUrlCacheService(IConnectionMultiplexer redis) : IUrlCacheService
    {
        private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(24); // change to 30m later
        private readonly IDatabase _db = redis.GetDatabase();

        public async Task<string?> GetOriginalUrlAsync(string shortCode)
        {
            var cachedUrl = await _db.StringGetAsync(shortCode);

            return cachedUrl.HasValue ? cachedUrl.ToString() : null;
        }

        public async Task RemoveUrlAsync(string shortCode)
        {
            await _db.KeyDeleteAsync(shortCode);
        }

        public async Task SetUrlAnalyticsAsync(string urlId, UrlAnalyticsDto urlAnalytics)
        {
            await _db.StringSetAsync($"analytics:{urlId}", JsonSerializer.Serialize(urlAnalytics), _cacheDuration);
        }

        public async Task<UrlAnalyticsDto?> GetUrlAnalyticsAsync(string urlId)
        {
            var cachedAnalytics = await _db.StringGetAsync($"analytics:{urlId}");
            
            return !cachedAnalytics.HasValue ? null : JsonSerializer.Deserialize<UrlAnalyticsDto>(cachedAnalytics.ToString());
        }

        public async Task<IReadOnlyCollection<DevicesVisitsByDayDto>?> GetDevicesVisitsByDaysAsync(string userId)
        {
            var cachedDevicesVisits = await _db.StringGetAsync($"devices_visits_by_days:{userId}");
            
            return !cachedDevicesVisits.HasValue ? null : JsonSerializer.Deserialize<IReadOnlyCollection<DevicesVisitsByDayDto>>(cachedDevicesVisits.ToString());
        }

        public async Task SetDevicesVisitsByDaysAsync(string userId, IReadOnlyCollection<DevicesVisitsByDayDto> devicesVisitsByDays)
        {
            await _db.StringSetAsync($"devices_visits_by_days:{userId}", JsonSerializer.Serialize(devicesVisitsByDays), _cacheDuration);
        }

        public async Task<TrendAnalyticsDto?> GetTrendAnalyticsAsync(string userId)
        {
            var cachedTrendAnalytics = await _db.StringGetAsync($"trend_analytics:{userId}");
            
            return !cachedTrendAnalytics.HasValue ? null : JsonSerializer.Deserialize<TrendAnalyticsDto>(cachedTrendAnalytics.ToString());
        }

        public async Task SetTrendAnalyticsAsync(string userId, TrendAnalyticsDto trendAnalytics)
        {
            await _db.StringSetAsync($"trend_analytics:{userId}", JsonSerializer.Serialize(trendAnalytics), _cacheDuration);
        }

        public async Task SetUrlAsync(string shortCode, string originalUrl)
        {
            await _db.StringSetAsync(shortCode, originalUrl, _cacheDuration);
        }
    }
}
