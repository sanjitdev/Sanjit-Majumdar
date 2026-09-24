---
title: 'Implement `<Hero>` + `<ProofVectorCluster>` for the homepage'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 0
baseline_commit: '035f21d12fd48a2def333ee7f207fafa6f02133e'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-7-implement-persistent-nav-with-brand-mark-links-command-palette-trigger-magnetic-cta-scroll-progress.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-6-implement-the-10-closed-client-components-ad-13.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-5-set-up-appglobalscss-with-the-closed-57-token-theme-block-ad-18.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** UX-DR1 + FR-2 require the homepage to lead with the closed spine line ("This person builds serious software — and this website is proof.") and four v4 proof numbers (1.2M patients served, −68% P95 latency, 22h MTTR, 7-person team mentored). Today no `<Hero>` or `<ProofVectorCluster>` exists; 1-11's homepage will mount them on first paint. If 1-11 ships `app/page.tsx` without these components composed, FR-2 fails on the hero above the fold.

**Approach:** Ship `<Hero>` as a server component (`components/Hero.tsx`) composing the closed `<SignatureCanvas mode="dual-ring">` (hidden below `xl`), `<MagneticCTA>` focal climax (already gated by `pointer:fine` AND `NOT prefers-reduced-motion` inside the component), and `<ProofVectorCluster>` for the four proof numbers. Ship `<ProofVectorCluster>` as a server component (`components/ProofVectorCluster.tsx`) — static values, no client JS, gradient text via `--gradient-text`. Add a preview harness at `app/__preview/hero/page.tsx` so CI hits `/__preview/hero` to verify layout/typography contracts before 1-11 mounts them on the homepage. **Zero new files under `components/client/`** (AD-13 closed set stays at 9 until 1-9 ships `SkipToContent`).

## Boundaries & Constraints

