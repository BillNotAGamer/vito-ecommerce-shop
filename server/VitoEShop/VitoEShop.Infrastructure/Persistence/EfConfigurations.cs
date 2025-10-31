using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static VitoEShop.Domain.Entities;

namespace VitoEShop.Infrastructure.Persistence
{
    // Lớp "vỏ" gom tất cả config + seed
    public static class EfConfigurations
    {
        // 1) SEED THAM CHIẾU
        public static class SeedRefs
        {
            public static void Seed(ModelBuilder mb)
            {
                mb.Entity<OrderStatusRef>().HasData(
                    new OrderStatusRef { StatusCode = "Pending", SortOrder = 0 },
                    new OrderStatusRef { StatusCode = "Confirmed", SortOrder = 1 },
                    new OrderStatusRef { StatusCode = "Shipped", SortOrder = 2 },
                    new OrderStatusRef { StatusCode = "Delivered", SortOrder = 3 },
                    new OrderStatusRef { StatusCode = "Cancelled", SortOrder = 9 }
                );
                mb.Entity<PaymentStatusRef>().HasData(
                    new PaymentStatusRef { StatusCode = "Pending", SortOrder = 0 },
                    new PaymentStatusRef { StatusCode = "Authorized", SortOrder = 1 },
                    new PaymentStatusRef { StatusCode = "Paid", SortOrder = 2 },
                    new PaymentStatusRef { StatusCode = "Failed", SortOrder = 9 },
                    new PaymentStatusRef { StatusCode = "Refunded", SortOrder = 10 }
                );
                mb.Entity<PaymentMethodRef>().HasData(
                    new PaymentMethodRef { MethodCode = "COD", DisplayName = "Thanh toán khi nhận hàng" },
                    new PaymentMethodRef { MethodCode = "VNPAY", DisplayName = "VNPay" },
                    new PaymentMethodRef { MethodCode = "MOMO", DisplayName = "MoMo" },
                    new PaymentMethodRef { MethodCode = "CARD", DisplayName = "Thẻ ngân hàng" }
                );
                mb.Entity<CarrierRef>().HasData(
                    new CarrierRef { CarrierCode = "GHN", DisplayName = "Giao Hàng Nhanh" },
                    new CarrierRef { CarrierCode = "GHTK", DisplayName = "Giao Hàng Tiết Kiệm" },
                    new CarrierRef { CarrierCode = "VNPOST", DisplayName = "VNPost" }
                );
                mb.Entity<MemberTierRef>().HasData(
                    new MemberTierRef { TierCode = "Bronze", Name = "Đồng", MinOrders = 0, MaxOrders = 2 },
                    new MemberTierRef { TierCode = "Silver", Name = "Bạc", MinOrders = 3, MaxOrders = 9 },
                    new MemberTierRef { TierCode = "Gold", Name = "Vàng", MinOrders = 10, MaxOrders = 24 },
                    new MemberTierRef { TierCode = "Platinum", Name = "Bạch kim", MinOrders = 25, MaxOrders = null }
                );
                mb.Entity<Warehouse>().HasData(new Warehouse { WarehouseId = 1, Name = "Kho chính", IsActive = true });
            }
        }

