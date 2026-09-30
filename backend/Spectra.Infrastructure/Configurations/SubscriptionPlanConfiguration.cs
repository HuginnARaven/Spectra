using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spectra.Domain.Entities;

namespace Spectra.Infrastructure.Data.Configurations;

public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.HasKey(sp => sp.Id);

        builder.Property(sp => sp.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(sp => sp.Description)
            .IsRequired()
            .HasMaxLength(255);
        
        builder.HasIndex(p => p.IsDefault)
            .IsUnique()
            .HasFilter("\"IsDefault\" = TRUE"); // change to is_default if SnakeCaseNamingConvention
        
        // Relations
        builder.HasMany(u => u.Prices)
            .WithOne(v => v.Plan)
            .HasForeignKey(v => v.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}