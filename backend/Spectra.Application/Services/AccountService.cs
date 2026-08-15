using Microsoft.AspNetCore.Identity;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Domain.Entities;
using Spectra.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Spectra.Application.Services
{
    public class AccountService(IAccountRepository accountRepository, UserManager<User> userManager) : IAccountService
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
    }
}
