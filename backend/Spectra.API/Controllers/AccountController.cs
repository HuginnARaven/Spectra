using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Spectra.API.Extensions;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using System.Security.Claims;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController(IAccountService accountService) : ControllerBase
    {
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var currentUserId = User.GetUserId();

            var userProfile = await accountService.GetUserAsync(currentUserId);

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
    }
}
