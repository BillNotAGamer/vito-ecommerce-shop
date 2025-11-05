namespace VitoEShop.Infrastructure.Shipping;

public interface IShippingEventStore
{
    Task RecordAsync(ShippingEventEntry entry, CancellationToken cancellationToken = default);
}

public class ShippingEventEntry
{
    public string CarrierCode { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime EventTimeUtc { get; set; }
    public string? Note { get; set; }
    public DateTime RecordedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class NoOpShippingEventStore : IShippingEventStore
{
    public Task RecordAsync(ShippingEventEntry entry, CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}
