using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Spectra.API.Extensions;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity.Data;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController(IAccountService accountService) : ControllerBase
    {
        [HttpGet("profile")]
        public async Task<ActionResult<ProfileRsponse>> GetProfile(CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();
            var userProfile = await accountService.GetUserAsync(currentUserId, cancellationToken);

            return Ok(userProfile);
        }

        [HttpPut("edit-profile")]
        public async Task<IActionResult> EditProfile(ProfileRequest request)
        {
            var currentUserId = User.GetUserId();

            await accountService.EditUserAsync(currentUserId, request);

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
    }
}
