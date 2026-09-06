using System.Reflection;
using Microsoft.Extensions.Options;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;

namespace Spectra.Application.Services.Utilities;

public class EmailNotificationService(IEmailService emailService, IOptions<FrontendSettings> frontendSettings) : IEmailNotificationService
{
    public async Task SendVerificationEmailAsync(string email, string token, bool isWelcomeEmail = false)
    {
        var encodedToken = Uri.EscapeDataString(token);
        var url = $"{frontendSettings.Value.BaseUrl}/verify-email?token={encodedToken}&email={email}";
        
        // var templateName = isWelcomeEmail ? "Welcome.html" : "VerifyEmail.html";
        var templateName = "EmailVerification.html";
        var htmlBody = GetTemplate(templateName);
        htmlBody = htmlBody.Replace("{{ActionUrl}}", url);
            
        var subject = isWelcomeEmail ? "Welcome to Spectra!" : "Email verification at Spectra";
        
        await emailService.SenEmailAsync(email, subject, htmlBody);
    }

    public async Task SendPasswordResetEmailAsync(string email, string token)
    {
        var encodedToken = Uri.EscapeDataString(token);
        var url = $"{frontendSettings.Value.BaseUrl}/forgot-password?token={encodedToken}&email={email}";
        
        var templateName = "PasswordReset.html";
        var htmlBody = GetTemplate(templateName);
        htmlBody = htmlBody.Replace("{{ActionUrl}}", url);
        
        var subject = "Password reset at Spectra";
        
        await emailService.SenEmailAsync(email, subject, htmlBody);
    }


    private string GetTemplate(string templateName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = $"Spectra.Application.Services.Utilities.EmailTemplates.{templateName}";

        using Stream? stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            throw new FileNotFoundException($"Email template '{resourceName}' not found.");
        }

        using StreamReader reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}