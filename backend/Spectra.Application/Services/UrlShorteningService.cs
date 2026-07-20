using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Interfaces;
using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using AutoMapper;
using System.Security.AccessControl;
using Spectra.Application.Common;

namespace Spectra.Application.Services
{
    public class UrlShorteningService(IUrlRepository repository, IUrlGenerator urlGenerator, IUrlCacheService cache, IMapper mapper) : IUrlShorteningService
    {
        public async Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request, string userId, string baseUrl, CancellationToken cancellationToken = default)
        {
            var code = await GenerateVerifiedUniqueCodeAsync(cancellationToken);

            var url = new Url
            {
                Id = Guid.NewGuid(),
                OriginalUrl = request.OriginalUrl,
                ShortCode = code,
                CreatedAt = DateTime.UtcNow,
                UserId = Guid.Parse(userId!),
            };

            await repository.AddAsync(url, cancellationToken);

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

        public async Task<IReadOnlyList<UrlDto>> GetUserUrlsAsync(string userId, CancellationToken cancellationToken = default)
        {
            var urls = await repository.GetUserUrlsAsync(userId, cancellationToken);

            return mapper.Map<IReadOnlyList<UrlDto>>(urls);
        }

        public async Task DeleteUrlsAsync(string urlId, string userId, CancellationToken cancellationToken = default)
        {
            var url = await repository.GetUserUrlByIdAsync(urlId, userId, cancellationToken);
            if (url == null)
            {
                throw new KeyNotFoundException($"URL with id '{urlId}' not found.");
            }
            
            await cache.RemoveUrlAsync(url.ShortCode);
            await repository.DeleteUrlAsync(url, cancellationToken);
        }

        public async Task<PaginatedResult<UrlVisitDto>> GetUrlVisitsAsync(string urlId, string userId, PaginationRequest request, CancellationToken cancellationToken = default)
        {
            var url = await repository.GetUserUrlByIdAsync(urlId, userId, cancellationToken);
            if (url == null)
            {
                throw new KeyNotFoundException($"URL with id '{urlId}' not found.");
            }

            var skip = (request.PageNumber - 1) * request.PageSize;

            var (visits, totalCount) = await repository.GetUrlVisitsAsync(url.Id, skip, request.PageSize, cancellationToken);

            var visitDtos = mapper.Map<IReadOnlyList<UrlVisitDto>>(visits);

            return new PaginatedResult<UrlVisitDto>(visitDtos, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task<PaginatedResult<UrlVisitDto>> GetAllVisitsAsync(string userId, PaginationRequest request, CancellationToken cancellationToken = default)
        {
            var skip = (request.PageNumber - 1) * request.PageSize;
            
            var (visits, totalCount) = await repository.GetUserUrlVisitsAsync(userId, skip, request.PageSize, cancellationToken);
            
            var visitDtos = mapper.Map<IReadOnlyList<UrlVisitDto>>(visits);

            return new PaginatedResult<UrlVisitDto>(visitDtos, totalCount, request.PageNumber, request.PageSize);
        }
    }
}
