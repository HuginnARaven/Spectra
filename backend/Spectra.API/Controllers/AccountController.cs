using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Spectra.API.Extensions;
using Spectra.Application.Common;
using Spectra.Application.Interfaces;
using Spectra.Application.DTOs.Account;
using Spectra.Domain.Enums;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController(IAccountService accountService) : ControllerBase
    {
        [HttpGet("profile")]
        public async Task<ActionResult<ProfileResponse>> GetProfile(CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();
            var userProfile = await accountService.GetUserProfileAsync(currentUserId, cancellationToken);

            return Ok(userProfile);
        }

        [HttpPut("edit-profile")]
        public async Task<IActionResult> EditProfile(ProfileRequest request)
        {
            var currentUserId = User.GetUserId();

            await accountService.EditUserProfileAsync(currentUserId, request);

            return Ok();
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var currentUserId = User.GetUserId();

            await accountService.ChangePasswordAsync(currentUserId, request);

            return Ok(new { message = "Password changed successfully" });
        }

        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest request)
        {
            var currentUserId = User.GetUserId();

            await accountService.SetPasswordAsync(currentUserId, request);

            return Ok();
        }

        [HttpPost("confirm-email")]
        [AllowAnonymous]
        public async Task<ActionResult<ConfirmEmailResponse>> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
            return Ok(await accountService.ConfirmEmailAsync(request));
        }
        
        [HttpPost("send-email-verification-letter")]
        public async Task<IActionResult> SendEmailVerificationLetter()
        {
            var currentUserId = User.GetUserId();
            await accountService.SendEmailVerificationLetterAsync(currentUserId);
            
            return Ok();
        }
        
        [Authorize(Roles = UserRoles.Admin)]
        [HttpGet("admin/get-user/{id}")]
        public async Task<ActionResult<UserAdminDto>> AdminGetUser(string id, CancellationToken cancellationToken)
        {
            return Ok(await accountService.AdminGetUserByIdAsync(id, cancellationToken));
        }
        
        [Authorize(Roles = UserRoles.Admin)]
        [HttpGet("admin/get-users")]
        public async Task<ActionResult<PaginatedResult<UserAdminDto>>> AdminGetUsers([FromQuery] PaginationRequest request, CancellationToken cancellationToken)
        {
            return Ok(await accountService.AdminGetUsersAsync(request, cancellationToken));
        }
        
        [Authorize(Roles = UserRoles.Admin)]
        [HttpPut("admin/edit-user/{id}")]
        public async Task<ActionResult<UserAdminDto>> AdminEditUser(UserAdminRequest request, string id, CancellationToken cancellationToken)
        {
            return Ok(await accountService.AdminEditUserAsync(request, id, cancellationToken));
        }
        
        [Authorize(Roles = UserRoles.Admin)]
        [HttpDelete("admin/delete-user/{id}")]
        public async Task<IActionResult> AdminDeleteUser(string id, CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();
            if (currentUserId == id)
                return BadRequest(new { message = "You cannot delete your own account." });
            
            await accountService.AdminDeleteUserAsync(id, cancellationToken);
            
            return Ok();
        }
    }
}
