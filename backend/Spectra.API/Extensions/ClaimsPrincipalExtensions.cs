using System.Security.Claims;

namespace Spectra.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new KeyNotFoundException("Cannot retrive user Id form token");
        }
    }
}
