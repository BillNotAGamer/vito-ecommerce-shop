"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { HomeIcon, Layers3Icon, BoxIcon, ShoppingCartIcon, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

type NavLink = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavLink[];
};

export function Sidebar({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useLocalStorage<boolean>("sidebar:open", true);

  // Sync with cookie-based state in ui/sidebar by toggling default open via button when needed.
  useEffect(() => {
    // noop – the underlying component uses its own state; we persist a preferred state for next mount
  }, [open]);

  return (
    <SidebarProvider defaultOpen={open}>
      <UISidebar collapsible="icon" side="left" className="shadow-elevation-2">
        <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted-foreground">Điều hướng</span>
          <SidebarTrigger onClick={() => setOpen(!open)} />
        </div>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tổng quan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild>
                    <Link href={link.href}>
                      {link.icon && <link.icon className="size-4" />}
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {link.badge != null && (
                    <SidebarMenuBadge className="bg-secondary text-secondary-foreground">
                      {link.badge}
                    </SidebarMenuBadge>
                  )}
                  {link.children && link.children.length > 0 && (
                    <SidebarMenuSub>
                      {link.children.map((child) => (
                        <SidebarMenuSubItem key={child.href}>
                          <SidebarMenuSubButton asChild>
                            <Link href={child.href}>{child.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/settings">
            <Settings2Icon className="mr-2 size-4" /> Cài đặt
          </Link>
        </Button>
      </SidebarFooter>
      </UISidebar>
    </SidebarProvider>
  );
}

export function SidebarInsetMain({ children }: { children: React.ReactNode }) {
  return <SidebarInset>{children}</SidebarInset>;
}

// Example default links
export const defaultSidebarLinks: NavLink[] = [
  { href: "/dashboard", label: "Tổng quan", icon: HomeIcon },
  {
    href: "/products",
    label: "Sản phẩm",
    icon: BoxIcon,
    children: [
      { href: "/products/new", label: "Thêm mới" },
      { href: "/products/list", label: "Danh sách" },
    ],
  },
  { href: "/categories", label: "Danh mục", icon: Layers3Icon, badge: 6 },
  { href: "/orders", label: "Đơn hàng", icon: ShoppingCartIcon, badge: 3 },
];
