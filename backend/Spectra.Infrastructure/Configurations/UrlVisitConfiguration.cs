using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spectra.Domain.Entities;

namespace Spectra.Infrastructure.Data.Configurations
{
    public class UrlVisitConfiguration : IEntityTypeConfiguration<UrlVisit>
    {
        public void Configure(EntityTypeBuilder<UrlVisit> builder)
        {
            builder.HasKey(v => v.Id);

            builder.Property(v => v.IpAddress)
                .IsRequired()
                .HasMaxLength(45);

            builder.Property(v => v.UserAgent)
                .HasMaxLength(500);

            builder.Property(v => v.Country)
                .HasMaxLength(100);

            builder.HasIndex(v => v.CreatedAt);
        }
    }
}