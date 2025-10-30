import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/container";
import ProductCard from "@/components/commerce/product-card";
import {
  getProductBySlug,
  products,
  productReviews,
} from "@/data/catalog";

interface ProductPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | Vito Atelier`,
    description: product.description,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const reviews = productReviews[product.slug] ?? [];
  const relatedProducts = products.filter((item) => product.related.includes(item.slug)).slice(0, 4);

  return (
    <div className="space-y-16 pb-24">
      <section>
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {product.images.map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {product.highlights.map((highlight) => (
                <div key={highlight} className="rounded-3xl bg-gray-50 p-4 text-sm text-gray-700">
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="space-y-3">
              <Link
                href={`/categories/${product.categorySlug}`}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400"
              >
                {product.categorySlug.replace("-", " ")}
              </Link>
              <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-600">{product.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>⭐ {product.rating.toFixed(1)}</span>
                <span>({product.reviewCount} đánh giá)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 text-3xl font-semibold text-gray-900">
              <span>{(product.salePrice ?? product.price).toLocaleString("vi-VN")}đ</span>
              {product.salePrice ? (
                <span className="text-base font-normal text-gray-400 line-through">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              ) : null}
            </div>

            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">Màu sắc</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Kích cỡ</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Tình trạng</p>
                <p>
                  {product.inventory.status === "in_stock"
                    ? "Còn hàng"
                    : product.inventory.status === "low_stock"
                    ? `Sắp hết (${product.inventory.quantity} sản phẩm)`
                    : "Hết hàng"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700">
                Thêm vào giỏ hàng
              </button>
              <button className="w-full rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50">
                Thêm vào wishlist
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">Chất liệu</p>
                <ul className="mt-2 space-y-1">
                  {product.materials.map((material) => (
                    <li key={material}>• {material}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Hướng dẫn bảo quản</p>
                <ul className="mt-2 space-y-1">
                  {product.care.map((care) => (
                    <li key={care}>• {care}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Đánh giá sản phẩm</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-600">Sản phẩm chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.author} className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="font-semibold text-gray-900">{review.author}</div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">{review.title}</div>
                    <p className="mt-3 text-sm text-gray-700">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Chính sách &amp; dịch vụ</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>• Đổi trả trong 7 ngày khi còn tag và hóa đơn</li>
              <li>• Miễn phí sửa size lần đầu cho khách hạng Bạc trở lên</li>
              <li>• Hỗ trợ chat trực tiếp với stylist qua ứng dụng</li>
              <li>• Đóng gói thân thiện môi trường</li>
            </ul>
          </div>
        </Container>
      </section>

      {relatedProducts.length ? (
        <section>
          <Container className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Gợi ý thêm</p>
                <h2 className="text-3xl font-semibold text-gray-900">Bạn có thể thích</h2>
              </div>
              <Link href={`/categories/${product.categorySlug}`} className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">
                Xem thêm trong danh mục
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  );
}
