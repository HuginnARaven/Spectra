using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;

namespace Spectra.Application.Services
{
    public class AccountService(IEmailNotificationService emailNotificationService, IIdentityService identityService) : IAccountService
    {
        public async Task<ProfileResponse> GetUserAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            };

            var response = new ProfileResponse()
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
            var user = await identityService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }
            var existingUser = await identityService.GetUserByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                throw new InvalidOperationException("User with this email already exists.");
            }
            existingUser = await identityService.GetUserByUsernameAsync(request.Username);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                throw new InvalidOperationException("User with this username already exists.");
            }
            
            if (request.Email != user.Email)
                user.EmailConfirmed = false;
            
            user.DisplayName = request.DisplayName;
            user.UserName = request.Username; 
            user.Email = request.Email;
            
            await identityService.UpdateUserAsync(user);
        }

        public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            } 
            
            await identityService.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        }

        public async Task SetPasswordAsync(string userId, SetPasswordRequest request)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            }

            await identityService.AddPasswordAsync(user, request.Password);
        }

        public async Task<ConfirmEmailResponse> ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken = default)
        {
            var user = await identityService.GetUserByEmailAsync(request.Email);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with email '{request.Email}' not found.");
            };

            if (user.EmailConfirmed)
            {
                return new ConfirmEmailResponse
                {
                    Message =  "Your email already has been confirmed.",
                };
            }
            
            await identityService.ConfirmEmailAsync(user, request.Token);
            
            return new ConfirmEmailResponse
            {
                Message =  "Your email has been confirmed.",
            };
        }

        public async Task SendEmailVerificationLetterAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            };
            
            var emailConfirmationToken = await identityService.CreateEmailConfirmationTokenAsync(user);
            
            await emailNotificationService.SendVerificationEmailAsync(user.Email, emailConfirmationToken, false);
        }
    }
}
