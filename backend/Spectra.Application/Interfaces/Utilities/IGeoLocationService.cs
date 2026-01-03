using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces.Utilities
{
    public record GeoLocationInfo(string Country, string City);

    public interface IGeoLocationService
    {
        GeoLocationInfo GetLocation(string ipAddress);
    }
}
