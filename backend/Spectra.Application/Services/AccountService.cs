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
        public async Task<ProfileRsponse> GetUserAsync(string userId)
        {
            var user = await accountRepository.getUserAsync(userId);
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
            var user = await accountRepository.getUserAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }

            user.DisplayName = request.DisplayName;

            await accountRepository.updateUserAsync(user);
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
    }
}
