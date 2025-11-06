import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Vito Atelier | Marketing",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <AppShell withSidebar={false}>{children}</AppShell>;
}

