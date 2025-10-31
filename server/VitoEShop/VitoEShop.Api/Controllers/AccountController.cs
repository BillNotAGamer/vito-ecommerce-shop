using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VitoEShop.Api.Services;
using VitoEShop.Contracts.Account;
using VitoEShop.Infrastructure.Persistence;

namespace VitoEShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly VitoEShopDbContext _dbContext;
    private readonly OrderService _orderService;

    public AccountController(VitoEShopDbContext dbContext, OrderService orderService)
    {
        _dbContext = dbContext;
        _orderService = orderService;
    }

    [Authorize]
    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryDto>>> GetOrders(CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
        if (customer is null)
        {
            return Ok(Array.Empty<OrderSummaryDto>());
        }

        var orders = await _orderService.GetOrdersForCustomerAsync(customer.CustomerId, cancellationToken);
        return Ok(orders);
    }
}
