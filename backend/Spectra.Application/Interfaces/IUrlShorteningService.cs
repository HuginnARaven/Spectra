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
        Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request, string userId, string baseUrl, CancellationToken cancellationToken = default);
        Task<string> TemporarilyShortenUrlAsync(CreateUrlRequest request, string baseUrl, CancellationToken cancellationToken = default);
        Task<string> GetOriginalUrlAsync(string shortenUrl, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<UrlDto>> GetUserUrlsAsync(string userId, CancellationToken cancellationToken = default);
        Task DeleteUrlsAsync(string urlId, string userId, CancellationToken cancellationToken = default);
        Task<PaginatedResult<UrlVisitDto>> GetUrlVisitsAsync(string urlId, string userId, PaginationRequest request, CancellationToken cancellationToken = default);
        Task<PaginatedResult<UrlVisitDto>> GetAllVisitsAsync(string userId, PaginationRequest request, CancellationToken cancellationToken = default);
    }
}
