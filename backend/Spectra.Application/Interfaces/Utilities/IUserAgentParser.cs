using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces.Utilities
{
    public record ClientInfo(string Browser, string Device, string Os);

    public interface IUserAgentParser
    {
        ClientInfo Parse(string userAgentString);
    }
}
