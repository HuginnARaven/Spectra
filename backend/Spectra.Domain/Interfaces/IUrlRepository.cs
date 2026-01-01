using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Domain.Interfaces
{
    public interface IUrlRepository
    {
        Task AddAsync(Url url);
        Task<Url?> GetByCodeAsync(string code);
        Task<bool> CodeExistsAsync(string code);
    }
}
