namespace Spectra.Application.DTOs.Account;

public class ConfirmEmailRequest
{
    public required string Email { get; set; }
    public required string Token { get; set; }
}