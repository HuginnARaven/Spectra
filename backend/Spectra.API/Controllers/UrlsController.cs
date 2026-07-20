using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Spectra.API.Extensions;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Domain.Entities;
using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;
using Spectra.Application.Common;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UrlsController(IUrlShorteningService urlService, IBackgroundAnalyticsQueue backgroundAnalyticsQueue, IUrlAnalyticsService analyticsService) : ControllerBase
    {
        [Authorize]
        [HttpPost("create-shorten-url")]
        public async Task<ActionResult<UrlResponse>> CreateShortenUrl(CreateUrlRequest request, CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();

            return Ok(await urlService.ShortenUrlAsync(request, currentUserId, $"{Request.Scheme}://{Request.Host}{Request.PathBase}", cancellationToken));
        }

        [Authorize]
        [HttpGet("get-shorten-urls")]
        public async Task<ActionResult<IReadOnlyList<UrlDto>>> GetUserUrls(CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();

            return Ok(await urlService.GetUserUrlsAsync(currentUserId, cancellationToken));
        }

        [Authorize]
        [HttpDelete("delete-shorten-url/{id}")]
        public async Task<IActionResult> DeleteUrl(string id, CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();

            await urlService.DeleteUrlsAsync(id, currentUserId, cancellationToken);

            return Ok();
        }

        [Authorize]
        [HttpGet("get-url-visits/{id}")]
        public async Task<ActionResult<PaginatedResult<UrlVisitDto>>> GetUrlVisits(string id, [FromQuery] PaginationRequest request, CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();

            var result = await urlService.GetUrlVisitsAsync(id, currentUserId, request, cancellationToken);

            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("get-all-visits")]
        public async Task<ActionResult<PaginatedResult<UrlVisitDto>>> GetAllVisits([FromQuery] PaginationRequest request, CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();

            var result = await urlService.GetAllVisitsAsync(currentUserId, request, cancellationToken);

            return Ok(result);
        }

        [HttpGet]
        [Route("~/{code}")] // ~ -> to ingnore default route forming
        public async Task<IActionResult> GetOriginalFromShortenUrl(string code, CancellationToken cancellationToken)
        {
            if (code == "favicon.ico" || code == "robots.txt")
            {
                return NotFound();
            }

            var originalUrl = await urlService.GetOriginalUrlAsync(code, cancellationToken);

            // check for temporary url
            if (originalUrl is ['t', '|', ..])
            {
                return Redirect(originalUrl[2..]);
            }
            
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

            // "Fire-and-Forget" strategy similar to Celery in Django
            await backgroundAnalyticsQueue.QueueBackgroundWorkItemAsync(new VisitLogDto(code, ip, ua, referer));

            return Redirect(originalUrl);
        }
        
        [Authorize]
        [HttpGet("get-url-analytics/{id}")]
        public async Task<ActionResult<UrlAnalyticsDto>> GetUrlAnalytics(string id, CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();
            var result = await analyticsService.GetUrlAnalyticsAsync(id, currentUserId);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("get-trend-analytics")]public async Task<ActionResult<TrendAnalyticsDto>> GetTrendAnalytics(CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();
            var result = await analyticsService.GetTrendAnalyticsAsync(currentUserId);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("get-devices-visits-by-days")]
        public async Task<ActionResult<IReadOnlyCollection<DevicesVisitsByDayDto>>> GetDevicesVisitsByDays(CancellationToken cancellationToken)
        {
            var currentUserId = User.GetUserId();
            var result = await analyticsService.GetDevicesVisitsByDaysAsync(currentUserId);
            return Ok(result);
        }
        
        [HttpPost("create-temporary-url")]
        [EnableRateLimiting("AnonymousUrlCreation")]
        public async Task<ActionResult<string>> CreateTemporaryUrl(CreateUrlRequest request, CancellationToken cancellationToken)
        {
            return Ok(await urlService.TemporarilyShortenUrlAsync(request, $"{Request.Scheme}://{Request.Host}{Request.PathBase}", cancellationToken));
        }
    }
}
