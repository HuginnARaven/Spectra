using FluentValidation;
using Spectra.Application.DTOs.SubscriptionPlans;

namespace Spectra.Application.Validators.SubscriptionPlans;

public class CreateSubscriptionPlanRequestValidator : AbstractValidator<CreateSubscriptionPlanRequest>
{
    public CreateSubscriptionPlanRequestValidator()
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
        
        When(x => x.IsDefault, () => 
        {
            RuleFor(x => x.Price)
                .Null().WithMessage("Can't create default subscription plan with price.");
                
            RuleFor(x => x.CurrencyCode)
                .Must(string.IsNullOrEmpty).WithMessage("Default plan cannot have a currency code.");
                
            RuleFor(x => x.Interval)
                .Must(string.IsNullOrEmpty).WithMessage("Default plan cannot have an interval.");
        });
        
        When(x => !x.IsDefault, () => 
        {
            RuleFor(x => x.Price)
                .NotNull().WithMessage("Can't create subscription plan without price data.")
                .GreaterThan(0).WithMessage("Price must be greater than 0.");
                
            RuleFor(x => x.CurrencyCode)
                .NotEmpty().WithMessage("Currency code is required for paid plans.");
                
            RuleFor(x => x.Interval)
                .NotEmpty().WithMessage("Interval is required for paid plans.");
        });
    }
}