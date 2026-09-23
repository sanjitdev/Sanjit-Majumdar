# Sanjit Majumdar · Studio — v4 Design System (Cinematic Dark)

> **Continuation of v3.** Same persona, raised craft. Same electric-violet accent; new signature interaction (live nodes-graph canvas), command palette (⌘K), magnetic primary CTA, scroll-progress, and liquid-glass surfaces used more generously.

---

## 1. Brand & Style

| Attribute | Value |
|-----------|-------|
| Mood | Cinematic dark, premium, editorial, technical, slightly experimental |
| Tone of voice | Receipts over adjectives. Direct. Calm authority. |
| Visual metaphor | An engineer's digital workspace — nodes, signal lines, type as architecture |
| What it must feel like | "This person builds serious software — and this website is proof." |
| What to avoid | Generic dev templates, neon overload, résumé layouts, decorative 3D, cliché code rain |

## 2. Colors

| Role | Hex | Token |
|------|-----|-------|
| Background (deep) | `#06070B` | `--bg` |
| Background (raised) | `#0B0D14` | `--bg-2` |
| Background (input/inset) | `#10131C` | `--bg-3` |
| Glass (subtle) | `rgba(255,255,255,0.03)` | `--glass` |
| Glass (strong) | `rgba(255,255,255,0.05)` | `--glass-strong` |
| Foreground | `#FAFAFA` | `--fg` |
| Foreground 2 | `#D4D4D8` | `--fg-2` |
| Foreground 3 | `#8B8E97` | `--fg-3` |
| Foreground 4 | `#5C5F68` | `--fg-4` |
| Border | `rgba(255,255,255,0.06)` | `--border` |
| Border strong | `rgba(255,255,255,0.12)` | `--border-strong` |
| Border accent | `rgba(167,139,250,0.30)` | `--border-accent` |
| Accent (electric violet) | `#A78BFA` | `--accent` |
| Accent 2 (cyan) | `#67E8F9` | `--accent-2` |
| Accent 3 (pink) | `#F472B6` | `--accent-3` |
| Accent glow | `rgba(167,139,250,0.25)` | `--accent-glow` |
| Live (green) | `#34D399` | `--live` |
| Live glow | `rgba(52,211,153,0.20)` | `--live-glow` |
| Warn (rose) | `#FCA5A5` | `--warn` |

Gradient stops:
- `--gradient-text`: violet → cyan → pink (`135deg`)
- `--gradient-button`: violet → cyan (`135deg`)
- `--gradient-card`: white 6% top → transparent 50%
- `--gradient-hero`: radial violet 18% at top → cyan 6% at 35% → transparent 65%
- `--gradient-canvas`: violet node-glow → cyan → pink (signature canvas accents)

## 3. Typography

| Slot | Family | Notes |
|------|--------|-------|
| Display (h1) | Space Grotesk | `clamp(3.5rem, 8vw, 7rem)`, weight 500, letter-spacing -0.04em, line-height 0.95 |
| Heading (h2/h3) | Space Grotesk | weight 500, letter-spacing -0.025em |
| Body | Inter | 16px base, line-height 1.6 |
| Mono / labels | JetBrains Mono | 10–13px, uppercase, tracking 0.06–0.08em |

System: Inter / Space Grotesk / JetBrains Mono. Preconnect Google Fonts.

## 4. Layout & Spacing

| Token | px |
|-------|----|
| `--radius-sm` | 8 |
| `--radius-md` | 12 |
| `--radius-lg` | 20 |
| `--radius-xl` | 28 |
| `--radius-2xl` | 36 |
| `--radius-full` | 9999 |
| `--gutter` | clamp(1.5rem, 4vw, 3rem) |
| `--section-y` | clamp(4.5rem, 10vw, 8rem) |
| `--max-w` | 1320 |

`section-y` (8rem desktop) is the rhythm unit between major sections; sections stack cleanly with consistent vertical breathing.

## 5. Elevation & Depth

