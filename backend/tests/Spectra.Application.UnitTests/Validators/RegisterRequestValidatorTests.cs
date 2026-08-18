using FluentValidation.TestHelper;
using Spectra.Application.DTOs;
using Spectra.Application.Validators;

namespace Spectra.Application.UnitTests.Validators;

public class RegisterRequestValidatorTests
{
    private RegisterRequestValidator _validator;
    
    public RegisterRequestValidatorTests()
    {
        _validator = new RegisterRequestValidator();
    }
    
    [Fact]
    public void Should_have_error_when_Email_is_empty()
    {
        var model = new RegisterRequest { Email = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }
    
    [Fact]
    public void Should_have_error_when_Email_is_invalid()
    {
        var model = new RegisterRequest { Email = "invalid_email" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_not_have_error_when_Email_is_valid()
    {
        var model = new RegisterRequest { Email = "test@example.com" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_have_error_when_Username_is_empty()
    {
        var model = new RegisterRequest { Username = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_have_error_when_Username_is_too_short()
    {
        var model = new RegisterRequest { Username = "ab" }; // 2 chars
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_not_have_error_when_Username_is_valid()
    {
        var model = new RegisterRequest { Username = "validUser" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_have_error_when_Password_is_empty()
    {
        var model = new RegisterRequest { Password = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_have_error_when_Password_is_too_short()
    {
        var model = new RegisterRequest { Password = "short" }; // 5 chars
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_not_have_error_when_Password_is_valid()
    {
        var model = new RegisterRequest { Password = "ValidPassword1!" };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Password);
    }
}
