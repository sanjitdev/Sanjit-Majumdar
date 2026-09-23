---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-Sanjit-Majumdar-2026-09-23/prd.md
  - _bmad-output/planning-artifacts/prds/prd-Sanjit-Majumdar-2026-09-23/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/EXPERIENCE.md
  - _bmad-output/specs/spec-sanjit-portfolio/SPEC.md
  - AGENTS.md
---

# Sanjit-Majumdar - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sanjit-Majumdar, decomposing the requirements from the PRD, Architecture spine v5 (`amended_for: v4-ux`, 20 ADs, status: final), UX Design contract (DESIGN + EXPERIENCE, v4 final), and the SPEC kernel contract into implementable stories. The Architecture spine is binding — the 20 ADs (9 carryovers + 7 amended + 4 new) constrain every story; the v4 UI/UX decisions are binding rules the framework (Next.js 16.3.6+, React 19.2+, Tailwind v4, Zod 4, MDX 3) must implement, not a separate product.

**v4-ux implementation reconciliation:** the v4 UX spine (`EXPERIENCE.md` line 24) describes the surface as "static HTML, one file per route, inline CSS + minimal vanilla JS, no build step." The Architecture spine (binding) enforces Next.js 16 RSC + Turbopack + Tailwind v4 `@theme` block + a closed 10-component client set (AD-13). The 9-route IA, 9-mode signature canvas, 57-token design system, 4 breakpoints, and accessibility floor are v4 decisions that MUST be honored; their IMPLEMENTATION runs through Next.js RSC, not raw HTML. Every UX-DR below is binding as a behavioral rule; the stack choice is binding as AD-3.

**Trim policy:** NFRs are inherited into story-level acceptance criteria during epic design (step-02); they are not standalone epics. ADs that are pure restatements of FRs are folded into the corresponding FR. UX-DRs that duplicate binding source material (DESIGN.md, AD-18, AD-19, AD-20) are compressed to pointers. Items that don't bind to a buildable surface are dropped.

## Requirements Inventory

### Functional Requirements

```
FR-1: Persistent positioning header on every public route
      (brand mark + positioning variant of spine line + minimal nav; ≤ 8 KB gzipped; renders within 200ms first paint on Slow 4G mobile; static-analysis-asserted present on every route)

FR-2: Homepage hero with spine line and four proof numbers
      (spine line verbatim + four proof numbers as tight cluster + positioning line; rendered by the homepage route; static-analysis-asserted)

FR-3: Recruiter-mode is a route at /recruiter (RESHAPED by amended AD-8)
      (footer-level opt-in link on every page; no client toggle, no RecruiterModeToggle, no localStorage; signature canvas uses --colors.live)

FR-4: Forward-to-hiring-manager is route-level (RESHAPED by amended AD-14)
      (canonical URL https://sanjit.dev/recruiter?forward=1&case=<slug>; Copy URL primary, Download PDF secondary, Print via browser fallback on Puppeteer failure; no modal)

FR-5: Shareable recruiter-mode URL renders cold
      (incognito with no cookies renders the full artifact; OG/Twitter/Slack metadata contains spine line + ≥1 proof number; 1200×630 social-card frame without clipping; generateMetadata reads searchParams to set og:image)

FR-6: PDF forward artifact via Puppeteer
      (server-side at POST /api/forward-pdf?case=<slug> per amended AD-7; navigates to /recruiter?forward=1&case=<slug>; single-page A4; < 500 KB; < 5s generation; legible in Preview/Chrome/Adobe)

FR-7: Five named patterns at stable URLs
      (Canonical Model, Syncfusion Data-Grid, nopCommerce Plugin, Ship-Faster Pushback, Friday Architecture Review at /patterns/<slug>; each renders setup + 2-5 moves + counter-lines + annotation; Ship-Faster Pushback carries verbatim quote at #move-4)

FR-8: Pattern deep-linkability (carries amended AD-4 heading-ID contract)
      (<h2 id="move-{N}"> for each move, 1-indexed lowercase kebab; <h2 id="when-not"> for counter-line; case-study pattern citations deep-link to /patterns/<slug>#move-{N}; other heading ids are the MDX layer's responsibility)

FR-9: Pattern index page at /patterns
      (lists five patterns as cards with one_line + Read the full opening link; signature canvas mode: decision-graph with collapsed nodes)

FR-10: Spine-line + proof-number + return-path route invariant (EXPANDED by amended AD-12)
      (every public route contains spine-line variant + ≥1 proof number from {7+, 10K+, 35%, 22h, 1.2M, −68%, 7-person, 6, 8+ years} + return path href="/"; /built additionally asserts data-sig-canvas-mode="layered-architecture"; /recruiter, /built, 404 in scope; CI-enforced via audit:routes)

FR-11: Per-route Open Graph metadata
      (each route's metadata title/description/image reflects the route's content; covered by generateMetadata per route + FR-5 for /recruiter; surfaced as a per-route story AC)

FR-12: Content source in a separate repo
      (sanjit-content separate repo; webhook from push/delete/force-push calls POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]; revalidateTag(tag, 'max'); < 30s from push, < 5s from webhook delivery; 5-minute TTL fallback for webhook delivery failure; build pipeline does not run on content edits)

FR-13: Additive content schema
      (Zod 4.6+ with .partial() + .passthrough(); every field except title optional; unknown keys preserved via entry.meta; pattern citation walker walks only status: published entries)

FR-14: Stale-state fallback contract (folded from FR-17)
      (GET /api/now returns { entries, fallback, last_updated }; 7-day gate per-entry; consumers render (last updated N days ago) tag when fallback is true; never empty without fallback:true; snapshot committed every 15 min by GitHub Action in sanjit-content; no serverless function pushes to content repo)

FR-15: /now page with live feed
      (currently-building entries from Upstash Redis per amended AD-2; reachable from main nav and homepage; aria-live="polite" aria-relevant="additions" on the ticker list per AD-20)

FR-16: Currently-building homepage section
      (latest 3-5 entries by updated timestamp; rendered by the homepage route)

FR-17: RSS / Atom feed at /now/feed.xml
      (200 with Content-Type: application/atom+xml; latest currently-building entries; no signature canvas per amended AD-17)

FR-18: Performance CI gates (folded from FR-19, FR-20, FR-21)
      (homepage LCP < 1.8s on Slow 4G mobile; total homepage transfer < 100 KB gzipped; any other route < 200 KB gzipped; Lighthouse Performance ≥ 95 on mobile profile; no third-party JS on first paint; deferred loads via next/script strategy="lazyOnload"; CSP via SRI per amended AD-11; CI-enforced via Lighthouse CI + audit:budget + audit:routes)

FR-19: Accessibility floor (CI-asserted via pa11y-ci per AD-20)
      (WCAG 2.1 AA; semantic landmarks on every public route; skip-to-content as first focusable element; role="dialog" aria-modal="true" aria-labelledby on command palette; aria-current="page" on active nav; aria-hidden="true" on signature canvas and gradient hairlines; aria-label on every icon-only button; aria-pressed on filter chips; aria-live="polite" aria-relevant="additions" on NOW ticker + command palette listbox; aria-live="polite" on recruiter ?case= callout; prefers-reduced-motion site-wide; pointer:fine AND NOT prefers-reduced-motion gates magnetic CTA; touch targets ≥ 44px on mobile; color contrast #FAFAFA on #06070B ≈ 19:1)

FR-20: Two-repo topology + AGENTS.md mirror scope
      (sanjit-portfolio is the code repo; sanjit-content holds all content; content-side AGENTS.md mirror scoped to AD-1, AD-2, AD-5, AD-9, AD-10, frontmatter shape, ISR tag enum only — AD-13/17/18/19/20 are explicitly excluded; enforced by AGENTS.md managed block)

FR-21: Contact form (forward-to-hiring-manager email path)
      (Resend email via serverless function; Cloudflare Turnstile bot protection + honeypot; API key in Vercel env vars only; no secrets in content; structured JSON logging { request_id, route, duration_ms, status }; errors shape { error: { code, message, request_id } })

FR-22: Operational topology + observability
      (Plausible analytics deferred via next/script strategy="lazyOnload" with custom events forward_button_click, recruiter_route_enter, pattern_deep_link_visit, case_study_forward_open; Sentry deferred; Vercel Speed Insights for perf regression; proxy.ts at project root — no CSP injection; CDN-served SSG/ISR routes; edge runtime for /api/now + /api/revalidate; Node.js runtime ≥1769 MB for /api/forward-pdf)
```

### NonFunctional Requirements

*NFRs are not surfaced as standalone epics; they are inherited into story-level acceptance criteria during epic design (step-02). The binding NFR source is unchanged in `prd.md` §10 and `addendum.md` §A.8. The closed accessibility floor (NFR-A) is binding per AD-20 and surfaces as FR-19. The closed performance budget (NFR-P) is binding per AD-11, AD-12, AD-13, AD-19 and surfaces as FR-18.*

### Additional Requirements

These come from the Architecture spine v5 (20 ADs). Items restated in FRs are folded; load-bearing items get full bullets.

```
- [AD-3, serverless endpoint closed list] GET /api/now (edge) · POST /api/forward-pdf (Node.js, maxDuration=60, ≥1769 MB) · POST /api/revalidate (edge). Adding any endpoint requires a spine amendment.

- [AD-4 AMENDED] Pattern citation walker walks only status: published entries; pattern page renders signature-canvas decision-graph mode with M1..Mn numbered moves via native HTML heading IDs (#move-{N} form, 1-indexed lowercase); counter-line is <h2 id="when-not">.

- [AD-6 AMENDED] Live architecture diagram sync: /built renders the same diagram at two scales (hero big + signature-canvas small); co-sources architecture-diagrams.md companion AND DESIGN.md.components.sig-canvas.modes; 7-layer enumeration refreshed when ADs are added; <LayerRowHover> provides hover-sync; CI asserts data-sig-canvas-mode="layered-architecture".

- [AD-7 CARRYOVER amended] Forward-PDF at POST /api/forward-pdf?case=<slug>; navigates to /recruiter?forward=1&case=<slug> per AD-14 URL contract; Node.js runtime @sparticuz/chromium ≥1769 MB; 4s cold-start budget; on failure the /recruiter link mutates into Print via browser that triggers window.print() on the /recruiter route.

- [AD-8 AMENDED, MOST CONSEQUENTIAL] Recruiter-mode is a ROUTE not a client state: app/recruiter/page.tsx is SSG; no <RecruiterModeProvider>, no <RecruiterModeToggle>, no localStorage; ?for=recruiter maps to /recruiter (canonical share form for forward artifact); footer-level For recruiters? opt-in link on every page; signature canvas uses --colors.live (green); proxy.ts issues 308 redirect from /?for=recruiter* to /recruiter* preserving query params.

- [AD-11 CARRYOVER] Strict CSP via SRI: experimental.sri: { algorithm: 'sha256' } in next.config.js; default-src 'self'; script-src 'self' https://plausible.io; style-src 'self' (no unsafe-inline needed); nonce path explicitly rejected (forces dynamic rendering, conflicts with AD-13).

- [AD-13 AMENDED, MOST CONSEQUENTIAL] Closed client-component set (10 components): SignatureCanvas, ScrollProgress, CommandPalette, MagneticCTA, LayerRowHover, SkipToContent, NavCurrent, FilterChipGroup, AnalyticsBeacon, ErrorBeacon. REMOVED: RecruiterModeToggle, ForwardModal, PatternAnchorScroller, LabToolIframeLoader. No layout-level "use client" boundary. No global client provider. Adding any new client component requires spine amendment.

- [AD-14 REWRITTEN, MOST CONSEQUENTIAL] Forward flow is route-level: canonical URL https://sanjit.dev/recruiter?forward=1&case=<slug>; /recruiter is SSG with generateStaticParams per slug; generateMetadata reads searchParams to set og:title/og:description/og:image (1200×630); primary affordance is Copy URL link; secondary is Download PDF link to /api/forward-pdf?case=<slug>; on Puppeteer failure the link mutates into Print via browser (window.print() on /recruiter); recruiter signature canvas uses --colors.live (green).

- [AD-15 CARRYOVER] shadcn/ui closed scope: exactly Dialog, Toggle, Tooltip (Dialog still ships in components/ui/ for future use even though ForwardModal is gone per AD-13).

- [AD-16 AMENDED] Motion discipline reviewer contract: 10-row motion surface table with explicit prefers-reduced-motion and pointer:fine gates per surface (magnetic CTA, sigFlow dash-offset, scroll-progress transform, command-palette scrim fade, layer-row hover-sync, filter-chip aria-pressed swap, card hover lift, ticker-row hover, magnetic focus ring, skip-link slide-in); reviewer recommendations that introduce motion without proper gates are deferred.

- [AD-17 NEW] Signature-canvas closed mode list (13 routes-to-modes): home (dual-ring), work (filter-graph), case-study (section-progress), patterns/[slug] (decision-graph), patterns index (decision-graph), projects/[slug] (timeline), now (activity-feed), about (timeline), lab + lab/[slug] (experiment-graph, --accent-3 pink), built (layered-architecture, --accent-2 cyan), recruiter (condensed-4-node-status, --colors.live green); now/feed.xml NO canvas; 404 NO canvas; idle animation stroke-dasharray:4 4 at 2s linear infinite, collapses under prefers-reduced-motion; slot display: none below xl.

- [AD-18 NEW] Closed design token set (57 tokens across 6 categories in app/globals.css @theme block): 21 colors, 13 typography, 9 spacing, 5 shapes, 4 shadows, 4 gradients. Reference via var(--token-name) or Tailwind utility class. Inline hex/px outside closed set is a review failure. Tokens INTENTIONALLY not in set: z-index (use Tailwind z-*), opacity (use Tailwind opacity-*), animation (use prefers-reduced-motion media query). Three accents — --accent (brand, every page), --accent-2 (Built page only), --accent-3 (Lab pages only), never co-occur.

- [AD-19 NEW] Responsive breakpoint closed list (4 breakpoints): xl ≥1280 (full nav + canvas + 2-col hero on /built), lg 1100–1279 (nav links + cmdk visible, canvas hidden), md 900–1099 (single-col hero, 2-up grids, cmdk trigger hidden but ⌘K still opens palette), sm <900 (all grids 1-col, hero padding tightens, canvas fully hidden, footer stacks, touch targets ≥ 44px).

- [AD-20 NEW] Accessibility floor (WCAG 2.1 AA, CI-asserted via pa11y-ci): see FR-19; binding closed floor. Adding any ARIA rule requires a spine amendment.
```

