using FluentValidation;
using Spectra.Application.DTOs.Urls;

namespace Spectra.Application.Validators.Urls
{
    public class CreateUrlRequestValidator : AbstractValidator<CreateUrlRequest>
    {
        public CreateUrlRequestValidator()
        {
            RuleFor(x => x.OriginalUrl)
                .NotEmpty().WithMessage("OriginalUrl is required")
                .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _)).WithMessage("OriginalUrl must be a valid, absolute URL (e.g., https://example.com).");

            RuleFor(x => x.CustomCode)
                .Length(7).WithMessage("CustomCode should be 7 characters long")
                .Matches("^[a-zA-Z0-9]+$").WithMessage("CustomCode contains invalid characters.")
                .When(x => !string.IsNullOrEmpty(x.CustomCode));
        }
    }
}