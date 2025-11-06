"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    monthly: 9,
    yearly: 90,
    features: ["5 sản phẩm", "1 cửa hàng", "Email hỗ trợ"],
  },
  {
    name: "Pro",
    monthly: 19,
    yearly: 190,
    features: ["50 sản phẩm", "3 cửa hàng", "Hỗ trợ ưu tiên"],
    highlighted: true,
  },
  {
    name: "Business",
    monthly: 49,
    yearly: 490,
    features: ["Không giới hạn", "15 cửa hàng", "CSKH chuyên biệt"],
  },
];

export function Pricing() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section className="container py-16">
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className={cn("text-sm", cycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
        <button
          className="relative inline-flex h-9 items-center rounded-full bg-secondary p-1"
          onClick={() => setCycle(cycle === "monthly" ? "yearly" : "monthly")}
          aria-label="Toggle billing cycle"
        >
          <span className={cn("inline-block size-7 rounded-full bg-background shadow-elevation-1 transition", cycle === "monthly" ? "translate-x-0" : "translate-x-8")} />
        </button>
        <span className={cn("text-sm", cycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>Yearly</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const price = cycle === "monthly" ? p.monthly : p.yearly;
          return (
            <div
              key={p.name}
              className={cn(
                "rounded-xl border bg-card p-6 text-card-foreground transition",
                p.highlighted && "scale-[1.02] ring-2 ring-primary/40 shadow-elevation-2"
              )}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-2 text-3xl font-semibold">${price}<span className="text-sm font-normal text-muted-foreground">/{cycle === "monthly" ? "mo" : "yr"}</span></p>
              </div>
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary-500" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={p.highlighted ? "default" : "outline"}>
                Chọn gói
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

