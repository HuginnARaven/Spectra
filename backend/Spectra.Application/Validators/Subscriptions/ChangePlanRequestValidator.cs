using FluentValidation;
using Spectra.Application.DTOs.Subscriptions;

namespace Spectra.Application.Validators.Subscriptions;

public class ChangePlanRequestValidator : AbstractValidator<ChangePlanRequest>
{
    public ChangePlanRequestValidator()
    {
        RuleFor(x => x.NewPriceId)
            .NotEmpty().WithMessage("The NewPrice id can't be empty");
    }
}