### UX Design Requirements

```
UX-DR-1: Visual identity tokens
        (DESIGN.md: cinematic dark palette — deep #06070B bg, #FAFAFA fg, three accent roles --accent #A78BFA / --accent-2 #67E8F9 / --accent-3 #F472B6, --live #34D399 status-only, --warn #FCA5A5 warning-only; 13 typography tokens Space Grotesk 500 + Inter 400 + JetBrains Mono structural; 9 spacing tokens; 5 shape tokens; 4 shadow tokens; 4 gradient stops; clamp() everywhere; system-ui fallback. Tokens are the closed set in AD-18 — see AD-18 bullet for binding form.)

UX-DR-2: Signature canvas (9 modes per AD-17)
        (DESIGN.md + EXPERIENCE.md: persistent 240×240 fixed top-right slot ≥1280px viewport only; aria-hidden=true; pointer-events:none; backdrop-filter: blur(14px); 9 modes per AD-17 closed list; idle sigFlow stroke-dasharray:4 4 dash-offset animation collapses under prefers-reduced-motion; signature label --typography-micro top-left; meta --typography-micro bottom)

UX-DR-3: Sticky navigation (76px)
        (sticky top; height 76px; backdrop-filter: blur(20px) over rgba(6,7,11,0.72); 1px border-bottom --border; left brand mark + center nav links (aria-current="page" underline reveal on hover/active) + right {cmdk-trigger} + {magnetic-cta} single focal CTA per page; bottom edge carries scroll-progress bar per FR-1; nav collapses below lg, cmdk trigger also disappears below md)

UX-DR-4: Command palette (⌘K / Ctrl-K)
        (nav-right trigger with --glass fill + --border border + --radius-sm + --typography-label Search + ⌘K kbd; panel 640px max --radius-lg shadow-lg; role="dialog" aria-modal="true" aria-labelledby="cmdk-title"; scrim rgba(6,7,11,0.72) backdrop-filter: blur(24px); live fuzzy filter on <ul role="listbox" aria-live="polite" aria-relevant="additions"> with <li role="option" aria-selected>; item hover --glass-strong background + 2px --accent left border; focus trap inside input + list; Esc closes; scrim click closes; reduced-motion collapses open transition to 0.01ms)

UX-DR-5: Magnetic CTA
        (single focal primary CTA per page (nav or hero); pointermove handler translates button by 0.18× cursor offset clamped at ≤8px displacement; gated by matchMedia('(pointer: fine)') AND NOT matchMedia('(prefers-reduced-motion: reduce)'); touch/reduced-motion users get static button; on recruiter route uses --button-live (green) instead of accent)

UX-DR-6: Card system (generic + focal)
        (card --glass fill + --border + --radius-lg + --space-lg padding + 1px gradient-card hairline at top via ::before; hover translateY(-3px/-4px) + --border-accent border + --glass-strong fill + --shadow-lg; card-focal --radius-xl + --space-xl padding for hero CTA / summary card / recruiter summary / architecture diagram)

UX-DR-7: Button system (primary / secondary / live)
        (button-primary --accent or --gradient-button fill + --on-accent text + --radius-md + hover translateY(-2px) + --shadow-glow; button-secondary --glass-strong + --border-strong + --foreground + hover translateY(-2px) + --border-accent border; button-live --live fill + --on-live text + hover #6EE7B7 + 0 0 24px rgba(52,211,153,0.4); reserved for recruiter-mode nav CTA + closing CTA only)

UX-DR-8: Ticker row (NOW list)
        (vertical list each row 1px --border bottom + 1.75rem vertical padding; dot variants --live (active), --accent (draft), --foreground-4 (prior); active row --typography-headline-sm; prior row --typography-body-md --foreground-2; aria-live="polite" aria-relevant="additions" announces new entries)

UX-DR-9: Form input
        (--background-inset fill + --border + --radius-sm; focus --accent border + 2px solid --accent outline at 4px offset; used for /now subscribe email field; v4 stub submit handler per EXPERIENCE.md — no real backend, no error state, no render block)

UX-DR-10: Scroll progress bar
        (1px tall accent bar at sticky nav bottom; transform: scaleX(var(--progress)); color --accent; 100ms transition; passive scroll listener; capped 0–1; reduces under prefers-reduced-motion)

UX-DR-11: Voice and tone microcopy (binding)
        (EXPERIENCE.md: spine "This person builds serious software — and this website is proof."; homepage hero variant; built-page "Walked into the build notes anyway."; lab-page "the gap annoyed me."; now-page "right now."; recruiter closing "Skip the scheduling dance. Reply with role + comp range."; honest empty NOW "Nothing new this week. — actually nothing."; v4 mocks reflect correct facts from cv.md — Wellbook, Surakkha, CityFix, 1.2M patients, 22h MTTR)

UX-DR-12: Component patterns (state, interaction)
        (Header every page sticky 76px + scroll-progress bottom edge; Hero every page except recruiter with spine + description + breadcrumb; Pattern rail on /patterns/[slug] with M1..M4 gradient-text numerals + --typography-headline-md headings + hover-sync with signature canvas; Counter-line on /patterns/[slug] --colors.warn left border 3px + --foreground-2 body "When NOT to use it"; Sticky TOC on case-study right column ≥lg / top on <lg + IntersectionObserver active section; Architecture diagram /built hero right column AND signature canvas — same diagram two scales + hover-sync; Personality card /about 3×2 grid mono number prefix; Recruiter summary card /recruiter hero right card-focal with avatar + 2×2 stat grid + 2 CTAs; Role-fit card /recruiter 2×2 grid with status badge Strong fit/Partial/Open to)

UX-DR-13: Binding state patterns
        (reduced-motion all animation/transition collapse to 0.01ms + magnetic CTA short-circuits; touch device magnetic CTA disabled + card hover degrades to tap-active + canvas hidden (<1280px); command palette open scrim + focus trap + live fuzzy filter; signature canvas viewport <1280px display:none + reflow 240×240 + 24px; pattern deep-link to missing move smooth-scroll to nearest + toast "Move {N} doesn't exist"; empty NOW "Nothing new this week. — actually nothing." + last-good tag; layer-row hover corresponding arch-node .is-active on both big + canvas versions; filter chip single-active + aria-pressed swap; reduced-motion final state always rendered)

UX-DR-14: Interaction primitives (keyboard-first + banned patterns)
        (⌘K / Ctrl-K toggle palette; ↑/↓ navigate palette; Enter activate; Esc close; Tab/Shift-Tab focus; mouse click-to-act + hover reveals secondary affordances md+; canvas pointer-events:none decorative; touch tap-to-act + hover degrades to active; banned everywhere: infinite scroll, hover-only affordances <md, drag-to-reorder, modal stacks >1 level, focus on hidden elements, layout shifts on hover, animations that change width/height/top/margin)

UX-DR-15: 9-route IA (route manifest)
        (01-homepage /, 02-work /work, 03-case-study /work/<slug>, 04-pattern /patterns/<slug>, 05-now /now, 06-about /about, 07-lab /lab, 08-built /built, 09-recruiter /recruiter; projects/[slug] reuses timeline canvas mode; patterns index reuses decision-graph; /now/feed.xml + 404 have NO canvas)

UX-DR-16: Five key flows (climax-only)
        (Flow 1 Priya 30s triage — homepage → recruiter-route link → summary card → email compose; Flow 2 Marcus 60s verdict — /recruiter → case-study via cmdk → sticky TOC → Results; Flow 3 Sam pattern deep-link — /patterns/<slug> → 4 moves → counter-line → case-study magnetic CTA; Flow 4 /now visitor — homepage summary → /now → live ticker → subscribe; Flow 5 /built engineer — homepage footer → /built → layered architecture → layer table hover-sync → decisions)

UX-DR-17: Lab tool embedding (plain HTML iframe)
        (Lab tools render as plain HTML iframes — no client-side loader, no interactive loader; static screenshots as fallback; <LabToolIframeLoader> removed per AD-13)
```

### FR Coverage Map

```
FR-1  → Epic 1 (Foundations & Shell) — persistent header on every route
FR-2  → Epic 2 (Marketing Surface) — homepage hero with spine + 4 proof numbers
FR-2b → Epic 2 (Marketing Surface) — /built layered architecture page (binds AD-6, AD-17 layered-architecture mode, FR-10 invariant + canvas-mode assertion) — *NEW*
FR-3  → Epic 4 (Recruiter Surface) — /recruiter is a route, not a client state
FR-4  → Epic 4 (Recruiter Surface) — forward flow route-level at /recruiter?forward=1&case=<slug>
FR-5  → Epic 4 (Recruiter Surface) — shareable URL renders cold with OG metadata
FR-6  → Epic 4 (Recruiter Surface) — PDF via Puppeteer at /api/forward-pdf
FR-7  → Epic 3 (Content Surface) — five patterns at /patterns/<slug>
FR-8  → Epic 3 (Content Surface) — pattern deep-linkability via #move-{N} / #when-not
FR-9  → Epic 3 (Content Surface) — /patterns index page
FR-10 → Epic 1 (Foundations & Shell) — CI invariant in audit:routes
FR-11 → Epic 1 (Foundations & Shell) — per-route generateMetadata
FR-12 → Epic 5 (Content Pipeline) — webhook from sanjit-content + revalidateTag
FR-13 → Epic 5 (Content Pipeline) — Zod 4 additive schema with .partial + .passthrough
FR-14 → Epic 5 (Content Pipeline) — /api/now + 7-day stale-state fallback
FR-15 → Epic 2 (Marketing Surface) — /now page with live ticker + aria-live
FR-16 → Epic 2 (Marketing Surface) — currently-building homepage section
FR-17 → Epic 2 (Marketing Surface) — /now/feed.xml (no canvas)
FR-18 → Epic 1 (Foundations & Shell) — performance CI gates (LCP, gz, Lighthouse)
FR-19 → Epic 1 (Foundations & Shell) — accessibility floor CI via pa11y-ci
FR-20 → Epic 5 (Content Pipeline) — two-repo topology + AGENTS.md mirror scope
FR-21 → Epic 4 (Recruiter Surface) — contact form (Resend + Turnstile + honeypot)
FR-22 → Epic 1 (Foundations & Shell) — operational topology + observability
```

## Epic List

### Epic 1: Foundations & Shell

**Goal:** Stand up the build substrate, the closed design system, the closed client-component set, the routing skeleton with metadata + invariants, the performance + accessibility CI gates, and the operational plumbing — so that all later epics land on a complete, accessible, performant, deployable surface.

**User value delivered:** Every public route renders with a consistent header + scroll progress + sticky nav + footer. The site loads fast, is fully accessible, passes CI invariant checks, and the build / deploy / observability plumbing is wired. The 9-mode signature canvas slot + design tokens + breakpoints are bound — future epics slot content into a finished shell.

**FRs covered:** FR-1, FR-10, FR-11, FR-18, FR-19, FR-22

