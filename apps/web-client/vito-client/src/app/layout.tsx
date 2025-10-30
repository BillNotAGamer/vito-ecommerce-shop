import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vito Atelier | Thời trang thương mại điện tử",
  description:
    "Khám phá bộ sưu tập quần áo, phụ kiện cao cấp cùng trải nghiệm mua sắm và quản trị đồng bộ cho Vito Atelier.",
  metadataBase: new URL("https://vito-atelier.example"),
  openGraph: {
    title: "Vito Atelier",
    description:
      "Nền tảng thương mại điện tử thời trang dành cho khách hàng và đội ngũ quản trị.",
    url: "https://vito-atelier.example",
    siteName: "Vito Atelier",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 font-sans text-gray-900 antialiased`}
      >
        <SiteHeader />
        <main className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-white via-white to-gray-50">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
