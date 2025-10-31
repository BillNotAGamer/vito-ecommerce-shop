using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using VitoEShop.Api.Services;
using VitoEShop.Contracts.Account;
using VitoEShop.Infrastructure.Repositories;

namespace EShop.Api.Endpoints;

public static class AccountEndpoints
{
    public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/account").RequireAuthorization();

        group.MapGet("/orders", async (ClaimsPrincipal user, AuthRepository authRepository, OrderService orderService, CancellationToken ct) =>
        {
            var userId = ResolveUserId(user);
            if (!userId.HasValue)
            {
                return Results.Json(new { error = "Unable to determine user identity." }, statusCode: StatusCodes.Status401Unauthorized);
            }

            var customerId = await authRepository.GetCustomerIdByUserIdAsync(userId.Value, ct);
            if (!customerId.HasValue)
            {
                return Results.Ok(Array.Empty<OrderSummaryDto>());
            }

            var orders = await orderService.GetOrdersForCustomerAsync(customerId.Value, ct);
            return Results.Ok(orders);
        })
        .WithName("Account_GetOrders")
        .WithOpenApi(op =>
        {
            op.Summary = "Retrieve the current user's order history.";
            return op;
        });

        return app;
    }

    private static Guid? ResolveUserId(ClaimsPrincipal principal)
    {
        var identifier = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);

        return Guid.TryParse(identifier, out var userId) ? userId : null;
    }
}