| Token | Value | Used for |
|-------|-------|----------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.20)` | hairline raise on inputs |
| `--shadow-md` | `0 4px 24px rgba(0,0,0,0.30)` | card rest |
| `--shadow-lg` | `0 16px 48px rgba(0,0,0,0.45)` | card hover lift |
| `--shadow-glow` | `0 0 40px rgba(167,139,250,0.30)` | primary CTA hover |
| `--shadow-glow-strong` | `0 0 60px rgba(167,139,250,0.40)` | hero CTA climax |

Three elevation tiers (rest, hover, focus) on every interactive card. Plus optional violet glow halo on the focal primary CTA.

## 6. Shapes

- Generous radii on focal surfaces (`--radius-xl`, `--radius-2xl`)
- Pill chips on tags, filters, status (`--radius-full`)
- Hairline 1px borders as the dominant edge — never 2px+, never drop shadows as the primary affordance
- Internal `::before` 1px gradient line on top of cards (signature Studio Fusion touch, carried forward)

## 7. Components

### Signature interaction — `nodes-graph canvas`
A persistent SVG that lives in a fixed corner slot (desktop only; not on mobile). Shows ~7 nodes connected by curved bezier lines. Each node has a unique role label (Source, Build, Deliver, Instrument, etc.). On scroll the active section drives which node lights up (via class added by JS on IntersectionObserver). Idle state: a soft pulse animation traverses the edges like a packet.

Modes (one canvas per page, role-contextual):
- **Homepage**: dual-ring with central "thinking" hub. Pulses on hover over featured work.
- **Work index**: filter-chip state graph
- **Case study**: section-progress graph (6 nodes, one per case-section)
- **Pattern**: decision-graph (4 moves + counter-conditions)
- **Now**: activity-feed graph
- **About**: timeline-graph
- **Lab**: experiment-graph
- **Built**: the layered architecture diagram itself
- **Recruiter**: condensed 4-node status graph

### Navigation
- Sticky frosted nav (`backdrop-filter: blur(20px)`)
- Left: brand mark with cursor-style indicator
- Center: section links (with `aria-current="page"`)
- Right: command-palette trigger + primary CTA
- Bottom: thin 1px scroll-progress bar in `--accent`

### Command palette
- ⌘K / Ctrl-K opens; ESC closes
- Glass overlay (`backdrop-filter: blur(24px)`)
- Live filter across pages + sections
- Keyboard arrow nav; full ARIA role=dialog combobox semantics

### Magnetic CTA
- Single use per page (the primary action only)
- On `pointermove`, the button pulls up to 8px toward the cursor
- `matchMedia('(prefers-reduced-motion: reduce)')` short-circuits to static
- Clamp: max displacement 8px so the hit-area stays predictable

### Cards
- 3-tier elevation: rest → hover (lift -3/-4px, accent border, stronger shadow) → focus-visible (same visual richness as hover, plus 2px accent outline)
- Top gradient hairline (1px) on every card surface
- `border-radius: var(--radius-lg)` for utility cards, `--radius-xl` for hero/focal cards

### Buttons
- `.btn-primary`: gradient fill, dark text, glow on hover, magnetic on focal page
- `.btn-secondary`: glass surface, border-strong, border becomes accent on hover
- `.btn-ghost`: text-only with underline reveal on hover

### Tickers / NOW list
- Vertical `now-row` with date column, status dot, title, description, arrow
- Active row: live-green dot, brighter text, slightly larger title
- Row hover: slide right 1rem (only on desktop, no movement on touch)

### Impact metrics
- Animated count-up on viewport enter (one-shot)
- Gradient-text on the number
- Sub-label + small mono subscript ("Measured on…")

### Form inputs
- Inset `--bg-3`, hairline border, focus-visible → accent border + glow

## 8. Motion

| Motion | Tier | Where |
|--------|------|-------|
| Hue shift on gradient text | Subtle (8s) | hero name, contact title |
| Node pulse on canvas | Subtle (2s) | signature canvas idle |
| Magnetic CTA pull | Complex (300ms elastic) | primary CTA only |
| Scroll-progress fill | Subtle (100ms) | nav bottom bar |
| Card hover lift | Standard (200–300ms) | work, lab, decision cards |
| Section reveal on enter | Standard (350ms ease-out, y=12px) | section heads, cards in viewport |
| Live-dot pulse | Subtle (2s ease-in-out) | NOW rows, status indicators |
| Cursor halo (decorative) | Standard | behind hero only, hidden on touch |

All motion is gated by `@media (prefers-reduced-motion: reduce)` — durations collapse to 0.01ms.

## 9. Do's & Don'ts

- **Do**: use the signature canvas to subtly reward scroll depth — never as decoration
- **Do**: keep at most one magnetic element visible at a time
- **Do**: use gradient text only for the largest display sizes; body and labels stay plain
- **Do**: every interactive card has 3-tier elevation (rest/hover/focus)
- **Don't**: animate properties that cause layout (width, height, top, margin); use transform/opacity only
- **Don't**: show more than one primary CTA per viewport
- **Don't**: use emojis as structural icons — use SVGs (Lucide/Heroicons or inline)
- **Don't**: dim or disable content with motion — under reduced motion, render the final readable state

## 10. Accessibility floor

- WCAG 2.1 AA: text contrast ≥ 4.5:1 (verify in dark mode too — pure white on `--bg` ≈ 19:1)
- Keyboard: full tab order, visible `:focus-visible` outlines (2px accent, 4px offset), no focus traps in overlays except intentional command palette
- Motion: `prefers-reduced-motion` respected; canvas reveals are aria-hidden
- Skip-to-content link as first focusable element
- All icon-only buttons have `aria-label`
- Command palette implements `role="dialog" aria-modal="true" aria-labelledby="cmdk-title"`
- Touch targets ≥ 44px on mobile

## 11. Performance budget

- Self-contained per file, no external JS dependencies (signature canvas uses vanilla SVG + tiny IntersectionObserver)
- Fonts preconnect + display=swap
- Backdrop-filter used on nav + overlays only (not on every card)
- Idle canvas animation paused when offscreen via IntersectionObserver
- Images use text-based art placeholders (no asset weight)

---

## Shared chunks (referenced from every page)

### Signature canvas (compact, mode-adaptive)
- Lives in a 220×220 fixed-position slot (top-right of viewport on desktop ≥1024px; hidden on smaller)
- SVG with 7 nodes + 6 edges, bezier curves, animated dash-offset on edges
- Active-node class added per scroll position
- `aria-hidden="true"` (decorative)

### Scroll-progress bar
- 1px tall, top of nav, `transform: scaleX(var(--progress))` with `--progress` updated by scroll listener (capped 0–1)
- Color: `--accent`

### Command palette overlay
- Hidden by default; toggled via `[data-open="true"]` on root or `.cmdk-open` body class
- Glass: `background: rgba(6,7,11,0.72); backdrop-filter: blur(24px);`
- Input, live filter, results list with keyboard nav

### Reduced motion guard
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```
