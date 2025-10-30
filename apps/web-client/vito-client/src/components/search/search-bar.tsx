"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { products } from "@/data/catalog";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return products.filter((product) => product.bestseller).slice(0, 5);
    }

    const normalized = query.trim().toLowerCase();
    return products
      .filter((product) => product.name.toLowerCase().includes(normalized))
      .slice(0, 5);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form action="/search" className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-200">
        <span aria-hidden className="text-gray-400">
          🔍
        </span>
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-gray-700"
        >
          Tìm
        </button>
      </form>

      {isOpen && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-xs font-medium uppercase text-gray-500">
            <span>{query.trim() ? "Gợi ý kết quả" : "Xu hướng mua"}</span>
            <span>{suggestions.length} sản phẩm</span>
          </div>
          <ul className="divide-y divide-gray-100 text-sm text-gray-700">
            {suggestions.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                      {product.categorySlug.replace("-", " ")}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {(product.salePrice ?? product.price).toLocaleString("vi-VN")}đ
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
