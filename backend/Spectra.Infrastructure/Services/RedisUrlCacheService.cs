using Spectra.Application.Interfaces;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Infrastructure.Services
{
    internal class RedisUrlCacheService(IConnectionMultiplexer redis) : IUrlCacheService
    {
        private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(24);
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

        public async Task SetUrlAsync(string shortCode, string originalUrl)
        {
            await _db.StringSetAsync(shortCode, originalUrl, _cacheDuration);
        }
    }
}