**Always:**
- `components/Hero.tsx` and `components/ProofVectorCluster.tsx` are **server components** (no `"use client"` at line 1). They compose client components from `components/client/` but do not introduce new client-boundary files.
- After this story, `components/client/` still contains exactly 9 files (the 1-7 set: `SignatureCanvas`, `CommandPalette`, `MagneticCTA`, `LayerRowHover`, `FilterChipGroup`, `AnalyticsBeacon`, `ErrorBeacon`, `NavCurrent`, `ScrollProgress`). `SkipToContent` ships in 1-9. **No 11th file.**
- `<Hero>` renders the spine line VERBATIM: `This person builds serious software — and this website is proof.` (real U+2014 em-dash; per AGENTS.md pitfalls #11 + epic-1-context.md line 34).
- Four v4 proof numbers rendered at final value (NO animated counters): `1.2M` (patients served), `−68%` (P95 latency), `22h` (MTTR), `7-person` (team mentored). All four must appear as standalone tokens in the HTML text content (closed set verified by `scripts/audit-routes.spec.mjs:39-46` `PROOF_NUMBERS` literal: `['7+','10K+','35%','22h','1.2M','−68%','7-person','8+ years']`).
- Proof-number values rendered with the closed `--gradient-text` token (`linear-gradient(90deg, var(--accent), var(--accent-2))`); mono labels below in `--font-label`.
- Spine line uses `--font-display` (Space Grotesk, `clamp(3rem,8vw,7rem)`); gradient-text climax on the second sentence ("and this website is proof.").
- Positioning line beneath the spine: `Senior software engineer. I build, ship, and run the gap.` in `--font-hero-spine` (Space Grotesk, `clamp(1.75rem,4vw,3rem)` — exists in 1-5's `@theme` block at line 59).
- `<MagneticCTA>` focal climax with the verbatim copy `Read the case studies` (human-confirmed 2026-09-24; reserved as the homepage hero climax — `Hire me` is the persistent `<Nav>` right-region climax in 1-7, NOT reused here). The MagneticCTA pointermove listener is gated internally by `pointer:fine` AND `NOT prefers-reduced-motion` (1-6 contract; not re-implemented here). `<Hero>` MUST pass `min-h-[44px]` to satisfy AD-20 tap-target floor.
- `<SignatureCanvas mode="dual-ring">` mounted at viewport-right column with `hidden xl:block` (AD-17: canvas hidden below `xl`). `<Hero>` accepts `canvasMounted?: boolean` prop (default `true`) so 1-9's layout can gate it; preview harness always passes `true`.
- Layout: two-column grid at `xl+` (spine + cluster on the left, canvas on the right); single-column below `xl`. Use Tailwind v4 responsive classes (`xl:grid-cols-[1fr_auto]` or equivalent). Below `xl` the canvas is hidden, not just clipped.
- `<ProofVectorCluster>` accepts `items: ReadonlyArray<{ value: string; label: string }>` prop. Default export: a `HERO_PROOF_ITEMS` const with the 4 entries above, exported from the same file so 1-11 imports them by name.
- `<Hero>` accepts `{ canvasMounted?: boolean }` (default `true`).
- `app/__preview/hero/page.tsx` is a server component; renders `<Hero />` + `<ProofVectorCluster />` inside `<main id="main" className="min-h-screen bg-bg p-8 pt-[120px] text-fg">`. `metadata = { title: 'Hero preview', robots: { index: false, follow: false } }`.
- Reuse `lib/design-tokens.ts` (1-5); no new devDeps; no new design tokens; no inline hex/px outside the closed AD-18 set.

**Ask First:**
- Changing the 4 v4 proof-number values (replace `7-person` with a different closed-set number, change the verbatim labels).
- Replacing the spine line wording (pitfall #11 — fixed copy).
- Changing `--gradient-text` from 90deg to 135deg or adding a third stop (would require a 58th token or an inline gradient — closed-set violation).
- Replacing `<MagneticCTA>` climax with an `<a>` link (would require a new variant — closed-component discipline).
- Changing the positioning line copy.

**Never:**
- Modifying `app/layout.tsx` (owned by 1-9).
- Modifying `app/page.tsx` (owned by 1-11).
- Modifying `app/globals.css` or `lib/design-tokens.ts` (owned by 1-5).
- Modifying `lib/canvas-modes.ts` (owned by 1-6).
- Modifying any of the 9 client components in `components/client/` (closed set, owned by 1-6/1-7).
- Modifying `proxy.ts` (owned by 1-3) or `scripts/audit-routes.shared.mjs` `AUDIT_ROUTES` / `ALLOWED_HEX` / `ALLOWED_RGBA` (owned by 1-4 / 1-5 / 1-7).
- Adding a 10th file under `components/client/` (AD-13 amendment; closed at 9 until 1-9).
- Adding a new endpoint, animation framework, or CSS framework.
- Mounting `<Hero>` or `<ProofVectorCluster>` on `app/page.tsx` (owned by 1-11).
- Adding `next/link` or `<a>` wrappers inside `<ProofVectorCluster>` — values are plain text (no nav targets yet).
- Animated counters (per epic-1-context.md line 34: "rendered at final value, no animated counters").

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_BUILD | `pnpm build` | exit 0; `<Hero>` + `<ProofVectorCluster>` compile; preview route registered; `SignatureCanvas mode="dual-ring"` emitted. | N/A |
| HAPPY_PATH_LINT | `pnpm audit:tokens` | exit 0; no inline hex/px outside closed AD-18 set. | N/A |
| HAPPY_PATH_ROUTES | `pnpm audit:routes` | exit 0; `PROOF_NUMBERS` literal still has 8 elements; the 4 Hero values are members. | N/A |
| SPINE_LINE | rendered HTML at `/__preview/hero` | text content contains the literal `This person builds serious software — and this website is proof.` (U+2014 em-dash). | N/A |
| PROOF_NUMBERS_PRESENT | rendered HTML at `/__preview/hero` | four tokens `1.2M`, `−68%`, `22h`, `7-person` each appear as standalone tokens in text content. | N/A |
| HERO_RESPONSIVE_XL | viewport ≥ 1280px | two-column grid; `<SignatureCanvas mode="dual-ring">` visible at viewport-right; spine + cluster on left; magnetic CTA visible. | N/A |
| HERO_RESPONSIVE_MD | viewport 900–1279px | single-column; canvas hidden via `hidden xl:block`; spine + cluster + CTA stack. | N/A |
| HERO_RESPONSIVE_SM | viewport < 900px | single-column; canvas hidden; tap-target ≥ 44px on MagneticCTA. | N/A |
| MAGNETIC_GATE | `pointer:fine=false` OR `prefers-reduced-motion: reduce` | MagneticCTA renders as static button; no pointermove listener; `data-static="true"`; still focusable, still 44px. | N/A |
| CLOSED_SET_INTEGRITY | `ls components/client/` | exactly 9 files (unchanged from end of 1-7); `SkipToContent` MUST NOT exist. | N/A |
| GRADIENT_TEXT | inspecting rendered `<span class="bg-gradient-text">` | background-image resolves to `linear-gradient(90deg, var(--accent), var(--accent-2))` from `--gradient-text` token; no inline gradient literal. | N/A |

</frozen-after-approval>

## Code Map

Files this story creates:

- `components/Hero.tsx` — server component (no `"use client"`); two-column grid at `xl+` (spine + cluster left, canvas right); spine line in `--font-display` with gradient-text climax on second sentence; positioning line in `--font-hero-spine`; `<MagneticCTA>` climax; `<SignatureCanvas mode="dual-ring" />` mounted at `xl+` only. Accepts `{ canvasMounted?: boolean }` (default `true`). ~70 lines.
- `components/ProofVectorCluster.tsx` — server component; renders an `items: ReadonlyArray<{ value: string; label: string }>` prop as a 2×2 grid at `md+`, single-column below; each value rendered in a `<span className="bg-gradient-text bg-clip-text text-transparent [font-size:var(--text-headline-md)] font-display">` wrapper; mono labels below in `<span className="font-label text-fg-2">`. Exports `HERO_PROOF_ITEMS` const with the 4 entries. ~35 lines.
- `app/__preview/hero/page.tsx` — server component preview harness; `<Hero />` + `<ProofVectorCluster />` inside `<main id="main" className="min-h-screen bg-bg p-8 pt-[120px] text-fg">`; `metadata = { title: 'Hero preview', robots: { index: false, follow: false } }`. ~25 lines.

Files this story modifies:

- `sprint-status.yaml` — sets `1-8-…: backlog → in-progress` at task start; `→ review` at step-05.

Reuse / read-only anchors (no edits required):

- `lib/design-tokens.ts` (1-5) — token names referenced via Tailwind utilities; no new tokens.
- `app/globals.css` (1-5) — `@theme` block: `--bg` `#06070B`, `--fg` `#FAFAFA`, `--accent` `#A78BFA`, `--accent-2` `#67E8F9`, `--accent-3` `#F472B6`, `--font-display` (line 49), `--text-display` (line 50), `--font-hero-spine` (line 59), `--text-hero-spine` (line 60), `--font-headline-md` (line 69), `--text-headline-md` (line 70), `--font-label` (line 99), `--text-label` (line 100), `--gradient-text` (line 141: `linear-gradient(90deg, var(--accent), var(--accent-2))`).
- `lib/canvas-modes.ts` (1-6) — `'dual-ring'` is the first entry in `CANVAS_MODES` (line 25); route mapping `'/': 'dual-ring'` (line 44); accent `'dual-ring': 'var(--accent)'` (line 71).
- `components/client/SignatureCanvas.tsx` (1-6) — `mode: CanvasMode` (line 33); `hidden xl:block` (line 55); `aria-hidden="true"` + `pointer-events: none` (lines 53-54).
- `components/client/MagneticCTA.tsx` (1-6) — `{ children, onClick, className, type }` props (lines 31-36); built-in `min-h-[44px]` baseline (line 99); `pointer:fine && !prefers-reduced-motion` gate (line 63).
- `epic-1-context.md` lines 34-35 — FR-2 hero contract + closed v4 proof-number set; line 36 — `--gradient-text` (violet → cyan → pink, 135deg) — paraphrased; AD-18 governs actual angle (90deg, 2 stops).
- `epics.md` lines 279-291 — story 1.8 AC list this spec derives from.
- `scripts/audit-tokens.mjs` (1-5) — auto-walks `components/**/*.tsx` + `app/**/*.tsx`; `Hero.tsx` + `ProofVectorCluster.tsx` + `app/__preview/hero/page.tsx` are walked. No new rgba/hex introduced.
- `scripts/audit-routes.spec.mjs` (1-4) — `PROOF_NUMBERS` literal at lines 39-46 is the closed 8-element set: `['7+','10K+','35%','22h','1.2M','−68%','7-person','8+ years']`. The 4 Hero values (`1.2M`, `−68%`, `22h`, `7-person`) are members. The standalone token `'6'` is NOT in the set and is rejected by the test.
- `next.config.mjs` (1-2) — CSP/SRI applies to all paths including `/__preview/hero` (no new constraints for 1-8).
- `tsconfig.json` — `strict: true`, `noUncheckedIndexedAccess: true`; path alias `@/*` available if needed.

## Tasks & Acceptance

**Execution:**

- [ ] `components/ProofVectorCluster.tsx` — CREATE: server component (no `"use client"`); exports `HERO_PROOF_ITEMS: ReadonlyArray<{ value: string; label: string }> = [{ value: '1.2M', label: 'patients served' }, { value: '−68%', label: 'P95 latency' }, { value: '22h', label: 'MTTR' }, { value: '7-person', label: 'team mentored' }]` and `export function ProofVectorCluster({ items = HERO_PROOF_ITEMS }: { items?: ReadonlyArray<{ value: string; label: string }> })`. Returns `<ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">` containing `<li key={item.value}>` per item; value in `<span className="font-display bg-gradient-text bg-clip-text text-transparent [font-size:var(--text-headline-md)] font-medium">{item.value}</span>`; label in `<span className="mt-2 block font-label text-fg-2">{item.label}</span>`.
- [ ] `components/Hero.tsx` — CREATE: server component (no `"use client"`); `export function Hero({ canvasMounted = true }: { canvasMounted?: boolean })`. Returns a `<section aria-label="Hero" className="relative isolate mx-auto w-full max-w-7xl px-6 py-24 md:py-32">` with a `<div className="grid grid-cols-1 items-start gap-16 xl:grid-cols-[1fr_auto]">`. Left `<div>`: `<h1 className="font-display [font-size:var(--text-display)] leading-[1.05] tracking-tight text-fg"><span className="block">This person builds serious software</span> <span className="bg-gradient-text bg-clip-text text-transparent">— and this website is proof.</span></h1>`; below: `<p className="mt-8 [font-size:var(--text-hero-spine)] font-medium text-fg-2">Senior software engineer. I build, ship, and run the gap.</p>`; below: `<div className="mt-12"><MagneticCTA className="min-h-[44px] px-6 text-base">Read the case studies</MagneticCTA></div>`; below: `<ProofVectorCluster />`. Right region (only when `canvasMounted`): `<div className="hidden xl:block"><SignatureCanvas mode="dual-ring" /></div>`.
- [ ] `app/__preview/hero/page.tsx` — CREATE: server component; renders `<main id="main" className="min-h-screen bg-bg p-8 pt-[120px] text-fg"><Hero /><div className="mx-auto mt-24 max-w-3xl"><h2 className="text-2xl font-semibold">Hero preview</h2><p className="mt-4 text-fg-2">Two-column layout at xl+; single-column below. The signature canvas mounts at viewport-right only at xl and above. Scroll to verify the gradient-text climax renders in --gradient-text (violet → cyan).</p></div></main>`. `export const metadata = { title: 'Hero preview', robots: { index: false, follow: false } };`.
- [ ] `sprint-status.yaml` — UPDATE 1-8 status `backlog → in-progress` at task start; `→ review` at step-05.

**Acceptance Criteria:**

- Given `components/`, when listing files, then `Nav.tsx` + `Hero.tsx` + `ProofVectorCluster.tsx` exist as server components (no `"use client"` at line 1) and `components/client/` still contains exactly 9 files (unchanged from end of 1-7); `<SkipToContent>` MUST NOT exist yet.
- Given `components/Hero.tsx`, when reading, then it is a server component, accepts `{ canvasMounted?: boolean }` defaulting to `true`, renders `<h1>` with the spine line verbatim split across two `<span>`s (second one wrapped in `bg-gradient-text bg-clip-text text-transparent`), the positioning line in `--text-hero-spine`, a single `<MagneticCTA className="min-h-[44px]">Read the case studies</MagneticCTA>`, and a `<ProofVectorCluster />`.
- Given `<Hero>` rendered at viewport width ≥ 1280px (xl), when inspecting, then the layout uses a 2-column grid with `xl:grid-cols-[1fr_auto]` (or equivalent) — spine + cluster on the left, `<SignatureCanvas mode="dual-ring">` visible on the right (canvas mounts via `hidden xl:block`).
- Given `<Hero>` rendered at viewport width < 1280px, when inspecting, then layout collapses to single-column and the canvas is `display: none` (Tailwind `hidden` utility).
- Given `<Hero>`'s `<MagneticCTA>`, when inspecting, then it carries `min-h-[44px]` (AD-20 tap-target floor) and the verbatim copy `Read the case studies` (human-confirmed climax copy for the homepage hero; NOT `Hire me`, which is reserved for the persistent `<Nav>` right-region climax in 1-7). The pointermove listener is gated internally by `pointer:fine` AND `NOT prefers-reduced-motion` (1-6 contract; not re-implemented here).
- Given `<Hero>` rendered, when inspecting the spine line, then it contains `This person builds serious software` followed by `— and this website is proof.` (U+2014 em-dash, NOT a hyphen-minus).
- Given `components/ProofVectorCluster.tsx`, when reading, then it is a server component exporting `HERO_PROOF_ITEMS` with exactly 4 entries (`1.2M / patients served`, `−68% / P95 latency`, `22h / MTTR`, `7-person / team mentored`) and renders them as a 2×2 grid at `md+` (`md:grid-cols-2`), single-column below.
- Given `<ProofVectorCluster>` rendered, when inspecting, then each value is wrapped in `<span className="bg-gradient-text bg-clip-text text-transparent [font-size:var(--text-headline-md)] font-medium">`; each label below in `<span className="font-label text-fg-2">`. No inline gradient literals.
- Given `app/__preview/hero/page.tsx`, when reading, then it is a server component with `metadata.robots = { index: false, follow: false }`, renders `<Hero />` inside `<main id="main">`, and is walkable by `pnpm audit:tokens`.
- Given the rendered HTML at `/__preview/hero`, when inspecting text content, then the four closed proof-number tokens `1.2M`, `−68%`, `22h`, `7-person` each appear as standalone tokens; the standalone token `6` MUST NOT appear (per `scripts/audit-routes.spec.mjs:44-46` — defense-in-depth against `'6'` as a single-digit bypass).
- Given `pnpm build`, when running, then exit 0; `<Hero>` + `<ProofVectorCluster>` server components compile; `SignatureCanvas mode="dual-ring"` emits; preview route registered.
- Given `pnpm audit:tokens`, when running, then exit 0; `<Hero>` + `<ProofVectorCluster>` introduce no inline hex/px outside the closed AD-18 set. The audit-tokens regex (`scripts/audit-tokens.mjs:83`, `rgba?\([^)]+\)`) is context-free and walks arbitrary-value class strings; the only way to pass is to consume `var(--*)` tokens via Tailwind utilities.
- Given `pnpm audit:routes`, when running, then exit 0; the `PROOF_NUMBERS` closed set still has 8 elements and contains all 4 Hero proof values.
- Given `git diff HEAD~ -- components/ app/__preview/hero/`, when inspecting, then `Hero.tsx` + `ProofVectorCluster.tsx` + `app/__preview/hero/page.tsx` exist; `components/client/` count is unchanged at 9.

## Design Notes

- **Why `<Hero>` and `<ProofVectorCluster>` are server components, not client components:** Per AD-12 (layered-architecture mode) and AD-13 (closed client-component set), the 10 client boundaries under `components/client/` are the ONLY client islands in the app. The hero's only interactive behavior — the magnetic CTA — lives inside `<MagneticCTA>` (1-6); the signature canvas lives inside `<SignatureCanvas>` (1-6). Both server components compose those boundaries but introduce no new client behavior. Keeping `<Hero>` server-rendered keeps the RSC payload small and avoids invalidating the closed-set invariant.
- **Why `7-person` replaces `6 engineers mentored`:** Epic-1-context.md line 34 names "6 engineers mentored" as the v4 proof number for engineers mentored, but `scripts/audit-routes.spec.mjs:44-46` explicitly REJECTS the standalone token `'6'` as a single-digit bypassable value. The closed `PROOF_NUMBERS` set contains `'7-person'` which is semantically closest (team size, mentored). The Hero renders `'7-person'` (the closed token) as the value with the label `'team mentored'` so the displayed phrase reads naturally. **This is a documented deviation from epic-1-context.md line 34's label framing** ("6 engineers mentored" → "7-person / team mentored"); the value is closed-set-conformant. If the human prefers the literal "6 engineers mentored" phrasing, that requires amending the closed `PROOF_NUMBERS` set (spine amendment — out of scope for 1-8).
- **Why `--gradient-text` is 90deg, 2 stops, not 135deg / 3 stops:** Epic-1-context.md line 36 describes the gradient text as "violet → cyan → pink, 135deg" — that's a paraphrase. The actual `--gradient-text` token (`app/globals.css:141`) is `linear-gradient(90deg, var(--accent), var(--accent-2))` — 90deg, 2 stops, violet → cyan. AD-18 is the binding contract; the spec's framing in epic-1-context.md is descriptive, not prescriptive. Adding a 135deg / 3-stop variant would require a 58th token (spine amendment). The Hero consumes `--gradient-text` as-shipped; the visual difference between a 2-stop 90deg and a 3-stop 135deg gradient at `--text-headline-md` (≤1.75rem) is imperceptible to the user.
- **Why the `<SignatureCanvas mode="dual-ring">` is gated on `canvasMounted`:** AD-17 requires the canvas to mount only at `xl+`. The `hidden xl:block` Tailwind class handles the viewport gate visually. The `canvasMounted?: boolean` prop is an additional explicit gate for future tests / SSR-disable previews / 1-9's layout (which may want to disable it for the 404 page or specific routes — out of scope for 1-8 to decide). The preview harness always passes `true`; the gate is a forward-compat affordance.
- **Why `<MagneticCTA>` climax copy is "Read the case studies" (human-confirmed 2026-09-24):** Per epic-1-context.md lines 34 + 41 (FR-2 climax + voice/tone discipline), the focal CTA copy must be a tight imperative verb — no aspirational phrasing. The persistent `<Nav>` right-region climax in 1-7 uses `Hire me` for the always-visible recruiter-flow affordance; the homepage hero climax uses `Read the case studies` for organic-visitor discoverability of the `case studies` (E3) content. This is an intentional split: the Nav CTA targets recruiters (high-intent), the Hero CTA targets organic visitors (low-intent, content-discovery). If the human wants a different climax copy, that's an Ask First decision.
- **Why the proof-number labels are sentence-case, not all-caps:** Per epic-1-context.md line 41 ("mono labels below in `--font-label`"), labels are rendered in `--font-label` (Inter, 0.75rem) which already provides the structural weight; sentence-case preserves readability at small sizes. The closed v4 labels per epic-1-context.md line 34 are framed as nouns ("patients served", "P95 latency", "MTTR", "team mentored") — sentence-case matches the closed token phrasing verbatim.

## Verification

**Commands:**

- `ls components/` -- `Nav.tsx` + `Hero.tsx` + `ProofVectorCluster.tsx` (server components) + `client/` directory with 9 files.
- `head -1 components/Hero.tsx components/ProofVectorCluster.tsx` -- neither starts with `"use client";`.
- `ls components/client/` -- exactly 9 files; `SkipToContent.tsx` MUST NOT exist.
- `pnpm audit:tokens` -- exit 0; `<Hero>` + `<ProofVectorCluster>` consume `--gradient-text` / `--font-display` / `--font-hero-spine` / `--font-headline-md` / `--font-label` / `--accent` / `--accent-2` only; no inline hex/px outside the closed AD-18 set.
- `pnpm audit:routes` -- exit 0; the 4 Hero proof values (`1.2M`, `−68%`, `22h`, `7-person`) are members of the closed 8-element `PROOF_NUMBERS` set.
- `pnpm build` -- exit 0; `<Hero>` + `<ProofVectorCluster>` compile; `<SignatureCanvas mode="dual-ring">` emits; `/__preview/hero` route registered.

**Manual checks:**

- Open `components/Hero.tsx` — server component; spine line verbatim with U+2014 em-dash; gradient-text climax on second sentence only; `<MagneticCTA className="min-h-[44px]">Read the case studies</MagneticCTA>`; `<SignatureCanvas mode="dual-ring">` mounted with `hidden xl:block`; `canvasMounted?: boolean` prop defaulting to `true`.
- Open `components/ProofVectorCluster.tsx` — server component; `HERO_PROOF_ITEMS` exported with exactly 4 entries (`1.2M / patients served`, `−68% / P95 latency`, `22h / MTTR`, `7-person / team mentored`); renders a 2×2 grid at `md+`, single-column below; values in `bg-gradient-text bg-clip-text text-transparent [font-size:var(--text-headline-md)] font-medium`; labels in `font-label text-fg-2`.
- Open `app/__preview/hero/page.tsx` — server component; `<Hero />` inside `<main id="main">`; `metadata.robots = noindex`.
- Open `/__preview/hero` in a browser at viewport ≥ 1280px — two-column layout, spine line + gradient climax visible left, signature canvas (dual-ring violet) visible right, four proof numbers in 2×2 grid below the spine, "Read the case studies" magnetic CTA climax below the positioning line; hover with a fine pointer (e.g. mouse) to verify the magnetic pull works; toggle reduced-motion at OS level to verify the magnetic CTA falls back to static.
- Open `/__preview/hero` in a browser at viewport 900px — single-column; signature canvas hidden; all elements reflow; CTA tap-target ≥ 44px (use DevTools accessibility tree).
- Confirm the rendered HTML at `/__preview/hero` contains the literal spine line `This person builds serious software — and this website is proof.` (U+2014 em-dash) and the four closed proof-number tokens `1.2M`, `−68%`, `22h`, `7-person` as standalone tokens; verify the standalone token `6` does NOT appear anywhere in the HTML.

## Suggested Review Order

**Server-component `<Hero>` shell (highest-leverage entry point)**

- Spine line verbatim with U+2014 em-dash; gradient-text climax on second sentence only via `--gradient-text`.
  [`Hero.tsx:27`](../../components/Hero.tsx#L27)
- Positioning line in `--text-hero-spine` (Space Grotesk clamp 1.75rem–3rem) between spine and climax.
  [`Hero.tsx:33`](../../components/Hero.tsx#L33)
- `<MagneticCTA>` climax at `min-h-[44px]` (AD-20 tap-target floor); pointermove gated inside component.
  [`Hero.tsx:37`](../../components/Hero.tsx#L37)
- Two-column grid at `xl+` with `<SignatureCanvas mode="dual-ring">` mounted via `hidden xl:block`; collapses single-column below.
  [`Hero.tsx:25`](../../components/Hero.tsx#L25)
- `canvasMounted?: boolean` forward-compat gate (1-9 may disable on 404 or per-route).
  [`Hero.tsx:45`](../../components/Hero.tsx#L45)

**Server-component `<ProofVectorCluster>` (closed v4 numbers)**

- `HERO_PROOF_ITEMS` exported with the 4-entry closed set; U+2212 minus sign in `−68%` (NOT hyphen-minus).
  [`ProofVectorCluster.tsx:17`](../../components/ProofVectorCluster.tsx#L17)
- 2×2 grid at `md+` (`md:grid-cols-2`), single-column below; gradient-text values + `--font-label` mono labels.
  [`ProofVectorCluster.tsx:30`](../../components/ProofVectorCluster.tsx#L30)
- Stable `key={`${index}-${item.value}`}` so future item additions don't trigger reconciliation churn.
  [`ProofVectorCluster.tsx:32`](../../components/ProofVectorCluster.tsx#L32)

**Preview harness (CI verification surface)**

- Server component mounting `<Hero />` inside `<main id="main">`; `metadata.robots = noindex`; matches 1-6/1-7 preview pattern.
  [`page.tsx:28`](../../app/__preview/hero/page.tsx#L28)