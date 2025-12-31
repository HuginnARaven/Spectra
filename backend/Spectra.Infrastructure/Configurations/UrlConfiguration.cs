using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spectra.Domain.Entities;

namespace Spectra.Infrastructure.Data.Configurations
{
    public class UrlConfiguration : IEntityTypeConfiguration<Url>
    {
        public void Configure(EntityTypeBuilder<Url> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.OriginalUrl)
                .IsRequired()
                .HasMaxLength(2048);

            builder.Property(u => u.ShortCode)
                .IsRequired()
                .HasMaxLength(16);

            builder.HasIndex(u => u.ShortCode)
                .IsUnique();

            // Relations
            builder.HasMany(u => u.Visits)
                .WithOne(v => v.Url)
                .HasForeignKey(v => v.UrlId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}