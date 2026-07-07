using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.DTOs
{
    public class AuthResponse
    {
        public ProfileRsponse User { get; set; } = new ProfileRsponse();
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
