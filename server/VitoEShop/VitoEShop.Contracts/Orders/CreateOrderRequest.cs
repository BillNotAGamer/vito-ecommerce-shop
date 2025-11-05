using System.ComponentModel.DataAnnotations;

namespace VitoEShop.Contracts.Orders;

public class CreateOrderRequest
{
    public Guid CustomerId { get; set; }

    [EmailAddress]
    public string Email { get; set; } = default!;

    [Phone]
    public string? Phone { get; set; }

    public string? VoucherCode { get; set; }

    public ShipToDto ShipTo { get; set; } = new();

    public List<CartItemDto> Items { get; set; } = new();
}

public class ShipToDto
{
    public string Name { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Address { get; set; } = default!;
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public string? Notes { get; set; }
}
