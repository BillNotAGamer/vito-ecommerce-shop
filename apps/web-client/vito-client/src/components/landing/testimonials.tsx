"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    quote: "Chất liệu tuyệt vời, phom dáng chuẩn. Mặc cả ngày vẫn thoải mái.",
    author: "Minh An",
    role: "Marketing Manager",
  },
  {
    quote: "Dịch vụ giao hàng nhanh, đổi size hỗ trợ rất tốt.",
    author: "Lan Hương",
    role: "Designer",
  },
  {
    quote: "Tối giản nhưng khác biệt. Rất hợp phong cách công sở.",
    author: "Quang Huy",
    role: "Product Owner",
  },
];

export function Testimonials() {
  return (
    <section className="container py-16">
      <div className="relative">
        <Carousel opts={{ loop: true, align: "start" }}>
          <CarouselContent>
            {TESTIMONIALS.map((t, i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                <div className="glass h-full rounded-xl p-6 shadow-elevation-1">
                  <p className="text-balance">“{t.quote}”</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t.author}</span> • {t.role}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
      <div className="mt-6 overflow-x-auto snap-x snap-mandatory md:hidden">
        <div className="flex gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="min-w-[80%] snap-center">
              <div className="glass h-full rounded-xl p-6 shadow-elevation-1">
                <p>“{t.quote}”</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t.author}</span> • {t.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

