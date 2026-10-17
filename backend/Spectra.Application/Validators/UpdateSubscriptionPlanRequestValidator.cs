using FluentValidation;
using Spectra.Application.DTOs;

namespace Spectra.Application.Validators;

public class UpdateSubscriptionPlanRequestValidator : AbstractValidator<UpdateSubscriptionPlanRequest>
{
    public UpdateSubscriptionPlanRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.");
            
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.");
        
        RuleFor(x => x.MaxUrlsLimit)
            .NotNull().WithMessage("MaxUrlsLimit is required.")
            .GreaterThanOrEqualTo(-1).WithMessage("MaxUrlsLimit must be greater than or equal to -1.");
        
        RuleFor(x => x.AnalyticsRetentionDays)
            .NotNull().WithMessage("AnalyticsRetentionDays is required.")
            .GreaterThanOrEqualTo(0).WithMessage("AnalyticsRetentionDays must be greater than or equal to 0.");
    }
}