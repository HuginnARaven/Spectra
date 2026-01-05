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
        public async Task AddAsync(Url url)
        {
            await context.Urls.AddAsync(url);
            await context.SaveChangesAsync();
        }

        public async Task<bool> CodeExistsAsync(string code)
        {
            return await context.Urls.AnyAsync(u => u.ShortCode == code);
        }

        public async Task<Url?> GetByCodeAsync(string code)
        {
            return await context.Urls.FirstOrDefaultAsync(u => u.ShortCode == code);
        }

        public async Task AddVisitAsync(UrlVisit visit)
        {
            await context.UrlVisits.AddAsync(visit);
            await context.SaveChangesAsync();
        }

        public async Task<IReadOnlyList<Url?>> GetUserUrlsAsync(string userId)
        {
            Console.WriteLine(userId);
            return await context.Urls.Where(u => u.UserId == Guid.Parse(userId)).ToListAsync();
        }

        public async Task<Url?> GetUserUrlByIdAsync(string id, string userId)
        {
            Console.WriteLine(userId);
            Console.WriteLine(Guid.Parse(userId));
            return await context.Urls.FirstOrDefaultAsync(u => u.Id == Guid.Parse(id) && u.UserId == Guid.Parse(userId));
        }

        public async Task DeleteUrlAsync(Url url)
        {
            context.Urls.Remove(url);
            await context.SaveChangesAsync();
        }
    }
}
