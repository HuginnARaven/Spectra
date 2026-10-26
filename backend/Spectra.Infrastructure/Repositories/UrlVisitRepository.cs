using Microsoft.EntityFrameworkCore;
using Spectra.Application.Interfaces;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;

namespace Spectra.Infrastructure.Repositories;

public class UrlVisitRepository(AppDbContext context): IUrlVisitRepository
{
    public async Task<(IReadOnlyList<UrlVisit> Items, int TotalCount)> GetUrlVisitsAsync(int skip, int take, Guid? urlId = null, Guid? userId = null, CancellationToken cancellationToken = default)
    {
        var query = context.UrlVisits.AsNoTracking();

        if (urlId.HasValue)
            query = query.Where(v => v.UrlId == urlId.Value);

        if (userId.HasValue)
            query = query.Where(v => v.Url!.UserId == userId.Value);

        query = query.OrderByDescending(v => v.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddVisitAsync(UrlVisit visit, CancellationToken cancellationToken = default)
    {
        await context.UrlVisits.AddAsync(visit, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task BatchAddVisitAsync(IEnumerable<UrlVisit> batch, CancellationToken cancellationToken = default)
    {
        await context.UrlVisits.AddRangeAsync(batch, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}