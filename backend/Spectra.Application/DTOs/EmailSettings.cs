namespace Spectra.Application.DTOs;

public class EmailSettings
{
    public required string Username { get; set; }
    public required string Password { get; set; }
    public required string SmtpServer { get; set; }
    public required int Port { get; set; }
}