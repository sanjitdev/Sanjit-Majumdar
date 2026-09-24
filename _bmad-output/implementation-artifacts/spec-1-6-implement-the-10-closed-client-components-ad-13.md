---
title: 'Implement the 10 closed client components (AD-13)'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 1
baseline_commit: '79a5f399efb69713e1115bfe4208cc303c3bc275'
context:
  - '{project-root}/_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-5-set-up-appglobalscss-with-the-closed-57-token-theme-block-ad-18.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiate">

## Intent

**Problem:** AD-13 closes the client-component set at 10. Every subsequent epic compiles against that closed list (E3 mounts `<FilterChipGroup>` + `<LayerRowHover>`; E4 mounts `<CommandPalette>`; E5a uses `<SignatureCanvas mode="activity-feed">`). Today `components/` does not exist; AD-13 has no code surface. If E1 ships with a hole in the closed set, downstream epics hit it as a regression.

**Approach:** Stand up `components/client/` with 7 detailed `.tsx` files (each starting with `"use client"`); co-source `lib/canvas-modes.ts` with the 9 AD-17 enum modes `<SignatureCanvas>` reads via a `mode` prop. The 3 simple-stub components (`ScrollProgress`, `SkipToContent`, `NavCurrent`) are deferred to a follow-up story (see `deferred-work.md` 2026-09-24-1-6 entry). Implement the AC-defined motion/a11y contracts for the 7 shipped components. Ship two preview-environment test harnesses (`app/__preview/filter-chip-group/page.tsx`, `app/__preview/layer-row-hover/page.tsx`) for the components E3/E5 will mount first — not user-facing mounts, just preview routes the CI can hit.

## Boundaries & Constraints

**Always:**
- Exactly 7 files under `components/client/` ship in this story: `SignatureCanvas.tsx`, `CommandPalette.tsx`, `MagneticCTA.tsx`, `LayerRowHover.tsx`, `FilterChipGroup.tsx`, `AnalyticsBeacon.tsx`, `ErrorBeacon.tsx`. The 3 deferred stubs (`ScrollProgress.tsx`, `SkipToContent.tsx`, `NavCurrent.tsx`) belong to a follow-up story — do NOT create them in 1-6.
- Each file begins with `"use client"` at line 1 (before imports).
- `lib/canvas-modes.ts` exports `CANVAS_MODES` as a `readonly` tuple of 9 enum strings (`dual-ring`, `filter-graph`, `section-progress`, `timeline`, `decision-graph`, `experiment-graph`, `activity-feed`, `layered-architecture`, `condensed-4-node-status`) + a `CanvasMode` type derived from it. Order matches the AD-17 enumeration in `epic-1-context.md` line 29.
- `<SignatureCanvas>` reads `mode: CanvasMode` prop; selects SVG geometry by mode (9 variants, each ~5-15 lines of inline SVG); idle `sigFlow` dash-offset animation 2s linear infinite under default conditions; collapses to 0.01ms under `matchMedia('(prefers-reduced-motion: reduce)')`; `aria-hidden="true"`; `pointer-events: none`; `display: none` below `xl` (≥1280px). Stroke color for each variant MUST read from `CANVAS_MODE_ACCENT[mode]` (co-sourced from `lib/canvas-modes.ts`); do NOT hardcode `var(--accent-…)` literals inline. The `CANVAS_MODE_ACCENT` table itself imports from `lib/design-tokens.ts` (1-5) — single source of truth for accent names.
- `<MagneticCTA>` renders `<button>`; on mount, registers a passive `pointermove` listener that translates the button by 0.18× pointer offset (clamped ≤8px) ONLY when `matchMedia('(pointer: fine)')` AND `NOT matchMedia('(prefers-reduced-motion: reduce)')` are both true; otherwise renders a static button with the same label, focusable, no listener.
- `<CommandPalette>` renders `<div role="dialog" aria-modal="true" aria-labelledby="cmdk-title">` with `<input>` + `<ul role="listbox" aria-live="polite" aria-relevant="additions">` containing `<li role="option" aria-selected>` items; focus trap inside the dialog; open transition uses `transition-duration: 0.01ms` under `prefers-reduced-motion`.
- `<AnalyticsBeacon>` renders `<Script src="https://plausible.io/js/script.js" data-domain="sanjit.dev" strategy="lazyOnload" />` per AD-11; emits 4 event names as TypeScript const exports (`forward_button_click`, `recruiter_mode_toggle`, `pattern_deep_link_visit`, `case_study_forward_open`).
- `<ErrorBeacon>` renders `<Script>` placeholder for Sentry (deferred loading); no-op Sentry init stub for 1-6 (real Sentry wiring is later).
- `<FilterChipGroup>` accepts `chips: { id: string; label: string }[]` and `onSelect(id: string)`; renders `<div role="radiogroup" aria-label="Filters">` containing `<button role="radio" aria-checked={c.id === active}>` per chip; ≥44px touch target on small breakpoint. (Single-select radiogroup pattern, NOT `aria-pressed` toggle — `aria-pressed` is for toggle buttons and is semantically wrong for one-of-N selection per WAI-ARIA APG.)
- `<LayerRowHover>` renders one `<tr>` (or `<div>` row) with `onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur` toggling a `data-hovered` attribute on a sibling element via a callback prop `onHoverChange(layer: number, hovered: boolean)`; `prefers-reduced-motion` short-circuits the visual change.
- Preview test harnesses: `app/__preview/filter-chip-group/page.tsx` (renders `<FilterChipGroup>` with sample chips) + `app/__preview/layer-row-hover/page.tsx` (renders a `<table>` with `<LayerRowHover>` rows). Both use `__preview/` (double underscore) to avoid Next.js's `_components` private-folder convention.
- Reuse `lib/design-tokens.ts` (1-5) for the 4 named accents; do NOT introduce a second design-token mirror. (`CANVAS_MODE_ACCENT` is a mode→color *route mapping* per AD-17, not a token mirror — the token names themselves are defined exclusively in `lib/design-tokens.ts`.)
- No new devDeps. No new top-level dependencies.

