import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const price = product.salePrice ?? product.price;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badges?.length ? (
          <div className="absolute left-3 top-3 flex gap-2">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-black/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
          <span>{product.categorySlug.replace("-", " ")}</span>
          <span>⭐ {product.rating.toFixed(1)} ({product.reviewCount})</span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 transition group-hover:text-gray-600">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-baseline gap-2 text-lg font-semibold text-gray-900">
          <span>{price.toLocaleString("vi-VN")}đ</span>
          {hasDiscount ? (
            <span className="text-sm font-normal text-gray-400 line-through">
              {product.price.toLocaleString("vi-VN")}đ
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
