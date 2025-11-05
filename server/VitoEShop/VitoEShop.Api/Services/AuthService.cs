using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VitoEShop.Api.Configuration;
using VitoEShop.Contracts.Auth;
using VitoEShop.Infrastructure.Persistence;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Api.Services;

public class AuthService
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    private readonly VitoEShopDbContext _dbContext;
    private readonly JwtSettings _jwtSettings;

    public AuthService(VitoEShopDbContext dbContext, JwtSettings jwtSettings)
    {
        _dbContext = dbContext;
        _jwtSettings = jwtSettings;
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);

        var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (existingUser is not null)
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        var user = new User
        {
            Email = email,
            FullName = request.FullName.Trim(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            PasswordHash = HashPassword(request.Password)
        };

        await _dbContext.Users.AddAsync(user, cancellationToken);

        var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.Email == email, cancellationToken);
        if (customer is null)
        {
            customer = new Customer
            {
                Email = email,
                FullName = request.FullName.Trim(),
                Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
                UserId = user.UserId,
                UpdatedAtUtc = DateTime.UtcNow
            };

            await _dbContext.Customers.AddAsync(customer, cancellationToken);
        }
        else
        {
            if (customer.UserId.HasValue)
            {
                throw new InvalidOperationException("Customer already linked to an account.");
            }

            customer.UserId = user.UserId;
            customer.FullName = request.FullName.Trim();
            customer.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
            customer.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreateAuthResult(user, customer);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null || !user.IsActive || user.PasswordHash is null)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.UserId == user.UserId, cancellationToken);
        if (customer is null)
        {
            customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.Email == email, cancellationToken);
            if (customer is not null && !customer.UserId.HasValue)
            {
                customer.UserId = user.UserId;
                customer.UpdatedAtUtc = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        return CreateAuthResult(user, customer);
    }

    private AuthResult CreateAuthResult(User user, Customer? customer)
    {
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Email, user.Email),
            new("fullName", user.FullName)
        };

        if (customer is not null)
        {
            claims.Add(new Claim("customerId", customer.CustomerId.ToString()));
        }

        if (user.IsAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: creds);

        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

        return new AuthResult(
            tokenValue,
            expiresAtUtc,
            user.UserId,
            customer?.CustomerId,
            user.Email,
            user.FullName);
    }

    private static byte[] HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password cannot be empty.", nameof(password));
        }

        var salt = new byte[SaltSize];
        RandomNumberGenerator.Fill(salt);

        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);
        var result = new byte[SaltSize + KeySize];
        Buffer.BlockCopy(salt, 0, result, 0, SaltSize);
        Buffer.BlockCopy(hash, 0, result, SaltSize, KeySize);
        return result;
    }

    private static bool VerifyPassword(string password, byte[] storedHash)
    {
        if (storedHash.Length != SaltSize + KeySize)
        {
            return false;
        }

        var salt = new byte[SaltSize];
        Buffer.BlockCopy(storedHash, 0, salt, 0, SaltSize);

        var expectedHash = new byte[KeySize];
        Buffer.BlockCopy(storedHash, SaltSize, expectedHash, 0, KeySize);

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    private static string NormalizeEmail(string email)
        => email.Trim().ToLowerInvariant();

    public record AuthResult(
        string Token,
        DateTime ExpiresAtUtc,
        Guid UserId,
        Guid? CustomerId,
        string Email,
        string FullName);
}
