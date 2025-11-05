using Microsoft.EntityFrameworkCore;
using VitoEShop.Contracts.Account;
using VitoEShop.Contracts.Orders;
using VitoEShop.Infrastructure.Persistence;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Api.Services;

public class OrderService
{
    private readonly VitoEShopDbContext _dbContext;
    private const int DefaultWarehouseId = 1;

    public OrderService(VitoEShopDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CreateOrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);

        var variantIds = request.Items.Select(i => i.VariantId).Distinct().ToList();
        var variantDetails = await _dbContext.ProductVariants
            .Where(v => variantIds.Contains(v.VariantId) && v.IsActive)
            .Join(
                _dbContext.Products.Where(p => p.Status == "active"),
                v => v.ProductId,
                p => p.ProductId,
                (variant, product) => new { Variant = variant, Product = product })
            .ToListAsync(cancellationToken);

        if (variantDetails.Count != variantIds.Count)
        {
            throw new ArgumentException("One or more variants do not exist or are inactive.");
        }

        var variantLookup = variantDetails.ToDictionary(x => x.Variant.VariantId);
        var inventories = await _dbContext.Inventory
            .Where(i => i.WarehouseId == DefaultWarehouseId && variantIds.Contains(i.VariantId))
            .ToDictionaryAsync(i => i.VariantId, cancellationToken);

        foreach (var item in request.Items)
        {
            if (!variantLookup.TryGetValue(item.VariantId, out var detail))
            {
                throw new ArgumentException($"Variant {item.VariantId} is not available.");
            }

            if (!inventories.TryGetValue(item.VariantId, out var inventory))
            {
                throw new InvalidOperationException($"Variant {item.VariantId} has no inventory record.");
            }

            var available = inventory.OnHand - inventory.Reserved;
            if (available < item.Quantity)
            {
                throw new InvalidOperationException($"Variant {item.VariantId} does not have enough stock.");
            }
        }

        var now = DateTime.UtcNow;
        var subtotal = request.Items.Sum(i => variantLookup[i.VariantId].Variant.Price * i.Quantity);
        var voucherCode = string.IsNullOrWhiteSpace(request.VoucherCode)
            ? null
            : request.VoucherCode!.Trim().ToUpperInvariant();

        Voucher? voucher = null;
        decimal discountTotal = 0m;

        if (!string.IsNullOrEmpty(voucherCode))
        {
            voucher = await _dbContext.Vouchers
                .FirstOrDefaultAsync(v => v.VoucherCode == voucherCode, cancellationToken);

            if (voucher is null)
            {
                throw new InvalidOperationException("Voucher code is invalid.");
            }

            if (!voucher.IsActive)
            {
                throw new InvalidOperationException("Voucher is inactive.");
            }

            if (now < voucher.StartsAtUtc || (voucher.EndsAtUtc.HasValue && now > voucher.EndsAtUtc.Value))
            {
                throw new InvalidOperationException("Voucher is not currently active.");
            }

            if (voucher.MinOrderValue.HasValue && subtotal < voucher.MinOrderValue.Value)
            {
                throw new InvalidOperationException("Order subtotal does not meet the voucher minimum.");
            }

            if (voucher.UsageLimit.HasValue)
            {
                var redemptionCount = await _dbContext.VoucherRedemptions
                    .CountAsync(vr => vr.VoucherCode == voucher.VoucherCode, cancellationToken);

                if (redemptionCount >= voucher.UsageLimit.Value)
                {
                    throw new InvalidOperationException("Voucher usage limit has been reached.");
                }
            }

            discountTotal = voucher.Type.ToUpperInvariant() switch
            {
                "PERCENT" => subtotal * voucher.DiscountValue / 100m,
                "AMOUNT" => voucher.DiscountValue,
                _ => throw new InvalidOperationException("Unsupported voucher type.")
            };

            if (voucher.MaxDiscount.HasValue)
            {
                discountTotal = Math.Min(discountTotal, voucher.MaxDiscount.Value);
            }

            discountTotal = Math.Min(discountTotal, subtotal);

            if (discountTotal < 0)
            {
                discountTotal = 0;
            }
        }

