using Spectra.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces
{
    public interface IAccountService
    {
        Task<ProfileRsponse> GetUserAsync(string userId, CancellationToken cancellationToken = default);
        Task EditUserAsync(string userId, ProfileRequest request);
        Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
        Task SetPasswordAsync(string userId, SetPasswordRequest request);
        Task<ConfirmEmailResponse> ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken = default);
        Task SendEmailVerificationLetterAsync(string userId, CancellationToken cancellationToken = default);
    }
}
