using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spectra.Domain.Entities;

namespace Spectra.Infrastructure.Data.Configurations;

public class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
{
    public void Configure(EntityTypeBuilder<UserSubscription> builder)
    {
        builder.HasKey(us => us.Id);

        builder.Property(us => us.Status)
            .HasConversion<string>();
        
        builder.Property(us => us.StripeSubscriptionId)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(us => us.StripeCustomerId)
            .IsRequired()
            .HasMaxLength(255);
        
        builder.HasIndex(us => us.StripeSubscriptionId)
            .IsUnique();
        
        builder.HasIndex(us => us.StripeCustomerId)
            .IsUnique();

        builder.HasOne(us => us.User)
            .WithOne(u => u.Subscription)
            .HasForeignKey<UserSubscription>(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(us => us.SubscriptionPlan)
            .WithMany()
            .HasForeignKey(us => us.SubscriptionPlanId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(us => us.SubscriptionPlanPrice)
            .WithMany()
            .HasForeignKey(us => us.SubscriptionPlanPriceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}