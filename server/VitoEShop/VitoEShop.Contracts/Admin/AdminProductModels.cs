using System;

namespace VitoEShop.Contracts.Admin;

public sealed record AdminProductRequest(
    string Title,
    string? Slug,
    string? Sku,
    string? Description,
    string? Material,
    string? Brand,
    string? Status);

public sealed record AdminProductDto(
    long ProductId,
    string Title,
    string Slug,
    string? Sku,
    string? Description,
    string? Material,
    string? Brand,
    string Status,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
