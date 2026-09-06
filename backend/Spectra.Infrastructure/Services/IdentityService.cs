using Microsoft.AspNetCore.Identity;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;

namespace Spectra.Infrastructure.Services
{
    public class IdentityService(UserManager<User> userManager, IUrlGenerator urlGenerator) : IIdentityService
    {
        public async Task<User?> GetUserWithCredentialsAsync(string email, string password)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return null;
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, password);
            if (!isPasswordValid)
            {
                return null;
            }

            return user;
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await userManager.FindByIdAsync(userId);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await userManager.FindByEmailAsync(email);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await userManager.FindByNameAsync(username);
        }

        public async Task UpdateUserAsync(User user)
        {
            var result = await userManager.UpdateAsync(user);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to update user: {errors}");
            }
        }

        public async Task ChangePasswordAsync(User user, string currentPassword, string newPassword)
        {
            var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ArgumentException($"Password change failed: {errors}");
            }
        }

        public async Task AddPasswordAsync(User user, string password)
        {
            var result = await userManager.AddPasswordAsync(user, password);
    
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ArgumentException($"Password set failed: {errors}");
            }
        }

        public async Task<User> LoginWithExternalProviderAsync(string provider, string providerSubject, string email, string name)
        {
            var user = await userManager.FindByLoginAsync(provider, providerSubject);
            if (user == null)
            {
                user = await userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = email,
                        UserName = $"{name.Replace(" ", "_")}_{urlGenerator.GenerateUniqueCode()}",
                        DisplayName = name,
                        SecurityStamp = Guid.NewGuid().ToString(),
                        EmailConfirmed = true
                    };
                    
                    var result = await userManager.CreateAsync(user);

                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        throw new ArgumentException($"{errors}");
                    }
                }
                await userManager.AddLoginAsync(user, new UserLoginInfo(provider, providerSubject, provider));
            }

            return user;
        }

        public async Task<string> CreateEmailConfirmationTokenAsync(User user)
        {
            if (string.IsNullOrEmpty(user.Email))
            {
                throw new KeyNotFoundException("User must have an email.");
            }
            
            return await userManager.GenerateEmailConfirmationTokenAsync(user);
        }

        public async Task<string> CreatePasswordResetTokenAsync(User user)
        {
            return await userManager.GeneratePasswordResetTokenAsync(user);
        }

        public async Task ConfirmEmailAsync(User user, string token)
        {
            var result = await userManager.ConfirmEmailAsync(user, token);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to confirm email: {errors}");
            }
        }

        public async Task ResetPasswordAsync(User user, string token, string newPassword)
        {
            var result = await userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to reset password: {errors}");
            }
        }

        public async Task CreateUserAsync(User user, string password)
        {
            var result = await userManager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ArgumentException($"User creation failed {errors}");
            }
        }
    }
}
