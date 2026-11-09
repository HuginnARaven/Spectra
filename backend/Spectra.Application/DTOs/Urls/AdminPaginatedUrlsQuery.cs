using Spectra.Application.Common;

namespace Spectra.Application.DTOs.Urls;

public class AdminPaginatedUrlsQuery : PaginationRequest
{
    public string? Search { get; set; }
    public string? SortingCol { get; set; }
    public bool? SortingDesc { get; set; }
}
