using Microsoft.AspNetCore.Identity;
using Spectra.Domain.Common;
using Spectra.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string? DisplayName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

        public ICollection<Url> Urls { get; set; } = new List<Url>();
    }
}
