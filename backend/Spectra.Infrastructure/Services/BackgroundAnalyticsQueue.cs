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
                FullMode = BoundedChannelFullMode.DropWrite,
                SingleReader = true
            };

            _queue = Channel.CreateBounded<VisitLogDto>(options);
        }

        public ValueTask QueueBackgroundWorkItemAsync(VisitLogDto workItem)
        {
            _queue.Writer.TryWrite(workItem); 
            return ValueTask.CompletedTask;
        }

        public async ValueTask<VisitLogDto?> DequeueAsync(CancellationToken cancellationToken)
        {
            if (_queue.Reader.TryRead(out var item)) 
                return item;

            return null;
        }
    }
}