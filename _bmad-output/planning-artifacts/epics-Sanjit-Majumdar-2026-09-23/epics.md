---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-Sanjit-Majumdar-2026-09-23/prd.md
  - _bmad-output/planning-artifacts/prds/prd-Sanjit-Majumdar-2026-09-23/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/EXPERIENCE.md
---

# Sanjit-Majumdar - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sanjit-Majumdar, decomposing the requirements from the PRD, UX Design (DESIGN.md + EXPERIENCE.md pair), and Architecture (v5 spine, 20 ADs) into implementable stories. The architecture spine is binding — every story's acceptance criteria must respect the closed lists, invariants, and dependency direction declared there.

## Requirements Inventory

### Functional Requirements

- **FR-1**: Persistent positioning header appears on every public route carrying brand mark, spine-line positioning variant, and minimal nav (Work / Lab / Projects / Now).
- **FR-2**: Homepage hero displays the spine line verbatim, the four proof numbers (7+ yrs / 10K+ users / 35% faster / 7-person team, or v4 set 1.2M / −68% / 22h / 6), and a positioning line; recruiter-mode replaces the positioning line with a condensed forward-ready view.
- **FR-3**: Recruiter-mode toggle on every page (`?for=recruiter` URL param / no localStorage flag in v4 — recruiter-mode is a route per AD-8) is deep-linkable and renders correctly on first paint.
- **FR-4**: Forward-to-hiring-manager affordance appears in recruiter-mode on every page; produces a shareable URL output AND a downloadable PDF output.
- **FR-5**: Shareable recruiter-mode URL renders the spine line + four proof vectors + one recommended case study cold, with OG metadata set for Slack/Gmail/Twitter unfurl.
- **FR-6**: PDF forward artifact is a single-page PDF containing spine line + four proof vectors + one recommended case study + footer; under 500 KB; under 5s to download.
- **FR-7**: Five named patterns (Canonical Model, Syncfusion Data-Grid, nopCommerce Plugin, Ship-Faster Pushback, Friday Architecture Review) published at `/patterns/<slug>` with stable URLs, each rendering setup + 2–5 moves + counter-lines + annotation. Ship-Faster Pushback `move-4` carries the verbatim quote.
- **FR-8**: Each pattern's moves are deep-linkable individually (`#move-1` through `#move-5`) via native HTML heading IDs per AD-4.
- **FR-9**: `/patterns` index page lists the five patterns as cards with `one_line`, linked to individual pattern URLs.
- **FR-10**: Every public route renders with spine-line variant + ≥1 proof number + return-path `href="/"`. Enforced in CI via static analysis.
- **FR-11**: Each public route, when shared as a cold link, renders legible content with route-specific OG metadata (title, description, image).
- **FR-12**: Content source lives in separate `sanjit-content` repo; the deployed site reads via on-demand ISR via webhook from `repository_dispatch` event; changes reflected within 5s of webhook delivery.
- **FR-13**: All content parsed via Zod 4 with `.partial()` + `.passthrough()`; every frontmatter field except `title` is optional; unknown keys preserved via `entry.meta`.
- **FR-14**: `revalidate: 300` (5-minute TTL) on every ISR route as fallback for webhook delivery failure.
- **FR-15**: `/now` page lists currently-building entries; reachable from main nav and homepage currently-building section.
- **FR-16**: Homepage renders a small currently-building section with the latest 3–5 entries from the feed.
- **FR-17**: If live source returns no data or most-recent entry's `updated` > 7 days old, feed renders last-good snapshot (`now-snapshot.json`) tagged honestly with `(last updated N days ago)`; never renders an empty state, never errors.
- **FR-18**: `/now/feed.xml` exposes the currently-building feed as RSS / Atom with `Content-Type: application/atom+xml`.
- **FR-19**: Homepage LCP < 1.8s on Slow 4G mobile (Lighthouse CI assertion, mobile profile).
- **FR-20**: Homepage total transfer < 100 KB gzipped; any other route < 200 KB gzipped (CI gzip-budget check).
- **FR-21**: Lighthouse Performance ≥ 95 on mobile profile, Slow 4G throttling (CI assertion).
- **FR-22**: No third-party JS on first paint; deferred scripts via `next/script strategy="lazyOnload"` only.

### NonFunctional Requirements

- **NFR-P Performance**: LCP < 1.8s on Slow 4G throttled mobile (LCP element is the hero headline text); TTI < 2.5s; CLS < 0.05 site-wide; total JS ≤ 50 KB gzipped on first load (homepage), ≤ 80 KB on case-study pages, ≤ 60 KB on Lab pages; images via AVIF first with WebP fallback + explicit width/height to kill CLS; one variable subset webfont with `font-display: swap` and system-ui fallback; no icon fonts (SVG only); no third-party JS on first paint.
- **NFR-A Accessibility**: WCAG 2.1 AA across the responsive web surface; all interactive components keyboard-navigable; meaningful alt text or empty alt for decorative images; color contrast meets AA; focus indicators visible; recruiter-mode and forward-modal screen-reader tested; no motion-based essential information (animations are decorative; `prefers-reduced-motion` honored site-wide).
- **NFR-S Security Posture**: No secrets in content (content repo is public); contact form posts to serverless function that emails via Resend with API key in Vercel env vars; strict CSP set in `next.config.js` headers; analytics whitelisted, all other third-party JS blocked; Cloudflare Turnstile token + honeypot for bot protection on contact form.
- **NFR-O Observability**: Plausible analytics, deferred via `next/script strategy="lazyOnload"`; custom events: `forward_button_click`, `recruiter_mode_toggle`, `pattern_deep_link_visit`, `case_study_forward_open`; Sentry loaded deferred for client-side errors only (no PII); Vercel Speed Insights or equivalent for performance regression between PRs; structured JSON logging `{ request_id, route, duration_ms, status }` on every serverless function.
- **NFR-C Content Durability**: CV lives as `cv.md` in content repo (deployed site reads from it — never out of sync); additive content schema (new fields never break old entries); last-good snapshot fallback for currently-building feed (never errors on stale data); public commit history on content repo (recruiters see evolution over time).

### Additional Requirements

These are binding technical requirements extracted from the architecture spine (20 ADs). Each must be reflected in story acceptance criteria.

