using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.DTOs
{
    public class AuthResponse
    {
        public ProfileResponse User { get; set; } = new ProfileResponse();
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
