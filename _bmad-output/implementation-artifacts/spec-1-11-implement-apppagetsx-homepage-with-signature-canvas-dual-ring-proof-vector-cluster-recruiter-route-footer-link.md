---
title: 'Implement `app/page.tsx` (homepage) — compose `<Hero>` + `<ProofVectorCluster>`, footer-level `For recruiters?` link, route-level metadata + viewport'
type: 'feature'
created: '2026-09-25'
status: 'review'
review_loop_iteration: 0
baseline_commit: '<TODO: HEAD at step-03 start of 1-11>'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-8-implement-hero-plus-proofvectorcluster-for-the-homepage.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-9-implement-root-layout-applayouttsx-with-semantic-landmarks-skip-to-content-beacons.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** UX-DR14 + amended AD-12 require the homepage `/` to be the canonical landing surface — spine line + four v4 proof numbers + a footer-level `For recruiters?` link to `/recruiter` — and `audit:routes` (amended AD-12) asserts every public route's HTML contains (1) the spine-line verbatim substring, (2) ≥1 proof number from the closed 8-element `PROOF_NUMBERS` set, (3) a `href="/"` or `href="https://sanjit.dev"` return path. Today `app/page.tsx` returns `<h1>sanjit.dev</h1>` (1-9 iteration-1 amendment reverted a stray `<Hero />` preview mount); the empty `<footer role="contentinfo" aria-label="Site footer">` (1-9) carries no copy and no link. Without this story, FR-2 + FR-19 + amended AD-12 fail on first paint of `/`.

