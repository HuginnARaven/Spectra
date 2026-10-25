using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Spectra.Application.Interfaces.Utilities
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user, IList<string>? roles = null);
        string GenerateRefreshToken();
        string GetUserIdFromExpiredToken(string token);
    }
}
