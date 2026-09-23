---
title: Sanjit Majumdar — Engineering Portfolio · Visual Identity
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
  - ui-ux-pro-max design-system search (cinematic-dark direction)
  - mockups/v4/00-design-system.md
  - mockups/v4/*.html (9 pages, mode-adaptive signature canvas)
name: Cinematic Dark
colors:
  background: '#06070B'
  background-raised: '#0B0D14'
  background-inset: '#10131C'
  foreground: '#FAFAFA'
  foreground-2: '#D4D4D8'
  foreground-3: '#8B8E97'
  foreground-4: '#5C5F68'
  border: 'rgba(255,255,255,0.06)'
  border-strong: 'rgba(255,255,255,0.12)'
  border-accent: 'rgba(167,139,250,0.30)'
  glass: 'rgba(255,255,255,0.03)'
  glass-strong: 'rgba(255,255,255,0.06)'
  accent: '#A78BFA'        # electric violet — primary brand accent
  accent-2: '#67E8F9'      # cyan — secondary accent / signature canvas flow
  accent-3: '#F472B6'      # pink — tertiary accent / lab experiments
  accent-glow: 'rgba(167,139,250,0.25)'
  live: '#34D399'          # green — live / shipping / now status only
  live-glow: 'rgba(52,211,153,0.20)'
  warn: '#FCA5A5'          # rose — counter-line / warning only
  on-accent: '#06070B'     # text on accent fills
  on-live: '#06070B'       # text on live fills
typography:
  display:
    fontFamily: 'Space Grotesk'
    fontSize: 'clamp(3rem, 8vw, 7rem)'
    fontWeight: '500'
    lineHeight: 0.95
    letterSpacing: -0.04em
  display-mobile:
    fontFamily: 'Space Grotesk'
    fontSize: 'clamp(2.5rem, 9vw, 4rem)'
    fontWeight: '500'
    lineHeight: 1
    letterSpacing: -0.035em
  hero-spine:
    fontFamily: 'Inter'
    fontSize: 'clamp(1.0625rem, 1.4vw, 1.375rem)'
    fontWeight: '400'
    lineHeight: 1.55
  headline-lg:
    fontFamily: 'Space Grotesk'
    fontSize: 'clamp(2rem, 4vw, 3rem)'
    fontWeight: '500'
    lineHeight: 1.1
    letterSpacing: -0.03em
  headline-md:
    fontFamily: 'Space Grotesk'
    fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)'
    fontWeight: '500'
    lineHeight: 1.15
    letterSpacing: -0.025em
  headline-sm:
    fontFamily: 'Space Grotesk'
    fontSize: '1.375rem'
    fontWeight: '500'
    lineHeight: 1.2
    letterSpacing: -0.025em
  card-title:
    fontFamily: 'Space Grotesk'
    fontSize: '1.125rem'
    fontWeight: '500'
    lineHeight: 1.25
    letterSpacing: -0.02em
  body-lg:
    fontFamily: 'Inter'
    fontSize: '1.0625rem'
    fontWeight: '400'
    lineHeight: 1.65
  body-md:
    fontFamily: 'Inter'
    fontSize: '0.9375rem'
    fontWeight: '400'
    lineHeight: 1.6
  body-sm:
    fontFamily: 'Inter'
    fontSize: '0.875rem'
    fontWeight: '400'
    lineHeight: 1.55
  label:
    fontFamily: 'JetBrains Mono'
    fontSize: '11px'
    fontWeight: '500'
    lineHeight: 1.4
    letterSpacing: '0.08em'
    textTransform: 'uppercase'
  micro:
    fontFamily: 'JetBrains Mono'
    fontSize: '10px'
    fontWeight: '500'
    lineHeight: 1.4
    letterSpacing: '0.06em'
    textTransform: 'uppercase'
  code-block:
    fontFamily: 'JetBrains Mono'
    fontSize: '12px'
    fontWeight: '400'
    lineHeight: 1.7
    letterSpacing: '0.02em'
rounded:
  none: 0
  sm: 8px
  DEFAULT: 12px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px
shadow:
  md: '0 4px 24px rgba(0,0,0,0.30)'
  lg: '0 16px 48px rgba(0,0,0,0.45)'
  glow: '0 0 40px rgba(167,139,250,0.30)'
  glow-strong: '0 0 60px rgba(167,139,250,0.40)'
spacing:
  gutter: 'clamp(1.5rem, 4vw, 3rem)'
  section-y: 'clamp(4.5rem, 10vw, 8rem)'
  max-w: '1320px'
  space-xs: '0.5rem'
  space-sm: '0.75rem'
  space-md: '1.5rem'
  space-lg: '2.5rem'
  space-xl: '4rem'
  space-2xl: '6rem'
components:
  sig-canvas:
    role: 'persistent decorative SVG, mode-adaptive per page'
    position: 'fixed top-right, 240×240 slot, hidden below 1280px viewport width'
    background: '{colors.glass-strong}'
    border: '1px solid {colors.border}'
    radius: '{rounded.xl}'
    backdrop: 'blur(14px)'
    aria-hidden: 'true'
    modes:
      home: 'dual-ring with central thinking hub'
      work: 'filter-graph (All/Lead/Civic/Eng)'
      case-study: 'section-progress (6 vertical nodes)'
      pattern: 'decision-graph (4 moves + warn counter)'
      now: 'activity-feed (3 active + 3 prior nodes)'
      about: 'timeline (5 vertical nodes)'
      lab: 'experiment-graph (Idea hub + 4 corners)'
      built: 'layered architecture (7 stacked layers)'
      recruiter: 'condensed 4-node status graph'
  scroll-progress:
    role: 'thin accent bar at nav bottom'
    height: '1px'
    color: '{colors.accent}'
    transform: 'scaleX(var(--progress))'
    transition: 'transform 100ms linear'
  nav:
    position: 'sticky top-0'
    height: '76px'
    background: 'rgba(6,7,11,0.72)'
    backdrop: 'blur(20px)'
    border-bottom: '1px solid {colors.border}'
  cmdk-trigger:
    role: '⌘K opener in nav'
    background: '{colors.glass}'
    border: '1px solid {colors.border}'
    radius: '{rounded.sm}'
    font: '{typography.label}'
    hover:
      border-color: '{colors.border-strong}'
      background: '{colors.glass-strong}'
  magnetic-cta:
    role: 'single focal primary CTA per page (nav or hero)'
    displacement: '≤8px toward cursor (0.18× pointer offset clamp)'
    gate: 'requires pointer:fine AND not prefers-reduced-motion'
    hover:
      transform: 'translate(<x>px, <y>px)'
      transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)'
  cmdk-panel:
    role: 'command palette modal'
    role-aria: 'role="dialog" aria-modal="true" aria-labelledby="cmdk-title"'
    width: 'min(640px, 92vw)'
    background: '{colors.background-raised}'
    border: '1px solid {colors.border-strong}'
    radius: '{rounded.lg}'
    shadow: '{shadow-lg}'
    scrim: 'rgba(6,7,11,0.72) backdrop-filter: blur(24px)'
  cmdk-item:
    role: 'palette result row'
    padding: '0.85rem 1.25rem'
    font: '{typography.body-md}'
    hover:
      background: '{colors.glass-strong}'
      border-left: '2px solid {colors.accent}'
  card:
    role: 'generic content card (work, lab, role, layer)'
    background: '{colors.glass}'
    border: '1px solid {colors.border}'
    radius: '{rounded.lg}'
    padding: '{spacing.space-lg}'
    top-hairline: '1px gradient (--gradient-card) inset from top'
    hover:
      transform: 'translateY(-3px or -4px)'
      border-color: '{colors.border-accent}'
      background: '{colors.glass-strong}'
      shadow: '{shadow-lg}'
  card-focal:
    radius: '{rounded.xl}'
    padding: '{spacing.space-xl}'
  button-primary:
    role: 'primary action CTA'
    background: '{colors.accent}'   # OR var(--gradient-button) for gradient fill
    foreground: '{colors.on-accent}'
    radius: '{rounded.md}'
    padding: '0.85rem 1.5rem'
    font: '{typography.body-md}'
    font-weight: '500'
    hover:
      transform: 'translateY(-2px)'
      shadow: '{shadow-glow}'
  button-secondary:
    background: '{colors.glass-strong}'
    border: '1px solid {colors.border-strong}'
    foreground: '{colors.foreground}'
    radius: '{rounded.md}'
    padding: '0.85rem 1.5rem'
    hover:
      transform: 'translateY(-2px)'
      border-color: '{colors.border-accent}'
  button-live:
    role: 'recruiter-mode primary CTA — uses live green instead of accent'
    background: '{colors.live}'
    foreground: '{colors.on-live}'
    hover:
      background: '#6EE7B7'
      shadow: '0 0 24px rgba(52,211,153,0.4)'
  ticker-row:
    role: 'NOW / status entry'
    border-bottom: '1px solid {colors.border}'
    padding: '1.75rem 0'
    dot-active: '{colors.live}'
    dot-draft: '{colors.accent}'
    dot-prior: '{colors.foreground-4}'
  metric:
    role: 'impact / proof number'
    font: '{typography.headline-md}'
    gradient: '{colors.gradient-text}'
    label:
      font: '{typography.label}'
      color: '{colors.foreground-3}'
  form-input:
    role: 'subscribe / email field'
    background: '{colors.background-inset}'
    border: '1px solid {colors.border}'
    radius: '{rounded.sm}'
    focus:
      border-color: '{colors.accent}'
      outline: '2px solid {colors.accent} (4px offset)'
  breadcrumb:
    font: '{typography.label}'
    separator: '/'
    current:
      color: '{colors.accent}'
---

# DESIGN.md

## Brand & Style

**Cinematic Dark** is the visual identity. Studio Fusion by inheritance — an engineer's digital workspace rendered as a public surface. Dark mode is canonical, not paired. The page reads like a calm observatory: deep blacks, electric-violet signal lines, oversized editorial typography, restrained glass surfaces used as structure rather than decoration.

The mood is **calm authority with technical depth**. Nothing flashes. Nothing scrolls for the sake of scrolling. The signature interaction — a persistent nodes-graph canvas — is the only decorative element, and it earns its slot by morphing to match the page it lives on.

### Aesthetic Register

- **Cinematic dark.** Deep `#06070B` background, never white. Even in "light contexts" (case-study reading, contact card), the canvas stays dark; cards and panels use `--bg-2` `--bg-3` for elevation, not white fills.
- **Editorial typography.** Headlines use Space Grotesk at 500 weight, oversized (`clamp(3rem, 8vw, 7rem)`) on hero, with negative letter-spacing. Body uses Inter at 16px / 1.6. Mono (JetBrains) only for labels, breadcrumbs, status, and code.
- **Electric accents.** Three accents — `--accent` (violet), `--accent-2` (cyan), `--accent-3` (pink). Each has a defined role; none overlap. Gradient-text on display sizes only.
- **Layered depth.** Glass surfaces (`rgba(255,255,255,0.03)` / `0.06`), hairline borders (`rgba(255,255,255,0.06)` / `0.12`), and a 3-tier elevation system (rest → hover → focus). No 2px+ borders, no drop shadows as primary affordance.
- **Persistent signature.** A 240×240 nodes-graph SVG lives in the top-right of every page (≥1280px), morphing per page. The graph is decorative but never arbitrary — it reflects the page's actual content (home = thinking, work = filter, case-study = progress, pattern = decision, now = activity, about = timeline, lab = experiments, built = the architecture itself, recruiter = condensed status).

### Identity

- **Name:** Sanjit Majumdar
- **Role:** Senior Software Engineer
- **Stack:** React · TypeScript · .NET · Angular · SQL Server · AWS
- **Location:** Dhaka, Bangladesh (UTC+6)
- **Spine line:** *"This person builds serious software — and this website is proof."*

### Voice Anchor

Brand voice lives in `EXPERIENCE.md` (microcopy). Visual identity lives here. The two never bleed: chrome is structural, prose carries personality.

## Colors

The palette is **dark-mode canonical** with three accent roles and one status role. No warm off-whites, no soft blue-greens. Pure `#FAFAFA` foreground on `#06070B` background ≈ 19:1 contrast.

### Dark Mode (canonical)

| Token | Hex / rgba | Role |
|---|---|---|
| `{colors.background}` | `#06070B` | Page background. Near-black with a hint of indigo. |
| `{colors.background-raised}` | `#0B0D14` | Card / panel fill in raised sections. |
| `{colors.background-inset}` | `#10131C` | Input fields, inset controls, code blocks. |
| `{colors.glass}` | `rgba(255,255,255,0.03)` | Subtle glass surface (most cards at rest). |
| `{colors.glass-strong}` | `rgba(255,255,255,0.06)` | Stronger glass (nav, hover states, modals). |
| `{colors.foreground}` | `#FAFAFA` | Body text. Pure white reads too clinical; this is warm. |
| `{colors.foreground-2}` | `#D4D4D8` | Secondary body, descriptions. |
| `{colors.foreground-3}` | `#8B8E97` | Captions, labels, metadata, breadcrumbs. |
| `{colors.foreground-4}` | `#5C5F68` | Disabled / very-quiet chrome. |
| `{colors.border}` | `rgba(255,255,255,0.06)` | 1px borders, dividers, separator hairlines. |
| `{colors.border-strong}` | `rgba(255,255,255,0.12)` | Card hover borders, modal panels. |
| `{colors.border-accent}` | `rgba(167,139,250,0.30)` | Focus / active accent border. |
| `{colors.accent}` | `#A78BFA` | Brand accent. Primary CTA, active nav, focus rings, signature canvas active edges. |
| `{colors.accent-2}` | `#67E8F9` | Secondary accent. Architecture diagrams (built page), /built accent surface. |
| `{colors.accent-3}` | `#F472B6` | Tertiary accent. Lab experiments page only. |
| `{colors.accent-glow}` | `rgba(167,139,250,0.25)` | Halo behind magnetic CTA, active edge filter. |
| `{colors.live}` | `#34D399` | Status: live / shipping / now. NEVER decorative. |
| `{colors.live-glow}` | `rgba(52,211,153,0.20)` | Halo behind active ticker dots. |
| `{colors.warn}` | `#FCA5A5` | Counter-line / warning. NEVER decorative. |
| `{colors.on-accent}` | `#06070B` | Text on accent fills (buttons). |
| `{colors.on-live}` | `#06070B` | Text on live fills (recruiter-CTA). |

### Color Discipline

- **Three accents, three roles.** `--accent` = brand / primary action. `--accent-2` = secondary surface (built page only). `--accent-3` = tertiary accent (lab page only). They never co-occur on the same surface.
- **Gradients earn their slot.** `--gradient-text` (violet → cyan → pink, 135deg) only on hero titles at display sizes. `--gradient-button` (violet → cyan) only on focal primary CTAs. `--gradient-card` (white 6% top → transparent) only as the 1px hairline at the top of every card surface.
- **No chromatic drop shadows.** All shadows are pure black. Glow halos use `--accent-glow` or `--live-glow`, never a custom hue.
- **Live means live.** Green is reserved for live / shipping / now status. Never decoration.
- **Accent means actionable.** Hovered link, focused input, active tab, primary button. Used sparingly — most surfaces are mono.

### Gradient Stops (reusable)

| Token | Value | Used for |
|---|---|---|
| `--gradient-text` | `135deg, #A78BFA → #67E8F9 → #F472B6` | Hero titles (display sizes only) |
| `--gradient-button` | `135deg, #A78BFA → #67E8F9` | Focal primary CTA fill |
| `--gradient-card` | `180deg, rgba(255,255,255,0.06) → rgba(255,255,255,0)` | Top hairline on every card surface |
| `--gradient-hero` | `radial, accent 14% at top → accent 6% at 35% → transparent 65%` | Hero background glow |

## Typography

The typographic engine pairs **Space Grotesk** for crisp oversized display, **Inter** for neutral long-form reading, and **JetBrains Mono** strictly for technical metadata (labels, breadcrumbs, timestamps, status, code). Mono is structural, not decorative.

### Hierarchy

| Role | Family | Size | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `{typography.display}` | Space Grotesk | `clamp(3rem, 8vw, 7rem)` | 500 | -0.04em | Hero title (the largest moment). |
| `{typography.hero-spine}` | Inter | `clamp(1.0625rem, 1.4vw, 1.375rem)` | 400 | 0 | Hero description below the title. |
| `{typography.headline-lg}` | Space Grotesk | `clamp(2rem, 4vw, 3rem)` | 500 | -0.03em | Section headings. |
| `{typography.headline-md}` | Space Grotesk | `clamp(1.5rem, 2.8vw, 2.25rem)` | 500 | -0.025em | Page-level climax headlines. |
| `{typography.headline-sm}` | Space Grotesk | 1.375rem | 500 | -0.025em | Card titles, case-study section heads. |
| `{typography.card-title}` | Space Grotesk | 1.125rem | 500 | -0.02em | Sub-cards, lab/role cards. |
| `{typography.body-lg}` | Inter | 1.0625rem | 400 | 0 | Default body. Lead paragraphs, case-study body. |
| `{typography.body-md}` | Inter | 0.9375rem | 400 | 0 | Card descriptions. |
| `{typography.body-sm}` | Inter | 0.875rem | 400 | 0 | Captions, supporting metadata, footer. |
| `{typography.label}` | JetBrains Mono | 11px | 500 | +0.08em upper | Section labels, breadcrumb, status indicators. |
| `{typography.micro}` | JetBrains Mono | 10px | 500 | +0.06em upper | Canvas frame labels, footer notes, ticker tags. |
| `{typography.code-block}` | JetBrains | 12px | 400 | +0.02em | Code blocks, terminal output, "receipt" tables. |

### Typography Directives

- **Display sizes only.** `clamp()` everywhere. Mobile drops ~30% on hero, ~15% on headlines.
- **Gradient text only on display.** `--gradient-text` is reserved for hero titles at display size and section climax headlines. Never on body, never on labels.
- **Mono is structural.** Appears in: section labels, breadcrumbs, timestamps, status indicators, code blocks, canvas frame labels, "receipt" tables. Never as decorative chrome on every card.
- **Headings are distinctive, not loud.** Space Grotesk's geometry does the work; weight stays at 500.
- **Real em-dashes.** `—` (U+2014) for typographic dashes.
- **Engineering notation.** Numbers and units stay tight (`22h`, `90s`, `1.2M`, `−68%`).
- **System fallback.** Space Grotesk → system-ui. Inter → system-ui. JetBrains Mono → `ui-monospace, "SF Mono", Menlo, monospace`.

## Layout & Spacing

Layout uses a **single `1320px` content max-width** with fluid `clamp(1.5rem, 4vw, 3rem)` gutter. Sections separate at `clamp(4.5rem, 10vw, 8rem)` vertical rhythm — generous breathing room that lets the dark canvas absorb density without crowding.

### Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| `xl` | ≥ 1280px | Full nav, signature canvas visible (240×240 fixed slot). Two-column hero on `built`. |
| `lg` | 1100–1279px | Nav links visible, command palette trigger visible, signature canvas hidden. |
| `md` | 900–1099px | Single-column hero, grids collapse to 2-up. Command palette trigger and nav links hidden (cmdk only via ⌘K shortcut). |
| `sm` | < 900px | All grids single column. Hero padding tightens. Signature canvas fully hidden. |

### Spacing Scale

| Token | Value | Use |
|---|---|---|
| `{spacing.space-xs}` | 0.5rem (8px) | Inline gaps. |
| `{spacing.space-sm}` | 0.75rem (12px) | Tight internal padding. |
| `{spacing.space-md}` | 1.5rem (24px) | Card padding, default section gap. |
| `{spacing.space-lg}` | 2.5rem (40px) | Section-to-section vertical gap. |
| `{spacing.space-xl}` | 4rem (64px) | Major section break. |
| `{spacing.space-2xl}` | 6rem (96px) | Hero bottom margin. |
| `{spacing.section-y}` | `clamp(4.5rem, 10vw, 8rem)` | Vertical rhythm unit between sections. |

### Page Padding

| Token | Mobile | Tablet | Desktop |
|---|---|---|---|
| `{spacing.gutter}` | 1.5rem | 2rem | 3rem |

## Elevation & Depth

Visual separation relies on **glass surfaces, hairline borders, and shadow tiers**. No 2px borders, no chromatic shadows, no neon halos.

### Elevation Hierarchy

1. **Floor 0 (Page):** `{colors.background}` `#06070B`. The deep cinematic canvas.
2. **Floor 1 (Card / Panel):** `{colors.glass}` fill on `rgba(255,255,255,0.03)` with `1px solid {colors.border}` border, `{rounded.lg}` corner. Most surfaces at rest.
3. **Floor 2 (Raised card on hover):** `{colors.glass-strong}` fill, `{colors.border-accent}` border, `translateY(-3px or -4px)`, `{shadow-lg}`.
4. **Floor 3 (Modal / overlay):** `{colors.background-raised}` fill, `{colors.border-strong}` border, `{shadow-lg}`.

Plus one **focal halo tier** — `{shadow-glow}` / `{shadow-glow-strong}` on the primary CTA climax only. Never on secondary surfaces.

### Shadow Tokens

| Token | Value | Used for |
|---|---|---|
| `--shadow-md` | `0 4px 24px rgba(0,0,0,0.30)` | Card rest, raised panels. |
| `--shadow-lg` | `0 16px 48px rgba(0,0,0,0.45)` | Card hover lift, modal panels. |
| `--shadow-glow` | `0 0 40px rgba(167,139,250,0.30)` | Primary CTA hover. |
| `--shadow-glow-strong` | `0 0 60px rgba(167,139,250,0.40)` | Hero CTA climax (magnetic moment). |

## Shapes

The interface is defined by **generous radii on focal surfaces**, **tight radii on chrome**, and **hairline borders as the dominant edge**.

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Reserved. |
| `{rounded.sm}` | 8px | Nav command-palette trigger, form inputs, footer chips. |
| `{rounded.DEFAULT}` / `{rounded.md}` | 12px | Default buttons, small cards. |
| `{rounded.lg}` | 20px | Generic content cards, modals. |
| `{rounded.xl}` | 28px | Focal cards (hero CTA card, summary card on recruiter page), signature canvas frame. |
| `{rounded.full}` | 9999px | Status pills, stack tags, filter chips. |

### Shape Discipline

- **Hairline 1px borders.** The dominant edge everywhere. Never 2px+, never drop shadow as primary affordance.
- **1px gradient hairline at top of cards.** Every card surface uses `::before { background: var(--gradient-card); }` for a subtle top edge — carried forward from Studio Fusion.
- **Generous radii on focal surfaces.** Hero cards, summary cards, and the signature canvas frame use `--radius-xl` (28px). Never on chrome (buttons, chips use `--radius-sm` or `--radius-md`).

## Components

### Signature Interaction — Nodes-Graph Canvas (`{components.sig-canvas}`)

Persistent decorative SVG in a 240×240 fixed top-right slot (≥1280px viewport width). Hidden on smaller viewports (`display: none`). Backed by `{colors.glass-strong}` with `{colors.border}` and `{rounded.xl}`. Aria-hidden (`true`).

The canvas morphs per page — each mode has its own SVG content, edges, and active-state colors:

| Page | Mode | Active accent |
|---|---|---|
| `01-homepage` | dual-ring + central thinking hub | `{colors.accent}` (violet) |
| `02-work` | filter-graph (All / Lead / Civic / Eng) | `{colors.accent}` (violet) |
| `03-case-study` | section-progress (6 vertical nodes) | `{colors.accent}` (violet) |
| `04-pattern` | decision-graph (4 moves + warn counter) | `{colors.accent}` (violet) |
| `05-now` | activity-feed (3 active + 3 prior) | `{colors.accent}` (violet) |
| `06-about` | timeline (5 vertical nodes) | `{colors.accent}` (violet) |
| `07-lab` | experiment-graph (Idea hub + 4 corners) | `{colors.accent-3}` (pink) |
| `08-built` | layered architecture (7 stacked layers) | `{colors.accent-2}` (cyan) |
| `09-recruiter` | condensed 4-node status graph | `{colors.live}` (green) |

Idle behavior: a `stroke-dasharray: 4 4` animation traverses the active edges at 2s linear infinite (`sigFlow`). The signature label sits at top-left in `{typography.micro}`; meta sits at bottom in `{typography.micro}`.

### Scroll Progress Bar (`{components.scroll-progress}`)

1px-tall accent bar at the bottom edge of the sticky nav. `transform: scaleX(var(--progress))` updated by a passive scroll listener (capped 0–1). Color: `{colors.accent}`. Transition: `transform 100ms linear`. Always visible — it's a navigational affordance, not decoration.

### Navigation (`{components.nav}`)

Sticky top, 76px tall. `backdrop-filter: blur(20px)` over `rgba(6,7,11,0.72)`. Three regions:
- **Left:** brand mark — gradient square (28×28, `{rounded.sm}`) with cursor-style node-pulse halo, then "Sanjit Majumdar" wordmark.
- **Center:** nav links (Home / Work / About / Lab / Now / Built / Recruiter) with `aria-current="page"` underline reveal on hover/active.
- **Right:** `{components.cmdk-trigger}` + `{components.magnetic-cta}` (single focal CTA per page).

### Command Palette (`{components.cmdk-trigger}` + `{components.cmdk-panel}`)

⌘K / Ctrl-K opens; Esc closes. Implemented per WCAG combobox semantics: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="cmdk-title"`.

- **Trigger:** nav-right button. Glass fill, hairline border, `{typography.label}` "Search" with `⌘K` `<kbd>`.
- **Panel:** `{components.cmdk-panel}` (640px max, `{rounded.lg}`, `{shadow-lg}`). Single text input, live fuzzy-filter on the result list, keyboard arrow nav, fuzzy text filter, Enter to navigate, Esc to close.
- **Scrim:** `rgba(6,7,11,0.72)` with `backdrop-filter: blur(24px)`.
- **Items:** `{components.cmdk-item}` — padding 0.85rem 1.25rem, hover = `{colors.glass-strong}` background + 2px `{colors.accent}` left border.

### Magnetic CTA (`{components.magnetic-cta}`)

Single focal primary CTA per page. `pointermove` handler translates the button by `0.18×` the cursor offset (clamped at ≤8px displacement). Gated by `matchMedia('(prefers-reduced-motion: reduce)')` AND `matchMedia('(pointer: fine)')` — reduced-motion or touch devices get a static button.

### Cards (`{components.card}`)

Generic content card. `{colors.glass}` fill, `{colors.border}` border, `{rounded.lg}` corner, `{spacing.space-lg}` padding. 1px gradient hairline at top via `::before { background: var(--gradient-card); }`. Hover: `translateY(-3px or -4px)`, `{colors.border-accent}` border, `{colors.glass-strong}` fill, `{shadow-lg}` shadow.

Focal cards (`{components.card-focal}`) use `{rounded.xl}` and `{spacing.space-xl}` padding — reserved for the recruiter summary card, the hero CTA card on the built page, and similar high-weight moments.

### Buttons

- **`{components.button-primary}`** — `{colors.accent}` or `{colors.gradient-button}` fill, `{colors.on-accent}` text, `{rounded.md}` corner. Hover: `translateY(-2px)` + `{shadow-glow}`. Used for primary actions.
- **`{components.button-secondary}`** — `{colors.glass-strong}` fill, `{colors.border-strong}` border, `{colors.foreground}` text. Hover: `translateY(-2px)` + `{colors.border-accent}` border.
- **`{components.button-live}`** — `{colors.live}` fill, `{colors.on-live}` text. Used only on the recruiter-mode nav CTA and closing CTA. Hover: `#6EE7B7` background + `0 0 24px rgba(52,211,153,0.4)` shadow. Distinct from accent to signal action-vs-status.

### Tickers / NOW List (`{components.ticker-row}`)

Vertical list, each row: `1px solid {colors.border}` bottom border, `{spacing.space-lg}` vertical padding. Three dot variants: `{colors.live}` (active), `{colors.accent}` (draft), `{colors.foreground-4}` (prior). Active row text uses `{typography.headline-sm}`, prior row uses `{typography.body-md}` with `{colors.foreground-2}`.

### Impact Metrics (`{components.metric}`)

Large number using `{typography.headline-md}` with `{colors.gradient-text}` background-clip (and `hueShift` 8s animation on hero). Label below in `{typography.label}` `{colors.foreground-3}`.

### Form Inputs (`{components.form-input}`)

`{colors.background-inset}` fill, `{colors.border}` border, `{rounded.sm}` corner. Focus: `{colors.accent}` border + `2px solid {colors.accent}` outline at `4px` offset. Used for the subscribe-card email field.

### Breadcrumb (`{components.breadcrumb}`)

`{typography.label}` above hero. Slash separator. Current page uses `{colors.accent}` text; intermediate pages use `{colors.foreground-3}`.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Keep the signature canvas aria-hidden, decorative, and mode-adaptive per page | Use the canvas as a real navigation aid (it's not interactive) |
| Show at most one magnetic CTA per viewport | Stack magnetic CTAs on the same hero |
| Reserve `--gradient-text` for display sizes only | Use gradient text on body or labels |
| Use `--accent` for brand / action / focus | Tint decorative chrome accent-purple |
| Use `--live` only for live / shipping / now | Color inactive UI green |
| Use `--accent-3` only on the Lab page | Mix accent-3 with accent or accent-2 |
| Use `--accent-2` only on the Built page | Mix accent-2 with accent or accent-3 |
| Trust the 3-tier elevation (rest → hover → focus-visible) | Skip focus-visible styling on custom cards |
| Use `--rounded-xl` only on focal cards | Round every card to 28px |
| Gate every animation behind `prefers-reduced-motion` | Animate without checking user preference |
| Use the `gradient-card` hairline at the top of every card | Skip the hairline on focal surfaces |
| Trust `pointer:fine` for the magnetic CTA | Apply magnetism to touch devices |
| Verify contrast in dark mode (pure white on `#06070B` ≈ 19:1) | Assume dark-mode values work in light |
| Use `--gradient-button` for the focal primary CTA only | Apply gradient fill to secondary buttons |
| Keep monospace structural (labels, breadcrumbs, status, code) | Decorate every card with mono chrome labels |

---

## Cross-References

`EXPERIENCE.md` is the behavioral / IA source of truth. It cross-references these tokens via `{path.to.token}` syntax. Both spines win on conflict with any mock, wireframe, or import. Components in this file are visual specs only; behavioral rules live in `EXPERIENCE.md.Components`.

`mockups/v4/00-design-system.md` is the v4 design-system spec this spine was promoted from. `mockups/v4/*.html` (9 files) is the full v4 surface set — every visual decision in this spine has a corresponding render in those mocks.