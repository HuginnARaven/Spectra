using Spectra.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Entities
{
    public class UrlVisit : BaseEntity
    {
        public string IpAddress { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string? City { get; set; }

        public string? UserAgent { get; set; }
        public string? Browser { get; set; }
        public string? DeviceType { get; set; }
        public string? Referrer { get; set; }

        public Guid UrlId { get; set; }
        public Url? Url { get; set; }
    }
}
