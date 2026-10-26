namespace Spectra.Application.DTOs.Urls;

public class UrlAdminDto
{
    public string Id { get; set; } = string.Empty;
    public string OriginalUrl { get; set; } = string.Empty;
    public string ShortCode { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}