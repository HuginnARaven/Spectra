using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.DTOs
{
    public record VisitLogDto(
            string ShortCode,
            string IpAddress,
            string? UserAgent,
            string? Referer
        );
}
