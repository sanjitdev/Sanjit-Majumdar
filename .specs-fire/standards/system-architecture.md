# System Architecture

> High-level shape of the Sanjit-Majumdar portfolio. The full
> architecture spine lives in
> `_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md`
> (20 ADs). This file is a FIRE-facing summary, not a replacement.

## One-liner

A public engineering portfolio that **proves** what Sanjit can do
instead of telling people. Shipped as a Next.js 16 App Router site on
Vercel with MDX-driven content, ISR revalidation, and a tightly
closed client component set.

## Layers

```
┌────────────────────────────────────────────────────────────────────┐
│  sanjit.dev (Vercel Edge)                                          │
│    • CSP, SRI (SHA-256), frame-ancestors 'none'                    │
│    • proxy.ts → middleware (auth, rewrites, headers)               │
├────────────────────────────────────────────────────────────────────┤
│  Next.js 16 / React 19 App Router                                  │
│    • RSC by default, client islands allowlist                      │
│    • SSG/ISR; on-demand revalidate at /api/revalidate               │
│    • MDX sources in content/ with Zod-validated frontmatter        │
├────────────────────────────────────────────────────────────────────┤
│  Components & design system                                        │
│    • shadcn/ui (new-york) + Radix primitives                        │
│    • Tailwind v4 + design tokens (lib/design-tokens.ts)            │
├────────────────────────────────────────────────────────────────────┤
│  Tooling & verification                                            │
│    • typecheck (tsc), lint (eslint), a11y (pa11y-ci), Lighthouse   │
│    • audit scripts (routes, content, tokens, budget)               │
└────────────────────────────────────────────────────────────────────┘
```

## Key architectural decisions (summary)

The full AD set lives in the architecture spine. Highlights:

- **AD-1 — RSC by default.** Client components are an allowlist.
- **AD-2 — MDX as content source.** Frontmatter is Zod-validated at build.
- **AD-3 — Design tokens are authoritative.** CSS variables mirror `lib/design-tokens.ts`.
- **AD-4 — Closed client set.** New client components require an ADR.
- **AD-5 — Edge security headers.** CSP + SRI enforced at the edge.
- **AD-6 — On-demand ISR.** `/api/revalidate` is the only revalidation path.
- **AD-7 — Accessibility as a gate.** `pa11y-ci` is part of the merge bar.
- **AD-8 — Performance budgets.** Lighthouse mobile ≥ 95 across the board.
- **AD-9 — No databases in the portfolio scope.** Content is MDX.
- **AD-10 — Single source of truth for env.** `lib/env.ts` is the only consumer.

(See the architecture spine for the remaining 10 ADs.)

## Routing

- App Router segments under `app/`.
- Preview routes under `app/preview/<scene>/` (filter-chip-group,
  hero, homepage, layer-row-hover, nav) — these are dev-only
  sandboxes, not part of the public surface.
- API: `app/api/revalidate/route.ts` (on-demand revalidation only).

## Content pipeline

1. MDX authored in `content/`.
2. Frontmatter validated by Zod schema.
3. Build emits static pages; ISR permits per-route revalidation.
4. `clone-content.mts` (predev / prebuild) syncs from
   `sanjit-content/` if present.

## Edge & proxy

- `proxy.ts` is the edge entry point. It owns:
  - CSP and security headers (delegated to `next.config.mjs`)
  - Host/frame allow-listing (`*.sanjit.dev`)
  - Any future auth gate

## Boundaries (do not cross)

- No new top-level routes without updating the route audit and the
  homepage's mount-point map.
- No new client component without an ADR.
- No third-party scripts. Plausible is the lone exception (and is
  whitelisted in CSP).
- No databases, no auth providers, no SSR sessions.

---

**Inheritance**: `fallback` · **Override**: `allowed (module-level)` · **Last updated**: 2026-10-08
