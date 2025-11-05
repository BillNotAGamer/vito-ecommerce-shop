using System.ComponentModel.DataAnnotations;
using VitoEShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Any;

namespace EShop.Api.Endpoints;

public static partial class CatalogEndpoints // partial để tách file nếu muốn
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

        // 1) LIST PRODUCTS with filters & sort
        g.MapGet("/products", async (
            [FromServices] VitoEShopDbContext db,
            [AsParameters] ProductListQuery q
        ) =>
        {
            // 1. Lấy CategoryId nếu có categorySlug
            int? categoryId = null;
            if (!string.IsNullOrWhiteSpace(q.CategorySlug))
            {
                categoryId = await db.Categories
                    .Where(c => c.Slug == q.CategorySlug && c.IsActive)
                    .Select(c => (int?)c.CategoryId)
                    .FirstOrDefaultAsync();
                if (categoryId == null)
                    return Results.Ok(new PagedResult<ProductListItemDto>([], 0, q.Page, q.PageSize)); // không có danh mục
            }

            // 2. Base: chỉ sản phẩm active
            var baseProducts = db.Products.AsNoTracking().Where(p => p.Status == "active");

            if (!string.IsNullOrWhiteSpace(q.Q))
            {
                var keyword = q.Q.Trim().ToLower();
                baseProducts = baseProducts.Where(p =>
                    (p.Title != null && p.Title.ToLower().Contains(keyword)) ||
                    (p.Brand != null && p.Brand.ToLower().Contains(keyword)) ||
                    (p.Slug != null && p.Slug.ToLower().Contains(keyword))
                );
            }

            // 3. Join với ProductCategories nếu có category filter
            if (categoryId.HasValue)
            {
                baseProducts =
                    from p in baseProducts
                    join pc in db.Set<VitoEShop.Domain.Entities.ProductCategory>().AsNoTracking()
                        on p.ProductId equals pc.ProductId
                    where pc.CategoryId == categoryId.Value
                    select p;
            }

            // 4. Join variants active để lọc size/color/price
            var productWithVariants =
                from p in baseProducts
                join v in db.ProductVariants.AsNoTracking().Where(v => v.IsActive) on p.ProductId equals v.ProductId
                select new
                {
                    p.ProductId,
                    p.Title,
                    p.Slug,
                    p.Brand,
                    v.VariantId,
                    v.Size,
                    v.Color,
                    v.Price
                };

            // 5. Áp bộ lọc
            if (!string.IsNullOrWhiteSpace(q.Brand))
                productWithVariants = productWithVariants.Where(x => x.Brand != null && x.Brand == q.Brand);
            if (!string.IsNullOrWhiteSpace(q.Size))
                productWithVariants = productWithVariants.Where(x => x.Size == q.Size);
            if (!string.IsNullOrWhiteSpace(q.Color))
                productWithVariants = productWithVariants.Where(x => x.Color == q.Color);
            if (q.MinPrice.HasValue)
                productWithVariants = productWithVariants.Where(x => x.Price >= q.MinPrice.Value);
            if (q.MaxPrice.HasValue)
                productWithVariants = productWithVariants.Where(x => x.Price <= q.MaxPrice.Value);

            // 6. Nhóm theo product để tính MinPrice/MaxPrice + chuẩn bị sort
            var grouped =
                from x in productWithVariants
                group x by new { x.ProductId, x.Title, x.Slug, x.Brand } into g1
                select new
                {
                    g1.Key.ProductId,
                    g1.Key.Title,
                    g1.Key.Slug,
                    g1.Key.Brand,
                    MinPrice = g1.Min(z => z.Price),
                    MaxPrice = g1.Max(z => z.Price)
                };

            // 7. BESTSELLER: left join với OrderItems nếu bạn đã có bảng này.
            // Nếu dự án chưa có Orders/OrderItems, bestseller sẽ rơi về "latest".
            var groupedWithSales =
                from gp in grouped
                join s in
                    (from oi in db.Set<VitoEShop.Domain.Entities.OrderItem>().AsNoTracking()
                     group oi by oi.ProductId into g2
                     select new { ProductId = g2.Key, Sold = g2.Sum(z => z.Quantity) })
                on gp.ProductId equals s.ProductId into sleft
                from s in sleft.DefaultIfEmpty()
                select new
                {
                    gp.ProductId,
                    gp.Title,
                    gp.Slug,
                    gp.Brand,
                    gp.MinPrice,
                    gp.MaxPrice,
                    Sold = s != null ? s.Sold : 0
                };

            // 8. Sort
            var page = q.Page < 1 ? 1 : q.Page;
            var pageSize = Math.Clamp(q.PageSize, 1, 200);

            var ordered = q.Sort switch
            {
                "price_asc" => groupedWithSales.OrderBy(x => x.MinPrice),
                "price_desc" => groupedWithSales.OrderByDescending(x => x.MaxPrice),
                "bestseller" => groupedWithSales.OrderByDescending(x => x.Sold).ThenBy(x => x.Title),
                _ => groupedWithSales.OrderByDescending(x => x.ProductId) // latest ~ id mới nhất
            };

            // 9. Tổng số & phân trang
            var total = await ordered.CountAsync(); // Count sau khi filter
            var items = await ordered
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ProductListItemDto(
                    x.ProductId,
                    x.Title,
                    x.Slug,
                    x.Brand,
                    x.MinPrice,
                    x.MaxPrice,
                    // Ảnh đại diện
                    db.ProductImages.AsNoTracking()
                        .Where(i => i.ProductId == x.ProductId)
                        .OrderByDescending(i => i.IsPrimary).ThenBy(i => i.SortOrder)
                        .Select(i => i.Url).FirstOrDefault()!,
                    // Colors/Sizes khả dụng (distinct từ variants active)
                    db.ProductVariants.AsNoTracking()
                        .Where(v => v.ProductId == x.ProductId && v.IsActive)
                        .Select(v => v.Color!)
                        .Where(c => c != null).Distinct().Take(12).ToList(),
                    db.ProductVariants.AsNoTracking()
                        .Where(v => v.ProductId == x.ProductId && v.IsActive)
                        .Select(v => v.Size!)
                        .Where(s => s != null).Distinct().Take(12).ToList()
                ))
                .ToListAsync();

            return Results.Ok(new PagedResult<ProductListItemDto>(items, total, page, pageSize));
        })
        .WithName("Catalog_ListProducts")
        .WithOpenApi(op =>
        {
            op.Summary = "Danh sách sản phẩm (filter/sort/pagination)";
            if (op.Parameters is { Count: > 0 })
            {
                var descriptions = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["categorySlug"] = "Optional category slug to limit results to a specific active category.",
                    ["q"] = "Optional keyword used to search within product title, brand, or slug.",
                    ["brand"] = "Filters the results to products from the specified brand.",
                    ["size"] = "Filters the results to variants that match the provided size.",
                    ["color"] = "Filters the results to variants that match the provided color.",
                    ["minPrice"] = "Only include variants with a price greater than or equal to this value.",
                    ["maxPrice"] = "Only include variants with a price less than or equal to this value.",
                    ["sort"] = "Sort order: latest (default), price_asc, price_desc, or bestseller.",
                    ["page"] = "Page number to return (1-based).",
                    ["pageSize"] = "Number of items per page (default 12, maximum 200)."
                };

                foreach (var parameter in op.Parameters)
                {
                    if (descriptions.TryGetValue(parameter.Name, out var description))
                    {
                        parameter.Description = description;
                    }
                }

                if (op.Parameters.FirstOrDefault(p => string.Equals(p.Name, "sort", StringComparison.OrdinalIgnoreCase)) is { } sortParameter)
                {
                    sortParameter.Schema.Default = new OpenApiString("latest");
                }

                if (op.Parameters.FirstOrDefault(p => string.Equals(p.Name, "page", StringComparison.OrdinalIgnoreCase)) is { } pageParameter)
                {
                    pageParameter.Schema.Default = new OpenApiInteger(1);
                    pageParameter.Schema.Minimum = 1;
                }

                if (op.Parameters.FirstOrDefault(p => string.Equals(p.Name, "pageSize", StringComparison.OrdinalIgnoreCase)) is { } pageSizeParameter)
                {
                    pageSizeParameter.Schema.Default = new OpenApiInteger(12);
                    pageSizeParameter.Schema.Minimum = 1;
                    pageSizeParameter.Schema.Maximum = 200;
                }
            }

            return op;
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
    [FromQuery(Name = "q")] public string? Q { get; set; }
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