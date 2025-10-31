using Microsoft.AspNetCore.Mvc;
using VitoEShop.Api.Services;
using VitoEShop.Contracts.Auth;

namespace VitoEShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _authService.RegisterAsync(request, cancellationToken);
            return Ok(ToResponse(result));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _authService.LoginAsync(request, cancellationToken);
            return Ok(ToResponse(result));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
    }

    private static AuthResponse ToResponse(AuthService.AuthResult result)
        => new()
        {
            Token = result.Token,
            ExpiresAtUtc = result.ExpiresAtUtc,
            UserId = result.UserId,
            CustomerId = result.CustomerId,
            Email = result.Email,
            FullName = result.FullName
        };
}
