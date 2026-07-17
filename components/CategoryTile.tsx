import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gradientForSeed } from "@/lib/placeholder";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category } from "@/lib/types";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-2xl border border-border p-5 transition hover:border-accent/50"
      style={{ background: gradientForSeed(category.slug) }}
    >
      <CategoryIcon
        name={category.icon}
        className="h-8 w-8 text-white/70 transition group-hover:scale-110"
      />
      <div>
        <h3 className="font-semibold text-white">{category.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-white/70">
          Shop now
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}
