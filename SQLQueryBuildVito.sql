use Vito
go 

-- Countries/Provinces tùy scope có thể đổ sẵn dữ liệu Việt Nam
CREATE TABLE dbo.Countries (
  CountryCode  varchar(2)  NOT NULL PRIMARY KEY, -- 'VN'
  Name         nvarchar(128) NOT NULL
);

CREATE TABLE dbo.Provinces (
  ProvinceId   int IDENTITY PRIMARY KEY,
  CountryCode  varchar(2) NOT NULL
    REFERENCES dbo.Countries(CountryCode),
  Name         nvarchar(128) NOT NULL,
  Code         varchar(16) NULL
);

-- Role & Permission tối giản (có thể mở rộng RBAC sau)
CREATE TABLE dbo.Roles (
  RoleId       int IDENTITY PRIMARY KEY,
  Name         varchar(64) NOT NULL UNIQUE
);

-- Trạng thái đơn hàng
CREATE TABLE dbo.OrderStatuses (
  StatusCode   varchar(32) NOT NULL PRIMARY KEY, -- 'Pending','Confirmed','Packing','Shipped','Delivered','Cancelled','Returned'
  SortOrder    int NOT NULL
);

-- Trạng thái thanh toán
CREATE TABLE dbo.PaymentStatuses (
  StatusCode   varchar(32) NOT NULL PRIMARY KEY, -- 'Pending','Authorized','Paid','Failed','Refunded','PartiallyRefunded'
  SortOrder    int NOT NULL
);

-- Phương thức thanh toán
CREATE TABLE dbo.PaymentMethods (
  MethodCode   varchar(32) NOT NULL PRIMARY KEY, -- 'COD','VNPAY','MOMO','ZALOPAY','CARD','BANK_TRANSFER'
  DisplayName  nvarchar(128) NOT NULL
);

-- Hãng vận chuyển
CREATE TABLE dbo.Carriers (
  CarrierCode  varchar(32) NOT NULL PRIMARY KEY, -- 'GHN','GHTK','VNPOST','VTPOST', ...
  DisplayName  nvarchar(128) NOT NULL
);

-- Hạng thành viên
CREATE TABLE dbo.MemberTiersRef (
  TierCode     varchar(32) NOT NULL PRIMARY KEY, -- 'Bronze','Silver','Gold','Platinum'
  Name         nvarchar(64) NOT NULL,
  MinOrders    int NOT NULL,    -- quy tắc theo số đơn hoàn tất
  MaxOrders    int NULL         -- NULL = không giới hạn trên
);

CREATE TABLE dbo.Users (
  UserId       uniqueidentifier NOT NULL DEFAULT NEWID() PRIMARY KEY,
  Email        varchar(256) NOT NULL UNIQUE,
  Phone        varchar(32) NULL,
  PasswordHash varbinary(512) NULL, -- dùng ASP.NET Identity bảng riêng cũng được, đây là tối giản
  FullName     nvarchar(128) NOT NULL,
  IsActive     bit NOT NULL DEFAULT 1,
  IsAdmin      bit NOT NULL DEFAULT 0,  -- nhanh gọn; nếu cần RBAC nâng cao dùng UserRoles
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAtUtc datetime2 NULL
);

CREATE TABLE dbo.UserRoles (
  UserId    uniqueidentifier NOT NULL REFERENCES dbo.Users(UserId),
  RoleId    int NOT NULL REFERENCES dbo.Roles(RoleId),
  CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId)
);

-- Khách hàng (có thể 1-1 với Users hoặc tách)
CREATE TABLE dbo.Customers (
  CustomerId   uniqueidentifier NOT NULL DEFAULT NEWID() PRIMARY KEY,
  UserId       uniqueidentifier NULL UNIQUE REFERENCES dbo.Users(UserId),
  Email        varchar(256) NOT NULL UNIQUE,
  Phone        varchar(32) NULL,
  FullName     nvarchar(128) NOT NULL,
  DateOfBirth  date NULL,
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAtUtc datetime2 NULL
);

