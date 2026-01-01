using Spectra.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces
{
    public interface IUrlShorteningService
    {
        Task<UrlResponse> ShortenUrlAsync(CreateUrlRequest request);
    }
}
