using Spectra.Domain.Common;
using Spectra.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string? DisplayName { get; set; }

        public bool IsActive { get; set; } = true;
        public UserRole Role { get; set; } = UserRole.User;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;

        public ICollection<Url> Urls { get; set; } = new List<Url>();
    }
}
