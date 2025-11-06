import { AppShell } from "@/components/app-shell";
import { Hero, Features, Showcase, Testimonials, Pricing, FAQ, CTABanner } from "@/components/landing";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-16 pb-16">
        <Hero />
        <Features />
        <Showcase />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTABanner />
      </div>
    </AppShell>
  );
}

