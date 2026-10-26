using AutoMapper;
using Spectra.Application.Common;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Application.DTOs.Analytics;
using Spectra.Application.DTOs.Urls;
using Spectra.Domain.Exceptions;

namespace Spectra.Application.Services
{
    public class UrlAnalyticsService(
        IUrlRepository repository, 
        IUrlVisitRepository urlVisitRepository,
        IUserAgentParser uaParser, 
        IGeoLocationService geoLocationService, 
        IUrlAnalyticsQueries queries, 
        IUrlCacheService cache,
        IUserSubscriptionRepository userSubscriptionRepository,
        IMapper mapper
        ) : IUrlAnalyticsService
    {
        public async Task LogVisitAsync(string shortCode, string ipAddress, string? userAgent, string? referer, CancellationToken cancellationToken = default)
        {
            var url = await repository.GetByCodeAsync(shortCode, cancellationToken);
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

            await urlVisitRepository.AddVisitAsync(visit, cancellationToken);
        }
        
        public async Task<PaginatedResult<UrlVisitDto>> GetUrlVisitsAsync(string urlId, string userId, PaginationRequest request, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(userId, out var guidUserId))
                throw new ArgumentException("Invalid user id");
            
            if (!Guid.TryParse(urlId, out var guidUrlId))
                throw new ArgumentException("Invalid url id");
            
            var url = await repository.GetUrlByIdAsync(guidUrlId, guidUserId, cancellationToken);
            if (url == null)
            {
                throw new KeyNotFoundException($"URL with id '{urlId}' not found.");
            }

            var skip = (request.PageNumber - 1) * request.PageSize;

            var (visits, totalCount) = await urlVisitRepository.GetUrlVisitsAsync(skip, request.PageSize, urlId: url.Id, cancellationToken: cancellationToken);

            var visitDtos = mapper.Map<IReadOnlyList<UrlVisitDto>>(visits);

            return new PaginatedResult<UrlVisitDto>(visitDtos, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task<PaginatedResult<UrlVisitDto>> GetAllVisitsAsync(string userId, PaginationRequest request, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(userId, out var guidUserId))
                throw new ArgumentException("Invalid user id");
            
            var skip = (request.PageNumber - 1) * request.PageSize;
            
            var (visits, totalCount) = await urlVisitRepository.GetUrlVisitsAsync(skip, request.PageSize, userId: guidUserId, cancellationToken: cancellationToken);
            
            var visitDtos = mapper.Map<IReadOnlyList<UrlVisitDto>>(visits);

            return new PaginatedResult<UrlVisitDto>(visitDtos, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task<UrlAnalyticsDto> GetUrlAnalyticsAsync(string id, string userId, CancellationToken cancellationToken = default)
        {
            var userPlan = await userSubscriptionRepository.GetEffectivePlanByUserIdAsync(userId);
            if(userPlan is null || !userPlan.HasAccessToUrlAnalytics)
                throw new SubscriptionLimitException("Your subscription tier does not support url analytics.");
            
            var urlAnalytics = await cache.GetUrlAnalyticsAsync(id);
            if (urlAnalytics != null)
                return urlAnalytics;

            urlAnalytics = await queries.GetUrlAnalyticsByIdAsync(id, userId, cancellationToken);
            await cache.SetUrlAnalyticsAsync(id, urlAnalytics);
            
            return urlAnalytics;
        }
        
        public async Task<TrendAnalyticsDto> GetTrendAnalyticsAsync(string userId, CancellationToken cancellationToken = default)
        {
            var userPlan = await userSubscriptionRepository.GetEffectivePlanByUserIdAsync(userId);
            if(userPlan is null || !userPlan.HasAccessToGeneralAnalytics)
                throw new SubscriptionLimitException("Your subscription tier does not support general analytics.");
            
            var trendAnalytics = await cache.GetTrendAnalyticsAsync(userId);
            if (trendAnalytics != null)
                return trendAnalytics;
            
            trendAnalytics = await queries.GetTrendAnalyticsAsync(userId, cancellationToken);
            await cache.SetTrendAnalyticsAsync(userId, trendAnalytics);
            
            return trendAnalytics;
        }

        public async Task<IReadOnlyCollection<DevicesVisitsByDayDto>> GetDevicesVisitsByDaysAsync(string userId, CancellationToken cancellationToken = default)
        {
            var userPlan = await userSubscriptionRepository.GetEffectivePlanByUserIdAsync(userId);
            if(userPlan is null || !userPlan.HasAccessToGeneralAnalytics)
                throw new SubscriptionLimitException("Your subscription tier does not support general analytics.");
            
            var devicesVisitsByDays = await cache.GetDevicesVisitsByDaysAsync(userId);
            if (devicesVisitsByDays != null)
                return devicesVisitsByDays;
            
            devicesVisitsByDays = await queries.GetDevicesVisitsByDaysAsync(userId, cancellationToken);
            await cache.SetDevicesVisitsByDaysAsync(userId, devicesVisitsByDays);
            
            return devicesVisitsByDays;
        }
    }
}
