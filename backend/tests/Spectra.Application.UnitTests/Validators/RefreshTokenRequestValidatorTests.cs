using FluentValidation.TestHelper;
using Spectra.Application.DTOs;
using Spectra.Application.Validators;

namespace Spectra.Application.UnitTests.Validators;

public class RefreshTokenRequestValidatorTests
{
    private RefreshTokenRequestValidator _validator;
    
    public RefreshTokenRequestValidatorTests()
    {
        _validator = new RefreshTokenRequestValidator();
    }
    
    [Fact]
    public void Should_have_error_when_Token_is_empty()
    {
        var model = new RefreshTokenRequest { Token = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Token);
    }

    [Fact]
    public void Should_not_have_error_when_Token_is_provided()
    {
        var model = new RefreshTokenRequest { Token = "some_valid_jwt_token" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Token);
    }

    [Fact]
    public void Should_have_error_when_RefreshToken_is_empty()
    {
        var model = new RefreshTokenRequest { RefreshToken = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.RefreshToken);
    }

    [Fact]
    public void Should_not_have_error_when_RefreshToken_is_provided()
    {
        var model = new RefreshTokenRequest { RefreshToken = "some_valid_refresh_token" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.RefreshToken);
    }
}
