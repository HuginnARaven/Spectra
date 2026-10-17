using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Spectra.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNewFeaturesToSubPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AnalyticsRetentionDays",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "HasCustomAliasAccess",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasEarlyFeatureAccess",
                table: "SubscriptionPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxUrlsLimit",
                table: "SubscriptionPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddCheckConstraint(
                name: "CK_SubscriptionPlan_AnalyticsRetentionDays_Min",
                table: "SubscriptionPlans",
                sql: "\"AnalyticsRetentionDays\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SubscriptionPlan_MaxUrlsLimit_Min",
                table: "SubscriptionPlans",
                sql: "\"MaxUrlsLimit\" >= -1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_SubscriptionPlan_AnalyticsRetentionDays_Min",
                table: "SubscriptionPlans");

            migrationBuilder.DropCheckConstraint(
                name: "CK_SubscriptionPlan_MaxUrlsLimit_Min",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "AnalyticsRetentionDays",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "HasCustomAliasAccess",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "HasEarlyFeatureAccess",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "MaxUrlsLimit",
                table: "SubscriptionPlans");
        }
    }
}
