"use client";

import Image from "next/image";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { cn } from "@/lib/utils";

const IMAGES = [
  { src: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80", ratio: "[3/4]" },
  { src: "https://images.unsplash.com/photo-1519337911274-0b7c0d0b5dca?auto=format&fit=crop&w=900&q=80", ratio: "[4/3]" },
  { src: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80", ratio: "[1/1]" },
  { src: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80", ratio: "[3/4]" },
  { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", ratio: "[4/5]" },
  { src: "https://images.unsplash.com/photo-1516641397556-bf3c03fed1dc?auto=format&fit=crop&w=900&q=80", ratio: "[4/3]" },
];

export function Showcase() {
  return (
    <section className="container py-16">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]"><GalleryGrid /></div>
    </section>
  );
}

function GalleryGrid() {
  return (
    <>
      {IMAGES.map((img, i) => (
        <Reveal key={i}>
          <ParallaxCard>
            <div className={cn("relative mb-4 overflow-hidden rounded-xl", `aspect-${img.ratio}`)}>
              <Image src={img.src} alt="Showcase" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
            </div>
          </ParallaxCard>
        </Reveal>
      ))}
    </>
  );
}

function Reveal({ children }: React.PropsWithChildren) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "transition duration-lg will-change-transform",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {children}
    </div>
  );
}

function ParallaxCard({ children }: React.PropsWithChildren) {
  function onMouseMove(e: React.MouseEvent) {
    const el = e.currentTarget as HTMLDivElement;
    const r = el.getBoundingClientRect();
    const py = (e.clientY - r.top) / r.height;
    const offset = (py - 0.5) * 10; // -5..5
    const img = el.querySelector("img") as HTMLImageElement | null;
    if (img) img.style.transform = `translateY(${offset}px)`;
  }
  function onLeave(e: React.MouseEvent) {
    const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement | null;
    if (img) img.style.transform = `translateY(0px)`;
  }
  return (
    <div onMouseMove={onMouseMove} onMouseLeave={onLeave} className="[&_img]:transition-transform">
      {children}
    </div>
  );
}

