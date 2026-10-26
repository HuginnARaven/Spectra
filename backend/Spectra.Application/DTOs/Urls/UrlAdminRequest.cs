namespace Spectra.Application.DTOs.Urls;

public class UrlAdminRequest
{
    public string OriginalUrl { get; set; } = string.Empty;
    public string ShortCode { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
}