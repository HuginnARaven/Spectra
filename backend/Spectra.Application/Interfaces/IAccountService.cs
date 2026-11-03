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
        
        Task<PaginatedResult<AdminUserListItem>> AdminGetUsersAsync(AdminPaginatedUsersQuery request, CancellationToken cancellationToken = default);
        Task<IList<RoleDto>> AdminGetRolesAsync(CancellationToken cancellationToken = default);
        Task<AdminUserDetails?> AdminGetUserByIdAsync(string userId, CancellationToken cancellationToken = default);
        Task<AdminUserListItem> AdminEditUserAsync(AdminUserRequest request, string userId, CancellationToken cancellationToken = default);
        Task AdminDeleteUserAsync(string userId, CancellationToken cancellationToken = default);
    }
}
