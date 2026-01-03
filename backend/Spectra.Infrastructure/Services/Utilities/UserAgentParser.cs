using Spectra.Application.Interfaces.Utilities;
using ClientInfo = Spectra.Application.Interfaces.Utilities.ClientInfo;
using UAParser;

namespace Spectra.Infrastructure.Services.Utilities
{
    public class UserAgentParser : IUserAgentParser
    {
        private readonly Parser _parser;

        public UserAgentParser()
        {
            _parser = Parser.GetDefault();
        }

        public ClientInfo Parse(string userAgentString)
        {
            if (string.IsNullOrWhiteSpace(userAgentString))
                return new ClientInfo("Unknown", "Unknown", "Unknown");

            var client = _parser.Parse(userAgentString);

            var browser = client.UA.Family;
            var os = client.OS.Family;
            var device = client.Device.Family;

            if (device == "Other" && (os.Contains("Windows") || os.Contains("Mac") || os.Contains("Linux")))
            {
                device = "Desktop";
            }

            return new ClientInfo(browser, device, os);
        }
    }
}
