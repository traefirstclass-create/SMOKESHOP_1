import {
  Zap,
  Wind,
  Droplet,
  CircleDot,
  Flame,
  Layers,
  Cog,
  FlameKindling,
  Package,
  Shirt,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Zap,
  Wind,
  Droplet,
  CircleDot,
  Flame,
  Layers,
  Cog,
  FlameKindling,
  Package,
  Shirt,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className={className} />;
}
