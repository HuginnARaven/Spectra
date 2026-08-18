using FluentValidation.TestHelper;
using Spectra.Application.DTOs;
using Spectra.Application.Validators;

namespace Spectra.Application.UnitTests.Validators;

public class LoginRequestValidatorTests
{
    private LoginRequestValidator _validator;
    
    public LoginRequestValidatorTests()
    {
        _validator = new LoginRequestValidator();
    }
    
    [Fact]
    public void Should_have_error_when_Email_is_empty()
    {
        var model = new LoginRequest { Email = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }
    
    [Fact]
    public void Should_have_error_when_Email_is_invalid()
    {
        var model = new LoginRequest { Email = "invalid_email" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_not_have_error_when_Email_is_valid()
    {
        var model = new LoginRequest { Email = "test@example.com" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_have_error_when_Password_is_empty()
    {
        var model = new LoginRequest { Password = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_not_have_error_when_Password_is_provided()
    {
        var model = new LoginRequest { Password = "SecurePassword123!" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Password);
    }
}
