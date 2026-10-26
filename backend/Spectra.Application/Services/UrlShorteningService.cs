using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Interfaces;
using Spectra.Domain.Entities;
using AutoMapper;
using Spectra.Application.Common;
using Spectra.Application.DTOs.Urls;
using Spectra.Domain.Exceptions;

namespace Spectra.Application.Services
{
    public class UrlShorteningService(
        IUrlRepository repository, 
        IUrlGenerator urlGenerator, 
        IUrlCacheService cache, 
        IUserSubscriptionRepository userSubscriptionRepository, 
        IMapper mapper) : IUrlShorteningService
    {
        public async Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request, string userId, string baseUrl, CancellationToken cancellationToken = default)
        {
            var userSub = await userSubscriptionRepository.GetEffectivePlanByUserIdAsync(userId);
            string code;
            
            if (!Guid.TryParse(userId, out var guidUserId))
                throw new ArgumentException("Invalid user id");
            
            if (userSub is null || (userSub.MaxUrlsLimit != -1 && await repository.GetUserUrlsCountAsync(guidUserId, cancellationToken) >= userSub.MaxUrlsLimit))
                throw new SubscriptionLimitException("You reached urls count limit of your subscription plan.");
            
            if (!string.IsNullOrEmpty(request.CustomCode))
            {
                if (!userSub.HasCustomAliasAccess)
                    throw new SubscriptionLimitException("Your subscription tier does not support custom url codes.");
                
                if (await repository.CodeExistsAsync(request.CustomCode, cancellationToken))
                    throw new InvalidOperationException("Such code already exists. Please try again.");

                code = request.CustomCode;
            }
            else
            {
                code = await GenerateVerifiedUniqueCodeAsync(cancellationToken);
            }
            
            var url = new Url
            {
                Id = Guid.NewGuid(),
                OriginalUrl = request.OriginalUrl,
                ShortCode = code,
                CreatedAt = DateTime.UtcNow,
                UserId = guidUserId,
            };

            await repository.AddUrlAsync(url, cancellationToken);

            return new UrlResponse
            {
                Id = url.Id.ToString(),
                OriginalUrl = url.OriginalUrl,
                ShortCode = url.ShortCode,
                ShortUrl = $"{baseUrl}/{url.ShortCode}"
            };
        }

        public async Task<string> TemporarilyShortenUrlAsync(CreateUrlRequest request, string baseUrl, CancellationToken cancellationToken = default)
        {
            var code = await GenerateVerifiedUniqueCodeAsync(cancellationToken);
            await cache.SetUrlAsync(code, $"t|{request.OriginalUrl}");
            return $"{baseUrl}/{code}";
        }

        public async Task<string> GetOriginalUrlAsync(string code, CancellationToken cancellationToken = default)
        {
            var cachedUrl = await cache.GetOriginalUrlAsync(code);
            if (!string.IsNullOrEmpty(cachedUrl))
                return cachedUrl;

            var url = await repository.GetByCodeAsync(code, cancellationToken);

            if (url == null)
            {
                throw new KeyNotFoundException($"URL with code '{code}' not found.");
            }

            await cache.SetUrlAsync(code, url.OriginalUrl);

            return url.OriginalUrl;
        }

        private async Task<string> GenerateVerifiedUniqueCodeAsync(CancellationToken cancellationToken = default)
        {
            const int maxTries = 10;
            var attempts = 0;

            while (attempts < maxTries) {
                var code = urlGenerator.GenerateUniqueCode();
                if (!await repository.CodeExistsAsync(code, cancellationToken))
                {
                    return code;
                }
                attempts++;
            }

            throw new InvalidOperationException("Failed to generate a unique code. Please try again.");
        }

        public async Task<PaginatedResult<UrlDto>> GetUserUrlsAsync(string userId, PaginationRequest request, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(userId, out var guidUserId))
                throw new ArgumentException("Invalid user id");
            
            var skip = (request.PageNumber - 1) * request.PageSize;
            
            var (visits, totalCount) = await repository.GetUrlsAsync(skip, request.PageSize, userId: guidUserId, cancellationToken: cancellationToken);
            
            var urlsDtos = mapper.Map<IReadOnlyList<UrlDto>>(visits);
            
            return new PaginatedResult<UrlDto>(urlsDtos, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task DeleteUrlsAsync(string urlId, string userId, CancellationToken cancellationToken = default)
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
            
            await cache.RemoveUrlAsync(url.ShortCode);
            await repository.DeleteUrlAsync(url, cancellationToken);
        }

        public async Task<PaginatedResult<UrlAdminDto>> AdminGetUrlsAsync(PaginationRequest request, CancellationToken cancellationToken = default)
        {
            var skip = (request.PageNumber - 1) * request.PageSize;
            
            var (visits, totalCount) = await repository.GetUrlsAsync(skip, request.PageSize, cancellationToken: cancellationToken);
            
            var urlsDtos = mapper.Map<IReadOnlyList<UrlAdminDto>>(visits);
            
            return new PaginatedResult<UrlAdminDto>(urlsDtos, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task<UrlAdminDto?> AdminGetUrlByIdAsync(string urlId, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(urlId, out var guidUrlId))
                throw new ArgumentException("Invalid url id");
            
            return mapper.Map<UrlAdminDto>(await repository.GetUrlByIdAsync(guidUrlId, null, cancellationToken));
        }

        public async Task<UrlAdminDto> AdminCreateUrlAsync(UrlAdminRequest request, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(request.UserId, out var guidUserId))
                throw new ArgumentException("Invalid user id");
            
            var url = new Url
            {
                Id = Guid.NewGuid(),
                OriginalUrl = request.OriginalUrl,
                ShortCode = request.ShortCode,
                UserId = guidUserId,
                CreatedAt = DateTime.UtcNow,
            };

            await repository.AddUrlAsync(url, cancellationToken);

            return mapper.Map<UrlAdminDto>(url);
        }

        public async Task<UrlAdminDto> AdminEditUrlAsync(UrlAdminRequest request, string urlId, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(urlId, out var guidUrlId))
                throw new ArgumentException("Invalid url id");
            
            if (!Guid.TryParse(request.UserId, out var guidUserId))
                throw new ArgumentException("Invalid user id");
            
            var url = await repository.GetUrlByIdAsync(guidUrlId, null, cancellationToken);
            if (url == null)
                throw new KeyNotFoundException($"URL with id '{urlId}' not found.");
            
            url.OriginalUrl = request.OriginalUrl;
            url.ShortCode = request.ShortCode;
            url.UserId = guidUserId;

            return mapper.Map<UrlAdminDto>(await repository.UpdateUrlAsync(url, cancellationToken));
        }

        public async Task AdminDeleteUrlAsync(string urlId, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(urlId, out var guidUrlId))
                throw new ArgumentException("Invalid url id");
            
            var url = await repository.GetUrlByIdAsync(guidUrlId, null, cancellationToken);
            if (url == null)
                throw new KeyNotFoundException($"URL with id '{urlId}' not found.");
            
            await repository.DeleteUrlAsync(url, cancellationToken);
        }
    }
}
