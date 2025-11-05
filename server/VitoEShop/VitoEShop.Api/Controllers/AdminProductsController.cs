using System;
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
[Route("api/admin/products")]
public class AdminProductsController : AdminControllerBase
{
    public AdminProductsController(VitoEShopDbContext dbContext)
        : base(dbContext)
    {
    }

    [HttpPost]
    public async Task<ActionResult<AdminProductDto>> CreateProduct(
        [FromBody] AdminProductRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        var slug = BuildSlug(request.Slug, request.Title);
        var now = DateTime.UtcNow;
        var product = new Product
        {
            Title = request.Title.Trim(),
            Slug = slug,
            Sku = Normalize(request.Sku),
            Description = Normalize(request.Description),
            Material = Normalize(request.Material),
            Brand = Normalize(request.Brand),
            Status = string.IsNullOrWhiteSpace(request.Status) ? "active" : request.Status!.Trim(),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        var actorUserId = GetCurrentUserId();

        await using var tx = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        DbContext.Products.Add(product);
        await DbContext.SaveChangesAsync(cancellationToken);

        AddAdminLog(actorUserId, "CreateProduct", "Product", product.ProductId.ToString(),
            JsonSerializer.Serialize(request));
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        var dto = MapProduct(product);
        return Created($"/api/admin/products/{product.ProductId}", dto);
    }

    [HttpPut("{productId:long}")]
    public async Task<ActionResult<AdminProductDto>> UpdateProduct(
        long productId,
        [FromBody] AdminProductRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        var product = await DbContext.Products
            .FirstOrDefaultAsync(p => p.ProductId == productId, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        var now = DateTime.UtcNow;
        product.Title = request.Title.Trim();
        product.Slug = BuildSlug(request.Slug, request.Title);
        product.Sku = Normalize(request.Sku);
        product.Description = Normalize(request.Description);
        product.Material = Normalize(request.Material);
        product.Brand = Normalize(request.Brand);
        product.Status = string.IsNullOrWhiteSpace(request.Status)
            ? product.Status
            : request.Status!.Trim();
        product.UpdatedAtUtc = now;

        var actorUserId = GetCurrentUserId();

        await using var tx = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        AddAdminLog(actorUserId, "UpdateProduct", "Product", product.ProductId.ToString(),
            JsonSerializer.Serialize(request));
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return Ok(MapProduct(product));
    }

    [HttpDelete("{productId:long}")]
    public async Task<IActionResult> DeleteProduct(long productId, CancellationToken cancellationToken)
    {
        var product = await DbContext.Products
            .FirstOrDefaultAsync(p => p.ProductId == productId, cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        var now = DateTime.UtcNow;
        product.Status = "inactive";
        product.UpdatedAtUtc = now;

        var actorUserId = GetCurrentUserId();

        await using var tx = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        AddAdminLog(actorUserId, "DeactivateProduct", "Product", product.ProductId.ToString(),
            JsonSerializer.Serialize(new { productId }));
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return NoContent();
    }

    private static AdminProductDto MapProduct(Product product)
        => new(
            product.ProductId,
            product.Title,
            product.Slug,
            product.Sku,
            product.Description,
            product.Material,
            product.Brand,
            product.Status,
            product.CreatedAtUtc,
            product.UpdatedAtUtc);
}
