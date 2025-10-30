import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/container";
import ProductCard from "@/components/commerce/product-card";
import { categories, products } from "@/data/catalog";

const heroProduct = products.find((product) => product.featured);
const newArrivals = products.filter((product) => product.newArrival).slice(0, 4);
const bestSellers = products.filter((product) => product.bestseller).slice(0, 4);
const curatedAccessories = products.filter((product) => product.categorySlug === "phu-kien").slice(0, 3);

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      <section className="relative overflow-hidden rounded-b-[48px] bg-gray-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_55%)]" />
        <Container className="relative grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Bộ sưu tập Xuân Hè 2024
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Khám phá phong cách tối giản cùng chất liệu bền vững
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/80">
              Vito Atelier mang đến trải nghiệm mua sắm đồng nhất giữa cửa hàng trực tuyến và hệ thống quản trị.
              Bộ sưu tập mới tập trung vào chất liệu organic, phom dáng thanh lịch cùng các dịch vụ khách hàng ưu việt.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={heroProduct ? `/products/${heroProduct.slug}` : "/categories/nu"}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
              >
                Mua ngay
              </Link>
              <Link
                href="/categories/nu"
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Xem lookbook
              </Link>
            </div>
            <dl className="grid gap-6 text-sm text-white/70 sm:grid-cols-3">
              <div className="space-y-1">
                <dt className="font-semibold text-white">Giao nhanh 48h</dt>
                <dd>Áp dụng tại Hà Nội &amp; TP.HCM với đối tác vận chuyển hàng đầu.</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-semibold text-white">Thanh toán đa kênh</dt>
                <dd>Hỗ trợ COD, thẻ ngân hàng, ví điện tử và QR Pay bảo mật.</dd>
              </div>
              <div className="space-y-1">
                <dt className="font-semibold text-white">Ưu đãi hội viên</dt>
                <dd>Tích điểm tới 7% và nhận chăm sóc riêng cho khách hạng Vàng.</dd>
              </div>
            </dl>
          </div>
          {heroProduct ? (
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-6">
              <div className="absolute inset-0 -z-10 bg-[conic-gradient(at_top,_rgba(255,255,255,0.2),_transparent_70%)]" />
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white/10">
                <Image
                  src={heroProduct.images[0]}
                  alt={heroProduct.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-6 space-y-2 rounded-3xl bg-white/10 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-white/80">{heroProduct.badges?.[0] ?? "Sản phẩm nổi bật"}</p>
                <h3 className="text-2xl font-semibold">{heroProduct.name}</h3>
                <p className="text-sm text-white/80">{heroProduct.description}</p>
                <div className="flex items-baseline gap-3 text-lg font-semibold">
                  <span>{(heroProduct.salePrice ?? heroProduct.price).toLocaleString("vi-VN")}đ</span>
                  {heroProduct.salePrice ? (
                    <span className="text-sm font-normal text-white/70 line-through">
                      {heroProduct.price.toLocaleString("vi-VN")}đ
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      <section>
        <Container className="space-y-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Danh mục nổi bật</p>
              <h2 className="text-3xl font-semibold text-gray-900">Chọn phong cách phù hợp với bạn</h2>
            </div>
            <Link
              href="/categories/nu"
              className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline"
            >
              Xem tất cả danh mục
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent transition duration-500 group-hover:from-gray-900/70" />
                <Image
                  src={category.heroImage}
                  alt={category.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="relative flex h-full flex-col justify-end gap-3 p-8 text-white">
                  <span className="text-xs uppercase tracking-[0.4em] text-white/70">{category.highlight}</span>
                  <h3 className="text-2xl font-semibold">{category.name}</h3>
                  <p className="text-sm text-white/80">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Sản phẩm mới</p>
              <h2 className="text-3xl font-semibold text-gray-900">Những thiết kế vừa cập bến</h2>
            </div>
            <Link href="/search?q=new" className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">
              Xem thêm sản phẩm mới
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center">
          <div className="space-y-6 rounded-3xl bg-white p-10 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Chăm sóc khách hàng</p>
            <h2 className="text-3xl font-semibold text-gray-900">
              Mua sắm đồng bộ với hệ thống quản trị thông minh
            </h2>
            <p className="text-base text-gray-600">
              Khách hàng có thể theo dõi đơn hàng, yêu cầu đổi trả, quản lý wishlist và nhận thông báo ưu đãi
              ngay trong một tài khoản. Đội ngũ admin kiểm soát tồn kho, khuyến mãi, vận chuyển và báo cáo trên
              cùng một nền tảng ASP.NET Core 9.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {["Đồng bộ tồn kho thời gian thực", "Cá nhân hóa ưu đãi", "Theo dõi vận đơn trực quan", "Báo cáo doanh thu chi tiết"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <span aria-hidden className="mt-1 text-lg">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900">Quyền lợi hội viên</h3>
            <p className="text-sm text-gray-600">
              Từ hạng Đồng tới Vàng, Vito Atelier mang tới các ưu đãi độc quyền và dịch vụ chuyên biệt dành cho từng
              nhóm khách hàng trung thành.
            </p>
            <div className="grid gap-4">
              {["Miễn phí vận chuyển theo hạng", "Ưu tiên đặt lịch thử đồ", "Điểm thưởng quy đổi quà tặng"].map((benefit) => (
                <div key={benefit} className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                  {benefit}
                </div>
              ))}
            </div>
            <Link
              href="/account"
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Quản lý tài khoản
            </Link>
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Bán chạy</p>
              <h2 className="text-3xl font-semibold text-gray-900">Sản phẩm được yêu thích nhất</h2>
            </div>
            <Link href="/search?q=best" className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">
              Xem tất cả bán chạy
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-8 rounded-[40px] bg-gradient-to-br from-white to-gray-100 p-10 shadow-inner lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Phụ kiện mix &amp; match</p>
            <h2 className="text-3xl font-semibold text-gray-900">Hoàn thiện outfit với phụ kiện tinh tế</h2>
            <p className="text-sm text-gray-600">
              Lựa chọn túi xách, giày và phụ kiện kết hợp từ bộ sưu tập Muse để tạo nên dấu ấn riêng của bạn.
            </p>
            <Link href="/categories/phu-kien" className="text-sm font-semibold text-gray-700 underline-offset-4 hover:underline">
              Khám phá thêm phụ kiện
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {curatedAccessories.map((product) => (
              <div key={product.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{product.tags[0]}</p>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-gray-700 underline-offset-4 hover:underline"
                >
                  Xem chi tiết →
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Trải nghiệm cửa hàng</h3>
            <p className="mt-3 text-sm text-gray-600">
              Đến showroom Vito Atelier để được stylist tư vấn trực tiếp và thử đồ với lịch hẹn riêng tư.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>• Không gian thử đồ riêng</li>
              <li>• Trà &amp; bánh tiếp đón khách VIP</li>
              <li>• Điều chỉnh kích cỡ trong ngày</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Cam kết bền vững</h3>
            <p className="mt-3 text-sm text-gray-600">
              70% sản phẩm được may từ sợi tái chế hoặc hữu cơ, giảm phát thải trong toàn bộ chuỗi cung ứng.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>• Bao bì thân thiện môi trường</li>
              <li>• Thu gom quần áo cũ đổi voucher</li>
              <li>• Sản xuất theo đơn, tránh tồn kho</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Kết nối cộng đồng</h3>
            <p className="mt-3 text-sm text-gray-600">
              Tham gia workshop phối đồ, chia sẻ câu chuyện phong cách và nhận ưu đãi dành riêng cho hội viên trung
              thành.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>• Workshop hằng tháng</li>
              <li>• Nhóm chia sẻ tips mix &amp; match</li>
              <li>• Ưu đãi sinh nhật &amp; ngày hội viên</li>
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}
