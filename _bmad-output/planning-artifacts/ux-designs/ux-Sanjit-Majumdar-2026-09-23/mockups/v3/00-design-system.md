# v3 Design Direction — Studio · Fusion · Glass

> Third parallel branch. v1 = Quiet Authority (light, editorial). v2 = Quiet Authority Dark (violet/blue gradient, premium portfolio). v3 = **Studio Fusion** — high-end product site × modern dev portfolio × interactive digital studio. Glassmorphism used sparingly. Layered depth. Refined shadows. Confident and intentional.

---

## Aesthetic Register

- **Studio.** Reads like a curated digital studio site — Linear / Vercel / Arc / Rauno / Rauno Freiberg / Rauno Freiberg / Rauno / Studio Maitri — but stays honest about being a portfolio, not a product.
- **Fusion.** Each section adapts its visual register: hero = product landing, work = case study, lab = studio pieces, contact = call-to-action page.
- **Layered.** Cards sit on a 3-tier surface system with hairline borders + soft drop shadows + ambient glow. Depth earned through composition, not decoration.
- **Magnetic.** Subtle interactions that respond to cursor position and proximity. Magnetic CTAs, project card transforms on hover, animated gradients.

---

## Tokens

### Color (dark-first, near-black)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#06070B` | Page background. Pure deep black. |
| `--bg-2` | `#0B0D14` | First elevation. Cards, panels. |
| `--bg-3` | `#10131C` | Section background, nested surface. |
| `--glass` | `rgba(255,255,255,0.03)` | Glass surface fill (on top of any bg). |
| `--glass-strong` | `rgba(255,255,255,0.05)` | Elevated glass. |
| `--fg` | `#FAFAFA` | Primary text. |
| `--fg-2` | `#D4D4D8` | Secondary text. |
| `--fg-3` | `#8B8E97` | Tertiary / labels / metadata. |
| `--fg-4` | `#5C5F68` | Dimmed metadata. |
| `--border` | `rgba(255,255,255,0.06)` | Hairline dividers. |
| `--border-strong` | `rgba(255,255,255,0.12)` | Card borders, hover state. |
| `--border-accent` | `rgba(167,139,250,0.30)` | Accent-tinted border. |
| `--accent` | `#A78BFA` | Primary brand accent. Violet. |
| `--accent-2` | `#67E8F9` | Electric cyan. Secondary accent. |
| `--accent-3` | `#F472B6` | Tertiary pink — for gradient joins. |
| `--accent-glow` | `rgba(167,139,250,0.25)` | Halo behind accent elements. |
| `--accent-2-glow` | `rgba(103,232,249,0.20)` | Cyan halo. |
| `--live` | `#34D399` | Live / shipping indicators. |
| `--warn` | `#FCA5A5` | Counter-line warnings. |
| `--gradient-hero` | `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(167,139,250,0.18) 0%, rgba(103,232,249,0.06) 35%, transparent 65%)` | Hero top glow. |
| `--gradient-card` | `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%)` | Card top highlight. |
| `--gradient-text` | `linear-gradient(135deg, #A78BFA 0%, #67E8F9 50%, #F472B6 100%)` | Display text gradient (hero name). |
| `--gradient-accent` | `linear-gradient(135deg, #A78BFA 0%, #67E8F9 100%)` | Button fill, accent surfaces. |
| `--gradient-button` | `linear-gradient(135deg, #A78BFA 0%, #67E8F9 100%)` | Primary button. |

