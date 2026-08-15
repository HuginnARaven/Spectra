using Spectra.Application.DTOs;

namespace Spectra.Application.Interfaces;

public interface IExternalAuthService
{
    public Task<GoogleAuthUserDataDto> GetGoogleUserDataByCodeAsync(string code);
}