"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon, TruckIcon, CreditCardIcon } from "lucide-react";
import { SpotlightCursor, GradientMesh, NoiseOverlay } from "./backgrounds";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <GradientMesh />
      <NoiseOverlay />
      <SpotlightCursor />
      <div className="container relative flex flex-col items-start gap-8 py-24">
        <p className="type-small uppercase tracking-[0.2em] text-muted-foreground">Bộ sưu tập mới</p>
        <h1 className="type-display text-balance tracking-tight">
          Thời trang tối giản. Chất liệu bền vững.
        </h1>
        <p className="type-lead text-muted-foreground max-w-2xl text-balance">
          Nâng tầm phong cách mỗi ngày với các thiết kế tinh giản, chất liệu cao cấp và đường may chuẩn mực.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="shadow-elevation-2">Mua ngay</Button>
          <Button variant="ghost" className="">Xem lookbook</Button>
        </div>
        <ul className="mt-6 grid w-full gap-4 text-sm sm:grid-cols-3">
          <TrustItem icon={TruckIcon} title="Giao nhanh 48h" desc="Hà Nội & TP.HCM" />
          <TrustItem icon={CreditCardIcon} title="Thanh toán an toàn" desc="COD / Thẻ / QR Pay" />
          <TrustItem icon={ShieldCheckIcon} title="Đổi trả 7 ngày" desc="Hỗ trợ linh hoạt" />
        </ul>
      </div>
    </section>
  );
}

function TrustItem({
  icon: Icon,
  title,
  desc,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <li className={cn("glass rounded-lg p-4", className)}>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-md bg-secondary">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground text-xs">{desc}</p>
        </div>
      </div>
    </li>
  );
}

