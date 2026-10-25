using Spectra.Application.DTOs.Analytics;

namespace Spectra.Application.Interfaces
{
    public interface IBackgroundAnalyticsQueue
    {
        ValueTask QueueBackgroundWorkItemAsync(VisitLogDto workItem);
        ValueTask<VisitLogDto?> DequeueAsync(CancellationToken cancellationToken);
    }
}
