using System;

namespace VitoEShop.Contracts.Admin;

public sealed record AdminCategoryRequest(
    string Name,
    string? Slug,
    int? ParentId,
    bool? IsActive,
    int? SortOrder);

public sealed record AdminCategoryDto(
    int CategoryId,
    string Name,
    string Slug,
    int? ParentId,
    bool IsActive,
    int SortOrder,
    DateTime CreatedAtUtc);
