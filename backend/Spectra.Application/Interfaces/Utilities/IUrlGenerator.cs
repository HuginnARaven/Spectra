using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Interfaces.Utilities
{
    public interface IUrlGenerator
    {
        string GenerateUniqueCode(int length = 7);
    }
}
