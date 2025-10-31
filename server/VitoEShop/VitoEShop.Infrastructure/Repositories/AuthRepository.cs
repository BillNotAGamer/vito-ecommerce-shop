using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VitoEShop.Infrastructure.Persistence;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Infrastructure.Repositories;

public class AuthRepository
{
    private readonly VitoEShopDbContext _dbContext;

    public AuthRepository(VitoEShopDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<User?> FindUserByEmailAsync(string email, CancellationToken cancellationToken)
        => _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task CreateUserAndCustomerAsync(User user, Customer customer, CancellationToken cancellationToken)
    {
        await using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        await _dbContext.Users.AddAsync(user, cancellationToken);
        customer.UserId = user.UserId;
        await _dbContext.Customers.AddAsync(customer, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);
    }

    public async Task<Guid> EnsureCustomerForUserAsync(User user, CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Customers
            .Where(c => c.UserId == user.UserId)
            .Select(c => (Guid?)c.CustomerId)
            .FirstOrDefaultAsync(cancellationToken);
        if (existing.HasValue)
        {
            return existing.Value;
        }

        var byEmail = await _dbContext.Customers
            .FirstOrDefaultAsync(c => c.Email == user.Email, cancellationToken);
        if (byEmail is not null)
        {
            byEmail.UserId = user.UserId;
            byEmail.FullName = user.FullName;
            byEmail.Phone = user.Phone;
            byEmail.UpdatedAtUtc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return byEmail.CustomerId;
        }

        var customer = new Customer
        {
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            UserId = user.UserId,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _dbContext.Customers.AddAsync(customer, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return customer.CustomerId;
    }

    public Task<Guid?> GetCustomerIdByUserIdAsync(Guid userId, CancellationToken cancellationToken)
        => _dbContext.Customers
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Select(c => (Guid?)c.CustomerId)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task SaveRefreshTokenAsync(UserRefreshToken token, CancellationToken cancellationToken)
    {
        await _dbContext.UserRefreshTokens.AddAsync(token, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<UserRefreshToken?> GetRefreshTokenByHashAsync(string tokenHash, CancellationToken cancellationToken)
        => _dbContext.UserRefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

    public async Task RotateRefreshTokenAsync(UserRefreshToken current, UserRefreshToken replacement, CancellationToken cancellationToken)
    {
        await using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        _dbContext.UserRefreshTokens.Update(current);
        await _dbContext.UserRefreshTokens.AddAsync(replacement, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);
    }

    public async Task RevokeRefreshTokenAsync(UserRefreshToken token, CancellationToken cancellationToken)
    {
        _dbContext.UserRefreshTokens.Update(token);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
