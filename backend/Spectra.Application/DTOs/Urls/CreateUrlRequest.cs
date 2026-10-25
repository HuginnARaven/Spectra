namespace Spectra.Application.DTOs.Urls
{
    public class CreateUrlRequest
    {
        public string OriginalUrl { get; set; } = string.Empty;
        public string? CustomCode { get; set; }
    }
}
