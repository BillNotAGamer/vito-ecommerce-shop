namespace VitoEShop.Contracts.Auth;

public class AuthResponse
{
    public Guid UserId { get; set; }
    public Guid? CustomerId { get; set; }
    public string Email { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Token { get; set; } = default!;
    public DateTime ExpiresAtUtc { get; set; }
}
