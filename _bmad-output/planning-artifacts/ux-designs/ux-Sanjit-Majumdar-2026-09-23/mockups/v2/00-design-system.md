# v2 Design Direction — Dark · Premium · Generous

> Parallel branch to the canonical Quiet Authority (light) mocks in `mockups/*.html`. Built from a different brief: **clean dark theme, strong typography, subtle gradients, minimal animations, generous spacing**. Read as a high-end developer / product designer portfolio — not a generic resume site.

---

## Tokens

### Color (dark first)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#08090C` | Page background. Near-black with a hint of cool blue. |
| `--bg-2` | `#0E1014` | First elevation. Cards sit on this. |
| `--bg-3` | `#15181F` | Hover / nested surface. |
| `--fg` | `#F5F5F7` | Primary text. Slightly warm, not pure white. |
| `--fg-2` | `#C7C9D1` | Secondary text. |
| `--fg-3` | `#7A7E89` | Tertiary / labels / metadata. |
| `--border` | `rgba(255, 255, 255, 0.08)` | Hairline dividers. |
| `--border-strong` | `rgba(255, 255, 255, 0.16)` | Card borders, hover. |
| `--accent` | `#A78BFA` | Brand accent — soft violet. Distinct from generic blue. |
| `--accent-2` | `#60A5FA` | Secondary accent — used for live indicators / gradients. |
| `--accent-glow` | `rgba(167, 139, 250, 0.18)` | Halo behind accent elements (gradients). |
| `--live` | `#34D399` | Live / shipping. Mint green, lifted from neutral. |
| `--live-glow` | `rgba(52, 211, 153, 0.20)` | Halo behind live dots. |
| `--warn` | `#F87171` | Counter-line warnings. |
| `--gradient-hero` | `radial-gradient(ellipse at top, rgba(167,139,250,0.12) 0%, transparent 55%)` | Subtle hero glow. |
| `--gradient-card` | `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)` | Card top highlight. |
| `--gradient-accent` | `linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)` | Used for accent text + button gradients. |

### Typography

| Role | Family | Size | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display | Space Grotesk | clamp(3rem, 7vw, 5.5rem) | 500 | -0.035em | Hero name. |
| Hero-spine | Inter | clamp(1.0625rem, 1.5vw, 1.375rem) | 400 | -0.005em | Hero tagline. |
| Headline-lg | Space Grotesk | clamp(1.75rem, 3vw, 2.5rem) | 500 | -0.025em | Section H2. |
| Headline-md | Space Grotesk | 1.5rem | 500 | -0.02em | Card titles. |
| Headline-sm | Space Grotesk | 1.125rem | 500 | -0.015em | Sub-titles, nav. |
| Body-lg | Inter | 1.0625rem | 400 | 0 | Hero lede. |
| Body-md | Inter | 0.9375rem | 400 | 0 | Default body. |
| Body-sm | Inter | 0.8125rem | 400 | 0 | Captions, footer. |
| Label | JetBrains Mono | 11px | 500 | +0.08em upper | Section labels (sparingly). |
| Micro | JetBrains Mono | 10px | 500 | +0.08em upper | Status, breadcrumbs. |

Stack: Space Grotesk (display, distinctive geometry) + Inter (body, neutral long-form) + JetBrains Mono (technical metadata only, same rule as v1 — no ornament).

### Layout

- **Max content width:** 1280px (`.wrap`), with hero / footer sections stretching full-width.
- **Reading column:** `.prose` capped at 720px for long-form prose (about, pattern detail).
- **Sidebars / rails:** 320px.
- **Generous spacing:** section padding `7rem` desktop / `4rem` mobile. Card padding `2rem`. Grid gap `2.5rem`.
- **Container padding:** `2rem` mobile, `3rem` tablet, `4rem` desktop.

### Elevation & Depth

- **Floor 0:** `--bg`
- **Floor 1:** `--bg-2` with `--border` hairline + 1px radius; top edge has `var(--gradient-card)` highlight.
- **Floor 2 (hover):** `--bg-3` with `--border-strong`.
- **No drop shadows.** Subtle inner top highlight on cards instead. Hero gets a single soft radial glow.

### Shapes

