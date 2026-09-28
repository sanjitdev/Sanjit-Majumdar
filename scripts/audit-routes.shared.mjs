// Single source of truth for the closed audit-route list (amended AD-12)
// AND the closed design-token allowlist (AD-18, amended 2026-09-24-1).
// Imported by scripts/audit-budget.mjs, scripts/audit-routes.mjs,
// scripts/audit-tokens.mjs, and surfaced into .pa11yci.json at
// config-generation time.
// Adding a route or token is a one-line edit; do NOT duplicate these arrays
// elsewhere.

// ─── PROD_ROUTES + PREVIEW_ROUTES (1-4, amended 1-12) ───────────────────
// Closed split of public-route URLs into production routes (full AD-12
// invariant: spine line + proof number + return path) and preview routes
// (structural-only: HTTP 200 + non-empty body).
//
// The split was introduced 2026-09-25 (1-12-foundation-closeout fix 4)
// because the `app/__preview/` folder was renamed to `app/preview/`. Now
// that the routes are reachable from `pnpm build`, the original AD-12
// audit would fail 4 of the 5 preview harnesses by design — component
// previews render a single component, not the homepage composition. The
// AD-12 invariant stays scoped to production routes; preview coverage
// of those invariants lives in pa11y-ci (`.pa11yci.json`) and Lighthouse
// (`pnpm lighthouse`), NOT in `pnpm audit:routes`.
//
// The harness pages are noindex via B5
// (`metadata.robots = { index: false, follow: false }`) so they don't
// surface in search results.

export const PROD_ROUTES = [
  '/',
  '/work',
  '/projects',
  '/lab',
  '/patterns',
  '/now',
  '/about',
  '/recruiter',
  '/built',
  '/404',
];

export const PREVIEW_ROUTES = [
  '/preview/filter-chip-group',
  '/preview/layer-row-hover',
  '/preview/nav',
  '/preview/hero',
  '/preview/homepage',
];

// Backward-compat alias: callers that imported AUDIT_ROUTES get the
// concatenation of both arrays, preserving the original one-array contract.
// This keeps any external consumer (CI scripts, pa11y-ci URL generation,
// Lighthouse configuration) working without code changes. The audit-routes
// script itself uses PROD_ROUTES + PREVIEW_ROUTES directly so it can apply
// the correct assertion per route class.
export const AUDIT_ROUTES = [...PROD_ROUTES, ...PREVIEW_ROUTES];

// ─── AUDIT_TOKEN_GLOBS + ALLOWED_HEX + ALLOWED_RGBA (1-5, AD-18) ──────────
// Source-glob list walked by scripts/audit-tokens.mjs. The audit walks
// `lib/design-tokens.ts` on purpose — the closed ALLOWED_HEX / ALLOWED_RGBA
// allowlist is the exemption, not a per-file skip (see spec-1-5 AC #5).
export const AUDIT_TOKEN_GLOBS = [
  'app/**/*.tsx',
  'app/**/*.mdx',
  'components/**/*.tsx',
  'lib/**/*.ts',
  'lib/**/*.tsx',
];

// Closed hex allowlist — the 12 verbatim color hex values from DESIGN.md
// "Colors" table (lines 309-329). The 7 rgba glass/border/glow values are
// matched separately in ALLOWED_RGBA below.
export const ALLOWED_HEX = [
  '#06070B', // --bg, --on-accent, --on-live
  '#0B0D14', // --bg-2
  '#10131C', // --bg-3
  '#A78BFA', // --accent, --border-accent, --accent-glow, --shadow-glow, --shadow-glow-strong
  '#67E8F9', // --accent-2
  '#F472B6', // --accent-3
  '#FAFAFA', // --fg
  '#D4D4D8', // --fg-2
  '#8B8E97', // --fg-3
  '#5C5F68', // --fg-4
  '#34D399', // --live, --live-glow
  '#FCA5A5', // --warn
];

// Closed rgba allowlist — the 7 verbatim glass/border/glow values from
// DESIGN.md that consumers may reference inline. The shadow and gradient
// rgba values used in `app/globals.css` are NOT in this list because
// `app/globals.css` is not walked by the audit; consumer `.tsx` files
// should reference shadows / gradients via the `--*` token names, not via
// inline rgba.
export const ALLOWED_RGBA = [
  'rgba(255,255,255,0.03)',  // --glass
  'rgba(255,255,255,0.06)',  // --glass-strong, --border
  'rgba(255,255,255,0.12)',  // --border-strong
  'rgba(167,139,250,0.30)',  // --border-accent, --shadow-glow
  'rgba(167,139,250,0.25)',  // --accent-glow
  'rgba(52,211,153,0.20)',   // --live-glow
  'rgba(167,139,250,0.40)',  // --shadow-glow-strong
  'rgba(6,7,11,0.72)',       // UX-DR13 nav scrim (spec-1-7); not in DESIGN.md
                              // color table — exempt as a closed-set addition
];

