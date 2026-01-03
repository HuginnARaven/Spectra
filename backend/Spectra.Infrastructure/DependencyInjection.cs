using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Application.Services;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;
using Spectra.Infrastructure.Repositories;
using Spectra.Infrastructure.Services;
using Spectra.Infrastructure.Services.Utilities;
using StackExchange.Redis;

namespace Spectra.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
            services.AddScoped<IUrlRepository, UrlRepository>();

            var redisConnectionString = configuration.GetConnectionString("Redis");
            services.AddSingleton<IConnectionMultiplexer>(sp => ConnectionMultiplexer.Connect(redisConnectionString));
            services.AddScoped<IUrlCacheService, RedisUrlCacheService>();

            services.AddSingleton<IUserAgentParser, UserAgentParser>();

            services.AddSingleton<IGeoLocationService, GeoLocationService>();

            // Services (Application Services)
            services.AddScoped<IUrlShorteningService, UrlShorteningService>();
            services.AddSingleton<IUrlGenerator, RandomUrlGenerator>();

            services.AddScoped<IUrlAnalyticsService, UrlAnalyticsService>();

            return services;
        }
    }
}