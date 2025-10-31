using System.ComponentModel.DataAnnotations;

namespace VitoEShop.Contracts.Auth;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    public string Password { get; set; } = default!;

    public string? Device { get; set; }

    public string? Ip { get; set; }
}
