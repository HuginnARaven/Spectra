using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Enums
{
    public static class UserRoles
    {
        public const string Admin = "Admin";
    
        public static readonly IReadOnlyList<string> All = [Admin];
    }
}
