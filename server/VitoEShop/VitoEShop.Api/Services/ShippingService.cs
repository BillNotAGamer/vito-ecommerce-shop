using Microsoft.EntityFrameworkCore;
using VitoEShop.Contracts.Shipping;
using VitoEShop.Infrastructure.Persistence;
using VitoEShop.Infrastructure.Shipping;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Api.Services;

public class ShippingService
{
    private const int DefaultWarehouseId = 1;
    private readonly VitoEShopDbContext _dbContext;
    private readonly IShippingEventStore _eventStore;

    public ShippingService(VitoEShopDbContext dbContext, IShippingEventStore eventStore)
    {
        _dbContext = dbContext;
        _eventStore = eventStore;
    }

    public async Task<ShippingWebhookResult> HandleCarrierWebhookAsync(
        string carrierCode,
        ShippingWebhookRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(carrierCode))
        {
            throw new ArgumentException("Carrier code is required.", nameof(carrierCode));
        }

        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.OrderNumber))
        {
            throw new ArgumentException("Order number is required.", nameof(request.OrderNumber));
        }

        if (string.IsNullOrWhiteSpace(request.TrackingNumber))
        {
            throw new ArgumentException("Tracking number is required.", nameof(request.TrackingNumber));
        }

        if (string.IsNullOrWhiteSpace(request.Status))
        {
            throw new ArgumentException("Status is required.", nameof(request.Status));
        }

        var normalizedCarrier = carrierCode.Trim();
        var normalizedTracking = request.TrackingNumber.Trim();
        var normalizedOrderNumber = request.OrderNumber.Trim();
        var normalizedStatus = request.Status.Trim();
        var eventTimeUtc = NormalizeEventTime(request.EventTime);

        using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var order = await _dbContext.Orders
            .FirstOrDefaultAsync(o => o.OrderNumber == normalizedOrderNumber, cancellationToken);

        if (order is null)
        {
            throw new KeyNotFoundException($"Order '{normalizedOrderNumber}' was not found.");
        }

        var shipment = await _dbContext.Shipments
            .FirstOrDefaultAsync(s => s.CarrierCode == normalizedCarrier && s.TrackingNumber == normalizedTracking, cancellationToken);

        if (shipment is null)
        {
            shipment = new Shipment
            {
                CarrierCode = normalizedCarrier,
                TrackingNumber = normalizedTracking,
                OrderId = order.OrderId,
                Status = normalizedStatus,
                LastUpdateUtc = eventTimeUtc
            };

            await _dbContext.Shipments.AddAsync(shipment, cancellationToken);
        }
        else
        {
            shipment.OrderId = order.OrderId;

            if (eventTimeUtc >= shipment.LastUpdateUtc)
            {
                shipment.Status = normalizedStatus;
                shipment.LastUpdateUtc = eventTimeUtc;
            }
        }

        order.CarrierCode = normalizedCarrier;
        order.TrackingNumber = normalizedTracking;
        order.UpdatedAtUtc = eventTimeUtc;

        if (string.Equals(normalizedStatus, "Shipped", StringComparison.OrdinalIgnoreCase) && order.ShippedAtUtc is null)
        {
            order.ShippedAtUtc = eventTimeUtc;
        }

        var isDelivered = string.Equals(normalizedStatus, "Delivered", StringComparison.OrdinalIgnoreCase);
        var alreadyDelivered = string.Equals(order.Status, "Delivered", StringComparison.OrdinalIgnoreCase) && order.DeliveredAtUtc.HasValue;

        if (isDelivered && !alreadyDelivered)
        {
            await FinalizeOrderDeliveryAsync(order, eventTimeUtc, cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        await _eventStore.RecordAsync(new ShippingEventEntry
        {
            CarrierCode = normalizedCarrier,
            TrackingNumber = normalizedTracking,
            OrderNumber = normalizedOrderNumber,
            Status = normalizedStatus,
            EventTimeUtc = eventTimeUtc,
            Note = request.Note
        }, cancellationToken);

        return new ShippingWebhookResult(
            order.OrderId,
            order.OrderNumber,
            shipment.Status,
            order.Status,
            order.DeliveredAtUtc);
    }

    private static DateTime NormalizeEventTime(DateTime? eventTime)
    {
        if (!eventTime.HasValue)
        {
            return DateTime.UtcNow;
        }

        return eventTime.Value.Kind switch
        {
            DateTimeKind.Utc => eventTime.Value,
            DateTimeKind.Local => eventTime.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(eventTime.Value, DateTimeKind.Utc)
        };
    }

    private async Task FinalizeOrderDeliveryAsync(Order order, DateTime deliveredAtUtc, CancellationToken cancellationToken)
    {
        var orderItems = await _dbContext.OrderItems
            .Where(oi => oi.OrderId == order.OrderId)
            .ToListAsync(cancellationToken);

        if (orderItems.Count > 0)
        {
            var variantIds = orderItems.Select(oi => oi.VariantId).Distinct().ToList();

            var inventories = await _dbContext.Inventory
                .Where(i => i.WarehouseId == DefaultWarehouseId && variantIds.Contains(i.VariantId))
                .ToDictionaryAsync(i => i.VariantId, cancellationToken);

            foreach (var item in orderItems)
            {
                if (!inventories.TryGetValue(item.VariantId, out var inventory))
                {
                    continue;
                }

                inventory.Reserved = Math.Max(0, inventory.Reserved - item.Quantity);
                inventory.OnHand = Math.Max(0, inventory.OnHand - item.Quantity);
                inventory.UpdatedAtUtc = deliveredAtUtc;
            }
        }

        order.Status = "Delivered";
        order.DeliveredAtUtc = deliveredAtUtc;
        order.UpdatedAtUtc = deliveredAtUtc;
    }
}

public record ShippingWebhookResult(
    long OrderId,
    string OrderNumber,
    string ShipmentStatus,
    string OrderStatus,
    DateTime? DeliveredAtUtc);
