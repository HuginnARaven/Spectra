using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;

namespace Spectra.Infrastructure.Services;

public class EmailService(IOptions<EmailSettings> settings): IEmailService
{
    public async Task SenEmailAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("Spectra", settings.Value.Username));
        email.To.Add(new MailboxAddress("Customer", to));
        email.Subject = subject;
        email.Body = new TextPart("html") { Text = body };
        
        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(settings.Value.SmtpServer, settings.Value.Port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(settings.Value.Username, settings.Value.Password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}