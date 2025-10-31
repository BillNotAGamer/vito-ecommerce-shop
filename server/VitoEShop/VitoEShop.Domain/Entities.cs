using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VitoEShop.Domain
{
    public class Entities
    {
        public class User
        {
            public Guid UserId { get; set; } = Guid.NewGuid();
            public string Email { get; set; } = default!;
            public string? Phone { get; set; }
            public byte[] PasswordHash { get; set; } = Array.Empty<byte>();
            public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();
            public string FullName { get; set; } = default!;
            public bool IsActive { get; set; } = true;
            public bool IsAdmin { get; set; }
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
            public DateTime? UpdatedAtUtc { get; set; }
            public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
            public ICollection<UserRefreshToken> RefreshTokens { get; set; } = new List<UserRefreshToken>();
        }

        public class UserRefreshToken
        {
            public long Id { get; set; }
            public Guid UserId { get; set; }
            public string TokenHash { get; set; } = default!;
            public string? RotationParentHash { get; set; }
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
            public DateTime ExpiresAtUtc { get; set; }
            public DateTime? RevokedAtUtc { get; set; }
            public string? Device { get; set; }
            public string? Ip { get; set; }
            public User User { get; set; } = default!;
        }

        public class Role
        {
            public int RoleId { get; set; }
            public string Name { get; set; } = default!;
            public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        }

        public class UserRole
        {
            public Guid UserId { get; set; }
            public int RoleId { get; set; }
            public User User { get; set; } = default!;
            public Role Role { get; set; } = default!;
        }

        public class Customer
        {
            public Guid CustomerId { get; set; } = Guid.NewGuid();
            public Guid? UserId { get; set; }
            public string Email { get; set; } = default!;
            public string? Phone { get; set; }
            public string FullName { get; set; } = default!;
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
            public DateTime? UpdatedAtUtc { get; set; }
            public ICollection<CustomerAddress> Addresses { get; set; } = new List<CustomerAddress>();
        }

        public class CustomerAddress
        {
            public long AddressId { get; set; }
            public Guid CustomerId { get; set; }
            public string? Label { get; set; }
            public string Recipient { get; set; } = default!;
            public string Phone { get; set; } = default!;
            public string CountryCode { get; set; } = "VN";
            public int? ProvinceId { get; set; }
            public string? District { get; set; }
            public string? Ward { get; set; }
            public string Street { get; set; } = default!;
            public bool IsDefault { get; set; }
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        }

        public class Category
        {
            public int CategoryId { get; set; }
            public int? ParentId { get; set; }
            public string Name { get; set; } = default!;
            public string Slug { get; set; } = default!;
            public bool IsActive { get; set; } = true;
            public int SortOrder { get; set; }
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        }

        public class Product
        {
            public long ProductId { get; set; }
            public string Title { get; set; } = default!;
            public string Slug { get; set; } = default!;
            public string? Sku { get; set; }
            public string? Description { get; set; }
            public string? Material { get; set; }
            public string? Brand { get; set; }
            public string Status { get; set; } = "active";
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
            public DateTime? UpdatedAtUtc { get; set; }
        }

        public class ProductVariant
        {
            public long VariantId { get; set; }
            public long ProductId { get; set; }
            public string Sku { get; set; } = default!;
            public string? Size { get; set; }
            public string? Color { get; set; }
            public decimal Price { get; set; }
            public decimal? CompareAtPrice { get; set; }
            public int? WeightGrams { get; set; }
            public string? Barcode { get; set; }
            public bool IsActive { get; set; } = true;
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
            public DateTime? UpdatedAtUtc { get; set; }
        }

        public class ProductImage
        {
            public long ImageId { get; set; }
            public long ProductId { get; set; }
            public string Url { get; set; } = default!;
            public string? AltText { get; set; }
            public int SortOrder { get; set; }
            public bool IsPrimary { get; set; }
        }

        public class VariantImage
        {
            public long Id { get; set; }
            public long VariantId { get; set; }
            public string Url { get; set; } = default!;
            public string? AltText { get; set; }
            public int SortOrder { get; set; }
        }

        public class ProductCategory
        {
            public long ProductId { get; set; }
            public int CategoryId { get; set; }
        }

        public class Warehouse
        {
            public int WarehouseId { get; set; }
            public string Name { get; set; } = default!;
            public bool IsActive { get; set; } = true;
        }

        public class Inventory
        {
            public int WarehouseId { get; set; }
            public long VariantId { get; set; }
            public int OnHand { get; set; }
            public int Reserved { get; set; }
            public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
        }

        public class OrderStatusRef { public string StatusCode { get; set; } = default!; public int SortOrder { get; set; } }
        public class PaymentStatusRef { public string StatusCode { get; set; } = default!; public int SortOrder { get; set; } }
        public class PaymentMethodRef { public string MethodCode { get; set; } = default!; public string DisplayName { get; set; } = default!; }
        public class CarrierRef { public string CarrierCode { get; set; } = default!; public string DisplayName { get; set; } = default!; }

        public class Order
        {
            public long OrderId { get; set; }
            public string OrderNumber { get; set; } = default!;
            public Guid CustomerId { get; set; }
            public string Email { get; set; } = default!;
            public string? Phone { get; set; }
            public string ShipToName { get; set; } = default!;
            public string ShipToAddress { get; set; } = default!;
            public string? ShipToProvince { get; set; }
            public string? ShipToDistrict { get; set; }
            public string? ShipToWard { get; set; }
            public string? Notes { get; set; }

            public decimal Subtotal { get; set; }
            public decimal DiscountTotal { get; set; }
            public decimal ShippingFee { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal GrandTotal { get; set; }

            public string Status { get; set; } = default!;
            public string PaymentStatus { get; set; } = default!;
            public string PaymentMethod { get; set; } = default!;
            public string? VoucherCode { get; set; }

            public string? CarrierCode { get; set; }
            public string? TrackingNumber { get; set; }

            public DateTime PlacedAtUtc { get; set; } = DateTime.UtcNow;
            public DateTime? ConfirmedAtUtc { get; set; }
            public DateTime? ShippedAtUtc { get; set; }
            public DateTime? DeliveredAtUtc { get; set; }
            public DateTime? CancelledAtUtc { get; set; }
            public DateTime? UpdatedAtUtc { get; set; }
        }

        public class OrderItem
        {
            public long OrderItemId { get; set; }
            public long OrderId { get; set; }
            public long ProductId { get; set; }
            public long VariantId { get; set; }
            public string Title { get; set; } = default!;
            public string Sku { get; set; } = default!;
            public string? Size { get; set; }
            public string? Color { get; set; }
            public decimal Price { get; set; }
            public int Quantity { get; set; }
            public decimal LineTotal { get; set; }
        }

        public class Shipment
        {
            public long ShipmentId { get; set; }
            public long OrderId { get; set; }
            public string CarrierCode { get; set; } = default!;
            public string TrackingNumber { get; set; } = default!;
            public string Status { get; set; } = default!;
            public DateTime LastUpdateUtc { get; set; } = DateTime.UtcNow;
        }

        public class Promotion
        {
            public long PromotionId { get; set; }
            public string Name { get; set; } = default!;
            public string? Description { get; set; }
            public string Type { get; set; } = default!; // PERCENT/AMOUNT/...
            public decimal DiscountValue { get; set; }
            public decimal? MaxDiscount { get; set; }
            public DateTime StartsAtUtc { get; set; }
            public DateTime? EndsAtUtc { get; set; }
            public bool IsActive { get; set; }
        }

        public class PromotionProduct
        {
            public long PromotionId { get; set; }
            public long? ProductId { get; set; }
            public long? VariantId { get; set; }
        }

        public class Voucher
        {
            public string VoucherCode { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Type { get; set; } = default!; // PERCENT/AMOUNT/FREESHIP
            public decimal DiscountValue { get; set; }
            public decimal? MaxDiscount { get; set; }
            public decimal? MinOrderValue { get; set; }
            public int? UsageLimit { get; set; }
            public int? PerUserLimit { get; set; }
            public DateTime StartsAtUtc { get; set; }
            public DateTime? EndsAtUtc { get; set; }
            public bool IsActive { get; set; } = true;
        }

        public class VoucherRedemption
        {
            public long Id { get; set; }
            public string VoucherCode { get; set; } = default!;
            public Guid CustomerId { get; set; }
            public long? OrderId { get; set; }
            public DateTime RedeemedAtUtc { get; set; } = DateTime.UtcNow;
        }

        public class Wishlist
        {
            public Guid CustomerId { get; set; }
            public long ProductId { get; set; }
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        }

        public class ProductReview
        {
            public long ReviewId { get; set; }
            public long ProductId { get; set; } 
            public Guid CustomerId { get; set; }
            public byte Rating { get; set; } // 1..5
            public string? Title { get; set; }
            public string? Content { get; set; }
            public bool IsApproved { get; set; }
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        }

        public class MemberTierRef { public string TierCode { get; set; } = default!; public string Name { get; set; } = default!; public int MinOrders { get; set; } public int? MaxOrders { get; set; } }
        public class CustomerTier
        {
            public Guid CustomerId { get; set; }
            public int OrderCount { get; set; }
            public string TierCode { get; set; } = default!;
            public DateTime LastCalcUtc { get; set; } = DateTime.UtcNow;
        }

        public class AdminActivityLog
        {
            public long LogId { get; set; }
            public Guid ActorUserId { get; set; }
            public string Action { get; set; } = default!;
            public string Entity { get; set; } = default!;
            public string EntityId { get; set; } = default!;
            public string? Detail { get; set; }
            public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        }
    }
}
