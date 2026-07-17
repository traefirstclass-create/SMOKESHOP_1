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

export function gradientForSeed(seed: string): string {
  const hash = hashSeed(seed);
  const hueA = hash % 360;
  const hueB = (hueA + 45 + (hash % 40)) % 360;
  return `linear-gradient(135deg, hsl(${hueA} 70% 22%) 0%, hsl(${hueB} 65% 12%) 100%)`;
}
