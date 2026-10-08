# Coding Standards

> Conventions for TypeScript, React, Next.js App Router, MDX, and the
> project utilities. Inherited from root; module-level overrides are
> allowed but rare.

## TypeScript

- **`strict: true`** is non-negotiable. Do not loosen it.
- **`noUncheckedIndexedAccess: true`** is on. Treat every index access
  as possibly `undefined`.
- Prefer **explicit return types** on exported functions.
- Prefer `import type { … }` for type-only imports.
- Avoid `any`. If you must use it, add an inline `// eslint-disable-next-line`
  with a one-line reason.
- Branded types for IDs and slugs where helpful (e.g. `type Slug = string & { __brand: 'Slug' }`).
- File names: `kebab-case` for non-component files; `PascalCase` for
  React components.

## React & Next.js (App Router)

- **Server Components by default.** Only add `"use client"` when
  interaction, state, browser APIs, or Radix UI requires it.
- Keep the client component allowlist closed. If you add a new client
  component, justify it in the PR.
- Co-locate component-specific types and helpers in the same file when
  small; promote to `lib/` when reused.
- Use `next/image` for raster assets, `next/font` for fonts.
- Routes: prefer `app/<segment>/page.tsx` server rendering; add
  `loading.tsx` and `error.tsx` where it improves UX.
- `metadata` is exported from `page.tsx` or `layout.tsx` — no
  third-party SEO libraries.

## Styling

- Tailwind v4 utilities only. No new global CSS files.
- Use `cn()` from `lib/utils.ts` for class composition.
- Component variants use `class-variance-authority`.
- Pull colors, spacing, and radii from CSS variables defined in
  `app/globals.css`, **not** hard-coded hex codes.
- Icons: `lucide-react`. No other icon libraries.

## MDX & content

- Frontmatter is validated by a Zod schema before render. New fields
  require a schema update.
- Slugs are stable. Renaming a slug is a breaking change — coordinate
  with redirects.
- Code blocks in MDX are syntax-checked at typecheck time where
  feasible.

## State, data, side effects

- Prefer **RSC + server actions** over client state. Reserve client
  state for UI-only concerns (open/closed, hover, focus).
- Use Zod to validate every external input (form data, route params,
  search params, env).
- Never read `process.env` outside `lib/env.ts` (or equivalent). All
  env access is centralized and typed.

## File layout

```
app/                Next.js App Router
  api/              Route handlers (server)
  <segment>/        Route segments (page, layout, loading, error)
  globals.css       Tailwind v4 entry
  layout.tsx        Root layout
  page.tsx          Root page
components/         React components
  ui/               shadcn/ui primitives
  client/           Client-only islands
content/            MDX sources
lib/                Shared modules (utils, tokens, env, content)
scripts/            Build / audit / clone scripts (tsx or node)
proxy.ts            Edge middleware
```

## Comments & JSDoc

- Every exported function, type, and constant has a JSDoc block.
- JSDoc uses the **backtick-summary** convention (first line is a
  brief; the `scripts/check-jsdoc.mjs` audit enforces it).
- Comment only the **why**, not the **what**. The code shows the what.

## Imports

- Path alias: `@/*` maps to repo root (per `tsconfig.json`).
- Order: external → internal `@/` → relative. ESLint handles
  formatting; do not re-sort manually.

---

**Inheritance**: `fallback` · **Override**: `allowed (module-level)` · **Last updated**: 2026-10-08
