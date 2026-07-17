"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { categories } from "@/lib/data/categories";

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/about", label: "About & Location" },
];

export function Navbar() {
  const { itemCount, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMobileOpen(false);
    router.push(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ali Baba Smoke Shop"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-accent">
            Ali Baba
          </span>
          <span className="hidden text-lg font-light tracking-tight sm:inline">
            Smoke Shop
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <span className="cursor-default text-sm font-medium text-foreground/80 transition group-hover:text-accent">
              Categories
            </span>
            <div className="invisible absolute left-0 top-full grid w-56 grid-cols-1 gap-1 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition hover:bg-background hover:text-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <form
          onSubmit={handleSearch}
          className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 md:flex"
        >
          <Search className="h-4 w-4 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
        </form>

        <button
          type="button"
          onClick={openDrawer}
          className="relative ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-2 transition hover:border-accent/50 md:ml-0"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-4 py-4 lg:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
            <Search className="h-4 w-4 text-foreground/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-surface hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <p className="mt-2 px-2 text-xs uppercase tracking-wide text-foreground/40">
              Categories
            </p>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2 text-sm text-foreground/80 hover:bg-surface hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
