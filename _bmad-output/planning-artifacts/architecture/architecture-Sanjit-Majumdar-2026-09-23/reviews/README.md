# Reviewer scratch — not part of the deliverable

The `ARCHITECTURE-SPINE.md` at the parent of this folder is the deliverable. This folder holds reviewer scratch from the Reviewer Gate; it is excluded from downstream reads.

**v5 review pass (2026-09-23, after v4 UI/UX amendments):**
- `review-web-research.md` — PASS. Confirmed the v5 amendments introduce no new third-party library risk; `pa11y-ci` is the right 2026 a11y CI tool for a multi-route portfolio; Tailwind v4 `@theme` blocks support all named token categories; the signature-canvas SVG/CSS animation is a standard, accessibility-correct pattern.
- `review-adversarial.md` — PASS-WITH-NOTES. 8 v5-introduced findings, all addressed in the spine as inline amendments (no new ADs added; all amendments kept stable AD IDs):
  1. AD-7 URL contract split → AD-7 Rule updated to `/recruiter?forward=1&case=<slug>` (matches amended AD-14).
  2. AD-12 `layered-architecture` assertion unanchored → AD-12(d) binds to `data-sig-canvas-mode="..."` attribute; AD-12(f) adds the stale-bookmark redirect.
  3. AD-17 mode table omits 5 routes → AD-17 expanded to 13 rows including `/patterns`, `/projects/[slug]`, `/lab/[slug]`, `/now/feed.xml` (no canvas), `/404` (no canvas).
  4. AD-18 token counts inconsistent → AD-18 enumerates 57 tokens in 6 categories; tokens-intentionally-not-in-the-set list added.
  5. AD-16 motion-discipline gates incomplete → AD-16 amendment now binds a 10-row motion surface table with explicit `prefers-reduced-motion` and `pointer:fine` gates.
  6. AD-4 heading-ID contract ambiguous → AD-4 amendment now binds the `move-{N}` slugger form (1-indexed), the `when-not` counter-line form, and the rule that other headings are the MDX layer's responsibility.
  7. AD-20 ARIA rules implicit → AD-20 now binds `aria-live="polite" aria-relevant="additions"` on the CommandPalette listbox and the NOW ticker list, plus `aria-live="polite"` on the recruiter `?case=` callout.
  8. AGENTS.md two-repo mirror scope undefined → AGENTS.md "Two-repo topology" section now scopes the content-side mirror to the rules the content repo can honor (AD-1, AD-2, AD-5, AD-9, AD-10, frontmatter shape, ISR tag enum) and explicitly excludes AD-13/17/18/19/20.

Next lens run should diff against this v5 baseline. v1 review findings (entry shape, CV ownership, snapshot write path) remain resolved in v5.