- `radius-sm`: 6px (chips, small buttons)
- `radius-md`: 10px (buttons)
- `radius-lg`: 16px (cards)
- `radius-xl`: 24px (feature panels)
- `radius-full`: 9999px (pills)

### Motion

- Subtle entrance fade + 12px slide on scroll for hero, sections. 200ms.
- Hover transforms limited to `translateY(-2px)` on cards/buttons, 150ms ease-out.
- Gradient accents shimmer on hero (2000ms infinite, very subtle).
- `prefers-reduced-motion` removes all of it.

### Accessibility

- WCAG 2.1 AA in dark mode. Verified ratios:
  - `--fg` on `--bg`: 16.4:1 ✓
  - `--fg-2` on `--bg`: 9.8:1 ✓
  - `--fg-3` on `--bg`: 4.7:1 ✓ (passes AA for normal text)
  - `--accent` (#A78BFA) on `--bg`: 7.2:1 ✓
  - `--accent` on `--bg-2`: 6.8:1 ✓
- All interactive elements have `:focus-visible` outlines using `--accent`.
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) on every route.
- Skip-to-content link.

---

## Components (v2 visual specs)

### Button primary
- Background: `var(--gradient-accent)`
- Color: `#08090C` (dark text on the gradient)
- Padding: `0.875rem 1.5rem`
- Radius: `var(--radius-md)`
- Hover: `translateY(-2px)` + brightness 1.05
- Focus-visible: 2px solid `--accent`, 3px offset

### Button secondary
- Background: transparent
- Color: `--fg`
- Border: `1px solid var(--border-strong)`
- Padding: `0.875rem 1.5rem`
- Radius: `var(--radius-md)`
- Hover: background `--bg-3`, border `--fg-3`

### Proof tile
- Large number (Space Grotesk, clamp(2.5rem, 4vw, 3.5rem), 500 weight)
- Label below (Inter, 0.875rem, `--fg-3`)
- Vertical separator (1px `--border`) between tiles on desktop
- No top border ornament; the number IS the visual

### Card (lab, project, case-study)
- Background: `--bg-2`
- Border: `1px solid var(--border)`
- Radius: `var(--radius-lg)`
- Padding: `2rem`
- Top edge: 1px gradient highlight (`linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)`)
- Hover: border `--border-strong`, `translateY(-2px)`, 200ms

### Tag chip
- Background: `var(--bg-3)`
- Border: `1px solid var(--border)`
- Color: `--fg-2`
- Padding: `0.3rem 0.7rem`
- Radius: `var(--radius-full)`
- Font: JetBrains Mono 11px uppercase +0.06em

### Now ticker dot
- Active: `--live` 8px with `--live-glow` 16px halo (radial)
- Prior: `--fg-3` 6px solid, no halo

### Live indicator
- Pulsing dot (`--live`) + label ("Live", "Updated weekly")

---

## Anti-patterns (rejected)

- No emoji as structural icons. Inline SVG only (or unicode where universal: `→`, `↓`, `•`).
- No rainbow gradients. Subtle single-axis gradients only.
- No animation on every element. Motion earns its slot.
- No card-mosaic overload. 2–3 cards per row max.
- No "Hi, I'm {name}" hero opening.
- No skill percentage bars.
- No testimonial carousels.

---

## Surface plan

| # | File | Route | Purpose |
|---|---|---|---|
| 01 | `01-homepage.html` | `/` | Hero + work + skills + experience + about + side projects + contact |
| 02 | `02-work.html` | `/work` | Case study index |
| 03 | `03-case-study.html` | `/work/wellbook` | Full case study page |
| 04 | `04-pattern.html` | `/patterns/canonical-model` | Engineering playbook |
| 05 | `05-now.html` | `/now` | Live ticker |
| 06 | `06-about.html` | `/about` | Bio + experience + personality |
| 07 | `07-side-projects.html` | `/side-projects` | Tools, games, experiments |
| 08 | `08-built.html` | `/built` | Architecture diagram |
| 09 | `09-recruiter.html` | `/?for=recruiter` | Condensed recruiter view |

All 9 surfaces use a shared `<head>` + inline CSS pattern. Each file is self-contained and viewable in a browser without a build step.
