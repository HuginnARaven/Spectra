using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces;

public interface IUrlAnalyticsQueries
{
    Task<UrlAnalyticsDto> GetUrlAnalyticsByIdAsync(string id, string userId);
}