using Microsoft.AspNetCore.Identity;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Options;

namespace Spectra.Application.Services
{
    public class AccountService(IAccountRepository accountRepository, UserManager<User> userManager, IEmailService emailService, IOptions<FrontendSettings> frontendSettings) : IAccountService
    {
        public async Task<ProfileRsponse> GetUserAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await accountRepository.GetUserAsync(userId, cancellationToken);
            if (user == null) 
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }

            var response = new ProfileRsponse()
            {
                Id = userId,
                Email = user.Email,
                Username = user.UserName,
                DisplayName = user.DisplayName,
                EmailConfirmed =  user.EmailConfirmed,
                CreatedAt = user.CreatedAt,
            };

            return response;
        }

        public async Task EditUserAsync(string userId, ProfileRequest request)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                throw new InvalidOperationException("User with this email already exists.");
            }
            existingUser = await userManager.FindByNameAsync(request.Username);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                throw new InvalidOperationException("User with this username already exists.");
            }
            
            if (request.Email != user.Email)
                user.EmailConfirmed = false;
            
            user.DisplayName = request.DisplayName;
            user.UserName = request.Username; 
            user.Email = request.Email;
            
            var result = await userManager.UpdateAsync(user);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to update user: {errors}");
            }
        }

        public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }

            var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ArgumentException($"Password change failed: {errors}");
            }
            
            await emailService.SenEmailAsync(user.Email!, "Password change", "Your password has been changed.");
        }

        public async Task SetPasswordAsync(string userId, SetPasswordRequest request)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }

            var result = await userManager.AddPasswordAsync(user, request.Password);
    
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ArgumentException($"Password set failed: {errors}");
            }
        }

        public async Task<ConfirmEmailResponse> ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken = default)
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with email '{request.Email}' not found.");
            }

            if (user.EmailConfirmed)
            {
                return new ConfirmEmailResponse
                {
                    Message =  "Your email already has been confirmed.",
                };
            }
            
            var result = await userManager.ConfirmEmailAsync(user, request.Token);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to confirm email: {errors}");
            }
            
            return new ConfirmEmailResponse
            {
                Message =  "Your email has been confirmed.",
            };
        }

        public async Task SendEmailVerificationLetterAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }
            
            var emailConfirmationToken = Uri.EscapeDataString(await userManager.GenerateEmailConfirmationTokenAsync(user));
            await emailService.SenEmailAsync(user.Email, "Email verification at Spectra", $"Please confirm your email by clicking this link. {frontendSettings.Value.BaseUrl}/verify-email?token={emailConfirmationToken}&email={user.Email}");
        }
    }
}
