using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Interfaces
{
    public interface IAccountRepository
    {
        Task<User?> GetUserAsync(string userId, CancellationToken cancellationToken = default);
        Task UpdateUserAsync(User user);
    }
}
