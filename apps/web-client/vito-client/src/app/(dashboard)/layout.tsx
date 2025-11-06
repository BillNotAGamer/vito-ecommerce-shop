import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Vito Atelier | Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell withSidebar>{children}</AppShell>;
}

