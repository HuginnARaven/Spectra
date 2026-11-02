using Spectra.Application.DTOs.SubscriptionPlans;
using Spectra.Application.DTOs.Subscriptions;

namespace Spectra.Application.DTOs.Account;

public class AdminUserDetails: AdminUserListItem
{
    public UserSubscriptionDto? UserSubscription { get; set; } = new UserSubscriptionDto();
    public IList<string> Roles { get; set; } = new List<string>();
}