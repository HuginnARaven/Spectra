using Spectra.Application.DTOs.Auth;

namespace Spectra.Application.Interfaces;

public interface IExternalAuthService
{
    public Task<GoogleAuthUserDataDto> GetGoogleUserDataByCodeAsync(string code);
}