**Ask First:**
- Adding an 8th component to the shipped set (any component not in the 7 enumerated above).
- Shipping the 3 deferred stubs (`ScrollProgress`, `SkipToContent`, `NavCurrent`) in this story (they belong to a follow-up story per `deferred-work.md` 2026-09-24-1-6 entry).
- Replacing the 9 `<SignatureCanvas>` mode variants with a runtime-configurable shape system (architectural shift away from the closed enum).

**Never:**
- `"use client"` at the layout or page level (AD-13 no-SPA-shell; the 7 components are the only client boundaries in this story).
- A 10th-or-more SVG animation library (no Framer Motion, no GSAP — idle sigFlow is CSS dash-offset only).
- Mounting any of the 7 components on a user-facing route in 1-6. The two preview harnesses under `app/__preview/` are the only mounts this story ships; 1-7 mounts `<Nav>` (consuming `NavCurrent`+`ScrollProgress`+`MagneticCTA`+`CommandPalette`-trigger), 1-9 mounts `<SkipToContent>`+`<AnalyticsBeacon>`+`<ErrorBeacon>` in the root layout, 1-11 mounts `<SignatureCanvas mode="dual-ring">` + `<ProofVectorCluster>` on the homepage.
- Modifying `app/layout.tsx` or `app/page.tsx` (owned by 1-9 / 1-11).
- Modifying `app/globals.css` (owned by 1-5).
- Modifying `lib/design-tokens.ts` (owned by 1-5).
- Creating `components/ui/` (owned by 1-10).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_BUILD | `pnpm build` | exit 0; 7 client components compiled; preview routes registered under `app/__preview/`. | N/A |
| HAPPY_PATH_LINT | `pnpm audit:tokens` | exit 0; no inline hex outside closed AD-18 set. | N/A |
| COMPONENT_LIST_INVARIANT | `ls components/client/` | exactly 7 files (deferred stubs excluded). | N/A |
| MOTION_GATE_REDUCED | `prefers-reduced-motion: reduce` (any component) | animations collapse to 0.01ms; static fallbacks remain functional and focusable. | N/A |
| MOTION_GATE_POINTER_COARSE | `pointer: coarse` (e.g., touch device) | `<MagneticCTA>` short-circuits to static; no `pointermove` listener registered. | N/A |
| SIGNATURE_CANVAS_MODE_INVALID | `<SignatureCanvas mode="nonexistent" />` (TS) | compile error from `CanvasMode` literal-type narrowing. | TS error at build time |
| CANVAS_MODE_RUNTIME_DRIFT | future story adds a 10th mode string to `CANVAS_MODES` without updating `<SignatureCanvas>` switch | TS exhaustive-switch compile error. | TS error at build time |

