using FluentValidation.TestHelper;
using Spectra.Application.DTOs;
using Spectra.Application.Validators;

namespace Spectra.Application.UnitTests.Validators;

public class ChangePasswordRequestValidatorTests
{
    private ChangePasswordRequestValidator _validator;
    
    public ChangePasswordRequestValidatorTests()
    {
        _validator = new ChangePasswordRequestValidator();
    }
    
    [Fact]
    public void Should_have_error_when_CurrentPassword_is_empty()
    {
        var model = new ChangePasswordRequest { CurrentPassword = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.CurrentPassword);
    }

    [Fact]
    public void Should_not_have_error_when_CurrentPassword_is_provided()
    {
        var model = new ChangePasswordRequest { CurrentPassword = "OldPassword123!" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.CurrentPassword);
    }

    [Fact]
    public void Should_have_error_when_NewPassword_is_empty()
    {
        var model = new ChangePasswordRequest { NewPassword = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Should_have_error_when_NewPassword_is_too_short()
    {
        var model = new ChangePasswordRequest { NewPassword = "short" }; // 5 chars
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Should_not_have_error_when_NewPassword_is_valid()
    {
        var model = new ChangePasswordRequest { NewPassword = "ValidPassword1!" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.NewPassword);
    }

    [Fact]
    public void Should_have_error_when_ConfirmNewPassword_does_not_match()
    {
        var model = new ChangePasswordRequest 
        { 
            NewPassword = "ValidPassword1!", 
            ConfirmNewPassword = "DifferentPassword2!" 
        };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.ConfirmNewPassword);
    }

    [Fact]
    public void Should_not_have_error_when_ConfirmNewPassword_matches()
    {
        var model = new ChangePasswordRequest 
        { 
            NewPassword = "ValidPassword1!", 
            ConfirmNewPassword = "ValidPassword1!" 
        };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.ConfirmNewPassword);
    }
}
