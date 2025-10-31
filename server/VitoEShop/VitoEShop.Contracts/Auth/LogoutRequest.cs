using System.ComponentModel.DataAnnotations;

namespace VitoEShop.Contracts.Auth;

public class LogoutRequest
{
    [Required]
    public string RefreshToken { get; set; } = default!;
}
