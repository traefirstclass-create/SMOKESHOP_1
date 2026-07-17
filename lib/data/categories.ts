import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-vapes",
    name: "Vapes & Devices",
    slug: "vapes",
    description: "Mods, pod systems, and starter kits.",
    icon: "Zap",
  },
  {
    id: "cat-disposables",
    name: "Disposables",
    slug: "disposables",
    description: "Grab-and-go disposable vapes in every flavor.",
    icon: "Wind",
  },
  {
    id: "cat-eliquids",
    name: "E-Liquids",
    slug: "e-liquids",
    description: "Bottled e-liquids and nic salts.",
    icon: "Droplet",
  },
  {
    id: "cat-glass",
    name: "Glass & Water Pipes",
    slug: "glass",
    description: "Hand pipes, bubblers, and water pipes.",
    icon: "CircleDot",
  },
  {
    id: "cat-hookah",
    name: "Hookah & Shisha",
    slug: "hookah",
    description: "Hookahs, shisha flavors, and coals.",
    icon: "Flame",
  },
  {
    id: "cat-papers",
    name: "Rolling Papers & Wraps",
    slug: "papers",
    description: "Papers, cones, wraps, and filters.",
    icon: "Layers",
  },
  {
    id: "cat-grinders",
    name: "Grinders",
    slug: "grinders",
    description: "Herb grinders in every size and finish.",
    icon: "Cog",
  },
  {
    id: "cat-lighters",
    name: "Lighters & Torches",
    slug: "lighters",
    description: "Torch lighters, classics, and butane.",
    icon: "FlameKindling",
  },
  {
    id: "cat-accessories",
    name: "Smoking Accessories",
    slug: "accessories",
    description: "Trays, cases, cleaners, and more.",
    icon: "Package",
  },
  {
    id: "cat-apparel",
    name: "Apparel & Merch",
    slug: "apparel",
    description: "Shop tees, hats, and stickers.",
    icon: "Shirt",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function iconForCategorySlug(slug: string): string {
  return getCategoryBySlug(slug)?.icon ?? "Package";
}
