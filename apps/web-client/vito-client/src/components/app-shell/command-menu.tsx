"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { categories } from "@/data/catalog";
import { useRouter } from "next/navigation";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const featured = useMemo(() => categories.slice(0, 5), []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Tìm nhanh" description="Tìm sản phẩm, danh mục, trang…">
      <CommandInput placeholder="Tìm kiếm (⌘K)" />
      <CommandList>
        <CommandEmpty>Không có kết quả.</CommandEmpty>
        <CommandGroup heading="Danh mục nổi bật">
          {featured.map((c) => (
            <CommandItem
              key={c.slug}
              onSelect={() => {
                setOpen(false);
                router.push(`/categories/${c.slug}`);
              }}
            >
              <span>{c.name}</span>
              <CommandShortcut>{c.highlight}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Điều hướng">
          <CommandItem onSelect={() => router.push("/products")}>Sản phẩm</CommandItem>
          <CommandItem onSelect={() => router.push("/cart")}>Giỏ hàng</CommandItem>
          <CommandItem onSelect={() => router.push("/account")}>Tài khoản</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

