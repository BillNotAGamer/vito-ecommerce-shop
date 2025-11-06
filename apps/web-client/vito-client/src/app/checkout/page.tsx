/* eslint-disable react/no-unescaped-entities */
import Container from "@/components/layout/container";
import { paymentMethods, shippingMethods } from "@/data/catalog";

export default function CheckoutPage() {
  return (
    <div className="pb-24">
      <Container className="space-y-12">
        <div className="space-y-4 pt-10">
          <h1 className="text-3xl font-semibold text-gray-900">Thanh toán</h1>
          <p className="text-sm text-gray-600">
            Hoàn tất thông tin giao hàng, lựa chọn phương thức vận chuyển và thanh toán để hoàn tất đơn hàng.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="space-y-10">
            <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Thông tin giao hàng</h2>
                <p className="text-sm text-gray-600">Vui lòng nhập chính xác để nhận hàng nhanh chóng.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="fullName">
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    required
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="address">
                    Địa chỉ nhận hàng
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    required
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="city">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    id="city"
                    required
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="district">
                    Quận/Huyện
                  </label>
                  <input
                    id="district"
                    required
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Phương thức vận chuyển</h2>
                <p className="text-sm text-gray-600">Vui lòng chọn đơn vị phù hợp với nhu cầu của bạn.</p>
              </div>
              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" defaultChecked={method.id === "standard"} />
                        <span className="font-semibold text-gray-900">{method.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {method.price === 0 ? "Miễn phí" : `${method.price.toLocaleString("vi-VN")}đ`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
                <p className="text-sm text-gray-600">Vito hỗ trợ nhiều cổng thanh toán an toàn và tiện lợi.</p>
              </div>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" defaultChecked={index === 0} />
                      <span className="font-semibold text-gray-900">{method.name}</span>
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-gray-400">Bảo mật</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Ghi chú</h2>
              <textarea
                rows={4}
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button className="w-full rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700">
                Hoàn tất đơn hàng
              </button>
            </section>
          </form>

          <aside className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin đơn hàng</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Đầm linen midi</span>
                <span>1.590.000đ</span>
              </div>
              <div className="flex justify-between">
                <span>Sneaker AirFlex</span>
                <span>1.990.000đ</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Tổng cộng</span>
                <span>3.580.000đ</span>
              </div>
            </div>
            <div className="space-y-2 rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">
              <p>• Bạn sẽ nhận được email/SMS xác nhận sau khi hoàn tất thanh toán.</p>
              <p>• Đơn hàng được đồng bộ với hệ thống quản trị để kho xử lý nhanh chóng.</p>
              <p>• Theo dõi hành trình giao hàng trong mục "Đơn hàng" của tài khoản.</p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
