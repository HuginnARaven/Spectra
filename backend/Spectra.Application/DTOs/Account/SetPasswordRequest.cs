namespace Spectra.Application.DTOs.Account;

public class SetPasswordRequest
{
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}