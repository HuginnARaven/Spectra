using Spectra.Application.DTOs.SubscriptionPlans;

namespace Spectra.Application.DTOs.Account
{
    public class ProfileResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; } = false;
        public SubscriptionPlanBaseDto SubscriptionPlan { get; set; } = new SubscriptionPlanDto();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
