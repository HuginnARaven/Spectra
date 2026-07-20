using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Spectra.Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Spectra.Infrastructure.Services
{
    public class AnalyticsWorker : BackgroundService
    {
        private readonly IBackgroundAnalyticsQueue _queue;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AnalyticsWorker> _logger;

        public AnalyticsWorker(
            IBackgroundAnalyticsQueue queue,
            IServiceScopeFactory scopeFactory,
            ILogger<AnalyticsWorker> logger)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Analytics Worker started.");

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var workItem = await _queue.DequeueAsync(cancellationToken);

                    using var scope = _scopeFactory.CreateScope();

                    var analyticsService = scope.ServiceProvider.GetRequiredService<IUrlAnalyticsService>();

                    await analyticsService.LogVisitAsync(
                        workItem.ShortCode,
                        workItem.IpAddress,
                        workItem.UserAgent,
                        workItem.Referer,
                        cancellationToken
                    );
                }
                catch (OperationCanceledException)
                {
                    // Normal stop
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing analytics work item.");
                }
            }
        }
    }
}