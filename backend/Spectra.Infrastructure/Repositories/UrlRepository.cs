using Microsoft.EntityFrameworkCore;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Spectra.Infrastructure.Repositories
{
    public class UrlRepository(AppDbContext context) : IUrlRepository
    {
        public async Task AddAsync(Url url, CancellationToken cancellationToken = default)
        {
            await context.Urls.AddAsync(url, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default)
        {
            return await context.Urls.AnyAsync(u => u.ShortCode == code, cancellationToken);
        }

        public async Task<Url?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        {
            return await context.Urls.FirstOrDefaultAsync(u => u.ShortCode == code, cancellationToken);
        }

        public async Task AddVisitAsync(UrlVisit visit, CancellationToken cancellationToken = default)
        {
            await context.UrlVisits.AddAsync(visit, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<Url?>> GetUserUrlsAsync(string userId, CancellationToken cancellationToken = default)
        {
            return await context.Urls.Where(u => u.UserId == Guid.Parse(userId)).ToListAsync(cancellationToken);
        }

        public async Task<Url?> GetUserUrlByIdAsync(string id, string userId, CancellationToken cancellationToken = default)
        {
            return await context.Urls.FirstOrDefaultAsync(u => u.Id == Guid.Parse(id) && u.UserId == Guid.Parse(userId), cancellationToken);
        }

        public async Task DeleteUrlAsync(Url url, CancellationToken cancellationToken = default)
        {
            context.Urls.Remove(url);
            await context.SaveChangesAsync(cancellationToken);
        }

        public async Task<(IReadOnlyList<UrlVisit> Items, int TotalCount)> GetUrlVisitsAsync(Guid urlId, int skip, int take, CancellationToken cancellationToken = default)
        {
            var query = context.UrlVisits
                .AsNoTracking()
                .Where(v => v.UrlId == urlId)
                .OrderByDescending(v => v.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip(skip)
                .Take(take)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public async Task<(IReadOnlyList<UrlVisit> Items, int TotalCount)> GetUserUrlVisitsAsync(string userId, int skip, int take, CancellationToken cancellationToken = default)
        {
            var query = context.UrlVisits
                .AsNoTracking()
                .Where(v => v.Url!.UserId == Guid.Parse(userId))
                .OrderByDescending(v => v.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip(skip)
                .Take(take)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }
    }
}
