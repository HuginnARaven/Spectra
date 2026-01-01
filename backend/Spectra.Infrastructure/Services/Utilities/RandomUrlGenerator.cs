using Spectra.Application.Interfaces.Utilities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Infrastructure.Services.Utilities
{
    public class RandomUrlGenerator : IUrlGenerator
    {
        private const string Alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
        private readonly Random _random = new Random();

        public string GenerateUniqueCode(int length = 7)
        {
            var code = new StringBuilder(length);

            for (int i = 0; i < length; i++) {
                code.Append(Alphabet[_random.Next(Alphabet.Length)]);
            }

            return code.ToString();
        }
    }
}
