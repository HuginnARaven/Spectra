using AutoMapper;
using Spectra.Application.Common;
using Spectra.Application.DTOs.Account;
using Spectra.Application.DTOs.SubscriptionPlans;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Interfaces;

namespace Spectra.Application.Services
{
    public class AccountService(IEmailNotificationService emailNotificationService, IIdentityService identityService, IUserSubscriptionRepository userSubscriptionRepository, IMapper mapper, IPaymentService paymentService) : IAccountService
    {
        public async Task<ProfileResponse> GetUserProfileAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            };
            
            var userSubscription = await userSubscriptionRepository.GetEffectivePlanByUserIdAsync(userId);
            
            var response = new ProfileResponse()
            {
                Id = userId,
                Email = user.Email,
                Username = user.UserName,
                DisplayName = user.DisplayName,
                EmailConfirmed =  user.EmailConfirmed,
                CreatedAt = user.CreatedAt,
                SubscriptionPlan = new SubscriptionPlanBaseDto()
                {
                    Id = userSubscription.Id,
                    Name = userSubscription.Name,
                    Description =  userSubscription.Description,
                    IsDefault = userSubscription.IsDefault,
                    HasAccessToGeneralAnalytics = userSubscription.HasAccessToGeneralAnalytics,
                    HasAccessToUrlAnalytics = userSubscription.HasAccessToUrlAnalytics,
                    HasCustomAliasAccess = userSubscription.HasCustomAliasAccess,
                    HasEarlyFeatureAccess = userSubscription.HasEarlyFeatureAccess,
                    MaxUrlsLimit = userSubscription.MaxUrlsLimit,
                    AnalyticsRetentionDays = userSubscription.AnalyticsRetentionDays
                }
            };

            return response;
        }

        public async Task EditUserProfileAsync(string userId, ProfileRequest request)
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

        public async Task<PaginatedResult<UserAdminDto>> AdminGetUsersAsync(PaginationRequest request, CancellationToken cancellationToken = default)
        {
            var skip = (request.PageNumber - 1) * request.PageSize;

            var (users, totalCount) = await identityService.GetUsersAsync(skip, request.PageSize, cancellationToken: cancellationToken);

            var userDtos = mapper.Map<IReadOnlyList<UserAdminDto>>(users);

            return new PaginatedResult<UserAdminDto>(userDtos, totalCount, request.PageNumber, request.PageSize);
        }

        public async Task<UserAdminDto?> AdminGetUserByIdAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            
            var dto = mapper.Map<UserAdminDto>(user);
            dto.Roles = await identityService.GetUserRolesAsync(user);
            return dto;
        }

        public async Task<UserAdminDto> AdminEditUserAsync(UserAdminRequest request, string userId, CancellationToken cancellationToken = default)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            
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
            
            user.UserName = request.Username;
            user.DisplayName = request.DisplayName;
            user.Email = request.Email;
            user.EmailConfirmed = request.EmailConfirmed;
            
            await identityService.UpdateUserAsync(user);
            
            var dto = mapper.Map<UserAdminDto>(user);
            dto.Roles = await identityService.GetUserRolesAsync(user);
            return dto;
        }

        public async Task AdminDeleteUserAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await identityService.GetUserByIdAsync(userId);
            
            if (user == null)
                throw new KeyNotFoundException($"User with id '{userId}' not found.");
            
            var userSubscription = await userSubscriptionRepository.GetByUserIdAsync(userId);

            if (userSubscription != null)
            {
                await paymentService.CancelSubscriptionAsync(userSubscription.StripeSubscriptionId, atPeriodEnd: false);
                await userSubscriptionRepository.DeleteAsync(userSubscription);
            }
            
            await identityService.DeleteUserAsync(user);
        }
    }
}
