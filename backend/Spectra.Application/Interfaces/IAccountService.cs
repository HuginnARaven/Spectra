using Spectra.Application.Common;
using Spectra.Application.DTOs.Account;


namespace Spectra.Application.Interfaces
{
    public interface IAccountService
    {
        Task<ProfileResponse> GetUserProfileAsync(string userId, CancellationToken cancellationToken = default);
        Task EditUserProfileAsync(string userId, ProfileRequest request);
        Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
        Task SetPasswordAsync(string userId, SetPasswordRequest request);
        Task<ConfirmEmailResponse> ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken = default);
        Task SendEmailVerificationLetterAsync(string userId, CancellationToken cancellationToken = default);
        
        Task<PaginatedResult<UserAdminDto>> AdminGetUsersAsync(PaginationRequest request, CancellationToken cancellationToken = default);
        Task<UserAdminDto?> AdminGetUserByIdAsync(string userId, CancellationToken cancellationToken = default);
        Task<UserAdminDto> AdminEditUserAsync(UserAdminRequest request, string userId, CancellationToken cancellationToken = default);
        Task AdminDeleteUserAsync(string userId, CancellationToken cancellationToken = default);
    }
}
