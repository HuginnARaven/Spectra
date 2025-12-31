using Spectra.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Entities
{
    public class Url : BaseEntity
    {
        public string OriginalUrl { get; set; } = string.Empty;
        public string ShortCode { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public ICollection<UrlVisit> Visits { get; set; } = new List<UrlVisit>();
    }
}
