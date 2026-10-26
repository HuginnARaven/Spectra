using Microsoft.EntityFrameworkCore;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;

namespace Spectra.Infrastructure.Repositories
{
    public class UrlRepository(AppDbContext context) : IUrlRepository
    {
        public async Task<Url?> GetUrlByIdAsync(Guid urlId, Guid? userId, CancellationToken cancellationToken = default)
        {
            if (userId == null)
                return await context.Urls.FindAsync([urlId], cancellationToken);

            return await context.Urls.FirstOrDefaultAsync(u => u.Id == urlId && u.UserId == userId,
                cancellationToken);
        }

        public async Task<(IReadOnlyList<Url> Items, int TotalCount)> GetUrlsAsync(int skip, int take, Guid? userId = null, CancellationToken cancellationToken = default)
        {
            var query = context.Urls.AsNoTracking();
            
            if (userId.HasValue)
                query = query.Where(v => v.UserId == userId.Value);

            query = query.OrderByDescending(v => v.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip(skip)
                .Take(take)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public async Task<Url?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        {
            return await context.Urls.FirstOrDefaultAsync(u => u.ShortCode == code, cancellationToken);
        }

        public async Task<int> GetUserUrlsCountAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await context.Urls.Where(u => u.UserId == userId).CountAsync(cancellationToken);
        }

        public async Task<Dictionary<string, Guid>> GetUrlsIdsByShortCodesAsync(List<string> shortCodes, CancellationToken cancellationToken = default)
        {
            var uniqueShortCodes = shortCodes.Distinct().ToList();
            return await context.Urls
                .Where(u => uniqueShortCodes.Contains(u.ShortCode))
                .Select(u => new { u.ShortCode, u.Id })
                .ToDictionaryAsync(u => u.ShortCode, u => u.Id, cancellationToken);
        }

        public async Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default)
        {
            return await context.Urls.AnyAsync(u => u.ShortCode == code, cancellationToken);
        }

        public async Task AddUrlAsync(Url url, CancellationToken cancellationToken = default)
        {
            await context.Urls.AddAsync(url, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
        }

        public async Task<Url> UpdateUrlAsync(Url url, CancellationToken cancellationToken = default)
        {
            url.UpdatedAt = DateTime.UtcNow;
            context.Entry(url).State = EntityState.Modified;
            await context.SaveChangesAsync(cancellationToken);
            return url;
        }

        public async Task DeleteUrlAsync(Url url, CancellationToken cancellationToken = default)
        {
            context.Urls.Remove(url);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}