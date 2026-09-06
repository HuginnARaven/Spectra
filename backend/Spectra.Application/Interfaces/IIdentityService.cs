using Spectra.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Spectra.Domain.Entities;

namespace Spectra.Application.Interfaces
{
    public interface IIdentityService
    {
        Task<User?> GetUserWithCredentialsAsync(string email, string password);
        Task<User?> GetUserByIdAsync(string userId);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByUsernameAsync(string username);
        
        Task CreateUserAsync(User user, string password);
        Task UpdateUserAsync(User user);
        Task ChangePasswordAsync(User user, string currentPassword, string newPassword);
        Task AddPasswordAsync(User user, string password);
        
        Task<User> LoginWithExternalProviderAsync(string provider, string providerSubject, string email, string name);
        
        Task<string> CreateEmailConfirmationTokenAsync(User user);
        Task<string> CreatePasswordResetTokenAsync(User user);
        Task ConfirmEmailAsync(User user, string token);
        Task ResetPasswordAsync(User user, string token, string newPassword);
    }
}
