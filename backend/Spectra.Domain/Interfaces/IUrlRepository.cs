using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Interfaces
{
    public interface IUrlRepository
    {
        Task AddAsync(Url url);
        Task<Url?> GetByCodeAsync(string code);
        Task<bool> CodeExistsAsync(string code);
        Task AddVisitAsync(UrlVisit visit);
        Task<IReadOnlyList<Url?>> GetUserUrlsAsync(string userId);
        Task<Url?> GetUserUrlByIdAsync(string id, string userId);
        Task DeleteUrlAsync(Url url);
        Task<(IReadOnlyList<UrlVisit> Items, int TotalCount)> GetUrlVisitsAsync(Guid urlId, int skip, int take);
    }
}
