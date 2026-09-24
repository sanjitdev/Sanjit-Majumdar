/**
 * <ProofVectorCluster> — AD-13 closed-set discipline: server component (no
 * `"use client"`). Renders a 2×2 grid at `md+` (single-column below) of the
 * four v4 proof numbers from `HERO_PROOF_ITEMS`. Values render in
 * `--gradient-text` (90deg, 2 stops: violet → cyan) via Tailwind utility;
 * labels render in `--font-label` (Inter, 0.75rem).
 *
 * The four closed values are members of the 8-element `PROOF_NUMBERS` set
 * locked in `scripts/audit-routes.spec.mjs:10`:
 *   ['7+', '10K+', '35%', '22h', '1.2M', '−68%', '7-person', '8+ years']
 * The standalone token `'6'` is intentionally excluded as bypassable.
 *
 * Props accept a custom `items` array so future consumers (e.g., a case-
 * study hero in E3) can reuse this layout with different proof numbers.
 * Default export keeps the homepage hero self-contained.
 */
export const HERO_PROOF_ITEMS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '1.2M', label: 'patients served' },
  { value: '−68%', label: 'P95 latency' }, // U+2212 minus sign (NOT hyphen-minus); required for the HTML to render −68% as a standalone token in the closed PROOF_NUMBERS set
  { value: '22h', label: 'MTTR' },
  { value: '7-person', label: 'team mentored' },
];

export function ProofVectorCluster({
  items = HERO_PROOF_ITEMS,
}: {
  items?: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
      {items.map((item, index) => (
        <li key={`${index}-${item.value}`}>
          <span className="font-display bg-gradient-text bg-clip-text text-transparent [font-size:var(--text-headline-md)] font-medium">
            {item.value}
          </span>
          <span className="mt-2 block font-label text-fg-2">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
