using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.DTOs
{
    public class ProfileRequest
    {
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
