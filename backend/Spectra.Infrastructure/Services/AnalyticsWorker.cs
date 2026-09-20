using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;

namespace Spectra.Infrastructure.Services
{
    public class AnalyticsWorker(IBackgroundAnalyticsQueue queue, ILogger<AnalyticsWorker> logger, IServiceScopeFactory scopeFactory) : BackgroundService
    {
        private readonly List<VisitLogDto> _batch = new();
        private DateTime _lastFlush = DateTime.UtcNow;

        protected override async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Analytics Worker started.");

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var workItem = await queue.DequeueAsync(cancellationToken);
                    
                    if (workItem != null)
                    {
                        _batch.Add(workItem);
                    }
                    else
                    {
                        await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                    }
                    
                    var timeSinceLastFlush = DateTime.UtcNow - _lastFlush;

                    if (_batch.Count >= 100 || (_batch.Count > 0 && timeSinceLastFlush.TotalSeconds >= 5))
                    {
                        using var scope = scopeFactory.CreateScope();
                        var urlRepository = scope.ServiceProvider.GetRequiredService<IUrlRepository>();
                        var uaParser = scope.ServiceProvider.GetRequiredService<IUserAgentParser>();
                        var geoLocationService = scope.ServiceProvider.GetRequiredService<IGeoLocationService>();
                        
                        var shortCodesToUlrIdDict = await urlRepository.GetUrlsIdsByShortCodesAsync(_batch.Select(x => x.ShortCode).ToList(), cancellationToken);
                        var urlVisits = new List<UrlVisit>();

                        foreach (var visitLog in _batch)
                        {
                            if (!shortCodesToUlrIdDict.TryGetValue(visitLog.ShortCode, out var shortCode))
                            {
                                continue;
                            }
                            
                            var clientInfo = uaParser.Parse(visitLog.UserAgent ?? "");
                            var location = geoLocationService.GetLocation(visitLog.IpAddress);
                            
                            urlVisits.Add(new UrlVisit
                            {
                                Id = Guid.NewGuid(),
                                UrlId = shortCode,
                                CreatedAt = DateTime.UtcNow,
                                IpAddress = visitLog.IpAddress,
                                UserAgent = visitLog.UserAgent,
                                Browser = clientInfo.Browser,
                                DeviceType = clientInfo.Device,
                                Country = location.Country,
                                City = location.City,
                                Referrer = visitLog.Referer
                            });
                        }
                        
                        await urlRepository.BatchAddVisitAsync(urlVisits, cancellationToken);
                        
                        _batch.Clear();
                        _lastFlush = DateTime.UtcNow;
                    }
                }
                catch (OperationCanceledException)
                {
                    // Normal stop
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error occurred executing analytics work item.");
                    _batch.Clear();
                    _lastFlush = DateTime.UtcNow;
                }
            }
        }
    }
}