// Deterministic placeholder "art" (gradient) for products/categories that don't
// have real photography yet. Same seed always produces the same look.
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Curated earthy hue pairs (forest green, gold, olive, teal, terracotta) so
// placeholder art stays within the shop's calm palette instead of cycling
// through the full color wheel (no reds/blues/purples/pinks).
const HUE_PAIRS: [number, number][] = [
  [150, 170], // forest green
  [38, 55], // amber / gold
  [80, 100], // olive
  [165, 185], // deep teal-green
  [20, 35], // warm terracotta
  [95, 115], // moss
  [130, 145], // sage
  [45, 60], // honey
];

export function gradientForSeed(seed: string): string {
  const hash = hashSeed(seed);
  const [hueA, hueB] = HUE_PAIRS[hash % HUE_PAIRS.length];
  const jitter = hash % 10;
  return `linear-gradient(135deg, hsl(${hueA + jitter} 55% 22%) 0%, hsl(${hueB + jitter} 48% 12%) 100%)`;
}
