using AutoMapper;
using FluentAssertions;
using Moq;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Application.Mappings;
using Spectra.Application.Services;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;

namespace Spectra.Application.UnitTests.Services;

public class UrlShorteningServiceTests
{
    private readonly Mock<IUrlRepository> _urlRepositoryMock;
    private readonly Mock<IUrlCacheService> _cacheServiceMock;
    private readonly Mock<IUrlGenerator> _urlGeneratorMock;
    private readonly IMapper _mapper;
    
    private readonly UrlShorteningService _sut;

    public UrlShorteningServiceTests()
    {
        _urlRepositoryMock = new Mock<IUrlRepository>();
        _cacheServiceMock = new Mock<IUrlCacheService>();
        _urlGeneratorMock = new Mock<IUrlGenerator>();
        var config = new MapperConfiguration(configuration =>
        {
            configuration.AddProfile(new MappingProfile());
        });
        _mapper = config.CreateMapper();

        _sut = new UrlShorteningService(
            _urlRepositoryMock.Object, 
            _urlGeneratorMock.Object,
            _cacheServiceMock.Object, 
            _mapper
            );
    }
    
    [Fact]
    public async Task ShortenUrlTest_ValidRequest_ReturnsShortUrl()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs" };
        var testUniqueCode = "1234qwe";
        var userId = Guid.NewGuid();
        
        _urlGeneratorMock.Setup(x => x.GenerateUniqueCode()).Returns(testUniqueCode);
        _urlRepositoryMock.Setup(x => x.CodeExistsAsync(testUniqueCode)).ReturnsAsync(false);
        
        var result = await _sut.ShortenUrlAsync(request, userId.ToString(), "http://localhost:5173");
        
        
        result.Should().NotBeNull();
        result.ShortUrl.Should().Be($"http://localhost:5173/{testUniqueCode}");
        
        _urlRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Url>()), Times.Once);
        _cacheServiceMock.Verify(x => x.SetUrlAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
    
    [Fact]
    public async Task ShortenUrlTest_NotValidRequest_CodeExists()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs" };
        var testUniqueCode = "1234qwe";
        var userId = Guid.NewGuid();
        
        _urlGeneratorMock.Setup(x => x.GenerateUniqueCode()).Returns(testUniqueCode);
        _urlRepositoryMock.Setup(x => x.CodeExistsAsync(testUniqueCode)).ReturnsAsync(true);
        
        await FluentActions.Awaiting(() => _sut.ShortenUrlAsync(request, userId.ToString(), "http://localhost:5173"))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("Failed to generate a unique code. Please try again.");
        
        _urlRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Url>()), Times.Never);
    }
    
    
    [Fact]
    public async Task TemporarilyShortenUrlAsync_ValidRequest_ReturnsShortUrlAndCachesIt()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs" };
        var testUniqueCode = "1234qwe";
        
        _urlGeneratorMock.Setup(x => x.GenerateUniqueCode()).Returns(testUniqueCode);
        _urlRepositoryMock.Setup(x => x.CodeExistsAsync(testUniqueCode)).ReturnsAsync(false);
        
        var result = await _sut.TemporarilyShortenUrlAsync(request, "http://localhost:5173");
        
        result.Should().NotBeNull();
        result.Should().Be($"http://localhost:5173/{testUniqueCode}");
        
        _cacheServiceMock.Verify(x => x.SetUrlAsync(testUniqueCode, $"t|{request.OriginalUrl}"), Times.Once);
    }
    
    [Fact]
    public async Task TemporarilyShortenUrlAsync_NotValidRequest_CodeExists()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs" };
        var testUniqueCode = "1234qwe";
        
        _urlGeneratorMock.Setup(x => x.GenerateUniqueCode()).Returns(testUniqueCode);
        _urlRepositoryMock.Setup(x => x.CodeExistsAsync(testUniqueCode)).ReturnsAsync(true);
        
        await FluentActions.Awaiting(() => _sut.TemporarilyShortenUrlAsync(request, "http://localhost:5173"))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("Failed to generate a unique code. Please try again.");
        
        _cacheServiceMock.Verify(x => x.SetUrlAsync(testUniqueCode, $"t|{request.OriginalUrl}"), Times.Never);
    }

    [Fact]
    public async Task GetOriginalUrl_ValidRequest_ReturnsOriginalUrlFromCache()
    {
        var urlCode = "1234qwe";
        _cacheServiceMock.Setup(x => x.GetOriginalUrlAsync(It.IsAny<string>())).ReturnsAsync("https://xunit.net/?tabs=cs");
        
        var result = await _sut.GetOriginalUrlAsync(urlCode);
        
        result.Should().NotBeNull();
        result.Should().Be("https://xunit.net/?tabs=cs");
        
        _cacheServiceMock.Verify(x => x.GetOriginalUrlAsync(urlCode), Times.Once);
        _urlRepositoryMock.Verify(x => x.GetByCodeAsync(It.IsAny<string>()), Times.Never);
        _cacheServiceMock.Verify(x => x.SetUrlAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
    
    [Fact]
    public async Task GetOriginalUrl_ValidRequest_ReturnsOriginalUrlFromDb()
    {
        var urlCode = "1234qwe";
        _cacheServiceMock.Setup(x => x.GetOriginalUrlAsync(It.IsAny<string>())).ReturnsAsync((string?)null);
        _urlRepositoryMock.Setup(x => x.GetByCodeAsync(It.IsAny<string>())).ReturnsAsync(new Url { OriginalUrl = "https://xunit.net/?tabs=cs" });
        
        var result = await _sut.GetOriginalUrlAsync(urlCode);
        
        result.Should().NotBeNull();
        result.Should().Be("https://xunit.net/?tabs=cs");
        
        _cacheServiceMock.Verify(x => x.GetOriginalUrlAsync(urlCode), Times.Once);
        _urlRepositoryMock.Verify(x => x.GetByCodeAsync(It.IsAny<string>()), Times.Once);
        _cacheServiceMock.Verify(x => x.SetUrlAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }
    
    [Fact]
    public async Task GetOriginalUrl_NotValidRequest_OriginalUrlNotFound()
    {
        var urlCode = "1234qwe";
        _cacheServiceMock.Setup(x => x.GetOriginalUrlAsync(It.IsAny<string>())).ReturnsAsync((string?)null);
        _urlRepositoryMock.Setup(x => x.GetByCodeAsync(It.IsAny<string>())).ReturnsAsync((Url?)null);

        await FluentActions.Awaiting(() => _sut.GetOriginalUrlAsync(urlCode))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"URL with code '{urlCode}' not found.");

        _cacheServiceMock.Verify(x => x.GetOriginalUrlAsync(urlCode), Times.Once);
        _urlRepositoryMock.Verify(x => x.GetByCodeAsync(It.IsAny<string>()), Times.Once);
        _cacheServiceMock.Verify(x => x.SetUrlAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}