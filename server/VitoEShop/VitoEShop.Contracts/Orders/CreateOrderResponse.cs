namespace VitoEShop.Contracts.Orders;

public class CreateOrderResponse
{
    public long OrderId { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Status { get; set; } = default!;
    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }
}
