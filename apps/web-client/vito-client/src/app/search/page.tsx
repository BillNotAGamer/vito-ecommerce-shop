import Link from "next/link";
/* eslint-disable react/no-unescaped-entities */
import Container from "@/components/layout/container";
import ProductCard from "@/components/commerce/product-card";
import { products, searchProducts } from "@/data/catalog";

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const keyword = searchParams.q?.toString().trim() ?? "";
  const hasKeyword = keyword.length > 0;
  const results = hasKeyword ? searchProducts(keyword) : products.slice(0, 6);

  return (
    <div className="pb-24">
      <Container className="space-y-12">
        <div className="space-y-4 pt-10">
          <h1 className="text-3xl font-semibold text-gray-900">Tìm kiếm sản phẩm</h1>
          <p className="text-sm text-gray-600">
            {hasKeyword
              ? `Kết quả cho từ khóa "${keyword}"`
              : "Nhập từ khóa để tìm sản phẩm hoặc tham khảo gợi ý dưới đây."}
          </p>
        </div>

        {hasKeyword ? null : (
          <section className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-sm text-gray-600 shadow-sm">
            <p className="font-semibold text-gray-900">Mẹo tìm kiếm:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Sử dụng tên sản phẩm, chất liệu hoặc danh mục.</li>
              <li>Kết hợp thêm màu sắc hoặc kích cỡ mong muốn.</li>
              <li>Thử các từ khóa tiếng Anh như "linen", "blazer", "sneaker".</li>
            </ul>
          </section>
        )}

        {results.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-600 shadow-sm">
            <p>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác hoặc xem các danh mục nổi bật.</p>
            <Link
              href="/categories/nu"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Xem danh mục
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
