using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UrlsController(IUrlShorteningService urlService) : ControllerBase
    {
        [HttpPost("create-shorten-url")]
        public async Task<IActionResult> CreateShortenUrl(CreateUrlRequest request)
        {
            return Ok(await urlService.ShortenUrlAsync(request));
        }
    }
}