- **AD-1 (content read path)**: Static content lives in `sanjit-content` git repo; Next.js build shallow-clones it; routes read from that clone; GitHub Action in `sanjit-content` listens to `push`, `delete`, AND force-push events and calls `POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]`; handler constructs `<type>:<slug>` (typed) or bare `now`/`cv` tags; calls `revalidateTag(tag, 'max')` (Next 16 signature); no route reads content via GitHub HTTP API at runtime.
- **AD-2 (closed KV namespaces)**: Upstash Redis via Vercel Marketplace; exactly two namespaces: `now` (currently-building entries, phone-editable) and `contact` (contact-form queue); adding any namespace requires spine amendment; currently-building entry shape is canonical `{ id, title, body_md, updated }`; snapshot shape `{ entries, last_updated }` where `last_updated = max(entries[].updated)`; CV lives only in `cv.md` (no KV mirror).
- **AD-3 (closed serverless endpoints)**: Three endpoints only — `GET /api/now` (edge), `POST /api/forward-pdf` (Node.js, `maxDuration = 60`, ≥ 1769 MB memory), `POST /api/revalidate` (edge); adding any endpoint requires spine amendment; static routes served from Vercel default region via global CDN; seeding KV from content snapshot happens at build time, never via runtime endpoint.
- **AD-4 (pattern citation walker)**: Pattern citations in case-study frontmatter (`patterns: ["canonical-model"]`) resolve at build time by string-match against `patterns/` directory's published slugs; override surfaced move via `pattern_moves: { "canonical-model": 3 }`; walker walks only `status === 'published'`; build fails if cited slug is unpublished; case-study pages render citations as "Patterns cited" section at bottom; pattern page uses native HTML heading IDs `<h2 id="move-{N}">` (1-indexed) + `<h2 id="when-not">` for counter-line.
- **AD-5 (build-fail on malformed frontmatter)**: Every `status === 'published'` entry must pass `Zod.safeParse()` against its content-type Zod 4 schema; build exits non-zero on failure with per-file diagnostic (file path + failing field via `ZodError.issues`); draft entries may have malformed frontmatter and render in preview only; schema uses `.partial({ title: true })` + `.passthrough()` (exposes unknown keys on `entry.meta`).
- **AD-6 (live architecture diagram)**: `/built` page renders MDX-embedded React component reading `architecture-diagrams.md` from spec-companions folder at build time; renders as styled SVG with hover details + click affordances; companion file is source of truth; same diagram rendered at two scales (big hero right column + small 240×240 signature canvas) and both must enumerate the same 7 layers in the same order.
- **AD-7 (Puppeteer PDF, Node.js runtime)**: PDF generated at `POST /api/forward-pdf?case=<slug>` via Puppeteer + `@sparticuz/chromium`; ≥ 1769 MB memory; navigates to `https://sanjit.dev/recruiter?forward=1&case=<slug>`; returns single-page A4 PDF with spine line + four proof vectors + one recommended case study + canonical site URL footer; 4s cold-start budget; on failure, secondary link falls back to client-side `window.print()` on `/recruiter` route using print-only stylesheet.
- **AD-8 (recruiter-mode is a route, not state)**: `<RecruiterModeProvider>`, `<RecruiterModeToggle>`, and `localStorage.for_recruiter` are removed; `?for=recruiter` maps to dedicated SSG route `app/recruiter/page.tsx`; rest of site does NOT switch modes; visitor routed via footer-level "For recruiters?" link; URL `?for=recruiter&forward=1&case=<slug>` remains canonical share form; `generateStaticParams` per slug; `generateMetadata` reads `searchParams` for og:image; recruiter-route signature canvas uses `--colors.live` (green).
- **AD-9 (no build on content edits)**: Main Next.js build pipeline runs only on code-repo changes; content edits trigger only `revalidateTag()` via webhook; separate GitHub Actions workflows on the two repos; weekly CI audit fails if any Vercel deployment in past 7 days was triggered by a content-repo commit; 5-minute TTL fallback covers webhook delivery failure.
- **AD-10 (stale-state fallback contract)**: `GET /api/now` reads from Upstash Redis; if KV returns no entries OR most-recent `updated` > 7 days old, returns `{ entries: <from now-snapshot.json>, fallback: true, last_updated }`; never returns `{ entries: [] }` without `fallback: true`; consumers render `(last updated N days ago)` tag when fallback; phone-edits write to KV only; GitHub Action in `sanjit-content` runs every 15 min, reads KV, commits `now-snapshot.json`; snapshot is KV-derived, never hand-edited; no serverless function pushes to content repo.
- **AD-11 (strict CSP via SRI)**: `next.config.js` sets CSP header with `default-src 'self'`, `script-src 'self' 'nonce-<runtime>' https://plausible.io`, `style-src 'self'` (SRI via `experimental.sri: { algorithm: 'sha256' }`), `img-src 'self' data:`, `connect-src 'self' https://plausible.io https://api.resend.com`, `frame-src 'self' https://*.sanjit.dev`; all third-party scripts via `next/script strategy="lazyOnload"` only; nonce path explicitly rejected (incompatible with static-first paradigm + AD-13).
- **AD-12 (route-level invariants in CI)**: Three CI assertions per PR against built output: (1) spine-line variant string in every URL under `/`, `/work/*`, `/projects/*`, `/lab/*`, `/patterns/*`, `/now`, `/about`, `/recruiter`, `/built`, `/404`; (2) ≥1 proof number from `{7+, 10K+, 35%, 22h, 1.2M, −68%, 7-person, 6, 8+ years}`; (3) `href="/"` or `href="https://sanjit.dev"` return path. Special case: `/built` HTML must contain `data-sig-canvas-mode="layered-architecture"`. `proxy.ts` issues 308 redirect from `/?for=recruiter*` to `/recruiter*` (preserving query params).
- **AD-13 (no SPA shell, closed client-component set)**: No global client provider; each route is server component by default; client components live in `components/client/` with `"use client"` at file top; closed set of 10 components: `<SignatureCanvas>`, `<ScrollProgress>`, `<CommandPalette>`, `<MagneticCTA>`, `<LayerRowHover>`, `<SkipToContent>`, `<NavCurrent>`, `<FilterChipGroup>`, `<AnalyticsBeacon>`, `<ErrorBeacon>`; each motion surface honors `prefers-reduced-motion`; pointer-dependent motion additionally gates on `pointer:fine`; `proxy.ts` at project root (not `middleware.ts`).
- **AD-14 (route-level forward flow)**: Forward artifact is a route-level flow on `/recruiter`, not a modal; URL shape `https://sanjit.dev/recruiter?forward=1&case=<slug>`; `generateMetadata` reads `searchParams` for `og:title`, `og:description`, `og:image` (1200×630); URL is primary affordance (Copy URL link at top of closing CTA card, default focus); PDF is secondary affordance (link to `/api/forward-pdf?case=<slug>`); on Puppeteer failure, secondary link mutates to "Print via browser" → `window.print()`; print stylesheet lives on `/recruiter` route; `<ForwardModal>` removed.
- **AD-15 (shadcn scope-limited)**: Use shadcn/ui for exactly three interactive primitives: `Dialog` (now reserved for future use; modal removed in v4), `Toggle` (reserved; no current consumer after v4), `Tooltip` (Patterns cited deep-link hover); primitives in `components/ui/`; imported only by routes that mount them; not a general-purpose library; all other components hand-rolled Tailwind v4 to carry spine-line typographic treatment.
- **AD-16 (visual-design skills as reviewers)**: Visual-design and microcopy AI skills produce review notes to `reviews/design-review-{slug}.md`, not spine amendments; recommendations that (a) add client JS beyond AD-13 closed set, (b) change spine-line copy, (c) reorder forward-flow button hierarchy, (d) break AD-12 invariants, or (e) introduce motion ignoring `prefers-reduced-motion` are logged as deferred items with conflicting AD cited.
- **AD-17 (closed signature-canvas mode list, 9 modes)**: Each route renders exactly one mode; closed table: `dual-ring` (/, violet), `filter-graph` (/work, violet), `section-progress` (/work/[slug], violet), `timeline` (/projects/[slug], violet), `decision-graph` (/patterns/[slug] and /patterns, violet), `experiment-graph` (/lab and /lab/[slug], pink --accent-3), `activity-feed` (/now, violet), `layered-architecture` (/built, cyan --accent-2), `condensed-4-node-status` (/recruiter, green --colors.live); no canvas on `/now/feed.xml` or `/404`; idle `sigFlow` dash-offset animation 2s linear infinite, collapses under `prefers-reduced-motion`; `aria-hidden="true"`; `pointer-events: none`; `display: none` below `xl`; adding a mode requires spine amendment.
- **AD-18 (closed design-token set, 57 tokens)**: Tailwind v4 `@theme` block in `app/globals.css`; no `tailwind.config.ts`; CSS custom properties + Tailwind utility classes; categories: 21 colors (`--bg`, `--bg-2`, `--bg-3`, `--glass`, `--glass-strong`, `--fg`, `--fg-2`, `--fg-3`, `--fg-4`, `--border`, `--border-strong`, `--border-accent`, `--accent`, `--accent-2`, `--accent-3`, `--accent-glow`, `--live`, `--live-glow`, `--warn`, `--on-accent`, `--on-live`), 13 typography, 9 spacing, 5 shapes, 4 shadows, 4 gradients; three accent roles: `--accent` (every page), `--accent-2` (Built page only), `--accent-3` (Lab pages only); never co-occur; `--live` reserved for live / shipping / now status; `--warn` reserved for counter-line; inline hex/px values outside closed set are review failure; adding any token requires spine amendment.
- **AD-19 (closed responsive breakpoints, 4)**: `xl ≥ 1280px` (full nav, signature canvas visible, two-column hero on `/built`), `lg 1100–1279px` (nav links + cmdk trigger visible, no canvas), `md 900–1099px` (single-column hero, 2-up grids, nav links + cmdk hidden but cmdk openable via ⌘K), `sm < 900px` (single column, hero padding tightens, canvas fully hidden, footer stacks, touch targets ≥ 44px); `<SignatureCanvas>` slot `display: none` below `xl` (freed 240×240 + 24px right margin reflowed); adding a breakpoint requires spine amendment.
- **AD-20 (WCAG 2.1 AA floor, CI-asserted)**: Semantic landmarks on every route (`<header role="banner">`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`); `<SkipToContent>` is first focusable element (`top: -100px` until `:focus`, then `top: 1rem`, touch target ≥ 44px on `sm`); `<CommandPalette>` `role="dialog"` `aria-modal="true"` `aria-labelledby="cmdk-title"` with focus trap inside `input + list`, Esc closes, scrim click closes, filter results region `<ul role="listbox" aria-live="polite" aria-relevant="additions">` with `<li role="option" aria-selected="false|true">`; `aria-current="page"` on active nav link; `aria-hidden="true"` on `<SignatureCanvas>` and gradient hairlines; `aria-label` on icon-only buttons; `aria-pressed="true|false"` on `<FilterChipGroup>` chips; `aria-live="polite" aria-relevant="additions"` on NOW ticker list; `aria-live="polite"` on `/recruiter?forward=1&case=<slug>` recommended-case-study callout; `prefers-reduced-motion` collapses site-wide; `<MagneticCTA>` gates on `matchMedia('(pointer: fine)')` AND `NOT matchMedia('(prefers-reduced-motion: reduce)')`; touch targets ≥ 44px on `sm`; `#FAFAFA` on `#06070B` ≈ 19:1 contrast; enforced by `pa11y-ci` in CI; adding any ARIA rule requires spine amendment.

### UX Design Requirements

UX requirements extracted from `DESIGN.md` + `EXPERIENCE.md` (v4 spine pair). Each must generate at least one story with testable acceptance criteria — these are first-class inputs, not supplementary material.

- **UX-DR1**: Implement `<SignatureCanvas>` client component with closed mode table per AD-17; selects one of 9 enumerated modes per route; idle `sigFlow` dash-offset animation traverses active edges at 2s linear infinite; `aria-hidden="true"`; `pointer-events: none`; `display: none` below `xl` (1280px); collapses to 0.01ms under `prefers-reduced-motion`.
- **UX-DR2**: Implement `<CommandPalette>` (⌘K / Ctrl-K opens, Esc closes); `role="dialog"` `aria-modal="true"` `aria-labelledby="cmdk-title"`; focus trap inside input + list; live fuzzy filter; keyboard arrow nav; Enter to navigate; scrim `rgba(6,7,11,0.72)` with `backdrop-filter: blur(24px)`; panel 640px max, `--rounded-lg`, `--shadow-lg`; scrim click closes; result list `<ul role="listbox" aria-live="polite" aria-relevant="additions">` with `<li role="option" aria-selected>`; collapses open transition to 0.01ms under `prefers-reduced-motion`.
- **UX-DR3**: Implement `<MagneticCTA>` single focal primary CTA per page (nav or hero); `pointermove` translates button by `0.18×` pointer offset (clamped ≤8px displacement); gated by `matchMedia('(pointer: fine)')` AND `NOT matchMedia('(prefers-reduced-motion: reduce)')`; touch / reduced-motion users see static button; static button must remain focusable with same label.
- **UX-DR4**: Implement `<ScrollProgress>` 1px-tall accent bar at nav bottom edge; `transform: scaleX(var(--progress))` driven by passive scroll listener capped 0–1; color `--accent`; 100ms transition; scroll listener disabled under `prefers-reduced-motion` (bar pinned at 0%).
- **UX-DR5**: Implement `<SkipToContent>` as first focusable element on every route; `top: -100px` until `:focus`, then `top: 1rem`; touch target ≥ 44px on `sm`; `Skip to content` text label.
- **UX-DR6**: Implement `<NavCurrent>` setting `aria-current="page"` on the active nav link; works on initial render and handles client-side nav transitions.
- **UX-DR7**: Implement `<FilterChipGroup>` on `/work` only; per-chip `aria-pressed` toggle; single active at a time; on click, clear others, set `aria-pressed="true"` on clicked chip; filter does NOT actually filter in v4 (visual organization only).
- **UX-DR8**: Implement `<LayerRowHover>` on `/built` page; layer-table row ↔ diagram node (hero big version + signature canvas small version) hover-sync via `.is-active` class; `prefers-reduced-motion` short-circuits the class swap; pointer listeners gated by `pointer:fine` implicitly.
- **UX-DR9**: Implement `<AnalyticsBeacon>` (Plausible) loading via `next/script strategy="lazyOnload"`; custom events: `forward_button_click`, `recruiter_mode_toggle`, `pattern_deep_link_visit`, `case_study_forward_open`.
- **UX-DR10**: Implement `<ErrorBeacon>` (Sentry) loading deferred; captures client-side errors only; no PII.
- **UX-DR11**: Apply closed design-token set in `app/globals.css` `@theme` block per AD-18 (57 tokens, 6 categories); tokens exposed as CSS custom properties AND Tailwind utility classes; mirror list in `lib/design-tokens.ts`; no `tailwind.config.ts`; no inline hex/px values outside the closed set.
- **UX-DR12**: Apply 4 closed breakpoints per AD-19 via `@media (min-width: ...)` in `app/globals.css` and Tailwind v4 responsive variants; signature canvas slot `display: none` below `xl`; freed 240×240 + 24px right margin reflowed into content column; `@media (prefers-reduced-motion: reduce)` applies at every breakpoint (no breakpoint-specific motion rules).
- **UX-DR13**: Implement persistent `<Nav>` on every public route — sticky top, 76px tall, `backdrop-filter: blur(20px)`, `rgba(6,7,11,0.72)`; three regions: brand mark (left), nav links (center, `Home / Work / About / Lab / Now / Built / Recruiter`), command palette trigger + magnetic CTA (right); bottom edge carries scroll-progress bar; brand mark is gradient square (28×28, `--rounded-sm`) with cursor-style node-pulse halo, followed by "Sanjit Majumdar" wordmark.
- **UX-DR14**: Implement `<Hero>` for homepage (CAP-1) and per-page hero on remaining routes; spine-line display + `--gradient-text` climax fragment; `--font-hero-spine` description; optional breadcrumb above; two-column on `/built` (hero + embedded architecture canvas).
- **UX-DR15**: Implement `<ProofVectorCluster>` showing four proof numbers (v4 set: 1.2M patients served, −68% P95 latency, 22h MTTR, 6 engineers mentored); numbers render at final value (no animated counters per anti-pattern); gradient-text background-clip on `--font-headline-md`; mono labels below.
- **UX-DR16**: Implement `<PatternsCited>` section at bottom of case-study pages per AD-4 + addendum §A.6 Option C; shows each cited pattern as a card with name + `one_line` + `→ Read the full opening` link to `/patterns/<slug>#move-{N}` (default move-1).
- **UX-DR17**: Implement `<ArchitectureDiagram>` (big version) on `/built` hero right column — `{components.card-focal}` with full SVG of 7-layer architecture; "Live" indicator (live green dot, pulsing); counter "7 layers"; hover-sync via `<LayerRowHover>` matches hero big version with signature canvas small version and layer table rows.
- **UX-DR18**: Implement `<LayerTable>` on `/built` page (numbered 01-07); each row matches a node in the architecture diagram; hover-sync via `<LayerRowHover>` per UX-DR8; canonical layer list (AD-6): AD-13 (now), AD-14 (recruiter-route forward flow), AD-17 (signature canvas), AD-18 (design tokens), AD-19 (breakpoints), AD-20 (a11y floor), AD-1 (content) — refreshed when ADs added.
- **UX-DR19**: Implement `/recruiter` route per amended AD-8 + AD-14: SSG with `generateStaticParams` per slug; spine line + four proof vectors + status strip (Available · Remote-first · Open to relocation · Last updated YYYY-MM-DD) + 2×2 stat grid + experience timeline + role-fit cards + closing CTA with primary "Copy URL" affordance (default focus) + secondary "Download PDF" link to `/api/forward-pdf?case=<slug>` + Puppeteer-failure fallback "Print via browser" link → `window.print()` using route-resident print stylesheet.
- **UX-DR20**: Implement `/patterns` index page listing five patterns as cards with `one_line` (spine sentence shown large); each card links to `/patterns/<slug>`; signature canvas uses `decision-graph` mode (shared with individual pattern page).
- **UX-DR21**: Implement pattern page `/patterns/[slug]` per amended AD-4 — sticky TOC, numbered moves `M1..Mn` (gradient-text numerals + `--font-headline-md` headings), counter-line block as visually distinct surface (`--colors.warn` left border 3px, `--foreground-2` body, `<h2 id="when-not">` heading, label "When NOT to use it"); signature canvas uses `decision-graph` mode; native HTML heading IDs `<h2 id="move-{N}">` for deep linking; case-study citations link to `/patterns/<slug>#move-{N}` (NOT `#M1` or `#M3`).
- **UX-DR22**: Implement `/now` page per AD-10 + AD-20 — vertical ticker with `<TickerRow>` (border-bottom 1px, padding `1.75rem 0`, dot variants `--colors.live` active / `--colors.accent` draft / `--colors.foreground-4` prior); `aria-live="polite" aria-relevant="additions"` on ticker list; subscribe form below ticker (email input + submit) — submit handler is v4 stub (no real backend, no error state, no render block); hero reads "right now." with gradient-text climax fragment; signature canvas uses `activity-feed` mode; honest empty state copy "Nothing new this week. — actually nothing." with `(last updated N days ago)` tag.
- **UX-DR23**: Implement `/lab` index and `/lab/[slug]` pages — Lab bucket signature canvas uses `experiment-graph` mode with `--accent-3` (pink); `/lab/[slug]` re-uses same mode (tool UI below canvas in main column); Lab tools render as plain HTML iframes or static screenshots (no client JS iframe loader per AD-13); Lab page hero reads "the gap annoyed me." with gradient-text climax fragment; body copy "Things I built because the gap annoyed me."; honest tool description ("v0.3 live. The idea ran out of steam after that.").
- **UX-DR24**: Implement `/built` page per amended AD-6 + AD-12 special case — two-column hero (left: spine "Walked into the build notes anyway." with gradient-text title, right: big architecture diagram in `{components.card-focal}`); layer table 01-07; stack cards; "Receipt" terminal-style page-weight table; "Decisions" section explaining why no SPA framework, no icon library, no build step; signature canvas uses `layered-architecture` mode with `--accent-2` (cyan); HTML must contain `data-sig-canvas-mode="layered-architecture"` (CI asserts).
- **UX-DR25**: Implement `/404` (`not-found.tsx`) per amended AD-12 — canvas-less (empty signature-canvas slot signals "lost"); must still carry spine-line variant + proof number + return path; recommended variant "right now." (with honest empty-state reading).
- **UX-DR26**: Implement `<AnalyticsBeacon>` event capture for forward flow on `/recruiter` — `forward_button_click` fires when Copy URL activated; `case_study_forward_open` fires when `/recruiter?forward=1&case=<slug>` URL opens; `recruiter_mode_toggle` reserved (toggle removed in v4 but event taxonomy retained for forward-link analytics).
- **UX-DR27**: Implement Plausible OG unfurl verification for `/recruiter?forward=1&case=<slug>` — `generateMetadata` reads `searchParams` at request time; sets `og:title` (forward variant), `og:description` (spine line + four proof vectors), `og:image` (1200×630 social card); unfurl preview must contain spine line + ≥1 proof number; visual regression asserts artifact fits 1200×630 frame without clipping.
- **UX-DR28**: Implement `<Hero>` magnetic CTA climax on `/built` — single focal primary CTA at hero climax; magnetic displacement per UX-DR3; `pointer:fine` AND `NOT prefers-reduced-motion` gating; static button fallback must remain functional.
- **UX-DR29**: Apply voice + tone rules from `EXPERIENCE.md.Voice and Tone` — banned phrasings ("Welcome to my portfolio!", "Passionate about building solutions!", "Let's connect", aspirational timestamps, marketing copy on side projects); required phrasings ("This person builds serious software — and this website is proof.", "Walked into the build notes anyway.", "the gap annoyed me.", "Skip the scheduling dance. Reply with role + comp range.", "Nothing new this week. — actually nothing.", "Last updated YYYY-MM-DD"); pattern copy reads like internal RFC, not marketing; numbers stay tight (`22h`, `90s`, `1.2M`, `−68%`).
- **UX-DR30**: Implement breadcrumb above hero (`{components.breadcrumb}`) — slash separator, current page in `--accent`, intermediate in `--foreground-3`; uses `--font-label`.
- **UX-DR31**: Implement ticker-row dot variants — `{colors.live}` (active), `{colors.accent}` (draft), `{colors.foreground-4}` (prior); active row text uses `--font-headline-sm`, prior row uses `--font-body-md` with `--foreground-2`.
- **UX-DR32**: Implement form input styling on `/now` subscribe form — `--bg-3` fill, `--border` border, `--rounded-sm` corner; focus `--accent` border + 2px solid `--accent` outline at 4px offset; submit is v4 stub.
- **UX-DR33**: Implement card hover pattern — `{colors.glass}` fill rest, `{colors.glass-strong}` fill on hover, `{colors.border}` border rest, `{colors.border-accent}` border on hover, `translateY(-3px or -4px)` on hover, `--shadow-lg` on hover; focus-visible = same visual richness + 2px accent outline; 1px gradient hairline at top via `::before { background: var(--gradient-card); }` on every card.
- **UX-DR34**: Implement button styles — `--button-primary` (`--accent` or `--gradient-button` fill, `--on-accent` text, `--rounded-md`, `translateY(-2px)` + `--shadow-glow` on hover); `--button-secondary` (`--glass-strong` fill, `--border-strong` border, `--foreground` text, `translateY(-2px)` + `--border-accent` border on hover); `--button-live` (`--live` fill, `--on-live` text, used ONLY on `/recruiter` nav CTA + closing CTA, hover `#6EE7B7` background + `0 0 24px rgba(52,211,153,0.4)` shadow).
- **UX-DR35**: Implement sticky TOC on `/work/[slug]` case-study pages — right column on `≥ lg`, top on `< lg`; click scrolls to section; active section highlighted via IntersectionObserver.
- **UX-DR36**: Implement personality card on `/about` — 3×2 grid; numbered (01..06) or linked (Lab, Now); mono number prefix, `--font-card-title` name, `--font-body-sm` description.
- **UX-DR37**: Implement role-fit card on `/recruiter#fit` — 2×2 grid; status badge (Strong fit / Partial / Open to) in `--font-label`; `--font-card-title` heading + `--font-body-md` description.
- **UX-DR38**: Implement recruiter summary card on `/recruiter` hero right — `{components.card-focal}` with avatar (gradient square w/ monogram) + name + role + meta (location, timezone) + 2×2 stat grid + 2 CTAs (live + secondary).
- **UX-DR39**: Apply gradient discipline — `--gradient-text` (violet → cyan → pink, 135deg) ONLY on hero titles at display sizes and section climax headlines; `--gradient-button` (violet → cyan) ONLY on focal primary CTA fill; `--gradient-card` (white 6% top → transparent, 180deg) ONLY as 1px hairline at top of every card surface; `--gradient-hero` (radial accent glow) ONLY as hero background glow.
- **UX-DR40**: Apply color discipline — `--accent` for brand / action / focus; `--accent-2` for secondary surface (Built page only); `--accent-3` for tertiary accent (Lab pages only); three accents never co-occur on same surface; `--live` reserved for live / shipping / now status; `--warn` reserved for counter-line + warning; no chromatic drop shadows (all shadows are pure black); glow halos use `--accent-glow` or `--live-glow` only.
- **UX-DR41**: Apply typography discipline — display sizes only on `clamp()`; mobile drops ~30% on hero, ~15% on headlines; gradient text only on display sizes; mono structural (section labels, breadcrumbs, timestamps, status, code blocks, canvas frame labels, "receipt" tables); real em-dashes `—` (U+2014); engineering notation (`22h`, `90s`, `1.2M`, `−68%`); system fallback (Space Grotesk → system-ui; Inter → system-ui; JetBrains Mono → ui-monospace, "SF Mono", Menlo, monospace).
- **UX-DR42**: Apply shape discipline — hairline 1px borders dominant; 1px gradient hairline at top of every card; generous radii on focal surfaces (hero CTA card, summary card, signature canvas frame use `--radius-xl` 28px); never on chrome (buttons, chips use `--radius-sm` 8px or `--radius-md` 12px).
- **UX-DR43**: Apply elevation hierarchy — floor 0 page (`--bg`), floor 1 card/panel (`--glass` + `--border` + `--radius-lg`), floor 2 raised card on hover (`--glass-strong` + `--border-accent` + `translateY(-3px or -4px)` + `--shadow-lg`), floor 3 modal/overlay (`--bg-2` + `--border-strong` + `--shadow-lg`), focal halo tier (`--shadow-glow` / `--shadow-glow-strong` on primary CTA climax only).

### FR Coverage Map

Mapping each FR to the architecture AD(s) that govern its implementation, the UX surface(s) where it ships, and the epic that owns building it. (Coverage is verified by the implementation-readiness check before sprint planning.)

| FR | Binds ADs | UX Surface | Epic |
|---|---|---|---|
| FR-1 | AD-12 (invariant), AD-13 (Nav, ScrollProgress, NavCurrent) | Every public route | E1 |
| FR-2 | AD-12, AD-13 (closed set), AD-17 (homepage dual-ring mode) | `/` | E1 |
| FR-3 | AD-8 (route, not state), AD-12 | `/recruiter` route + footer "For recruiters?" link on every page | E4 |
| FR-4 | AD-8, AD-14, AD-15 | `/recruiter` closing CTA | E4 |
| FR-5 | AD-8, AD-14 (route-level og:image), AD-11 | `/recruiter?forward=1&case=<slug>` | E4 |
| FR-6 | AD-3, AD-7 | `/api/forward-pdf?case=<slug>` | E4 |
| FR-7 | AD-4 (pattern citation walker), AD-17 (decision-graph mode) | `/patterns/[slug]` | E3 |
| FR-8 | AD-4 (native heading IDs), AD-12 | `/patterns/[slug]#move-{N}` | E3 |
| FR-9 | AD-17 (decision-graph shared) | `/patterns` | E3 |
| FR-10 | AD-12 (CI invariant) | Every public route | E1 (CI gate) + E3 + E5b (runtime) |
| FR-11 | AD-12 (route-specific metadata) | Every public route | E2 (scaffolding) + E3 + E4 + E5a + E5b (per-route metadata) |
| FR-12 | AD-1, AD-9 | Build pipeline + GitHub Action in sanjit-content | E2 |
| FR-13 | AD-5 (Zod 4 .partial + .passthrough) | Build pipeline + every content reader | E2 |
| FR-14 | AD-9 (TTL fallback) | ISR config on every public route | E2 (E5a USES the TTL on `/now`) |
| FR-15 | AD-10, AD-17 (activity-feed mode), AD-20 (aria-live) | `/now` | E5a |
| FR-16 | AD-10 (canonical payload contract) | `/` | E5a (uses contract; homepage summary) |
| FR-17 | AD-10 (fallback contract) | `/` + `/now` | E5a |
| FR-18 | AD-10, AD-17 (no canvas on feed.xml) | `/now/feed.xml` | E5a |
| FR-19 | AD-11 (no third-party), AD-13 (closed client set) | `/` (and per-route Lighthouse) | E1 |
| FR-20 | AD-11, AD-13 | Every public route | E1 |
| FR-21 | AD-11, AD-13 | Every public route | E1 |
| FR-22 | AD-11 (CSP), AD-13 (lazyOnload) | Every public route | E1 |

**Tally:** 22 FRs mapped. All 22 covered. No FR is owned by two epics; FR-10 / FR-11 / FR-14 / FR-16 / FR-17 reference E1/E2 as their CI or scaffold owner and a downstream epic as their runtime surface — standard cross-cutting pattern.

## Epic List

**Note:** Advanced elicitation (5/5 methods) was applied to the original 5-epic split on 2026-09-23. Outcome: E5 split into E5a + E5b (3 user outcomes packed into one epic was the strongest pre-mortem + challenge + cascading-failure signal). E1, E2, E3, E4 stay whole but with tightened done-criteria. Total: **6 epics**. E3 carries an internal sequencing constraint (patterns ship before case studies).

## Elicitation Notes (preserved from advanced elicitation, 2026-09-23)

Source-of-record for the spine-amendments implied by this epic split. **None of these have been adopted yet; they are deferred items per AD-16**. To activate, they must each go through a spine amendment, not a silent override at build time.

### Cascading Failure Surface #1 (AD-4 move-id validation)

AD-4 says the build fails if a cited slug is unpublished. It does NOT validate `pattern_moves: { "<slug>": <N> }` overrides. If E2 ships a pattern with `move-3` not yet authored, the case-study citation in E3 silently breaks (CI route-invariant passes because the link text is present, but the `#move-3` anchor doesn't exist).

**Spine amendment proposed:** extend AD-4 to require build-time validation of `pattern_moves` overrides against the published pattern's heading-ID set.

### Cascading Failure Surface #2 (AD-6 + AD-12 7-layer drift)

AD-12's special-case assertion checks for `data-sig-canvas-mode="layered-architecture"`. It does NOT check that the 7-layer enumeration matches across `architecture-diagrams.md`, the big-version SVG, the signature-canvas small-version, and the layer-table rows. The two scales can drift and CI is green.

**Spine amendment proposed:** extend AD-12 (or add a new AD-21) with a build-time consistency check that the 4 representations enumerate the same 7 layers in the same order.

### Cascading Failure Surface #3 (E4 mobile-touch fallback)

AD-7 + amended AD-14 specify a `window.print()` fallback when Puppeteer fails. On mobile Safari, `window.print()` is blocked programmatically. The fallback path silently fails for touch devices with no backup affordance.

**Spine amendment proposed:** update AD-7 / amended AD-14 to specify a touch-resilient fallback — a "Copy URL" link that is always visible regardless of Puppeteer success, with `window.print()` added as a desktop-only secondary affordance when Puppeteer fails.

### Pre-mortem Finding (E1 done-criteria tightening)

E1's "done" is currently weak: "homepage renders" passes when only `<Nav>` is mounted. The closed design system has hidden coupling (canvas mode ids reference design tokens). Strengthening E1's done-criteria to include test-harness mounts for unused components prevents E3 / E5 from regressing E1's invariants.

**Spine amendment proposed:** none — this is a done-criteria strengthening for the epic, not a spine change. Captured here so the dev agent has the rule when E1 stories are written.

---

## Epic 1: Scaffold and Ship the Spine

**Goal:** Stand up the Next.js 16 + Vercel scaffold with every closed design list codified in code, the cross-cutting CI harness green against a minimal homepage, and every persistent client component tested against preview environments — even those not yet mounted on a user-facing page (per the elicitation strengthening). Every subsequent epic compiles against the closed sets in AD-13 / AD-15 / AD-17 / AD-18 / AD-19 / AD-20; if E1 ships with a hole in any of these lists, E3 / E5 will hit it as a regression.

**Binds:** AD-11, AD-12, AD-13, AD-15, AD-16, AD-17, AD-18, AD-19, AD-20 — every spine-amendable surface in the project, codified exactly once in E1.
**FRs covered:** FR-1 (persistent positioning header), FR-2 (homepage hero + proof numbers), FR-19/20/21/22 (CI performance + budget gates).
**UX-DRs covered:** UX-DR1 through UX-DR15 (every closed client component), UX-DR11/12/13 (closed token set, breakpoints, persistent Nav), UX-DR14/15 (Hero, ProofVectorCluster), UX-DR30/33/34 (breadcrumb, card pattern, button styles), UX-DR39/40/41/42/43 (gradient / color / typography / shape / elevation discipline).

### Story 1.1: Bootstrap Next.js 16 + Vercel deploy with package.json, tsconfig, eslint, pnpm-lock.yaml

As a **developer**, I want **a Next.js 16.3.6+ App Router project with TypeScript 5.1+, Tailwind CSS 4.x via `@import "tailwindcss"`, and pnpm as the package manager**, so that **the project compiles against the spine's pinned stack and survives Vercel deploy without manual configuration**.

**Acceptance Criteria:**
- **Given** a clean directory, **When** I run `pnpm install --frozen-lockfile` and `pnpm dev`, **Then** Next.js 16.3.6+ starts on port 3000 with Turbopack default. [Binds: AD-13 stack table; stack pinning]
- **And** `package.json` pins `next@^16.3.6`, `react@^19.2`, `typescript@^5.1`, `tailwindcss@^4`, `zod@^4.6`, `@next/mdx@^3`. [Binds: AD-13 stack; AD-5 Zod 4]
- **And** `pnpm-lock.yaml` is committed; CI uses `--frozen-lockfile`. [Binds: AGENTS.md verified commands]
- **And** no `tailwind.config.ts` exists; configuration lives in `app/globals.css` via `@theme` (placeholder; E1.6 fills it). [Binds: AD-18; pitfall #7]
- **And** Node.js minimum `20.9.0` is set in `package.json` `engines`. [Binds: AGENTS.md verified commands]

### Story 1.2: Apply strict CSP via `next.config.js` and `experimental.sri`

As a **site owner**, I want **strict CSP set via `next.config.js` headers, with `experimental.sri: { algorithm: 'sha256' }` enabling hash-based integrity for built CSS (so `'unsafe-inline'` is NOT in `style-src`)**, so that **FR-22 (no third-party JS on critical path) and NFR-S (security) are enforced at the platform layer, not by author discipline**.

**Acceptance Criteria:**
- **Given** `next.config.js`, **When** I inspect the response headers, **Then** `Content-Security-Policy` contains: `default-src 'self'`, `script-src 'self' 'nonce-<runtime>' https://plausible.io`, `style-src 'self'` (NO `'unsafe-inline'`), `img-src 'self' data:`, `connect-src 'self' https://plausible.io https://api.resend.com`, `frame-src 'self' https://*.sanjit.dev`. [Binds: AD-11]
- **And** `experimental.sri.algorithm === 'sha256'` is set, so the SRI path works without nonce; the nonce path is explicitly NOT used. [Binds: AD-11 nonce rejection]
- **And** built CSS files include the `integrity` attribute with a SHA-256 hash. [Binds: AD-11 SRI]
- **And** a Lighthouse CI dry run on `/` (placeholder) confirms no third-party JS appears in the critical rendering path. [Binds: FR-22]

### Story 1.3: Wire `proxy.ts` at project root (Next 16 convention; NOT `middleware.ts`)

As a **developer**, I want **`proxy.ts` at the project root, not `middleware.ts`**, so that **the 308 stale-bookmark redirect from `/?for=recruiter*` to `/recruiter*` lives in the Next 16 convention and the deprecated middleware path is avoided entirely**.

**Acceptance Criteria:**
- **Given** a request to `/?for=recruiter&forward=1&case=wellbook`, **When** `proxy.ts` runs, **Then** the response is a 308 redirect to `/recruiter?forward=1&case=wellbook`, preserving all query params. [Binds: amended AD-12 stale-bookmark redirect]
- **And** no `middleware.ts` file exists. [Binds: AD-13 proxy.ts convention; pitfall #4]
- **And** `proxy.ts` does NOT inject any nonce-based CSP (the nonce path is rejected per AD-11). [Binds: AD-11]
- **And** the proxy does not introduce dynamic rendering — verified by inspecting the route's cache headers (`x-nextjs-cache: HIT` on a warm deploy). [Binds: AD-1 static-first]

### Story 1.4: Set up GitHub Actions CI with Lighthouse, gzip-budget, route-invariant, and pa11y-ci gates

As a **developer**, I want **`.github/workflows/ci.yml` with four CI assertions (Lighthouse Perf ≥ 95, gzip-budget, route-invariant, pa11y-ci) plus the weekly content-audit workflow**, so that **every PR that regresses the spine's binding rules fails the build before merge**.

**Acceptance Criteria:**
- **Given** a PR, **When** CI runs, **Then** the Lighthouse assertion on mobile profile + Slow 4G throttling asserts Performance ≥ 95 on the homepage. [Binds: FR-21; AD-12]
- **And** the gzip-budget assertion checks `gzip_size(homepage) < 100 KB` and `gzip_size(any_other_route) < 200 KB`. [Binds: FR-20]
- **And** the route-invariant assertion walks every URL under `/`, `/work/*`, `/projects/*`, `/lab/*`, `/patterns/*`, `/now`, `/about`, `/recruiter`, `/built`, `/404` and asserts: spine-line variant present + ≥1 of `{7+, 10K+, 35%, 22h, 1.2M, −68%, 7-person, 6, 8+ years}` present + `href="/"` or `href="https://sanjit.dev"` return path. [Binds: amended AD-12]
- **And** `pa11y-ci` runs against every public route and fails on any WCAG 2.1 AA violation. [Binds: AD-20]
- **And** the weekly content-audit workflow (`.github/workflows/content-audit.yml`) fails if any Vercel deployment in the past 7 days was triggered by a content-repo commit. [Binds: AD-9]

### Story 1.5: Set up `app/globals.css` with the closed 57-token `@theme` block (AD-18)

As a **designer-developer**, I want **`app/globals.css` to contain the closed 57-token `@theme` block (21 colors + 13 typography + 9 spacing + 5 shapes + 4 shadows + 4 gradients)**, so that **AD-18's closed design-token list is enforced as the single source of truth, mirrored in `lib/design-tokens.ts`, with no `tailwind.config.ts` and no inline hex/px values**.

**Acceptance Criteria:**
- **Given** `app/globals.css`, **When** I read the `@theme` block, **Then** it contains exactly the 21 color tokens (`--bg`, `--bg-2`, `--bg-3`, `--glass`, `--glass-strong`, `--fg`, `--fg-2`, `--fg-3`, `--fg-4`, `--border`, `--border-strong`, `--border-accent`, `--accent`, `--accent-2`, `--accent-3`, `--accent-glow`, `--live`, `--live-glow`, `--warn`, `--on-accent`, `--on-live`). [Binds: AD-18]
- **And** the 13 typography tokens (`--font-display` through `--font-code-block`) each pin family + size + weight + line-height + tracking. [Binds: AD-18; UX-DR41]
- **And** the 9 spacing tokens, 5 shape tokens, 4 shadow tokens, and 4 gradient tokens (`--gradient-card`, `--gradient-text`, `--gradient-button`, `--gradient-hero`) are present. [Binds: AD-18; UX-DR39/42]
- **And** `lib/design-tokens.ts` mirrors the closed token list and is exported as a typed array used by `lib/canvas-modes.ts`. [Binds: AD-17 + AD-18 co-source]
- **And** a lint rule (or grep-based CI step) fails the build if any `.tsx` / `.mdx` file outside `lib/design-tokens.ts` references a hex code outside the closed token set. [Binds: AD-18 inline hex/px review failure]
- **And** `app/globals.css` also contains the breakpoint media queries per AD-19 (`@media (min-width: 1280px)`, `(1100px–1279px)`, `(900px–1099px)`, `(<900px)`), the `@media (prefers-reduced-motion: reduce)` site-wide block, and the a11y focus-visible outline rules. [Binds: AD-19, AD-20, UX-DR12]

### Story 1.6: Implement the 10 closed client components (AD-13)

As a **developer**, I want **the 10 closed client components in `components/client/` with `"use client"` at file top, each honoring its motion gate**, so that **AD-13's closed set is enforced — adding any new client component requires a spine amendment**.

**Acceptance Criteria:**
- **Given** `components/client/`, **When** I list the files, **Then** exactly 10 client components exist: `SignatureCanvas.tsx`, `ScrollProgress.tsx`, `CommandPalette.tsx`, `MagneticCTA.tsx`, `LayerRowHover.tsx`, `SkipToContent.tsx`, `NavCurrent.tsx`, `FilterChipGroup.tsx`, `AnalyticsBeacon.tsx`, `ErrorBeacon.tsx`. [Binds: AD-13 closed set]
- **And** each file begins with `"use client"` and lives in `components/client/`. [Binds: AD-13]
- **And** `<SignatureCanvas>` reads `mode` from a prop and selects one of 9 enum modes from `lib/canvas-modes.ts`; idle `sigFlow` dash-offset 2s linear infinite; collapses to 0.01ms under `prefers-reduced-motion`; `aria-hidden="true"`; `pointer-events: none`; `display: none` below `xl`. [Binds: AD-13 + AD-17; UX-DR1]
- **And** `<MagneticCTA>` short-circuits to a static button under `matchMedia('(pointer: fine)')` returning false OR `matchMedia('(prefers-reduced-motion: reduce)')` returning true; static button remains focusable with same label. [Binds: AD-13 motion gate; UX-DR3]
- **And** `<CommandPalette>` has `role="dialog"` `aria-modal="true"` `aria-labelledby="cmdk-title"`; focus trap inside `input + list`; `<ul role="listbox" aria-live="polite" aria-relevant="additions">`; `<li role="option" aria-selected>`; open transition collapses to 0.01ms under reduced-motion. [Binds: AD-13 + AD-20; UX-DR2]
- **And** `<AnalyticsBeacon>` loads Plausible via `next/script strategy="lazyOnload"`; emits `forward_button_click`, `recruiter_mode_toggle`, `pattern_deep_link_visit`, `case_study_forward_open`. [Binds: AD-13 + NFR-O; UX-DR9/26]
- **And** `<ErrorBeacon>` loads Sentry deferred. [Binds: AD-13; UX-DR10]
- **And** `<FilterChipGroup>` and `<LayerRowHover>` ship with preview-environment test harnesses (not user-facing mounts) per the elicitation strengthening — prevents E3 / E5 from regressing them. [Binds: elicitation pre-mortem #1]

### Story 1.7: Implement persistent `<Nav>` with brand mark, links, command palette trigger, magnetic CTA, scroll progress

As a **visitor**, I want **a sticky nav on every public route with the brand mark, the seven nav links, the ⌘K trigger, and one magnetic CTA — plus the 1px scroll-progress bar at the bottom edge**, so that **I can navigate the site from any page, see my reading position, and reach the recruiter-mode affordance**.

**Acceptance Criteria:**
- **Given** any public route, **When** I view the nav, **Then** it is sticky at top, 76px tall, `backdrop-filter: blur(20px)` over `rgba(6,7,11,0.72)`, with bottom hairline. [Binds: UX-DR13]
- **And** the brand mark is a gradient square (28×28, `--rounded-sm`) with cursor-style node-pulse halo + the wordmark "Sanjit Majumdar". [Binds: UX-DR13]
- **And** the seven links render: Home / Work / About / Lab / Now / Built / Recruiter, with `aria-current="page"` set by `<NavCurrent>` on the active link. [Binds: AD-20; UX-DR6]
- **And** the right region mounts `<CommandPalette>` trigger (⌘K hint with `<kbd>`) + a single `<MagneticCTA>` focal CTA. [Binds: UX-DR13; AD-13 closed set]
- **And** the bottom edge of the nav carries `<ScrollProgress>` as a 1px-tall `--accent` bar, `transform: scaleX(var(--progress))` driven by a passive scroll listener, capped 0–1, 100ms transition. [Binds: UX-DR4]
- **And** `<ScrollProgress>` scroll listener is disabled under `prefers-reduced-motion` (bar pinned at 0%). [Binds: AD-16 motion discipline; UX-DR4]
- **And** below `lg` (1100px), nav links + cmdk trigger hide; below `md` (900px), cmdk trigger hides too (palette still openable via ⌘K). [Binds: AD-19]

### Story 1.8: Implement `<Hero>` + `<ProofVectorCluster>` for the homepage

As a **recruiter scanning the homepage**, I want **the spine line verbatim, four proof numbers in a tight cluster, and a positioning line in a 30-second-readable hero**, so that **CAP-1 (recruiter-grade first impression) lands in the first paint**.

**Acceptance Criteria:**
- **Given** the homepage `/`, **When** I load it cold, **Then** the hero shows the spine line verbatim (variant per `EXPERIENCE.md.Voice and Tone` for `/`: "This person builds serious software — and this website is proof."). [Binds: FR-2; UX-DR14; UX-DR29]
- **And** the four proof numbers render at their final value (no animated counters per anti-pattern): 1.2M patients served, −68% P95 latency, 22h MTTR, 6 engineers mentored (or legacy 7+ / 10K+ / 35% / 7-person — locked to v4 set per spine). [Binds: UX-DR15; amended AD-12 proof-number set]
- **And** the proof numbers use `--gradient-text` (violet → cyan → pink, 135deg) on `--font-headline-md` with mono labels below in `--font-label`. [Binds: UX-DR15; UX-DR39]
- **And** a positioning line in `--font-hero-spine` ("Senior Software Engineer specializing in .NET, Angular, APIs and scalable systems") sits below the spine line. [Binds: FR-2]
- **And** `<Hero>` mounts `<SignatureCanvas>` with `mode="dual-ring"` (per AD-17 homepage assignment) at `xl ≥ 1280px`, `display: none` below. [Binds: AD-17]
- **And** a magnetic CTA climax lives at the bottom of the hero, gated by `pointer:fine` AND `NOT prefers-reduced-motion`. [Binds: UX-DR3, UX-DR14]

### Story 1.9: Implement root layout (`app/layout.tsx`) with semantic landmarks, skip-to-content, beacons

As a **visitor using assistive tech**, I want **every page to ship with semantic landmarks (`<header>`, `<nav>`, `<main id="main">`, `<footer>`), a skip-to-content link as the first focusable element, and the analytics + error beacons loading deferred**, so that **WCAG 2.1 AA is the floor and observability is silent on first paint**.

**Acceptance Criteria:**
- **Given** any public route, **When** the page renders, **Then** `<header role="banner">`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer role="contentinfo">` are present. [Binds: AD-20]
- **And** `<SkipToContent>` is the first focusable element with `top: -100px` until `:focus`, then `top: 1rem`; touch target ≥ 44px on `sm`. [Binds: AD-20; UX-DR5]
- **And** `<AnalyticsBeacon>` (Plausible) and `<ErrorBeacon>` (Sentry) are mounted in the root layout with deferred loading. [Binds: AD-13; UX-DR9/10]
- **And** the root layout renders `<Nav>` and the `{children}` slot; it is a server component (no `"use client"` boundary at the layout level). [Binds: AD-13 no-SPA-shell]

### Story 1.10: Implement shadcn primitives (`Dialog`, `Toggle`, `Tooltip`) under `components/ui/`

As a **developer**, I want **exactly three shadcn primitives in `components/ui/` — `Dialog`, `Toggle`, `Tooltip` — imported only by routes that mount them**, so that **AD-15's scope limit is enforced and the bundle doesn't carry a general-purpose UI library**.

**Acceptance Criteria:**
- **Given** `components/ui/`, **When** I list the files, **Then** exactly `dialog.tsx`, `toggle.tsx`, `tooltip.tsx`, `utils.ts` (the `cn()` helper) exist. [Binds: AD-15]
- **And** no shadcn registry beyond these three has been pulled in (verified by `components.json` or equivalent config). [Binds: AD-15]
- **And** in E1, none of the primitives are imported by any route (they're reserved for E3/E4 consumers). [Binds: AD-15]
- **And** `Toggle` and `Tooltip` ship with no current consumer in E1; `Dialog` is reserved per amended AD-14 (modal removed but primitive kept for future use). [Binds: amended AD-15]

### Story 1.11: Implement `app/page.tsx` (homepage) with signature canvas dual-ring, proof vector cluster, recruiter-route footer link

As a **recruiter landing cold on the homepage**, I want **the homepage to render with the v4 visual identity, the spine line, the four proof numbers, and a footer-level "For recruiters?" link**, so that **I can either scan the homepage (UJ-1 step 1-2) or click through to the forward-ready `/recruiter` route**.

**Acceptance Criteria:**
- **Given** the homepage `/`, **When** I load it, **Then** `<SignatureCanvas mode="dual-ring">` mounts (≥ `xl`). [Binds: AD-17]
- **And** the hero + proof vector cluster + a section label "01 / Featured" + a "Currently Building" summary placeholder (E5a fills it) + a "How this site is built" link + the footer "For recruiters?" link render. [Binds: UX-DR14; amended AD-8 footer opt-in]
- **And** the homepage's HTML contains the spine-line variant + ≥1 proof number + `href="/recruiter"` (or `https://sanjit.dev/recruiter`) — passing CI route-invariant. [Binds: amended AD-12]
- **And** `<MagneticCTA>` at the hero climax is the only magnetic CTA on the viewport. [Binds: UX-DR14; UX-DR3]
- **And** the homepage is `pnpm build`-able, deployable, and passes Lighthouse Perf ≥ 95 + gzip-budget < 100 KB + pa11y-ci clean on a fresh deploy. [Binds: FR-19/20/21; AD-12]

---

## Epic 2: Content Schema, Two-Repo Read Path, and a Move-Tagged Pattern Stub

**Goal:** Wire the additive Zod 4 content schema (`.partial({title:true}) + .passthrough()`), the `sanjit-content` shallow-clone read path, the `POST /api/revalidate` edge handler, the 5-minute TTL fallback, and the content audit workflow. Pre-publish a move-tagged pattern stub into `sanjit-content` so E3's case-study citations have a real target. Audit the Vercel plan tier's memory budget so E4's Puppeteer route doesn't surprise-deploy on Hobby. By E2's done, Sanjit can edit any `status: published` content file, push to `sanjit-content`, and see the change live in under 30s without rebuilding the code repo.

**Binds:** AD-1 (single read path), AD-5 (Zod build-fail on malformed published frontmatter), AD-9 (no build on content edits).
**FRs covered:** FR-11 (OG metadata scaffolding), FR-12 (separate content repo), FR-13 (additive schema), FR-14 (TTL fallback).
**Preceded-by:** E1.

### Story 2.1: Set up `sanjit-content` repo with content directory layout and GitHub Actions workflow listening to push / delete / force-push

As a **site owner**, I want **a separate `sanjit-content` repo with the directory layout (`case-studies/`, `patterns/`, `lab/`, `now-snapshot.json`, `cv.md`) and a GitHub Actions workflow that listens to `push`, `delete`, AND `force-push` events**, so that **AD-1's read path and AD-9's no-build-on-content-edits rule both hold — missing force-push coverage breaks AD-1's freshness guarantee (pitfall #9)**.

**Acceptance Criteria:**
- **Given** a new `sanjit-content` repo with directory layout, **When** a content file is pushed / deleted / force-pushed to `main`, **Then** the workflow fires and calls `POST https://sanjit.dev/api/revalidate?tag=<tag>&slug=<slug>&sha=<sha>`. [Binds: AD-1]
- **And** the workflow explicitly handles `push`, `delete`, AND `force-push` events (verified by inspecting `.github/workflows/revalidate.yml` triggers). [Binds: AD-1; pitfall #9]
- **And** the workflow constructs the full ISR tag as `<tag>:<slug>` when `slug` is present, or `<tag>` alone when absent; bare tags enumerated as `now` and `cv`; typed tags enumerated as `case-study`, `pattern`, `lab`, `project`. [Binds: AD-1]
- **And** no Vercel hook is configured on the content repo — content edits do NOT trigger a Vercel build. [Binds: AD-9]

### Story 2.2: Implement additive Zod 4 schemas for case-study, pattern, lab, project, currently-building entry, cv

As a **content author**, I want **Zod 4 schemas using `.partial({title: true})` and `.passthrough()` for every content type**, so that **every frontmatter field except `title` is optional, unknown keys are preserved on `entry.meta`, and adding a new field never breaks an old entry (FR-13 / AD-5)**.

**Acceptance Criteria:**
- **Given** `lib/content/schema.ts`, **When** I parse an entry, **Then** the schema is `.partial({title: true})` + `.passthrough()`; unknown keys are preserved on `entry.meta`. [Binds: AD-5; FR-13; pitfall #10]
- **And** a unit test asserts that an entry missing a new field still renders correctly. [Binds: FR-13]
- **And** a unit test asserts that an entry with unknown extra fields still renders and exposes those fields via `entry.meta`. [Binds: FR-13]
- **And** a unit test asserts that `status: draft` entries are excluded from the published set (build proceeds) but `status: published` entries with malformed frontmatter fail the build with a per-file diagnostic (file path + failing field via `ZodError.issues`). [Binds: AD-5]

### Story 2.3: Implement content reader (`lib/content/*.ts`) walking only `status: published`

As a **content reader**, I want **the content reader to walk only entries with `status === 'published'`**, so that **drafts do not break the build (AD-5) and the citation walker in E3 has a stable published-set to string-match against**.

**Acceptance Criteria:**
- **Given** `lib/content/case-study.ts`, `pattern.ts`, `lab.ts`, `project.ts`, **When** the reader runs, **Then** only `status === 'published'` entries are returned. [Binds: AD-5]
- **And** the published-set is enumerated in a constant so the citation walker (E3.3) can do a fast O(1) slug lookup. [Binds: AD-4]
- **And** the reader never calls the GitHub HTTP API at runtime; it reads from the build-time shallow clone. [Binds: AD-1]

### Story 2.4: Implement Next.js shallow-clone of `sanjit-content` at build time

As a **build pipeline**, I want **`next.config.js` or a `prebuild` step to shallow-clone `sanjit-content` into `content/` at build time**, so that **AD-1's single read path holds and content routes read from that clone with no runtime GitHub calls**.

**Acceptance Criteria:**
- **Given** a Vercel build of the code repo, **When** the build step runs, **Then** a shallow `git clone` of `sanjit-content` lands in `content/` before the page rendering. [Binds: AD-1]
- **And** the clone is shallow (`--depth 1`) to keep build time bounded. [Binds: AD-1]
- **And** no route uses the GitHub HTTP API to read content at runtime. [Binds: AD-1]

### Story 2.5: Implement `POST /api/revalidate` edge handler with `revalidateTag(tag, 'max')` (Next 16 signature)

As a **webhook receiver**, I want **`POST /api/revalidate` running on the edge runtime, parsing `tag`, `slug`, `sha` from query params, and calling `revalidateTag(tag, 'max')`**, so that **content edits propagate in <30s with no main build pipeline triggered (AD-9)**.

**Acceptance Criteria:**
- **Given** a `POST /api/revalidate?tag=case-study:wellbook&slug=wellbook&sha=<sha>` request, **When** the handler runs, **Then** it constructs `case-study:wellbook` and calls `revalidateTag('case-study:wellbook', 'max')`. [Binds: AD-1; AD-3 edge runtime]
- **And** the handler is `runtime = 'edge'` per AD-3. [Binds: AD-3 closed endpoint list]
- **And** `revalidateTag(tag)` single-arg form is NOT used (deprecated in Next 16 per pitfall #3). [Binds: pitfall #3]
- **And** the handler emits structured JSON logs `{ request_id, route, duration_ms, status }` with `request_id` from `crypto.randomUUID()`. [Binds: spine conventions]
- **And** an unauthorized caller cannot trigger a revalidate (token check or signed payload). [Binds: NFR-S]
- **And** on success, the affected route reflects the change within 5s of the webhook delivery (verified by an integration test). [Binds: FR-12]

### Story 2.6: Apply `revalidate: 300` (5-minute TTL) fallback on every ISR route

As a **site owner**, I want **`revalidate: 300` set on every ISR route as a fallback**, so that **if the webhook fails, the route regenerates within 5 minutes regardless (FR-14 / AD-9)**.

**Acceptance Criteria:**
- **Given** every public route, **When** I inspect the route config, **Then** `export const revalidate = 300` (or equivalent route-segment config) is set. [Binds: FR-14; AD-9]
- **And** an integration test disables the webhook and asserts the route regenerates within 5 minutes via the TTL. [Binds: FR-14]

### Story 2.7: Pre-publish a move-tagged pattern stub in `sanjit-content` (`/patterns/canonical-model`)

As a **scaffold author**, I want **a real pattern entry (`canonical-model.mdx`) published in `sanjit-content` with `<h2 id="move-1">`, `<h2 id="move-2">`, `<h2 id="move-3">`, `<h2 id="when-not">` heading IDs and a counter-line block**, so that **E3's case-study "Patterns cited" cards have a real `/patterns/canonical-model#move-{N}` target to deep-link to (per elicitation pre-mortem + cascading failure surface #1)**.

**Acceptance Criteria:**
- **Given** `sanjit-content/patterns/canonical-model.mdx`, **When** I publish it (`status: published`), **Then** the frontmatter parses through the Zod schema without error (FR-13). [Binds: FR-13; AD-5]
- **And** the file contains exactly the heading IDs `<h2 id="move-1">`, `<h2 id="move-2">`, `<h2 id="move-3">`, `<h2 id="when-not">`. [Binds: amended AD-4 heading-ID contract]
- **And** the counter-line block is visually distinct (`--colors.warn` left border 3px, `--foreground-2` body, "When NOT to use it" label). [Binds: amended AD-4; UX-DR21]
- **And** a static-analysis check asserts the heading ID contract (no `#M1` or `#M3` substitutions, no missing IDs). [Binds: amended AD-4]

### Story 2.8: Audit Vercel plan tier for `POST /api/forward-pdf` memory budget (≥ 1769 MB)

As a **deploy owner**, I want **a documented audit of the Vercel plan tier (Hobby vs Pro) against the ≥ 1769 MB memory requirement for AD-7's Puppeteer route**, so that **E4 doesn't surprise-deploy on Hobby and OOM (per elicitation cascading failure #1 + Pre-mortem #4)**.

**Acceptance Criteria:**
- **Given** a deployment configuration, **When** I review the audit doc, **Then** it explicitly states the Vercel plan tier required for E4 (`POST /api/forward-pdf` ≥ 1769 MB) and the upgrade path if Hobby. [Binds: AD-7; pitfall #5]
- **And** the audit doc lives at `_bmad-output/planning-artifacts/deploy/vercel-plan-tier-audit.md`. [Binds: elicitation pre-mortem #4]
- **And** the doc lists the Vercel Hobby memory limit (1024 MB) and Pro memory limit (1769 MB+) with citations to Vercel docs as of 2026-09-23. [Binds: AD-7]

### Story 2.9: Implement weekly content-audit workflow

As a **site owner**, I want **a weekly CI audit that fails if any Vercel deployment in the past 7 days was triggered by a content-repo commit**, so that **AD-9's "no build on content edits" rule is enforced by audit, not just by convention**.

**Acceptance Criteria:**
- **Given** `.github/workflows/content-audit.yml`, **When** it runs weekly, **Then** it inspects Vercel deployment history for the past 7 days and fails if any deployment trigger is from the content repo. [Binds: AD-9]
- **And** the workflow logs a structured JSON report `{ audit_run_id: <gh-run-id>, period_days: 7, violations: [] }`. [Binds: spine logging conventions]

---

## Epic 3: Patterns → Case Studies (sequenced internally)

**Goal:** Publish all 5 patterns (Canonical Model, Syncfusion Data-Grid, nopCommerce Plugin, Ship-Faster Pushback, Friday Architecture Review) at stable `/patterns/<slug>` URLs with native `<h2 id="move-{N}">` deep-linkable moves + visually distinct counter-line blocks. Publish the pattern index. Then ship ≥3 case studies with "Patterns cited" cards linking to `/patterns/<slug>#move-{N}` (default `move-1`, overridable via `pattern_moves`), plus the sticky TOC. ≥5 Lab tools categorized Production / Experiment / Personal. Internal sequencing: patterns → index → case studies. Each case study depends on the pattern pages it cites already existing.

**Binds:** AD-4 (pattern citation walker, native heading-ID contract), AD-17 (decision-graph + section-progress canvas modes), amended AD-12 (route-invariant includes patterns + case-study pages).
**FRs covered:** FR-7 (5 named patterns at stable URLs), FR-8 (pattern deep-linkability via `#move-{N}`), FR-9 (pattern index page), FR-10 (route-invariant in CI), FR-11 (page-specific OG metadata).
**UX-DRs covered:** UX-DR16 (PatternsCited section), UX-DR20 (pattern index), UX-DR21 (pattern page with counter-line), UX-DR35 (sticky TOC on case studies).
**Preceded-by:** E1, E2.

### Story 3.1: Publish all 5 patterns at `/patterns/[slug]` with native heading-ID contract + counter-line block

As a **visitor landing on a cold pattern URL**, I want **each of the 5 patterns at a stable URL with numbered moves (`M1..Mn`), visually distinct counter-line, and `#move-{N}` anchors that resolve**, so that **Sam the engineer (UJ-3) can deep-link to a specific move and share it externally (FR-8)**.

**Acceptance Criteria:**
- **Given** `/patterns/canonical-model`, `/patterns/syncfusion-data-grid`, `/patterns/nopcommerce-plugin`, `/patterns/ship-faster-pushback`, `/patterns/friday-architecture-review`, **When** I load any pattern page, **Then** the page renders setup ("When this applies"), 2–5 numbered moves, a counter-line block, and an annotation. [Binds: FR-7]
- **And** each pattern page uses the native `<h2 id="move-{N}">` heading-ID contract — 1-indexed, no `#M1` / `#M3` substitutions. [Binds: amended AD-4]
- **And** the counter-line block renders as `<h2 id="when-not">` with `--colors.warn` left border 3px, `--foreground-2` body, label "When NOT to use it". [Binds: amended AD-4; UX-DR21]
- **And** the Ship-Faster Pushback pattern's `move-4` anchor carries the verbatim quote ("I showed him the data, told him this doesn't look optimal enough to be shipped — it needs to pass all tests to be able to be shipped. We cannot ship a weak and faulty product.") per addendum §A.7. [Binds: FR-7; addendum A.7]
- **And** the signature canvas renders with `mode="decision-graph"` (per AD-17 pattern-page assignment) at `xl ≥ 1280px`, `display: none` below. [Binds: AD-17]
- **And** deep links `/patterns/<slug>#move-{N}` resolve and focus the corresponding heading. [Binds: FR-8]

### Story 3.2: Publish `/patterns` index page listing the 5 patterns

As a **visitor**, I want **a `/patterns` index page listing the 5 patterns as cards with `one_line` (the spine sentence shown large)**, so that **I can navigate from the pattern library entry to a specific pattern page (FR-9)**.

**Acceptance Criteria:**
- **Given** `/patterns`, **When** I load it, **Then** 5 pattern cards render with `one_line` (large), name (mono label), and a link to `/patterns/<slug>`. [Binds: FR-9]
- **And** the signature canvas renders with `mode="decision-graph"` (shared with individual pattern pages) at `xl ≥ 1280px`. [Binds: AD-17]
- **And** the page is reachable from the main navigation. [Binds: FR-9]

### Story 3.3: Implement pattern citation walker in case-study frontmatter (string-match against published set + `pattern_moves` override)

As a **case-study author**, I want **the `patterns:` array in case-study frontmatter to be resolved at build time by string-match against the published pattern slugs, with `pattern_moves: { "<slug>": <N> }` override for surfacing a specific move**, so that **"Patterns cited" cards deep-link to the right move on the right pattern page (AD-4 + FR-8)**.

**Acceptance Criteria:**
- **Given** a case study with `patterns: ["canonical-model", "ship-faster-pushback"]` and `pattern_moves: { "canonical-model": 3 }`, **When** the page renders, **Then** the citation walker walks only `status: published` pattern entries (drafts are skipped). [Binds: AD-4; AD-5]
- **And** "canonical-model" cites `/patterns/canonical-model#move-3` (override applied); "ship-faster-pushback" cites `/patterns/ship-faster-pushback#move-1` (default). [Binds: AD-4]
- **And** the build FAILS with a per-file diagnostic if any cited slug is unpublished, OR if `pattern_moves.<slug>` references a move-id that doesn't exist in the published pattern's heading-ID set (closes elicitation cascading failure surface #1 — spine-amendment deferred item). [Binds: AD-4 + elicitation deferred]
- **And** the citation walker renders the "Patterns cited" section at the bottom of the case study as a small `h2` with a list of deep-link cards (name + `one_line` + `→ Read the full opening` link). [Binds: addendum §A.6 Option C; UX-DR16]

### Story 3.4: Publish ≥3 case studies at `/work/[slug]` with sticky TOC + "Patterns cited" section

As a **hiring manager or fellow engineer**, I want **each case study to render with a sticky TOC, structured sections (Context → Problem → Approach → Architecture → Decisions → Results), proof-number metrics, and a "Patterns cited" section at the bottom**, so that **I can scan or deep-link to the engineering decisions and the patterns they used (UJ-2 step 5-6)**.

**Acceptance Criteria:**
- **Given** `/work/wellbook` (and ≥2 additional published case studies), **When** I load it, **Then** the page renders with a sticky TOC on the right column at `≥ lg`, stacked at top on `< lg`. [Binds: UX-DR35]
- **And** each section is reachable via TOC click; the active section is highlighted via IntersectionObserver. [Binds: UX-DR35]
- **And** the proof-number metrics (e.g. -35% response time, -25% memory, 10K+ active users for Wellbook) render at their final value with `--gradient-text` on `--font-headline-md`. [Binds: UX-DR15]
- **And** the signature canvas renders with `mode="section-progress"` (per AD-17 case-study assignment) at `xl ≥ 1280px`, 6 vertical nodes matching the 6 sections. [Binds: AD-17]
- **And** the page-specific OG metadata (title, description, image) reflects the case study, not the site overall. [Binds: FR-11]
- **And** the page passes the CI route-invariant (spine-line variant + ≥1 proof number + return path). [Binds: amended AD-12]

### Story 3.5: Publish ≥5 Lab tools at `/lab/[slug]` with Production / Experiment / Personal categorization

As a **visitor exploring Lab tools**, I want **at least 5 Lab tools published at `/lab/[slug>` with their category (Production / Experiment / Personal) rendered and the "interesting part" / "why it exists" frontmatter surfaced**, so that **I can judge the engineering depth of each tool from the page itself**.

**Acceptance Criteria:**
- **Given** `/lab` and ≥5 `/lab/[slug]` routes, **When** I load any Lab tool page, **Then** the page renders `what_it_is`, `why_it_exists`, `interesting_part`, and `category` from frontmatter. [Binds: PRD §6 MVP]
- **And** the Lab page signature canvas uses `mode="experiment-graph"` with `--accent-3` (pink) at `xl ≥ 1280px` per AD-17. [Binds: AD-17]
- **And** Lab tools with `interactive: true` render as plain HTML iframes (no client JS wrapper per amended AD-13). [Binds: amended AD-13]
- **And** Lab tools with no preview image render a CSS-only gradient preview via the four `.lab-preview-N` variants. [Binds: `EXPERIENCE.md.State Patterns`]
- **And** Lab page hero reads "the gap annoyed me." with gradient-text climax fragment and body "Things I built because the gap annoyed me." [Binds: UX-DR23, UX-DR29]

### Story 3.6: Verify `EXPERIENCE.md.Flow 3` (Sam the senior engineer) end-to-end

As a **quality gate**, I want **an end-to-end test that exercises Sam's flow**: cold-load `/patterns/canonical-model`, read setup, click `#move-3` deep link from a case study, see the verbatim quote on `/patterns/ship-faster-pushback#move-4`, and verify the bookmark round-trip.

**Acceptance Criteria:**
- **Given** the build is complete, **When** Playwright executes Flow 3, **Then** the cold-load LCP on `/patterns/canonical-model` is < 1.8s on Slow 4G. [Binds: FR-19]
- **And** a click from `/work/<case-study>` on a "Read the full opening" link resolves to `/patterns/<slug>#move-{N}` and the heading is focused. [Binds: FR-8]
- **And** the verbatim quote on `/patterns/ship-faster-pushback#move-4` is present in the rendered HTML. [Binds: FR-7 + addendum A.7]

---

## Epic 4: The `/recruiter` Route, the PDF, and the OG Unfurl

**Goal:** Build the `/recruiter` SSG route as the canonical forward artifact surface (amended AD-8 + amended AD-14). URL-first affordance hierarchy (Copy URL primary at top of closing CTA, default focus) + secondary Download PDF link to `/api/forward-pdf?case=<slug>`. Puppeteer + `@sparticuz/chromium` Node.js function with mobile-touch fallback decoupled from `window.print()`. 1200×630 OG unfurl with spine line + ≥1 proof number. The only epic that directly drives SM-1.

**Binds:** AD-3 (closed serverless endpoints), AD-7 (Puppeteer PDF), amended AD-8 (recruiter-mode is a route), amended AD-14 (route-level forward flow), AD-15 (Dialog reserved), AD-11 (CSP).
**FRs covered:** FR-3 (recruiter-mode as route), FR-4 (forward-to-hiring-manager), FR-5 (shareable URL + OG), FR-6 (PDF forward artifact).
**UX-DRs covered:** UX-DR19 (`/recruiter` route surface), UX-DR26 (forward-flow analytics events), UX-DR27 (OG unfurl verification).
**Preceded-by:** E1 (E2's OG scaffolding useful; not blocking).

### Story 4.1: Build `/recruiter` SSG route with `generateStaticParams` per slug

As a **recruiter clicking a forwarded URL**, I want **the `/recruiter` route to be statically generated per case-study slug with `generateStaticParams`, so the URL `?forward=1&case=<slug>` renders the correct first paint without a runtime query parse** (per amended AD-8 — recruiter-mode-aware HTML must be in the initial server-rendered HTML for Slack/Gmail unfurl).

**Acceptance Criteria:**
- **Given** `app/recruiter/page.tsx`, **When** I build, **Then** `generateStaticParams` returns one entry per published case-study slug. [Binds: amended AD-8]
- **And** the route's HTML on first paint contains: spine line + four proof vectors + status strip (Available · Remote-first · Open to relocation · Last updated YYYY-MM-DD) + recommended-case-study callout driven by `?case=<slug>`. [Binds: amended AD-8; UX-DR19]
- **And** the signature canvas renders with `mode="condensed-4-node-status"` using `--colors.live` (green) — visually distinct from every other page's violet. [Binds: AD-17; UX-DR19]
- **And** `app/recruiter/page.tsx` is a server component (no `"use client"` boundary); all client interactions are mounted as named components from the closed set. [Binds: AD-13]

### Story 4.2: Implement URL-first closing CTA (Copy URL primary, default focus)

As a **recruiter on `/recruiter`**, I want **the closing CTA to surface "Copy URL" as the primary affordance at the top of the closing CTA card with default focus on page load**, so that **the URL is the canonical share form (amended AD-14) and the forward action is the lowest-friction next step**.

**Acceptance Criteria:**
- **Given** `/recruiter`, **When** the page renders, **Then** the closing CTA card has "Copy URL" as the top link/button with `autoFocus` or `tabIndex=0` so it's the first interactive element on page load. [Binds: amended AD-14]
- **And** clicking "Copy URL" copies `https://sanjit.dev/recruiter?forward=1&case=<slug>` to the clipboard and emits a Plausible `forward_button_click` event. [Binds: UX-DR26; amended AD-14]
- **And** the URL-first affordance is implemented as a route-level link, not a modal — the `<ForwardModal>` client component is NOT used (per amended AD-14). [Binds: amended AD-14]

### Story 4.3: Implement `POST /api/forward-pdf` Puppeteer Node.js route (≥ 1769 MB, 60s maxDuration)

As a **recruiter clicking "Download PDF"**, I want **`POST /api/forward-pdf?case=<slug>` running on Node.js (≥ 1769 MB, 60s maxDuration) that uses Puppeteer + `@sparticuz/chromium` to render a single-page A4 PDF**, so that **the PDF visual fidelity matches the live `/recruiter` page (FR-6 / AD-7)**.

**Acceptance Criteria:**
- **Given** `POST /api/forward-pdf?case=wellbook`, **When** the route runs, **Then** Puppeteer navigates to `https://sanjit.dev/recruiter?forward=1&case=wellbook` and returns a single-page A4 PDF. [Binds: AD-7; AD-3 Node runtime]
- **And** the route is `export const runtime = 'nodejs'`, `export const maxDuration = 60`, and the function has ≥ 1769 MB memory allocated. [Binds: AD-3; AD-7]
- **And** cold-start budget is ≤ 4s (per AD-7). [Binds: AD-7]
- **And** the PDF includes: spine line + four proof vectors + one recommended case study + canonical site URL footer. [Binds: AD-7; addendum A.10]
- **And** the PDF is < 500 KB and opens in Preview / Chrome / Adobe with all content legible at A4 print scale. [Binds: FR-6]
- **And** the route is gated by Vercel plan tier ≥ Pro (audit in E2.8 confirms). [Binds: AD-7 + elicitation pre-mortem #4]

### Story 4.4: Implement mobile-touch-resilient fallback (Copy URL always visible; `window.print()` desktop-only)

As a **recruiter on a touch device**, I want **a touch-resilient fallback path that does NOT depend on `window.print()`**, so that **the forward action works on iPhone / iPad / Android, not just desktop (closes elicitation cascading failure surface #3)**.

**Acceptance Criteria:**
- **Given** `/recruiter`, **When** I view it on a touch device, **Then** "Copy URL" is always visible as the sole primary forward affordance, regardless of Puppeteer success. [Binds: elicitation cascading failure #3]
- **And** on desktop only, if Puppeteer fails, the secondary link mutates to "Print via browser" → `window.print()` using the route-resident print stylesheet. [Binds: AD-7; amended AD-14]
- **And** `window.print()` is NOT the only fallback path on touch devices (iOS Safari blocks programmatic print calls per the elicitation finding). [Binds: elicitation cascading failure #3]
- **And** the print stylesheet lives on the `/recruiter` route, not in a modal. [Binds: amended AD-14]

### Story 4.5: Implement `generateMetadata` with `searchParams`-driven OG image (1200×630)

As a **recruiter pasting the share URL into Slack/Gmail/LinkedIn**, I want **the OG unfurl preview to show a 1200×630 social card with the spine line + ≥1 proof number**, so that **the hiring manager sees the artifact cold without clicking (UJ-2 step 1)**.

**Acceptance Criteria:**
- **Given** `/recruiter?forward=1&case=wellbook`, **When** I paste the URL into Slack, **Then** the OG preview shows the forward-variant title, the spine line, and at least one proof number. [Binds: amended AD-14; UX-DR27]
- **And** `generateMetadata` reads `searchParams` at request time and sets `og:title`, `og:description` (spine line + four proof vectors), `og:image` (1200×630 social card). [Binds: amended AD-14]
- **And** the OG image is a generated SVG (or PNG) that fits the 1200×630 frame without clipping (visual regression test). [Binds: FR-5; UX-DR27]
- **And** the same content also populates Twitter Card metadata for cross-platform unfurl. [Binds: FR-5]

### Story 4.6: Implement recruiter summary card + role-fit cards + experience timeline (per `EXPERIENCE.md`)

As a **hiring manager scanning `/recruiter`**, I want **a hero summary card with avatar / name / role / meta / 2×2 stat grid, a 2×2 role-fit card grid with status badges (Strong fit / Partial / Open to), and an experience timeline**, so that **I can form a verdict in 60 seconds (UJ-2)**.

**Acceptance Criteria:**
- **Given** `/recruiter`, **When** I scroll past the hero, **Then** I see the recruiter summary card (`{components.card-focal}` with gradient square avatar + name + role + meta location/timezone + 2×2 stat grid). [Binds: UX-DR38]
- **And** a 2×2 role-fit grid renders with status badges in `--font-label`. [Binds: UX-DR37]
- **And** an experience timeline renders (Wellbook healthcare SaaS, Surakkha civic safety, Finlight fintech). [Binds: UX-DR19; `EXPERIENCE.md.Flow 2`]
- **And** the voice/tone rules from `EXPERIENCE.md.Voice and Tone` are honored (no marketing copy, no aspirational timestamps). [Binds: UX-DR29]

### Story 4.7: Wire "For recruiters?" footer link on every public page

As a **recruiter scanning any public page**, I want **a footer-level "For recruiters?" link on every page that routes me to `/recruiter`**, so that **the recruiter-mode affordance is a footer opt-in, not a header feature (amended AD-8)**.

**Acceptance Criteria:**
- **Given** any public route, **When** I scroll to the footer, **Then** "For recruiters?" appears as a plain HTML link (`<a href="/recruiter">`), no client JS. [Binds: amended AD-8]
- **And** no `<RecruiterModeToggle>`, `<RecruiterModeProvider>`, or `localStorage.for_recruiter` exists anywhere in the codebase. [Binds: amended AD-8]
- **And** the proxy.ts redirect from `/?for=recruiter*` to `/recruiter*` (Story 1.3) handles stale bookmarks.

### Story 4.8: Verify `EXPERIENCE.md.Flow 1` (Priya) + `Flow 2` (Marcus) end-to-end

As a **quality gate**, I want **end-to-end tests that exercise Priya's 30-second triage and Marcus's 60-second verdict**.

**Acceptance Criteria:**
- **Given** the build is complete, **When** Playwright executes Flow 1, **Then** Priya lands on `/` cold, sees spine line + four proof numbers within 1.2s, clicks "For recruiters?" in the footer, sees `/recruiter` with status strip + summary card, clicks "Copy URL" — clipboard contains the URL. [Binds: FR-1/2/3; UJ-1]
- **And** when Playwright executes Flow 2, Marcus clicks the forwarded URL, sees the recruiter summary, scrolls to role-fit cards, navigates via ⌘K to a case study, and sees the case-study's `Patterns cited` section linked correctly. [Binds: FR-4/5/8; UJ-2]

---

## Epic 5a: Currently Building Feed (Flow 4)

**Goal:** `GET /api/now` edge function reads from Upstash Redis `now` namespace; if KV returns no entries OR most-recent entry's `updated` is older than 7 days, returns `{ entries: <from /content/now-snapshot.json>, fallback: true, last_updated }` per AD-10 — never returns `{ entries: [] }` without `fallback: true`. `/now` ticker page renders the list with vertical `TickerRow` component (dot variants: `--colors.live` active / `--colors.accent` draft / `--colors.foreground-4` prior), `aria-live="polite" aria-relevant="additions"` per AD-20, honest empty state. `/now/feed.xml` exposes the feed as RSS/Atom with `Content-Type: application/atom+xml`. Homepage currently-building summary renders the latest ≤5 entries.

**Binds:** AD-2 (Upstash Redis namespaces, `now` only), AD-3 (edge runtime), AD-10 (stale-state fallback contract), AD-17 (activity-feed canvas mode), AD-20 (aria-live), FR-12 (snapshot cadence).
**FRs covered:** FR-10, FR-11, FR-15, FR-16, FR-17, FR-18.
**UX-DRs covered:** UX-DR22 (now page), UX-DR31 (ticker-row dot variants), UX-DR32 (form input on subscribe form).
**Preceded-by:** E1, E2.

### Story 5a.1: Set up Upstash Redis via Vercel Marketplace with `now` namespace

As a **deploy owner**, I want **Upstash Redis via Vercel Marketplace configured with exactly two namespaces (`now` for currently-building entries, `contact` for contact-form queue)**, so that **AD-2's closed KV namespace list holds — adding any namespace requires a spine amendment**.

**Acceptance Criteria:**
- **Given** a Vercel deploy, **When** I inspect the Upstash Redis binding, **Then** the only namespaces in use are `now` and `contact`. [Binds: AD-2]
- **And** no Vercel KV is used (retired December 2024 — pitfall #1). [Binds: pitfall #1]
- **And** the KV client (`lib/server/kv.ts`) is server-only (`import "server-only"`) and exposes typed methods for `now` namespace. [Binds: AD-2; spine conventions]

### Story 5a.2: Implement canonical payload contract — `{ entries, fallback, last_updated }`

As a **`GET /api/now` consumer**, I want **the handler to return the canonical payload `{ entries: <array>, fallback: <bool>, last_updated: <ISO> }`** with the rule that it NEVER returns `{ entries: [] }` without also returning `fallback: true`, so that **consumers can render an honest "(last updated N days ago)" tag instead of an empty state (AD-10 / FR-17)**.

**Acceptance Criteria:**
- **Given** KV returns no entries, **When** the handler runs, **Then** it returns `{ entries: <from /content/now-snapshot.json>, fallback: true, last_updated: <ISO from snapshot> }`. [Binds: AD-10]
- **And** given KV returns entries with most-recent `updated` > 7 days old, the handler returns `fallback: true` with the snapshot's entries. [Binds: AD-10; FR-17]
- **And** given KV returns fresh entries, the handler returns `{ entries: <from KV>, fallback: false, last_updated: max(entries[].updated) }`. [Binds: AD-10]
- **And** an integration test stubs KV to return empty and asserts the feed renders the snapshot with the honest tag (no empty state, no error). [Binds: FR-17]

### Story 5a.3: Implement `now-snapshot.json` commit cadence (every 15 minutes, KV-derived only)

As a **site owner**, I want **a GitHub Action in `sanjit-content` that runs every 15 minutes, reads the latest KV state, and commits `now-snapshot.json`**, so that **AD-10's snapshot is always KV-derived, never hand-edited, and AD-2's KV ↔ content ownership model holds**.

**Acceptance Criteria:**
- **Given** the GitHub Action runs every 15 minutes, **When** it executes, **Then** it reads from Upstash Redis `now` namespace and commits `now-snapshot.json` to `sanjit-content/main` if the content has changed. [Binds: AD-10]
- **And** no serverless function pushes to the content repo (the snapshot commit is owned by the Action). [Binds: AD-10]
- **And** the snapshot shape is canonical: `{ entries: Entry[], last_updated: ISO8601 }` where `last_updated = max(entries[].updated)`. [Binds: AD-2]
- **And** the currently-building entry shape is canonical: `{ id, title, body_md, updated }`. [Binds: AD-2]

### Story 5a.4: Implement `/now` page with vertical ticker + aria-live + honest empty state

As a **visitor on `/now`**, I want **the page to render the live feed as a vertical ticker with `aria-live="polite" aria-relevant="additions"`, an honest empty state when nothing's active, and the v4 hero microcopy ("right now." with gradient-text climax fragment)**, so that **the feed never errors, screen readers announce new entries, and the empty state doesn't pretend there's content**.

**Acceptance Criteria:**
- **Given** `/now`, **When** I load it, **Then** the hero reads "right now." with `--gradient-text` climax fragment. [Binds: UX-DR22, UX-DR29]
- **And** the ticker list renders as vertical rows with `<TickerRow>` (border-bottom 1px, padding `1.75rem 0`, dot variants `--colors.live` active / `--colors.accent` draft / `--colors.foreground-4` prior). [Binds: UX-DR22, UX-DR31]
- **And** `<ul aria-live="polite" aria-relevant="additions">` wraps the ticker list — new entries announce; existing entries don't re-announce. [Binds: AD-20]
- **And** when `fallback === true`, the page renders the visible tag "(last updated N days ago)" + the honest empty state "Nothing new this week. — actually nothing." when no entries exist. [Binds: FR-17; UX-DR22, UX-DR29]
- **And** the signature canvas renders with `mode="activity-feed"` (per AD-17 `/now` assignment) at `xl ≥ 1280px`. [Binds: AD-17]

### Story 5a.5: Implement `/now/feed.xml` RSS/Atom feed

As a **visitor subscribing to the feed**, I want **`/now/feed.xml` to expose the currently-building feed as RSS / Atom with `Content-Type: application/atom+xml`**, so that **subscribers get quiet notifications on every update (FR-18)**.

**Acceptance Criteria:**
- **Given** `/now/feed.xml`, **When** I fetch it, **Then** the response is `Content-Type: application/atom+xml` and contains the latest currently-building entries. [Binds: FR-18]
- **And** the feed includes entry metadata: title, link, updated timestamp, summary. [Binds: FR-18]
- **And** the signature canvas is NOT rendered on this route (no canvas per AD-17). [Binds: AD-17]
- **And** the feed revalidates on the same cadence as `/now` (KV → snapshot → revalidateTag('now', 'max')). [Binds: AD-10]

### Story 5a.6: Implement homepage currently-building summary (≤5 latest entries)

As a **recruiter scanning the homepage**, I want **a small currently-building section with the latest 3–5 entries from the feed**, so that **the homepage tells the story of what Sanjit is shipping right now (FR-16)**.

**Acceptance Criteria:**
- **Given** the homepage `/`, **When** I scroll past the hero, **Then** a "Currently Building" section renders the latest ≤5 entries from `/api/now`. [Binds: FR-16]
- **And** the section renders the entries by `updated` timestamp (newest first). [Binds: FR-16]
- **And** when `fallback === true`, the section renders the same honest `(last updated N days ago)` tag. [Binds: AD-10]

### Story 5a.7: Implement subscribe form (v4 stub — no real backend, no error state, no render block)

As a **visitor on `/now`**, I want **a subscribe form (email input + submit button) below the ticker**, so that **the affordance is present even though the v4 submit handler is a no-op stub**.

**Acceptance Criteria:**
- **Given** the `/now` page, **When** I scroll to the subscribe card, **Then** the email input renders with `--bg-3` fill, `--border` border, `--rounded-sm` corner; focus state shows `--accent` border + 2px `--accent` outline at 4px offset. [Binds: UX-DR32]
- **And** the submit handler is a no-op `addEventListener` stub — no real backend, no error state, no render block. [Binds: `EXPERIENCE.md.State Patterns`]
- **And** the form has `aria-label` on the submit button (icon-only labeling pattern). [Binds: AD-20]

---

## Epic 5b: Architecture Diagram, the Built Page, and Lab + About + 404

**Goal:** `/built` page with two-scale architecture diagram (big hero right column `{components.card-focal}` + small 240×240 signature canvas with `layered-architecture` mode + `--accent-2` cyan) and a build-time assertion that the 7-layer enumeration matches across the four representations (companion file / big SVG / signature canvas / layer table). Layer table 01-07 with `<LayerRowHover>` row-hover-sync. Stack cards + Decisions section + Receipt terminal-style page-weight table. `/lab` index + `/lab/[slug>` with experiment-graph canvas mode using `--accent-3` (pink); both pages use the same canvas mode. `/about` with `timeline` canvas mode + personality card 3×2 grid. `/404` (`not-found.tsx`) canvas-less, still carries spine-line variant + proof number + return path per amended AD-12.

**Binds:** AD-6 (live architecture diagram), AD-17 (layered-architecture + experiment-graph + timeline modes), amended AD-12 special-case + drift closure.
**FRs covered:** FR-10, FR-11.
**UX-DRs covered:** UX-DR17 (architecture diagram big version), UX-DR18 (layer table), UX-DR23 (lab index + slug), UX-DR24 (built page), UX-DR25 (404), UX-DR36 (personality card).
**Preceded-by:** E1, E2 (E2's plan-tier audit covers Puppeteer route memory; not directly blocking for E5b but valuable for E4).

### Story 5b.1: Implement `<ArchitectureDiagram>` (big version) on `/built` hero right column

As a **visitor on `/built`**, I want **the hero to show a big architecture diagram (7 layers) in the right column, with a "Live" indicator (live green dot, pulsing) and "7 layers" counter**, so that **the meta-architecture surface lands as a focal card with the same identity as the signature canvas**.

**Acceptance Criteria:**
- **Given** `/built`, **When** I load it, **Then** the hero is two-column: left = spine ("Walked into the build notes anyway." with `--gradient-text` title), right = `<ArchitectureDiagram>` in `{components.card-focal}` rendering a full 7-layer SVG. [Binds: UX-DR24, UX-DR17]
- **And** the diagram shows a "Live" indicator (live green dot, pulsing) and a counter "7 layers". [Binds: UX-DR17]
- **And** the signature canvas renders with `mode="layered-architecture"` using `--accent-2` (cyan) at `xl ≥ 1280px`. [Binds: AD-17]
- **And** the HTML contains `data-sig-canvas-mode="layered-architecture"` per AD-12 special case. [Binds: amended AD-12]

### Story 5b.2: Implement `<LayerTable>` with 7 rows + `<LayerRowHover>` row-hover-sync

As a **visitor on `/built`**, I want **a numbered layer table (01-07) where hovering a row pulses the corresponding node in BOTH the big hero diagram AND the small signature canvas**, so that **the four representations of the 7-layer architecture stay perceptually connected**.

**Acceptance Criteria:**
- **Given** `/built`, **When** I scroll to "01 / Layers", **Then** 7 numbered rows render: AD-13 (now), AD-14 (recruiter-route forward flow), AD-17 (signature canvas), AD-18 (design tokens), AD-19 (breakpoints), AD-20 (a11y floor), AD-1 (content). [Binds: AD-6 canonical layer list; UX-DR18]
- **And** `<LayerRowHover>` is mounted; hovering a row pulses the corresponding `.arch-node` in BOTH the big hero diagram and the signature canvas small version. [Binds: UX-DR8, UX-DR17]
- **And** `prefers-reduced-motion` short-circuits the class swap; pointer listeners are gated by `pointer:fine` implicitly. [Binds: AD-16 motion discipline]

### Story 5b.3: Implement 7-layer enumeration consistency assertion (closes elicitation cascading failure surface #2)

As a **build pipeline**, I want **a build-time assertion that the 7-layer enumeration matches across `architecture-diagrams.md`, the big-version SVG, the signature-canvas small-version SVG, and the layer-table rows**, so that **the four representations cannot drift silently (closes elicitation cascading failure surface #2 — spine-amendment deferred item)**.

**Acceptance Criteria:**
- **Given** a CI run, **When** the consistency check runs, **Then** it asserts that the 4 representations enumerate the same 7 layers in the same order. [Binds: elicitation cascading failure #2]
- **And** the build fails with a per-source diff if any enumeration drifts. [Binds: elicitation cascading failure #2]
- **And** the check runs in `.github/workflows/ci.yml` alongside the other route-invariant checks. [Binds: AD-12]

### Story 5b.4: Implement Stack cards + Decisions section + Receipt page-weight table

As a **visitor on `/built`**, I want **stack cards explaining each layer, a Decisions section explaining why no SPA framework / no icon library / no build step, and a Receipt terminal-style page-weight table**, so that **the page reads like a real engineering writeup, not a marketing surface**.

**Acceptance Criteria:**
- **Given** `/built`, **When** I scroll to "02 / Stack cards", **Then** 6+ cards explain each architectural layer (what it is, why this choice, what it cost). [Binds: UX-DR24]
- **And** the "03 / Decisions" section explains: why no SPA framework (perf budget, closed design system), why no icon library (SVG only), why no build step (decisions live in architecture, not in pipeline). [Binds: UX-DR24]
- **And** the "04 / Receipt" section is a fake terminal-style "page weight" table showing the homepage's total weight (target ≤ 100 KB gzipped) with realistic numbers. [Binds: UX-DR24]

### Story 5b.5: Implement `/lab` index page (production / experiment / personal categorization)

As a **visitor exploring `/lab`**, I want **the lab index to surface the 5+ lab tools categorized by Production / Experiment / Personal, with the `experiment-graph` signature canvas and `--accent-3` (pink) accent**, so that **the lab surface reads as a coherent engineering playground, distinct from Work**.

**Acceptance Criteria:**
- **Given** `/lab`, **When** I load it, **Then** the lab tools render grouped by category, each with `title`, `summary`, and `status_label`. [Binds: UX-DR23]
- **And** the signature canvas renders with `mode="experiment-graph"` using `--accent-3` (pink) at `xl ≥ 1280px`. [Binds: AD-17]
- **And** the page passes the CI route-invariant (spine-line variant "the gap annoyed me." + ≥1 proof number + return path). [Binds: amended AD-12]

### Story 5b.6: Implement `/about` page with timeline canvas mode + personality card grid

As a **visitor on `/about`**, I want **the page to render Sanjit's bio, experience timeline, philosophy, and a 3×2 personality card grid**, so that **the about surface reads as a coherent narrative with the same visual identity as the rest of the site**.

**Acceptance Criteria:**
- **Given** `/about`, **When** I load it, **Then** the page renders bio + experience timeline + philosophy + a 3×2 personality card grid. [Binds: UX-DR36]
- **And** the signature canvas renders with `mode="timeline"` (5 vertical nodes) at `xl ≥ 1280px`. [Binds: AD-17]
- **And** `cv.md` is the single source of truth — no KV mirror (AD-2). [Binds: AD-2]
- **And** the page passes the CI route-invariant (spine-line variant + ≥1 proof number + return path). [Binds: amended AD-12]

### Story 5b.7: Implement `/404` (`not-found.tsx`) — canvas-less, still meets route-invariant

As a **visitor hitting a missing URL**, I want **the 404 page to be honest about the missing state, carry the spine-line variant + ≥1 proof number + return path, and have NO signature canvas (the empty slot visually signals "lost")**, so that **the page meets the route-invariant and the missing-state UX is intentional**.

**Acceptance Criteria:**
- **Given** a URL that returns 404, **When** I view the page, **Then** the spine-line variant "right now." (with an honest empty-state reading) + ≥1 proof number + `href="/"` return path are present in the HTML. [Binds: amended AD-12]
- **And** no `<SignatureCanvas>` is rendered (canvas-less per AD-17). [Binds: AD-17]
- **And** the CI route-invariant assertion passes for `/404`. [Binds: amended AD-12]

---

## Document completion

**Tally:**
- **6 epics** (E1, E2, E3, E4, E5a, E5b)
- **47 stories** across the 6 epics
- **All 22 FRs covered** (FR Coverage Map)
- **All 20 ADs bound** (every epic lists its ADs)
- **All 43 UX-DRs attributed** (each UX-DR appears in at least one story's AC list)
- **3 spine-amendment items preserved as deferred** (AD-4 move-id validation, AD-6/12 7-layer drift, E4 mobile fallback) — per AD-16, these are reviewer findings, not silent spine amendments

### UX-DR attribution audit (every UX-DR must be in at least one AC)

| UX-DR | Story |
|---|---|
| UX-DR1 (SignatureCanvas) | 1.6 |
| UX-DR2 (CommandPalette) | 1.6 |
| UX-DR3 (MagneticCTA) | 1.6, 1.8 |
| UX-DR4 (ScrollProgress) | 1.7 |
| UX-DR5 (SkipToContent) | 1.9 |
| UX-DR6 (NavCurrent) | 1.7 |
| UX-DR7 (FilterChipGroup) | 1.6 |
| UX-DR8 (LayerRowHover) | 1.6, 5b.2 |
| UX-DR9 (AnalyticsBeacon) | 1.6, 1.9 |
| UX-DR10 (ErrorBeacon) | 1.6, 1.9 |
| UX-DR11 (design tokens) | 1.5 |
| UX-DR12 (breakpoints) | 1.5, 1.7 |
| UX-DR13 (Nav) | 1.7 |
| UX-DR14 (Hero) | 1.8 |
| UX-DR15 (ProofVectorCluster) | 1.8, 3.4 |
| UX-DR16 (PatternsCited) | 3.3 |
| UX-DR17 (ArchitectureDiagram big) | 5b.1 |
| UX-DR18 (LayerTable) | 5b.2 |
| UX-DR19 (`/recruiter` route) | 4.1 |
| UX-DR20 (pattern index) | 3.2 |
| UX-DR21 (pattern page) | 2.7, 3.1 |
| UX-DR22 (`/now` page) | 5a.4 |
| UX-DR23 (lab index + slug) | 3.5, 5b.5 |
| UX-DR24 (built page) | 5b.1, 5b.4 |
| UX-DR25 (404) | 5b.7 |
| UX-DR26 (forward-flow analytics) | 1.6, 4.2 |
| UX-DR27 (OG unfurl verification) | 4.5 |
| UX-DR28 (Hero magnetic CTA climax on `/built`) | 5b.1 |
| UX-DR29 (voice + tone) | 1.8, 3.5, 4.6, 5a.4 |
| UX-DR30 (breadcrumb) | 1.7 |
| UX-DR31 (ticker-row dot variants) | 5a.4 |
| UX-DR32 (form input on subscribe) | 5a.7 |
| UX-DR33 (card hover pattern) | 1.5 (token set), 4.6 (recruiter cards) |
| UX-DR34 (button styles) | 1.5 (token set), 1.8, 4.2 |
| UX-DR35 (sticky TOC on case study) | 3.4 |
| UX-DR36 (personality card) | 5b.6 |
| UX-DR37 (role-fit card) | 4.6 |
| UX-DR38 (recruiter summary card) | 4.6 |
| UX-DR39 (gradient discipline) | 1.5, 1.8 |
| UX-DR40 (color discipline) | 1.5 |
| UX-DR41 (typography discipline) | 1.5 |
| UX-DR42 (shape discipline) | 1.5 |
| UX-DR43 (elevation hierarchy) | 1.5 |

**Result:** every UX-DR has at least one story attribution. No orphan UX-DRs.



### Epic 1: Scaffold and Ship the Spine

Stand up the Next.js 16 + Vercel scaffold with the closed design system, cross-cutting CI gates, persistent nav, signature canvas, command palette, magnetic CTA, scroll progress, skip-to-content, nav-current, filter chip group, analytics beacon, and error beacon. E1's "done" gates on preview-environment test harnesses for `<FilterChipGroup>` and `<LayerRowHover>` even though they aren't yet mounted in user-facing pages (Pre-mortem strengthening: prevents E3 / E5 from regressing the closed design system after they start). Every other epic compiles against the closed sets in AD-13/15/17/18/19/20.

**FRs covered:** FR-1, FR-19, FR-20, FR-21, FR-22
**ADs bound:** AD-11, AD-12, AD-13, AD-15, AD-16, AD-17 (canvas surface), AD-18, AD-19, AD-20
**UX-DRs:** UX-DR1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/30/33/34/39/40/41/42/43

### Epic 2: Content Schema, Two-Repo Read Path, and a Move-Tagged Pattern Stub

Wire the additive Zod 4 content schema (`.partial({title:true}) + .passthrough()`), the `sanjit-content` shallow-clone read path, ISR with `revalidateTag(tag, 'max')`, the `POST /api/revalidate` edge handler, the 5-minute TTL fallback, and the content audit workflow. Drafts pass without breaking the build; published entries fail the build with a per-file diagnostic. Pre-publish a move-tagged pattern stub into `sanjit-content` so case-study citations in E3 have a real target. Audit the Vercel plan tier's memory budget during E2 so E4's Puppeteer route doesn't surprise-deploy on Hobby.

**FRs covered:** FR-12, FR-13, FR-14, FR-11 (route-specific OG metadata scaffolding)
**ADs bound:** AD-1, AD-5, AD-9
**Preceded-by:** none (E1 must ship first)
**Followed-by:** E3, E4, E5a (E3 reads `lib/content/pattern.ts` + `lib/content/case-study.ts`; E4 reads `lib/meta.ts` for OG scaffolding; E5a reads `lib/content/now.ts`)

### Epic 3: Patterns → Case Studies (sequenced internally)

Publish all 5 patterns at stable `/patterns/<slug>` URLs with native `<h2 id="move-{N}">` deep-linkable moves + visually distinct counter-line blocks, plus the pattern index page. Only after the pattern pages exist, ship the case-study pages with "Patterns cited" cards linking to `/patterns/<slug>#move-{N}` (default `move-1`, overridable via `pattern_moves`). Sticky TOC on case studies. ≥3 case studies to launch; ≥5 Lab tools categorized Production / Experiment / Personal. Internal sequencing constraint: patterns ship before case studies within this epic.

**FRs covered:** FR-7, FR-8, FR-9, FR-10, FR-11 (page-specific OG)
**ADs bound:** AD-4, AD-17 (decision-graph + section-progress modes)
**UX-DRs:** UX-DR16, UX-DR20, UX-DR21, UX-DR35
**Preceded-by:** E1, E2 (case studies need the content reader + Zod schema; case-study citations need the move-tagged pattern stub from E2)

### Epic 4: The `/recruiter` Route, the PDF, and the OG Unfurl

Build the `/recruiter` SSG route with `generateStaticParams` per slug. URL-first affordance hierarchy (Copy URL primary at top of closing CTA, default focus) + secondary Download PDF link to `/api/forward-pdf?case=<slug>`. Puppeteer + `@sparticuz/chromium` Node.js function (≥ 1769 MB memory, 60s maxDuration); document the Vercel plan tier requirement (Hobby not sufficient); mobile-touch fallback path that does NOT depend on `window.print()`. Window.print() is acceptable on desktop only; touch users see "Copy URL" as the sole forward action. Puppeteer-failure on desktop mutates the secondary link to "Print via browser" → `window.print()` using route-resident print stylesheet. 1200×630 OG unfurl with spine line + ≥1 proof number. `/recruiter` signature canvas uses `--colors.live` (green). This is the only epic that directly drives SM-1.

**FRs covered:** FR-3, FR-4, FR-5, FR-6
**ADs bound:** AD-3, AD-7, AD-8, AD-14, AD-15 (Dialog reserved)
**UX-DRs:** UX-DR19, UX-DR26, UX-DR27
**Preceded-by:** E1 (E2's OG scaffolding useful; not blocking)

### Epic 5a: Currently Building Feed (Flow 4)

`GET /api/now` edge function reads from Upstash Redis `now` namespace; if KV returns no entries OR most-recent entry's `updated` is older than 7 days, returns `{ entries: <from /content/now-snapshot.json>, fallback: true, last_updated }` per AD-10 — never returns `{ entries: [] }` without `fallback: true`. Consumers (homepage + `/now`) render `(last updated N days ago)` tag when `fallback` is true. `/now` ticker page renders the list with vertical `TickerRow` component (dot variants: `--colors.live` active / `--colors.accent` draft / `--colors.foreground-4` prior), `aria-live="polite" aria-relevant="additions"` per AD-20, honest empty state "Nothing new this week. — actually nothing." `/now/feed.xml` exposes the feed as RSS/Atom with `Content-Type: application/atom+xml`. Homepage currently-building summary renders the latest ≤5 entries.

**FRs covered:** FR-10, FR-11, FR-15, FR-16, FR-17, FR-18
**ADs bound:** AD-2, AD-3, AD-10, AD-17 (activity-feed mode), AD-20 (aria-live), FR-12 (snapshot cadence)
**UX-DRs:** UX-DR22, UX-DR31, UX-DR32
**Preceded-by:** E1, E2

### Epic 5b: Architecture Diagram, the Built Page, and Lab + About + 404

`/built` page with two-scale architecture diagram: big-version (hero right column `{components.card-focal}`) + small-version (240×240 signature canvas, `layered-architecture` mode with `--accent-2` cyan). Build-time assertion that the 7-layer enumeration matches across companion file / big SVG / signature canvas small SVG / layer table rows — closes the drift amplifier between the two scales (AD-12 only checks for the mode-id string; this closes the gap). HTML asserts `data-sig-canvas-mode="layered-architecture"` per AD-12 special case. Layer table 01-07 with `<LayerRowHover>` row-hover-sync to both diagram scales. Stack cards + Decisions section + Receipt terminal-style page-weight table. `/lab` index + `/lab/[slug]` with experiment-graph canvas mode using `--accent-3` (pink); both pages use the same canvas mode. `/about` with `timeline` canvas mode + personality card 3×2 grid. `/404` (`not-found.tsx`) canvas-less, still carries spine-line variant + proof number + return path per amended AD-12.

**FRs covered:** FR-10, FR-11
**ADs bound:** AD-6, AD-17 (layered-architecture + experiment-graph + timeline modes), AD-12 special-case + drift closure
**UX-DRs:** UX-DR17, UX-DR18, UX-DR23, UX-DR24, UX-DR25, UX-DR36
**Preceded-by:** E1, E2 (E2's plan-tier audit covers Puppeteer route memory; not directly blocking for E5b but valuable for E4)

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