**Implementation notes:**
- Next.js 16.3.6+ App Router scaffold, Tailwind v4 CSS-first `@import "tailwindcss"` + `@theme` block per AD-18
- `app/globals.css` defines 57 design tokens across 6 categories (AD-18)
- `proxy.ts` at project root (no CSP injection; 308 redirect for `/?for=recruiter*` → `/recruiter*`)
- 10 closed client components per AD-13 (SignatureCanvas, ScrollProgress, CommandPalette, MagneticCTA, LayerRowHover, SkipToContent, NavCurrent, FilterChipGroup, AnalyticsBeacon, ErrorBeacon) in `components/client/`
- shadcn/ui: only Dialog, Toggle, Tooltip in `components/ui/` per AD-15
- 4-way responsive breakpoint system per AD-19 (`xl ≥1280` / `lg 1100-1279` / `md 900-1099` / `sm <900`)
- `next.config.js`: `experimental.sri: { algorithm: 'sha256' }` per AD-11; revalidateTag signature pinned
- `app/layout.tsx`: semantic landmarks (`<header role="banner">`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`); `SkipToContent` as first focusable element; Plausible + Sentry via `next/script strategy="lazyOnload"`
- CI: `pnpm audit:routes`, `pnpm audit:budget`, `pnpm lighthouse`, `pnpm test:a11y` (pa11y-ci)
- Per-route `generateMetadata` skeleton; recruiter route gets the `generateMetadata` reads-`searchParams` variant (FR-5 boundary)
- Operational: Upstash Redis client (namespaces `now`, `contact`); Vercel env vars schema; structured JSON logging; Resend + Cloudflare Turnstile + Sentry wiring
- Story-level ACs inherit all NFRs from `prd.md` §10 and `addendum.md` §A.8

### Epic 2: Marketing Surface

**Goal:** Build the homepage + /work + /work/[slug] + /about + /now + /now/feed.xml — the visitor-facing surface that proves "this person builds serious software — and this website is proof."

**User value delivered:** A visitor lands on `/`, sees the spine line + four proof numbers + role-fit cards, scrolls the homepage's currently-building section, browses work index → case study, reads about, opens `/now` to see live ticker + subscribe stub, and `/now/feed.xml` delivers the same entries via RSS.

**FRs covered:** FR-2, FR-15, FR-16, FR-17

**Implementation notes:**
- Homepage hero: spine line verbatim + four proof numbers tight cluster + positioning line (UX-DR-11)
- Signature canvas mode per AD-17: `home (dual-ring)`, `work (filter-graph)`, `case-study (section-progress)`, `now (activity-feed)`, `about (timeline)`
- `/now`: GET /api/now reads Upstash Redis namespace `now`; aria-live="polite" aria-relevant="additions" on the ticker list (AD-20); honest empty state "Nothing new this week. — actually nothing." (UX-DR-11)
- `/now/feed.xml`: SSG via revalidateTag, 200 with Content-Type application/atom+xml, no canvas (AD-17)
- Currently-building homepage section: latest 3-5 entries by updated timestamp rendered from same Redis read
- 404 page: no canvas (AD-17)
- Sticky TOC on case-study right column ≥lg / top on <lg + IntersectionObserver active section (UX-DR-12)
- Per-route `generateMetadata` for each route (FR-11)

### Epic 3: Content Surface

**Goal:** Build the patterns route family — `/patterns`, `/patterns/[slug]` — plus the case-study ↔ pattern citation walker that lets case studies deep-link to `/patterns/<slug>#move-{N>`.

**User value delivered:** A visitor arrives at a case study, reads a pattern citation, clicks it, lands on the pattern page with the named move already scrolled into view, reads setup + 2-5 moves + counter-line, and the Ship-Faster Pushback pattern carries its verbatim quote at `#move-4`.

**FRs covered:** FR-7, FR-8, FR-9

**Implementation notes:**
- Five named patterns at stable URLs: Canonical Model, Syncfusion Data-Grid, nopCommerce Plugin, Ship-Faster Pushback, Friday Architecture Review
- Each pattern renders: setup block + M1..Mn numbered moves + counter-line ("When NOT to use it") + annotation
- Heading-ID contract per amended AD-4: `<h2 id="move-{N}">` 1-indexed lowercase; `<h2 id="when-not">` for counter-line; other heading IDs are MDX layer's responsibility
- `/patterns` index: lists five patterns as cards with one-line + "Read the full" opening link; signature canvas mode: `decision-graph` with collapsed nodes (AD-17)
- `/patterns/[slug]`: signature canvas mode: `decision-graph` with 4-move layout (AD-17)
- Pattern citation walker walks only `status: published` entries (AD-4 / AD-5); deep-link uses native HTML anchor (no client component — `<PatternAnchorScroller>` removed per AD-13)
- Per-route `generateMetadata` for each pattern route (FR-11)
- Ship-Faster Pushback carries the verbatim quote at `#move-4`

### Epic 4: Recruiter Surface

**Goal:** Build `/recruiter` as a standalone SSG route — recruiter-mode as a route, not a client state — plus the forward flow (canonical URL, PDF via Puppeteer, contact form) so a hiring manager can triage a candidate in 30 seconds and forward to a colleague in 60.

**User value delivered:** A footer-level "For recruiters?" opt-in link on every page routes to `/recruiter`. A hiring manager lands there, sees the recruiter-aware hero + four proof vectors + status strip + role-fit cards + closing CTA. They click "Copy URL" to share `https://sanjit.dev/recruiter?forward=1&case=<slug>` with a colleague. They click "Download PDF" to get a server-rendered PDF of the forward artifact. They click "Email me" to send the forward email via the Resend-backed contact form. On Puppeteer failure, the link mutates into "Print via browser" that calls `window.print()`.

**FRs covered:** FR-3, FR-4, FR-5, FR-6, FR-21

**Implementation notes:**
- `app/recruiter/page.tsx` is SSG; canonical URL `https://sanjit.dev/recruiter?forward=1&case=<slug>` (AD-8, AD-14)
- `proxy.ts`: 308 redirect from `/?for=recruiter*` to `/recruiter*` preserving query params
- Signature canvas mode: `recruiter (condensed 4-node status)` with `--colors.live` green accent per AD-17
- `generateMetadata` reads `searchParams` to set `og:title`, `og:description`, `og:image` (1200×630 forward-specific frame); `generateStaticParams` per slug
- Forward flow (AD-14): primary affordance = Copy URL link; secondary = Download PDF link to `/api/forward-pdf?case=<slug>`; on Puppeteer failure the link mutates into Print via browser (`window.print()` on `/recruiter` route)
- PDF generation: `POST /api/forward-pdf` at Node.js runtime, `maxDuration=60`, ≥1769 MB memory, `@sparticuz/chromium` per AD-7; navigates to `/recruiter?forward=1&case=<slug>`; single-page A4; <500 KB; <5s generation; legible in Preview/Chrome/Adobe
- Contact form: POST serverless function → Resend → forward-to-hiring-manager email; Cloudflare Turnstile bot protection + honeypot; API key in Vercel env vars only; structured JSON logging; error shape `{ error: { code, message, request_id } }` (FR-21)
- aria-live="polite" on the `?case=` callout per AD-20

### Epic 5: Content Pipeline & Operational Topology

**Goal:** Wire the two-repo topology — `sanjit-portfolio` code repo + `sanjit-content` content repo — so content edits trigger ISR revalidation via webhook within 30s (5-min TTL fallback), the content-side `AGENTS.md` mirror is scoped to the rules the content repo can honor, and the snapshot write-back contract (KV → GitHub Action → commit `now-snapshot.json`) keeps phone-edits durable.

**User value delivered:** The site ships from a clean separation — code lives in one repo, content lives in another, builds are never triggered by content edits, and the live `/now` feed survives phone-edits through the snapshot write-back contract. CI audit catches any content commit that accidentally triggers a Vercel build.

**FRs covered:** FR-12, FR-13, FR-14, FR-20

**Implementation notes:**
- Content source: shallow `git clone` of `sanjit-content` at build time (CI config); no build triggered on content commits (AD-9)
- Webhook: `POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]` at edge runtime; calls `revalidateTag(tag, 'max')`; 5-min TTL fallback for delivery failure (AD-1, AD-12)
- GitHub Action in `sanjit-content` listens to `push`, `delete`, AND `force-push` events; <30s from push, <5s from webhook delivery (Known Pitfall #9)
- Content frontmatter: Zod 4.6+ with `.partial() + .passthrough()`; only `title` required; unknown keys preserved via `entry.meta` (AD-5)
- Pattern citation walker walks only `status: published` entries (AD-4)
- ISR tag enumeration: `<type>:<slug>` for typed (`case-study:wellbook`, `pattern:canonical-model`, `lab:<slug>`, `project:<slug>`); bare tags for `now` and `cv`
- `/api/now`: edge runtime, returns `{ entries, fallback, last_updated }`; 7-day gate per-entry; consumers render `(last updated N days ago)` when `fallback: true` (FR-14 / AD-2 / AD-10)
- Snapshot write-back (AD-10): phone-edits write to Upstash Redis only; GitHub Action in `sanjit-content` reads KV every 15 min and commits `now-snapshot.json` to the content repo. No serverless function pushes to the content repo.
- Content-side `AGENTS.md` mirror: AD-1, AD-2 (content-side perspective only), AD-5, AD-9, AD-10 (snapshot cadence), frontmatter shape, ISR tag enum. Explicitly excludes AD-13/17/18/19/20 (no Next.js runtime in content repo).
- CI: `pnpm audit:content` weekly — fails if any Vercel deployment in past 7 days was triggered by a content-repo commit (AD-9)

---

## Epic Details

### Epic 1: Foundations & Shell

**Goal:** Stand up the Next.js 16.3.6+ App Router scaffold, the closed 57-token design system in `app/globals.css`, the closed 10-component client set per AD-13, the routing skeleton with metadata + invariants, the performance + accessibility CI gates, and the operational plumbing.

**User value delivered:** Every public route renders with a consistent header + scroll progress + sticky nav + footer. The site loads fast (LCP < 1.8s on Slow 4G mobile, ≤ 100 KB gzipped homepage), is fully accessible (WCAG 2.1 AA via pa11y-ci), passes the CI invariant (`spine-line + ≥1 proof + return path`) on every route, and the build / deploy / observability plumbing is wired.

**FRs covered:** FR-1, FR-10, FR-11, FR-18, FR-19, FR-22

**Load-bearing ADs:** AD-3 (closed serverless endpoints), AD-11 (CSP via SRI), AD-13 (10-component closed client set), AD-15 (shadcn scope), AD-16 (motion discipline), AD-18 (57-token design system), AD-19 (4-way breakpoints), AD-20 (a11y floor)

**Relevant UX-DRs:** UX-DR-1 (visual tokens → AD-18), UX-DR-2, UX-DR-3, UX-DR-4, UX-DR-5, UX-DR-6/7/8/9/10, UX-DR-11, UX-DR-13, UX-DR-14

---

#### Story 1.1: Project Scaffold + Dependency Pinning

As a developer,
I want a working Next.js 16.3.6+ App Router project with pinned dependencies and the verified commands wired,
So that all later stories land on a buildable, reproducible surface.

**Acceptance Criteria:**

**Given** a fresh clone with Node 20.9.0+ and pnpm installed
**When** I run `pnpm install --frozen-lockfile`
**Then** `pnpm-lock.yaml` is respected exactly (no regeneration, no version drift)
**And** `pnpm dev` starts a Turbopack dev server on port 3000 and serves the default route
**And** `pnpm build` produces a Turbopack production build without warnings about deprecated APIs
**And** `package.json` declares `engines.node >= 20.9.0` and the resolved `next` version is `16.3.6+`

**Given** the install + build succeed
**When** I open `package.json`
**Then** `next`, `react`, `react-dom`, `typescript ≥ 5.1.0`, `zod ≥ 4.6.0`, `@next/mdx`, `mdx` (3.x), `gray-matter`, `tailwindcss` (4.x), `@tailwindcss/postcss`, `@upstash/redis`, `resend`, `@sparticuz/chromium`, `puppeteer-core`, `@sentry/nextjs`, `plausible-tracker`, `pa11y-ci` are pinned to exact versions
**And** `vitest`, `@playwright/test`, `@lhci/cli`, `eslint`, `eslint-config-next`, `@typescript-eslint/*` are present
**And** no `contentlayer` package is present (Known Pitfall #8)
**And** no `tailwind.config.ts` file exists — config lives in `app/globals.css` via `@theme` blocks (Known Pitfall #7)

---

#### Story 1.2: Next.js Config + CSP via SRI + proxy.ts Skeleton

As a developer,
I want `next.config.js` configured with strict CSP via Subresource Integrity (no nonce path) and `proxy.ts` at project root with the 308 redirect for `/?for=recruiter*`,
So that the build enforces hashed-script integrity and the recruiter-mode URL contract is honored before any rendering happens.

**Acceptance Criteria:**

**Given** `next.config.js` at the project root
**When** I inspect the file
**Then** `experimental.sri: { algorithm: 'sha256' }` is set (AD-11)
**And** `revalidateTag` calls in the codebase use the two-argument signature `revalidateTag(tag, 'max')` (Known Pitfall #3)
**And** `images.remotePatterns` and other config sections are present as needed for the recruiter og:image and `/api/forward-pdf` Puppeteer target
**And** the config does NOT inject a CSP nonce header — the nonce path is explicitly rejected per AD-11 (forces dynamic rendering, conflicts with AD-13)

**Given** `proxy.ts` at the project root (NOT `middleware.ts` — Known Pitfall #4)
**When** I send `GET /?for=recruiter` or `GET /?for=recruiter&forward=1&case=wellbook`
**Then** the response is `308 Permanent Redirect` to `/recruiter` and `/recruiter?forward=1&case=wellbook` respectively, preserving query params
**And** any other path passes through unchanged
**And** the proxy does NOT inject CSP headers, `X-Frame-Options`, or other security headers — that's handled by `next.config.js` + SRI

**Given** the build runs
**When** Next.js builds the production bundle
**Then** every emitted `<script>` and `<link rel="stylesheet">` carries a valid `integrity="sha384-..."` attribute
**And** no `<script nonce="...">` attributes appear in the rendered HTML (nonce path rejected)

---

#### Story 1.3: Closed Design Token System in app/globals.css

As a developer,
I want the 57-token design system defined as a Tailwind v4 `@theme` block in `app/globals.css`,
So that every component references tokens via `var(--token-name)` or Tailwind utility classes — inline hex/px values outside the closed set are a review failure.

**Acceptance Criteria:**

**Given** `app/globals.css` exists with `@import "tailwindcss"` at the top
**When** I read the file
**Then** the `@theme` block defines exactly 57 tokens across 6 categories:
- **Colors (21):** `--bg`, `--bg-inset`, `--fg`, `--fg-2`, `--fg-3`, `--fg-4`, `--border`, `--border-strong`, `--border-accent`, `--glass`, `--glass-strong`, `--on-accent`, `--on-live`, `--gradient-button-from`, `--gradient-button-via`, `--gradient-button-to`, `--accent`, `--accent-2`, `--accent-3`, `--live`, `--warn`
- **Typography (13):** `--font-display`, `--font-body`, `--font-mono`, plus 10 size/leading pairs (`--typography-*` for `hero`, `headline-{xl,lg,md,sm}`, `body-{lg,md,sm}`, `label`, `micro` — each carries a font-size + line-height pair)
- **Spacing (9):** `--space-{xxs,xs,sm,md,lg,xl,2xl,3xl,4xl}` (the closed set; do not introduce arbitrary spacing)
- **Shapes (5):** `--radius-{sm,md,lg,xl,pill}` (closed)
- **Shadows (4):** `--shadow-{sm,md,lg,glow}` (closed)
- **Gradients (4):** `--gradient-card`, `--gradient-hairline`, `--gradient-text`, `--gradient-button` (closed stops referenced by the color tokens)

**And** the three accents and their usage rules are explicit in a comment: `--accent` (brand / primary action, every page), `--accent-2` (Built page only), `--accent-3` (Lab pages only), never co-occur on the same surface
**And** `--live` (`#34D399`) is documented as status-only — recruiter route signature canvas + closing CTA button-live only
**And** `--warn` (`#FCA5A5`) is documented as warning-only — pattern counter-line left border only

**Given** the `@theme` block is in place
**When** I grep the `app/`, `components/`, and `lib/` directories for inline hex values
**Then** the only acceptable occurrences are inside `app/globals.css` itself
**And** no `#000`, `#fff`, `#FFFFFF`, `rgba(0,0,0,...)` etc. appear inline outside `app/globals.css`
**And** no arbitrary `px` values for spacing appear inline — all spacing uses `var(--space-*)` or Tailwind utilities that resolve to the same tokens

**Given** tokens intentionally not in the set
**When** I read the relevant components
**Then** z-index uses Tailwind utility classes (`z-10`, `z-20`, `z-50`, `z-[100]`)
**And** opacity uses Tailwind utility classes (`opacity-50`, `opacity-100`)
**And** animation is handled via `prefers-reduced-motion` media queries, not tokens

---

#### Story 1.4: Closed 10-Component Client Set + shadcn/ui Scope

As a developer,
I want the 10 closed client components implemented per AD-13 and exactly three shadcn/ui primitives installed per AD-15,
So that no layout-level `"use client"` boundary exists, no global client provider exists, and every drop of client JS traces back to a closed-set entry.

**Acceptance Criteria:**

**Given** `components/client/` contains the client-component files
**When** I list the directory and inspect each file
**Then** the following 10 components exist, each with `"use client"` at the top:
1. `SignatureCanvas` — SSR-safe inline SVG, reads current route, selects from the 9 AD-17 modes, `aria-hidden="true"`, `pointer-events: none`, `display: none` below 1280px viewport (`<SignatureCanvas>`)
2. `ScrollProgress` — 1px accent bar at nav bottom, `transform: scaleX(var(--progress))` driven by passive scroll listener, `prefers-reduced-motion` short-circuits (`<ScrollProgress />`)
3. `CommandPalette` — `role="dialog" aria-modal="true" aria-labelledby="cmdk-title"` modal opened by ⌘K / Ctrl-K, live fuzzy filter, keyboard nav (↑/↓/Enter/Esc), focus trap inside input + list, scrim click closes, `prefers-reduced-motion` collapses open transition (`<CommandPalette routes={routes} />`)
4. `MagneticCTA` — single focal CTA per page, `pointermove` translates by `0.18×` offset clamped ≤ 8px, gated `pointer:fine AND NOT prefers-reduced-motion` (`<MagneticCTA href={href} variant="primary|live">`)
5. `LayerRowHover` — built-page hover-sync between layer table rows and architecture diagram (big + canvas versions); `prefers-reduced-motion` short-circuits (`<LayerRowHover rows={layers} />`)
6. `SkipToContent` — first focusable element on every route, `top: -100px` until focused then `top: 1rem` (`<SkipToContent />`)
7. `NavCurrent` — sets `aria-current="page"` on active nav link, SSR + tiny client-side enhancement for client-side navigation (`<NavCurrent items={navItems} />`)
8. `FilterChipGroup` — `/work` chip group with `aria-pressed` per chip, single-active behavior, no data fetching (`<FilterChipGroup chips={chips} active={active} />`)
9. `AnalyticsBeacon` — Plausible deferred via `next/script strategy="lazyOnload"`, custom events (`forward_button_click`, `recruiter_route_enter`, `pattern_deep_link_visit`, `case_study_forward_open`) (`<AnalyticsBeacon />`)
10. `ErrorBeacon` — Sentry deferred via `next/script` (or `@sentry/nextjs` `lazyOnload` integration); errors shape `{ error: { code, message, request_id } }` is emitted from serverless (`<ErrorBeacon />`)

**And** the following components are NOT in `components/client/`: `<RecruiterModeToggle>`, `<RecruiterModeProvider>`, `<ForwardModal>`, `<PatternAnchorScroller>`, `<LabToolIframeLoader>` (removed per AD-13 amendment)

**Given** `components/ui/` is the shadcn/ui home
**When** I list the directory
**Then** exactly three primitives exist: `dialog.tsx`, `toggle.tsx`, `tooltip.tsx`
**And** no other shadcn primitives (`Button`, `Input`, `Select`, `Tabs`, `Card`, etc.) are present
**And** no full shadcn registry is cloned — only these three (per AD-15 + Known Pitfall #12)

**Given** the component set is built
**When** I grep for layout-level `"use client"` boundaries
**Then** the only `"use client"` directives appear in `components/client/*` files (no `app/layout.tsx` or `app/**/layout.tsx` carries `"use client"`)

---

#### Story 1.5: Sticky Header + Footer + Scroll Progress + Skip-to-Content

As a visitor on any public route,
I want a persistent 76px sticky header with brand mark + nav links + cmdk trigger + magnetic CTA, a scroll-progress accent bar at its bottom edge, and a skip-to-content link as the first focusable element,
So that I can navigate anywhere on the site from any page, see my read progress at a glance, and bypass chrome with the keyboard.

**Acceptance Criteria:**

**Given** I'm on any public route (homepage, /work, /work/[slug], /patterns, /patterns/[slug], /now, /about, /lab, /lab/[slug], /built, /recruiter, 404)
**When** the page renders
**Then** `<header role="banner">` is the first semantic landmark in `<main>`'s preceding tree
**And** the header is sticky `top: 0`, `height: 76px`, with `backdrop-filter: blur(20px)` over `rgba(6,7,11,0.72)` per UX-DR-3
**And** a 1px `--border` line runs along its bottom edge
**And** the leftmost element is the brand mark; the center cluster is the nav links; the right cluster is the cmdk-trigger button + the magnetic CTA

**Given** the header is rendered
**When** I navigate to a route via `<NavCurrent>` (on client-side navigation, hash routing, or first paint)
**Then** the active nav link carries `aria-current="page"` and an underline reveal animation on hover/active
**And** the underline reveal collapses to 0.01ms under `prefers-reduced-motion`

**Given** the page renders
**When** I scroll vertically past the first viewport
**Then** a 1px tall `--accent`-colored bar appears at the header bottom, `transform: scaleX(var(--progress))` where `--progress` is 0..1
**And** the transition is 100ms ease-out
**And** under `prefers-reduced-motion: reduce` the bar still appears but without the color transition (final state always rendered)

**Given** I'm using a keyboard
**When** I press Tab as the first key on the page
**Then** focus lands on a visible "Skip to content" link at `top: 1rem`, `left: 1rem`
**And** activating the link moves focus to `<main id="main" tabindex="-1">` (or the first heading inside `<main>`)
**And** the skip link is the first focusable element in the tab order on every public route
**And** on mobile (`< md`) the skip link's touch target is ≥ 44px tall

---

#### Story 1.6: Responsive 4-Way Breakpoint System

As a developer,
I want a 4-way responsive breakpoint system per AD-19 wired at the Tailwind v4 layer,
So that layouts respond correctly across the closed breakpoint ladder — no ad-hoc responsive rules in components.

**Acceptance Criteria:**

**Given** `tailwind.config.ts` does NOT exist (Tailwind v4 CSS-first; Known Pitfall #7)
**When** I read `app/globals.css`
**Then** the breakpoints are defined as CSS custom media queries (e.g. `@custom-media --xl (width >= 1280px)`, `@custom-media --lg (1100px <= width < 1280px)`, etc.) — or equivalent Tailwind v4 syntax
**And** the four breakpoints are exactly: `xl ≥1280px`, `lg 1100–1279px`, `md 900–1099px`, `sm <900px` (AD-19)

**Given** the breakpoints are wired
**When** I view any public route at 1280px+ viewport
**Then** the signature-canvas slot is visible (`display: block`), full nav links + cmdk trigger visible, two-column hero on `/built`
**When** I view at 1100–1279px
**Then** the signature canvas is `display: none`, nav links + cmdk trigger remain visible
**When** I view at 900–1099px
**Then** single-column hero, grids 2-up, cmdk trigger hidden (palette still openable via ⌘K)
**When** I view at < 900px
**Then** all grids are single column, hero padding tightens, signature canvas fully hidden, footer stacks vertically, touch targets ≥ 44px

**Given** a layout reflow happens at the `xl → lg` boundary
**When** the signature canvas becomes hidden
**Then** the freed `240×240 + 24px right margin` is reclaimed by the content — no empty space or layout shift

---

#### Story 1.7: Per-Route Metadata + Recruiter searchParams-aware generateMetadata Skeleton

As a search engine / social card crawler,
I want every public route to expose accurate `<title>`, `<meta name="description">`, and `<meta property="og:*">` metadata, with `/recruiter` reading `searchParams` at request time to set `og:image`,
So that shared URLs render rich, route-specific social cards without server-side state.

**Acceptance Criteria:**

**Given** any public route renders
**When** I inspect the `<head>` of the rendered HTML
**Then** `<title>` is route-specific and ≤ 60 characters
**And** `<meta name="description">` is route-specific, ≤ 160 characters, and contains ≥ 1 proof number if applicable
**And** `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">` (1200×630), `<meta property="og:type">`, `<meta property="og:url">` are present
**And** `<meta name="twitter:card" content="summary_large_image">` plus matching Twitter title/description/image are present
**And** `<link rel="canonical">` points to the canonical URL (no `?for=` or `?case=` query params polluting the canonical)

**Given** `/recruiter?forward=1&case=wellbook` is requested
**When** the route renders (SSG with `generateStaticParams` per slug)
**Then** `generateMetadata` reads `searchParams` at request time and sets `og:image` to a recruiter-mode-specific 1200×630 frame that includes the spine line + the case-study name + ≥1 proof number
**And** `og:title` includes "Forward: <case-study name>" prefix when `?forward=1` is set
**And** `og:description` includes the case-study's tagline

**Given** a route is requested with `?for=recruiter` (legacy)
**When** the request hits `proxy.ts`
**Then** it 308-redirects to `/recruiter` preserving the rest of the query params (per Story 1.2)

---

#### Story 1.8: Performance + Accessibility CI Gates

As a developer,
I want CI to fail the build on any regression of the closed performance budget and the closed accessibility floor,
So that the LCP / transfer / Lighthouse / WCAG AA targets can't silently drift.

**Acceptance Criteria:**

**Given** the GitHub Actions workflow at `.github/workflows/ci.yml`
**When** CI runs on any PR
**Then** the following checks all run and all must pass:
1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test` (Vitest; content-schema validation per AD-5 + later-story unit tests)
5. `pnpm test:e2e` (Playwright; route-invariant checks per AD-12, ISR revalidation per AD-1)
6. `pnpm audit:budget` — homepage ≤ 100 KB gzipped, any other route ≤ 200 KB gzipped (FR-20)
7. `pnpm audit:routes` — every public route contains spine-line variant + ≥ 1 proof number from the v4 expanded set `{7+, 10K+, 35%, 22h, 1.2M, −68%, 7-person, 6, 8+ years}` + `href="/"` return path (FR-10 / AD-12)
8. `pnpm lighthouse` — Lighthouse CI mobile profile, Slow 4G throttling; fails if Performance < 95 or LCP > 1.8s (FR-18)
9. `pnpm test:a11y` — pa11y-ci (v4.1.1+ per v5 web-research) against every public route; fails on any WCAG 2.1 AA violation (AD-20)

**And** Lighthouse CI is configured with the mobile profile, Slow 4G throttling, and CPU 4× slowdown
**And** pa11y-ci is configured with the WCAG 2.1 AA standard, runs against every public route in the 9-route IA (plus `/now/feed.xml` and 404), and runs in `chrome-launcher` mode (not jsdom — pa11y-ci requires a real browser)

**Given** any of these checks fail
**When** CI finishes
**Then** the PR is blocked with a clear log pointing to the failed gate and the specific offending route or asset

---

#### Story 1.9: Operational Plumbing — Upstash Redis, Resend, Sentry, Plausible, proxy.ts 308 Redirect

As an operator,
I want Upstash Redis (namespaces `now`, `contact`), Resend, Sentry, and Plausible wired with deferred loading, and the proxy.ts 308 redirect for `/?for=recruiter*`,
So that the live `/now` feed, the forward email, error tracking, and analytics are all live on first deploy.

**Acceptance Criteria:**

**Given** Vercel env vars are configured (OUTSIDE this story, by the operator): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `CLOUDFLARE_TURNSTILE_SITE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET_KEY`
**When** the app boots
**Then** `lib/redis.ts` exports a typed `redis` client and a `redisKeys` constants object with two namespaces: `now` and `contact` only (AD-2)
**And** `lib/email.ts` exports a `sendForwardEmail(to, case_slug)` function that calls Resend's `emails.send` with the recruiter-aware template
**And** `Sentry.init()` runs deferred (not on first paint); lazyOnload strategy via `@sentry/nextjs` config
**And** Plausible loads via `next/script strategy="lazyOnload"` in `app/layout.tsx`; the `<AnalyticsBeacon />` client component registers custom events `forward_button_click`, `recruiter_route_enter`, `pattern_deep_link_visit`, `case_study_forward_open`

**Given** `lib/log.ts` is the structured logger
**When** any serverless function runs
**Then** every entry emits `{ request_id, route, duration_ms, status }` where `request_id = crypto.randomUUID()` server-side
**And** GitHub Actions uses the run ID as `request_id` for Action-logged events
**And** errors from serverless functions are shape `{ error: { code, message, request_id } }`

**Given** the proxy.ts 308 redirect is wired (Story 1.2 carries this)
**When** any other CSP / security header policy is considered
**Then** the policy is NOT injected via `proxy.ts` — security headers come from `next.config.js` + SRI, per AD-11

---

#### Story 1.10: Signature Canvas Skeleton + Motion Discipline Gates

As a visitor on a desktop-width viewport,
I want the 240×240 signature canvas visible in the fixed top-right slot, rendering one of the 9 closed modes selected by route,
So that the site's identity is present on first paint without violating motion discipline.

**Acceptance Criteria:**

**Given** `<SignatureCanvas>` is mounted on a route (default: all routes except `/now/feed.xml` and 404)
**When** the route renders at `xl ≥ 1280px`
**Then** a 240×240 SVG element appears in the top-right of the viewport, fixed position, `pointer-events: none`, `aria-hidden="true"`
**And** `backdrop-filter: blur(14px)` runs on the canvas container per UX-DR-2
**And** a `--typography-micro` signature label appears top-left of the canvas; a `--typography-micro` meta appears bottom-right
**And** the mode is selected by route per AD-17 (closed list):
  - `/` → `home (dual-ring)`
  - `/work`, `/work/[slug]` → `work (filter-graph)` / `case-study (section-progress)`
  - `/patterns`, `/patterns/[slug]` → `pattern (decision-graph)` with collapsed nodes / 4-move layout
  - `/now` → `now (activity-feed)`
  - `/about` → `about (timeline)`
  - `/lab`, `/lab/[slug]` → `lab (experiment-graph)` with `--accent-3` pink
  - `/built` → `built (layered-architecture)` with `--accent-2` cyan
  - `/recruiter` → `recruiter (condensed-4-node-status)` with `--colors.live` green
  - `/now/feed.xml`, 404 → NO canvas

**And** the idle animation is the only animation on first paint: `stroke-dasharray: 4 4` traversing active edges at `2s linear infinite`
**And** under `prefers-reduced-motion: reduce`, all dash-offset animation collapses to 0.01ms or is disabled — the final readable state is always rendered

**Given** the canvas skeleton is wired
**When** I view any of these 10 motion surfaces on the site
**Then** each carries the explicit AD-16 gate:
- Magnetic CTA → `pointer:fine AND NOT prefers-reduced-motion`
- Signature canvas idle `sigFlow` → `prefers-reduced-motion: collapse`
- Scroll progress bar transform → `prefers-reduced-motion: collapse transition, keep final state`
- Command palette scrim fade + open transition → `prefers-reduced-motion: collapse to 0.01ms`
- Layer-row hover-sync → `prefers-reduced-motion: collapse transition`
- Filter chip `aria-pressed` swap → `prefers-reduced-motion: collapse transition`
- Card hover lift → `prefers-reduced-motion: collapse translateY`
- Ticker-row hover → `prefers-reduced-motion: collapse`
- Magnetic focus ring → `pointer:fine AND NOT prefers-reduced-motion`
- Skip-link slide-in → `prefers-reduced-motion: collapse`

---

### Epic 2: Marketing Surface

**Goal:** Build the visitor-facing routes — `/` (homepage), `/work`, `/work/[slug]` (case studies), `/about`, `/now`, `/now/feed.xml` — so a visitor lands on the homepage, sees the spine line + four proof numbers, browses work, reads about, opens `/now` to see live ticker + subscribe stub, and `/now/feed.xml` delivers the same entries via RSS.

**User value delivered:** A first-time visitor lands on a homepage that proves the builder's identity in one viewport. They can browse to a case study, read a deep technical post, subscribe to the live `now` feed, or follow the RSS feed. Every page carries the spine line, at least one proof number, and a return path home — verified by `pnpm audit:routes` in CI.

**FRs covered:** FR-2, FR-15, FR-16, FR-17

**Load-bearing ADs:** AD-2 (Upstash Redis namespace `now`), AD-3 (`GET /api/now` edge runtime), AD-9 (content edits don't trigger build), AD-10 (stale-state 7-day fallback contract), AD-12 (route invariants), AD-13 (no new client components for these routes — SignatureCanvas + ScrollProgress + MagneticCTA only), AD-20 (per-route a11y floor)

**Relevant UX-DRs:** UX-DR-2 (canvas per AD-17), UX-DR-3 (sticky nav 76px), UX-DR-8 (ticker row), UX-DR-10 (scroll progress), UX-DR-11 (microcopy variants per route), UX-DR-12 (sticky TOC, hero, personality card), UX-DR-13 (touch/motion state patterns), UX-DR-15 (9-route IA), UX-DR-17 (Lab tool plain iframe — covered in Epic 2's `/lab` route)

---

#### Story 2.1: Homepage Hero + Spine Line + Four Proof Numbers

As a first-time visitor,
I want the homepage hero to render the spine line verbatim, four proof numbers as a tight cluster, and the positioning line,
So that I see the builder's claim in one viewport, before I scroll.

**Acceptance Criteria:**

**Given** I navigate to `/`
**When** the route renders (SSG via `pnpm build`)
**Then** the hero is visible within the first viewport above the fold on a 1280-wide desktop and on a 375-wide mobile
**And** the spine line renders verbatim: "This person builds serious software — and this website is proof." (per UX-DR-11 / SPEC.md Why)
**And** four proof numbers from the v4 expanded set `{7+, 10K+, 35%, 22h, 1.2M, −68%, 7-person, 6, 8+ years}` render as a tight cluster, each with a one-line context label and source (e.g. `22h` "MTTR on Wellbook's incident Sept 2024 — see contact form")
**And** the positioning line renders below the proof numbers, in `--typography-body-lg`, single line, max-width 70ch

**Given** the homepage is rendered
**When** `pnpm audit:routes` runs
**Then** the homepage HTML contains the spine-line verbatim substring AND ≥ 1 proof number token AND an `<a href="/" ...>return path</a>` link
**And** the static analysis also asserts presence of the signature-canvas mode-id for `/` → `dual-ring` in the rendered HTML or hydration payload

**Given** I view the homepage at < 1280px viewport (lg / md / sm)
**When** the layout reflows
**Then** the signature canvas slot is `display: none` and the hero is single-column
**And** the proof-number cluster stacks vertically at < 900px and remains a horizontal cluster at ≥ 1100px
**And** touch targets (the magnetic CTA, the footer "For recruiters?" link, the nav hamburger if any) are ≥ 44px tall

---

#### Story 2.2: Homepage Currently-Building Section

As a returning visitor,
I want to see the latest 3–5 currently-building entries on the homepage below the hero,
So that I know the builder is alive and shipping — without leaving the homepage.

**Acceptance Criteria:**

**Given** the homepage renders at request time
**When** the currently-building section renders (RSC + Tag-fetched data)
**Then** it shows the 3–5 latest entries from Upstash Redis namespace `now` by `updated_at` DESC
**And** each entry shows: status dot (`--live`/`--accent`/`--foreground-4` per UX-DR-8), one-line title, one-line context, updated timestamp (`2 hours ago` / `yesterday` / etc.)
**And** the section is followed by a "See the live feed →" link to `/now`

**Given** the Redis read returns no entries (or returns a fallback)
**When** the section renders
**Then** the section header is "Currently building" and the body shows the honest empty state: "Nothing new this week. — actually nothing." (UX-DR-11 microcopy)
**And** the section still renders (graceful degradation — no `null` crash)

**Given** the Redis read times out
**When** `/api/now` returns `{ entries: [], fallback: true, last_updated: null }` (AD-10 stale-state contract)
**Then** the section renders the empty-state microcopy with a `(last updated N days ago)` tag if a snapshot is available
**And** the `fallback: true` flag is honored by the consumer (per FR-14)

---

#### Story 2.3: /work Index + Filter Chip Group

As a visitor browsing the case study catalog,
I want `/work` to list all case studies as cards organized by visual filter chips,
So that I can scan by industry or role without leaving the index.

**Acceptance Criteria:**

**Given** I navigate to `/work`
**When** the route renders
**Then** it lists all `status: published` case studies as `<a>` cards with title, one-line context, and `read this case study` affordance
**And** the signature canvas mode is `work (filter-graph)` per AD-17 (active edges light up in sync with the active filter chip; chip clicks update the active edge)
**And** a `<FilterChipGroup>` (closed-set client component per AD-13) sits above the card grid with chips: `All`, `Health-tech`, `Ed-tech`, `Public-sector`, `Open-source`
**And** each chip carries `aria-pressed="true|false"` and a single-active behavior (`pointerdown`/`click`/`Enter` activates; another chip is deactivated)
**And** under `prefers-reduced-motion` the chip swap transition collapses to 0.01ms (Story 1.10 motion gate)

**Given** the v4 filter is visual-organization only (doesn't actually filter the card list)
**When** a visitor clicks a chip
**Then** the card list does NOT change — the chip's active state signals organization, not data filtering
**And** `aria-pressed` swaps correctly per chip activation
**And** the filter-chip active edge in the signature canvas lights up in sync with the active chip (visual syncing via SVG class toggle, no extra client JS — the canvas reads an `data-active-chip` attribute on the page wrapper)

---

#### Story 2.4: Case Study Page + Sticky TOC

As a reader of a case study,
I want the case-study page to render with a sticky right-column Table of Contents at `≥lg`, top-anchored at `<lg`, with the active section highlighted as I scroll,
So that I can navigate a long case study without losing my place.

**Acceptance Criteria:**

**Given** I navigate to `/work/<slug>` (e.g. `/work/wellbook`)
**When** the route renders
**Then** the page renders the MDX body with the case-study schema (frontmatter `title`, `summary`, `proof_numbers[]`, `tags[]`, `published_at`, etc. — all validated via Zod 4 `CaseStudySchema` per AD-5)
**And** the signature canvas mode is `case-study (section-progress)` per AD-17 — an edge highlights as the reader scrolls past each section heading
**And** the table of contents is sticky at `≥lg` (right column), top-anchored at `<lg`
**And** `<h2>` and `<h3>` headings inside the MDX body carry `id` attributes (auto-generated from the slugified heading text)
**And** clicking a TOC item scrolls the matching section into view with `behavior: 'smooth'`
**And** under `prefers-reduced-motion`, smooth-scroll is replaced with instant scroll

**Given** I scroll through the case study
**When** a section heading enters the viewport (IntersectionObserver)
**Then** the matching TOC item becomes `.is-active` and the signature-canvas edge highlights
**And** the active-state visual transition collapses under `prefers-reduced-motion`

**Given** the case study mentions a pattern citation
**When** I click the citation link in the rendered text
**Then** I navigate to `/patterns/<slug>#move-<N>` (per amended AD-4 heading-ID contract — Epic 3 carries this deep-link target)
**And** the link carries the case-study-pattern citation walker trail (per amended AD-4 — only `status: published` entries)

---

#### Story 2.5: /about Page + 3×2 Personality Card Grid

As a visitor looking for evidence of who the builder is,
I want `/about` to render a timeline (signature canvas) plus a 3×2 personality-card grid (mono number prefix per UX-DR-12),
So that I get a concise summary of the builder's professional identity.

**Acceptance Criteria:**

**Given** I navigate to `/about`
**When** the route renders
**Then** the hero carries the spine line + positioning line + the breadcrumb (UX-DR-12)
**And** the signature canvas mode is `about (timeline)` per AD-17
**And** the 3×2 personality-card grid renders 6 cards, each with: mono number prefix (e.g. `01`, `02`...), headline, 2–3 sentence body, optional proof number
**And** the grid reflows: 3 columns at `xl`, 2 columns at `md`, 1 column at `sm`
**And** each card is a generic `<a>` card or a `<div>` card with the closed set of card styles (UX-DR-6: `--glass` fill + `--border` + `--radius-lg` + `--space-lg` padding + 1px gradient-card hairline at top via `::before`)

**Given** the about page renders
**When** `pnpm audit:routes` runs against `/about`
**Then** the rendered HTML contains the spine-line variant for `/about` (per UX-DR-11 — defaults to the homepage variant unless overridden), ≥ 1 proof number, `href="/"` return path

---

#### Story 2.6: /now Page + Live Ticker + Honest Empty State + Subscribe Stub

As a recurring visitor,
I want `/now` to show the latest currently-building entries from Upstash Redis with `aria-live` announcements for new entries and an honest empty state,
So that I can see what's being built right now and subscribe to updates.

**Acceptance Criteria:**

**Given** I navigate to `/now`
**When** the route renders (RSC + Tag-fetched from Upstash Redis namespace `now`)
**Then** the ticker list renders the latest entries with: vertical `1px --border` between rows, `1.75rem` row vertical padding, dot variants `--live` (active) / `--accent` (draft) / `--foreground-4` (prior)
**And** the active row uses `--typography-headline-sm`, prior rows `--typography-body-md --foreground-2` (UX-DR-8)
**And** the list container carries `aria-live="polite" aria-relevant="additions"` (AD-20 binding)
**And** screen readers announce new entries added to the list
**And** the signature canvas mode is `now (activity-feed)` per AD-17

**Given** the Redis read returns no entries (or returns fallback: true)
**When** the page renders
**Then** the empty state renders: "Nothing new this week. — actually nothing." (UX-DR-11)
**And** a `(last updated N days ago)` tag shows the snapshot commit cadence if a snapshot exists (FR-14 / AD-10)
**And** the page never crashes with an empty-state exception

**Given** I want to subscribe
**When** I enter my email in the subscribe form (UX-DR-9 input: `--background-inset` fill + `--border` + `--radius-sm`; focus `--accent` border + 2px solid `--accent` outline at 4px offset)
**Then** the form shows a success state on submit (v4 stub — no real backend, no error state, no render block)
**And** the email is NOT collected or sent anywhere in v4 (UX-DR-9 / EXPERIENCE.md: stubbed, no real submit handler)

---

#### Story 2.7: /now/feed.xml + 404 Page

As a feed-reader user / RSS subscriber,
I want `/now/feed.xml` to return an Atom feed of the latest currently-building entries, and a 404 page that routes me back somewhere useful,
So that I can subscribe to the live feed in my reader of choice, and I'm not stranded at a dead-end.

**Acceptance Criteria:**

**Given** I send `GET /now/feed.xml`
**When** the route responds
**Then** the response is `200 OK` with `Content-Type: application/atom+xml`
**And** the body is valid Atom 1.0 XML with `<feed>`, `<title>`, `<link>`, `<updated>`, `<entry>` blocks for each currently-building entry
**And** entries include title, link, updated timestamp, and a `<content type="text">` body
**And** the response carries NO signature canvas (AD-17 — feeds don't render visual identity)
**And** the route is revalidated via `revalidateTag('now', 'max')` on content commits (AD-1)

**Given** I send `GET /not-a-real-route`
**When** the 404 handler renders
**Then** it returns `404 Not Found` with a styled page (NOT a framework default 404)
**And** the page renders the spine line variant for 404 + a "Back to safety →" link to `/` + a "Search via ⌘K" affordance
**And** the page carries NO signature canvas (AD-17)
**And** `pnpm audit:routes` includes the 404 in its invariant scan

---

#### Story 2.8: Lab + Lab [slug] Routes + Plain HTML iframe Tools

As a visitor curious about the experiments,
I want `/lab` and `/lab/<slug>` to render lab experiments with embedded tools as plain HTML iframes or static screenshots,
So that I can see experiments without client-side loaders.

**Acceptance Criteria:**

**Given** I navigate to `/lab`
**When** the route renders
**Then** it lists lab experiments (published entries with frontmatter `type: lab`) as cards
**And** the signature canvas mode is `lab (experiment-graph)` per AD-17 with `--accent-3` pink accent
**And** clicking a card opens `/lab/<slug>`

**Given** I navigate to `/lab/<slug>`
**When** the route renders
**Then** the MDX body renders, optionally wrapping tools in plain HTML `<iframe src="...">` tags
**And** static screenshots (`<img src="...">`) are the fallback if a tool can't be embedded
**And** iframes have `loading="lazy"` and a `title` attribute (a11y)
**And** NO `<LabToolIframeLoader>` client component exists (removed per AD-13)
**And** the signature canvas mode is also `lab (experiment-graph)` (per AD-17)

**Given** a tool iframe loads
**When** the iframe network-errors or returns a non-200
**Then** the static screenshot fallback renders in its place
**And** the page never crashes

---

#### Story 2.9: Per-Route A11y Assertions + Stale-Bookmark 308 Redirect

As a visitor arriving from an old / share link,
I want my URL to land at the correct route, every route to pass WCAG 2.1 AA,
So that I never hit a dead 404, and the site is accessible to all readers.

**Acceptance Criteria:**

**Given** pa11y-ci runs against the marketing routes
**When** CI executes
**Then** `/`, `/work`, `/work/<slug>`, `/about`, `/now`, `/now/feed.xml`, 404 each pass with zero WCAG 2.1 AA violations
**And** the homepage HTML carries `role="banner"` on header, `role="main"` on `<main>`, `aria-current="page"` on the active nav link, `aria-hidden="true"` on the signature canvas, `aria-live="polite" aria-relevant="additions"` on the ticker (where applicable)
**And** touch targets (magnetic CTA, footer recruiter-mode link, nav hamburger if any, filter chips) are ≥ 44px tall on mobile
**And** under `prefers-reduced-motion`, all transitions on these routes collapse (per AD-16 motion surface table)

**Given** an old share URL hits the site
**When** I navigate to a URL that previously routed to a removed/renamed path
**Then** a 308 Permanent Redirect carries me to the new path
**And** proxy.ts is the redirect handler (per AD-12 stale-bookmark amendment)

---

#### Story 2.10: /built Layered Architecture Page + Hover-Sync Layer Table

As an engineer landing from the homepage's "How this site is built" footer link,
I want `/built` to render the same architecture diagram at two scales (hero big + signature-canvas small) plus a layer table that hover-syncs with the diagram,
So that I can read the build notes in one viewport and inspect individual layers interactively.

**Acceptance Criteria:**

**Given** I navigate to `/built`
**When** the route renders
**Then** the page carries the hero big version of the layered architecture diagram (per AD-6: hero right column at `xl`+ ≥1280px) AND the signature-canvas small version (`data-sig-canvas-mode="layered-architecture"`)
**And** the two diagrams render the SAME diagram — co-sourced from `architecture-diagrams.md` (spec companion) AND `DESIGN.md.components.sig-canvas.modes` (AD-6 amendment)
**And** the signature canvas uses `--accent-2` cyan per AD-17
**And** the page carries the spine line variant for /built ("Walked into the build notes anyway." per UX-DR-11)
**And** the page carries ≥ 1 proof number from the v4 expanded set
**And** the page carries `href="/"` return path (FR-10)
**And** the page is in scope of `pnpm audit:routes` — also asserts `data-sig-canvas-mode="layered-architecture"` is present

**Given** a layer table is rendered below the hero
**When** I hover a layer row
**Then** the matching node in BOTH the big diagram and the small signature-canvas diagram lights up (`.is-active` on both, driven by `<LayerRowHover>` per AD-13 closed set)
**And** under `prefers-reduced-motion: reduce`, the hover-sync transition collapses to 0.01ms (Story 1.10 motion gate)
**And** the hover-sync only happens on `pointer:fine` devices; touch users get the diagrams without hover-sync

**Given** the architecture diagram content drifts (e.g. a new AD is added to the spine)
**When** the build runs
**Then** the 7-layer enumeration refreshes — content derived from the spine's AD list, not hardcoded
**And** `pnpm test` asserts the diagram layer count matches the AD-spine count (catches drift)

**Given** CI runs `pnpm audit:routes` against `/built`
**When** the static analysis scans
**Then** it asserts: spine-line variant present + ≥ 1 proof number + `href="/"` return path + `data-sig-canvas-mode="layered-architecture"` present
**And** pa11y-ci also passes against `/built` with zero WCAG 2.1 AA violations

---

### Epic 3: Content Surface (Patterns)

**Goal:** Build the patterns route family — `/patterns` (index) and `/patterns/[slug]` (individual patterns) — plus the case-study ↔ pattern citation walker so case studies deep-link to `/patterns/<slug>#move-{N>`.

**User value delivered:** A visitor arrives at a case study, reads a pattern citation, clicks it, and lands on the pattern page with the named move already scrolled into view. They read setup + 2–5 moves + counter-line ("When NOT to use it") + annotation. The Ship-Faster Pushback pattern carries its verbatim quote at `#move-4`. Patterns are first-class content surfaces with stable URLs.

**FRs covered:** FR-7, FR-8, FR-9

**Load-bearing ADs:** AD-4 (heading-ID contract — `<h2 id="move-{N}">` 1-indexed lowercase; `<h2 id="when-not">` for counter-line; other heading IDs are MDX layer's responsibility), AD-5 (Zod 4 `PatternSchema` with `.partial + .passthrough`), AD-13 (no `<PatternAnchorScroller>` client component — native HTML anchors via heading IDs), AD-17 (canvas mode per row table), AD-20 (a11y floor)

**Relevant UX-DRs:** UX-DR-12 (pattern rail with M1..M4 + counter-line sticky visual), UX-DR-13 (binding state patterns: deep-link to missing move shows toast "Move {N} doesn't exist" and smooth-scrolls to nearest), UX-DR-15 (9-route IA: `/patterns` and `/patterns/[slug]` are routes 04 and 04a)

---

#### Story 3.1: Five Named Patterns at Stable URLs

As a visitor,
I want the five named patterns to render at `/patterns/<slug>` with stable, content-pipeline-driven URLs,
So that each pattern has a shareable, deep-linkable home.

**Acceptance Criteria:**

**Given** the content repo (`sanjit-content`) holds the five pattern MDX files at `patterns/<slug>.mdx`
**When** the build runs (pulled from `sanjit-content` shallow clone)
**Then** the following five patterns render at stable URLs:
- `/patterns/canonical-model`
- `/patterns/syncfusion-data-grid`
- `/patterns/nopcommerce-plugin`
- `/patterns/ship-faster-pushback`
- `/patterns/friday-architecture-review`

**And** each pattern renders with: setup block + M1..Mn numbered moves + counter-line block + annotation
**And** each pattern is validated by the Zod 4 `PatternSchema` (Story 3.2 carries the schema)
**And** only `status: published` patterns are reachable; `status: draft` patterns are excluded from build output (AD-4 / AD-5)
**And** each pattern is wrapped in the `<PatternRail>` layout per UX-DR-12 with M1..Mn gradient-text numerals + `--typography-headline-md` headings + hover-sync with the signature canvas

**Given** the Ship-Faster Pushback pattern renders
**When** I navigate to `/patterns/ship-faster-pushback#move-4`
**Then** the verbatim quote renders at `#move-4` exactly as quoted from `docs/idea.md` and the FR-7 spec (locked verbatim copy per SPEC.md Why)

---

#### Story 3.2: Zod 4 PatternSchema + Additive Frontmatter

As a developer,
I want a Zod 4 `PatternSchema` that validates pattern frontmatter with `.partial + .passthrough`,
So that the build fails on malformed published frontmatter, accepts additive optional fields, and never breaks on a `draft` entry.

**Acceptance Criteria:**

**Given** `lib/content/pattern-schema.ts` exports `PatternSchema`
**When** I read the file
**Then** the schema is a Zod 4 `.object(...)` with `.partial()` + `.passthrough()` applied to the meta layer per AD-5
**And** `title` is the ONLY required field
**And** the optional fields include: `slug`, `summary`, `status` ('draft' | 'published'), `published_at`, `tags[]`, `proof_numbers[]`, `moves[]` (each with `id: 'move-1' | 'move-2' | ...`, `title`, `body`), `counter_line` (with `headline` + `body`), `annotation`
**And** unknown keys are preserved via `.passthrough()` on the meta layer (FR-13)

**Given** `pnpm test` runs the content-schema validation test suite
**When** a `status: published` pattern frontmatter fails `PatternSchema.safeParse()`
**Then** the build fails with a clear error pointing to the offending file + field
**And** when a `status: draft` pattern frontmatter fails
**Then** the build SUCCEEDS but the entry is excluded from `/patterns` index and `/patterns/[slug]` (AD-4 walker behavior)
**And** no exception is thrown — `draft` entries are simply filtered out

---

#### Story 3.3: Heading-ID Contract — `<h2 id="move-{N}">` and `<h2 id="when-not">`

As a developer,
I want the pattern page to render moves and counter-line with the binding heading-ID contract,
So that case-study pattern citations deep-link to `/patterns/<slug>#move-{N>` correctly.

**Acceptance Criteria:**

**Given** a pattern MDX file has `moves: [{ id: 'move-1', ... }, { id: 'move-2', ... }, ...]`
**When** the pattern page renders
**Then** each move renders as `<h2 id="move-{N}">` where N is the 1-indexed lowercase kebab form (e.g. `move-1`, `move-2`, ..., `move-5`) per amended AD-4
**And** the counter-line renders as `<h2 id="when-not">` (per amended AD-4 — this is the binding form)
**And** all other heading IDs (`<h3>`, `<h4>`) inside the MDX body are the MDX layer's responsibility — NOT enforced by the schema
**And** a unit test in `tests/content/pattern-schema.test.ts` asserts that the rendered HTML for each published pattern contains `<h2 id="move-1">`, `<h2 id="move-2">`, ..., `<h2 id="move-{N}">`, and `<h2 id="when-not">`

**Given** the binding form is enforced
**When** a builder drifts from the contract (e.g. uses `id="move_1"` or skips the counter-line)
**Then** the unit test fails and the PR is blocked
**And** the lint rule (Story 3.5) flags the drift

---

#### Story 3.4: /patterns Index Page

As a visitor discovering patterns,
I want `/patterns` to list the five patterns as cards with one-line + "Read the full" opening link,
So that I can scan the pattern catalog in one viewport.

**Acceptance Criteria:**

**Given** I navigate to `/patterns`
**When** the route renders
**Then** it lists all `status: published` patterns as cards with: pattern name, one-line summary, `Read the full →` opening link to `/patterns/<slug>`
**And** the signature canvas mode is `pattern (decision-graph)` with collapsed nodes (per AD-17 — index variant)
**And** the page carries the spine line variant + ≥ 1 proof number + `href="/"` return path (FR-10)
**And** the page is revalidated via `revalidateTag('pattern:<slug>', 'max')` on content commits (AD-1 / ISR tag enum)

**Given** the index has zero published patterns
**When** the route renders
**Then** the empty state renders: "No patterns yet — drafts in flight." (honest empty state, no crash)

---

#### Story 3.5: Case-Study ↔ Pattern Citation Walker + Missing-Move Toast

As a reader of a case study,
I want pattern citations to deep-link to the correct move on the pattern page,
So that I jump straight to the relevant guidance.

**Acceptance Criteria:**

**Given** a case-study MDX body contains a pattern citation like `<Link href="/patterns/canonical-model#move-3">Move 3 of Canonical Model</Link>`
**When** I click the citation
**Then** the browser navigates to `/patterns/canonical-model#move-3` and the page scrolls to `<h2 id="move-3">` with `behavior: 'smooth'`
**And** the URL fragment `move-3` is present in the address bar (deep-link integrity)

**Given** I deep-link to a non-existent move (e.g. `/patterns/canonical-model#move-99`)
**When** the pattern page renders
**Then** a toast appears: "Move 99 doesn't exist" (UX-DR-13 binding state pattern)
**And** the page smooth-scrolls to the nearest existing move (`#move-5` or the counter-line if past the last move)
**And** the toast auto-dismisses after 4 seconds; under `prefers-reduced-motion` the toast slides in instantly

**Given** the case-study body references a `status: draft` pattern
**When** the citation walker runs at build time
**Then** the walker logs a build warning but does NOT fail (draft entries don't break the build — AD-4 / AD-5)
**And** the citation link is rendered with a `(draft — coming soon)` suffix in the rendered HTML

**Given** a `status: published` pattern is cited
**When** the walker runs
**Then** the citation resolves to a valid `/patterns/<slug>#move-{N>` URL
**And** the link passes `pnpm test:e2e` Playwright check that the link's `href` matches `/patterns/<slug>#move-[0-9]+`

---

### Epic 4: Recruiter Surface

**Goal:** Build `/recruiter` as a standalone SSG route (recruiter-mode is a route, not a client state), the forward flow (canonical URL, PDF via Puppeteer, contact form), so a hiring manager can triage a candidate in 30 seconds and forward to a colleague in 60 seconds.

**User value delivered:** A footer-level "For recruiters?" opt-in link on every page routes to `/recruiter`. A hiring manager lands there, sees the recruiter-aware hero + four proof vectors + status strip + role-fit cards + closing CTA. They click "Copy URL" to share `https://sanjit.dev/recruiter?forward=1&case=<slug>` with a colleague. They click "Download PDF" to get a server-rendered PDF of the forward artifact. They click "Email me" to send the forward email via the Resend-backed contact form. On Puppeteer failure, the link mutates into "Print via browser" that calls `window.print()`.

**FRs covered:** FR-3, FR-4, FR-5, FR-6, FR-21

**Load-bearing ADs:** AD-7 (Puppeteer Node runtime, `maxDuration=60`, ≥ 1769 MB memory), AD-8 (recruiter-mode is a ROUTE not a client state; no `<RecruiterModeProvider>`, no `<RecruiterModeToggle>`, no `localStorage`), AD-14 (route-level forward flow with canonical URL), AD-17 (recruiter `condensed-4-node-status` canvas, `--colors.live` green accent), AD-20 (a11y floor — `aria-live="polite"` on `?case=` callout)

**Relevant UX-DRs:** UX-DR-5 (magnetic CTA uses `--button-live` instead of accent), UX-DR-7 (button-live variant reserved for recruiter-mode nav CTA + closing CTA only), UX-DR-11 (closing CTA microcopy: "Skip the scheduling dance. Reply with role + comp range."), UX-DR-12 (recruiter summary card hero right card-focal + 2×2 stat grid + role-fit card 2×2 grid with status badges)

---

#### Story 4.1: /recruiter SSG Route + Footer-Level Opt-In Link

As a hiring manager landing from anywhere on the site,
I want `/recruiter` to be a real SSG route, with a footer-level "For recruiters?" opt-in link on every public page routing to it,
So that I can reach the recruiter surface without any client-side state machinery.

**Acceptance Criteria:**

**Given** `app/recruiter/page.tsx` exists
**When** I navigate to `/recruiter`
**Then** the route renders as SSG (built at `next build` time)
**And** the route exports `generateStaticParams` returning `[{ case: undefined }]` (the canonical entry; `?forward=1&case=<slug>` is handled at request time via `searchParams` reading in `generateMetadata`)
**And** the route renders the recruiter surface: spine line + four proof vectors + status strip + role-fit cards + closing CTA
**And** the signature canvas mode is `recruiter (condensed-4-node-status)` per AD-17 with `--colors.live` green accent
**And** the page carries the spine line variant for recruiter mode + ≥ 1 proof number + `href="/"` return path (FR-10 / `pnpm audit:routes`)

**Given** the footer opt-in link is wired
**When** I view any public route (homepage, /work, /patterns, /now, /about, /lab, /built)
**Then** the footer contains a "For recruiters?" link with `href="/recruiter"` (NOT a button, NOT a toggle)
**And** the link carries the `--colors.live` green color treatment

**Given** the recruiter-mode is NOT a client state
**When** I grep the codebase
**Then** no `<RecruiterModeToggle>` component exists
**And** no `<RecruiterModeProvider>` exists
**And** no `localStorage.setItem('recruiter-mode', ...)` exists anywhere
**And** no `?for=recruiter` reads happen in app code (the proxy.ts 308 redirect handles `?for=recruiter*` → `/recruiter*` per Story 1.2)

---

#### Story 4.2: Forward Flow — Canonical URL + Copy URL Primary Affordance

As a hiring manager wanting to share this with a colleague,
I want the canonical URL `https://sanjit.dev/recruiter?forward=1&case=<slug>` to be the primary affordance for sharing, with a Copy URL button,
So that I can share a forward-aware URL with one click.

**Acceptance Criteria:**

**Given** I'm on `/recruiter?forward=1&case=wellbook`
**When** the page renders
**Then** the recruiter surface shows the wellbook-specific callout above the closing CTA (e.g. "Forwarding: Wellbook — case study 1 of 5")
**And** the callout carries `aria-live="polite"` per AD-20 so screen readers announce the recommended case-study on load
**And** the callout renders only when `?case=` is present in the query string

**Given** I'm on `/recruiter` (no `?forward=1`)
**When** the page renders
**Then** the recruiter surface renders without the case-study callout
**And** the page is still fully usable (spine + proof vectors + role-fit + closing CTA)

**Given** I want to share the URL
**When** I click the primary "Copy URL" affordance
**Then** the canonical URL `https://sanjit.dev/recruiter?forward=1&case=<slug>` is copied to clipboard via `navigator.clipboard.writeText`
**And** a toast confirms: "URL copied" (UX-DR-13 binding state pattern; auto-dismiss after 4s; collapses under `prefers-reduced-motion`)
**And** Plausible fires the `forward_button_click` event with `case=<slug>` metadata (FR-22 / AD-13 `<AnalyticsBeacon />`)

---

#### Story 4.3: PDF Forward Artifact via Puppeteer

As a hiring manager who wants a PDF version of the forward artifact,
I want to click "Download PDF" and get a server-rendered PDF of the recruiter surface for a specific case study,
So that I can attach it to an email or save it for later review.

**Acceptance Criteria:**

**Given** I'm on `/recruiter?forward=1&case=<slug>`
**When** I click the "Download PDF" secondary affordance
**Then** the browser navigates to `GET /api/forward-pdf?case=<slug>` (AD-7 endpoint)
**And** the response is `200 OK` with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="forward-<slug>.pdf"`

**Given** the serverless function runs at `runtime = 'nodejs'` with `maxDuration = 60` and ≥ 1769 MB memory allocated (AD-7)
**When** Puppeteer launches `@sparticuz/chromium`
**Then** it navigates to `https://sanjit.dev/recruiter?forward=1&case=<slug>` (the canonical URL — never a separate PDF-only route)
**And** it waits for the network idle state and a `window.__pdfReady = true` signal
**And** it emits `print` to PDF with single-page A4 layout
**And** the generated PDF is < 500 KB and renders in < 5s (FR-6 / SPEC §performance)
**And** the PDF is legible in Preview.app, Chrome's built-in PDF viewer, and Adobe Acrobat

**Given** Puppeteer fails (chromium launch error, navigation timeout, etc.)
**When** the function returns
**Then** the response is `500` with body `{ error: { code: 'PDF_GENERATION_FAILED', message: '...', request_id: '...' } }` (FR-22 error shape)
**And** the request is logged with `{ request_id, route: '/api/forward-pdf', duration_ms, status: 500 }`
**And** the recruiter UI mutates the "Download PDF" link into "Print via browser" — when clicked, it triggers `window.print()` on the `/recruiter` route (the print stylesheet is already loaded on the route)
**And** under `prefers-reduced-motion` the link swap is instant (no animated transition)

**Given** the cold-start budget is 4s
**When** Puppeteer launches the first request
**Then** cold start is amortized via Vercel's function caching; subsequent requests warm-start in < 500ms

---

#### Story 4.4: Per-Route Metadata — Recruiter searchParams-aware generateMetadata + Forward OG image

As a social-card crawler (Slack, Twitter, LinkedIn),
I want shared `https://sanjit.dev/recruiter?forward=1&case=<slug>` URLs to render rich, case-study-specific OG cards,
So that the recipient sees the spine line + the recommended case-study name in the preview.

**Acceptance Criteria:**

**Given** a crawler requests `/recruiter?forward=1&case=wellbook`
**When** the route renders (SSG + `generateMetadata` reads `searchParams` at request time)
**Then** the `<head>` includes:
- `<title>`: "Sanjit Majumdar — Forward: Wellbook"
- `<meta property="og:title">`: "Forward: Wellbook — Sanjit Majumdar"
- `<meta property="og:description">`: the case-study's tagline + ≥ 1 proof number
- `<meta property="og:image">`: 1200×630 forward-specific frame that includes the spine line + the case-study name + ≥ 1 proof number
- `<meta property="og:type">`: "article"
- `<meta property="og:url">`: canonical URL `https://sanjit.dev/recruiter?forward=1&case=wellbook`
- `<link rel="canonical">`: `https://sanjit.dev/recruiter/forward/wellbook` (the SEO-clean canonical) — `<meta property="og:url">` keeps the share form

**Given** a non-crawler (regular browser) requests the same URL
**When** the route renders
**Then** the body content is identical to `/recruiter?forward=1&case=wellbook` (no separate route needed)
**And** `searchParams.case` is read at request time (NOT cached in SSG output) — so changing `?case=` updates the og:image on the next request

**Given** the og:image is generated
**When** it renders at 1200×630
**Then** the frame contains: the spine line, the case-study name (e.g. "Wellbook"), the spine variant for recruiter mode, ≥ 1 proof number (e.g. "1.2M patients served"), and `--colors.live` green accent
**And** the image renders without clipping at all three common card aspect ratios (Slack 1:1, Twitter 1.91:1, LinkedIn 1.91:1)

---

#### Story 4.5: Contact Form — Forward Email via Resend + Cloudflare Turnstile

As a hiring manager wanting to email the builder directly,
I want a contact form on `/recruiter` (and elsewhere) that sends a forward-to-hiring-manager email via Resend, with Cloudflare Turnstile bot protection and a honeypot,
So that I can reach out without leaving the site.

**Acceptance Criteria:**

**Given** I'm on `/recruiter` (or any page with the contact form)
**When** I fill in the form (name, email, message, optional case-study context) and submit
**Then** the form posts to `POST /api/contact` (NEW endpoint — must be added to AD-3 closed list as part of this story; spine amendment required, per AD-3)
**And** the function validates the Cloudflare Turnstile token (`X-Turnstile-Token` header) against the secret key
**And** the honeypot field (`<input name="website" tabindex="-1" aria-hidden="true">`) must be empty
**And** the Resend API call sends the email to `forward-to-hiring-manager@sanjit.dev` with the recruiter template
**And** the response is `200 OK` with `{ ok: true, request_id: '...' }`

**Given** the form submission fails Turnstile validation
**When** the function returns
**Then** the response is `403 Forbidden` with `{ error: { code: 'TURNSTILE_FAILED', message: 'Bot protection failed', request_id: '...' } }`
**And** no email is sent

**Given** the form submission fails Resend API
**When** the function returns
**Then** the response is `502 Bad Gateway` with `{ error: { code: 'RESEND_FAILED', message: '...', request_id: '...' } }`
**And** the error is logged to Sentry (deferred via `<ErrorBeacon />`)

**Given** the form submission succeeds
**When** the response arrives
**Then** the UI shows a success state: "Email sent. Reply within 24 hours."
**And** the form fields are cleared
**And** Plausible fires the `recruiter_route_enter` event with `case=<slug>` metadata (FR-22 / AD-13)

---

#### Story 4.6: Recruiter Surface Components — Summary Card + Role-Fit Cards

As a hiring manager on `/recruiter`,
I want the recruiter summary card (hero right, card-focal with avatar + 2×2 stat grid + 2 CTAs) and a 2×2 role-fit card grid (status badges Strong fit / Partial / Open to),
So that I can quickly assess the candidate's fit for the role I'm hiring for.

**Acceptance Criteria:**

**Given** I'm on `/recruiter`
**When** the page renders
**Then** the hero is a two-column layout (left: spine line + positioning line + closing CTA; right: recruiter summary card per UX-DR-12)
**And** the recruiter summary card is `<div class="card-focal">` with avatar, name, role-title, 2×2 stat grid (Years, Proof points, Open to roles, Status), 2 CTAs (Copy URL + Download PDF per Story 4.2 / 4.3)
**And** below the hero, a 2×2 role-fit card grid renders with: each card carrying a status badge (`Strong fit`, `Partial fit`, `Open to`), role title, fit signal, ask
**And** cards use the closed card system (UX-DR-6: `--glass` fill + `--border` + `--radius-lg` + `--space-lg` padding + 1px gradient-card hairline at top via `::before`)
**And** under `prefers-reduced-motion`, card hover lift (translateY(-3px/-4px)) collapses

**Given** the magnetic CTA is rendered (UX-DR-5)
**When** I hover with a fine pointer and motion is not reduced
**Then** the CTA translates by `0.18×` cursor offset, clamped ≤ 8px
**And** the CTA uses the `--button-live` variant (green, not `--accent` violet) — reserved for recruiter-mode nav CTA + closing CTA only (UX-DR-7)
**And** under `pointer:coarse` OR `prefers-reduced-motion: reduce`, the CTA is static

---

#### Story 4.7: Recruiter Surface A11y + audit:routes + Plausible Events

As a hiring manager using assistive tech,
I want `/recruiter` and the forward flow to be fully WCAG 2.1 AA compliant,
So that I can complete my triage regardless of how I access the site.

**Acceptance Criteria:**

**Given** pa11y-ci runs against the recruiter routes
**When** CI executes
**Then** `/recruiter`, `/recruiter?forward=1&case=wellbook`, `/api/forward-pdf?case=wellbook` (response headers, no body lint), and `/api/contact` (response headers) all pass with zero WCAG 2.1 AA violations
**And** the recruiter surface HTML carries: `role="banner"`, `role="main"`, `aria-current="page"` on the active nav link, `aria-hidden="true"` on the signature canvas (which uses `--colors.live` green), `aria-live="polite"` on the `?case=` callout

**Given** `pnpm audit:routes` runs
**When** it scans `/recruiter`
**Then** the rendered HTML contains the spine-line variant for recruiter mode + ≥ 1 proof number + `href="/"` return path
**And** the static analysis also asserts presence of `data-sig-canvas-mode="recruiter-condensed-4-node-status"` (or the appropriate mode id per AD-17)

**Given** a Plausible event fires
**When** I trace the analytics pipeline
**Then** the following custom events are emitted (FR-22 / AD-13 `<AnalyticsBeacon />`):
- `forward_button_click` (Copy URL or Download PDF click) — payload `{ case_slug, source: 'recruiter' }`
- `recruiter_route_enter` (any visit to `/recruiter*`) — payload `{ case_slug?: string }`
- `pattern_deep_link_visit` (arrival from a case-study pattern citation) — payload `{ pattern_slug, move_id }`
- `case_study_forward_open` (opening `/recruiter?forward=1&case=<slug>` from a case study) — payload `{ case_slug }`

---

### Epic 5: Content Pipeline & Operational Topology

**Goal:** Wire the two-repo topology — `sanjit-portfolio` (code) + `sanjit-content` (content) — so content edits trigger ISR revalidation via webhook within 30s (5-min TTL fallback), the content-side `AGENTS.md` mirror is scoped to the rules the content repo can honor, and the snapshot write-back contract (KV → GitHub Action → commit `now-snapshot.json`) keeps phone-edits durable. CI audit catches any content commit that accidentally triggers a Vercel build.

**User value delivered:** The site ships from a clean separation — code lives in one repo, content lives in another, builds are never triggered by content edits, and the live `/now` feed survives phone-edits through the snapshot write-back contract. Editors can push content confidently; operators can prove the pipeline didn't accidentally trigger a code rebuild.

**FRs covered:** FR-12, FR-13, FR-14, FR-20

**Load-bearing ADs:** AD-1 (webhook coverage: `push`, `delete`, AND `force-push`; `revalidateTag(tag, 'max')`), AD-2 (Upstash Redis namespaces `now` and `contact` only; content-side perspective: never write KV from a content commit), AD-3 (closed serverless endpoint list — Story 5.1 may add `POST /api/contact`, requiring AD-3 amendment; Story 5.2 adds nothing new to endpoint list), AD-5 (Zod 4 `.partial + .passthrough`; only `title` required; unknown keys preserved via `entry.meta`), AD-9 (build pipeline does not run on content edits; `pnpm audit:content` weekly), AD-10 (snapshot write-back ownership — phone-edits write to KV only; GitHub Action in `sanjit-content` reads KV and commits `now-snapshot.json`; no serverless function pushes to the content repo)

**Note:** Story 5.1 adds `POST /api/contact` to the AD-3 closed list — this is a deliberate AD-3 amendment scope, not a violation. Story 5.1 carries the amendment log.

---

#### Story 5.1: Webhook Endpoint — POST /api/revalidate + ISR Tag Enumeration

As a content editor,
I want a push to `sanjit-content` to trigger ISR revalidation of only the affected routes within 30s,
So that the site reflects my edits without a full rebuild.

**Acceptance Criteria:**

**Given** `app/api/revalidate/route.ts` exists at edge runtime (AD-3 closed list)
**When** the route receives `POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]` with the `X-Webhook-Secret` header (HMAC-SHA256 of body, verified against the secret in Vercel env vars)
**Then** the route calls `revalidateTag(tag, 'max')` (AD-1 two-argument signature — Known Pitfall #3)
**And** the response is `200 OK` with `{ revalidated: true, tag, slug?, sha?, request_id: '...' }`
**And** the request is logged with `{ request_id, route: '/api/revalidate', duration_ms, status: 200 }`

**Given** a request arrives with a missing or invalid `X-Webhook-Secret`
**When** the route handles it
**Then** the response is `401 Unauthorized` with `{ error: { code: 'INVALID_SIGNATURE', message: '...', request_id: '...' } }`
**And** no revalidation happens

**Given** an unknown `tag` arrives
**When** the route handles it
**Then** the response is `400 Bad Request` with `{ error: { code: 'UNKNOWN_TAG', message: 'Tag not in closed enumeration', request_id: '...' } }`
**And** the closed tag enumeration (per ISR tag conventions) is:
- Typed: `<type>:<slug>` — `case-study:<slug>`, `pattern:<slug>`, `lab:<slug>`, `project:<slug>`
- Bare: `now`, `cv`

---

#### Story 5.2: Build Pipeline — Shallow Clone of sanjit-content + No-Build-on-Edit

As an operator running CI,
I want the build to shallow-clone `sanjit-content` at build time and to NOT be triggered by content commits,
So that the code pipeline stays fast and the content pipeline is decoupled from the code pipeline.

**Acceptance Criteria:**

**Given** the build runs in CI (e.g. Vercel production deploy, or a GitHub Action)
**When** `pnpm build` executes
**Then** the build script runs `git clone --depth=1 https://x-access-token:${GITHUB_CONTENT_TOKEN}@github.com/<user>/sanjit-content.git /tmp/sanjit-content` before `next build`
**And** the `next.config.js` `transpilePackages` or `pageExtensions` config picks up `.mdx` files from `/tmp/sanjit-content/**/*.{mdx,md}`
**And** Zod 4 schema validation runs on every `status: published` entry from `/tmp/sanjit-content/patterns/*.mdx`, `/tmp/sanjit-content/case-studies/*.mdx`, `/tmp/sanjit-content/lab/*.mdx`, `/tmp/sanjit-content/projects/*.mdx`
**And** the `draft` entries are filtered out and excluded from build output

**Given** a `sanjit-content` commit lands on `main`
**When** GitHub Actions evaluates triggers
**Then** NO `sanjit-portfolio` deployment is triggered (AD-9)
**And** the `sanjit-content` repo's GitHub Action `webhook.yml` is triggered (Story 5.3)
**And** `pnpm audit:content` in `sanjit-portfolio` CI asserts no Vercel deployment was triggered in the past 7 days by a content-repo commit

---

#### Story 5.3: sanjit-content GitHub Action — Webhook + Snapshot Write-Back

As an editor pushing content commits,
I want a GitHub Action in `sanjit-content` to fire the `/api/revalidate` webhook on every push/delete/force-push,
So that the live site reflects my edits within 30s without a code rebuild.

**Acceptance Criteria:**

**Given** `.github/workflows/webhook.yml` exists in `sanjit-content`
**When** any push, delete, or force-push event lands on `main`
**Then** the Action computes the HMAC-SHA256 of the changed-files JSON with `WEBHOOK_SECRET` and POSTs to `https://sanjit.dev/api/revalidate?tag=<tag>&slug=<slug>&sha=<sha>` (per-tag, per-slug)
**And** the response is logged; failures retry up to 3 times with 1s backoff
**And** force-push coverage is explicit (Known Pitfall #9 — missing force-push coverage breaks AD-1's freshness guarantee)

**Given** the snapshot write-back job is part of the same Action (AD-10)
**When** the schedule trigger fires (every 15 min)
**Then** the Action runs `scripts/snapshot-writeback.ts` which:
1. Reads Upstash Redis namespace `now` (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
2. Builds the latest entries JSON
3. Writes `now-snapshot.json` to the repo (with `bot-token` auth — `GITHUB_TOKEN` with `contents: write` permission)
**And** `now-snapshot.json` is committed with `chore(now-snapshot): update to <sha>` message
**And** the snapshot commit does NOT trigger any `sanjit-portfolio` deployment (AD-9, AD-10 — neither the content repo nor the code repo gets a build from this)

**Given** the snapshot write-back ownership is enforced (AD-10)
**When** I grep the codebase
**Then** no serverless function in `sanjit-portfolio` writes to the `sanjit-content` repo (no `gh` CLI calls, no `git push` from a serverless function)
**And** all `sanjit-content` writes happen via the GitHub Action in that repo only

---

#### Story 5.4: Stale-State Fallback Contract — /api/now + 7-Day Gate + Consumers

As a visitor landing on `/now`,
I want to see the latest entries with honest "last updated N days ago" framing when Upstash Redis is stale,
So that I trust the feed is real, not stale.

**Acceptance Criteria:**

**Given** `app/api/now/route.ts` exists at edge runtime (AD-3 closed list)
**When** the route receives `GET /api/now`
**Then** it reads the latest 10 entries from Upstash Redis namespace `now` (key pattern `now:entry:<uuid>`)
**And** it returns `{ entries: [...], fallback: false, last_updated: <ISO timestamp> }` if every entry's `updated_at` is within the last 7 days
**And** it returns `{ entries: [...], fallback: true, last_updated: <ISO timestamp from snapshot> }` if any entry's `updated_at` is older than 7 days, replacing `entries` with the snapshot from `now-snapshot.json` in the content repo (read at build time)

**Given** the 7-day gate fires `fallback: true`
**When** consumers render the data
**Then** the `/now` page renders the `(last updated N days ago)` tag next to each entry header (FR-14 / UX-DR-13 binding state pattern)
**And** the currently-building homepage section renders the empty state "Nothing new this week. — actually nothing." when entries is empty
**And** the page never renders an empty state without the `(last updated N days ago)` tag if a snapshot exists
**And** the page never crashes on a stale-state Redis read

**Given** Redis is unreachable
**When** the function handles the failure
**Then** the response is `{ entries: [], fallback: true, last_updated: null }` (snapshot-only fallback)
**And** the request is logged with `status: 500`, `error: 'REDIS_UNREACHABLE'`

---

#### Story 5.5: Content-Side AGENTS.md Mirror — Scoped to Content-Repo Rules

As a content editor working in `sanjit-content`,
I want a scoped `AGENTS.md` that mirrors only the rules the content repo can honor,
So that the content-side operational contract is clear and doesn't pull in code-side-only ADs.

**Acceptance Criteria:**

**Given** `AGENTS.md` exists in the `sanjit-content` repo (separate from `sanjit-portfolio/AGENTS.md`)
**When** I read the content-side AGENTS.md
**Then** it carries ONLY the following rules from the spine:
- AD-1 (webhook coverage: push/delete/force-push)
- AD-2 (KV namespace ownership — content-side perspective: "never write KV from a content commit")
- AD-5 (additive schema, `status: published` gating)
- AD-9 (build does not run on content edits)
- AD-10 (snapshot commit cadence — 15 min, KV-derived only)
- The closed frontmatter shape (additive, Zod 4 `.partial + .passthrough`)
- The closed ISR tag enumeration (`<type>:<slug>` + bare `now`/`cv`)

**And** it explicitly EXCLUDES (with a comment explaining why):
- AD-13 (closed client-component set — content repo has no Next.js runtime)
- AD-17 (signature-canvas mode list — no canvas in content repo)
- AD-18 (design tokens — no `@theme` block in content repo)
- AD-19 (responsive breakpoints — no Tailwind v4 CSS in content repo)
- AD-20 (accessibility floor — content repo renders plain Markdown, served as MDX to the code repo at build time)

**Given** the content-side `AGENTS.md` is in place
**When** a content editor contributes to `sanjit-content`
**Then** their contributions honor the scoped mirror
**And** the code-side `AGENTS.md` (in `sanjit-portfolio`) is the authoritative source — content-side is a derived mirror

---

#### Story 5.6: Content Frontmatter Schemas — Zod 4 + Additive .partial + .passthrough

As a developer,
I want Zod 4 schemas for all content types (case-study, pattern, lab, project) with `.partial + .passthrough` and `title` as the only required field,
So that unknown keys are preserved and the build fails on malformed published frontmatter only.

**Acceptance Criteria:**

**Given** `lib/content/` contains `case-study-schema.ts`, `pattern-schema.ts`, `lab-schema.ts`, `project-schema.ts`, plus a shared `meta-schema.ts`
**When** I read each schema
**Then** each is `Zod.object({ ... }).partial().extend({ meta: Zod.object({}).passthrough() })` (the meta layer preserves unknown keys)
**And** `title: Zod.string()` is the only required field in each schema
**And** common optional fields include: `slug`, `summary`, `status`, `published_at`, `tags[]`, `proof_numbers[]`, `updated_at`

**Given** `pnpm test` runs the content-schema validation suite
**When** a `status: published` entry fails safeParse
**Then** the build fails with a clear error: file path, failing field, expected schema
**When** a `status: draft` entry fails safeParse
**Then** the build SUCCEEDS — the entry is filtered out and not included in build output
**And** no exception bubbles up — drafts are silently excluded

**Given** the meta layer uses `.passthrough()`
**When** an MDX file contains a future-field like `seo_title` or `last_reviewed`
**Then** the build accepts the entry and `entry.meta.seo_title` etc. are accessible to the build pipeline
**And** the field is preserved verbatim — no type coercion

---

#### Story 5.7: Pattern Citation Walker — Walks Only `status: published`

As a developer,
I want the case-study ↔ pattern citation walker to walk only `status: published` entries,
So that drafts don't break the build.

**Acceptance Criteria:**

**Given** `lib/content/pattern-citation-walker.ts` exports `resolvePatternCitation(caseStudySlug, moveNumber)`
**When** I call it at build time
**Then** it walks all pattern MDX files in `sanjit-content`, filters by `status: published`, and resolves the citation
**And** if the cited pattern is `status: draft`, the walker logs a build warning (`WARN: pattern citation references draft entry`) and does NOT fail
**And** if the cited pattern is `status: published` but the move number doesn't exist, the walker emits a build warning and the link text shows `(coming soon)`
**And** if the cited pattern is `status: published` and the move exists, the walker resolves the link to `/patterns/<slug>#move-{N}` with `move{N}` 1-indexed lowercase kebab (amended AD-4 contract)

**Given** the walker runs on every build
**When** I inspect the build output
**Then** a unit test asserts all 5 named patterns are reachable with their `#move-{N}` IDs
**And** a Playwright e2e test (per FR-10 / AD-12) clicks each citation link and confirms the deep-link target exists in the rendered HTML

---

#### Story 5.8: CI Audit — `pnpm audit:content` + Operational Telemetry

As a developer,
I want `pnpm audit:content` to fail any PR that triggered a Vercel deployment from a content-repo commit,
So that the AD-9 invariant ("build does not run on content edits") is enforced.

**Acceptance Criteria:**

**Given** Vercel API access (`VERCEL_TOKEN` env var) is configured
**When** `pnpm audit:content` runs (weekly CI job, or on-demand)
**Then** the script queries the Vercel API for deployments in the past 7 days
**And** for each deployment, it cross-references the triggering commit SHA against known `sanjit-content` SHAs (sourced from the `sanjit-content` repo's commit history)
**And** if a deployment was triggered by a content-repo commit, the script fails with: `FAIL: Content commit <sha> triggered Vercel deployment <deployment_id> at <timestamp>`
**And** otherwise the script passes silently

**Given** the content-side AGENTS.md is the operational contract
**When** the developer updates AD-1, AD-2, AD-5, AD-9, or AD-10 in the spine
**Then** the change cascades to the content-side `sanjit-content/AGENTS.md` mirror (manual sync — the mirror is a separate file in a separate repo)

**Given** structured logging is enabled
**When** any webhook fires, revalidate call completes, or snapshot write-back commits
**Then** the log entry includes `{ request_id, route, duration_ms, status }` per FR-22
**And** Sentry captures any unhandled errors
**And** Plausible's custom events (`forward_button_click`, `recruiter_route_enter`, etc.) flow through `<AnalyticsBeacon />` (Story 1.4)

---