</frozen-after-approval>

## Code Map

Files this story creates:

- `components/client/SignatureCanvas.tsx` — `"use client"` + `<svg>` with 9-mode switch driven by `CanvasMode`. ~80 lines.
- `components/client/CommandPalette.tsx` — `"use client"` + dialog/listbox/focus-trap. ~120 lines.
- `components/client/MagneticCTA.tsx` — `"use client"` + pointermove listener gated by `matchMedia`. ~50 lines.
- `components/client/LayerRowHover.tsx` — `"use client"` + hover/focus state callback. ~30 lines.
- `components/client/FilterChipGroup.tsx` — `"use client"` + chips with `aria-pressed`. ~40 lines.
- `components/client/AnalyticsBeacon.tsx` — `"use client"` + `<Script strategy="lazyOnload">` Plausible + 4 typed event exports. ~25 lines.
- `components/client/ErrorBeacon.tsx` — `"use client"` + `<Script strategy="lazyOnload">` Sentry stub. ~15 lines.
- `lib/canvas-modes.ts` — `CANVAS_MODES` tuple of 9 mode strings + `CanvasMode` type. ~30 lines.
- `app/__preview/filter-chip-group/page.tsx` — preview harness rendering `<FilterChipGroup>` with 3 sample chips. ~25 lines.
- `app/__preview/layer-row-hover/page.tsx` — preview harness rendering a 4-row `<table>` with `<LayerRowHover>` rows. ~30 lines.

Files this story modifies:

- `sprint-status.yaml` — sets `1-6-…: backlog → in-progress` at start; `→ review` at step-05.

Reuse / read-only anchors (no edits required):

- `lib/design-tokens.ts` (1-5) — import `ACCENT`/`ACCENT_2`/`ACCENT_3`/`LIVE` constants for `<SignatureCanvas>` mode→color mapping.
- `app/globals.css` (1-5) — `@theme` block defines `--accent`, `--accent-2`, `--accent-3`, `--live`, spacing tokens used by the components.
- `scripts/audit-tokens.mjs` (1-5) — auto-walks `components/**/*.tsx` (already in `AUDIT_TOKEN_GLOBS`); any new inline hex would fail the audit.
- `epic-1-context.md` lines 27, 29 — closed client-component set (10) + closed canvas-mode set (9) enumerations.
- `epics.md` lines 252-264 — the story 1.6 AC list this spec derives from.
- `spec-1-5-…md` Spec Change Log — KEEP block documents the audit-glob contract that includes `components/**/*.tsx`.
- `deferred-work.md` 2026-09-24-1-6 entry — the 3 deferred stubs (`ScrollProgress`, `SkipToContent`, `NavCurrent`) belong to a follow-up story.

## Tasks & Acceptance

**Execution:**

