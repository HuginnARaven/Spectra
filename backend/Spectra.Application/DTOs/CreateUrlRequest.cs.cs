using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Spectra.Application.DTOs
{
    public class CreateUrlRequest
    {
        public string OriginalUrl { get; set; } = string.Empty;
    }
}
