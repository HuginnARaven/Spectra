using Spectra.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces
{
    public interface IAccountService
    {
        Task<ProfileRsponse> GetUserAsync(string userId);
        Task EditUserAsync(string userId, ProfileRequest request);
        Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
    }
}
