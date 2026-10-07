using Spectra.Application.Interfaces;
using StackExchange.Redis;

namespace Spectra.Infrastructure.Services;

public class RedisPaymentSynchronizationService(IConnectionMultiplexer redis): IPaymentSynchronizationService
{
    private readonly IDatabase _db = redis.GetDatabase();
    private readonly TimeSpan _lockDuration = TimeSpan.FromSeconds(15);
    private readonly TimeSpan _eventDuration = TimeSpan.FromDays(3);
    
    public async Task<bool> AcquireLockAsync(string resourceKey, TimeSpan? expiry = null)
    {
        if (expiry == null)
            expiry = _lockDuration;
        
        return await _db.StringSetAsync(resourceKey, "1", expiry, When.NotExists);
    }

    public async Task ReleaseLockAsync(string resourceKey)
    {
        await _db.KeyDeleteAsync(resourceKey);
    }

    public async Task<bool> IsEventProcessedAsync(string eventId)
    {
        return await _db.KeyExistsAsync($"webhook:processed:{eventId}");
    }

    public async Task MarkEventAsProcessedAsync(string eventId, TimeSpan? expiry = null)
    {
        if (expiry == null)
            expiry = _eventDuration;

        await _db.StringSetAsync($"webhook:processed:{eventId}", "1", (TimeSpan)expiry);
    }

    public async Task<bool> IsEventOutdatedAsync(string stripeSubscriptionId, DateTime eventCreatedAt)
    {
        var key = $"sub:last_event:{stripeSubscriptionId}";
        var value = await _db.StringGetAsync(key);
    
        if (!value.HasValue)
            return false;

        if (long.TryParse((string)value!, out var lastEventUnixTime))
        {
            var currentEventUnixTime = new DateTimeOffset(eventCreatedAt).ToUnixTimeSeconds();
            return currentEventUnixTime < lastEventUnixTime;
        }

        return false;
    }

    public async Task UpdateLatestEventTimestampAsync(string stripeSubscriptionId, DateTime eventCreatedAt, TimeSpan? expiry = null)
    {
        var key = $"sub:last_event:{stripeSubscriptionId}";
        var currentEventUnixTime = new DateTimeOffset(eventCreatedAt).ToUnixTimeSeconds();
        var duration = expiry ?? TimeSpan.FromDays(30);

        await _db.StringSetAsync(key, currentEventUnixTime.ToString(), duration);
    }
}