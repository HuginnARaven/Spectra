using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Interfaces
{
    public interface IAccountRepository
    {
        Task<User?> getUserAsync(string userId);
        Task updateUserAsync(User user);
    }
}
