# Tech Stack

> Inferred from the existing `package.json`, `tsconfig.json`, `next.config.mjs`,
> and `components.json`. Update this file when the stack changes.

## Runtime

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Language | TypeScript | 5.x | `strict: true`, `noUncheckedIndexedAccess: true` |
| Framework | Next.js (App Router) | 16.3 | SSG/ISR; React Server Components by default |
| UI Library | React | 19.2 | Server Components, RSC payload |
| Content | MDX | `@next/mdx` 16.3 | Authored in `content/` |
| Validation | Zod | 4.6 | Frontmatter parsing and runtime guards |
| Package manager | pnpm | 9.12.0 | Locked via `package.json#packageManager` |
| Node | Node.js | ≥ 20.9.0 | Enforced via `engines.node` |

## Styling

| Layer | Choice | Notes |
|---|---|---|
| Utility CSS | Tailwind CSS v4 | `@tailwindcss/postcss` |
| Token merging | `tailwind-merge` + `clsx` | `cn()` helper at `lib/utils.ts` |
| Variants | `class-variance-authority` | Used for component variants |
| Design tokens | `lib/design-tokens.ts` | Single source of truth for tokens |
| Theme system | CSS variables in `app/globals.css` | Driven by shadcn `new-york` style |
| Iconography | `lucide` | Per `components.json` |

## UI primitives

| Library | Use |
|---|---|
| `@radix-ui/react-dialog` | Modals, dialogs |
| `@radix-ui/react-toggle` | Toggle buttons |
| `@radix-ui/react-tooltip` | Tooltips |
| shadcn/ui (`new-york`) | Component base, installed under `components/ui/` |

## Tooling

| Tool | Purpose | Command |
|---|---|---|
| ESLint 9 | Linting (`core-web-vitals` + `typescript`) | `pnpm lint` |
| `tsc --noEmit` | Type checking | `pnpm typecheck` |
| `pa11y-ci` | Accessibility CI | `pnpm test:a11y` |
| `@lhci/cli` | Lighthouse budgets | `pnpm lighthouse` |
| `tsx` | Run TypeScript scripts | used by audit + clone-content |
| Custom audits | Routes, content, tokens, budget, mount-points | `pnpm audit:*` |

## Security & delivery

| Layer | Choice | Notes |
|---|---|---|
| Hosting | Vercel | `vercel.json` present |
| Edge headers | CSP, SRI (SHA-256) | `next.config.mjs` exports CSP |
| Revalidation | `app/api/revalidate/route.ts` | On-demand ISR |
| Middleware | `proxy.ts` | Auth / proxy logic at the edge |

## Out of scope (do **not** add without an ADR)

- Databases, ORMs, auth providers
- Heavy client state libraries (Redux, MobX, Zustand unless approved)
- CSS-in-JS (styled-components, emotion) — Tailwind v4 is canonical
- New testing frameworks (Vitest, Jest) — use `pa11y-ci` + audit scripts
  unless an ADR explicitly adds unit tests

---

**Inheritance**: `fallback` · **Override**: `allowed (module-level)` · **Last updated**: 2026-10-08
