using AutoMapper;
using FluentAssertions;
using Moq;
using Spectra.Application.DTOs;
using Spectra.Application.DTOs.Urls;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Application.Mappings;
using Spectra.Application.Services;
using Spectra.Domain.Entities;
using Spectra.Domain.Exceptions;
using Spectra.Domain.Interfaces;

namespace Spectra.Application.UnitTests.Services;

public class UrlShorteningServiceTests
{
    private readonly Mock<IUrlRepository> _urlRepositoryMock;
    private readonly Mock<IUrlCacheService> _cacheServiceMock;
    private readonly Mock<IUrlGenerator> _urlGeneratorMock;
    private readonly Mock<IUserSubscriptionRepository> _userSubscriptionRepositoryMock;
    private readonly IMapper _mapper;
    
    private readonly UrlShorteningService _sut;

    public UrlShorteningServiceTests()
    {
        _urlRepositoryMock = new Mock<IUrlRepository>();
        _cacheServiceMock = new Mock<IUrlCacheService>();
        _urlGeneratorMock = new Mock<IUrlGenerator>();
        _userSubscriptionRepositoryMock = new Mock<IUserSubscriptionRepository>();

        _userSubscriptionRepositoryMock.Setup(x => x.GetEffectivePlanByUserIdAsync(It.IsAny<string>()))
            .ReturnsAsync(new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                Description = "Pro plan",
                IsDefault = false,
                HasAccessToGeneralAnalytics = true,
                HasAccessToUrlAnalytics = true,
                HasCustomAliasAccess = true,
                HasEarlyFeatureAccess = true,
                MaxUrlsLimit = -1,
                AnalyticsRetentionDays = 30
            });
        
        var config = new MapperConfiguration(configuration =>
        {
            configuration.AddProfile(new MappingProfile());
        });
        _mapper = config.CreateMapper();

        _sut = new UrlShorteningService(
            _urlRepositoryMock.Object, 
            _urlGeneratorMock.Object,
            _cacheServiceMock.Object, 
            _userSubscriptionRepositoryMock.Object,
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
        
        _urlRepositoryMock.Verify(x => x.AddUrlAsync(It.IsAny<Url>()), Times.Once);
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
        
        _urlRepositoryMock.Verify(x => x.AddUrlAsync(It.IsAny<Url>()), Times.Never);
    }

    [Fact]
    public async Task ShortenUrlAsync_LimitReached_ThrowsSubscriptionLimitException()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs" };
        var userId = Guid.NewGuid();

        _userSubscriptionRepositoryMock.Setup(x => x.GetEffectivePlanByUserIdAsync(userId.ToString()))
            .ReturnsAsync(new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Name = "Free",
                MaxUrlsLimit = 5
            });

        _urlRepositoryMock.Setup(x => x.GetUserUrlsCountAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        await FluentActions.Awaiting(() => _sut.ShortenUrlAsync(request, userId.ToString(), "http://localhost:5173"))
            .Should()
            .ThrowAsync<SubscriptionLimitException>()
            .WithMessage("You reached urls count limit of your subscription plan.");

        _urlRepositoryMock.Verify(x => x.AddUrlAsync(It.IsAny<Url>()), Times.Never);
    }

    [Fact]
    public async Task ShortenUrlAsync_WithCustomCode_WhenNoCustomAliasAccess_ThrowsSubscriptionLimitException()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs", CustomCode = "custom1" };
        var userId = Guid.NewGuid();

        _userSubscriptionRepositoryMock.Setup(x => x.GetEffectivePlanByUserIdAsync(userId.ToString()))
            .ReturnsAsync(new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Name = "Free",
                MaxUrlsLimit = -1,
                HasCustomAliasAccess = false
            });

        await FluentActions.Awaiting(() => _sut.ShortenUrlAsync(request, userId.ToString(), "http://localhost:5173"))
            .Should()
            .ThrowAsync<SubscriptionLimitException>()
            .WithMessage("Your subscription tier does not support custom url codes.");

        _urlRepositoryMock.Verify(x => x.AddUrlAsync(It.IsAny<Url>()), Times.Never);
    }

    [Fact]
    public async Task ShortenUrlAsync_WithCustomCode_WhenCodeAlreadyExists_ThrowsInvalidOperationException()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs", CustomCode = "custom1" };
        var userId = Guid.NewGuid();

        _userSubscriptionRepositoryMock.Setup(x => x.GetEffectivePlanByUserIdAsync(userId.ToString()))
            .ReturnsAsync(new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                MaxUrlsLimit = -1,
                HasCustomAliasAccess = true
            });

        _urlRepositoryMock.Setup(x => x.CodeExistsAsync("custom1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        await FluentActions.Awaiting(() => _sut.ShortenUrlAsync(request, userId.ToString(), "http://localhost:5173"))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("Such code already exists. Please try again.");

        _urlRepositoryMock.Verify(x => x.AddUrlAsync(It.IsAny<Url>()), Times.Never);
    }

    [Fact]
    public async Task ShortenUrlAsync_WithValidCustomCode_ReturnsShortUrlWithCustomCode()
    {
        var request = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs", CustomCode = "custom1" };
        var userId = Guid.NewGuid();

        _userSubscriptionRepositoryMock.Setup(x => x.GetEffectivePlanByUserIdAsync(userId.ToString()))
            .ReturnsAsync(new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                MaxUrlsLimit = -1,
                HasCustomAliasAccess = true
            });

        _urlRepositoryMock.Setup(x => x.CodeExistsAsync("custom1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _sut.ShortenUrlAsync(request, userId.ToString(), "http://localhost:5173");

        result.Should().NotBeNull();
        result.ShortCode.Should().Be("custom1");
        result.ShortUrl.Should().Be("http://localhost:5173/custom1");

        _urlRepositoryMock.Verify(x => x.AddUrlAsync(It.Is<Url>(u => u.ShortCode == "custom1")), Times.Once);
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