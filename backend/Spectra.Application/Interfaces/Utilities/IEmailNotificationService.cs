using Spectra.Domain.Entities;

namespace Spectra.Application.Interfaces.Utilities;

public interface IEmailNotificationService
{
    Task SendVerificationEmailAsync(string email, string token, bool isWelcomeEmail = false);
    Task SendPasswordResetEmailAsync(string email, string token);
}