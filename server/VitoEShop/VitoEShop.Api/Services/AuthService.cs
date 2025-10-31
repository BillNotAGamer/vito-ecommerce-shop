using System;
using System.Threading;
using System.Threading.Tasks;
using VitoEShop.Contracts.Auth;
using VitoEShop.Infrastructure.Repositories;
using VitoEShop.Infrastructure.Security;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Api.Services;

public class AuthService
{
    private const string DefaultRole = "Customer";

    private readonly AuthRepository _repository;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtTokenService _jwtTokenService;

    public AuthService(AuthRepository repository, PasswordHasher passwordHasher, JwtTokenService jwtTokenService)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        var email = NormalizeEmail(request.Email);
        ValidatePassword(request.Password);

        var existingUser = await _repository.FindUserByEmailAsync(email, cancellationToken);
        if (existingUser is not null)
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        var (hash, salt) = _passwordHasher.HashPassword(request.Password);
        var user = new User
        {
            Email = email,
            FullName = NormalizeRequired(request.FullName, nameof(request.FullName)),
            Phone = NormalizeOptional(request.Phone),
            PasswordHash = hash,
            PasswordSalt = salt,
            CreatedAtUtc = DateTime.UtcNow
        };

        var customer = new Customer
        {
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            UserId = user.UserId,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _repository.CreateUserAndCustomerAsync(user, customer, cancellationToken);
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var user = await _repository.FindUserByEmailAsync(email, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var customerId = await _repository.EnsureCustomerForUserAsync(user, cancellationToken);
        var now = DateTime.UtcNow;
        var access = _jwtTokenService.GenerateAccessToken(user, customerId, DefaultRole);

        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
        var refreshToken = new UserRefreshToken
        {
            UserId = user.UserId,
            TokenHash = _jwtTokenService.HashRefreshToken(refreshTokenValue),
            CreatedAtUtc = now,
            ExpiresAtUtc = now.Add(_jwtTokenService.RefreshTokenLifetime),
            Device = NormalizeOptional(request.Device),
            Ip = NormalizeOptional(request.Ip)
        };

        await _repository.SaveRefreshTokenAsync(refreshToken, cancellationToken);

        return new TokenResponse
        {
            AccessToken = access.Token,
            RefreshToken = refreshTokenValue,
            ExpiresAt = access.ExpiresAt
        };
    }

    public async Task<TokenResponse> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        var hashed = _jwtTokenService.HashRefreshToken(request.RefreshToken);
        var existing = await _repository.GetRefreshTokenByHashAsync(hashed, cancellationToken);
        if (existing is null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        var now = DateTime.UtcNow;
        if (existing.RevokedAtUtc.HasValue || existing.ExpiresAtUtc <= now)
        {
            throw new UnauthorizedAccessException("Refresh token is no longer valid.");
        }

        var user = existing.User ?? throw new UnauthorizedAccessException("Refresh token is no longer valid.");
        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User is disabled.");
        }

        var customerId = await _repository.EnsureCustomerForUserAsync(user, cancellationToken);
        var access = _jwtTokenService.GenerateAccessToken(user, customerId, DefaultRole);

        var newRefreshValue = _jwtTokenService.GenerateRefreshToken();
        var replacement = new UserRefreshToken
        {
            UserId = user.UserId,
            TokenHash = _jwtTokenService.HashRefreshToken(newRefreshValue),
            RotationParentHash = existing.TokenHash,
            CreatedAtUtc = now,
            ExpiresAtUtc = now.Add(_jwtTokenService.RefreshTokenLifetime),
            Device = NormalizeOptional(request.Device) ?? existing.Device,
            Ip = NormalizeOptional(request.Ip) ?? existing.Ip
        };

        existing.RevokedAtUtc = now;
        await _repository.RotateRefreshTokenAsync(existing, replacement, cancellationToken);

        return new TokenResponse
        {
            AccessToken = access.Token,
            RefreshToken = newRefreshValue,
            ExpiresAt = access.ExpiresAt
        };
    }

    public async Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return;
        }

        var hashed = _jwtTokenService.HashRefreshToken(request.RefreshToken);
        var existing = await _repository.GetRefreshTokenByHashAsync(hashed, cancellationToken);
        if (existing is null || existing.RevokedAtUtc.HasValue)
        {
            return;
        }

        existing.RevokedAtUtc = DateTime.UtcNow;
        await _repository.RevokeRefreshTokenAsync(existing, cancellationToken);
    }

    private static string NormalizeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required.", nameof(email));
        }

        return email.Trim().ToLowerInvariant();
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters long.", nameof(password));
        }
    }

    private static string NormalizeRequired(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException($"{parameterName} is required.", parameterName);
        }

        return value.Trim();
    }

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
