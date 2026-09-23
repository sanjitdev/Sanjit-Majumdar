---
title: Sanjit Majumdar — Engineering Portfolio · Experience & Behavior
created: 2026-09-23
updated: 2026-09-23
status: final
project: Sanjit-Majumdar
sources:
  - docs/idea.md
  - docs/cv.md
  - _bmad-output/specs/spec-sanjit-portfolio/SPEC.md
  - _bmad-output/planning-artifacts/prds/prd-Sanjit-Majumdar-2026-09-23/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md
  - mockups/v4/00-design-system.md
  - mockups/v4/*.html (9 pages, mode-adaptive signature canvas)
  - DESIGN.md (paired, in this workspace)
---

# EXPERIENCE.md

> Source-of-truth for behavior, IA, interactions, states, accessibility. `DESIGN.md` owns visual identity; cross-references appear as `{path.to.token}` per the Google Labs spec. Both spines win on conflict with mocks and imports. The site is its own case study: every behavioral choice is evidence of engineering judgment. v4 (cinematic dark) supersedes v3 (Quiet Authority) as the visual direction; behavioral invariants from earlier spines (decentralized pages with ≥1 proof number + return path, recruiter-mode opt-in not header feature, honest empty states, /now as a live ticker) carry forward.

## Foundation

Single-surface responsive web. Static HTML, one file per route, inline CSS + minimal vanilla JS, no build step, no client-side hydration. Backed by ~30 CSS custom properties (see `DESIGN.md.Colors`). Form factor: desktop, tablet, mobile. No PWA install prompt, no native app. Performance budget: LCP < 1.2s on Slow 4G (per "How this site is built" page); text-first rendering everywhere; zero hero images.

The site is its own case study. **Every behavioral choice is evidence of engineering judgment, not decoration.** Recruiter-mode is a footer opt-in (`09-recruiter.html` link), not a header feature — the site reads engineer-first; recruiters who need the condensed view click once.

The signature interaction — `{components.sig-canvas}` — is the persistent decorative element that earns its slot by morphing per page. It is **not** a navigation aid and is `aria-hidden="true"`.

## Information Architecture

9 routes. Single-file-per-route. Every route ships with at least one proof number, a return path, and a defined next step. The `01-homepage` canvas-morph is the visual index: each route adds a node to the IA graph.

| Surface | Reached from | Purpose |
|---|---|---|
| `01-homepage.html` (`/`) | Direct load, any inbound | Spine + metrics + featured proof + most-recent work + lab teaser + currently-building summary + built-link footer |
| `02-work.html` (`/work`) | Nav | Work bucket: case-study index with filter chips, featured projects + upcoming drafts |
| `03-case-study.html` (`/work/wellbook`) | `/work` row, deep-link | One full case study with sticky TOC, 6 sections (Context → Problem → Approach → Architecture → Decisions → Results) + magnetic CTA at climax |
| `04-pattern.html` (`/patterns/canonical-model`) | Nav, deep-link from case studies | Canonical Model engineering playbook: numbered moves + counter-line + worked example |
| `05-now.html` (`/now`) | Nav, homepage currently-building summary | Live ticker of in-flight work + subscribe form |
| `06-about.html` (`/about`) | Nav | Bio, experience timeline, philosophy, personality, contact |
| `07-lab.html` (`/lab`) | Nav | Lab / playground: featured experiments, games, open-source tooling |
| `08-built.html` (`/built`) | Homepage footer, nav | "How this site is built" — the signature canvas **IS** the layered architecture diagram |
| `09-recruiter.html` (`/?for=recruiter`) | Footer "For recruiters?", footer-CTA on `06-about` | Condensed view: status strip + summary card + numbers + experience timeline + stack + role-fit |

Sidebar / nav collapses below `1100px` (nav links hidden, command palette trigger still visible). Below `900px` the cmdk trigger also disappears — the user can still open the palette via ⌘K shortcut. No modal stacks > 1 level deep.

→ Composition reference: `mockups/v4/*.html` (9 pages). Both spines win on conflict.

## Voice and Tone

Microcopy. Brand voice lives in `DESIGN.md.Brand & Style`.

| Do | Don't |
|---|---|
| "This person builds serious software — and this website is proof." (spine, hero) | "Welcome to my portfolio!" |
| "Walked into the build notes anyway." (built-page hero) | Generic "About this site" |
| "the gap annoyed me." (lab-page hero) | Marketing copy on side projects |
| "Skip the scheduling dance. Reply with role + comp range." (recruiter closing CTA) | Generic "Let's connect" |
| "Things I built because the gap annoyed me." (lab body) | "Passionate about building solutions!" |
| "Used by 1.2M monthly patients. P95 latency −68% over 14 months." | Vague "10K+ users" without context |
| Empty NOW state: "Nothing new this week. — actually nothing." | Aspirational "Stay tuned for exciting updates!" |
| Lab: "v0.3 live. The idea ran out of steam after that." | Generic tool description |
| Pattern counter-line: "When one system owns the truth and others read-only, skip canonical model." | Softened paraphrases of edge cases |
| 8+ years · 1.2M users · 22h MTTR · −68% P95 (proof metrics) | "Years of experience" + adjectives |
| Honest microcopy ("Last updated 2026-09-22") | Celebratory timestamps |

Pattern copy mirrors the dryness: the *What it is* paragraph should read like an internal RFC, not marketing.

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| `Header` (nav) | Every public route | Persistent. Brand mark + nav links + `{components.cmdk-trigger}` + `{components.magnetic-cta}` (or `{components.button-live}` on recruiter). Sticky, `76px` tall, `backdrop-filter: blur(20px)`. Bottom edge carries the `{components.scroll-progress}` bar. |
| `Hero` (page-level) | Every page except recruiter | Spine line (display + gradient-text climax fragment), `{typography.hero-spine}` description, optional `{components.breadcrumb}` above. Two-column on `built` (hero + embedded architecture canvas). |
| `Signature canvas` (`{components.sig-canvas}`) | Every page (≥1280px viewport) | Persistent. `aria-hidden="true"`. Mode-adaptive per page (see `{components.sig-canvas}.modes` in DESIGN.md). Idle: soft `sigFlow` dash-offset animation on active edges. Hidden `< 1280px` viewport. |
| `Scroll progress bar` (`{components.scroll-progress}`) | Nav (every page) | `transform: scaleX(var(--progress))` driven by passive scroll listener, capped 0–1. Color `{colors.accent}`. 100ms transition. |
| `Command palette` (`{components.cmdk-trigger}` + `{components.cmdk-panel}`) | Nav (every page) | ⌘K / Ctrl-K opens; Esc closes. `role="dialog"` `aria-modal="true"` `aria-labelledby`. Glass scrim `backdrop-filter: blur(24px)`. Live fuzzy filter, keyboard arrow nav, Enter to navigate, hidden by default. Focus trap inside input + list. |
| `Magnetic CTA` (`{components.magnetic-cta}`) | Hero / nav (one focal CTA per page) | `pointermove` translates button by `0.18×` pointer offset (clamped at ≤8px). Gated by `pointer:fine` AND NOT `prefers-reduced-motion`. Touch / reduced-motion users get static button. |
| `Live CTA` (`{components.button-live}`) | Recruiter nav + closing CTA | Same shape as primary button, but `{colors.live}` fill instead of accent. Signals "action available, status-driven" — distinct from brand accent. |
| `Card` (`{components.card}`) | Work, lab, role, layer, deal | `{colors.glass}` fill, `{colors.border}` border, top hairline via `::before`. Hover = `translateY(-3px or -4px)` + `{colors.border-accent}` border + `{shadow-lg}`. Focus-visible = same visual richness + 2px accent outline. |
| `Card (focal)` (`{components.card-focal}`) | Hero CTA, summary card, "How this site is built" main card | `{rounded.xl}` corner, `{spacing.space-xl}` padding. Same hover/focus rules as generic card. |
| `Ticker row` (`{components.ticker-row}`) | `05-now`, lab featured list | Vertical row. Border-bottom 1px, padding `1.75rem 0`. Dot variants: `{colors.live}` (active), `{colors.accent}` (draft), `{colors.foreground-4}` (prior). Status string maps to dot color. |
| `Section head` | Every major section | `{typography.label}` numbered prefix (`01 / Featured`) + `{typography.headline-lg}` title + `{typography.body-md}` sub. Border-bottom 1px. Two-column on `lg`, stacks on `< md`. |
| `Filter chip` group | `02-work` | Per-chip `aria-pressed` toggle. Single active at a time. On click: clear others, set `aria-pressed="true"` on clicked chip. (Filter does not need to actually filter for v4 — the index renders all case studies; the chips are a visual organization pattern.) |
| `Sticky TOC` | `03-case-study` | Right column on `≥ lg`, top on `< lg`. Click scrolls to section. Active section highlighted via IntersectionObserver. |
| `Pattern rail` | `04-pattern` | Numbered moves (`M1` `M2` `M3` `M4`) with gradient-text numerals + `{typography.headline-md}` headings. Hover sync highlights the move in the signature canvas. |
| `Counter-line` | `04-pattern` | "When NOT to use it" block. Visually distinct: `{colors.warn}` left border (3px), `{colors.foreground-2}` body, never mistaken for advice. |
| `Architecture diagram` | `08-built` (hero right column) **+** `signature canvas` (top-right slot) | Same diagram, two scales. Big version = `{components.card-focal}` with full SVG; small version = compact 7-layer stack in the persistent canvas. Hover-sync between layer-table rows and architecture nodes. |
| `Personality card` | `06-about` | 3×2 grid. Numbered (01..06) or linked (Lab, Now). Mono number prefix, `{typography.card-title}` name, `{typography.body-sm}` description. |
| `Subscribe form` | `05-now` | Email input + submit button. Submit handler is a stub for v4 (no real backend); the input does NOT block render and the form does NOT show an error state. The interaction is `addEventListener` based, no inline handlers. |
| `Recruiter summary card` | `09-recruiter` (hero right) | `{components.card-focal}` with avatar (gradient square w/ monogram) + name + role + meta (location, timezone) + 2×2 stat grid + 2 CTAs (live + secondary). |
| `Role-fit card` | `09-recruiter` (#fit section) | 2×2 grid. Status badge (Strong fit / Partial / Open to) in `{typography.label}`. `{typography.card-title}` heading + `{typography.body-md}` description. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Cold app load | Any page | First paint at < 1.2s. No skeleton shimmers needed for static HTML; the file is the data. |
| Reduced-motion preference | Any surface | All `animation-duration` and `transition-duration` collapse to `0.01ms` via `@media (prefers-reduced-motion: reduce)`. Magnetic CTA short-circuits entirely. |
| Touch device (`pointer: coarse`) | Any surface | Magnetic CTA disabled. Hover effects on cards degrade to active-state on tap. Signature canvas hidden (`< 1280px` typically). |
| `prefers-color-scheme: light` | Any surface | N/A — site is dark-mode canonical. There is no light-mode pair in v4. Users with light preference see the same dark surface. |
| Command palette open | Any surface | `role="dialog"` `aria-modal="true"` scrim + 24px blur. Focus trapped inside input. Esc closes. Scrim click closes. List filters live as the user types. |
| Command palette with zero matches | `cmdk-list` | Empty state: render the result list with no rows. The `<input>` keeps focus. The scrim remains visible. |
| Signature canvas viewport too small | Any surface (viewport < 1280px) | `display: none` on `.sig-canvas-wrap`. Layout reflows the freed 240×240 + 24px right margin. |
| Pattern page deep-link to missing move | `04-pattern` | Smooth-scroll to nearest existing move, toast: "Move {N} doesn't exist; showing the closest match." (Carried from earlier spine.) |
| Empty NOW state | `05-now` | "Nothing new this week. — actually nothing." + last-good snapshot tag (carried from earlier spine). |
| Lab feature with no preview image | `07-lab` | Render a CSS-only gradient preview via the four `.lab-preview-N` variants (linear / radial / layered / blotch). No raster placeholders. |
| Recruiter-form submit (v4 stub) | `05-now` subscribe | The submit handler is a no-op stub for v4. Form does not block render and does not show error state. |
| Layer-row hover (built page) | `08-built` | The corresponding `.arch-node` in the architecture diagram (both hero big version and signature canvas small version) gains `.is-active` class. `prefers-reduced-motion` short-circuits the class swap. |
| Filter chip toggle | `02-work` | Single-active. Other chips' `aria-pressed` flip to `false`. Filter does not actually filter in v4 (renders all) — the chip is visual organization. |

## Interaction Primitives

**Keyboard-first.** The audience is engineers and recruiters. Keyboard surface is the product.

| Key | Action |
|---|---|
| `⌘K` / `Ctrl-K` | Toggle command palette |
| `↑` / `↓` | Navigate palette list (when palette open) |
| `Enter` | Activate selected palette item |
| `Esc` | Close command palette |
| `Tab` / `Shift-Tab` | Move focus through interactive elements (cards, links, buttons) |
| `g` (then `h`/`w`/`l`/`p`/`n`/`a`/`b`) | Reserved for future deep-link navigation. NOT implemented in v4 — kept reserved per v3 spine. |
| `/` | Reserved for future search shortcut. NOT implemented in v4. |

**Mouse / Pointer:** click to act. Hover reveals secondary affordances on `md+`. The signature canvas never responds to pointer events (`pointer-events: none`) — it is decorative.

**Touch users:** tap to act. Hover effects on cards degrade to active-state on tap. Magnetic CTA is auto-disabled.

**Banned everywhere:** infinite scroll, hover-only affordances on `< md`, drag-to-reorder, modal stacks > 1 level deep, focus on hidden elements, layout shifts on hover, animations that change `width` / `height` / `top` / `margin`.

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md` (verified: `#FAFAFA` on `#06070B` ≈ 19:1, well past WCAG 2.1 AA 4.5:1).

- **WCAG 2.1 AA** across the responsive web surface.
- Every public route renders with semantic landmarks (`<header role="banner">`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`).
- **Skip-to-content** link as first focusable element on every page (`<a class="skip" href="#main">Skip to content</a>`).
- **`role="dialog"` `aria-modal="true"` `aria-labelledby`** on the command palette. Focus trap inside. Esc closes.
- **`aria-current="page"`** on the active nav link. `:focus-visible` outline rule reserved for genuine focusable elements only (per WCAG 2.4.11).
- **`aria-hidden="true"`** on the signature canvas (decorative) and any purely visual chrome (e.g., gradient hairlines via `::before`).
- **`aria-label`** on every icon-only or label-less button (cmdk trigger, recruiter-CTA, footer-recruiter button).
- **`aria-pressed`** on filter chips and any toggle button.
- **`aria-live="polite"`** on the NOW ticker list — new entries announce.
- **`prefers-reduced-motion`** honored site-wide (animation/transition collapse to 0.01ms; magnetic CTA disabled).
- **`pointer:fine` AND NOT reduced-motion** gates magnetic CTA.
- Touch targets ≥ 44px on mobile (per Apple HIG / Material).
- Reduced-motion fallbacks: under `prefers-reduced-motion: reduce`, all animations collapse; the final readable state is always rendered.

## Responsive & Platform

| Breakpoint | Behavior |
|---|---|
| `xl` (≥1280px) | Full nav visible. Signature canvas visible in fixed 240×240 slot. Two-column hero on `built`. |
| `lg` (1100–1279px) | Nav links + cmdk trigger visible. Signature canvas hidden. Single-column hero on `built`. |
| `md` (900–1099px) | Nav links + cmdk trigger hidden (cmdk still openable via ⌘K). Grids collapse to 2-up. |
| `sm` (<900px) | All grids single column. Hero padding tightens. Signature canvas fully hidden. Grids use single column. Footer stacks. |

The site is responsive web, not a native mobile app. Mobile is read + share + light-edit; the primary surface is desktop / laptop. Bangladesh 2G edge case (per PRD): text-first rendering, no hero images, system fonts as fallback, sub-100 KB initial transfer per page (`08-built.html` / `01-homepage.html` are the heaviest at ~50KB each; most pages ~40KB).

## Inspiration & Anti-patterns

- **Lifted from Linear / Vercel:** the cinematic dark palette + oversized editorial typography + restrained glass. The signature canvas borrows from the way those products reward attention without claiming it.
- **Lifted from Raycast / Linear commands:** the command palette as primary navigation metaphor (⌘K). Keyboard-first interaction model.
- **Lifted from sivers.nl:** `/now` as a live status feed with honest timestamps.
- **Lifted from Stripe Press:** the editorial restraint — let typography and layout do the work, never decoration. The work is the work.
- **Rejected — generic dev templates:** no neon overload, no "Hi, I'm {name}, welcome to my portfolio" hero, no skill badges with percentage bars.
- **Rejected — animated statistics counters on scroll:** numbers render at their final value. The signature canvas animates `stroke-dashoffset` only on its edges — never on data.
- **Rejected — modal stacks:** forward-modal opens from any surface but is the only modal; no nested dialogs. Command palette is single-instance.
- **Rejected — recruiter-mode as header feature:** the route is footer-level (`09-recruiter.html`). The default site reads engineer-first.
- **Rejected — decorative 3D / code rain:** the canvas is flat 2D SVG. The cinematic feel comes from typography + glass + restraint, not WebGL.

## Key Flows

### Flow 1 — Priya the recruiter, 30s triage (per PRD UJ-1)

1. Priya clicks the link Sanjit shared from his `/now` subscribe confirmation. Cold visit. Corporate laptop.
2. The site renders in < 1.2s. She sees "Sanjit Majumdar · Engineering" in the nav and the spine line in the hero: *"This person builds serious software — and this website is proof."*
3. She scrolls past the spine into the proof metrics. Numbers land: 1.2M patients served, −68% P95 latency, 22h MTTR, 6 engineers mentored.
4. She notices `09-recruiter.html` linked from the nav and the home page's closing CTA. Hmm. She clicks.
5. Recruiter view loads. Status strip at top: *Available · Remote-first · Open to relocation · Last updated 2026-09-22.* Live-green color signals status; distinct from accent.
6. The summary card on the right shows the condensed numbers. The closing CTA: *"Skip the scheduling dance. Reply with role + comp range."*
7. She clicks. Email compose opens with `sanjit@example.com` pre-filled. Climax: forward sent.

**Edge case:** Priya's network blocks email. The site still loaded in < 1.2s and the phone number on `06-about#contact` is also a contact path.

### Flow 2 — Marcus the hiring manager, 60s verdict (per PRD UJ-2)

1. Marcus clicks the link Priya forwarded: `09-recruiter.html`.
2. Page lands with status strip + summary card + 4 numbered sections (Numbers / Experience / Stack / Fit).
3. He reads the experience timeline: Wellbook healthcare SaaS (1.2M MAU), Surakkha civic safety, Finlight fintech. The roles track to his company's needs.
4. He scrolls to the role-fit section. Status badges say "Strong fit" for Senior IC5 + Staff-track, "Partial fit" for EM, "Open to" for Principal.
5. He clicks the closing CTA. Climax: he opens the case-study (`03-case-study.html`) directly via a cmdk navigation pattern.
6. The case study opens with the sticky TOC on the right. He clicks "Results" — jumps there instantly.
7. He scrolls through the metrics-grid: `-68%`, `1.2M`, `22h`. The numbers from the recruiter view reconcile to the case study's measured results. Marcus has formed a verdict. Climax: "yes, schedule it."

**Edge case:** Marcus is on mobile. The status strip stacks, the summary card reflows, the timeline becomes a single column. The role-fit 2×2 grid collapses to 1 column.

### Flow 3 — Sam the senior engineer, pattern deep link (per PRD UJ-3)

1. Sam follows a Slack thread to `04-pattern.html`. Cold visit, personal laptop, 5 minutes.
2. The signature canvas (decision-graph mode) pulses in the corner. The hero title reads "Canonical Model." with a gradient-text climax fragment.
3. He reads the two-column layout: sticky TOC on the left, playbook body on the right.
4. He scrolls the 4 numbered moves. M2 (validate before write) lands — he's lived that exact pattern.
5. He scrolls to the **counter-line**: "When one system owns the truth and others read-only, skip canonical model." Distinct from the moves (warn left-border, different typography). He pauses — that's the exact case where the pattern breaks.
6. He clicks the magnetic CTA at the bottom: "See Canonical Model in production →" linking to `03-case-study.html`.
7. Climax: he bookmarks the pattern URL. He's now tracking Sanjit's pattern library.

**Edge case:** Sam shares the URL cold. The OG unfurl renders the hero title ("Canonical Model.") — not a generic site name.

### Flow 4 — Curious visitor, /now feed (per PRD FR-15)

1. Visitor clicks `/now` from the homepage currently-building summary.
2. The signature canvas (activity-feed mode) sits in the top-right. The hero reads "right now." with a gradient-text climax fragment.
3. The live strip below the hero shows "Active · 3 / Closed · 2 / Last updated 2026-09-22."
4. The vertical ticker lists entries: CityFix (active · draft), Surakkha dispatcher (prior · archived), Loop playground (prior · shipped), Indie blog (draft).
5. Each entry has a date column, status dot, title, description, status badge, tags, meta.
6. Visitor scrolls to the subscribe card. Inputs an email and clicks Subscribe.
7. Climax: the submit is a v4 stub (no real backend), but the form does not block render and does not throw an error. Visitor stays for the read either way.

**Edge case:** Empty state. If all entries are prior (no active / draft), the hero still reads "right now." with the active count reading 0. The honest empty state is "Nothing new this week."

### Flow 5 — Engineer exploring /built (the meta-flow)

1. Engineer clicks the "How this site is built" link from the homepage footer or nav.
2. The signature canvas in the top-right IS the layered architecture diagram — 7 stacked layers, tiny.
3. The hero is a two-column: left = spine (with gradient-text title "Walked into the build notes anyway."), right = the BIG version of the same architecture diagram in a `{components.card-focal}`.
4. The diagram has a "Live" indicator (live green dot, pulsing) and a counter "7 layers".
5. The engineer scrolls to "01 / Layers" — a numbered table with 7 rows. Each row matches a node in the diagram.
6. Hovering row L1 pulses its node in the BIG hero diagram (and silently in the signature canvas). Pre-reduced-motion = no pulse.
7. The engineer scrolls to "02 / Stack cards" — 6 cards explaining each layer. To "03 / Receipt" — a fake terminal-style "page weight" table showing 18KB total. To "04 / Decisions" — why I skipped the SPA framework, why no icon library, why no build step.
8. Climax: the engineer sees the site as evidence of the engineering judgment it claims. They leave with a story to tell.

**Edge case:** The engineer is on a touch device. Hover-sync is disabled (no `pointer:fine`), so the rows don't pulse the diagram. The diagram itself remains, fully visible and informative.

---

## Open Questions / [ASSUMPTION] / [NOTE FOR UX]

- **[ASSUMPTION]** Dark-mode canonical, no light-mode pair in v4. The site ships dark by default. A future light-mode pair would need its own frontmatter `colors` block in `DESIGN.md` and corresponding hard-refresh stylesheet swap. Carries from v3 spine (which had a paired alternative).
- **[ASSUMPTION]** Signature canvas is decorative, never interactive. It is `aria-hidden="true"` and `pointer-events: none`. If/when interactivity is added (e.g., click to expand), it becomes a new component with its own a11y semantics — not the `{components.sig-canvas}`.
- **[ASSUMPTION]** Command palette is the primary navigation metaphor (⌘K). The nav-bar links are still present for users who don't know the keyboard shortcut, but the palette is the keyboard-first path. Vim-style `g h/w/l/p/n/a/b` shortcuts are reserved for future implementation.
- **[ASSUMPTION]** Filter chips on `02-work` are visually organized but do not actually filter in v4. Rendering all case studies with chip-state feedback is enough; real filtering would require either client-side JS or per-chip route (`/work?filter=lead`).
- **[ASSUMPTION]** Subscribe form on `05-now` is a v4 stub (no real backend). The form does not block render and does not show an error state. Build step would integrate ConvertKit / Buttondown.
- **[NOTE FOR UX]** The signature canvas mode is set **per page** (mode-adaptive), not driven by scroll position. The v3 spec described scroll-driven mode shifting; v4 settled on per-page mode because scroll-driven was either gimmicky or buggy, and per-page mode is editorial.
- **[NOTE FOR UX]** Magnetic CTA is page-level: one focal CTA per page (nav or hero) magnetic. Don't stack magnetic CTAs on the same viewport.
- **[NOTE FOR UX]** Recruiter-route's signature canvas uses `{colors.live}` (green) — visually distinct from the violet used on every other page. This intentionally signals "this is the status surface, not the brand surface."
- **[OPEN]** Whether the signature canvas should *also* receive mode-shifts driven by scroll section within a page (e.g., the case-study's section-progress mode could light up the corresponding node as the user scrolls past each section). Not implemented in v4; reserved for v5 if signal proves worth the complexity.
- **[OPEN]** Whether recruiter-mode should re-skin all 9 pages (per PRD FR-3) versus remain a single dedicated route. v4 shipped the latter (`09-recruiter.html`). Re-skinning remains a follow-up if the user wants true "engineer ↔ recruiter" toggle.

---

This `EXPERIENCE.md` is the **behavioral source of truth** for the build. `DESIGN.md` owns visual identity and references back into this spine via `{path.to.token}` cross-references. Both spines win on conflict with any mock, wireframe, or import.

---

## Reconciled Content Notes (post-v4)

### v4 supersedes v3

v4 (cinematic dark + signature canvas + command palette + magnetic CTA) supersedes v3 (Quiet Authority, light-mode, restrained) as the visual direction. The v3 spine is preserved at `mockups/v3/` for posterity; the v4 spine is canonical from `2026-09-23` onward.

Behavioral invariants that carry forward from earlier spines without modification:
- Recruiter-mode is a footer opt-in, not a header feature (PRD FR-3).
- Decentralized pages: every public route ships with ≥1 proof number + a return path (PRD FR-10).
- Empty NOW state: "Nothing new this week." (PRD FR-17).
- /now as a live ticker with honest timestamps (per sivers.nl pattern).
- Pattern counter-line as visually distinct from numbered moves.
- Skip-to-content link + WCAG 2.1 AA + role="dialog" + aria-modal + aria-current + aria-label + aria-hidden.

### v4 fabrications to correct at build time

Per the same reconciliation procedure used for v3 (see `reconcile-stitch-outputs.md`), any Stitch output or auto-generated copy that contradicts Sanjit's actual cv.md / idea.md must be edited at build time. The v4 mocks already reflect the correct facts (Wellbook, Surakkha, CityFix, 1.2M patients, 22h MTTR). No outstanding corrections.

---

## Surface Coverage

| IA surface | v4 mock? | Spine-only OK? |
|---|---|---|
| `01-homepage.html` | ✓ `mockups/v4/01-homepage.html` | — |
| `02-work.html` | ✓ `mockups/v4/02-work.html` | — |
| `03-case-study.html` | ✓ `mockups/v4/03-case-study.html` | — |
| `04-pattern.html` | ✓ `mockups/v4/04-pattern.html` | — |
| `05-now.html` | ✓ `mockups/v4/05-now.html` | — |
| `06-about.html` | ✓ `mockups/v4/06-about.html` | — |
| `07-lab.html` | ✓ `mockups/v4/07-lab.html` | — |
| `08-built.html` | ✓ `mockups/v4/08-built.html` | — |
| `09-recruiter.html` | ✓ `mockups/v4/09-recruiter.html` | — |

All 9 IA surfaces are mocked. The v4 design system spec lives at `mockups/v4/00-design-system.md`. Earlier versions (`mockups/v1/`, `mockups/v2/`, `mockups/v3/`) are preserved for the version trail but are no longer the canonical direction.

---

## Status: FINAL

Both spines are finalized for v4. The build can proceed against:
- `DESIGN.md` — visual identity, token reference, component visual specs (cinematic dark, 30+ CSS custom properties, 9 signature-canvas modes)
- `EXPERIENCE.md` — IA (9 routes), behavior, components, states, interactions, accessibility, key flows

Recommended next steps:
1. `bmad-architecture` — confirm architecture spine aligns with this v4 UX spine (static-HTML-per-route, inline CSS, no build step, signature canvas as pure SVG).
2. `bmad-create-epics-and-stories` — break the build into stories, each traced to a PRD FR + v4 IA surface.
3. `bmad-build` — implement. The `mockups/v4/*.html` files are reference renders for every surface.
