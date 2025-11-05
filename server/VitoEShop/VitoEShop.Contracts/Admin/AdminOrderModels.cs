using System;
namespace VitoEShop.Contracts.Admin;

public sealed record AdminOrderSummaryDto(
    long OrderId,
    string OrderNumber,
    string Status,
    string PaymentStatus,
    decimal GrandTotal,
    DateTime PlacedAtUtc,
    string Email,
    string? Phone);

public sealed record AdminOrderStatusUpdateRequest(string Status);

public sealed record AdminOrderStatusResponse(
    long OrderId,
    string Status,
    DateTime UpdatedAtUtc);
