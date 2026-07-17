import { gradientForSeed } from "@/lib/placeholder";
import { CategoryIcon } from "@/components/CategoryIcon";

export function ProductArt({
  seed,
  icon,
  className,
  iconClassName,
}: {
  seed: string;
  icon: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={className}
      style={{ background: gradientForSeed(seed) }}
    >
      <CategoryIcon
        name={icon}
        className={iconClassName ?? "h-10 w-10 text-white/70"}
      />
    </div>
  );
}
