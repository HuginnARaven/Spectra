using Microsoft.EntityFrameworkCore;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;
using System;
using System.Collections.Generic;
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
    }
}
