using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Spectra.Application.Interfaces.Utilities;
using Spectra.DataSeeder.Fakers;
using Spectra.Domain.Entities;
using Spectra.Infrastructure.Data;

namespace Spectra.DataSeeder;

public class DatabaseSeeder(
    AppDbContext dbContext, 
    UserManager<User> userManager, 
    IUserAgentParser agentParser, 
    IGeoLocationService geoLocationService,
    IUrlGenerator urlGenerator)
{
    private const string DemoUserName = "demouser";
    
    public async Task RunAsync()
    {
        var user = await CreateDemoUserAsync();

        var urlsFaker = new UrlFaker(new List<User>() { user }, urlGenerator, user.CreatedAt);
        var urls = urlsFaker.Generate(5);
        dbContext.Urls.AddRange(urls);

        var urlVisitsFaker = new UrlVisitFaker(urls, agentParser, geoLocationService, -30);
        var visits = urlVisitsFaker.Generate(250);
        dbContext.UrlVisits.AddRange(visits);
        
        await dbContext.SaveChangesAsync();
    }

    private async Task<User> CreateDemoUserAsync()
    {
        var demoUser = await userManager.FindByNameAsync(DemoUserName);
        if (demoUser != null)
        {
            await dbContext.Urls.Where(u => u.UserId == demoUser.Id).ExecuteDeleteAsync();;
            await userManager.DeleteAsync(demoUser);
        }
        
        var res = await userManager.CreateAsync(new User()
        {
            UserName = DemoUserName,
            DisplayName = DemoUserName,
            Email = $"{DemoUserName}@test.com",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow.AddDays(-180), // for the sake of statistics "realism"
        });

        if (!res.Succeeded) {
            throw new Exception("Could not create user");
        }
        
        var user = await userManager.FindByNameAsync(DemoUserName) ?? throw new Exception("Could not find user");
        await userManager.AddPasswordAsync(user, "Demo12345Pass!");
        
        return user;
    }
}