import Link from "next/link";
import Image from "next/image";
import { AtSign, MapPin, Clock, Phone } from "lucide-react";
import { categories } from "@/lib/data/categories";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Ali Baba Smoke Shop"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <p className="text-lg font-bold">
              <span className="text-accent">Ali Baba</span> Smoke Shop
            </p>
          </div>
          <p className="mt-3 text-sm text-foreground/60">
            Tampa&apos;s spot for vapes, tobacco, hookah, and smoking
            accessories. In-store and online.
          </p>
          <a
            href="https://www.instagram.com/alibabasmoketampa/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/70 transition hover:text-accent"
          >
            <AtSign className="h-4 w-4" /> alibabasmoketampa on Instagram
          </a>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Shop
          </p>
          <ul className="flex flex-col gap-2 text-sm text-foreground/70">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="transition hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Visit
          </p>
          <ul className="flex flex-col gap-3 text-sm text-foreground/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              Tampa, FL &mdash; exact address on our{" "}
              <Link href="/about" className="underline underline-offset-2 hover:text-accent">
                about page
              </Link>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              Mon&ndash;Sun, 10am&ndash;10pm (update with real hours)
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              (813) 555-0100 (placeholder)
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Legal
          </p>
          <p className="text-xs leading-relaxed text-foreground/50">
            You must be 21+ to purchase age-restricted products from this
            site. Valid government ID is required at checkout and upon
            delivery. Products are not intended for use by minors, women who
            are pregnant or breastfeeding, or persons with or at risk of
            heart disease, high blood pressure, or diabetes. This site does
            not ship to states/localities where these products are
            restricted.
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-foreground/40 sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} Ali Baba Smoke Shop. All rights reserved.
      </div>
    </footer>
  );
}
