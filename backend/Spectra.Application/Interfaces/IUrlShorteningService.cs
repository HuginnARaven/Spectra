using Spectra.Application.Common;
using Spectra.Application.DTOs.Urls;

namespace Spectra.Application.Interfaces
{
    public interface IUrlShorteningService
    {
        Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request, string userId, string baseUrl, CancellationToken cancellationToken = default);
        Task<string> TemporarilyShortenUrlAsync(CreateUrlRequest request, string baseUrl, CancellationToken cancellationToken = default);
        Task<string> GetOriginalUrlAsync(string shortenUrl, CancellationToken cancellationToken = default);
        Task<PaginatedResult<UrlDto>> GetUserUrlsAsync(string userId, PaginationRequest request, CancellationToken cancellationToken = default);
        Task DeleteUrlsAsync(string urlId, string userId, CancellationToken cancellationToken = default);

        Task<PaginatedResult<UrlAdminDto>> AdminGetUrlsAsync(PaginationRequest request, CancellationToken cancellationToken = default);
        Task<UrlAdminDto?> AdminGetUrlByIdAsync(string urlId, CancellationToken cancellationToken = default);
        Task<UrlAdminDto> AdminCreateUrlAsync(UrlAdminRequest request, CancellationToken cancellationToken = default);
        Task<UrlAdminDto> AdminEditUrlAsync(UrlAdminRequest request, string urlId, CancellationToken cancellationToken = default);
        Task AdminDeleteUrlAsync(string urlId, CancellationToken cancellationToken = default);
    }
}
