"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CommandMenu } from "./command-menu";
import { ThemeToggle } from "./theme-toggle";
import { MainNav } from "./main-nav";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { Button } from "@/components/ui/button";
import { MenuIcon, BellIcon, User2Icon, CommandIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function AppHeader() {
  const direction = useScrollDirection();
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header
        className={
          "glass shadow-elevation-2 sticky top-0 z-50 transition-transform duration-md ease-in-out-token"
        }
        style={{ transform: direction === "down" ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="container flex h-16 items-center gap-3">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="font-semibold tracking-tight">Vito Atelier</Link>
          </div>
          <MainNav
            items={[
              { href: "/", label: "Trang chủ" },
              { href: "/categories", label: "Danh mục" },
              { href: "/products", label: "Sản phẩm" },
            ]}
            className="ml-4"
          />
          <div className="ml-auto flex items-center gap-1">
            <KbdHint />
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => setCmdOpen(true)}
            >
              <CommandIcon className="size-4" />
              <span className="sr-only">Command menu</span>
            </Button>
            <ThemeToggle />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
      </header>
      <CommandMenu />
    </>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <MenuIcon className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-3 space-y-4">
          <Input placeholder="Tìm nhanh…" className="h-9" />
          <nav className="text-sm">
            <ul className="space-y-2">
              <li>
                <Link href="/" className="block rounded-md px-2 py-1 hover:bg-secondary">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="block rounded-md px-2 py-1 hover:bg-secondary">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/categories" className="block rounded-md px-2 py-1 hover:bg-secondary">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link href="/account" className="block rounded-md px-2 py-1 hover:bg-secondary">
                  Tài khoản
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="size-4" />
          <span className="sr-only">Notifications</span>
          <span className="absolute right-1 top-1 inline-flex h-1.5 w-1.5 rounded-full bg-destructive-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Đơn hàng #A120 đã giao</DropdownMenuItem>
        <DropdownMenuItem>Khuyến mãi mới</DropdownMenuItem>
        <DropdownMenuItem>3 sản phẩm còn lại</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User2Icon className="size-4" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">Hồ sơ</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">Đơn hàng</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function KbdHint() {
  return (
    <div className="hidden items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground sm:flex">
      <kbd className="font-mono">⌘</kbd>
      <span>K</span>
    </div>
  );
}

