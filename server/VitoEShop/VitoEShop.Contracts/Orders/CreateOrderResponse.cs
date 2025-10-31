namespace VitoEShop.Contracts.Orders;

public class CreateOrderResponse
{
    public long OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Status { get; set; } = default!;
}
