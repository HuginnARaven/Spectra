using System.Net.Http.Json;
using System.Text.Json;
using Google.Apis.Auth;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Microsoft.Extensions.Options;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Domain.Exceptions;

namespace Spectra.Infrastructure.Services;

public class ExternalAuthService(IOptions<GoogleAuthSettings> googleAuthSettings, IHttpClientFactory httpClientFactory): IExternalAuthService
{
    public async Task<GoogleAuthUserDataDto> GetGoogleUserDataByCodeAsync(string code)
    {
        var httpClient = httpClientFactory.CreateClient();;
        var payload = new
        {
            client_id = googleAuthSettings.Value.ClientId,
            client_secret = googleAuthSettings.Value.ClientSecret,
            code = code,
            grant_type="authorization_code",
            redirect_uri = "postmessage",
        };
        var response = await httpClient.PostAsJsonAsync("https://oauth2.googleapis.com/token", payload);

        if (!response.IsSuccessStatusCode)
        {
            throw new ExternalServiceException("Google Auth", (int)response.StatusCode, "Google Auth failed", await response.Content.ReadAsStringAsync());
        }
        
        var jsonResponse = JsonSerializer.Deserialize<GoogleOAuth2TokenResponse>(await response.Content.ReadAsStringAsync());
        var validateResponse = await GoogleJsonWebSignature.ValidateAsync(jsonResponse!.IdToken);
        
        return new GoogleAuthUserDataDto
        {
            Name = validateResponse.Name,
            Email = validateResponse.Email,
            PictureUrl = validateResponse.Picture,
            Subject = validateResponse.Subject
        };
    }
}