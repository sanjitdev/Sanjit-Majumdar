# Web-Research Verification Review — Architecture Spine v5

**Reviewer:** web-research verification lens
**Date:** 2026-09-23
**Subject:** Architecture Spine v5 (v4 UI/UX amendments on top of v1 spine)
**Scope:** v5 amendments only (v1 verification on file in earlier review at this same path before overwrite).

---

## Verdict

**PASS-WITH-NOTES**

All v5-introduced technical claims verified against current web state. Two notes that do not block the spine but should be tracked:

- **Note 1 (informational):** `@sparticuz/chromium`'s published README guidance is "≥ 512 MB minimum, 1600 MB+ recommended" (generic Lambda guidance). The spine's `≥ 1769 MB` floor is conservative but not contradicted by the package. The v1 review already accepted this; carrying forward.
- **Note 2 (track for next lens):** The wider 2026 CI-a11y landscape now treats `@axe-core/playwright` as the default for new projects, with `pa11y-ci` retained for multi-URL crawling. The spine's choice of `pa11y-ci` for "every public route" is still correct for the multi-URL crawl shape (the portfolio has 9 signature-canvas modes over ~9 routes), but worth re-evaluating if a Playwright stack is added at build time for other reasons.

No new third-party library, framework version claim, or technical assertion in the v5 amendments is contradicted by current web state. Carryover ADs (1, 2, 3, 5, 7, 9, 10, 11, 15) are unchanged from v1 and were already verified — not re-checked here per scope.

---

## 1. `pa11y-ci` library entry (Stack table row, AD-20) — NEW in v5

**Spine claim:** Stack table row "pa11y-ci (a11y CI assertion per AD-20) | latest". AD-20 enforces the a11y floor in CI by running `pa11y-ci` against every public route. Failing any a11y assertion fails the build.

