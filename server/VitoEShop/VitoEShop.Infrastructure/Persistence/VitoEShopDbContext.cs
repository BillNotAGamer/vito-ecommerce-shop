using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static VitoEShop.Domain.Entities;
using static VitoEShop.Infrastructure.Persistence.EfConfigurations;

namespace VitoEShop.Infrastructure.Persistence
{
    public class VitoEShopDbContext : DbContext
    {
        public VitoEShopDbContext(DbContextOptions<VitoEShopDbContext> options) : base(options) { }

        // Core
        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<UserRefreshToken> UserRefreshTokens => Set<UserRefreshToken>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();

        // Catalog
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<VariantImage> VariantImages => Set<VariantImage>();
        public DbSet<Warehouse> Warehouses => Set<Warehouse>();
        public DbSet<Inventory> Inventory => Set<Inventory>();

        // Orders/Payments/Shipping
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<OrderStatusRef> OrderStatuses => Set<OrderStatusRef>();
        public DbSet<PaymentStatusRef> PaymentStatuses => Set<PaymentStatusRef>();
        public DbSet<PaymentMethodRef> PaymentMethods => Set<PaymentMethodRef>();
        public DbSet<Shipment> Shipments => Set<Shipment>();
        public DbSet<CarrierRef> Carriers => Set<CarrierRef>();

        // Promotions
        public DbSet<Promotion> Promotions => Set<Promotion>();
        public DbSet<PromotionProduct> PromotionProducts => Set<PromotionProduct>();
        public DbSet<Voucher> Vouchers => Set<Voucher>();
        public DbSet<VoucherRedemption> VoucherRedemptions => Set<VoucherRedemption>();

        // Social/Loyalty
        public DbSet<Wishlist> Wishlists => Set<Wishlist>();
        public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
        public DbSet<MemberTierRef> MemberTiersRef => Set<MemberTierRef>();
        public DbSet<CustomerTier> CustomerTiers => Set<CustomerTier>();

        // Audit
        public DbSet<AdminActivityLog> AdminActivityLogs => Set<AdminActivityLog>();

        protected override void OnModelCreating(ModelBuilder mb)
        {
            // apply configs
            mb.ApplyConfigurationsFromAssembly(typeof(VitoEShopDbContext).Assembly);

            // seed enum-like refs
            SeedRefs.Seed(mb);
        }
    }
}
