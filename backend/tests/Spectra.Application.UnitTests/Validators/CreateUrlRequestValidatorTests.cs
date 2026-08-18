using FluentValidation.TestHelper;
using Spectra.Application.DTOs;
using Spectra.Application.Validators;

namespace Spectra.Application.UnitTests.Validators;

public class CreateUrlRequestValidatorTests
{
    private CreateUrlRequestValidator _validator;
    
    public CreateUrlRequestValidatorTests()
    {
        _validator = new CreateUrlRequestValidator();
    }
    
    [Fact]
    public void Should_have_error_when_OriginalUrl_is_null()
    {
        var model = new CreateUrlRequest { OriginalUrl = null };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.OriginalUrl);
    }
    
    [Fact]
    public void Should_have_error_when_OriginalUrl_is_not_a_valid_url()
    {
        var model = new CreateUrlRequest { OriginalUrl = "h/xunit.net/?tabs=cs" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.OriginalUrl);
    }

    [Fact]
    public void Should_not_have_error_when_OriginalUrl_is_valid()
    {
        var model = new CreateUrlRequest { OriginalUrl = "https://xunit.net/?tabs=cs" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.OriginalUrl);
    }
}