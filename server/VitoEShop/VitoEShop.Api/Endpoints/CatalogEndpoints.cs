using System.ComponentModel.DataAnnotations;
using VitoEShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace EShop.Api.Endpoints;

public static class CatalogEndpoints
{
    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/catalog");

        // 1) GET /api/catalog/categories
        g.MapGet("/categories", async (VitoEShopDbContext db) =>
        {
            var data = await db.Categories
                .Where(x => x.IsActive)
                .OrderBy(x => x.SortOrder)
                .Select(x => new CategoryDto(x.CategoryId, x.Name, x.Slug))
                .ToListAsync();

            return Results.Ok(data);
        });

        // 2) GET /api/catalog/products/{slug}
        g.MapGet("/products/{slug}", async (string slug, VitoEShopDbContext db) =>
        {
            var product = await db.Products
                .Where(p => p.Slug == slug && p.Status == "active")
                .Select(p => new ProductDetailDto(
                    p.ProductId, p.Title, p.Slug, p.Brand, p.Material,
                    db.ProductImages.Where(i => i.ProductId == p.ProductId)
                        .OrderBy(i => i.SortOrder)
                        .Select(i => new ImageDto(i.Url, i.AltText))
                        .ToList(),
                    db.ProductVariants.Where(v => v.ProductId == p.ProductId && v.IsActive)
                        .OrderBy(v => v.Price)
                        .Select(v => new VariantDto(
                            v.VariantId, v.Sku, v.Size, v.Color, v.Price,
                            db.Inventory.Where(inv => inv.VariantId == v.VariantId)
                                .Select(inv => Math.Max(inv.OnHand - inv.Reserved, 0))
                                .FirstOrDefault()
                        )).ToList()
                ))
                .FirstOrDefaultAsync();

            return product is null ? Results.NotFound() : Results.Ok(product);
        });


        return app;
    }
}

public sealed record CategoryDto(int Id, string Name, string Slug);

public sealed record ProductDetailDto(
    long Id,
    string Title,
    string Slug,
    string? Brand,
    string? Material,
    List<ImageDto> Images,
    List<VariantDto> Variants
);

public sealed record ImageDto(string Url, string? Alt);
public sealed record VariantDto(long Id, string Sku, string? Size, string? Color, decimal Price, int Available);

public sealed class ProductListQuery
{
    [FromQuery(Name = "categorySlug")] public string? CategorySlug { get; set; }
    [FromQuery(Name = "brand")] public string? Brand { get; set; }
    [FromQuery(Name = "size")] public string? Size { get; set; }
    [FromQuery(Name = "color")] public string? Color { get; set; }
    [FromQuery(Name = "minPrice")] public decimal? MinPrice { get; set; }
    [FromQuery(Name = "maxPrice")] public decimal? MaxPrice { get; set; }
    /// latest | price_asc | price_desc | bestseller
    [FromQuery(Name = "sort")] public string? Sort { get; set; } = "latest";
    [Range(1, int.MaxValue)]
    [FromQuery(Name = "page")] public int Page { get; set; } = 1;
    [Range(1, 200)]
    [FromQuery(Name = "pageSize")] public int PageSize { get; set; } = 12;
}

public sealed record ProductListItemDto(
    long Id,
    string Title,
    string Slug,
    string? Brand,
    decimal MinPrice,
    decimal MaxPrice,
    string? PrimaryImageUrl,
    List<string?> Colors,
    List<string?> Sizes
);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling((double)Total / PageSize);
}