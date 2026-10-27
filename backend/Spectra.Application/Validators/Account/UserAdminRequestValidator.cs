using FluentValidation;
using Spectra.Application.DTOs.Account;

namespace Spectra.Application.Validators.Account;

public class UserAdminRequestValidator : AbstractValidator<UserAdminRequest>
{
    public UserAdminRequestValidator()
    {
        RuleFor(r => r.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");
        
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required");
        
        RuleFor(x => x.DisplayName)
            .NotEmpty().WithMessage("DisplayName is required");
    }
}