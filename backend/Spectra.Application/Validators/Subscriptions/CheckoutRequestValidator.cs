using FluentValidation;
using Spectra.Application.DTOs.Subscriptions;

namespace Spectra.Application.Validators.Subscriptions;

public class CheckoutRequestValidator : AbstractValidator<CheckoutRequest>
{
    public CheckoutRequestValidator()
    {
        RuleFor(x => x.PriceId)
            .NotEmpty().WithMessage("The PriceId can't be empty");
    }
}