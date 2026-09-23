# Google Stitch Design Handoff Prompt

> Workspace: `_bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/`
> Output target: same workspace, in whatever format Stitch emits (DESIGN.md, per-screen HTML, image previews).
> Upstream-of-UX contracts (read-only): PRD, SPEC, architecture spine — see `docs/` and `_bmad-output/` for paths.
> Brand & experience decisions captured in `.memlog.md` (entries 1–13).

---

## Paste this into Google Stitch

```
Project: A personal engineering portfolio for a senior software engineer.

The site has ONE job: prove the engineering judgment by being evidence of it.
Most portfolio sites describe what someone claims to be able to do.
This one demonstrates it. The portfolio itself is a product — built
with the same care as the enterprise work it represents.

Brand voice: QUIETLY SHARP. Dry wit lands in the proof-cluster copy
and the side-project descriptions. The hero is direct, not flashy.
Personality comes from content density, not decoration.

Visual register: MODERN-TECH-PORTFOLIO. Geometric sans, tight grid,
solid color blocks, sharp corners. Reads Linear / Vercel — modern,
tight, no fluff.

Tone of "spine line" (the one sentence the site exists to prove):
"He can do it — whatever you give him to build, he can build it
for you, and better than others." — render verbatim on the hero.

Stack (locked by PRD): Next.js + Tailwind, ISR, content from a
separate content repo via on-demand revalidation. Recruiter-mode
toggle is client-side state with URL deep-link (?for=recruiter).

Generate:

1) A DESIGN.md using the Google Labs design.md spec
   (https://github.com/google-labs-code/design.md).
   YAML frontmatter tokens: colors, typography, rounded, spacing,
   components. Body sections in canonical order: Brand & Style,
   Colors, Typography, Layout & Spacing, Elevation & Depth, Shapes,
   Components, Do's and Don'ts.

   Brand layer should be RESTRAINED — two colors of brand layer
   plus shadcn/Tailwind defaults for everything else. Sharp
   corners (4 / 6 / 8). Geometric sans throughout. Dark mode
   paired with light mode, both passing WCAG 2.1 AA contrast.
   The "modern tech portfolio" feel: tight grid, solid blocks.

2) Per-screen HTML for these key surfaces, with both modes
   (default = engineer, ?for=recruiter = recruiter):

   - Homepage hero
     Default: small "Sanjit Majumdar · Engineering" mark,
     4-line spine sentence rendered big, four-tile proof cluster
     (7+ yrs / 10K+ users / 35% faster / 7-person team) directly
     under it, primary nav (Work / Lab / Projects / Patterns / Now),
     a "For recruiters?" footer link in micro-typography.
     NOT recruiter-mode: full personality, full IA, full Lab teaser.

   - Recruiter-mode homepage
     Same hero, but condensed: spine + 4 proof vectors + a single
     recommended case study (Wellbook) + the forward-to-hiring-
     manager button. Foot-of-page "Exit recruiter mode" link.

   - Work / case-study detail
     Problem → Constraints → Architecture → Decisions →
     Implementation → Challenges → Results. "Patterns cited" rail
     near the top with deep-link cards.

   - Pattern detail page (one of: canonical-model)
     Engineering playbook layout: When to use / What it is /
     How to do it (numbered moves) / When NOT to use it
     (counter-line) / Example. Each move deep-linkable as #move-N.

   - /now (currently-building feed)
     Live ticker: vertical list with "● NOW" emphasized at top,
     latest entry highest. Each row: dot + title + 1-line
     description. Honest "Last updated: <date>" stamp.

   - /built (how this site is built)
     An interactive architecture diagram. Frontend (React/TS) →
     REST → Backend (.NET) → PostgreSQL. Clickable nodes
     open callouts. Footer-level route, not hero.

Constraints from the PRD that you MUST respect:

- Every public route renders spine + at least one proof number +
  a return path.
- Recruiter-mode toggle is opt-in (footer link), not header.
- Performance budget: LCP < 1.8s on Slow 4G mobile. Text-first.
- WCAG 2.1 AA in light AND dark modes.
- prefers-reduced-motion respected; motion never blocks content.
- Subtle motion only (entrance fade + 8px slide on scroll, 150ms;
  micro-interactions on toggle 100ms; modal 200ms ease-out).

Personality surfaces to make loud:

- Games earn their own card category under /lab.
- "Outside of production code" section on /about earns real estate.
- /built diagram is its own page, footer link from homepage.

What I do NOT want:
- Filled gradients, glass effects, drop shadows as decoration.
- Multi-color brand flourishes. Two colors of brand layer.
- Tailwind's default 6/8/12 corner rounding. Tighter: 4 / 6 / 8.
- Pill borders around status badges.

The signature contrast: the prose is dry and confident, the
site structure is bold and geometric. The two together should
read like a senior engineer's site rather than a portfolio template.
```

---

## Notes for the user

After running Stitch:

1. Save Stitch's DESIGN.md to `_bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/DESIGN.md`, replacing the draft.
2. Save any per-screen HTML to `_bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/mockups/`.
3. When you return with outputs, I'll continue: finalize EXPERIENCE.md against the captured decisions + your Stitch output, run the reviewer gate, and close out.
