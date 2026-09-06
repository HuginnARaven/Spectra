using FluentAssertions;
using Moq;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Application.Services;
using Spectra.Domain.Entities;

namespace Spectra.Application.UnitTests.Services;

public class AccountServiceTests
{
    private readonly Mock<IEmailNotificationService> _emailNotificationServiceMock;
    private readonly Mock<IIdentityService> _identityServiceMock;

    private readonly AccountService _sut;

    public AccountServiceTests()
    {
        _emailNotificationServiceMock = new Mock<IEmailNotificationService>();
        _identityServiceMock = new Mock<IIdentityService>();

        _sut = new AccountService(
            _emailNotificationServiceMock.Object,
            _identityServiceMock.Object
        );
    }

    #region GetUserAsync Tests

    [Fact]
    public async Task GetUserAsync_ValidUserId_ReturnsProfileResponse()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "john.doe@example.com",
            UserName = "johndoe",
            DisplayName = "John Doe",
            EmailConfirmed = true,
            CreatedAt = new DateTime(2025, 1, 1, 12, 0, 0, DateTimeKind.Utc)
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.GetUserAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(userId);
        result.Email.Should().Be(user.Email);
        result.Username.Should().Be(user.UserName);
        result.DisplayName.Should().Be(user.DisplayName);
        result.EmailConfirmed.Should().Be(user.EmailConfirmed);
        result.CreatedAt.Should().Be(user.CreatedAt);

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetUserAsync_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.GetUserAsync(userId))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with id '{userId}' not found.");

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
    }

    #endregion

    #region EditUserAsync Tests

    [Fact]
    public async Task EditUserAsync_ValidRequest_EmailUnchanged_UpdatesUserAndPreservesEmailConfirmed()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "current@example.com",
            UserName = "oldusername",
            DisplayName = "Old Name",
            EmailConfirmed = true
        };

        var request = new ProfileRequest
        {
            Email = "current@example.com",
            Username = "newusername",
            DisplayName = "New Name"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByUsernameAsync(request.Username))
            .ReturnsAsync((User?)null);

        // Act
        await _sut.EditUserAsync(userId, request);

        // Assert
        user.EmailConfirmed.Should().BeTrue();
        user.DisplayName.Should().Be(request.DisplayName);
        user.UserName.Should().Be(request.Username);
        user.Email.Should().Be(request.Email);

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByUsernameAsync(request.Username), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(user), Times.Once);
    }

    [Fact]
    public async Task EditUserAsync_ValidRequest_EmailChanged_UpdatesUserAndResetsEmailConfirmed()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "old@example.com",
            UserName = "oldusername",
            DisplayName = "Old Name",
            EmailConfirmed = true
        };

        var request = new ProfileRequest
        {
            Email = "new@example.com",
            Username = "newusername",
            DisplayName = "New Name"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);
        _identityServiceMock.Setup(x => x.GetUserByUsernameAsync(request.Username))
            .ReturnsAsync((User?)null);

        // Act
        await _sut.EditUserAsync(userId, request);

        // Assert
        user.EmailConfirmed.Should().BeFalse();
        user.DisplayName.Should().Be(request.DisplayName);
        user.UserName.Should().Be(request.Username);
        user.Email.Should().Be(request.Email);

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByUsernameAsync(request.Username), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(user), Times.Once);
    }

    [Fact]
    public async Task EditUserAsync_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var request = new ProfileRequest
        {
            Email = "test@example.com",
            Username = "testuser",
            DisplayName = "Test"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.EditUserAsync(userId, request))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with id '{userId}' not found.");

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(It.IsAny<string>()), Times.Never);
        _identityServiceMock.Verify(x => x.GetUserByUsernameAsync(It.IsAny<string>()), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task EditUserAsync_EmailTakenByAnotherUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "current@example.com",
            UserName = "currentuser"
        };
        var anotherUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "taken@example.com"
        };

        var request = new ProfileRequest
        {
            Email = "taken@example.com",
            Username = "newusername",
            DisplayName = "New Name"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync(anotherUser);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.EditUserAsync(userId, request))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("User with this email already exists.");

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByUsernameAsync(It.IsAny<string>()), Times.Never);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task EditUserAsync_UsernameTakenByAnotherUser_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "user@example.com",
            UserName = "currentuser"
        };
        var anotherUser = new User
        {
            Id = Guid.NewGuid(),
            UserName = "takenusername"
        };

        var request = new ProfileRequest
        {
            Email = "user@example.com",
            Username = "takenusername",
            DisplayName = "New Name"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByUsernameAsync(request.Username))
            .ReturnsAsync(anotherUser);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.EditUserAsync(userId, request))
            .Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("User with this username already exists.");

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByUsernameAsync(request.Username), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task EditUserAsync_EmailAndUsernameMatchSameUser_AllowsUpdate()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "same@example.com",
            UserName = "samename",
            DisplayName = "Old Display Name",
            EmailConfirmed = true
        };

        var request = new ProfileRequest
        {
            Email = "same@example.com",
            Username = "samename",
            DisplayName = "New Display Name"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.GetUserByUsernameAsync(request.Username))
            .ReturnsAsync(user);

        // Act
        await _sut.EditUserAsync(userId, request);

        // Assert
        user.DisplayName.Should().Be(request.DisplayName);
        user.EmailConfirmed.Should().BeTrue();

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.GetUserByUsernameAsync(request.Username), Times.Once);
        _identityServiceMock.Verify(x => x.UpdateUserAsync(user), Times.Once);
    }

    #endregion

    #region ChangePasswordAsync Tests

    [Fact]
    public async Task ChangePasswordAsync_ValidRequest_CallsIdentityServiceChangePassword()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "user@example.com"
        };
        var request = new ChangePasswordRequest
        {
            CurrentPassword = "CurrentPassword123!",
            NewPassword = "NewPassword123!",
            ConfirmNewPassword = "NewPassword123!"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        await _sut.ChangePasswordAsync(userId, request);

        // Assert
        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword), Times.Once);
    }

    [Fact]
    public async Task ChangePasswordAsync_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var request = new ChangePasswordRequest
        {
            CurrentPassword = "CurrentPassword123!",
            NewPassword = "NewPassword123!",
            ConfirmNewPassword = "NewPassword123!"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.ChangePasswordAsync(userId, request))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with id '{userId}' not found.");

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.ChangePasswordAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    #endregion

    #region SetPasswordAsync Tests

    [Fact]
    public async Task SetPasswordAsync_ValidRequest_CallsIdentityServiceAddPassword()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "user@example.com"
        };
        var request = new SetPasswordRequest
        {
            Password = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        await _sut.SetPasswordAsync(userId, request);

        // Assert
        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.AddPasswordAsync(user, request.Password), Times.Once);
    }

    [Fact]
    public async Task SetPasswordAsync_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var request = new SetPasswordRequest
        {
            Password = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.SetPasswordAsync(userId, request))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with id '{userId}' not found.");

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.AddPasswordAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
    }

    #endregion

    #region ConfirmEmailAsync Tests

    [Fact]
    public async Task ConfirmEmailAsync_ValidRequest_EmailNotConfirmed_ConfirmsEmailAndReturnsSuccessMessage()
    {
        // Arrange
        var request = new ConfirmEmailRequest
        {
            Email = "unconfirmed@example.com",
            Token = "valid-email-token"
        };
        var user = new User
        {
            Email = request.Email,
            EmailConfirmed = false
        };

        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.ConfirmEmailAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Message.Should().Be("Your email has been confirmed.");

        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.ConfirmEmailAsync(user, request.Token), Times.Once);
    }

    [Fact]
    public async Task ConfirmEmailAsync_ValidRequest_EmailAlreadyConfirmed_ReturnsAlreadyConfirmedMessage()
    {
        // Arrange
        var request = new ConfirmEmailRequest
        {
            Email = "confirmed@example.com",
            Token = "any-token"
        };
        var user = new User
        {
            Email = request.Email,
            EmailConfirmed = true
        };

        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.ConfirmEmailAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Message.Should().Be("Your email already has been confirmed.");

        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.ConfirmEmailAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ConfirmEmailAsync_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var request = new ConfirmEmailRequest
        {
            Email = "missing@example.com",
            Token = "any-token"
        };

        _identityServiceMock.Setup(x => x.GetUserByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.ConfirmEmailAsync(request))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with email '{request.Email}' not found.");

        _identityServiceMock.Verify(x => x.GetUserByEmailAsync(request.Email), Times.Once);
        _identityServiceMock.Verify(x => x.ConfirmEmailAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
    }

    #endregion

    #region SendEmailVerificationLetterAsync Tests

    [Fact]
    public async Task SendEmailVerificationLetterAsync_ValidRequest_GeneratesTokenAndSendsEmail()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = new User
        {
            Id = Guid.Parse(userId),
            Email = "user@example.com"
        };
        var confirmationToken = "generated-confirmation-token";

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);
        _identityServiceMock.Setup(x => x.CreateEmailConfirmationTokenAsync(user))
            .ReturnsAsync(confirmationToken);

        // Act
        await _sut.SendEmailVerificationLetterAsync(userId);

        // Assert
        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.CreateEmailConfirmationTokenAsync(user), Times.Once);
        _emailNotificationServiceMock.Verify(x => x.SendVerificationEmailAsync(user.Email, confirmationToken, false), Times.Once);
    }

    [Fact]
    public async Task SendEmailVerificationLetterAsync_UserNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();

        _identityServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await FluentActions.Awaiting(() => _sut.SendEmailVerificationLetterAsync(userId))
            .Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage($"User with id '{userId}' not found.");

        _identityServiceMock.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _identityServiceMock.Verify(x => x.CreateEmailConfirmationTokenAsync(It.IsAny<User>()), Times.Never);
        _emailNotificationServiceMock.Verify(x => x.SendVerificationEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>()), Times.Never);
    }

    #endregion
}
