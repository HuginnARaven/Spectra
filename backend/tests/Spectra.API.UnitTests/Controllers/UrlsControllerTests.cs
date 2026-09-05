using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Spectra.API.Controllers;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;

namespace Spectra.API.UnitTests.Controllers;

public class UrlsControllerTests
{
    private readonly Mock<IUrlShorteningService> _urlService;
    private readonly Mock<IBackgroundAnalyticsQueue> _backgroundAnalyticsQueue;
    private readonly Mock<IUrlAnalyticsService> _analyticsService;

    private readonly UrlsController _sut;
    
    public UrlsControllerTests()
    {
        _urlService = new Mock<IUrlShorteningService>();
        _backgroundAnalyticsQueue = new Mock<IBackgroundAnalyticsQueue>();
        _analyticsService = new Mock<IUrlAnalyticsService>();

        _sut = new UrlsController(_urlService.Object, _backgroundAnalyticsQueue.Object, _analyticsService.Object);
    }

    [Fact]
    public async Task GetOriginalFromShortenUrl_ShouldLogAnalytics_AndReturnRedirect()
    {
        var shortCode = "1234qwe";
        var expectedOriginalUrl = "https://xunit.net/?tabs=cs";
        var testIpAddress = "192.168.1.15";
        var testUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
        var testReferer = "https://google.com";
        
        _urlService
            .Setup(x => x.GetOriginalUrlAsync(shortCode, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedOriginalUrl);
        
        var httpContext = new DefaultHttpContext();
        
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse(testIpAddress);
        
        httpContext.Request.Headers["User-Agent"] = testUserAgent;
        httpContext.Request.Headers["Referer"] = testReferer;
        
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };
        
        var result = await _sut.GetOriginalFromShortenUrl(shortCode, CancellationToken.None);
        
        var redirectResult = result as RedirectResult;
        redirectResult.Should().NotBeNull();
        redirectResult!.Url.Should().Be(expectedOriginalUrl);
        
        _backgroundAnalyticsQueue.Verify(x => x.QueueBackgroundWorkItemAsync(
            It.Is<VisitLogDto>(dto =>
                dto.ShortCode == shortCode &&
                dto.IpAddress == testIpAddress &&
                dto.UserAgent == testUserAgent &&
                dto.Referer == testReferer)), Times.Once);
    }

    [Theory]
    [InlineData("favicon.ico")]
    [InlineData("robots.txt")]
    public async Task GetOriginalFromShortenUrl_WhenCodeIsFaviconOrRobots_ShouldReturnNotFound(string code)
    {
        var result = await _sut.GetOriginalFromShortenUrl(code, CancellationToken.None);

        result.Should().BeOfType<NotFoundResult>();
        _urlService.Verify(x => x.GetOriginalUrlAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
        _backgroundAnalyticsQueue.Verify(x => x.QueueBackgroundWorkItemAsync(It.IsAny<VisitLogDto>()), Times.Never);
    }

    [Fact]
    public async Task GetOriginalFromShortenUrl_WhenUrlIsTemporary_ShouldReturnRedirectWithoutLoggingAnalytics()
    {
        var shortCode = "temp123";
        var originalUrl = "https://example.com/target";
        var temporaryStoredUrl = $"t|{originalUrl}";

        _urlService
            .Setup(x => x.GetOriginalUrlAsync(shortCode, It.IsAny<CancellationToken>()))
            .ReturnsAsync(temporaryStoredUrl);

        var result = await _sut.GetOriginalFromShortenUrl(shortCode, CancellationToken.None);

        var redirectResult = result as RedirectResult;
        redirectResult.Should().NotBeNull();
        redirectResult!.Url.Should().Be(originalUrl);

        _backgroundAnalyticsQueue.Verify(x => x.QueueBackgroundWorkItemAsync(It.IsAny<VisitLogDto>()), Times.Never);
    }

    [Theory]
    [InlineData("Purpose", "prefetch")]
    [InlineData("Purpose", "PREFETCH")]
    [InlineData("Sec-Purpose", "prefetch")]
    [InlineData("Sec-Purpose", "PREFETCH")]
    [InlineData("Sec-Fetch-Dest", "image")]
    public async Task GetOriginalFromShortenUrl_WhenBotOrPrefetch_ShouldReturnRedirectWithoutLoggingAnalytics(string headerKey, string headerValue)
    {
        var shortCode = "prefetch123";
        var expectedOriginalUrl = "https://example.com/prefetch";

        _urlService
            .Setup(x => x.GetOriginalUrlAsync(shortCode, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedOriginalUrl);

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers[headerKey] = headerValue;

        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        var result = await _sut.GetOriginalFromShortenUrl(shortCode, CancellationToken.None);

        var redirectResult = result as RedirectResult;
        redirectResult.Should().NotBeNull();
        redirectResult!.Url.Should().Be(expectedOriginalUrl);

        _backgroundAnalyticsQueue.Verify(x => x.QueueBackgroundWorkItemAsync(It.IsAny<VisitLogDto>()), Times.Never);
    }
}