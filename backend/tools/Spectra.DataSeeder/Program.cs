using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;
using Spectra.Infrastructure.Data;
using Spectra.Infrastructure.Services.Utilities;

namespace Spectra.DataSeeder;

public class Program
{
    public static async Task Main(string[] args)
    {
        DotNetEnv.Env.TraversePath().Load();
        
        var configuration = new ConfigurationBuilder()
            .AddEnvironmentVariables()
            .AddCommandLine(args)
            .Build();
        
        var connectionString =
            $"Host=localhost;Port=5433;" +
            $"Database={configuration["POSTGRES_DB"]};" +
            $"Username={configuration["POSTGRES_USER"]};" +
            $"Password={configuration["POSTGRES_PASSWORD"]}";
        
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        
        services.AddLogging();
        services.AddDataProtection();
        
        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
        services.AddIdentityCore<User>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();
        
        services.AddSingleton<IUserAgentParser, UserAgentParser>();
        services.AddSingleton<IUrlGenerator, RandomUrlGenerator>();
        services.AddSingleton<IGeoLocationService, GeoLocationService>();
        
        services.AddTransient<DatabaseSeeder>();
        
        await using var serviceProvider = services.BuildServiceProvider();
        await using var scope = serviceProvider.CreateAsyncScope();
        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        await seeder.RunAsync();
    }
}