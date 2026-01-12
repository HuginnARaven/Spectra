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
        public async Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request, string? userId)
        {
            var code = await GenerateVerifiedUniqueCodeAsync();

            var url = new Url
            {
                Id = Guid.NewGuid(),
                OriginalUrl = request.OriginalUrl,
                ShortCode = code,
                CreatedAt = DateTime.UtcNow,
                UserId = Guid.Parse(userId!),
            };

            await repository.AddAsync(url);

            return new UrlResponse
            {
                Id = url.Id.ToString(),
                OriginalUrl = url.OriginalUrl,
                ShortCode = url.ShortCode,
                ShortUrl = $"http://localhost:8080/{url.ShortCode}"
            };
        }

        public async Task<string> GetOriginalUrlAsync(string code)
        {
            var cachedUrl = await cache.GetOriginalUrlAsync(code);
            if (!string.IsNullOrEmpty(cachedUrl))
                return cachedUrl;

            var url = await repository.GetByCodeAsync(code);

            if (url == null)
            {
                throw new KeyNotFoundException($"URL with code '{code}' not found.");
            }

            await cache.SetUrlAsync(code, url.OriginalUrl);

            return url.OriginalUrl;
        }

        private async Task<string> GenerateVerifiedUniqueCodeAsync()
        {
            const int MaxTries = 10;
            var attempts = 0;

            while (attempts < MaxTries) {
                var code = urlGenerator.GenerateUniqueCode();
                if (!await repository.CodeExistsAsync(code))
                {
                    return code;
                }
                attempts++;
            }

            throw new InvalidOperationException("Failed to generate a unique code. Please try again.");
        }

        public async Task<IReadOnlyList<UrlDto>> GetUserUrlsAsync(string userId)
        {
            var urls = await repository.GetUserUrlsAsync(userId);

            return mapper.Map<IReadOnlyList<UrlDto>>(urls);
        }

        public async Task DeleteUrlsAsync(string urlId, string userId)
        {
            var url = await repository.GetUserUrlByIdAsync(urlId, userId);
            if (url == null)
            {
                throw new KeyNotFoundException($"URL with id '{urlId}' not found.");
            }

            await repository.DeleteUrlAsync(url);
        }

        public async Task<PaginatedResult<UrlVisitDto>> GetUrlVisitsAsync(string urlId, string userId, PaginationRequest request)
        {
            var url = await repository.GetUserUrlByIdAsync(urlId, userId);
            if (url == null)
            {
                throw new KeyNotFoundException($"URL with id '{urlId}' not found.");
            }

            var skip = (request.PageNumber - 1) * request.PageSize;

            var (visits, totalCount) = await repository.GetUrlVisitsAsync(url.Id, skip, request.PageSize);

            var visitDtos = mapper.Map<IReadOnlyList<UrlVisitDto>>(visits);

            return new PaginatedResult<UrlVisitDto>(visitDtos, totalCount, request.PageNumber, request.PageSize);
        }
    }
}
