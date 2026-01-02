using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Interfaces;
using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Services
{
    public class UrlShorteningService(IUrlRepository repository, IUrlGenerator urlGenerator, IUrlCacheService cache) : IUrlShorteningService
    {
        public async Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request)
        {
            var code = await GenerateVerifiedUniqueCodeAsync();

            var url = new Url
            {
                Id = Guid.NewGuid(),
                OriginalUrl = request.OriginalUrl,
                ShortCode = code,
                CreatedAt = DateTime.UtcNow,
                UserId = Guid.Parse("70073d20-1db6-41ea-960f-67596e24bd0e"),
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

            throw new Exception("Failed to generate a unique code. Please try again.");
        }
    }
}
