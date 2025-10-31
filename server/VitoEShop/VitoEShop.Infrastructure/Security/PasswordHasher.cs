using System;
using System.Security.Cryptography;

namespace VitoEShop.Infrastructure.Security;

public class PasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    public (byte[] Hash, byte[] Salt) HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password cannot be empty.", nameof(password));
        }

        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            KeySize);

        return (hash, salt);
    }

    public bool Verify(string password, byte[] hash, byte[] salt)
    {
        if (hash is null || hash.Length != KeySize)
        {
            return false;
        }

        if (salt is null || salt.Length != SaltSize)
        {
            return false;
        }

        var computed = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            KeySize);

        return CryptographicOperations.FixedTimeEquals(computed, hash);
    }
}
