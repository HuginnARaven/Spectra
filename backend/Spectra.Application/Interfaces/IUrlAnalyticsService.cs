using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces
{
    public interface IUrlAnalyticsService
    {
        Task LogVisitAsync(string shortCode, string ipAddress, string? userAgent, string? referer);
    }
}
