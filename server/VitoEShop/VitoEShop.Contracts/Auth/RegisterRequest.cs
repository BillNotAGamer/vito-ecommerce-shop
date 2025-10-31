using System.ComponentModel.DataAnnotations;

namespace VitoEShop.Contracts.Auth;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = default!;

    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = default!;

    [Phone]
    public string? Phone { get; set; }
}
