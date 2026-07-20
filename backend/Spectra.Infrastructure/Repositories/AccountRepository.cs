using Microsoft.EntityFrameworkCore;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Infrastructure.Repositories
{
    public class AccountRepository(AppDbContext context) : IAccountRepository
    {
        public async Task UpdateUserAsync(User user)
        {
            context.Entry(user).State = EntityState.Modified;
            await context.SaveChangesAsync();
        }

        public async Task<User?> GetUserAsync(string userId, CancellationToken cancellationToken = default)
        {
            return await context.Users.FindAsync([Guid.Parse(userId)], cancellationToken);
        }
    }
}
