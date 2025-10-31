using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Infrastructure.Security;

public class JwtTokenService
{
    private readonly SymmetricSecurityKey _signingKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly TimeSpan _accessTokenLifetime;
    private readonly TimeSpan _refreshTokenLifetime;

    public JwtTokenService(IConfiguration configuration)
    {
        var section = configuration.GetSection("Jwt")
            ?? throw new InvalidOperationException("JWT configuration section is missing.");

        _issuer = section["Issuer"]
            ?? throw new InvalidOperationException("Jwt:Issuer configuration is required.");
        _audience = section["Audience"]
            ?? throw new InvalidOperationException("Jwt:Audience configuration is required.");

        var key = section["Key"]
            ?? throw new InvalidOperationException("Jwt:Key configuration is required.");
        if (key.Length < 32)
        {
            throw new InvalidOperationException("Jwt:Key must be at least 32 characters long.");
        }

        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var accessMinutes = section.GetValue("AccessTokenMinutes", 15);
        var refreshDays = section.GetValue("RefreshTokenDays", 30);
        _accessTokenLifetime = TimeSpan.FromMinutes(accessMinutes);
        _refreshTokenLifetime = TimeSpan.FromDays(refreshDays);
    }

    public JwtTokenResult GenerateAccessToken(User user, Guid customerId, string? role)
    {
        var now = DateTime.UtcNow;
        var expires = now.Add(_accessTokenLifetime);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new("customer_id", customerId.ToString())
        };

        if (!string.IsNullOrWhiteSpace(role))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: credentials);

        var value = new JwtSecurityTokenHandler().WriteToken(token);
        return new JwtTokenResult(value, expires);
    }

    public string GenerateRefreshToken()
    {
        Span<byte> buffer = stackalloc byte[64];
        RandomNumberGenerator.Fill(buffer);
        return Convert.ToBase64String(buffer);
    }

    public string HashRefreshToken(string token)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    public TimeSpan RefreshTokenLifetime => _refreshTokenLifetime;

    public TimeSpan AccessTokenLifetime => _accessTokenLifetime;

    public readonly record struct JwtTokenResult(string Token, DateTime ExpiresAt);
}
