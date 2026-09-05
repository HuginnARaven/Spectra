namespace Spectra.Application.Interfaces;

public interface IEmailService
{
    public Task SenEmailAsync(string to, string subject, string body);
}