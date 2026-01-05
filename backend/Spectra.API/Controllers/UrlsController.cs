using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Domain.Entities;
using System.Security.Claims;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UrlsController(IUrlShorteningService urlService, IUrlAnalyticsService analyticsService) : ControllerBase
    {
        [Authorize]
        [HttpPost("create-shorten-url")]
        public async Task<IActionResult> CreateShortenUrl(CreateUrlRequest request)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId)) { 
                return Unauthorized();
            }

            return Ok(await urlService.ShortenUrlAsync(request, currentUserId));
        }

        [Authorize]
        [HttpGet("get-shorten-urls")]
        public async Task<IActionResult> GetUserUrls()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized();
            }

            Console.WriteLine(currentUserId);

            return Ok(await urlService.GetUserUrlsAsync(currentUserId));
        }

        [Authorize]
        [HttpDelete("delete-shorten-url/{id}")]
        public async Task<IActionResult> DeleteUrl(string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized();
            }

            await urlService.DeleteUrlsAsync(id, currentUserId);

            return Ok();
        }

        [HttpGet]
        [Route("~/{code}")] // ~ -> to ingnore default route forming
        public async Task<IActionResult> GetOriginalFromShortenUrl(string code)
        {
            if (code == "favicon.ico" || code == "robots.txt")
            {
                return NotFound();
            }

            try
            {
                var originalUrl = await urlService.GetOriginalUrlAsync(code);

                // check for Prefetch/Prerender
                var purpose = Request.Headers["Purpose"].ToString();
                var secPurpose = Request.Headers["Sec-Purpose"].ToString();
                var secFetchDest = Request.Headers["Sec-Fetch-Dest"].ToString();

                bool isBotOrPrefetch =
                    (!string.IsNullOrEmpty(purpose) && purpose.Contains("prefetch", StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(secPurpose) && secPurpose.Contains("prefetch", StringComparison.OrdinalIgnoreCase)) ||
                    secFetchDest == "image";

                if (isBotOrPrefetch)
                {
                    return Redirect(originalUrl);
                }

                // collecting data only if it is not Prefetch/Prerender or other browser shenanigans
                var ip = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Unknown";
                var ua = Request.Headers["User-Agent"].ToString();
                var referer = Request.Headers["Referer"].ToString();

                // TODO: Move Analytics to Background Task (use "Fire-and-Forget" strategy similar to Celery in Django)
                await analyticsService.LogVisitAsync(code, ip, ua, referer);

                return Redirect(originalUrl);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
