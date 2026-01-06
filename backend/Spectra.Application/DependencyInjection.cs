using Microsoft.Extensions.DependencyInjection;
using Spectra.Application.Interfaces;
using Spectra.Application.Services;
using System.Reflection;

namespace Spectra.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            services.AddScoped<IUrlShorteningService, UrlShorteningService>();
            services.AddScoped<IUrlAnalyticsService, UrlAnalyticsService>();
            services.AddScoped<IAccountService, AccountService>();

            return services;
        }
    }
}