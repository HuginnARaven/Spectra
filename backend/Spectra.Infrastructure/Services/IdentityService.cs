using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;
using Spectra.Application.DTOs.Account;
using Spectra.Domain.Enums;
using Spectra.Infrastructure.Data;

namespace Spectra.Infrastructure.Services
{
    public class IdentityService(UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager, IUrlGenerator urlGenerator, AppDbContext context) : IIdentityService
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
        
        public async Task<IList<string>> GetUserRolesAsync(User user)
        {
            return await userManager.GetRolesAsync(user);
        }

        public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetUsersAsync(AdminPaginatedUsersQuery request, CancellationToken cancellationToken = default)
        {
            var query = userManager.Users
                .AsNoTracking()
;

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var searchTerm = request.Search.Trim();
                query = query.Where(u =>
                    EF.Functions.ToTsVector("english", (u.UserName ?? "") + " " + (u.DisplayName ?? "") + " " + (u.Email ?? ""))
                        .Matches(EF.Functions.PlainToTsQuery("english", searchTerm)));
            }

            if (!string.IsNullOrWhiteSpace(request.PlanId) && !string.Equals(request.PlanId, "all", StringComparison.OrdinalIgnoreCase))
            {
                if (Guid.TryParse(request.PlanId.Trim(), out var planGuid))
                {
                    var defaultPlan = await context.SubscriptionPlans
                        .AsNoTracking()
                        .FirstOrDefaultAsync(sp => sp.IsDefault, cancellationToken);

                    if (defaultPlan != null && planGuid == defaultPlan.Id)
                    {
                        query = query.Where(u =>
                            u.Subscription == null ||
                            u.Subscription.SubscriptionPlanId == defaultPlan.Id);
                    }
                    else
                    {
                        query = query.Where(u =>
                            u.Subscription != null &&
                            u.Subscription.SubscriptionPlanId == planGuid);
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Status) && !string.Equals(request.Status, "all", StringComparison.OrdinalIgnoreCase))
            {
                if (Enum.TryParse<SubscriptionStatus>(request.Status.Trim(), true, out var statusEnum))
                {
                    query = query.Where(u => u.Subscription != null && u.Subscription.Status == statusEnum);
                }
            }

            // TODO: Role filter will be implemented later when navigation property for roles is added to User entity.

            var isDesc = request.SortingDesc ?? true;
            query = (request.SortingCol?.ToLower()) switch
            {
                "user" or "username" => isDesc ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName),
                "displayname" => isDesc ? query.OrderByDescending(u => u.DisplayName) : query.OrderBy(u => u.DisplayName),
                "email" => isDesc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                "emailconfirmed" => isDesc ? query.OrderByDescending(u => u.EmailConfirmed) : query.OrderBy(u => u.EmailConfirmed),
                "joineddate" or "createdat" => isDesc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
                "lastactive" => isDesc ? query.OrderByDescending(u => u.LastActive) : query.OrderBy(u => u.LastActive),
                "refreshtokenexpirytime" => isDesc ? query.OrderByDescending(u => u.RefreshTokenExpiryTime) : query.OrderBy(u => u.RefreshTokenExpiryTime),
                _ => isDesc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt)
            };

            var totalCount = await query.CountAsync(cancellationToken);

            var skip = (request.PageNumber - 1) * request.PageSize;

            var items = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
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

        public async Task DeleteUserAsync(User user)
        {
            var result = await userManager.DeleteAsync(user);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to delete user: {errors}");
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

        public async Task<IList<RoleDto>> GetExistingRolesAsync(CancellationToken cancellationToken = default)
        {
            return await roleManager.Roles
                .Select(r => new RoleDto
                {
                    Id = r.Id.ToString(),
                    Name = r.Name ?? string.Empty
                })
                .ToListAsync(cancellationToken);
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
