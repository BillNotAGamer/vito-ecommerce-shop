namespace VitoEShop.Contracts.Account;

public class OrderSummaryDto
{
    public long OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string PaymentStatus { get; set; } = default!;
    public decimal GrandTotal { get; set; }
    public DateTime PlacedAtUtc { get; set; }
}
