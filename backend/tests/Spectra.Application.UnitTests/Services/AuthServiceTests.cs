using FluentAssertions;
using Moq;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Application.Services;
using Spectra.Application.Services.Utilities;
using Spectra.Domain.Entities;

namespace Spectra.Application.UnitTests.Services;

public class AuthServiceTests
{
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
    private readonly Mock<IExternalAuthService> _externalAuthServiceMock;
    private readonly Mock<IIdentityService> _identityServiceMock;
    private readonly Mock<IEmailNotificationService> _emailNotificationServiceMock;

    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();
        _externalAuthServiceMock = new Mock<IExternalAuthService>();
        _identityServiceMock = new Mock<IIdentityService>();
        _emailNotificationServiceMock = new Mock<IEmailNotificationService>();

        _sut = new AuthService(
            _jwtTokenGeneratorMock.Object,
            _externalAuthServiceMock.Object,
            _identityServiceMock.Object,
            _emailNotificationServiceMock.Object
        );
    }

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponseWithTokensAndUpdatesUser()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@example.com",
            Password = "Password123!"
        };
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            UserName = "testuser",
            DisplayName = "Test User",
            EmailConfirmed = true,
            CreatedAt = new DateTime(2025, 1, 1, 12, 0, 0, DateTimeKind.Utc)
        };
        var accessToken = "jwt-access-token";
        var refreshToken = "jwt-refresh-token";

        _identityServiceMock.Setup(x => x.GetUserWithCredentialsAsync(request.Email, request.Password))
            .ReturnsAsync(user);
        _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(user))
            .Returns(accessToken);
        _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken())
            .Returns(refreshToken);

        // Act
        var result = await _sut.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(accessToken);
        result.RefreshToken.Should().Be(refreshToken);
        result.User.Should().NotBeNull();
        result.User.Id.Should().Be(user.Id.ToString());
        result.User.Email.Should().Be(user.Email);
        result.User.Username.Should().Be(user.UserName);
        result.User.DisplayName.Should().Be(user.DisplayName);
        result.User.EmailConfirmed.Should().Be(user.EmailConfirmed);
        result.User.CreatedAt.Should().Be(user.CreatedAt);

        user.RefreshToken.Should().Be(refreshToken);
        user.RefreshTokenExpiryTime.Should().BeAfter(DateTime.UtcNow.AddDays(6));

        _identityServiceMock.Verify(x => x.GetUserWithCredentialsAsync(request.Email, request.Password), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(user), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(user), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_InvalidCredentials_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@example.com",
            Password = "WrongPassword!"
        };

        _identityServiceMock.Setup(x => x.GetUserWithCredentialsAsync(request.Email, request.Password))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.LoginAsync(request))
            .Should()
            .ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid credentials.");

        _identityServiceMock.Verify(x => x.GetUserWithCredentialsAsync(request.Email, request.Password), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    #endregion

    #region LoginWithGoogleAsync Tests

    [Fact]
    public async Task LoginWithGoogleAsync_ValidCode_ReturnsAuthResponseWithTokens()
    {
        // Arrange
        var code = "valid-google-auth-code";
        var googleUserData = new GoogleAuthUserDataDto
        {
            Subject = "google-subject-id",
            Email = "google.user@example.com",
            Name = "Google User",
            PictureUrl = "https://example.com/avatar.jpg"
        };
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = googleUserData.Email,
            UserName = "googleuser",
            DisplayName = googleUserData.Name,
            EmailConfirmed = true,
            CreatedAt = new DateTime(2025, 1, 1, 12, 0, 0, DateTimeKind.Utc)
        };
        var accessToken = "google-jwt-token";
        var refreshToken = "google-refresh-token";

        _externalAuthServiceMock.Setup(x => x.GetGoogleUserDataByCodeAsync(code))
            .ReturnsAsync(googleUserData);
        _identityServiceMock.Setup(x => x.LoginWithExternalProviderAsync("Google", googleUserData.Subject, googleUserData.Email, googleUserData.Name))
            .ReturnsAsync(user);
        _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(user))
            .Returns(accessToken);
        _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken())
            .Returns(refreshToken);

        // Act
        var result = await _sut.LoginWithGoogleAsync(code);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(accessToken);
        result.RefreshToken.Should().Be(refreshToken);
        result.User.Should().NotBeNull();
        result.User.Id.Should().Be(user.Id.ToString());
        result.User.Email.Should().Be(user.Email);
        result.User.DisplayName.Should().Be(user.DisplayName);

        user.RefreshToken.Should().Be(refreshToken);
        user.RefreshTokenExpiryTime.Should().BeAfter(DateTime.UtcNow.AddDays(6));

        _externalAuthServiceMock.Verify(x => x.GetGoogleUserDataByCodeAsync(code), Times.Once);
        _identityServiceMock.Verify(x => x.LoginWithExternalProviderAsync("Google", googleUserData.Subject, googleUserData.Email, googleUserData.Name), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(user), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(user), Times.Once);
    }

    [Fact]
    public async Task LoginWithGoogleAsync_ExternalAuthFails_ThrowsException()
    {
        // Arrange
        var code = "invalid-google-auth-code";

        _externalAuthServiceMock.Setup(x => x.GetGoogleUserDataByCodeAsync(code))
            .ThrowsAsync(new HttpRequestException("Failed to retrieve external user data"));

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.LoginWithGoogleAsync(code))
            .Should()
            .ThrowAsync<HttpRequestException>()
            .WithMessage("Failed to retrieve external user data");

        _externalAuthServiceMock.Verify(x => x.GetGoogleUserDataByCodeAsync(code), Times.Once);
        _identityServiceMock.Verify(x => x.LoginWithExternalProviderAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    #endregion

    #region RegisterAsync Tests

    [Fact]
    public async Task RegisterAsync_ValidRequest_CreatesUserGeneratesTokensAndUpdatesUser()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "newuser@example.com",
            Username = "newusername",
            Password = "SecurePassword123!"
        };
        var accessToken = "new-user-access-token";
        var refreshToken = "new-user-refresh-token";

        _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns(accessToken);
        _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken())
            .Returns(refreshToken);

        // Act
        var result = await _sut.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(accessToken);
        result.RefreshToken.Should().Be(refreshToken);
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be(request.Email);
        result.User.Username.Should().Be(request.Username);
        result.User.DisplayName.Should().Be(request.Username);

        _identityServiceMock.Verify(x => x.CreateUserAsync(
            It.Is<User>(u =>
                u.Email == request.Email &&
                u.UserName == request.Username &&
                u.DisplayName == request.Username &&
                !string.IsNullOrEmpty(u.SecurityStamp)),
            request.Password), Times.Once);

        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.Is<User>(u =>
            u.RefreshToken == refreshToken &&
            u.RefreshTokenExpiryTime > DateTime.UtcNow.AddDays(6))), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_CreateUserFails_ThrowsException()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "existing@example.com",
            Username = "existinguser",
            Password = "Password123!"
        };

        _identityServiceMock.Setup(x => x.CreateUserAsync(It.IsAny<User>(), request.Password))
            .ThrowsAsync(new InvalidOperationException("User already exists."));

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.RegisterAsync(request))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("User already exists.");

        _identityServiceMock.Verify(x => x.CreateUserAsync(It.IsAny<User>(), request.Password), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    #endregion

    #region RefreshTokenAsync Tests

    [Fact]
    public async Task RefreshTokenAsync_ValidRequest_ReturnsNewTokensAndUpdatesUser()
    {
        // Arrange
        var expiredToken = "expired-jwt-token";
        var currentRefreshToken = "valid-refresh-token";
        var request = new RefreshTokenRequest
        {
            Token = expiredToken,
            RefreshToken = currentRefreshToken
        };
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            RefreshToken = currentRefreshToken,
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(2)
        };
        var newAccessToken = "new-jwt-token";
        var newRefreshToken = "new-refresh-token";

        _jwtTokenGeneratorMock.Setup(x => x.GetUserIdFromExpiredToken(expiredToken))
            .Returns(userId);
        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(user))
            .Returns(newAccessToken);
        _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken())
            .Returns(newRefreshToken);

        // Act
        var result = await _sut.RefreshTokenAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be(newAccessToken);
        result.RefreshToken.Should().Be(newRefreshToken);

        user.RefreshToken.Should().Be(newRefreshToken);
        user.RefreshTokenExpiryTime.Should().BeAfter(DateTime.UtcNow.AddDays(6));

        _jwtTokenGeneratorMock.Verify(x => x.GetUserIdFromExpiredToken(expiredToken), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(user), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(user), Times.Once);
    }

    [Fact]
    public async Task RefreshTokenAsync_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var expiredToken = "expired-jwt-token";
        var request = new RefreshTokenRequest
        {
            Token = expiredToken,
            RefreshToken = "any-refresh-token"
        };
        var userId = Guid.NewGuid().ToString();

        _jwtTokenGeneratorMock.Setup(x => x.GetUserIdFromExpiredToken(expiredToken))
            .Returns(userId);
        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.RefreshTokenAsync(request))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with id '{userId}' not found.");

        _jwtTokenGeneratorMock.Verify(x => x.GetUserIdFromExpiredToken(expiredToken), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task RefreshTokenAsync_RefreshTokenMismatch_ThrowsInvalidOperationException()
    {
        // Arrange
        var expiredToken = "expired-jwt-token";
        var request = new RefreshTokenRequest
        {
            Token = expiredToken,
            RefreshToken = "provided-refresh-token"
        };
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            RefreshToken = "different-stored-refresh-token",
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(2)
        };

        _jwtTokenGeneratorMock.Setup(x => x.GetUserIdFromExpiredToken(expiredToken))
            .Returns(userId);
        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.RefreshTokenAsync(request))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("Invalid or expired refresh token");

        _jwtTokenGeneratorMock.Verify(x => x.GetUserIdFromExpiredToken(expiredToken), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task RefreshTokenAsync_RefreshTokenExpired_ThrowsInvalidOperationException()
    {
        // Arrange
        var expiredToken = "expired-jwt-token";
        var tokenValue = "matching-refresh-token";
        var request = new RefreshTokenRequest
        {
            Token = expiredToken,
            RefreshToken = tokenValue
        };
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            RefreshToken = tokenValue,
            RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(-10) // Expired in the past
        };

        _jwtTokenGeneratorMock.Setup(x => x.GetUserIdFromExpiredToken(expiredToken))
            .Returns(userId);
        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.RefreshTokenAsync(request))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("Invalid or expired refresh token");

        _jwtTokenGeneratorMock.Verify(x => x.GetUserIdFromExpiredToken(expiredToken), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateToken(It.IsAny<User>()), Times.Never);
        _jwtTokenGeneratorMock.Verify(x => x.GenerateRefreshToken(), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    #endregion
}
