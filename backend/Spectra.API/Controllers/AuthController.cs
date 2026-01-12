using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Infrastructure.Services;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IIdentityService identityService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await identityService.RegisterAsync(request);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await identityService.LoginAsync(request);

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var result = await identityService.RefreshTokenAsync(request);

            return Ok(result);
        }
    }
}
