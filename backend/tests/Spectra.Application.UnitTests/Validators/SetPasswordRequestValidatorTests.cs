using FluentValidation.TestHelper;
using Spectra.Application.DTOs;
using Spectra.Application.Validators;

namespace Spectra.Application.UnitTests.Validators;

public class SetPasswordRequestValidatorTests
{
    private SetPasswordRequestValidator _validator;
    
    public SetPasswordRequestValidatorTests()
    {
        _validator = new SetPasswordRequestValidator();
    }
    
    [Fact]
    public void Should_have_error_when_Password_is_empty()
    {
        var model = new SetPasswordRequest { Password = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_have_error_when_Password_is_too_short()
    {
        var model = new SetPasswordRequest { Password = "short" }; // 5 chars
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_not_have_error_when_Password_is_valid()
    {
        var model = new SetPasswordRequest { Password = "ValidPassword1!" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_have_error_when_ConfirmPassword_does_not_match()
    {
        var model = new SetPasswordRequest 
        { 
            Password = "ValidPassword1!", 
            ConfirmPassword = "DifferentPassword2!" 
        };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.ConfirmPassword);
    }

    [Fact]
    public void Should_not_have_error_when_ConfirmPassword_matches()
    {
        var model = new SetPasswordRequest 
        { 
            Password = "ValidPassword1!", 
            ConfirmPassword = "ValidPassword1!" 
        };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.ConfirmPassword);
    }
}
