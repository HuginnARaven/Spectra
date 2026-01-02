using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces
{
    public interface IUrlCacheService
    {
        Task<string?> GetOriginalUrlAsync(string shortCode);
        Task SetUrlAsync(string shortCode, string originalUrl);
        Task RemoveUrlAsync(string shortCode);
    }
}
