using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Interfaces
{
    public interface IUrlRepository
    {
        Task<Url?> GetUrlByIdAsync(Guid urlId, Guid? userId, CancellationToken cancellationToken = default);
        Task<(IReadOnlyList<Url> Items, int TotalCount)> GetUrlsAsync(int skip, int take, Guid? userId = null, CancellationToken cancellationToken = default);
        Task<Url?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
        Task<int> GetUserUrlsCountAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Dictionary<string, Guid>> GetUrlsIdsByShortCodesAsync(List<string> shortCodes,CancellationToken cancellationToken = default);
        Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default);
        
        Task AddUrlAsync(Url url, CancellationToken cancellationToken = default);
        Task<Url> UpdateUrlAsync(Url url, CancellationToken cancellationToken = default);
        Task DeleteUrlAsync(Url url, CancellationToken cancellationToken = default);
    }
}
