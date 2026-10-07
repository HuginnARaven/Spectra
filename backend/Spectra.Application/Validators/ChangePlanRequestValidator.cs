using FluentValidation;
using Spectra.Application.DTOs;

namespace Spectra.Application.Validators;

public class ChangePlanRequestValidator : AbstractValidator<ChangePlanRequest>
{
    public ChangePlanRequestValidator()
    {
        RuleFor(x => x.NewPriceId)
            .NotEmpty().WithMessage("The NewPrice id can't be empty");
    }
}