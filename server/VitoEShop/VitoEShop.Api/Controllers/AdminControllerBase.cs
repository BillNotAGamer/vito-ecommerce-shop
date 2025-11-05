using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VitoEShop.Infrastructure.Persistence;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Api.Controllers;

public abstract class AdminControllerBase : ControllerBase
{
    protected AdminControllerBase(VitoEShopDbContext dbContext)
    {
        DbContext = dbContext;
    }

    protected VitoEShopDbContext DbContext { get; }

    protected Guid GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("User identifier claim is missing.");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new InvalidOperationException("User identifier claim is invalid.");
        }

        return userId;
    }

    protected void AddAdminLog(Guid actorUserId, string action, string entity, string entityId, string? detail)
    {
        DbContext.AdminActivityLogs.Add(new AdminActivityLog
        {
            ActorUserId = actorUserId,
            Action = action,
            Entity = entity,
            EntityId = entityId,
            Detail = detail,
            CreatedAtUtc = DateTime.UtcNow
        });
    }

    protected static string? Normalize(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    protected static string BuildSlug(string? slug, string fallback)
    {
        var source = string.IsNullOrWhiteSpace(slug) ? fallback : slug;
        source = source.Trim().ToLowerInvariant();
        var parts = source
            .Split(new[] { ' ', '\t', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Trim('-'))
            .Where(p => !string.IsNullOrEmpty(p));
        var normalized = string.Join('-', parts);
        return string.IsNullOrWhiteSpace(normalized) ? Guid.NewGuid().ToString("n") : normalized;
    }
}
