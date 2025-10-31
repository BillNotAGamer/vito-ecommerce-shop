namespace VitoEShop.Contracts.Account;

public class OrderSummaryDto
{
    public long OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime PlacedAtUtc { get; set; }
    public decimal GrandTotal { get; set; }
}
