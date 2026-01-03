using MaxMind.GeoIP2;
using MaxMind.GeoIP2.Exceptions;
using Spectra.Application.Interfaces.Utilities;
using System.Net;


namespace Spectra.Infrastructure.Services.Utilities
{
    public class GeoLocationService : IGeoLocationService
    {
        private readonly DatabaseReader? _reader;

        public GeoLocationService()
        {
            var dbPath = Path.Combine(AppContext.BaseDirectory, "Assets", "GeoLite2-City.mmdb");

            if (File.Exists(dbPath))
            {
                _reader = new DatabaseReader(dbPath);
            }
        }

        public GeoLocationInfo GetLocation(string ipAddress)
        {
            var unknown = new GeoLocationInfo("Unknown", "Unknown");

            if (_reader == null || string.IsNullOrWhiteSpace(ipAddress) || ipAddress == "Unknown")
                return unknown;

            if (!IPAddress.TryParse(ipAddress, out var ip)) // !!! if ipAddress is valid writing it to variable ip
                return unknown;

            if (IsLocalIp(ip))
                IPAddress.TryParse("8.8.8.8", out ip);

            try
            {
                var response = _reader.City(ip!);

                return new GeoLocationInfo(
                    Country: response.Country.Name ?? "Unknown",
                    City: response.City.Name ?? "Unknown"
                );
            }
            catch (AddressNotFoundException)
            {
                return unknown;
            }
            catch (GeoIP2Exception)
            {
                return unknown;
            }
        }

        private bool IsLocalIp(IPAddress ip)
        {
            if (IPAddress.IsLoopback(ip)) return true;

            byte[] bytes = ip.GetAddressBytes();

            if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
            {
                if (bytes[0] == 10) return true;
                if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;
                if (bytes[0] == 192 && bytes[1] == 168) return true;
            }
            return false;
        }
    }
}
