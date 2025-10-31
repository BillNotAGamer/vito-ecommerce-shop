using System.ComponentModel.DataAnnotations;

namespace VitoEShop.Contracts.Auth;

public class RefreshRequest
{
    [Required]
    public string RefreshToken { get; set; } = default!;

    public string? Device { get; set; }

    public string? Ip { get; set; }
}
