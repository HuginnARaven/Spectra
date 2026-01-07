using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;

namespace Spectra.Infrastructure.Services
{
    public class BackgroundAnalyticsQueue : IBackgroundAnalyticsQueue
    {
        private readonly Channel<VisitLogDto> _queue;

        public BackgroundAnalyticsQueue()
        {
            var options = new BoundedChannelOptions(1000)
            {
                FullMode = BoundedChannelFullMode.Wait,
                SingleReader = true
            };

            _queue = Channel.CreateBounded<VisitLogDto>(options);
        }

        public async ValueTask QueueBackgroundWorkItemAsync(VisitLogDto workItem)
        {
            await _queue.Writer.WriteAsync(workItem);
        }

        public async ValueTask<VisitLogDto> DequeueAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }
    }
}