using Spectra.Domain.Entities;

namespace Spectra.Domain.Interfaces;

public interface IUrlVisitRepository
{
    Task<(IReadOnlyList<UrlVisit> Items, int TotalCount)> GetUrlVisitsAsync(int skip, int take, Guid? urlId = null, Guid? userId = null, CancellationToken cancellationToken = default);
        
    Task AddVisitAsync(UrlVisit visit, CancellationToken cancellationToken = default);
    Task BatchAddVisitAsync(IEnumerable<UrlVisit> batch, CancellationToken cancellationToken = default);
}