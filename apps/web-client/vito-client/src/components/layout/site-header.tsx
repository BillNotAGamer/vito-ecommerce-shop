import Link from "next/link";
import Container from "./container";
import SearchBar from "../search/search-bar";
import { categories } from "@/data/catalog";

const primaryNav = categories.slice(0, 4);

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur">
      <Container className="flex flex-wrap items-center gap-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-gray-900 transition hover:text-gray-600"
        >
          Vito Atelier
        </Link>

        <nav className="hidden flex-1 items-center gap-4 text-sm font-medium text-gray-700 lg:flex">
          {primaryNav.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-full px-3 py-1 transition hover:bg-gray-100 hover:text-gray-900"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex w-full flex-1 items-center gap-3 lg:w-auto lg:flex-none">
          <SearchBar />
          <Link
            href="/account"
            className="hidden text-sm font-medium text-gray-700 transition hover:text-gray-900 md:block"
          >
            Tài khoản
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Giỏ hàng
          </Link>
        </div>
      </Container>
    </header>
  );
}
