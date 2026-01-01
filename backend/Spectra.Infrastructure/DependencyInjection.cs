using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spectra.Application.Interfaces;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Application.Services;
using Spectra.Domain.Interfaces;
using Spectra.Infrastructure.Data;
using Spectra.Infrastructure.Repositories;
using Spectra.Infrastructure.Services.Utilities;

namespace Spectra.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
            services.AddScoped<IUrlRepository, UrlRepository>();

            // Services (Application Services)
            services.AddScoped<IUrlShorteningService, UrlShorteningService>();
            services.AddSingleton<IUrlGenerator, RandomUrlGenerator>();
            return services;
        }
    }
}