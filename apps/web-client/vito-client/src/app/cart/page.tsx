import Link from "next/link";
import Container from "@/components/layout/container";
import { products } from "@/data/catalog";

const cartItems = [
  { productSlug: "vito-linen-midi-dress", quantity: 1 },
  { productSlug: "vito-airflex-sneaker", quantity: 1 },
];

export default function CartPage() {
  const items = cartItems
    .map((item) => {
      const product = products.find((product) => product.slug === item.productSlug);
      if (!product) {
        return null;
      }
      return { ...product, quantity: item.quantity };
    })
    .filter(Boolean) as ((typeof products)[number] & { quantity: number })[];

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * (item.salePrice ?? item.price),
    0,
  );
  const shipping = subtotal >= 1000000 ? 0 : 45000;
  const total = subtotal + shipping;

  return (
    <div className="pb-24">
      <Container className="space-y-12">
        <div className="space-y-4 pt-10">
          <h1 className="text-3xl font-semibold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-sm text-gray-600">
            Kiểm tra lại sản phẩm trước khi tiến hành thanh toán. Bạn có thể áp mã ưu đãi ở bước tiếp theo.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.slug} className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <Link href={`/products/${item.slug}`} className="text-lg font-semibold text-gray-900 hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                  <p className="text-sm text-gray-500">Màu: {item.colors[0]} • Size: {item.sizes[0]}</p>
                  <p className="text-sm text-gray-500">Tình trạng: {item.inventory.status === "in_stock" ? "Còn hàng" : "Sắp hết"}</p>
                </div>
                <div className="text-right text-lg font-semibold text-gray-900">
                  {(item.salePrice ?? item.price).toLocaleString("vi-VN")}đ
                </div>
              </div>
            ))}
            <Link
              href="/categories/nu"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString("vi-VN")}đ`}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <label className="block text-sm font-medium text-gray-700" htmlFor="voucher">
                Mã giảm giá
              </label>
              <input
                id="voucher"
                placeholder="Nhập mã ưu đãi"
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button className="w-full rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700">
                Áp dụng
              </button>
            </div>
            <Link
              href="/checkout"
              className="inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Thanh toán
            </Link>
            <p className="text-xs text-gray-500">
              Khi tiếp tục, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của Vito Atelier.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
