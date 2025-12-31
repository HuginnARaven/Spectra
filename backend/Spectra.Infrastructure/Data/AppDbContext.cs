using Microsoft.EntityFrameworkCore;
using Spectra.Domain.Entities;
using System.Reflection;

namespace Spectra.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Url> Urls => Set<Url>();
        public DbSet<UrlVisit> UrlVisits => Set<UrlVisit>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}