        var grandTotal = Math.Max(0, subtotal - discountTotal);
        var orderNumber = GenerateOrderNumber(now);

        using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var order = new Order
        {
            CustomerId = request.CustomerId,
            Email = request.Email,
            Phone = request.Phone,
            ShipToName = request.ShipTo.Name,
            ShipToAddress = request.ShipTo.Address,
            ShipToProvince = request.ShipTo.Province,
            ShipToDistrict = request.ShipTo.District,
            ShipToWard = request.ShipTo.Ward,
            Notes = request.ShipTo.Notes,
            Subtotal = subtotal,
            DiscountTotal = discountTotal,
            ShippingFee = 0,
            TaxTotal = 0,
            GrandTotal = grandTotal,
            Status = "Pending",
            PaymentStatus = "Pending",
            PaymentMethod = "COD",
            OrderNumber = orderNumber,
            VoucherCode = voucher?.VoucherCode,
            PlacedAtUtc = now,
            UpdatedAtUtc = now
        };

        await _dbContext.Orders.AddAsync(order, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var orderItems = new List<OrderItem>();
        foreach (var item in request.Items)
        {
            var detail = variantLookup[item.VariantId];
            var lineTotal = detail.Variant.Price * item.Quantity;
            orderItems.Add(new OrderItem
            {
                OrderId = order.OrderId,
                ProductId = detail.Product.ProductId,
                VariantId = detail.Variant.VariantId,
                Title = detail.Product.Title,
                Sku = detail.Variant.Sku,
                Size = detail.Variant.Size,
                Color = detail.Variant.Color,
                Price = detail.Variant.Price,
                Quantity = item.Quantity,
                LineTotal = lineTotal
            });
        }

        await _dbContext.OrderItems.AddRangeAsync(orderItems, cancellationToken);

        if (voucher is not null)
        {
            var redemption = new VoucherRedemption
            {
                VoucherCode = voucher.VoucherCode,
                CustomerId = request.CustomerId,
                OrderId = order.OrderId,
                RedeemedAtUtc = now
            };

            await _dbContext.VoucherRedemptions.AddAsync(redemption, cancellationToken);
        }

        foreach (var item in request.Items)
        {
            var inventory = inventories[item.VariantId];
            inventory.Reserved += item.Quantity;
            inventory.UpdatedAtUtc = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return new CreateOrderResponse
        {
            OrderId = order.OrderId,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            Subtotal = order.Subtotal,
            DiscountTotal = order.DiscountTotal,
            ShippingFee = order.ShippingFee,
            TaxTotal = order.TaxTotal,
            GrandTotal = order.GrandTotal
        };
    }

    public async Task<OrderDetailDto?> GetOrderAsync(long orderId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .Where(o => o.OrderId == orderId)
            .Select(o => new OrderDetailDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                PaymentStatus = o.PaymentStatus,
                PaymentMethod = o.PaymentMethod,
                Subtotal = o.Subtotal,
                DiscountTotal = o.DiscountTotal,
                ShippingFee = o.ShippingFee,
                TaxTotal = o.TaxTotal,
                GrandTotal = o.GrandTotal,
                Email = o.Email,
                Phone = o.Phone,
                ShipToName = o.ShipToName,
                ShipToAddress = o.ShipToAddress,
                ShipToProvince = o.ShipToProvince,
                ShipToDistrict = o.ShipToDistrict,
                ShipToWard = o.ShipToWard,
                Notes = o.Notes,
                PlacedAtUtc = o.PlacedAtUtc,
                CancelledAtUtc = o.CancelledAtUtc,
                Items = _dbContext.OrderItems
                    .Where(oi => oi.OrderId == o.OrderId)
                    .Select(oi => new OrderDetailItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        VariantId = oi.VariantId,
                        ProductId = oi.ProductId,
                        Title = oi.Title,
                        Sku = oi.Sku,
                        Size = oi.Size,
                        Color = oi.Color,
                        Price = oi.Price,
                        Quantity = oi.Quantity,
                        LineTotal = oi.LineTotal
                    }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> CancelOrderAsync(long orderId, CancellationToken cancellationToken = default)
    {
        using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId, cancellationToken);
        if (order is null)
        {
            return false;
        }

        if (order.Status == "Cancelled")
        {
            return true;
        }

        if (order.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending orders can be cancelled.");
        }

        var orderItems = await _dbContext.OrderItems
            .Where(oi => oi.OrderId == orderId)
            .ToListAsync(cancellationToken);

        var variantIds = orderItems.Select(oi => oi.VariantId).Distinct().ToList();
        var inventories = await _dbContext.Inventory
            .Where(i => i.WarehouseId == DefaultWarehouseId && variantIds.Contains(i.VariantId))
            .ToDictionaryAsync(i => i.VariantId, cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var item in orderItems)
        {
            if (inventories.TryGetValue(item.VariantId, out var inventory))
            {
                inventory.Reserved = Math.Max(0, inventory.Reserved - item.Quantity);
                inventory.UpdatedAtUtc = now;
            }
        }

        order.Status = "Cancelled";
        order.CancelledAtUtc = now;
        order.UpdatedAtUtc = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return true;
    }

    public async Task<IReadOnlyList<OrderSummaryDto>> GetOrdersForCustomerAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.PlacedAtUtc)
            .Select(o => new OrderSummaryDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                PaymentStatus = o.PaymentStatus,
                GrandTotal = o.GrandTotal,
                PlacedAtUtc = o.PlacedAtUtc
            })
            .ToListAsync(cancellationToken);
    }

    private static void ValidateRequest(CreateOrderRequest request)
    {
        if (request.CustomerId == Guid.Empty)
        {
            throw new ArgumentException("CustomerId is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (request.ShipTo is null)
        {
            throw new ArgumentException("Shipping address is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ShipTo.Name) || string.IsNullOrWhiteSpace(request.ShipTo.Phone) || string.IsNullOrWhiteSpace(request.ShipTo.Address))
        {
            throw new ArgumentException("Shipping name, phone and address are required.");
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            throw new ArgumentException("At least one cart item is required.");
        }

        foreach (var item in request.Items)
        {
            if (item.VariantId <= 0)
            {
                throw new ArgumentException("VariantId must be greater than zero.");
            }

            if (item.Quantity <= 0)
            {
                throw new ArgumentException("Quantity must be greater than zero.");
            }
        }
    }

    private static string GenerateOrderNumber(DateTime timestamp)
        => $"ORD-{timestamp:yyyyMMddHHmmssfff}";
}

public class OrderDetailDto
{
    public long OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string PaymentStatus { get; set; } = default!;
    public string PaymentMethod { get; set; } = default!;
    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }
    public string Email { get; set; } = default!;
    public string? Phone { get; set; }
    public string ShipToName { get; set; } = default!;
    public string ShipToAddress { get; set; } = default!;
    public string? ShipToProvince { get; set; }
    public string? ShipToDistrict { get; set; }
    public string? ShipToWard { get; set; }
    public string? Notes { get; set; }
    public DateTime PlacedAtUtc { get; set; }
    public DateTime? CancelledAtUtc { get; set; }
    public List<OrderDetailItemDto> Items { get; set; } = new();
}

public class OrderDetailItemDto
{
    public long OrderItemId { get; set; }
    public long ProductId { get; set; }
    public long VariantId { get; set; }
    public string Title { get; set; } = default!;
    public string Sku { get; set; } = default!;
    public string? Size { get; set; }
    public string? Color { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}
