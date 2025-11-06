"use client";

import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="container py-16">
      <div className="relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, var(--color-accent-400), var(--color-primary-500))" }}>
        <div className="glass rounded-2xl p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="type-h3 tracking-tight">Sẵn sàng nâng cấp tủ đồ của bạn?</h3>
              <p className="text-muted-foreground">Ưu đãi 15% cho đơn hàng đầu tiên hôm nay.</p>
            </div>
            <div className="flex gap-3">
              <Button>Khám phá ngay</Button>
              <Button variant="outline">Tìm hiểu thêm</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