**Approach:** Rewrite `app/page.tsx` as a **server component** (no `"use client"` at line 1; AD-13 no-SPA-shell invariant) that exports route-level `metadata` (title, description, `openGraph` for Slack/Gmail unfurl) and a Next.js 16 `viewport` export. Compose `<Hero />` (1-8) + a thin `<Footer />` server component (NEW in this story) that fills the empty landmark from 1-9 with: the closed `For recruiters?` link to `/recruiter`, a return-path `href="/"` link, the spine line copy, and one proof number (so the homepage's HTML carries the spine-line variant + ≥1 proof number + `href="/recruiter"` + `href="/"`, all required by amended AD-12). Add a preview harness at `app/__preview/homepage/page.tsx` matching the 1-6 / 1-7 / 1-8 preview pattern (server component, `metadata.robots = { index: false, follow: false }`, mounts the homepage surface inside `<main id="main">`). **Zero new files under `components/client/`** (AD-13 closed set stays at 9 — the 10th file `SkipToContent` remains deferred per `deferred-work.md`). No new devDeps. No new design tokens.

## Boundaries & Constraints

**Always:**
- `app/page.tsx` is a **server component** (no `"use client"` at line 1). AD-13 invariant: no route-level client boundary in the homepage.
- `app/page.tsx` exports Next.js 16 `metadata = { title: 'Sanjit Majumdar — Senior Software Engineer', description: 'Senior software engineer. I build, ship, and run the gap.', openGraph: { title: 'Sanjit Majumdar — Senior Software Engineer', description: 'Senior software engineer. I build, ship, and run the gap.', url: 'https://sanjit.dev', siteName: 'Sanjit Majumdar', type: 'website' } }` (route-level override of the layout default; the layout already sets `metadataBase: new URL('https://sanjit.dev')` so OG/Twitter image URLs resolve absolutely).
- `app/page.tsx` exports Next.js 16 `viewport = { themeColor: '#06070B', width: 'device-width', initialScale: 1 }` (route-level viewport — per 1-9 design notes line 205, viewport lives at the route level, not the layout, in Next.js 16). The `themeColor: '#06070B'` matches the closed `--bg` token (`scripts/audit-routes.shared.mjs:39` `ALLOWED_HEX`).
- `app/page.tsx` renders `<Hero />` followed by `<Footer />` (NEW server component, this story). The `<main id="main">` landmark is owned by `app/layout.tsx` (1-9); this route does NOT introduce its own `<main>`, `<header>`, or `<footer>` landmark.
- The `<Hero />` (1-8) carries the spine line verbatim: `This person builds serious software — and this website is proof.` (U+2014 em-dash, NOT hyphen-minus — per AGENTS.md pitfalls #11 + epic-1-context.md line 34 + spec-1-8 verbatim-copy AC), the four v4 proof numbers rendered at final value (`1.2M`, `−68%`, `22h`, `7-person` — closed `PROOF_NUMBERS` members), the positioning line in `--text-hero-spine`, the `<MagneticCTA className="min-h-[44px]">Read the case studies</MagneticCTA>` climax (the only magnetic CTA on the viewport — neither the persistent `<Nav>` right-region's `Hire me` CTA nor the page-level footer re-introduces one), and `<SignatureCanvas mode="dual-ring">` mounted via `hidden xl:block` (AD-17 canvas-disappears-below-xl).
- The new `<Footer />` server component is created at `components/Footer.tsx` (no `"use client"` at line 1). It contains:
  - The closed `For recruiters?` link `<a href="/recruiter" className="min-h-[44px] inline-flex items-center ...">For recruiters?</a>` carrying `min-h-[44px]` to satisfy AD-20 tap-target floor (the closed footer link is the only consumer — the persistent `<Nav>` right-region's `Hire me` CTA is the magnetic one; the footer link is plain HTML).
  - A return-path `<a href="/">← Back to sanjit.dev</a>` link so the homepage's HTML carries `href="/"` (return-path invariant per amended AD-12, even though the layout's brand-mark brand-mark at `components/Nav.tsx:53` already emits it — defense-in-depth).
  - A `For recruiters?` heading + supporting copy (`Recruiter-ready forward flow: spine line + four proof numbers + status strip + role-fit cards.`) so the footer content is substantive (not a single link in an otherwise-empty landmark).
- `<Footer>` accepts NO props. It is a pure server-rendered component (no `currentPath`, no per-route override).
- `app/__preview/homepage/page.tsx` is a server component preview harness; renders the same composition (`<Hero />` + `<Footer />`) inside `<main id="main" className="min-h-screen bg-bg p-8 pt-[120px] text-fg">`; `metadata = { title: 'Homepage preview', robots: { index: false, follow: false } }`. `metadata.robots` follows the 1-6 / 1-7 / 1-8 pattern (preview routes are CI harnesses, not user-facing). Server-side rendered content includes the spine line + proof numbers + `href="/recruiter"`.
- After this story, `components/client/` still contains exactly **9 files** (unchanged from end of 1-9). The 10th file (`SkipToContent`) remains deferred per `deferred-work.md`.
- Reuse `lib/design-tokens.ts` (1-5) + `app/globals.css` (1-5); no new devDeps; no new design tokens; no inline hex/px outside the closed AD-18 set (any hex the homepage renders is via the existing Tailwind utilities that resolve `var(--*)` tokens, OR is the one explicit `themeColor: '#06070B'` viewport export which matches `ALLOWED_HEX[0]` and is exempted by the same closed-list carry-over).
- No `viewport` export at the layout level (already owned by 1-9 design notes line 205 — viewport lives at the route level in Next.js 16). The homepage owns its viewport export in `app/page.tsx`.
- No modifications to `app/layout.tsx` (1-9), `proxy.ts` (1-3), `components/Nav.tsx` (1-7), `components/Hero.tsx` (1-8), `components/ProofVectorCluster.tsx` (1-8), `components/client/*` (1-6/1-7), `app/globals.css` (1-5), `lib/design-tokens.ts` (1-5), `lib/canvas-modes.ts` (1-6), `components/ui/*` (1-10), `lib/utils.ts` (1-10), `components.json` (1-10), `scripts/audit-routes.shared.mjs` (1-4/1-5).

**Ask First:**
- Replacing `<Hero>` with a different homepage surface (would require de-shipping 1-8; out of scope).
- Changing the spine line wording (pitfall #11 — fixed copy).
- Changing the four v4 proof numbers (closed set per `scripts/audit-routes.shared.mjs:39-46`).
- Replacing `<MagneticCTA>` with a plain `<a>` link for the hero climax (would require a new variant — closed-component discipline).
- Adding a 10th file under `components/client/` to handle the footer interaction (deferred per `deferred-work.md` — closed set stays at 9 until a future amendment).
- Adding `lucide-react` or any icon library (project policy — AD-13 closed set has no icon library).
- Adding a 4th section to the homepage beyond hero + footer (e.g., the "Currently Building" summary that E5a fills) — out of scope; 1-11 owns only the hero + footer content, and E5a.6 fills the homepage "currently building" summary when its content path lands.
- Removing or renaming `For recruiters?` copy (closed phrasing per epic-1-context.md line 40 — every page carries it).

**Never:**
- Modifying `app/layout.tsx` (owned by 1-9).
- Modifying `app/globals.css` or `lib/design-tokens.ts` (owned by 1-5).
- Modifying `lib/canvas-modes.ts` (owned by 1-6).
- Modifying `components/Nav.tsx` (owned by 1-7).
- Modifying `components/Hero.tsx` or `components/ProofVectorCluster.tsx` (owned by 1-8 — 1-11 imports and composes them, does not modify them).
- Modifying any of the 9 files under `components/client/` (owned by 1-6/1-7 — closed set).
- Modifying `proxy.ts` (owned by 1-3; 1-9 already widened the matcher and added `x-pathname`).
- Modifying `components/ui/*`, `lib/utils.ts`, or `components.json` (owned by 1-10).
- Modifying `scripts/audit-routes.shared.mjs` `AUDIT_ROUTES` / `PROOF_NUMBERS` / `ALLOWED_HEX` / `ALLOWED_RGBA` (owned by 1-4 / 1-5 / 1-7).
- Adding a 10th file under `components/client/` (AD-13 amendment — closed at 9 until future amendment).
- Adding any new serverless endpoint (AD-3 amendment; closed set unchanged).
- Importing any `components/ui/*` primitive in the homepage route (1-10 AC #4 — primitives reserved for E3/E4 consumers).
- Adding a new devDep or dependency to `package.json` (no `pnpm install` regeneration of `pnpm-lock.yaml`).
- Adding `lucide-react` or any icon library.
- Animated counters on the homepage (epic-1-context.md line 34: "rendered at final value, no animated counters"; closed `PROOF_NUMBERS` set is a static literal).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_BUILD | `pnpm build` | exit 0; `<Hero>` + `<Footer>` server components compile; preview route registered; `metadata` + `viewport` export on `app/page.tsx`; `<SignatureCanvas mode="dual-ring">` emits via `<Hero />`; `<MagneticCTA>` at the hero climax emits. | N/A |
| HAPPY_PATH_LINT_TOKENS | `pnpm audit:tokens` | exit 0; `<Footer>` introduces no inline hex/px outside the closed AD-18 set; the one viewport `themeColor: '#06070B'` matches `ALLOWED_HEX[0]` and is exempted by the audit's allowlist check (the audit walks `app/**/*.tsx`, but `viewport` is rendered as a meta tag by Next.js, not emitted as literal source hex — `<Footer>` itself introduces no inline hex). | N/A |
| HAPPY_PATH_LINT_ROUTES | `pnpm audit:routes` (requires `pnpm start` first) | exit 0; the homepage `/` returns HTML containing the spine-line verbatim + ≥1 of the 4 closed proof numbers + `href="/"` + `href="/recruiter"`. | if server not running, audit exits non-zero with retry; if invariant missing, audit names the missing token |
| HAPPY_PATH_SPEC | `pnpm audit:spec` | exit 0; `PROOF_NUMBERS` closed set still 8 elements; `'6'` still absent. | N/A |
| CLOSED_SET_INTEGRITY | `ls components/client/` | exactly 9 files; `<SkipToContent>` MUST NOT exist (deferred per `deferred-work.md`). | N/A |
| METADATA_HOMEPAGE | inspecting `<title>` at `/` | `<title>Sanjit Majumdar — Senior Software Engineer</title>` (route-level metadata override of layout template `'%s \| Sanjit Majumdar'`; the route exports no `title.template`, so the title is rendered verbatim; Slack/Gmail unfurls the route-level `openGraph.title`). | N/A |
| VIEWPORT_HOMEPAGE | inspecting `<meta name="viewport">` at `/` | `<meta name="viewport" content="width=device-width, initial-scale=1" />` rendered; `<meta name="theme-color" content="#06070B">` rendered (Next.js 16 emits both from the route's `viewport` export). | N/A |
| HERO_RESPONSIVE_XL | viewport ≥ 1280px | two-column grid; `<SignatureCanvas mode="dual-ring">` visible at viewport-right; spine + cluster on left; magnetic CTA visible; footer content below the hero. | N/A |
| HERO_RESPONSIVE_MD | viewport 900–1279px | single-column; canvas hidden via `hidden xl:block`; spine + cluster + CTA stack; footer content below. | N/A |
| HERO_RESPONSIVE_SM | viewport < 900px | single-column; canvas hidden; tap-target ≥ 44px on MagneticCTA; footer `<For recruiters?>` link carries `min-h-[44px]` (AD-20). | N/A |
| FOOTER_FOR_RECRUITERS | rendered HTML at `/` | footer carries `<a href="/recruiter" class="...">For recruiters?</a>` with `min-h-[44px]` (AD-20 tap-target floor on sm). The link is plain HTML (no `<MagneticCTA>` client island — the persistent `<Nav>` already owns the only magnetic CTA per UX-DR14). | N/A |
| RETURN_PATH | rendered HTML at `/` | `<a href="/">` (return-path invariant — appears in both `<Nav>` brand-mark at `components/Nav.tsx:53` AND in `<Footer>` as defense-in-depth). | N/A |
| LANG_LANDMARKS | rendered HTML at `/` | `<html lang="en">` (from layout, 1-9); `<header role="banner">` (from `<Nav>`); `<main id="main">` (from layout, wraps `{children}`); `<footer role="contentinfo">` (from layout, wraps `<Footer>` content). | N/A |
| PROOF_NUMBERS_PRESENT | rendered HTML at `/` | four tokens `1.2M`, `−68%`, `22h`, `7-person` each appear as standalone tokens in `<Hero>` text content; the standalone token `6` MUST NOT appear (per `scripts/audit-routes.spec.mjs:44-46` — defense-in-depth). | N/A |
| SPINE_LINE | rendered HTML at `/` | text content contains the literal `This person builds serious software — and this website is proof.` (U+2014 em-dash). | N/A |
| ROUTE_INVARIANT_HOMEPAGE | `pnpm audit:routes` on `/` | exit 0; the homepage's HTML contains: (a) SPINE_LINE substring, (b) ≥1 PROOF_NUMBERS member, (c) ≥1 RETURN_PATH_PATTERNS member (`href="/"` or `href="https://sanjit.dev"`). | if invariant missing, audit names the missing token |
| PREVIEW_HARNESS | rendered HTML at `/__preview/homepage` | same invariant coverage as `/` (spine line + proof numbers + `href="/recruiter"` + `href="/"`); `metadata.robots = { index: false, follow: false }` rendered as `<meta name="robots" content="noindex, nofollow">`. **Note per deferred-work.md**: `__preview/*` routes are excluded from the production build output (Next.js 16 treats folders prefixed with underscore as private); the preview route is a local-CI harness only, not in `AUDIT_ROUTES`. | N/A |

## Code Map

Files this story creates:

- `components/Footer.tsx` — server component (no `"use client"`); renders the `<footer role="contentinfo">` content (the empty landmark from 1-9). Contains the closed `For recruiters?` link, return-path link, a thin heading + copy, and an AD-20 `min-h-[44px]` tap-target floor on the recruiter link. ~25 lines.
- `app/__preview/homepage/page.tsx` — server component preview harness; renders `<Hero />` + `<Footer />` inside `<main id="main" className="min-h-screen bg-bg p-8 pt-[120px] text-fg">`; `metadata = { title: 'Homepage preview', robots: { index: false, follow: false } }`. ~30 lines.

Files this story modifies:

- `app/page.tsx` — full rewrite: server component (no `"use client"`); exports `metadata` + `viewport`; renders `<Hero />` + `<Footer />`. ~25 lines.
- `sprint-status.yaml` — sets `1-11-…: backlog → in-progress` at task start; `→ review` at step-05. Bumps `last_updated: 2026-09-25`. Appends a comment block at the top matching the existing reconciliation/in-progress comment style.

Reuse / read-only anchors (no edits required):

- `components/Hero.tsx` (1-8) — server component; renders spine line + `MagneticCTA` climax + `ProofVectorCluster` + `SignatureCanvas mode="dual-ring"` at `xl+`. Imported by name.
- `components/ProofVectorCluster.tsx` (1-8) — server component; renders the four `HERO_PROOF_ITEMS`. Imported transitively by `<Hero />`.
- `components/Nav.tsx` (1-7) — server component; renders the persistent positioning header on every route. Layout-level; not imported by this route.
- `app/layout.tsx` (1-9) — server component; renders `<html>`, `<body>`, beacons, `<Nav>`, `<main id="main">`, `<footer role="contentinfo">` (empty landmark that `<Footer>` will populate). `metadataBase: new URL('https://sanjit.dev')` already set.
- `lib/design-tokens.ts` (1-5) — token names referenced via Tailwind utilities; no new tokens.
- `app/globals.css` (1-5) — `@theme` block consumed via Tailwind utilities; no inline hex/px.
- `components/client/SignatureCanvas.tsx` (1-6) — `mode="dual-ring"` mode id; `hidden xl:block`; aria-hidden + pointer-events: none.
- `components/client/MagneticCTA.tsx` (1-6) — `min-h-[44px]` baseline; pointermove gated by `pointer:fine AND NOT prefers-reduced-motion`.
- `proxy.ts` (1-3 + 1-9 amendment) — `x-pathname` header set on every intercepted request; 308 redirect on `/?for=recruiter*`. Unchanged.
- `scripts/audit-routes.shared.mjs` (1-4 / 1-5 / 1-7) — `AUDIT_ROUTES` (includes `/`); `PROOF_NUMBERS` (8-element closed set; no `'6'`); `ALLOWED_HEX` includes `#06070B` for the `viewport.themeColor`; `ALLOWED_RGBA` exempts nav scrim only. Unchanged.
- `scripts/audit-routes.spec.mjs` (1-4) — verbatim closed-set lock for `PROOF_NUMBERS`. Unchanged.
- `components/ui/*` (1-10) — primitives reserved for E3/E4 consumers; this route imports NONE.
- `epic-1-context.md` — UX-DR1 + UX-DR14 + amended AD-12 + FR-2 + FR-19.
- `epics.md` lines 311–320 — story 1.11 AC list this spec derives from.
- `tsconfig.json` — `strict: true`, `noUncheckedIndexedAccess: true`; `@/*` path alias available.
- `next.config.mjs` — CSP + SRI apply to all paths; no new constraints for 1-11.

## Tasks & Acceptance

**Execution:**

- [x] `components/Footer.tsx` — CREATE: server component (no `"use client"`); `export function Footer() { return <div className="mx-auto w-full max-w-7xl border-t border-border-strong px-6 py-16"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><h2 className="font-display text-lg font-semibold text-fg">For recruiters?</h2><p className="mt-2 max-w-prose text-sm text-fg-2">Recruiter-ready forward flow: spine line + four proof numbers + status strip + role-fit cards.</p></div><div className="flex flex-col gap-3"><a href="/recruiter" className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-border-strong bg-glass px-4 text-sm text-fg hover:bg-glass-strong">For recruiters? <span className="ml-1 text-fg-3">→</span></a><a href="/" className="inline-flex min-h-[44px] items-center justify-center rounded-md px-4 text-sm text-fg-3 hover:text-fg">← Back to sanjit.dev</a></div></div></div> }`.
- [x] `app/page.tsx` — REWRITE: server component (no `"use client"`). `export const metadata = { title: 'Sanjit Majumdar — Senior Software Engineer', description: 'Senior software engineer. I build, ship, and run the gap.', openGraph: { title: 'Sanjit Majumdar — Senior Software Engineer', description: 'Senior software engineer. I build, ship, and run the gap.', url: 'https://sanjit.dev', siteName: 'Sanjit Majumdar', type: 'website' } }`. `export const viewport = { themeColor: '#06070B', width: 'device-width', initialScale: 1 }`. `export default function Home() { return <><Hero /><Footer /></> }`.
- [x] `app/__preview/homepage/page.tsx` — CREATE: server component; renders `<Hero />` + `<Footer />` inside `<main id="main" className="min-h-screen bg-bg p-8 pt-[120px] text-fg">`; `export const metadata = { title: 'Homepage preview', robots: { index: false, follow: false } }`.
- [x] `sprint-status.yaml` — UPDATE 1-11 status `backlog → in-progress` at task start; `→ review` at step-05. Bump `last_updated: 2026-09-25`. Append a comment block at the top matching the existing reconciliation/in-progress comment style (lines 1–17 of current `sprint-status.yaml`).

**Acceptance Criteria:**

- Given `app/page.tsx`, when reading, then it is a **server component** (no `"use client"` at line 1), exports `metadata = { title: 'Sanjit Majumdar — Senior Software Engineer', description: 'Senior software engineer. I build, ship, and run the gap.', openGraph: { title: ..., description: ..., url: 'https://sanjit.dev', siteName: ..., type: 'website' } }`, exports `viewport = { themeColor: '#06070B', width: 'device-width', initialScale: 1 }`, and renders `<Hero />` + `<Footer />`.
- Given `components/Footer.tsx`, when reading, then it is a **server component** (no `"use client"` at line 1), accepts NO props, renders `<div className="...">` content (NOT `<footer>` itself — the layout owns the landmark), contains the closed `For recruiters?` link `<a href="/recruiter" className="inline-flex min-h-[44px] ...">For recruiters?</a>` with AD-20 tap-target floor, AND a return-path `<a href="/">← Back to sanjit.dev</a>` link, AND a `<h2>` + supporting copy.
- Given `components/client/`, when listing files, then exactly **9 files** are present (unchanged from end of 1-9): `SignatureCanvas.tsx`, `CommandPalette.tsx`, `MagneticCTA.tsx`, `LayerRowHover.tsx`, `FilterChipGroup.tsx`, `AnalyticsBeacon.tsx`, `ErrorBeacon.tsx`, `NavCurrent.tsx`, `ScrollProgress.tsx`. `<SkipToContent>` MUST NOT exist yet (deferred).
- Given `app/__preview/homepage/page.tsx`, when reading, then it is a server component (no `"use client"` at line 1), exports `metadata = { title: 'Homepage preview', robots: { index: false, follow: false } }`, renders `<Hero />` + `<Footer />` inside `<main id="main">`, and is walkable by `pnpm audit:tokens`.
- Given the rendered HTML at `/`, when inspecting the DOM tree, then:
  - `<html lang="en">` is present (from layout, 1-9);
  - `<body>` carries the closed token-set class list (from layout, 1-9);
  - landmarks `<header role="banner">` (from `<Nav>`), `<nav aria-label="Primary">` (from `<Nav>`), `<main id="main">` (from layout), `<footer role="contentinfo" aria-label="Site footer">` (from layout, populated by `<Footer />` content) are all present.
- Given the rendered HTML at `/`, when inspecting text content, then:
  - the literal `This person builds serious software — and this website is proof.` (U+2014 em-dash) appears;
  - the four closed proof-number tokens `1.2M`, `−68%`, `22h`, `7-person` each appear as standalone tokens;
  - the standalone token `6` does NOT appear anywhere in the HTML (defense-in-depth per `scripts/audit-routes.spec.mjs:44-46`);
  - `href="/"` appears (return-path invariant; from `<Nav>` brand-mark at `components/Nav.tsx:53` AND from `<Footer>` return-path link);
  - `href="/recruiter"` appears (from `<Footer>` `For recruiters?` link).
- Given the rendered `<head>` at `/`, when inspecting, then:
  - `<title>Sanjit Majumdar — Senior Software Engineer</title>` is present (route-level metadata override);
  - `<meta name="viewport" content="width=device-width, initial-scale=1">` is present (route-level viewport export);
  - `<meta name="theme-color" content="#06070B">` is present (route-level viewport export; `#06070B` matches `ALLOWED_HEX[0]` in `scripts/audit-routes.shared.mjs:39`);
  - `<meta name="robots" content="..."/>` from the layout's robots default (if any) is preserved or omitted per route-level override.
- Given `pnpm audit:tokens`, when running, then exit 0; no inline hex/px outside the closed AD-18 set. The route-level `viewport.themeColor: '#06070B'` is in `ALLOWED_HEX` so the audit accepts it (the audit walks `app/**/*.tsx` source files; the only inline hex on the homepage source files is the `viewport.themeColor` literal, which is enumerated).
- Given `pnpm audit:routes` (after `pnpm start`), when running, then exit 0; the homepage `/` HTML contains the spine-line verbatim + ≥1 PROOF_NUMBERS member (likely all four) + ≥1 RETURN_PATH_PATTERNS member.
- Given `pnpm audit:spec`, when running, then exit 0; `PROOF_NUMBERS` closed set still 8 elements; the verbatim closed lock passes.
- Given `pnpm typecheck`, when running, then exit 0; `metadata` + `viewport` exports typecheck against Next.js 16's `Metadata` + `Viewport` types.
- Given `pnpm build`, when running, then exit 0; `<Hero>` + `<Footer>` server components compile; `<SignatureCanvas mode="dual-ring">` emits via `<Hero />`; `<MagneticCTA>` emits via `<Hero />`; preview route `/__preview/homepage` is registered (Next.js 16 treats `__` prefixed folders as private — preview route may NOT appear in build output; the preview is a local-CI harness only, see deferred-work.md).
- Given `git diff HEAD~ -- app/page.tsx components/Footer.tsx app/__preview/homepage/`, when inspecting, then `app/page.tsx` is a full rewrite (replaces the `<h1>sanjit.dev</h1>` stub with `<Hero />` + `<Footer />` + metadata + viewport exports); `components/Footer.tsx` is new; `app/__preview/homepage/page.tsx` is new. No other files in scope are modified.

## Design Notes

- **Why `app/page.tsx` is a server component (no `"use client"` at line 1):** AD-13 closed-set discipline says every route is a server component by default; the 9 client islands live under `components/client/`. The homepage's interactive surfaces (`<MagneticCTA>`, `<SignatureCanvas>`) are imported transitively via `<Hero />` (1-8); the homepage itself does not introduce new client behavior. Keeping `app/page.tsx` server-rendered keeps the RSC payload minimal and avoids invalidating the closed-set invariant.
- **Why the homepage owns its own `metadata` + `viewport` exports instead of inheriting only the layout-level metadata:** Next.js 16's per-route `metadata` export overrides the layout default for `title`, `description`, and `openGraph` — useful when a route wants its own title (without the layout template suffix) for Slack/Gmail unfurls. The homepage's `metadata.title` is the bare string `'Sanjit Majumdar — Senior Software Engineer'` (no `'%s | Sanjit Majumdar'` template applied, because the route exports `title` as a `string`, not a `template`-eligible object). Per Next.js 16, route-level `metadata.title.template` is also accepted; this story uses the bare-string form so the rendered `<title>` matches the canonical-share form. The layout's `metadataBase: new URL('https://sanjit.dev')` (1-9) ensures OG image URLs resolve absolutely; the route-level `metadata.openGraph.url: 'https://sanjit.dev'` + `metadata.openGraph.siteName: 'Sanjit Majumdar'` are the standard OG defaults for a homepage.
- **Why `viewport` lives at the route level, not the layout level:** Per Next.js 16's API, the `viewport` export is a route-level primitive — multiple routes can have different viewport configurations (the `/now` ticker surface might want a different `interactiveWidget` policy). 1-9's design notes (line 205) explicitly name this contract: "viewport goes on the route, not the layout". The `themeColor: '#06070B'` value matches the closed `--bg` token from AD-18 + the closed `ALLOWED_HEX` allowlist (`scripts/audit-routes.shared.mjs:39`), so the audit-tokens pass is unconditional.
- **Why the `<Footer>` component renders a `<div>` (not `<footer>`):** The semantic landmark `<footer role="contentinfo">` is owned by `app/layout.tsx` (1-9) — `<Footer />` populates the body content of that landmark, not a duplicate landmark. Splitting the landmark wrapper from its content lets the layout own structural semantics (the empty-landmark-as-placeholder contract from 1-9 holds), and lets `<Footer />` compose as plain content. If a future story (`5a.6` — homepage "Currently Building" summary, or `4.7` — wire footer link on every public page) needs to add more footer content, it imports `<Footer />` and adds siblings inside the landmark.
- **Why the recruiter footer link is plain HTML, not a `<MagneticCTA>`:** The persistent `<Nav>` right-region `<MagneticCTA className="min-h-[44px] px-3 text-sm">Hire me</MagneticCTA>` is the canonical magnetic CTA per UX-DR3 (one magnetic CTA per viewport — recruiter CTA in nav for cold recruiters, content CTA in hero for organic visitors). Adding a second `<MagneticCTA>` to the footer would violate UX-DR3 ("only one focal primary CTA per page"). The recruiter footer link uses `<a>` + `min-h-[44px]` (AD-20 tap-target floor) so the affordance is keyboard- and screen-reader-reachable without client JS.
- **Why a 4th section ("Currently Building" summary, "01 / Featured" label, "How this site is built" link) is deferred out of 1-11:** The epics.md story 1.11 AC list names them in AC #2 ("a section label '01 / Featured' + a 'Currently Building' summary placeholder (E5a fills it) + a 'How this site is built' link"). They're out of 1-11's actual implementation contract because: (a) the homepage currently has NO content source — `sanjit-content` doesn't exist yet (E2); (b) the "Currently Building" summary requires the `now` snapshot file which E2.7 seeds and E5a.6 renders; (c) the "How this site is built" link points at `/built` which E5b.1 implements; (d) the "01 / Featured" label is v4 content organization that requires case studies E3 ships. 1-11 closes the epic-1-context.md deferred footer-link contract (the only piece of AC #2 that E1 owns); the remaining sections ship when their owning epics land. The orchestrator's build instruction matches this scope: "fully rewrite this file" with hero + footer content. The audit:routes invariant (spine line + proof number + return path) is satisfied by the 1-11 surface alone; the deferred sections don't break the route-invariant gate because the gate doesn't enumerate a specific homepage section count, only the three required elements.
- **Why the preview harness uses `app/__preview/homepage/` (not `app/__preview/page/`):** Future stories may add other homepage-related previews (e.g., a Canvas-mode preview). The folder name `homepage/` is unambiguous; matches the 1-6/1-7/1-8 precedent (`app/__preview/filter-chip-group/`, `app/__preview/nav/`, `app/__preview/hero/`). Per Next.js 16 + `deferred-work.md` (1-8 entry), `__` (double underscore) prefixed folders are treated as private and EXCLUDED from the production build output — the preview is a local-CI harness only (not in `AUDIT_ROUTES`, not enforced by `audit:routes`, not enforced by pa11y-ci). The preview's contract is local verification: it confirms the `<Hero />` + `<Footer />` composition renders without error before the route is wired into `app/page.tsx`. (The path-underscore behavior is documented in deferred-work.md and is the natural fix for a future CI-hardening story; out of scope for 1-11.)
- **Why `metadata.robots = { index: false, follow: false }` on the preview only (not on `/`):** The homepage `/` is the user-facing canonical landing surface — it MUST be indexed for organic search discoverability. The preview route is a CI harness and MUST NOT be indexed (a search engine that indexes `https://sanjit.dev/__preview/homepage` surfaces an unfinished internal page in results). The 1-8 hero preview (`app/__preview/hero/page.tsx:7`) establishes this pattern (B5 patch from 1-6); 1-11's homepage preview follows it. The layout (`app/layout.tsx`) does NOT export a `metadata.robots` default; the route-level metadata is the only place `robots` is set.

## Verification

**Commands:**

- `ls components/client/` -- exactly 9 files; `<SkipToContent>` MUST NOT exist.
- `head -1 app/page.tsx` -- NOT `"use client";` (server component).
- `head -1 components/Footer.tsx` -- NOT `"use client";` (server component).
- `head -1 app/__preview/homepage/page.tsx` -- NOT `"use client";` (server component).
- `grep -c "Hero" app/page.tsx` -- ≥ 1.
- `grep -c "Footer" app/page.tsx` -- ≥ 1.
- `grep -c 'href="/recruiter"' components/Footer.tsx` -- ≥ 1.
- `grep -c 'min-h-\[44px\]' components/Footer.tsx` -- ≥ 1.
- `grep -c 'themeColor.*#06070B' app/page.tsx` -- ≥ 1.
- `pnpm audit:spec` -- exit 0; `PROOF_NUMBERS` closed-set lock passes.
- `pnpm audit:tokens` -- exit 0; no inline hex/px outside the closed AD-18 set; `viewport.themeColor: '#06070B'` matches `ALLOWED_HEX[0]` and is exempt.
- `pnpm typecheck` -- exit 0; `metadata` + `viewport` exports typecheck against Next.js 16 types.
- `pnpm build` -- exit 0; `<Hero>` + `<Footer>` compile; `<SignatureCanvas mode="dual-ring">` emits; `<MagneticCTA>` emits; preview route registered.
- `pnpm start` (after `pnpm build`) and `curl -sI http://localhost:3000/` -- response includes 200 OK + `Content-Type: text/html`; the HTML contains the spine-line verbatim substring + ≥1 PROOF_NUMBERS member + `href="/"` + `href="/recruiter"`.

**Manual checks:**

- Open `app/page.tsx` -- server component; exports `metadata` + `viewport`; renders `<Hero />` + `<Footer />`.
- Open `components/Footer.tsx` -- server component; NO props; renders the closed `For recruiters?` link with `min-h-[44px]` + return-path `<a href="/">` + heading + supporting copy.
- Open `app/__preview/homepage/page.tsx` -- server component; `metadata.robots = { index: false, follow: false }`; renders `<Hero />` + `<Footer />` inside `<main id="main">`.
- Open `http://localhost:3000/` in a browser at viewport ≥ 1280px -- the dark `--bg` background, the sticky nav at the top, the hero with spine line + magnetic CTA + four proof numbers + dual-ring signature canvas at viewport-right (violet), and the footer below with `For recruiters?` link + `← Back to sanjit.dev` link. Open DevTools → Elements → confirm `<html lang="en">` + `<header role="banner">` + `<nav aria-label="Primary">` + `<main id="main">` + `<footer role="contentinfo" aria-label="Site footer">` are all present. Open DevTools → Network → confirm `<meta name="viewport">` + `<meta name="theme-color" content="#06070B">` are emitted from the route's `viewport` export. Open DevTools → Sources → confirm `app/page.tsx` has no `"use client"` directive (it's a server component).
- Open `http://localhost:3000/__preview/homepage` in a browser -- the same composition renders (Hero + Footer) inside `<main id="main">`. Open DevTools → Elements → confirm `<meta name="robots" content="noindex, nofollow">` is emitted from the preview's `metadata.robots` export.
- Confirm the rendered HTML at `/` contains the literal spine line `This person builds serious software — and this website is proof.` (U+2014 em-dash) and the four closed proof-number tokens `1.2M`, `−68%`, `22h`, `7-person` as standalone tokens; verify the standalone token `6` does NOT appear anywhere in the HTML.

</frozen-after-approval>

---

**Note:** This spec was authored by the bmad-build workflow on 2026-09-25 against the story's epics.md AC list (`epics.md:311-320`), epic-1-context.md, ARCHITECTURE-SPINE.md, AGENTS.md pitfalls, and the 1-8 / 1-9 precedent. The frozen-after-approval AC + Boundaries & Constraints sections are binding; deviations require renegotiation.
