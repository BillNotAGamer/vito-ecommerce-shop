import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/layout/container";
import ProductCard from "@/components/commerce/product-card";
import {
  categories,
  getCategoryBySlug,
  getFacetsForCategory,
  getProductsByCategory,
  products as allProducts,
} from "@/data/catalog";

interface CategoryPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    return {};
  }

  return {
    title: `${category.name} | Vito Atelier`,
    description: category.description,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(category.slug);
  const facets = getFacetsForCategory(category.slug);
  const relatedCategories = categories.filter((item) => item.slug !== category.slug).slice(0, 3);

  return (
    <div className="space-y-16 pb-24">
      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0">
          <Image
            src={category.heroImage}
            alt={category.name}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/30" />
        <Container className="relative z-10 grid gap-8 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Bộ sưu tập
            </p>
            <h1 className="text-4xl font-semibold leading-tight">{category.name}</h1>
            <p className="max-w-2xl text-base text-white/80">{category.description}</p>
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span>• Tập trung vào chất liệu cao cấp</span>
              <span>• Bảo hành 30 ngày</span>
              <span>• Miễn phí đổi size lần đầu</span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/5 p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Gợi ý nhanh</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {categoryProducts.slice(0, 4).map((product) => (
                <li key={product.id} className="flex items-center justify-between">
                  <Link href={`/products/${product.slug}`} className="font-semibold text-white hover:underline">
                    {product.name}
                  </Link>
                  <span>{(product.salePrice ?? product.price).toLocaleString("vi-VN")}đ</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-10">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Bộ lọc</p>
            <div className="mt-6 space-y-6 text-sm text-gray-600">
              {facets.priceRange ? (
                <div>
                  <p className="font-semibold text-gray-900">Khoảng giá</p>
                  <p>
                    {facets.priceRange.min.toLocaleString("vi-VN")}đ - {" "}
                    {facets.priceRange.max.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              ) : null}
              <div>
                <p className="font-semibold text-gray-900">Màu sắc</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {facets.colors.map((color) => (
                    <span key={color} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Kích cỡ</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {facets.sizes.map((size) => (
                    <span key={size} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Chất liệu</p>
                <ul className="mt-3 space-y-2">
                  {facets.materials.map((material) => (
                    <li key={material} className="flex items-center gap-2">
                      <span className="text-lg">▹</span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Danh mục liên quan</p>
            <ul className="space-y-3 text-sm text-gray-600">
              {relatedCategories.map((item) => (
                <li key={item.slug}>
                  <Link href={`/categories/${item.slug}`} className="font-medium text-gray-700 hover:text-gray-900">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">{categoryProducts.length} sản phẩm</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Sắp xếp:</span>
              <button className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-gray-300 hover:bg-gray-50">
                Mới nhất
              </button>
              <button className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-gray-300 hover:bg-gray-50">
                Giá tăng dần
              </button>
              <button className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-gray-300 hover:bg-gray-50">
                Giá giảm dần
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="rounded-3xl bg-gray-900 p-10 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Tip phối đồ</p>
                <h3 className="text-2xl font-semibold">Hoàn thiện outfit cùng các sản phẩm liên quan</h3>
                <p className="text-sm text-white/80">
                  Kết hợp cùng phụ kiện đồng điệu để tạo nên cá tính riêng của bạn.
                </p>
              </div>
              <div className="flex gap-4">
                {allProducts
                  .filter((product) => product.categorySlug !== category.slug)
                  .slice(0, 2)
                  .map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      {product.name}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
