using FluentValidation;
using Spectra.Application.DTOs;

namespace Spectra.Application.Validators;

public class CheckoutRequestValidator : AbstractValidator<CheckoutRequest>
{
    public CheckoutRequestValidator()
    {
        RuleFor(x => x.PriceId)
            .NotEmpty().WithMessage("The PriceId can't be empty");
    }
}