        // 2) TẤT CẢ CÁC CẤU HÌNH (đều để public để ApplyConfigurationsFromAssembly có thể quét)
        public class UserCfg : IEntityTypeConfiguration<User>
        {
            public void Configure(EntityTypeBuilder<User> b)
            {
                b.HasKey(x => x.UserId);
                b.HasIndex(x => x.Email).IsUnique();
                b.Property(x => x.PasswordHash).IsRequired();
                b.Property(x => x.PasswordSalt).IsRequired();
                b.HasMany(x => x.RefreshTokens)
                    .WithOne(x => x.User)
                    .HasForeignKey(x => x.UserId);
            }
        }
        public class RoleCfg : IEntityTypeConfiguration<Role>
        {
            public void Configure(EntityTypeBuilder<Role> b)
            {
                b.HasKey(x => x.RoleId);
                b.HasIndex(x => x.Name).IsUnique();
            }
        }
        public class UserRoleCfg : IEntityTypeConfiguration<UserRole>
        {
            public void Configure(EntityTypeBuilder<UserRole> b)
            {
                b.HasKey(x => new { x.UserId, x.RoleId });
                b.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId);
                b.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
            }
        }
        public class CustomerCfg : IEntityTypeConfiguration<Customer>
        {
            public void Configure(EntityTypeBuilder<Customer> b)
            {
                b.HasKey(x => x.CustomerId);
                b.HasIndex(x => x.Email).IsUnique();
            }
        }
        public class UserRefreshTokenCfg : IEntityTypeConfiguration<UserRefreshToken>
        {
            public void Configure(EntityTypeBuilder<UserRefreshToken> b)
            {
                b.HasKey(x => x.Id);
                b.Property(x => x.TokenHash).IsRequired().HasMaxLength(256);
                b.Property(x => x.RotationParentHash).HasMaxLength(256);
                b.Property(x => x.Device).HasMaxLength(256);
                b.Property(x => x.Ip).HasMaxLength(64);
                b.HasIndex(x => x.UserId);
                b.HasIndex(x => x.TokenHash).IsUnique();
            }
        }
        public class CustomerAddressCfg : IEntityTypeConfiguration<CustomerAddress>
        {
            public void Configure(EntityTypeBuilder<CustomerAddress> b)
            {
                b.HasKey(x => x.AddressId);
                b.HasIndex(x => new { x.CustomerId, x.IsDefault });
            }
        }
        public class CategoryCfg : IEntityTypeConfiguration<Category>
        {
            public void Configure(EntityTypeBuilder<Category> b)
            {
                b.HasKey(x => x.CategoryId);
                b.HasIndex(x => x.Slug).IsUnique();
                b.HasOne<Category>().WithMany().HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.NoAction);
            }
        }
        public class ProductCfg : IEntityTypeConfiguration<Product>
        {
            public void Configure(EntityTypeBuilder<Product> b)
            {
                b.HasKey(x => x.ProductId);
                b.HasIndex(x => x.Slug).IsUnique();
                b.HasIndex(x => x.Status);
                b.Property(x => x.Title).HasMaxLength(256).IsRequired();
            }
        }
        public class ProductVariantCfg : IEntityTypeConfiguration<ProductVariant>
        {
            public void Configure(EntityTypeBuilder<ProductVariant> b)
            {
                b.HasKey(x => x.VariantId);
                b.HasIndex(x => new { x.ProductId, x.IsActive });
                b.HasIndex(x => x.Sku).IsUnique();
            }
        }
        public class ProductImageCfg : IEntityTypeConfiguration<ProductImage>
        {
            public void Configure(EntityTypeBuilder<ProductImage> b)
            {
                b.HasKey(x => x.ImageId);
                b.HasIndex(x => new { x.ProductId, x.IsPrimary, x.SortOrder });
            }
        }
        public class VariantImageCfg : IEntityTypeConfiguration<VariantImage>
        {
            public void Configure(EntityTypeBuilder<VariantImage> b)
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => new { x.VariantId, x.SortOrder });
            }
        }

        public class ProductCategoryCfg : IEntityTypeConfiguration<ProductCategory>
        {
            public void Configure(EntityTypeBuilder<ProductCategory> b)
            {
                b.HasKey(x => new { x.ProductId, x.CategoryId });
                b.HasIndex(x => x.CategoryId);
            }
        }


        public class WarehouseCfg : IEntityTypeConfiguration<Warehouse>
        {
            public void Configure(EntityTypeBuilder<Warehouse> b) => b.HasKey(x => x.WarehouseId);
        }
        public class InventoryCfg : IEntityTypeConfiguration<Inventory>
        {
            public void Configure(EntityTypeBuilder<Inventory> b)
            {
                b.HasKey(x => new { x.WarehouseId, x.VariantId });
                b.HasCheckConstraint("CK_Inventory_NonNegative", "[OnHand] >= 0 AND [Reserved] >= 0");
                b.HasIndex(x => x.VariantId);
            }
        }

        public class OrderStatusRefCfg : IEntityTypeConfiguration<OrderStatusRef>
        {
            public void Configure(EntityTypeBuilder<OrderStatusRef> b) => b.HasKey(x => x.StatusCode);
        }
        public class PaymentStatusRefCfg : IEntityTypeConfiguration<PaymentStatusRef>
        {
            public void Configure(EntityTypeBuilder<PaymentStatusRef> b) => b.HasKey(x => x.StatusCode);
        }
        public class PaymentMethodRefCfg : IEntityTypeConfiguration<PaymentMethodRef>
        {
            public void Configure(EntityTypeBuilder<PaymentMethodRef> b) => b.HasKey(x => x.MethodCode);
        }
        public class CarrierRefCfg : IEntityTypeConfiguration<CarrierRef>
        {
            public void Configure(EntityTypeBuilder<CarrierRef> b) => b.HasKey(x => x.CarrierCode);
        }

        public class OrderCfg : IEntityTypeConfiguration<Order>
        {
            public void Configure(EntityTypeBuilder<Order> b)
            {
                b.HasKey(x => x.OrderId);
                b.HasIndex(x => x.OrderNumber).IsUnique();
                b.HasIndex(x => new { x.CustomerId, x.PlacedAtUtc });
                b.HasIndex(x => new { x.Status, x.PlacedAtUtc });
                b.HasIndex(x => x.TrackingNumber);

                b.HasOne<OrderStatusRef>().WithMany().HasForeignKey(x => x.Status).OnDelete(DeleteBehavior.NoAction);
                b.HasOne<PaymentStatusRef>().WithMany().HasForeignKey(x => x.PaymentStatus).OnDelete(DeleteBehavior.NoAction);
                b.HasOne<PaymentMethodRef>().WithMany().HasForeignKey(x => x.PaymentMethod).OnDelete(DeleteBehavior.NoAction);
                b.HasOne<CarrierRef>().WithMany().HasForeignKey(x => x.CarrierCode).OnDelete(DeleteBehavior.NoAction);
            }
        }
        public class OrderItemCfg : IEntityTypeConfiguration<OrderItem>
        {
            public void Configure(EntityTypeBuilder<OrderItem> b)
            {
                b.HasKey(x => x.OrderItemId);
                b.HasIndex(x => x.OrderId);
            }
        }
        public class ShipmentCfg : IEntityTypeConfiguration<Shipment>
        {
            public void Configure(EntityTypeBuilder<Shipment> b)
            {
                b.HasKey(x => x.ShipmentId);
                b.HasIndex(x => new { x.CarrierCode, x.TrackingNumber }).IsUnique();
            }
        }

        public class PromotionCfg : IEntityTypeConfiguration<Promotion>
        {
            public void Configure(EntityTypeBuilder<Promotion> b)
            {
                b.HasKey(x => x.PromotionId);
                b.HasIndex(x => x.IsActive);
            }
        }
        public class PromotionProductCfg : IEntityTypeConfiguration<PromotionProduct>
        {
            public void Configure(EntityTypeBuilder<PromotionProduct> b)
            {
                b.HasKey(x => new { x.PromotionId, x.ProductId, x.VariantId });
            }
        }
        public class VoucherCfg : IEntityTypeConfiguration<Voucher>
        {
            public void Configure(EntityTypeBuilder<Voucher> b)
            {
                b.HasKey(x => x.VoucherCode);
                b.HasIndex(x => x.IsActive);
            }
        }
        public class VoucherRedemptionCfg : IEntityTypeConfiguration<VoucherRedemption>
        {
            public void Configure(EntityTypeBuilder<VoucherRedemption> b)
            {
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.VoucherCode);
                b.HasIndex(x => x.CustomerId);
            }
        }

        public class WishlistCfg : IEntityTypeConfiguration<Wishlist>
        {
            public void Configure(EntityTypeBuilder<Wishlist> b)
            {
                b.HasKey(x => new { x.CustomerId, x.ProductId });
            }
        }
        public class ProductReviewCfg : IEntityTypeConfiguration<ProductReview>
        {
            public void Configure(EntityTypeBuilder<ProductReview> b)
            {
                b.HasKey(x => x.ReviewId);
                b.HasIndex(x => new { x.ProductId, x.IsApproved });
            }
        }
        public class MemberTierRefCfg : IEntityTypeConfiguration<MemberTierRef>
        {
            public void Configure(EntityTypeBuilder<MemberTierRef> b) => b.HasKey(x => x.TierCode);
        }
        public class CustomerTierCfg : IEntityTypeConfiguration<CustomerTier>
        {
            public void Configure(EntityTypeBuilder<CustomerTier> b) => b.HasKey(x => x.CustomerId);
        }
        public class AdminActivityLogCfg : IEntityTypeConfiguration<AdminActivityLog>
        {
            public void Configure(EntityTypeBuilder<AdminActivityLog> b)
            {
                b.HasKey(x => x.LogId);
                b.HasIndex(x => new { x.ActorUserId, x.CreatedAtUtc });
            }
        }
    }
}


