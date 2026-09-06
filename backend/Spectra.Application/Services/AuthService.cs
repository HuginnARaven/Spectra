using System.Security.Claims;
using Microsoft.Extensions.Options;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;

namespace Spectra.Application.Services;

public class AuthService(IJwtTokenGenerator jwtTokenGenerator, IExternalAuthService externalAuthService, IIdentityService identityService, IEmailNotificationService emailNotificationService) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await identityService.GetUserWithCredentialsAsync(request.Email, request.Password);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }
        
        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginWithGoogleAsync(string code)
    {
        var userData = await externalAuthService.GetGoogleUserDataByCodeAsync(code);
        var user = await identityService.LoginWithExternalProviderAsync("Google", userData.Subject, userData.Email, userData.Name);
        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var newUser = new User
        {
            Email = request.Email,
            UserName = request.Username,
            DisplayName = request.Username,
            SecurityStamp = Guid.NewGuid().ToString()
        };
        
        await identityService.CreateUserAsync(newUser, request.Password);
        
        return await GenerateAuthResponseAsync(newUser);
    }

    public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var userId = jwtTokenGenerator.GetUserIdFromExpiredToken(request.Token);
        var user = await identityService.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with id '{userId}' not found.");
        };

        if (user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Invalid or expired refresh token");
        }

        var newAccessToken = jwtTokenGenerator.GenerateToken(user);
        var newRefreshToken = jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        await identityService.UpdateUserAsync(user);

        return new RefreshTokenResponse
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }
    
    public async Task SendPasswordResetEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await identityService.GetUserByEmailAsync(email);
        if (user == null)
        {
            return;
        };
            
        var passwordResetToken = await identityService.CreatePasswordResetTokenAsync(user);
        await emailNotificationService.SendPasswordResetEmailAsync(user.Email, passwordResetToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await identityService.GetUserByEmailAsync(request.Email);
        if (user == null)
        {
            return;
        };
        
        await identityService.ResetPasswordAsync(user, request.Token, request.NewPassword);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user)
    {
        var token = jwtTokenGenerator.GenerateToken(user);
        var refreshToken = jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await identityService.UpdateUserAsync(user);

        return new AuthResponse
        {
            User = new ProfileResponse()
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Username = user.UserName,
                DisplayName = user.DisplayName,
                EmailConfirmed =  user.EmailConfirmed,
                CreatedAt = user.CreatedAt
            },
            Token = token,
            RefreshToken = refreshToken
        };
    }
}