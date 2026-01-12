using FluentValidation;
using Spectra.Application.DTOs;

namespace Spectra.Application.Validators
{
    public class CreateUrlRequestValidator : AbstractValidator<CreateUrlRequest>
    {
        public CreateUrlRequestValidator()
        {
            RuleFor(x => x.OriginalUrl)
                .NotEmpty().WithMessage("OriginalUrl is required")
                .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _)).WithMessage("OriginalUrl must be a valid, absolute URL (e.g., https://example.com).");
        }
    }
}