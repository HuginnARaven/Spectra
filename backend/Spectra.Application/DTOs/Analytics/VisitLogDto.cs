namespace Spectra.Application.DTOs.Analytics
{
    public record VisitLogDto(
            string ShortCode,
            string IpAddress,
            string? UserAgent,
            string? Referer
        );
}
