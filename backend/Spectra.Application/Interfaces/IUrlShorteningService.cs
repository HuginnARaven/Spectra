using Spectra.Application.Common;
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
        Task<string> TemporarilyShortenUrlAsync(CreateUrlRequest request);
        Task<string> GetOriginalUrlAsync(string shortenUrl);
        Task<IReadOnlyList<UrlDto>> GetUserUrlsAsync(string userId);
        Task DeleteUrlsAsync(string urlId, string userId);
        Task<PaginatedResult<UrlVisitDto>> GetUrlVisitsAsync(string urlId, string userId, PaginationRequest request);
        Task<PaginatedResult<UrlVisitDto>> GetAllVisitsAsync(string userId, PaginationRequest request);
    }
}