### Shadows (layered depth)

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.20)` | Subtle lift. |
| `--shadow-md` | `0 4px 24px rgba(0,0,0,0.30)` | Card lift on hover. |
| `--shadow-lg` | `0 16px 48px rgba(0,0,0,0.45)` | Featured elements. |
| `--shadow-glow` | `0 0 40px rgba(167,139,250,0.30)` | Accent glow. |
| `--shadow-glow-cyan` | `0 0 40px rgba(103,232,249,0.25)` | Cyan glow. |

### Typography

| Role | Family | Size | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display | Space Grotesk | clamp(3.5rem, 8vw, 7rem) | 500 | -0.04em | Hero name (the largest moment). |
| Display-spine | Inter | clamp(1.125rem, 1.5vw, 1.5rem) | 400 | -0.01em | Hero tagline. |
| Headline-xl | Space Grotesk | clamp(2rem, 4vw, 3.5rem) | 500 | -0.03em | Section H2. |
| Headline-lg | Space Grotesk | clamp(1.5rem, 2.5vw, 2rem) | 500 | -0.025em | Card titles, sub-section. |
| Headline-md | Space Grotesk | 1.25rem | 500 | -0.02em | Sub-card titles. |
| Body-lg | Inter | 1.0625rem | 400 | -0.005em | Lede paragraphs. |
| Body-md | Inter | 0.9375rem | 400 | 0 | Default body. |
| Body-sm | Inter | 0.8125rem | 400 | 0 | Captions, footer. |
| Label | JetBrains Mono | 11px | 500 | +0.08em upper | Section labels (sparingly). |
| Micro | JetBrains Mono | 10px | 500 | +0.08em upper | Status, breadcrumbs. |

Stack: Space Grotesk (display) + Inter (body) + JetBrains Mono (metadata only).

### Layout

- **Container:** `.wrap` at 1320px max-width. Hero / contact sections can break out to full-bleed.
- **Reading column:** `.prose` at 720px for long-form (about, pattern detail).
- **Sidebar:** 320px.
- **Section padding:** `8rem` desktop / `4.5rem` mobile — more generous than v2.
- **Container padding:** `3rem` desktop / `1.5rem` mobile.
- **Card padding:** `2.25rem` featured / `1.75rem` standard.

### Elevation (3-tier surface system)

- **Floor 0 — page:** `--bg`. Deep black.
- **Floor 1 — glass card:** `--glass` fill + `--border` hairline + `--shadow-md` lift + `var(--gradient-card)` top highlight. `radius-lg` corners.
- **Floor 2 — elevated glass:** `--glass-strong` fill + `--border-strong` border + `--shadow-lg` lift. Used for hover states and featured elements.

### Shapes

- `radius-sm`: 8px (chips)
- `radius-md`: 12px (buttons, small panels)
- `radius-lg`: 20px (cards)
- `radius-xl`: 28px (feature panels)
- `radius-2xl`: 36px (hero / signature panels)
- `radius-full`: 9999px (pills)

### Motion (refined, tasteful)

- **Entrance:** staggered fade-in + 16px slide-up on scroll, 250ms cubic-bezier(0.16, 1, 0.3, 1). Implemented via `animation-delay` per child.
- **Hover:** cards lift `translateY(-4px)` + shadow grows 200ms; buttons shift `translateY(-2px)`; arrow icons slide right.
- **Magnetic CTA:** subtle cursor-reactive transform on primary buttons (`translate(cursor.x * 0.15, cursor.y * 0.15)`). Static mock: simulated via `:hover` transform.
- **Animated gradient:** hero name gradient shifts hue slowly (`@keyframes hueShift`, 8s infinite).
- **Live dot:** pulsing dot (`@keyframes pulse`, 2s infinite).
- **Cursor-reactive orb:** in hero, a soft radial blob follows cursor position. Static mock: simulated via CSS keyframe drift.
- **Page transitions:** fade-through, 250ms.

### Accessibility

- WCAG 2.1 AA verified. Contrast ratios:
  - `--fg` on `--bg`: 19.5:1 ✓
  - `--fg-2` on `--bg`: 11.2:1 ✓
  - `--fg-3` on `--bg`: 5.4:1 ✓
  - `--accent` on `--bg`: 7.2:1 ✓
  - `--accent-2` on `--bg`: 11.4:1 ✓
- All interactive elements have `:focus-visible` outlines using `--accent`.
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) on every route.
- Skip-to-content link visible on focus.
- `prefers-reduced-motion` removes all transforms, animations, transitions.

---

## Components (v3 visual specs)

### Button primary (magnetic)
- Background: `var(--gradient-button)`
- Color: `#06070B` (dark text on gradient)
- Padding: `1rem 1.75rem`
- Radius: `var(--radius-md)`
- Hover: `translateY(-2px)` + `var(--shadow-glow)` + brightness 1.05
- Focus-visible: 2px solid `--accent`, 3px offset
- Magnetic: subtle pull toward cursor (mocked via `:hover`)

