"use client";

import { cn } from "@/lib/utils";
import { SparklesIcon, RecycleIcon, RulerIcon, GaugeIcon, ShieldCheckIcon, ScrollTextIcon } from "lucide-react";
import { useCallback, useRef } from "react";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  { icon: SparklesIcon, title: "Tinh giản, hiện đại", desc: "Form dáng thanh thoát, lịch lãm." },
  { icon: RecycleIcon, title: "Chất liệu bền vững", desc: "Ưu tiên organic & tái chế." },
  { icon: RulerIcon, title: "Phom chuẩn", desc: "Tối ưu tỷ lệ cho vóc dáng Á Đông." },
  { icon: GaugeIcon, title: "Thoáng & nhẹ", desc: "Thoải mái cả ngày dài." },
  { icon: ShieldCheckIcon, title: "Bảo hành đường may", desc: "Cam kết trải nghiệm hoàn hảo." },
  { icon: ScrollTextIcon, title: "Chính sách rõ ràng", desc: "Đổi trả linh hoạt, minh bạch." },
];

export function Features() {
  return (
    <section className="container py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <TiltCard key={i}>
            <div className="glass rounded-xl p-5 shadow-elevation-1 transition">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}

function TiltCard({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -6;
    const ry = (px - 0.5) * 6;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={cn("transition-transform duration-md", className)}>
      {children}
    </div>
  );
}

