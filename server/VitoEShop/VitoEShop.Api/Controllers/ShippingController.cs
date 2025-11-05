using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VitoEShop.Api.Services;
using VitoEShop.Contracts.Shipping;

namespace VitoEShop.Api.Controllers;

[ApiController]
[Route("api/shipping")]
public class ShippingController : ControllerBase
{
    private readonly ShippingService _shippingService;

    public ShippingController(ShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    [HttpPost("webhook/{carrierCode}")]
    [ProducesResponseType(typeof(ShippingWebhookResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReceiveWebhook(
        string carrierCode,
        [FromBody] ShippingWebhookRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _shippingService.HandleCarrierWebhookAsync(carrierCode, request, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
