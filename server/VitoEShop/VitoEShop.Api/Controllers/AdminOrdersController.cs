using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VitoEShop.Contracts.Admin;
using VitoEShop.Infrastructure.Persistence;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public class AdminOrdersController : AdminControllerBase
{
    public AdminOrdersController(VitoEShopDbContext dbContext)
        : base(dbContext)
    {
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AdminOrderSummaryDto>>> ListOrders(
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = DbContext.Orders.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalized = status.Trim();
            query = query.Where(o => o.Status == normalized);
        }

        var orders = await query
            .OrderByDescending(o => o.PlacedAtUtc)
            .Select(o => new AdminOrderSummaryDto(
                o.OrderId,
                o.OrderNumber,
                o.Status,
                o.PaymentStatus,
                o.GrandTotal,
                o.PlacedAtUtc,
                o.Email,
                o.Phone))
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpPost("{orderId:long}/status")]
    public async Task<ActionResult<AdminOrderStatusResponse>> UpdateOrderStatus(
        long orderId,
        [FromBody] AdminOrderStatusUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { message = "Status is required." });
        }

        var order = await DbContext.Orders
            .FirstOrDefaultAsync(o => o.OrderId == orderId, cancellationToken);

        if (order is null)
        {
            return NotFound();
        }

        var normalized = request.Status.Trim();
        var normalizedUpper = normalized.ToUpperInvariant();

        string? newStatus;
        var now = DateTime.UtcNow;

        switch (normalizedUpper)
        {
            case "CONFIRMED":
                newStatus = "Confirmed";
                if (!order.ConfirmedAtUtc.HasValue)
                {
                    order.ConfirmedAtUtc = now;
                }
                break;
            case "SHIPPED":
                newStatus = "Shipped";
                if (!order.ConfirmedAtUtc.HasValue)
                {
                    order.ConfirmedAtUtc = now;
                }
                order.ShippedAtUtc = now;
                break;
            case "DELIVERED":
                newStatus = "Delivered";
                if (!order.ConfirmedAtUtc.HasValue)
                {
                    order.ConfirmedAtUtc = now;
                }
                if (!order.ShippedAtUtc.HasValue)
                {
                    order.ShippedAtUtc = now;
                }
                order.DeliveredAtUtc = now;
                if (order.PaymentStatus == "Pending")
                {
                    order.PaymentStatus = "Paid";
                }
                break;
            default:
                return BadRequest(new { message = "Unsupported status. Use Confirmed, Shipped, or Delivered." });
        }

        order.Status = newStatus;
        order.UpdatedAtUtc = now;

        var actorUserId = GetCurrentUserId();

        await using var tx = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        AddAdminLog(actorUserId, "UpdateOrderStatus", "Order", order.OrderId.ToString(),
            JsonSerializer.Serialize(new { orderId, status = newStatus }));
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        var updatedAt = order.UpdatedAtUtc ?? now;
        return Ok(new AdminOrderStatusResponse(order.OrderId, order.Status, updatedAt));
    }
}
