using System.Text.Json;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using StackExchange.Redis;

namespace Spectra.Infrastructure.Services;

public class RedisAnalyticsQueue(IConnectionMultiplexer redis) : IBackgroundAnalyticsQueue
{
    private readonly IDatabase _db = redis.GetDatabase();
    
    public async ValueTask QueueBackgroundWorkItemAsync(VisitLogDto workItem)
    {
        await _db.ListLeftPushAsync("analytics_queue", JsonSerializer.Serialize(workItem));
    }

    public async ValueTask<VisitLogDto?> DequeueAsync(CancellationToken cancellationToken)
    {
        var visitLog = await _db.ListRightPopAsync("analytics_queue");
        return string.IsNullOrEmpty(visitLog.ToString()) ? null : JsonSerializer.Deserialize<VisitLogDto>(visitLog.ToString());
    }
}