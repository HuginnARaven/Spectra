using System.Net;
using Bogus;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;

namespace Spectra.DataSeeder.Fakers;

public sealed record CountryIpRange(string Country, string Cidr);

public sealed class UrlVisitFaker: Faker<UrlVisit>
{
    private static readonly List<string> PupularCidrs =
    [
         "8.8.8.0/24",         // Google / US
         "51.15.0.0/16",       // Scaleway / France
         "85.214.0.0/16",      // Strato / Germany
         "93.32.0.0/14",       // Fastweb / Italy
         "81.2.69.142/28",     // Andrews & Arnold (used in MaxMind test DBs) / United Kingdom
         "91.196.0.0/16"       // Kyivstar / Ukraine
    ];
    
    public UrlVisitFaker(
        List<Url> urls, 
        IUserAgentParser agentParser,
        IGeoLocationService geoLocationService,
        int lastDays = -14) : base("en")
    {
        RuleFor(uv => uv.Referrer, f => f.Internet.DomainName());
        RuleFor(uv => uv.UrlId, f => f.PickRandom(urls).Id);
        RuleFor(uv => uv.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddDays(lastDays), DateTime.UtcNow));
        
        RuleFor(uv => uv.IpAddress, f =>
        {
            bool isPopular = f.Random.Bool(weight: 0.8f);
        
            if (isPopular)
            {
                var cidr = f.PickRandom(PupularCidrs);
                return GenerateIpFromCidr(f, cidr);
            }
        
            return f.Internet.Ip();
        });
        
        RuleFor(uv => uv.UserAgent, f => f.Internet.UserAgent());
        
        FinishWith((f, uv) =>
        {
            // IP parsing
            var geoInfo = geoLocationService.GetLocation(uv.IpAddress);
            uv.Country = geoInfo.Country != "Unknown" ? geoInfo.Country : f.Address.Country();
            uv.City = geoInfo.City != "Unknown" ? geoInfo.City : f.Address.City();

            // UserAgent parsing
            var userAgentInfo = agentParser.Parse(uv.UserAgent);
            uv.Browser = userAgentInfo.Browser;
            uv.DeviceType = userAgentInfo.Device;
        });
    }
    
    private static string GenerateIpFromCidr(Faker f, string cidr)
    {
        var parts = cidr.Split('/');
        var baseIpBytes = IPAddress.Parse(parts[0]).GetAddressBytes();
        int prefixLength = int.Parse(parts[1]);

        uint baseIp = ((uint)baseIpBytes[0] << 24)
                      | ((uint)baseIpBytes[1] << 16)
                      | ((uint)baseIpBytes[2] << 8)
                      | baseIpBytes[3];

        int hostBits = 32 - prefixLength;
        uint mask = hostBits == 32 ? 0 : uint.MaxValue << hostBits;
        uint network = baseIp & mask;
        
        uint maxHost = (1u << hostBits) - 2;
        uint randomHost = maxHost > 0 ? f.Random.UInt(1, maxHost) : 1;
        uint finalIp = network | randomHost;

        return new IPAddress(
        [
            (byte)(finalIp >> 24),
            (byte)(finalIp >> 16),
            (byte)(finalIp >> 8),
            (byte)finalIp
        ]).ToString();
    }
}