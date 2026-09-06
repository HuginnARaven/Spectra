using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> LoginWithGoogleAsync(string code);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task SendPasswordResetEmailAsync(string email, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
}