- [x] `lib/canvas-modes.ts` — CREATE: `export const CANVAS_MODES = ['dual-ring','filter-graph','section-progress','timeline','decision-graph','experiment-graph','activity-feed','layered-architecture','condensed-4-node-status'] as const;` + `export type CanvasMode = (typeof CANVAS_MODES)[number];` + JSDoc mapping each mode to its route + accent color (`dual-ring` → `/` + `ACCENT`, `filter-graph` → `/work` + `ACCENT`, `section-progress` → `/work/[slug]` + `ACCENT`, `timeline` → `/projects/[slug]` + `ACCENT`, `decision-graph` → `/patterns` + `ACCENT`, `experiment-graph` → `/lab` + `ACCENT_3`, `activity-feed` → `/now` + `ACCENT`, `layered-architecture` → `/built` + `ACCENT_2`, `condensed-4-node-status` → `/recruiter` + `LIVE`).
- [x] `components/client/SignatureCanvas.tsx` — CREATE: `"use client"`; `export function SignatureCanvas({ mode, className }: { mode: CanvasMode; className?: string })`; switch on `mode` with exhaustive case per CANVAS_MODES (TS `never` default → compile error on drift); inline `<svg viewBox="0 0 200 200" aria-hidden="true" style={{ pointerEvents: 'none' }}>` with per-mode geometry; idle `sigFlow` `<animate>` element with `dur="2s"` + `repeatCount="indefinite"` (SMIL animation; `<animate>` is SMIL, not CSS — `prefers-reduced-motion` does NOT affect SMIL, so the gate manipulates the SMIL `dur` attribute imperatively via React state); on mount, register `matchMedia('(prefers-reduced-motion: reduce)')` listener that swaps `dur` to `0.01ms` when matched; `display: none` below `xl` breakpoint via Tailwind class `hidden xl:block`. Stroke color for each variant reads from `CANVAS_MODE_ACCENT[mode]` (no inline `var(--accent)` literals in the JSX).
- [x] `components/client/CommandPalette.tsx` — CREATE: `"use client"`; renders `<div role="dialog" aria-modal="true" aria-labelledby="cmdk-title" hidden={!open}>` + `<h2 id="cmdk-title" className="sr-only">Command palette</h2>` + `<input type="text" autoFocus />` + `<ul role="listbox" aria-live="polite" aria-relevant="additions">` containing `<li role="option" aria-selected={selected}>` per item; open transition uses `transition-[opacity,transform] duration-150` (collapses to `duration-[0.01ms]` under reduced-motion); focus trap inside dialog on Tab/Shift+Tab.
- [x] `components/client/MagneticCTA.tsx` — CREATE: `"use client"`; renders `<button ref={btnRef} onPointerMove={handleMove} onPointerLeave={reset}>`; `handleMove` only runs if `matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)')`; computes `dx = clamp(e.clientX - rect.center, -8, 8) * 0.18`; sets `btnRef.current.style.transform = translate(${dx}px, ${dy}px)`; otherwise static (no listener).
- [x] `components/client/LayerRowHover.tsx` — CREATE: `"use client"`; renders `<tr onMouseEnter={…} onMouseLeave={…} onFocus={…} onBlur={…}>`; fires `onHoverChange(layer, true|false)`; reduced-motion no-ops the visual transition.
- [x] `components/client/FilterChipGroup.tsx` — CREATE: `"use client"`; `export function FilterChipGroup({ chips, selected, onSelect }: { chips: { id: string; label: string }[]; selected: string; onSelect: (id: string) => void })`; renders `<div role="radiogroup" aria-label="Filters">` containing `<button role="radio" aria-checked={c.id === active} onClick={() => onSelect(c.id)} className="min-h-[44px] …">` per chip. The `active` value uses `selected !== undefined ? selected : internal` (NOT `??`) so empty-string `selected=""` does not collapse to internal.
- [x] `components/client/AnalyticsBeacon.tsx` — CREATE: `"use client"`; `import Script from 'next/script'`; renders `<Script src="https://plausible.io/js/script.js" data-domain="sanjit.dev" strategy="lazyOnload" />`; exports typed event-name constants (`export const ANALYTICS_EVENTS = { FORWARD_BUTTON_CLICK: 'forward_button_click', … } as const`).
- [x] `components/client/ErrorBeacon.tsx` — CREATE: `"use client"`; `import Script from 'next/script'`; renders `<Script id="sentry-stub" strategy="lazyOnload">{/* Sentry.init deferred */}</Script>`; no-op for 1-6 (real Sentry wiring is later).
- [x] `app/__preview/filter-chip-group/page.tsx` — CREATE: server component (no `"use client"`); imports + renders `<FilterChipGroup chips={[{id:'all',label:'All'},{id:'design',label:'Design'},{id:'code',label:'Code'}]} selected="all" onSelect={() => {}} />` inside `<main id="main">`.
- [x] `app/__preview/layer-row-hover/page.tsx` — CREATE: server component; renders a 4-row `<table>` with `<LayerRowHover layer={i} onHoverChange={…}>` per row.
- [x] `sprint-status.yaml` — UPDATE 1-6 status `backlog → in-progress` at task start; `→ review` at step-05.

**Acceptance Criteria:**

