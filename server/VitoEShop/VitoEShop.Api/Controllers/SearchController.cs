using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using VitoEShop.Contracts.Search;
using VitoEShop.Infrastructure.Search;

namespace VitoEShop.Api.Controllers;

[ApiController]
[Route("api/search")]
public sealed class SearchController : ControllerBase
{
    private readonly IProductSearchService _searchService;

    public SearchController(IProductSearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet("suggest")]
    public async Task<ActionResult<IReadOnlyList<SearchSuggestionDto>>> Suggest(
        [FromQuery(Name = "q")] string? query,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(Array.Empty<SearchSuggestionDto>());
        }

        var suggestions = await _searchService.SuggestAsync(query, 8, cancellationToken);
        return Ok(suggestions);
    }
}