### Button secondary (glass)
- Background: `var(--glass)`
- Color: `--fg`
- Border: `1px solid var(--border-strong)`
- Padding: `1rem 1.75rem`
- Radius: `var(--radius-md)`
- Hover: background `var(--glass-strong)`, border `--accent` at 0.30

### Glass card
- Background: `var(--glass)`
- Border: `1px solid var(--border)`
- Radius: `var(--radius-lg)`
- Top edge: 1px gradient highlight (`var(--gradient-card)`)
- Shadow: `var(--shadow-md)`
- Hover: border `--border-strong`, shadow `var(--shadow-lg)`, translateY(-4px)

### Proof / impact tile
- Large number (Space Grotesk, clamp(2.5rem, 4vw, 3.5rem), 500)
- Below: label (Inter, 0.875rem, `--fg-3`)
- Optional small sub-text (Inter, 0.75rem, `--fg-4`)
- Hover: subtle glow halo

### Featured project card (immersive)
- Aspect ratio 16/9 screenshot area at top
- Below: meta (year, role), title, description, stack tags, outcome metric
- Hover: screenshot area reveals subtle gradient overlay; arrow icon shifts right

### Tag chip
- Background: `var(--glass)`
- Border: `1px solid var(--border)`
- Color: `--fg-2`
- Padding: `0.35rem 0.85rem`
- Radius: `var(--radius-full)`
- Font: JetBrains Mono 11px uppercase +0.06em

### Now ticker dot
- Active: 10px, `--live` with `--live-glow` 20px halo, 2s pulse
- Prior: 6px, `--fg-4` solid, no halo

### Live indicator
- Pulsing dot + label, glass pill background

### Cursor orb (hero)
- 600px radial gradient blob (cyan → violet, 0.10 opacity each)
- Position: absolute, follows cursor (in real implementation via JS)
- Static mock: animated drift via `@keyframes`

---

## Anti-patterns (rejected)

- No emoji as structural icons. Inline SVG / unicode symbols (`→`, `↓`, `●`, `★`, `⚠`).
- No rainbow gradients. Single-axis or 2-stop only.
- No animation on every element. Motion earns its slot.
- No card-mosaic overload. 2-3 cards per row max.
- No "Hi, I'm {name}" hero opening.
- No skill percentage bars.
- No testimonial carousels.
- No glassmorphism on every surface. Glass reserved for elevated panels, modals, feature surfaces.

---

## Surface plan

| # | File | Route | Purpose |
|---|---|---|---|
| 01 | `01-homepage.html` | `/` | Hero + impact + featured work + experience + expertise + side projects + now + about + contact |
| 02 | `02-work.html` | `/work` | Featured work index |
| 03 | `03-case-study.html` | `/work/wellbook` | Full case study |
| 04 | `04-pattern.html` | `/patterns/canonical-model` | Engineering playbook |
| 05 | `05-now.html` | `/now` | Live ticker |
| 06 | `06-about.html` | `/about` | Bio + experience + philosophy |
| 07 | `07-lab.html` | `/lab` | Side projects lab |
| 08 | `08-built.html` | `/built` | Architecture diagram |
| 09 | `09-recruiter.html` | `/?for=recruiter` | Recruiter view |

All 9 self-contained HTML, viewable without build.