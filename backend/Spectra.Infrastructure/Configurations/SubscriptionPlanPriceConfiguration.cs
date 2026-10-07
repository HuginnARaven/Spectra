using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spectra.Domain.Entities;

namespace Spectra.Infrastructure.Data.Configurations;

public class SubscriptionPlanPriceConfiguration : IEntityTypeConfiguration<SubscriptionPlanPrice>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlanPrice> builder)
    {
        builder.HasKey(spp => spp.Id);
        
        builder.Property(sp => sp.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);
        
        builder.Property(sp => sp.Interval)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(us => us.StripePriceId)
            .IsRequired()
            .HasMaxLength(255);
        
        builder.HasIndex(spp => spp.StripePriceId)
            .IsUnique();
    }
}