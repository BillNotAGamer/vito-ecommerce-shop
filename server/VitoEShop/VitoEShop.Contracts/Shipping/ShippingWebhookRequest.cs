namespace VitoEShop.Contracts.Shipping;

public class ShippingWebhookRequest
{
    public string OrderNumber { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? EventTime { get; set; }
    public string? Note { get; set; }
}
