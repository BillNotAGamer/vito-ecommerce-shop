import Link from "next/link";
import Container from "@/components/layout/container";
import { loyaltyTiers, mockOrders, products } from "@/data/catalog";

const customer = {
  name: "Nguyễn Minh Anh",
  email: "minhanh@example.com",
  phone: "+84 912 345 678",
  tier: "Bạc",
  points: 1280,
  address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
  wishlist: ["vito-muse-handbag", "vito-silk-blouse"],
};

export default function AccountPage() {
  const tierInfo = loyaltyTiers.find((tier) => tier.name === customer.tier) ?? loyaltyTiers[0];
  const nextTier = loyaltyTiers.find((tier) => tier.threshold > tierInfo.threshold);
  const wishlistProducts = customer.wishlist
    .map((slug) => products.find((product) => product.slug === slug))
    .filter(Boolean);

  return (
    <div className="pb-24">
      <Container className="space-y-12">
        <div className="space-y-4 pt-10">
          <h1 className="text-3xl font-semibold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-sm text-gray-600">
            Quản lý thông tin cá nhân, đơn hàng, ưu đãi và các yêu cầu hậu mãi của bạn tại Vito Atelier.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-10">
            <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                  <p className="text-sm text-gray-600">Cập nhật hồ sơ để nhận tư vấn chính xác hơn.</p>
                </div>
                <button className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">
                  Cập nhật hồ sơ
                </button>
              </div>
              <dl className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-gray-900">Họ tên</dt>
                  <dd>{customer.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Email</dt>
                  <dd>{customer.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Số điện thoại</dt>
                  <dd>{customer.phone}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Địa chỉ mặc định</dt>
                  <dd>{customer.address}</dd>
                </div>
              </dl>
            </section>

            <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Đơn hàng gần đây</h2>
                  <p className="text-sm text-gray-600">Theo dõi trạng thái và hành trình giao hàng.</p>
                </div>
                <Link
                  href="#orders"
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Xem lịch sử đầy đủ
                </Link>
              </div>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Đơn hàng {order.id}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{order.status}</p>
                      </div>
                      <p className="text-sm text-gray-600">Ngày đặt: {order.date}</p>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {order.items.map((item) => (
                        <li key={item.productSlug} className="flex items-center justify-between">
                          <span>{products.find((product) => product.slug === item.productSlug)?.name}</span>
                          <span>
                            {item.quantity} x {item.price.toLocaleString("vi-VN")}đ
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>• Theo dõi vận đơn</span>
                      <span>• Yêu cầu đổi trả</span>
                      <span>• Xuất hóa đơn điện tử</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Yêu cầu hỗ trợ</h2>
                  <p className="text-sm text-gray-600">Quản lý đổi trả, bảo hành và liên hệ stylist.</p>
                </div>
                <button className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">
                  Tạo yêu cầu mới
                </button>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• Đổi size đầm linen - trạng thái: Đang xử lý</li>
                <li>• Yêu cầu bảo hành sneaker AirFlex - Hoàn tất</li>
                <li>• Đặt lịch tư vấn phối đồ tháng 4 - Đã xác nhận</li>
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="space-y-6 rounded-3xl bg-gray-900 p-8 text-white shadow-lg">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Hạng hội viên</p>
                <h2 className="text-2xl font-semibold">{customer.tier} member</h2>
                <p className="mt-2 text-sm text-white/80">Điểm tích lũy: {customer.points}</p>
              </div>
              <div className="space-y-4 text-sm text-white/80">
                <p className="font-semibold text-white">Quyền lợi hiện tại</p>
                <ul className="space-y-2">
                  {tierInfo.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
              </div>
              {nextTier ? (
                <div className="rounded-3xl bg-white/10 p-4 text-sm text-white/80">
                  <p className="font-semibold text-white">Nâng hạng {nextTier.name}</p>
                  <p>Cần thêm {(nextTier.threshold / 1000).toLocaleString("vi-VN")}k doanh thu.</p>
                </div>
              ) : (
                <div className="rounded-3xl bg-white/10 p-4 text-sm text-white/80">
                  <p className="font-semibold text-white">Bạn đang ở hạng cao nhất</p>
                  <p>Nhận ưu đãi độc quyền từ stylist riêng.</p>
                </div>
              )}
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
              >
                Đặt lịch ưu đãi
              </Link>
            </section>

            <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Wishlist</h2>
                <Link href="/search" className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                  Quản lý
                </Link>
              </div>
              <div className="space-y-4">
                {wishlistProducts.map((product) => (
                  <div key={product!.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">{product!.name}</p>
                    <p className="text-xs text-gray-500">
                      {(product!.salePrice ?? product!.price).toLocaleString("vi-VN")}đ • {product!.categorySlug.replace("-", " ")}
                    </p>
                    <Link
                      href={`/products/${product!.slug}`}
                      className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 hover:text-gray-600"
                    >
                      Xem sản phẩm
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-sm text-gray-600">
              <h2 className="text-xl font-semibold text-gray-900">Bảo mật &amp; đăng nhập</h2>
              <p>• Đăng nhập bằng email, số điện thoại hoặc mạng xã hội.</p>
              <p>• Xác thực đa lớp cho nhân viên quản trị.</p>
              <p>• Lưu lịch sử hoạt động để đảm bảo minh bạch.</p>
              <button className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">
                Đổi mật khẩu
              </button>
            </section>
          </aside>
        </div>
      </Container>
    </div>
  );
}
