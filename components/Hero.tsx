import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Lock } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, hsl(145 35% 16%) 0%, transparent 45%), radial-gradient(circle at 85% 0%, hsl(38 40% 14%) 0%, transparent 40%), var(--color-background)",
        }}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Tampa&apos;s Smoke Shop
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Everything your smoke shop needs,{" "}
            <span className="text-accent">delivered to your door.</span>
          </h1>
          <p className="mt-5 max-w-lg text-foreground/60">
            Vapes, tobacco accessories, hookah, glass, and more &mdash; browse
            our full catalog online and have it packed and shipped straight
            to you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-accent/50"
            >
              Visit Our Store
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-foreground/60">
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold" /> Discreet shipping
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold" /> 21+ age verified
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gold" /> Secure checkout
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            "hsl(145 40% 22%)",
            "hsl(38 60% 24%)",
            "hsl(165 30% 18%)",
            "hsl(90 22% 20%)",
          ].map((bg, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl border border-border/60"
              style={{
                background: `linear-gradient(150deg, ${bg} 0%, transparent 100%)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
