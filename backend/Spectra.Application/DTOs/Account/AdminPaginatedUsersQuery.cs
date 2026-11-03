using Spectra.Application.Common;

namespace Spectra.Application.DTOs.Account;

public class AdminPaginatedUsersQuery : PaginationRequest
{
    public string? RoleId { get; set; }
    public string? PlanId { get; set; }
    public string? Status { get; set; }
    public string? Search { get; set; }
    public string? SortingCol { get; set; }
    public bool? SortingDesc { get; set; }
}
