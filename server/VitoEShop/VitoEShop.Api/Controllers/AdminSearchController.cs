using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitoEShop.Infrastructure.Persistence;
using VitoEShop.Infrastructure.Search;

namespace VitoEShop.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")] 
public sealed class AdminSearchController : AdminControllerBase
{
    private readonly IProductSearchService _searchService;

    public AdminSearchController(
        VitoEShopDbContext dbContext,
        IProductSearchService searchService)
        : base(dbContext)
    {
        _searchService = searchService;
    }

    [HttpPost("reindex-products")]
    public async Task<IActionResult> ReindexProducts(CancellationToken cancellationToken)
    {
        var indexed = await _searchService.ReindexProductsAsync(cancellationToken);
        return Ok(new { indexed });
    }
}
