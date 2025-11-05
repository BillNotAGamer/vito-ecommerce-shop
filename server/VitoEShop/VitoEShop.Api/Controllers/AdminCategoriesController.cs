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
[Route("api/admin/categories")]
public class AdminCategoriesController : AdminControllerBase
{
    public AdminCategoriesController(VitoEShopDbContext dbContext)
        : base(dbContext)
    {
    }

    [HttpPost]
    public async Task<ActionResult<AdminCategoryDto>> CreateCategory(
        [FromBody] AdminCategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Name is required." });
        }

        if (request.ParentId.HasValue)
        {
            var parentExists = await DbContext.Categories
                .AnyAsync(c => c.CategoryId == request.ParentId.Value, cancellationToken);

            if (!parentExists)
            {
                return BadRequest(new { message = "Parent category does not exist." });
            }
        }

        var now = DateTime.UtcNow;
        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = BuildSlug(request.Slug, request.Name),
            ParentId = request.ParentId,
            IsActive = request.IsActive ?? true,
            SortOrder = request.SortOrder ?? 0,
            CreatedAtUtc = now
        };

        var actorUserId = GetCurrentUserId();

        await using var tx = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        DbContext.Categories.Add(category);
        await DbContext.SaveChangesAsync(cancellationToken);

        AddAdminLog(actorUserId, "CreateCategory", "Category", category.CategoryId.ToString(),
            JsonSerializer.Serialize(request));
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        var dto = MapCategory(category);
        return Created($"/api/admin/categories/{category.CategoryId}", dto);
    }

    [HttpPut("{categoryId:int}")]
    public async Task<ActionResult<AdminCategoryDto>> UpdateCategory(
        int categoryId,
        [FromBody] AdminCategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Name is required." });
        }

        if (request.ParentId.HasValue && request.ParentId.Value == categoryId)
        {
            return BadRequest(new { message = "Category cannot be its own parent." });
        }

        if (request.ParentId.HasValue)
        {
            var parentExists = await DbContext.Categories
                .AnyAsync(c => c.CategoryId == request.ParentId.Value, cancellationToken);

            if (!parentExists)
            {
                return BadRequest(new { message = "Parent category does not exist." });
            }
        }

        var category = await DbContext.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId, cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        category.Name = request.Name.Trim();
        category.Slug = BuildSlug(request.Slug, request.Name);
        category.ParentId = request.ParentId;
        category.IsActive = request.IsActive ?? category.IsActive;
        category.SortOrder = request.SortOrder ?? category.SortOrder;

        var actorUserId = GetCurrentUserId();

        await using var tx = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        AddAdminLog(actorUserId, "UpdateCategory", "Category", category.CategoryId.ToString(),
            JsonSerializer.Serialize(request));
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return Ok(MapCategory(category));
    }

    [HttpDelete("{categoryId:int}")]
    public async Task<IActionResult> DeactivateCategory(int categoryId, CancellationToken cancellationToken)
    {
        var category = await DbContext.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == categoryId, cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        category.IsActive = false;

        var actorUserId = GetCurrentUserId();

        await using var tx = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        AddAdminLog(actorUserId, "DeactivateCategory", "Category", category.CategoryId.ToString(),
            JsonSerializer.Serialize(new { categoryId }));
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return NoContent();
    }

    private static AdminCategoryDto MapCategory(Category category)
        => new(
            category.CategoryId,
            category.Name,
            category.Slug,
            category.ParentId,
            category.IsActive,
            category.SortOrder,
            category.CreatedAtUtc);
}
