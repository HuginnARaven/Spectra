using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Spectra.Application.Interfaces;
using Spectra.Application.Services;
using System.Reflection;
using Microsoft.Extensions.Configuration;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Application.Services.Utilities;

namespace Spectra.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddScoped<IUrlShorteningService, UrlShorteningService>();
            services.AddScoped<IUrlAnalyticsService, UrlAnalyticsService>();
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IEmailNotificationService, EmailNotificationService>();
            
            services.Configure<FrontendSettings>(configuration.GetSection("FrontendSettings"));

            return services;
        }
    }
}