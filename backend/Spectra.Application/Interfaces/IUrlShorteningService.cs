using Spectra.Application.DTOs;
using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces
{
    public interface IUrlShorteningService
    {
        Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request, string? userId);
        Task<string> GetOriginalUrlAsync(string shortenUrl);
        Task<IReadOnlyList<UrlDto>> GetUserUrlsAsync(string userId);
        Task DeleteUrlsAsync(string urlId, string userId);
    }
}
