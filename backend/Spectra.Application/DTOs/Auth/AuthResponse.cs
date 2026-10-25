using Spectra.Application.DTOs.Account;

namespace Spectra.Application.DTOs.Auth
{
    public class AuthResponse
    {
        public ProfileResponse User { get; set; } = new ProfileResponse();
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
