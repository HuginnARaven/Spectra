using Bogus;
using Spectra.Application.Interfaces.Utilities;
using Spectra.Domain.Entities;

namespace Spectra.DataSeeder.Fakers;

public sealed class UrlFaker: Faker<Url>
{
    public UrlFaker(List<User>? users, IUrlGenerator urlGenerator, DateTime? createdAt = null) : base("en")
    {
        RuleFor(u => u.OriginalUrl, f => f.Internet.UrlWithPath());
        RuleFor(u => u.ShortCode, f => urlGenerator.GenerateUniqueCode());
        RuleFor(u => u.UserId, f => f.PickRandom(users).Id);
        
        RuleFor(u => u.CreatedAt, f => createdAt ?? DateTime.UtcNow);
    }
}