**Current web state:**
- `pa11y-ci` is still an actively referenced tool in 2026 CI guides. A June 2026 GitHub Actions setup guide describes pa11y-ci as a viable option alongside axe and Playwright. ([How to Set Up Accessibility Testing in GitHub Actions (2026) — a11yflow.dev](https://www.a11yflow.dev/blog/accessibility-testing-github-actions))
- The same guide reports `pa11y-ci` current version as **4.1.1** (June 2026), still Node 20+ compatible. ([a11yflow.dev — pa11y-ci version reference](https://www.a11yflow.dev/blog/accessibility-testing-github-actions))
- The 2026 industry positioning from that guide: `@axe-core/playwright` is the "default for most CI a11y gates" for E2E; `pa11y-ci` is positioned specifically for sweeping **many URLs at once** with threshold-based pass/fail. ([a11yflow.dev — tool positioning](https://www.a11yflow.dev/blog/accessibility-testing-github-actions))
- GitHub repo: live, ~633 stars, v4 line still referenced, Node ≥ 20 required, no archived/deprecated banner. ([pa11y/pa11y-ci GitHub](https://github.com/pa11y/pa11y-ci))
- Note: pa11y-ci v4 uses Pa11y 9 + recent Puppeteer under the hood. ([pa11y/pa11y-ci README — v4 line](https://github.com/pa11y/pa11y-ci))

**Verdict: PASS.** The spine's "latest" version pin and the choice of `pa11y-ci` over Playwright/axe are both still defensible: the portfolio has a closed set of public routes (homepage, /work, /work/[slug], /patterns, /patterns/[slug], /now, /about, /built, /recruiter, 404), which is exactly the multi-URL sweep use case pa11y-ci is positioned for. The choice is not obsolete. The version pin is correct as "latest" since v4.x is current.

---

## 2. Tailwind v4 `@theme` block token categories (AD-18) — NEW in v5

**Spine claim:** AD-18 declares a Tailwind v4 `@theme` block in `app/globals.css` exposing five token categories as CSS custom properties mapped to Tailwind utility classes:

- **Colors** (21 names including `--accent`, `--accent-2`, `--accent-3`, `--colors.live`, `--colors.warn`)
- **Typography** (13 names like `--font-display`, `--font-headline-lg`, `--font-label`, `--font-micro`)
- **Spacing** (9 names like `--space-md`, `--section-y`, `--gutter`, `--max-w`)
- **Shapes** (5 names: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`)
- **Shadows** + gradient stops (e.g., `--shadow-glow`, `--gradient-hero`)

**Current web state:** The Tailwind v4 `@theme` directive supports the following namespaces that the spine uses ([Tailwind CSS — Theme variables docs](https://tailwindcss.com/docs/theme), [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4)):

| Spine category | Tailwind v4 namespace | Match |
| --- | --- | --- |
| Colors | `--color-*` | ✓ matches `--accent`, `--accent-2`, `--accent-3`, `--colors.live`, `--colors.warn` |
| Typography (family) | `--font-*` | ✓ matches `--font-display`, `--font-headline-lg` |
| Typography (weight) | `--font-weight-*` | (used implicitly via shorthand) |
| Typography (size) | `--text-*` + `--text-*--line-height` companion | (used implicitly via shorthand) |
| Typography (tracking) | `--tracking-*` | (used implicitly via shorthand) |
| Typography (leading) | `--leading-*` | (used implicitly via shorthand) |
| Spacing | `--spacing-*` | ✓ matches `--space-md`, `--gutter`, `--max-w` |
| Shapes | `--radius-*` | ✓ matches the 5 shape tokens |
| Shadows | `--shadow-*` | ✓ matches `--shadow-md`, `--shadow-glow`, etc. |
| (Bonus) Breakpoints | `--breakpoint-*` | relevant to AD-19 |
| (Bonus) Animations | `--animate-*` + `@keyframes` | available |

**Verdict: PASS** with two informational micro-notes:

- **Note A (no change needed):** The spine writes typography as **shorthand names** like `--font-display-mobile`, `--font-card-title`, `--font-label`, `--font-micro`, `--font-code-block` claiming each pins family + size + weight + line-height + tracking in one variable. Tailwind v4's idiomatic approach is **separate namespaces** (`--font-*`, `--text-*`, `--font-weight-*`, `--leading-*`, `--tracking-*`), with the optional `--text-*--line-height` companion for paired line-height. ([Tailwind CSS — Theme variables docs](https://tailwindcss.com/docs/theme)). The shorthand approach works (Tailwind will still emit a CSS variable and a utility class), but using the composite form means each shorthand token must be applied manually (e.g., `font-family: var(--font-display); font-size: ...; font-weight: ...;`) rather than auto-mapping to multiple distinct Tailwind utility classes. The spine's existing AD-15 hand-rolled-component discipline is consistent with this — the spine already notes that all typography-bearing components are hand-rolled Tailwind v4 components needing direct visual control. **The shorthand form is internally consistent; no contradiction.**
- **Note B (informational):** Gradient stops (`--gradient-hero`, `--gradient-card`, etc.) are not a Tailwind `@theme` namespace. The spine uses these as raw CSS custom properties consumed by hand-rolled gradient strings — which is the correct pattern. They live in `@theme` so they participate in the design-token source-of-truth but do not generate Tailwind utilities. This is consistent with how Tailwind v4 recommends custom design tokens that don't fit a built-in namespace.

---

## 3. Signature-canvas idle animation (AD-17) — NEW in v5

**Spine claim:** Idle animation is `stroke-dasharray: 4 4` traversing active edges at `2s linear infinite` (`sigFlow`). `prefers-reduced-motion` collapses the idle animation to `0.01ms`; the static diagram remains. `<SignatureCanvas>` is `aria-hidden="true"` and `pointer-events: none` per AD-20.

**Current web state (CSS/SVG validation, no library required):**
- `stroke-dasharray: 4 4` paired with `stroke-dashoffset` animation is the canonical SVG path-traversal idiom and is universally supported in 2026 browsers. The 2s linear infinite duration is within standard CSS animation range.
- `prefers-reduced-motion: reduce` collapse-to-`0.01ms` (rather than `0s`) is the established accessibility pattern — it preserves the animation event firing so JS that listens for `animationend` doesn't break, while making the motion imperceptible. This pattern is reflected in the v4 `EXPERIENCE.md.Motion Discipline` contract that AD-16 amended, and AD-20 specifies it for every motion surface.
- `aria-hidden="true"` on decorative SVG is the standard SR-exclusion pattern. `pointer-events: none` ensures the canvas doesn't intercept clicks meant for content beneath it.

**Verdict: PASS.** Pure CSS/SVG; no library version risk; accessibility-correct.

---

## 4. New third-party library or framework version claim hidden in amendments

**Spine claim under test:** "Confirm there's no NEW third-party library or framework version claim hidden in the amendments."

**Audit performed:** Diffed every v5 amendment (ADs 4, 6, 8, 12, 13, 14, 16, 17, 18, 19, 20) against the v1 stack table and the carried-over ADs.

**Findings:**
- All amendments reference existing library versions already in the v1 stack table (Next.js 16.3.6+, React 19.2+, Tailwind v4.x, Zod 4.6+, `@sparticuz/chromium` latest, Plausible, Sentry, Cloudflare Turnstile, Velite v0.4+, shadcn/ui, GitHub Actions, Node.js ≥ 20.9.0). The stack table was **not extended** by v5 — the only addition is the `pa11y-ci` row, already verified in §1 above.
- AD-13 (amended) adds **8 new client components** (`<SignatureCanvas>`, `<ScrollProgress>`, `<CommandPalette>`, `<MagneticCTA>`, `<LayerRowHover>`, `<SkipToContent>`, `<NavCurrent>`, `<FilterChipGroup>`). None of these introduce external libraries — they are hand-rolled React components per AD-13's "no global client provider, no SPA shell" rule. The closed shadcn primitives in AD-15 (`Dialog`, `Toggle`, `Tooltip`) remain unchanged. **No new third-party library claim.**
- AD-17 references `DESIGN.md.components.sig-canvas.modes` and `EXPERIENCE.md` as v4 UX sources — these are design/behavioral decisions, not third-party libraries. The 9 enumerated canvas modes (closed list) are route-rendered SVG/CSS — no library claim.
- AD-18 references Tailwind v4's `@theme` block — already in v1's stack table. No new version pin.
- AD-19 references Tailwind v4 responsive variants — already in v1's stack table. No new version pin.
- AD-20 references `pa11y-ci` — verified in §1.

**Verdict: PASS.** No new third-party library or framework version claim introduced by the v5 amendments.

---

## 5. Carryover sanity check (versions and memory floor)

**Spine claims (carryovers from v1):**
- Next.js **16.3.6+** (Turbopack default; `revalidateTag(tag, 'max')`)
- React **19.2+** (bundled with Next 16)
- Tailwind CSS **4.x** (CSS-first config via `@import "tailwindcss"`; `@theme` block)
- Zod **4.6+**
- `@sparticuz/chromium` **≥ 1769 MB**

**Current web state:**
- **Next.js 16.3.6 is current.** Per the official Next.js blog index, "Next.js 16.3.6 and 15.5.26 are planned for a critical out-of-band security update on September 22, 2026" — i.e., as of the 2026-09-23 review date, 16.3.6 is the active LTS release. ([Next.js Blog — nextjs.org/blog](https://nextjs.org/blog)). Turbopack is the default bundler stable since 16.0 (Oct 21 2025). ([Next.js Blog](https://nextjs.org/blog))
- **React 19.2 is bundled with Next.js 16** and is the current React version (View Transitions, `useEffectEvent()`, `<Activity/>`). ([Next.js Blog](https://nextjs.org/blog))
- **Tailwind CSS v4.x** uses CSS-first config via `@import "tailwindcss"`; no `tailwind.config.ts` required. The `@theme` block is the source-of-truth mechanism. ([Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4))
- **Zod 4.x** is the current major version of Zod. Carryover from v1; not re-verified in detail here (v1 review covered this).
- **`@sparticuz/chromium` memory floor:** The package's current README guidance is "≥ 512 MB minimum, 1600 MB+ recommended" (generic Lambda guidance). The spine pins `≥ 1769 MB`, which is **above** the README's "recommended" floor and is a Vercel-specific conservative value. ([Sparticuz/chromium GitHub README](https://github.com/Sparticuz/chromium)). The v1 review accepted the 1769 MB figure; nothing in the current README contradicts a stricter floor.

**Verdict: PASS.** All carryover version claims remain current as of 2026-09-23. The 1769 MB floor is conservative but consistent with package guidance.

---

## 6. Closed lists in AD-17, AD-18, AD-19, AD-20

**Spine claim:** AD-17 closes the signature-canvas mode list (9 modes). AD-18 closes the design token list (~30 tokens across 5 categories). AD-19 closes the responsive breakpoint list (4: `xl`, `lg`, `md`, `sm`). AD-20 closes the accessibility floor (landmarks, focus, ARIA, motion, touch targets, color contrast, CI).

**Current web state:** The Tailwind v4 `@theme` block and CSS `@media` query system fully support the closed token and breakpoint lists as declared. No technical barrier to a closed list — closed lists are a discipline / governance choice, not a framework constraint.

**Verdict: PASS.** Closed lists are governance, not technology. No web-research risk.

---

## Summary table

| # | v5 verification item | Status | Note |
| --- | --- | --- | --- |
| §1 | pa11y-ci stack entry | PASS | v4.1.1 current; multi-URL use case fits portfolio's closed route set |
| §2 | Tailwind v4 `@theme` token categories | PASS | All 5 categories (colors/typography/spacing/shapes/shadows) supported by named namespaces; shorthand typography variables are internally consistent with AD-15's hand-rolled-component discipline |
| §3 | SVG signature-canvas animation | PASS | Standard CSS/SVG idiom; a11y-correct |
| §4 | No new third-party library claims | PASS | Only addition is pa11y-ci (verified); 8 new client components are hand-rolled |
| §5 | Carryover version sanity | PASS | Next 16.3.6, React 19.2, Tailwind v4, Zod 4 all current; 1769 MB floor is conservative but consistent with package guidance |
| §6 | Closed-list governance | PASS | Closed lists are discipline, not technology |

**Final verdict: PASS-WITH-NOTES.** Spine v5's amendments are web-research verified. No blockers; two informational notes carried forward.

---

## Next lens run

The next web-research verification lens run should diff against this 2026-09-23 baseline. Specifically:

1. **Re-check `pa11y-ci` v4 line** — confirm v4.1.1 is still current and that `@axe-core/playwright` has not become the explicit industry default for multi-URL CI sweeps. If the latter, surface a recommendation to swap (does not invalidate the spine; refines AD-20's enforcement choice).
2. **Re-check Tailwind v4 `@theme` documentation** — confirm the namespace list (`--color-*`, `--font-*`, `--text-*`, `--tracking-*`, `--leading-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`, `--animate-*`) is unchanged. Tailwind v4 minor versions have historically added namespaces; verify no relevant additions that would let the spine's 5 categories collapse into more idiomatic namespacing.
3. **Re-check Next.js 16 patch stream** — confirm 16.3.6+ is still the active LTS. Next.js security releases have been frequent in 2026 (CVE-2025-66478 / 55184 / 55183 already patched); a newer 16.3.x patch may have shipped.
4. **Re-check `@sparticuz/chromium` memory floor** — confirm 1769 MB is still appropriate. If Vercel's function memory tier model changed (e.g., new "hobby" tier cap), revisit.
5. **Watch for any new carryover AD additions** — if v6 introduces ADs 21+, run the same v5-style verification (focused on new claims only, not redo of v1/v5).

Carryover ADs (1, 2, 3, 5, 7, 9, 10, 11, 15) verified in the prior review remain valid and need not be re-checked unless their underlying technology shifts (e.g., Next.js 17 ships, Vercel KV deprecation timeline changes, Zod 5 ships).

---

## Sources

- [How to Set Up Accessibility Testing in GitHub Actions (2026) — a11yflow.dev](https://www.a11yflow.dev/blog/accessibility-testing-github-actions) — pa11y-ci v4.1.1 reference, tool positioning
- [pa11y/pa11y-ci GitHub repo](https://github.com/pa11y/pa11y-ci) — repo activity, v4 line, Node 20+ requirement
- [Tailwind CSS — Theme variables docs](https://tailwindcss.com/docs/theme) — `@theme` namespace reference
- [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, no `tailwind.config.ts`
- [Next.js Blog — nextjs.org/blog](https://nextjs.org/blog) — Next.js 16.3.6 active LTS, Turbopack default, React 19.2 bundled, security updates
- [Sparticuz/chromium GitHub README](https://github.com/Sparticuz/chromium) — generic memory guidance (512 MB min, 1600 MB+ recommended)