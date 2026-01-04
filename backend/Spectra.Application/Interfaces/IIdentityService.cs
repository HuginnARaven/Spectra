using Spectra.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces
{
    public interface IIdentityService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    }
}
