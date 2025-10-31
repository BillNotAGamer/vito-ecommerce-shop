using Microsoft.AspNetCore.Mvc;
using VitoEShop.Api.Services;
using VitoEShop.Contracts.Orders;

namespace VitoEShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<CreateOrderResponse>> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _orderService.CreateOrderAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetOrderById), new { orderId = response.OrderId }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{orderId:long}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrderById(long orderId, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderAsync(orderId, cancellationToken);
        if (order is null)
        {
            return NotFound();
        }

        return Ok(order);
    }

    [HttpPost("{orderId:long}/cancel")]
    public async Task<IActionResult> CancelOrder(long orderId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _orderService.CancelOrderAsync(orderId, cancellationToken);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
