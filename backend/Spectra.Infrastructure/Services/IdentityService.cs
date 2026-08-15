using Microsoft.AspNetCore.Identity;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Spectra.Infrastructure.Services
{
    public class IdentityService(UserManager<User> userManager, IJwtTokenGenerator jwtTokenGenerator, IExternalAuthService externalAuthService, IUrlGenerator urlGenerator) : IIdentityService
    {
        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }

            var token = jwtTokenGenerator.GenerateToken(user);
            var refreshToken = jwtTokenGenerator.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await userManager.UpdateAsync(user);

            return new AuthResponse
            {
                User = new ProfileRsponse()
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    Username = user.UserName,
                    DisplayName = user.DisplayName,
                    CreatedAt = user.CreatedAt
                },
                Token = token,
                RefreshToken = refreshToken
            };
        }

        public async Task<AuthResponse> LoginWithGoogleAsync(string code)
        {
            var userData = await externalAuthService.GetGoogleUserDataByCodeAsync(code);
            var user = await userManager.FindByLoginAsync("Google", userData.Subject);
            if (user == null)
            {
                user = await userManager.FindByEmailAsync(userData.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Email = userData.Email,
                        UserName = $"{userData.Name.Replace(" ", "_")}_{urlGenerator.GenerateUniqueCode()}",
                        DisplayName = userData.Name,
                        SecurityStamp = Guid.NewGuid().ToString()
                    };
                    
                    var result = await userManager.CreateAsync(user);

                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        throw new ArgumentException($"{errors}");
                    }
                }
                await userManager.AddLoginAsync(user, new UserLoginInfo("Google", userData.Subject, "Google"));
            }

            return await GenerateAuthResponseAsync(user);
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("User with this email already exists.");
            }

            var user = new User
            {
                Email = request.Email,
                UserName = request.Username,
                DisplayName = request.Username,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ArgumentException($"{errors}");
            }

            return await GenerateAuthResponseAsync(user);
        }

        public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var principal = jwtTokenGenerator.GetPrincipalFromExpiredToken(request.Token);
            var userId = principal.Claims.FirstOrDefault(c => 
                c.Type == ClaimTypes.NameIdentifier || 
                c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            
            if (userId == null) throw new ArgumentException("Invalid access token");

            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            if (user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new InvalidOperationException("Invalid or expired refresh token");
            }

            var newAccessToken = jwtTokenGenerator.GenerateToken(user);
            var newRefreshToken = jwtTokenGenerator.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await userManager.UpdateAsync(user);

            return new RefreshTokenResponse
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }

        private async Task<AuthResponse> GenerateAuthResponseAsync(User user)
        {
            var token = jwtTokenGenerator.GenerateToken(user);
            var refreshToken = jwtTokenGenerator.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await userManager.UpdateAsync(user);

            return new AuthResponse
            {
                User = new ProfileRsponse()
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    Username = user.UserName,
                    DisplayName = user.DisplayName,
                    CreatedAt = user.CreatedAt
                },
                Token = token,
                RefreshToken = refreshToken
            };
        }
    }
}