- Given `components/client/`, when listing files, then exactly 7 `.tsx` files exist with these names verbatim: `SignatureCanvas.tsx`, `CommandPalette.tsx`, `MagneticCTA.tsx`, `LayerRowHover.tsx`, `FilterChipGroup.tsx`, `AnalyticsBeacon.tsx`, `ErrorBeacon.tsx`. (The 3 deferred stubs `ScrollProgress.tsx`, `SkipToContent.tsx`, `NavCurrent.tsx` MUST NOT exist yet.)
- Given any of the 7 shipped files in `components/client/`, when reading, then line 1 is `"use client";` (before any import).
- Given `lib/canvas-modes.ts`, when reading, then `CANVAS_MODES` is a `readonly` tuple of 9 strings in the order: `dual-ring`, `filter-graph`, `section-progress`, `timeline`, `decision-graph`, `experiment-graph`, `activity-feed`, `layered-architecture`, `condensed-4-node-status`.
- Given `<SignatureCanvas mode={…} />`, when reading, then the component imports `CanvasMode` + `CANVAS_MODE_ACCENT` from `lib/canvas-modes.ts`, uses an exhaustive switch over the 9 modes (TS `never` default), reads stroke color via `CANVAS_MODE_ACCENT[mode]` (no inline `var(--accent-…)` literals in the JSX); the SVG element carries `aria-hidden="true"` and `style={{ pointerEvents: 'none' }}`; the wrapper has Tailwind class `hidden xl:block` (hidden below `xl`).
- Given `<MagneticCTA>`, when reading, then it gates `pointermove` translation on `matchMedia('(pointer: fine)') && !matchMedia('(prefers-reduced-motion: reduce)')`; the static button fallback renders the same label and remains focusable.
- Given `<CommandPalette>`, when reading, then the dialog has `role="dialog"` + `aria-modal="true"` + `aria-labelledby="cmdk-title"`; the result list has `role="listbox"` + `aria-live="polite"` + `aria-relevant="additions"`; the items have `role="option"` + `aria-selected`.
- Given `<AnalyticsBeacon>`, when reading, then it uses `next/script` with `strategy="lazyOnload"` pointing at `https://plausible.io/js/script.js` and `data-domain="sanjit.dev"`.
- Given `<ErrorBeacon>`, when reading, then it uses `next/script` with `strategy="lazyOnload"` (Sentry stub; real wiring later).
- Given `<FilterChipGroup>` rendered in `app/__preview/filter-chip-group/page.tsx`, when loading `/__preview/filter-chip-group` in the browser, then the 3 sample chips render with `role="radio"` and `aria-checked="true"` on the selected chip inside a `<div role="radiogroup" aria-label="Filters">`, and a 44px min-height touch target.
- Given `<LayerRowHover>` rendered in `app/__preview/layer-row-hover/page.tsx`, when loading `/__preview/layer-row-hover` in the browser, then 4 rows render and hovering row N fires `onHoverChange(N, true)`.
- Given `pnpm build`, when running, then exit 0 and the 7 components compile (each as its own client bundle chunk).
- Given `pnpm audit:tokens`, when running, then exit 0 — none of the 7 components introduce inline hex outside the closed AD-18 set (the audit's `components/**/*.tsx` glob is exercised for the first time).
- Given `git diff 79a5f39..HEAD -- components/ lib/`, when inspecting, then 7 new files under `components/client/` + 1 new file `lib/canvas-modes.ts` + 2 new preview routes.

## Spec Change Log

<!-- Append-only. Entries appear below in chronological order. -->

### 2026-09-24-1 (bad_spec loopback, review_loop_iteration 1)

**Triggering findings (4 from step-04 reviewer subagents):**
1. **Adversarial A1** — Spec line 103 says `idle sigFlow <animate> ... (CSS animation)`, but `<animate>` is an SMIL element, not CSS. Implementer correctly used SMIL, but the spec text is internally inconsistent (the parenthetical "(CSS animation)" contradicts the `<animate>` element being prescribed).
2. **Adversarial A2** — Spec AC #8 prescribes `aria-pressed` on `<FilterChipGroup>` chips. For single-select widgets, the correct ARIA pattern is `role="radiogroup"` on the wrapper + `role="radio"` + `aria-checked` on each item. `aria-pressed` is the toggle-button pattern and is semantically wrong for one-of-N selection. Downstream consumers (E3) will inherit the misuse unless corrected.
3. **Adversarial A4** — Spec says "do NOT introduce a second design-token mirror" but `lib/canvas-modes.ts` `CANVAS_MODE_ACCENT` is a mode→CSS-var-string table (a second token mirror). The spec also said `<SignatureCanvas>` "imports `ACCENT`/`ACCENT_2`/`ACCENT_3`/`LIVE` from `lib/design-tokens.ts` (1-5)", but the implementer hardcoded `var(--accent)` literals inline in 9 SVG variants rather than reading back from `CANVAS_MODE_ACCENT`. Drift risk between the two representations.
4. **Adversarial A3 (rejected at triage)** — Reviewer flagged `aria-live="polite"` + `aria-relevant="additions"` on the listbox as decorative since 1-6 ships no live updates. **Triage note:** the spec is forward-looking for 1-7/E4 consumers that WILL filter items live. The attribute is correct for the eventual consumer; reject the finding as misreading future intent.

**What was amended (non-frozen sections):**
- **Spec line 103 (in `## Tasks & Acceptance` execution list, `<SignatureCanvas>` CREATE):** Replace `(CSS animation)` parenthetical with `(SMIL animation; `<animate>` is SMIL, not CSS — `prefers-reduced-motion` does NOT affect SMIL, so the gate manipulates the SMIL `dur` attribute imperatively)`.
- **Spec AC #8 + `<FilterChipGroup>` CREATE line (in `## Tasks & Acceptance`):** Replace `aria-pressed` with the radiogroup pattern — `<div role="radiogroup" aria-label="Filters">` containing `<button role="radio" aria-checked={c.id === active}>` per chip. Update the verbatim closed-set AC wording accordingly.
- **Spec "Always" bullet 9 (FilterChipGroup) + Acceptance Criterion:** Replace "renders `<button aria-pressed={selected}>` per chip" with "renders `<div role="radiogroup" aria-label="Filters">` containing `<button role="radio" aria-checked={c.id === active}>` per chip".
- **Spec "Always" bullet 5 (SignatureCanvas reuse rule):** Clarify that `<SignatureCanvas>` MUST read `CANVAS_MODE_ACCENT[mode]` from `lib/canvas-modes.ts` rather than hardcoding `var(--accent-…)` literals. The 9 SVG variants use a `stroke={ACCENT_MAP[mode]}` lookup; this enforces single-source-of-truth for the mode→color mapping.

**Known-bad state the amendment avoids:**
- A1: A future contributor re-reading the spec would believe the spec mandates CSS animation; on later attempting to swap SMIL for CSS keyframes, they'd hit SMIL-specific behavior (browser support, compositor quirks) that the spec didn't prepare them for.
- A2: Without amendment, E3 would mount `<FilterChipGroup>` with `aria-pressed`-on-single-select, leaving a real ARIA semantic error baked into a published route. Screen-reader users would announce "1 of N pressed" instead of "1 of N selected" — a UX lie.
- A4: Without amendment, two parallel `mode→color` mappings (`CANVAS_MODE_ACCENT` table vs inline `var(--accent-3)` literals in the experiment-graph SVG variant) would silently drift — a future contributor editing one without the other breaks visual consistency.

**KEEP instructions (must survive re-derivation):**
- Closed-set invariant: exactly 7 files in `components/client/`, names verbatim: `SignatureCanvas.tsx`, `CommandPalette.tsx`, `MagneticCTA.tsx`, `LayerRowHover.tsx`, `FilterChipGroup.tsx`, `AnalyticsBeacon.tsx`, `ErrorBeacon.tsx`. No 8th without a spine amendment.
- Each file begins with `"use client"` at line 1.
- 9-mode `CANVAS_MODES` tuple order matches `epic-1-context.md:29` exactly: `dual-ring, filter-graph, section-progress, timeline, decision-graph, experiment-graph, activity-feed, layered-architecture, condensed-4-node-status`.
- `<SignatureCanvas>` exhaustive switch with TS `never` default → compile-time drift detection.
- Motion-gate contracts: `<SignatureCanvas>`, `<MagneticCTA>`, `<CommandPalette>`, `<LayerRowHover>` each gate on `matchMedia('(prefers-reduced-motion: reduce)')`; collapse to 0.01ms / static fallback under matched condition.
- `<MagneticCTA>` pointer-fine gate: `matchMedia('(pointer: fine)') && !matchMedia('(prefers-reduced-motion: reduce)')` registers the `pointermove` listener; otherwise static button fallback.
- `<AnalyticsBeacon>` Plausible `data-domain="sanjit.dev"` + `strategy="lazyOnload"` + 4 typed event exports (`forward_button_click`, `recruiter_mode_toggle`, `pattern_deep_link_visit`, `case_study_forward_open`).
- `<ErrorBeacon>` Sentry-stub `<Script>` with `strategy="lazyOnload"`.
- `<FilterChipGroup>` ≥44px min-height touch target.
- Preview harnesses at `app/__preview/filter-chip-group/page.tsx` and `app/__preview/layer-row-hover/page.tsx` — server components, no `"use client"` at top.
- Co-source `lib/canvas-modes.ts` 9-mode tuple + `CanvasMode` type + `CANVAS_MODE_ROUTES` + `CANVAS_MODE_ACCENT` (now consumed by `<SignatureCanvas>` for stroke color, not just JSDoc decoration).
- `<CommandPalette>` focus trap + Escape close + `role="dialog"` + `aria-modal` + `aria-labelledby="cmdk-title"` + listbox ARIA pattern.
- Reuse `lib/design-tokens.ts` (1-5); no new devDeps; no user-facing mounts in 1-6.

**Loopback plan:**
1. Apply spec amendments (above).
2. Revert code files affected by A2 and A4: `<FilterChipGroup.tsx>` (radiogroup pattern), `<SignatureCanvas.tsx>` (consume `CANVAS_MODE_ACCENT`).
3. Re-run step-03 with a patch-bundled dispatch: deliver the spec + a patch list (B1–B17 from the review) to the implementation subagent. The subagent produces a re-derived diff that incorporates all 3 spec amendments + all 17 patches in one pass.
4. Re-run step-04 review.

## Design Notes

- **Why 3 simple stubs are deferred, not "just shipped":** Per the elicitation pre-mortem #1, every closed component must be tested against preview environments "even those not yet mounted on a user-facing page". But the closed-set invariant (10 files under `components/client/`) does not require all 10 in 1-6 — it requires that the closed set be honored. The 3 stubs (`ScrollProgress`, `SkipToContent`, `NavCurrent`) have minimal contracts but add ~55 lines of spec each. Splitting them to a follow-up story (`1-6b-stub-components`) preserves the single goal of "establish the closed-set invariant for the 7 detailed components" without inflating the spec past the 1,600-token context-rot threshold.
- **Why preview harnesses are routes, not test files:** The pre-mortem identified that E3 / E5 will mount `<FilterChipGroup>` and `<LayerRowHover>` early. Having them as preview routes under `app/__preview/` lets the CI run pa11y-ci + Lighthouse against them in 1-6 (before any user-facing consumer exists), so a regression in their motion-gate or a11y contract is caught before E3 inherits it. The `__` prefix (double underscore) avoids Next.js's `_components` private-folder convention.
- **Why `<SignatureCanvas>` uses inline SVG per mode, not a parameterized path:** The 9 modes have visually-distinct shapes (rings, graphs, timelines). Parameterizing one shape across 9 modes would either require a mini-DSL or produce mediocre visuals. Inline SVG per mode keeps each variant ~5-15 lines and visually true to the UX-DR.
- **Why `<MagneticCTA>` uses inline `style.transform` not Tailwind:** The translation is dynamic per `pointermove` event; recomputing Tailwind classes per frame is wasteful. Inline `style` is the React idiomatic pattern for per-frame style updates.

## Verification

**Commands:**

- `ls components/client/` -- exactly 7 `.tsx` files matching the closed-shipped set.
- `for f in components/client/*.tsx; do head -1 "$f"; done` -- each line is `"use client";`.
- `npx tsx -e "import {CANVAS_MODES} from './lib/canvas-modes'; console.log(CANVAS_MODES.length, CANVAS_MODES.join(','))"` -- `9` + the 9-mode comma-joined string.
- `grep -l "use client" components/client/*.tsx | wc -l` -- `7`.
- `pnpm audit:tokens` -- exit 0 (the audit's `components/**/*.tsx` glob walks the new components; any inline hex would fail).
- `pnpm build` -- exit 0; 7 client bundles emitted.

**Manual checks:**

- Open `lib/canvas-modes.ts` — 9 mode strings in order, JSDoc route mapping present.
- Open `components/client/SignatureCanvas.tsx` — exhaustive switch over `CANVAS_MODES` (TS `never` default); stroke color for each variant reads `CANVAS_MODE_ACCENT[mode]` (no inline `var(--accent-…)` literals); `aria-hidden="true"`; `pointer-events: none`; `hidden xl:block` class.
- Open `components/client/MagneticCTA.tsx` — `matchMedia` gate visible in source.
- Open `components/client/CommandPalette.tsx` — `role="dialog"` + `aria-modal="true"` + `aria-labelledby="cmdk-title"` on the wrapper; `role="listbox"` + `aria-live` on the `<ul>`; `role="option"` + `aria-selected` on each `<li>`.
- Open `components/client/AnalyticsBeacon.tsx` — `next/script` with `strategy="lazyOnload"` + `data-domain="sanjit.dev"`.
- Open `components/client/ErrorBeacon.tsx` — `next/script` with `strategy="lazyOnload"`.
- Open `app/__preview/filter-chip-group/page.tsx` — server component (no `"use client"` at top); renders `<FilterChipGroup>` with 3 chips inside `<main id="main">`.
- Open `app/__preview/layer-row-hover/page.tsx` — server component; renders a 4-row table with `<LayerRowHover>` per row.

## Suggested Review Order

**Foundational co-source**

- Single source of truth for the 9 closed canvas modes; locks the order for downstream epics.
  [`canvas-modes.ts:23`](../../lib/canvas-modes.ts#L23)

- The mode→accent table that `<SignatureCanvas>` now consumes — single color map, no inline literals.
  [`canvas-modes.ts:42`](../../lib/canvas-modes.ts#L42)

**Architectural flagship**

- 9-mode exhaustive switch; reads stroke color from `CANVAS_MODE_ACCENT[mode]`, never inline literals.
  [`SignatureCanvas.tsx:33`](../../components/client/SignatureCanvas.tsx#L33)

- SMIL `<animate>` per mode + reduced-motion gate swapping `dur` between `2s` and `0.01ms`.
  [`SignatureCanvas.tsx:62`](../../components/client/SignatureCanvas.tsx#L62)

**Behavioral clients (a11y + motion contracts)**

- Dialog/listbox ARIA + focus trap + reduced-motion transition; the structural shell for 1-7/E4.
  [`CommandPalette.tsx:31`](../../components/client/CommandPalette.tsx#L31)

- Pointer-fine gate with reactive MQL listeners; adds/removes listeners on runtime matchMedia changes.
  [`MagneticCTA.tsx:30`](../../components/client/MagneticCTA.tsx#L30)

- Radiogroup pattern (not toggle-button `aria-pressed`); controlled/uncontrolled hybrid with `!== undefined` check.
  [`FilterChipGroup.tsx:22`](../../components/client/FilterChipGroup.tsx#L22)

- `<tr>` hover/focus callback; reduced-motion attribute set but visual transition left to consumer CSS.
  [`LayerRowHover.tsx:26`](../../components/client/LayerRowHover.tsx#L26)

**Beacons (deferred loading)**

- Plausible `next/script` with typed event constants + `track()` helper omitting the props arg when empty.
  [`AnalyticsBeacon.tsx:16`](../../components/client/AnalyticsBeacon.tsx#L16)

- Sentry stub `next/script` with `dangerouslySetInnerHTML` to ensure the `<script>` tag actually emits.
  [`ErrorBeacon.tsx:12`](../../components/client/ErrorBeacon.tsx#L12)

**Preview harnesses (peripheral)**

- Server component; 3 chips inside `<main id="main">`; `window.__lastFilterId` for CI callback assertions.
  [`filter-chip-group/page.tsx:18`](../../app/__preview/filter-chip-group/page.tsx#L18)

- Server component; 4-row `<table>` with `scope="col"` headers + `metadata.robots = noindex` for production.
  [`layer-row-hover/page.tsx:17`](../../app/__preview/layer-row-hover/page.tsx#L17)
