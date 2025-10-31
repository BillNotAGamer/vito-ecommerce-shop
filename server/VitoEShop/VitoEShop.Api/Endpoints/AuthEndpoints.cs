using System;
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VitoEShop.Api.Services;
using VitoEShop.Contracts.Auth;

namespace EShop.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async ([FromBody] RegisterRequest request, AuthService authService, CancellationToken ct) =>
        {
            try
            {
                await authService.RegisterAsync(request, ct);
                return Results.Created("/api/auth/login", new { message = "Account registered." });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("Auth_Register")
        .WithOpenApi(op =>
        {
            op.Summary = "Register a new user account.";
            return op;
        });

        group.MapPost("/login", async ([FromBody] LoginRequest request, AuthService authService, HttpContext context, CancellationToken ct) =>
        {
            try
            {
                request.Ip ??= context.Connection.RemoteIpAddress?.ToString();
                var response = await authService.LoginAsync(request, ct);
                return Results.Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { error = ex.Message }, statusCode: StatusCodes.Status401Unauthorized);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("Auth_Login")
        .WithOpenApi(op =>
        {
            op.Summary = "Authenticate a user and issue access/refresh tokens.";
            return op;
        });

        group.MapPost("/refresh", async ([FromBody] RefreshRequest request, AuthService authService, HttpContext context, CancellationToken ct) =>
        {
            try
            {
                request.Ip ??= context.Connection.RemoteIpAddress?.ToString();
                var response = await authService.RefreshAsync(request, ct);
                return Results.Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { error = ex.Message }, statusCode: StatusCodes.Status401Unauthorized);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("Auth_Refresh")
        .WithOpenApi(op =>
        {
            op.Summary = "Exchange a valid refresh token for a new access token.";
            return op;
        });

        group.MapPost("/logout", async ([FromBody] LogoutRequest request, AuthService authService, CancellationToken ct) =>
        {
            await authService.LogoutAsync(request, ct);
            return Results.NoContent();
        })
        .WithName("Auth_Logout")
        .WithOpenApi(op =>
        {
            op.Summary = "Revoke the provided refresh token.";
            return op;
        });

        return app;
    }
}
