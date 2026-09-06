using Microsoft.AspNetCore.Mvc;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using LoginRequest = Spectra.Application.DTOs.LoginRequest;
using RegisterRequest = Spectra.Application.DTOs.RegisterRequest;
using ResetPasswordRequest = Spectra.Application.DTOs.ResetPasswordRequest;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            var result = await authService.RegisterAsync(request);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var result = await authService.LoginAsync(request);

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<RefreshTokenResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var result = await authService.RefreshTokenAsync(request);

            return Ok(result);
        }

        [HttpPost("google-login")]
        public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            var result = await authService.LoginWithGoogleAsync(request.Code);
            
            return Ok(result);
        }
        
        [HttpPost("send-forgot-password-letter")]
        public async Task<IActionResult> SendForgotPasswordLetter([FromBody] ForgotPasswordRequest request)
        {
            await authService.SendPasswordResetEmailAsync(request.Email);
            return Ok();
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            await authService.ResetPasswordAsync(request);
            return Ok();
        }
    }
}