CREATE TABLE dbo.CustomerAddresses (
  AddressId    bigint IDENTITY PRIMARY KEY,
  CustomerId   uniqueidentifier NOT NULL REFERENCES dbo.Customers(CustomerId),
  Label        nvarchar(64) NULL,         -- Nhà, Công ty...
  Recipient    nvarchar(128) NOT NULL,
  Phone        varchar(32) NOT NULL,
  CountryCode  varchar(2) NOT NULL REFERENCES dbo.Countries(CountryCode),
  ProvinceId   int NULL REFERENCES dbo.Provinces(ProvinceId),
  District     nvarchar(128) NULL,
  Ward         nvarchar(128) NULL,
  Street       nvarchar(256) NOT NULL,    -- số nhà, đường
  IsDefault    bit NOT NULL DEFAULT 0,
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_CustomerAddresses_Customer ON dbo.CustomerAddresses(CustomerId, IsDefault DESC);

CREATE TABLE dbo.Categories (
  CategoryId   int IDENTITY PRIMARY KEY,
  ParentId     int NULL REFERENCES dbo.Categories(CategoryId),
  Name         nvarchar(128) NOT NULL,
  Slug         varchar(160) NOT NULL UNIQUE,
  IsActive     bit NOT NULL DEFAULT 1,
  SortOrder    int NOT NULL DEFAULT 0,
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.Products (
  ProductId    bigint IDENTITY PRIMARY KEY,
  Title        nvarchar(256) NOT NULL,
  Slug         varchar(200) NOT NULL UNIQUE,
  Sku          varchar(64) NULL UNIQUE,     -- nếu có SKU cho SP cha
  Description  nvarchar(max) NULL,
  Material     nvarchar(256) NULL,          -- chất liệu
  Brand        nvarchar(128) NULL,
  Status       varchar(32) NOT NULL DEFAULT 'active', -- 'active','draft','archived'
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAtUtc datetime2 NULL
);

CREATE TABLE dbo.ProductCategories (
  ProductId  bigint NOT NULL REFERENCES dbo.Products(ProductId),
  CategoryId int NOT NULL REFERENCES dbo.Categories(CategoryId),
  CONSTRAINT PK_ProductCategories PRIMARY KEY (ProductId, CategoryId)
);

-- Biến thể theo size/màu
CREATE TABLE dbo.ProductVariants (
  VariantId     bigint IDENTITY PRIMARY KEY,
  ProductId     bigint NOT NULL REFERENCES dbo.Products(ProductId),
  Sku           varchar(64) NOT NULL UNIQUE,
  Size          nvarchar(64) NULL,
  Color         nvarchar(64) NULL,
  Price         decimal(18,2) NOT NULL,
  CompareAtPrice decimal(18,2) NULL,
  WeightGrams   int NULL,
  Barcode       varchar(64) NULL,
  IsActive      bit NOT NULL DEFAULT 1,
  CreatedAtUtc  datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAtUtc  datetime2 NULL
);
CREATE INDEX IX_ProductVariants_Product ON dbo.ProductVariants(ProductId, IsActive);

CREATE TABLE dbo.ProductImages (
  ImageId     bigint IDENTITY PRIMARY KEY,
  ProductId   bigint NOT NULL REFERENCES dbo.Products(ProductId),
  Url         nvarchar(512) NOT NULL,
  AltText     nvarchar(256) NULL,
  SortOrder   int NOT NULL DEFAULT 0,
  IsPrimary   bit NOT NULL DEFAULT 0
);

CREATE TABLE dbo.VariantImages (
  Id          bigint IDENTITY PRIMARY KEY,
  VariantId   bigint NOT NULL REFERENCES dbo.ProductVariants(VariantId),
  Url         nvarchar(512) NOT NULL,
  AltText     nvarchar(256) NULL,
  SortOrder   int NOT NULL DEFAULT 0
);

-- Kho & tồn
CREATE TABLE dbo.Warehouses (
  WarehouseId  int IDENTITY PRIMARY KEY,
  Name         nvarchar(128) NOT NULL,
  IsActive     bit NOT NULL DEFAULT 1
);
INSERT INTO dbo.Warehouses(Name, IsActive) VALUES (N'Kho chính', 1);

CREATE TABLE dbo.Inventory (
  WarehouseId  int NOT NULL REFERENCES dbo.Warehouses(WarehouseId),
  VariantId    bigint NOT NULL REFERENCES dbo.ProductVariants(VariantId),
  OnHand       int NOT NULL DEFAULT 0,       -- tồn thực tế
  Reserved     int NOT NULL DEFAULT 0,       -- đã giữ cho đơn chưa hoàn tất
  UpdatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_Inventory PRIMARY KEY (WarehouseId, VariantId),
  CONSTRAINT CK_Inventory_NonNegative CHECK (OnHand >= 0 AND Reserved >= 0)
);
CREATE INDEX IX_Inventory_Variant ON dbo.Inventory(VariantId);

CREATE TABLE dbo.Promotions (
  PromotionId    bigint IDENTITY PRIMARY KEY,
  Name           nvarchar(256) NOT NULL,
  Description    nvarchar(1024) NULL,
  Type           varchar(32) NOT NULL,       -- 'PERCENT','AMOUNT','BUY_X_GET_Y','FLASH'
  DiscountValue  decimal(18,2) NOT NULL,     -- % hoặc số tiền (tùy Type)
  MaxDiscount    decimal(18,2) NULL,
  StartsAtUtc    datetime2 NOT NULL,
  EndsAtUtc      datetime2 NULL,
  IsActive       bit NOT NULL DEFAULT 0,
  CreatedAtUtc   datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.PromotionProducts (
  PromotionId  bigint NOT NULL REFERENCES dbo.Promotions(PromotionId),
  ProductId    bigint NOT NULL REFERENCES dbo.Products(ProductId),
  VariantId    bigint NOT NULL REFERENCES dbo.ProductVariants(VariantId),
  CONSTRAINT PK_PromotionProducts PRIMARY KEY (PromotionId, ProductId, VariantId)
);

CREATE TABLE dbo.Vouchers (
  VoucherCode    varchar(64) NOT NULL PRIMARY KEY,
  Name           nvarchar(256) NOT NULL,
  Type           varchar(32) NOT NULL,        -- 'PERCENT','AMOUNT','FREESHIP'
  DiscountValue  decimal(18,2) NOT NULL,
  MaxDiscount    decimal(18,2) NULL,
  MinOrderValue  decimal(18,2) NULL,
  UsageLimit     int NULL,                     -- tổng lượt
  PerUserLimit   int NULL,
  StartsAtUtc    datetime2 NOT NULL,
  EndsAtUtc      datetime2 NULL,
  IsActive       bit NOT NULL DEFAULT 1,
  CreatedAtUtc   datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.VoucherRedemptions (
  Id            bigint IDENTITY PRIMARY KEY,
  VoucherCode   varchar(64) NOT NULL REFERENCES dbo.Vouchers(VoucherCode),
  CustomerId    uniqueidentifier NOT NULL REFERENCES dbo.Customers(CustomerId),
  OrderId       bigint NULL, -- có thể null lúc hold
  RedeemedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_VoucherRedemptions_Voucher ON dbo.VoucherRedemptions(VoucherCode);
CREATE INDEX IX_VoucherRedemptions_Customer ON dbo.VoucherRedemptions(CustomerId);

CREATE TABLE dbo.Orders (
  OrderId        bigint IDENTITY PRIMARY KEY,
  OrderNumber    varchar(32) NOT NULL UNIQUE,  -- ví dụ: 'SO-20251021-000123'
  CustomerId     uniqueidentifier NOT NULL REFERENCES dbo.Customers(CustomerId),
  Email          varchar(256) NOT NULL,
  Phone          varchar(32) NULL,
  ShipToName     nvarchar(128) NOT NULL,
  ShipToAddress  nvarchar(512) NOT NULL,
  ShipToProvince nvarchar(128) NULL,
  ShipToDistrict nvarchar(128) NULL,
  ShipToWard     nvarchar(128) NULL,
  Notes          nvarchar(512) NULL,

  Subtotal       decimal(18,2) NOT NULL,
  DiscountTotal  decimal(18,2) NOT NULL DEFAULT 0,
  ShippingFee    decimal(18,2) NOT NULL DEFAULT 0,
  TaxTotal       decimal(18,2) NOT NULL DEFAULT 0,
  GrandTotal     decimal(18,2) NOT NULL,

  Status         varchar(32) NOT NULL REFERENCES dbo.OrderStatuses(StatusCode),
  PaymentStatus  varchar(32) NOT NULL REFERENCES dbo.PaymentStatuses(StatusCode),
  PaymentMethod  varchar(32) NOT NULL REFERENCES dbo.PaymentMethods(MethodCode),
  VoucherCode    varchar(64) NULL REFERENCES dbo.Vouchers(VoucherCode),

  CarrierCode    varchar(32) NULL REFERENCES dbo.Carriers(CarrierCode),
  TrackingNumber varchar(64) NULL,

  PlacedAtUtc    datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  ConfirmedAtUtc datetime2 NULL,
  ShippedAtUtc   datetime2 NULL,
  DeliveredAtUtc datetime2 NULL,
  CancelledAtUtc datetime2 NULL,
  UpdatedAtUtc   datetime2 NULL
);
CREATE INDEX IX_Orders_Customer ON dbo.Orders(CustomerId, PlacedAtUtc DESC);
CREATE INDEX IX_Orders_Status ON dbo.Orders(Status, PlacedAtUtc DESC);
CREATE INDEX IX_Orders_Tracking ON dbo.Orders(TrackingNumber);

CREATE TABLE dbo.OrderItems (
  OrderItemId  bigint IDENTITY PRIMARY KEY,
  OrderId      bigint NOT NULL REFERENCES dbo.Orders(OrderId),
  ProductId    bigint NOT NULL REFERENCES dbo.Products(ProductId),
  VariantId    bigint NOT NULL REFERENCES dbo.ProductVariants(VariantId),
  Title        nvarchar(256) NOT NULL,  -- snapshot tên SP
  Sku          varchar(64) NOT NULL,    -- snapshot SKU
  Size         nvarchar(64) NULL,
  Color        nvarchar(64) NULL,
  Price        decimal(18,2) NOT NULL,  -- snapshot giá tại thời điểm mua
  Quantity     int NOT NULL CHECK (Quantity > 0),
  LineTotal    decimal(18,2) NOT NULL
);
CREATE INDEX IX_OrderItems_Order ON dbo.OrderItems(OrderId);

-- Thanh toán
CREATE TABLE dbo.PaymentIntents (
  PaymentIntentId bigint IDENTITY PRIMARY KEY,
  OrderId         bigint NOT NULL REFERENCES dbo.Orders(OrderId),
  Provider        varchar(64) NOT NULL,   -- 'VNPAY','MOMO',...
  ExternalId      varchar(128) NULL,      -- id của cổng
  Amount          decimal(18,2) NOT NULL,
  Currency        varchar(8) NOT NULL DEFAULT 'VND',
  Status          varchar(32) NOT NULL,   -- 'Created','Processing','Succeeded','Failed','Canceled'
  CreatedAtUtc    datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAtUtc    datetime2 NULL,
  IdempotencyKey  varchar(128) NULL UNIQUE
);

CREATE TABLE dbo.Payments (
  PaymentId      bigint IDENTITY PRIMARY KEY,
  OrderId        bigint NOT NULL REFERENCES dbo.Orders(OrderId),
  PaymentIntentId bigint NULL REFERENCES dbo.PaymentIntents(PaymentIntentId),
  Amount         decimal(18,2) NOT NULL,
  PaidAtUtc      datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  MethodCode     varchar(32) NOT NULL REFERENCES dbo.PaymentMethods(MethodCode),
  ProviderTxnId  varchar(128) NULL
);

-- Hoàn tiền
CREATE TABLE dbo.Refunds (
  RefundId      bigint IDENTITY PRIMARY KEY,
  OrderId       bigint NOT NULL REFERENCES dbo.Orders(OrderId),
  PaymentId     bigint NULL REFERENCES dbo.Payments(PaymentId),
  Amount        decimal(18,2) NOT NULL,
  Reason        nvarchar(256) NULL,
  Status        varchar(32) NOT NULL, -- 'Requested','Approved','Processed','Rejected'
  RequestedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  ProcessedAtUtc datetime2 NULL
);

-- Giao vận: bản chuẩn (timeline chi tiết nên để Mongo)
CREATE TABLE dbo.Shipments (
  ShipmentId     bigint IDENTITY PRIMARY KEY,
  OrderId        bigint NOT NULL REFERENCES dbo.Orders(OrderId),
  CarrierCode    varchar(32) NOT NULL REFERENCES dbo.Carriers(CarrierCode),
  TrackingNumber varchar(64) NOT NULL,
  Status         varchar(32) NOT NULL, -- 'Created','PickedUp','InTransit','OutForDelivery','Delivered','Failed'
  LastUpdateUtc  datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE INDEX UX_Shipments_Tracking ON dbo.Shipments(CarrierCode, TrackingNumber);

-- Đổi/Trả
CREATE TABLE dbo.ReturnRequests (
  ReturnId      bigint IDENTITY PRIMARY KEY,
  OrderId       bigint NOT NULL REFERENCES dbo.Orders(OrderId),
  CustomerId    uniqueidentifier NOT NULL REFERENCES dbo.Customers(CustomerId),
  Reason        nvarchar(512) NULL,
  Status        varchar(32) NOT NULL, -- 'Requested','Approved','Rejected','Received','Refunded'
  RequestedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAtUtc  datetime2 NULL
);

CREATE TABLE dbo.ReturnItems (
  ReturnItemId  bigint IDENTITY PRIMARY KEY,
  ReturnId      bigint NOT NULL REFERENCES dbo.ReturnRequests(ReturnId),
  OrderItemId   bigint NOT NULL REFERENCES dbo.OrderItems(OrderItemId),
  Quantity      int NOT NULL CHECK (Quantity > 0),
  ConditionNote nvarchar(256) NULL
);

-- Wishlist
CREATE TABLE dbo.Wishlists (
  CustomerId   uniqueidentifier NOT NULL REFERENCES dbo.Customers(CustomerId),
  ProductId    bigint NOT NULL REFERENCES dbo.Products(ProductId),
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_Wishlists PRIMARY KEY (CustomerId, ProductId)
);

-- Review
CREATE TABLE dbo.ProductReviews (
  ReviewId     bigint IDENTITY PRIMARY KEY,
  ProductId    bigint NOT NULL REFERENCES dbo.Products(ProductId),
  CustomerId   uniqueidentifier NOT NULL REFERENCES dbo.Customers(CustomerId),
  Rating       tinyint NOT NULL CHECK (Rating BETWEEN 1 AND 5),
  Title        nvarchar(128) NULL,
  Content      nvarchar(2000) NULL,
  IsApproved   bit NOT NULL DEFAULT 0,
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Reviews_Product ON dbo.ProductReviews(ProductId, IsApproved);

-- Hạng thành viên (materialized)
CREATE TABLE dbo.CustomerTiers (
  CustomerId   uniqueidentifier NOT NULL PRIMARY KEY REFERENCES dbo.Customers(CustomerId),
  OrderCount   int NOT NULL DEFAULT 0,
  TierCode     varchar(32) NOT NULL REFERENCES dbo.MemberTiersRef(TierCode),
  LastCalcUtc  datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.AdminActivityLogs (
  LogId        bigint IDENTITY PRIMARY KEY,
  ActorUserId  uniqueidentifier NOT NULL REFERENCES dbo.Users(UserId),
  Action       varchar(64) NOT NULL,    -- 'CreateProduct','UpdateInventory', 'ChangeOrderStatus', ...
  Entity       varchar(64) NOT NULL,    -- 'Product','Order','Voucher',...
  EntityId     varchar(64) NOT NULL,
  Detail       nvarchar(max) NULL,
  CreatedAtUtc datetime2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_AdminLogs_Actor ON dbo.AdminActivityLogs(ActorUserId, CreatedAtUtc DESC);

--------------------------View: Thống kê đơn hoàn tất theo khách hàng (để tính hạng)----------------------------
CREATE OR ALTER VIEW dbo.vw_CustomerCompletedOrders AS
SELECT 
  o.CustomerId,
  COUNT_BIG(*) AS CompletedCount
FROM dbo.Orders o
WHERE o.Status IN ('Delivered') -- hoặc 'Completed' nếu bạn dùng code đó
GROUP BY o.CustomerId;

-----Proc: Recalc hạng thành viên theo mốc trong MemberTiersRef------
CREATE OR ALTER PROCEDURE dbo.usp_RecalcCustomerTiers
AS
BEGIN
  SET NOCOUNT ON;

  ;WITH Stats AS (
    SELECT c.CustomerId, ISNULL(v.CompletedCount, 0) AS CompletedOrders
    FROM dbo.Customers c
    LEFT JOIN dbo.vw_CustomerCompletedOrders v ON v.CustomerId = c.CustomerId
  ),
  Tiered AS (
    SELECT 
      s.CustomerId,
      s.CompletedOrders,
      COALESCE((
        SELECT TOP 1 m.TierCode
        FROM dbo.MemberTiersRef m
        WHERE s.CompletedOrders >= m.MinOrders
          AND (m.MaxOrders IS NULL OR s.CompletedOrders <= m.MaxOrders)
        ORDER BY m.MinOrders DESC
      ), 'Bronze') AS TierCode
    FROM Stats s
  )
  MERGE dbo.CustomerTiers AS tgt
  USING Tiered AS src
    ON tgt.CustomerId = src.CustomerId
  WHEN MATCHED THEN
    UPDATE SET tgt.OrderCount = src.CompletedOrders, tgt.TierCode = src.TierCode, tgt.LastCalcUtc = SYSUTCDATETIME()
  WHEN NOT MATCHED THEN
    INSERT (CustomerId, OrderCount, TierCode, LastCalcUtc)
    VALUES (src.CustomerId, src.CompletedOrders, src.TierCode, SYSUTCDATETIME());
END;

-----Proc: Tạo đơn hàng (đặt chỗ tồn kho atomically)-----
CREATE OR ALTER PROCEDURE dbo.usp_CreateOrder
  @CustomerId uniqueidentifier,
  @ShipToName nvarchar(128),
  @ShipToAddress nvarchar(512),
  @ShipToProvince nvarchar(128) = NULL,
  @ShipToDistrict nvarchar(128) = NULL,
  @ShipToWard nvarchar(128) = NULL,
  @Email varchar(256),
  @Phone varchar(32) = NULL,
  @PaymentMethod varchar(32),
  @VoucherCode varchar(64) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    DECLARE @OrderId bigint, @OrderNumber varchar(32);

    -- Sinh số đơn (ví dụ đơn giản)
    SET @OrderNumber = 'SO-' + CONVERT(varchar(8), GETUTCDATE(), 112) + '-' + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS varchar(6)),6);

    INSERT INTO dbo.Orders (
      OrderNumber, CustomerId, Email, Phone,
      ShipToName, ShipToAddress, ShipToProvince, ShipToDistrict, ShipToWard,
      Subtotal, DiscountTotal, ShippingFee, TaxTotal, GrandTotal,
      Status, PaymentStatus, PaymentMethod, VoucherCode
    )
    VALUES (
      @OrderNumber, @CustomerId, @Email, @Phone,
      @ShipToName, @ShipToAddress, @ShipToProvince, @ShipToDistrict, @ShipToWard,
      0,0,0,0,0,
      'Pending','Pending', @PaymentMethod, @VoucherCode
    );

    SET @OrderId = SCOPE_IDENTITY();

    -- Ở đây thường bạn sẽ nhận giỏ hàng từ API (table tạm/param bảng).
    -- Để ngắn gọn: giả định có table tạm #CartItems(VariantId bigint, Qty int, Price decimal(18,2))
    -- DEMO: bạn hãy tạo #CartItems trước khi gọi proc trong môi trường thực.

    DECLARE @Subtotal decimal(18,2) = 0;

    INSERT INTO dbo.OrderItems (OrderId, ProductId, VariantId, Title, Sku, Size, Color, Price, Quantity, LineTotal)
    SELECT 
      @OrderId,
      pv.ProductId,
      ci.VariantId,
      p.Title,
      pv.Sku,
      pv.Size,
      pv.Color,
      ci.Price,
      ci.Qty,
      ci.Price * ci.Qty
    FROM #CartItems ci
    JOIN dbo.ProductVariants pv ON pv.VariantId = ci.VariantId
    JOIN dbo.Products p ON p.ProductId = pv.ProductId;

    SELECT @Subtotal = SUM(LineTotal) FROM dbo.OrderItems WHERE OrderId = @OrderId;

    -- TODO: Áp voucher/khuyến mãi (tính DiscountTotal/ShippingFee/TaxTotal) – đặt trong logic service
    UPDATE dbo.Orders
      SET Subtotal = @Subtotal,
          DiscountTotal = 0,
          ShippingFee = 0,
          TaxTotal = 0,
          GrandTotal = @Subtotal
    WHERE OrderId = @OrderId;

    -- Reserve tồn kho ở kho 1 (đơn kho)
    UPDATE inv
      SET inv.Reserved = inv.Reserved + ci.Qty,
          inv.UpdatedAtUtc = SYSUTCDATETIME()
    FROM dbo.Inventory inv
    JOIN #CartItems ci ON ci.VariantId = inv.VariantId
    WHERE inv.WarehouseId = 1;

    COMMIT;
    SELECT @OrderId AS OrderId;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

-----Proc: Chuyển trạng thái đơn & xử lý tồn kho-----
CREATE OR ALTER PROCEDURE dbo.usp_UpdateOrderStatus
  @OrderId bigint,
  @NewStatus varchar(32)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    DECLARE @OldStatus varchar(32);
    SELECT @OldStatus = Status FROM dbo.Orders WHERE OrderId = @OrderId;

    UPDATE dbo.Orders
      SET Status = @NewStatus, UpdatedAtUtc = SYSUTCDATETIME(),
          ConfirmedAtUtc = CASE WHEN @NewStatus='Confirmed' THEN SYSUTCDATETIME() ELSE ConfirmedAtUtc END,
          ShippedAtUtc   = CASE WHEN @NewStatus='Shipped'   THEN SYSUTCDATETIME() ELSE ShippedAtUtc END,
          DeliveredAtUtc = CASE WHEN @NewStatus='Delivered' THEN SYSUTCDATETIME() ELSE DeliveredAtUtc END,
          CancelledAtUtc = CASE WHEN @NewStatus='Cancelled' THEN SYSUTCDATETIME() ELSE CancelledAtUtc END
    WHERE OrderId = @OrderId;

    -- Nếu Delivered: trừ OnHand và giảm Reserved
    IF (@NewStatus = 'Delivered')
    BEGIN
      UPDATE inv
        SET inv.OnHand = inv.OnHand - oi.Quantity,
            inv.Reserved = inv.Reserved - oi.Quantity,
            inv.UpdatedAtUtc = SYSUTCDATETIME()
      FROM dbo.Inventory inv
      JOIN dbo.OrderItems oi ON oi.VariantId = inv.VariantId
      WHERE oi.OrderId = @OrderId AND inv.WarehouseId = 1;
    END

    -- Nếu Cancelled: release Reserved
    IF (@NewStatus = 'Cancelled')
    BEGIN
      UPDATE inv
        SET inv.Reserved = inv.Reserved - oi.Quantity,
            inv.UpdatedAtUtc = SYSUTCDATETIME()
      FROM dbo.Inventory inv
      JOIN dbo.OrderItems oi ON oi.VariantId = inv.VariantId
      WHERE oi.OrderId = @OrderId AND inv.WarehouseId = 1;
    END

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
----------------------------------------

