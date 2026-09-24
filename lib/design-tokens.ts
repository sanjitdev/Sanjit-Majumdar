/**
 * lib/design-tokens.ts — AD-17 + AD-18 co-source.
 *
 * Mirrors the 21 closed color names from `app/globals.css` `@theme` block so
 * TypeScript consumers (today: only `lib/canvas-modes.ts` per story 1-6) can
 * reference colors by name without re-declaring the `var(--...)` strings.
 *
 * Co-source invariant: this array's length MUST equal 21 and every entry MUST
 * match a `--<name>:` declaration in `app/globals.css`. Drift in either
 * direction (entry added/removed here without a matching @theme change, or
 * vice versa) is a TOKEN_NAME_DRIFT failure mode. Today no automated lint
 * asserts this — the spec's I/O matrix (TOKEN_NAME_DRIFT row) routes it to
 * human review; story 1-6's `canvas-modes.ts` import is the first compile-time
 * check that the closed name set is internally consistent.
 *
 * The 4 named accent constants below are the high-traffic names; consumers
 * should import these instead of re-declaring `var(--accent)` so a future
 * token rename is a single-line edit here.
 *
 * IMPORTANT: this file references colors ONLY via `var(--...)` form (no
 * literal hex). The audit `pnpm audit:tokens` (scripts/audit-tokens.mjs) walks
 * this file but the closed ALLOWED_HEX / ALLOWED_RGBA allowlist exempts the
 * `var(--...)` references — see scripts/audit-routes.shared.mjs for the
 * closed list. Adding a raw hex literal here would intentionally break the
 * audit (that's the regression the audit is designed to catch).
 */

/**
 * The 21 closed color token names from AD-18. Order matches DESIGN.md's
 * "Colors" table (lines 309-329).
 */
export const DESIGN_TOKENS = [
  '--bg',
  '--bg-2',
  '--bg-3',
  '--fg',
  '--fg-2',
  '--fg-3',
  '--fg-4',
  '--accent',
  '--accent-2',
  '--accent-3',
  '--live',
  '--warn',
  '--on-accent',
  '--on-live',
  '--glass',
  '--glass-strong',
  '--border',
  '--border-strong',
  '--border-accent',
  '--accent-glow',
  '--live-glow',
] as const;

export type DesignToken = (typeof DESIGN_TOKENS)[number];

/**
 * The 4 high-traffic accent colors exported as `var(--...)` form. Consumers
 * should prefer these named exports over re-declaring the literal strings.
 */
export const ACCENT = 'var(--accent)';
export const ACCENT_2 = 'var(--accent-2)';
export const ACCENT_3 = 'var(--accent-3)';
export const LIVE = 'var(--live)';
