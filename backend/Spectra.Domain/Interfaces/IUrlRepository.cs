using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Interfaces
{
    public interface IUrlRepository
    {
        Task AddAsync(Url url, CancellationToken cancellationToken = default);
        Task<Url?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
        Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default);
        Task AddVisitAsync(UrlVisit visit, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Url?>> GetUserUrlsAsync(string userId, CancellationToken cancellationToken = default);
        Task<Url?> GetUserUrlByIdAsync(string id, string userId, CancellationToken cancellationToken = default);
        Task DeleteUrlAsync(Url url, CancellationToken cancellationToken = default);
        Task<(IReadOnlyList<UrlVisit> Items, int TotalCount)> GetUrlVisitsAsync(Guid urlId, int skip, int take, CancellationToken cancellationToken = default);
        Task<(IReadOnlyList<UrlVisit> Items, int TotalCount)> GetUserUrlVisitsAsync(string userId, int skip, int take, CancellationToken cancellationToken = default);
    }
}
