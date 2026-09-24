---
title: 'Set up app/globals.css with the closed 57-token @theme block (AD-18)'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 2
baseline_commit: '6752b3778f31df506ffcf16b080123c38cfacf84'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/package.json'
  - '{project-root}/_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/DESIGN.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every subsequent epic compiles against the closed design-token set (AD-18), but those 57 tokens live only in planning docs today. `app/globals.css` is a 2-line `@import "tailwindcss";` placeholder from story 1-1, with no `@theme` block. Any consumer story (1-6, 1-7, 1-8, 1-9, 1-11) that reaches for `var(--accent)` or `font-display` will fail at runtime with an undefined custom property; any builder who reaches for inline hex or `clamp(…)` instead will drift the closed set without a CI-asserted catch.

**Approach:** Codify AD-18's 57-token `@theme` block in `app/globals.css` — the 21 color names + values verbatim from DESIGN.md, the 13 typography roles, the 9 spacing steps, the 5 shapes, the 4 shadows, the 4 gradients. Mirror the 21 colors as a typed `DESIGN_TOKENS` array in `lib/design-tokens.ts` (AD-17 + AD-18 co-source) so `lib/canvas-modes.ts` (which 1-6 will create) can import the closed list. Add a grep-based CI step (`scripts/audit-tokens.mjs`) that fails the build if any `.tsx` / `.mdx` / `.ts` outside `lib/design-tokens.ts` references a hex code outside the closed token set, matching the existing audit-script pattern from 1-4 (shared module + `audit:*` package script). The step slots into `ci.yml` after `pnpm audit:routes`. Breakpoint media queries (AD-19) + site-wide `prefers-reduced-motion` block + `:focus-visible` rule (AD-20) are carved off to a follow-up story (see `deferred-work.md` 2026-09-24-1) to keep this spec in the 900-1300 token range; this story ships the closed token set only.

## Boundaries & Constraints

**Always:**
- `@theme` block contains exactly the 57 closed tokens (21 colors + 13 typography + 9 spacing + 5 shapes + 4 shadows + 4 gradients) per `ARCHITECTURE-SPINE.md` AD-18 (lines 263-268). Names verbatim, kebab-case; values verbatim from `DESIGN.md` (colors 309-329, gradients 343-346, typography 354-367, spacing 396-402, shadows 427-430, shapes 438-443).
- Tailwind v4 CSS-first — no `tailwind.config.ts` (AGENTS.md pitfall #7 + 1-1 AC); no extra `postcss.config.js` beyond `@tailwindcss/postcss`.
- `app/globals.css` after this story contains ONLY: `@import "tailwindcss";` + the `@theme { ... }` block. No `@media`, no `prefers-reduced-motion`, no `:focus-visible` (deferred to follow-up per `deferred-work.md` 2026-09-24-1).
- `lib/design-tokens.ts` exports `DESIGN_TOKENS` as a `readonly` array of the 21 closed color names + named `ACCENT` / `ACCENT_2` / `ACCENT_3` / `LIVE` constants of `var(--...)` form. Today the only consumer is `lib/canvas-modes.ts` (1-6).
- `scripts/audit-tokens.mjs` (~50-line Node ESM; hand-rolled recursive glob via `node:fs.readdirSync({ recursive: true })` since Node 20.9.0 has no native glob): reads `AUDIT_TOKEN_GLOBS` / `ALLOWED_HEX` / `ALLOWED_RGBA` from `scripts/audit-routes.shared.mjs`; greps each file for `#[0-9A-Fa-f]{6,8}` / `rgb?\([^)]+\)`; exit 1 with `BANNED_HEX: <file>:<line>  <value>` on any value NOT in the allowlist.
- `scripts/audit-routes.shared.mjs` gains three new exports (`AUDIT_TOKEN_GLOBS`, `ALLOWED_HEX`, `ALLOWED_RGBA`) at the bottom. Existing `AUDIT_ROUTES` unchanged — single source of truth (1-4 KEEP instruction).
- `package.json` gains one script: `"audit:tokens": "node scripts/audit-tokens.mjs"`. No new devDeps.
- `.github/workflows/ci.yml` gains ONE step in `gate` job after `pnpm audit:routes`: `run: pnpm audit:tokens`. No new workflow file (5b.3 amendment holds); sequential gate order preserved.
- `experimental.sri: { algorithm: 'sha256' }` from 1-2 hashes the `<link rel="stylesheet">` for `globals.css` — no manual nonce, no `'unsafe-inline'`. 1-5 does NOT touch `next.config.mjs`.

**Ask First:**
- Adding any token to the closed set, or changing a token value (e.g., `--accent` → different violet) — spine amendment (AD-18 closes the list; value change re-triggers the `--bg`/`--fg` contrast verification per AD-18 amendment trigger).
- Touching `next.config.mjs`, `proxy.ts`, `tsconfig.json`, `eslint.config.mjs` — owned by earlier stories.
- Replacing `audit:tokens` grep with an ESLint rule — same outcome, more boilerplate; defer.

**Never:**
- Adding `tailwind.config.ts` (AGENTS.md pitfall #7 + 1-1 AC).
- Adding any color/typography/spacing/shape/shadow/gradient outside the closed set (AD-16 review failure).
- Adding `'unsafe-inline'`, nonce, or `unsafe-eval` (CSP owned by 1-2).
- Adding breakpoint media queries, `prefers-reduced-motion`, or `:focus-visible` in this story (deferred).
- Modifying `app/page.tsx`, `app/layout.tsx`, or any route component (consumer stories wire consumption).
- Adding `playwright`, `vitest`, or `chromium` to devDeps (1-4 boundary).
- Splitting `@theme` into a separate `app/theme.css` (single-file spine convention).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_BUILD | `pnpm build` after this story | Exit 0; `app/globals.css` emitted as hashed `<link rel="stylesheet">` per 1-2's SRI; Tailwind v4 utility classes (`bg-bg`, `text-fg-3`, `font-display`) resolve to @theme values. | N/A |
| HAPPY_PATH_AUDIT | Local `pnpm audit:tokens` | Exit 0 (no `.tsx`/`.mdx`/`.ts` outside `lib/design-tokens.ts` carries inline hex outside the allowlist). | N/A |
| TOKEN_LINT_REGRESSION | Future `style={{ color: '#ABCDEF' }}` outside `lib/design-tokens.ts` | `audit-tokens.mjs` prints `BANNED_HEX: <file>:<line>  #ABCDEF` and exits 1. | `ci.yml` step fails; PR blocked. |
| TOKEN_VALUE_DRIFT | Future `--accent` change in `app/globals.css` (e.g., `#A78BFA` → `#000000`) | `audit:tokens` does NOT catch (greps inline hex, not @theme values). | Documented gap; spine amendment + human review per AD-16. |

</frozen-after-approval>

## Code Map

Files this story creates:

- `app/globals.css` — REPLACES the 1-1 placeholder with `@import "tailwindcss";` + `@theme { /* 57 tokens */ }`. ~80-100 lines.
- `lib/design-tokens.ts` — typed mirror of the 21 closed colors + named `ACCENT`/`ACCENT_2`/`ACCENT_3`/`LIVE` for `lib/canvas-modes.ts` (1-6). ~40 lines.
- `scripts/audit-tokens.mjs` — Node ESM; walks `AUDIT_TOKEN_GLOBS`, greps `#XXXXXX` / `rgba?(...)`, exits 1 on values NOT in allowlist. ~50 lines.
- This spec file.

Files this story modifies:

- `scripts/audit-routes.shared.mjs` — appends 3 new exports (`AUDIT_TOKEN_GLOBS`, `ALLOWED_HEX`, `ALLOWED_RGBA`); existing `AUDIT_ROUTES` unchanged.
- `package.json` — adds `"audit:tokens": "node scripts/audit-tokens.mjs"` script. No new devDeps.
- `.github/workflows/ci.yml` — adds one step in `gate` job after `pnpm audit:routes`: `run: pnpm audit:tokens`. No new workflow file.

Reuse / read-only anchors (no edits required):

- `ARCHITECTURE-SPINE.md` AD-18 (lines 263-268) — verbatim 57-token name list. Values from `DESIGN.md` (colors 309-329, gradients 343-346, typography 354-367, spacing 396-402, shadows 427-430, shapes 438-443).
- `AGENTS.md` pitfall #7 (Tailwind v4 CSS-first) + invariant #14 (closed tokens).
- `epic-1-context.md` lines 30, 33 — closed-token enumeration + "1.5 must precede 1.6, 1.7, 1.8, 1.9, 1.11" dependency.
- `scripts/audit-routes.shared.mjs` — 1-4 single-source-of-truth module (extend, don't fork).
- `.github/workflows/ci.yml` — 1-4's 5-step gate (insert one step; no new workflow file).
- `spec-1-2-...md` Spec Change Log — `experimental.sri: { algorithm: 'sha256' }` from 1-2 hashes the `<link>` carrying `globals.css` output.
- `deferred-work.md` (2026-09-24 entry) — AD-19/AD-20 media queries deferred.

## Tasks & Acceptance

**Execution:**

- [x] `app/globals.css` -- REPLACE the 2-line placeholder with `@import "tailwindcss";` + `@theme { /* 57 tokens verbatim: 21 colors (DESIGN.md 309-329), 13 typography (354-367), 9 spacing (396-402), 5 shapes (438-443), 4 shadows (427-430), 4 gradients (343-346) */ }`.
- [x] `lib/design-tokens.ts` -- CREATE with `export const DESIGN_TOKENS = ['--bg','--bg-2','--bg-3','--glass','--glass-strong','--fg','--fg-2','--fg-3','--fg-4','--border','--border-strong','--border-accent','--accent','--accent-2','--accent-3','--accent-glow','--live','--live-glow','--warn','--on-accent','--on-live'] as const;` + `export type DesignToken = typeof DESIGN_TOKENS[number];` + `ACCENT` / `ACCENT_2` / `ACCENT_3` / `LIVE` as `const` strings of `var(--...)` form.
- [x] `scripts/audit-routes.shared.mjs` -- ADD at the bottom (do NOT modify `AUDIT_ROUTES`): `AUDIT_TOKEN_GLOBS = ['app/**/*.tsx','app/**/*.mdx','components/**/*.tsx','lib/**/*.ts','lib/**/*.tsx']` + `ALLOWED_HEX = ['#06070B','#0B0D14','#10131C','#A78BFA','#67E8F9','#F472B6','#FAFAFA','#D4D4D8','#8B8E97','#5C5F68','#34D399','#FCA5A5']` (the 12 verbatim color hexes) + `ALLOWED_RGBA = ['rgba(255,255,255,0.03)','rgba(255,255,255,0.06)','rgba(255,255,255,0.12)','rgba(167,139,250,0.30)','rgba(167,139,250,0.25)','rgba(52,211,153,0.20)','rgba(167,139,250,0.40)']`.
- [x] `scripts/audit-tokens.mjs` -- CREATE per the Always-rule spec above (imports the three new exports; hand-rolled recursive glob via `node:fs.readdirSync({ recursive: true })`; **walks `lib/design-tokens.ts` so a hex drift inside the co-source is caught (the closed `ALLOWED_HEX` / `ALLOWED_RGBA` allowlist is the exemption — not a per-file skip, since `lib/design-tokens.ts` references colors only by `var(--...)` form)**: greps `#XXXXXX` / `#XXXXXXXX` / `rgba?(...)`; prints `BANNED_HEX:` and exits 1 on a match).
- [x] `package.json` -- ADD one script: `"audit:tokens": "node scripts/audit-tokens.mjs"`. No new devDeps.
- [x] `.github/workflows/ci.yml` -- ADD one step in the `gate` job AFTER `pnpm audit:routes`: `run: pnpm audit:tokens`. No new workflow file.
- [x] `.gitignore` -- ADD `!lib/` + `!lib/**/*` allow-list exceptions to override the latent Python-template `lib/` ignore (surfaced incidentally by this story; deferred-work entry appended).
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- APPEND 3 entries (gitignore fix, TOKEN_VALUE_DRIFT gap, TOKEN_NAME_DRIFT gap) per step-04 review iteration 2.

**Acceptance Criteria:**

- Given `app/globals.css`, when reading, then it begins with `@import "tailwindcss";` AND contains exactly one `@theme { ... }` block with 57 token declarations (21 colors + 13 typography + 9 spacing + 5 shapes + 4 shadows + 4 gradients) AND no `@media` block or `:focus-visible` rule (deferred).
- Given `app/globals.css`, when reading, then `--accent` = `#A78BFA`, `--accent-2` = `#67E8F9`, `--accent-3` = `#F472B6`, `--live` = `#34D399`, `--warn` = `#FCA5A5`, `--bg` = `#06070B`, `--fg` = `#FAFAFA` (verbatim from DESIGN.md).
- Given `lib/design-tokens.ts`, when reading, then `DESIGN_TOKENS` is a `readonly` array of 21 strings matching the @theme color names, AND `ACCENT`/`ACCENT_2`/`ACCENT_3`/`LIVE` are exported as `const` strings of `var(--...)` form, AND no literal hex values appear.
- Given `scripts/audit-routes.shared.mjs`, when reading, then it exports `AUDIT_TOKEN_GLOBS` (5), `ALLOWED_HEX` (12), `ALLOWED_RGBA` (7), AND the existing `AUDIT_ROUTES` is unchanged.
- Given `scripts/audit-tokens.mjs`, when reading, then it imports the 3 new exports from `./audit-routes.shared.mjs` (single source of truth) AND walks `lib/design-tokens.ts` (the closed `ALLOWED_HEX` allowlist is the exemption — no per-file skip; this co-source must be linted against the closed token set so a hex drift in `lib/design-tokens.ts` is caught at CI time).
- Given a future `.tsx` file containing `style={{ color: '#ABCDEF' }}`, when running `pnpm audit:tokens`, then the script prints `BANNED_HEX: <file>:<line>  #ABCDEF` and exits 1 (current repo state: exits 0).
- Given `package.json`, when inspecting, then `scripts` includes `audit:tokens` AND no new devDeps.
- Given `.github/workflows/ci.yml`, when inspecting, then the `gate` job has `pnpm audit:tokens` AFTER `pnpm audit:routes`, AND no new workflow file.
- Given `pnpm build`, when running, then exit 0 AND `<link rel="stylesheet">` for `globals.css` carries `integrity="sha256-..."` (per 1-2's SRI mechanism).
- Given `grep -nE "'unsafe-inline'|nonce-|unsafe-eval" app/globals.css`, when running, then no matches (CSP boundary holds).
- Given `ls .github/workflows/`, when running, then exactly `ci.yml` + `content-audit.yml`.

## Spec Change Log

<!-- Append-only. Entries appear below in chronological order. -->

### 2026-09-24-1 — bad_spec loopback (review iteration 1 → 2)

- **Triggering findings** (from step-04 review, classified as `bad_spec`):
  - **A1 (AC #5 vs Design Notes contradiction):** AC #5 said `audit-tokens.mjs` "skips `lib/design-tokens.ts` in its walk" while the Design Notes paragraph (line 123 of the prior spec version) said the file is walked and "the allowlist itself is the exemption". The implementation matched Design Notes. Reviewer flagged the contradiction.
  - **A14 (Verification command matches the file's own prose):** `grep -cE "@media|:focus-visible" app/globals.css` was specified to return `0`, but the file's own header comment references those strings (justifying the deferral). The grep was overly broad.
- **What was amended (non-frozen sections):**
  - **Execution Task (the audit script line, prior spec line 95):** replaced "skips `lib/design-tokens.ts`" with explicit "walks `lib/design-tokens.ts` so a hex drift inside the co-source is caught (the closed `ALLOWED_HEX` / `ALLOWED_RGBA` allowlist is the exemption — not a per-file skip, since `lib/design-tokens.ts` references colors only by `var(--...)` form)".
  - **AC #5 (prior spec line 105):** rewritten to "walks `lib/design-tokens.ts` (the closed `ALLOWED_HEX` allowlist is the exemption — no per-file skip; this co-source must be linted against the closed token set so a hex drift in `lib/design-tokens.ts` is caught at CI time)".
  - **Verification command for AC #1 (prior spec line 134):** tightened `grep -cE "@media|:focus-visible" app/globals.css` → `grep -cE "@media[[:space:]]*\(|:focus-visible[[:space:]]*\{" app/globals.css` (construct-only pattern; prose mentions in comments do not count).
- **Known-bad state avoided:** had the loopback not happened, the spec would have shipped with two contradicting passages (AC says skip, Design Notes says walk) AND a Verification command that fails on its own prose. The KEEP block below records what must survive re-derivation so the next implementer does not "fix" the working code to match the broken AC text.
- **KEEP instructions** (from `bad_spec` procedure — what worked well and must survive re-derivation):
  - `app/globals.css` `@theme` block shape (21 colors + 13 typography roles × 4 + 9 spacing + 5 shapes + 4 shadows + 4 gradients; values verbatim from DESIGN.md). Single `@theme` block; no `@media` block; no `:focus-visible` rule.
  - `lib/design-tokens.ts` co-source: `DESIGN_TOKENS` array of 21 entries (`as const`), `DesignToken` type, 4 named `var(--...)` constant exports (`ACCENT`, `ACCENT_2`, `ACCENT_3`, `LIVE`). No literal hex values inside the file.
  - `scripts/audit-routes.shared.mjs` extension: `AUDIT_TOKEN_GLOBS` (5 entries: `app/**/*.tsx`, `app/**/*.mdx`, `components/**/*.tsx`, `lib/**/*.ts`, `lib/**/*.tsx`), `ALLOWED_HEX` (12 verbatim hex values from DESIGN.md), `ALLOWED_RGBA` (7 verbatim rgba values). Existing `AUDIT_ROUTES` unchanged. Single source of truth pattern preserved (1-4 KEEP).
  - `scripts/audit-tokens.mjs` design: grep-based; hand-rolled recursive glob; `HEX_RE = /#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?\b/g`; `RGB_RE = /rgba?\([^)]+\)/g`; case-insensitive `Set` comparison for hex; `replace(/\s+/g, '')` whitespace normalization for rgba (DOES NOT normalize `0.30` → `0.3` — that's a separate concern deferred); `EXCLUDED_FILES` initialized empty (allowlist IS the exemption); `BANNED_HEX: <file>:<line>  <value>` stderr format on match; exit 1 on violation, exit 0 on clean. Walks `lib/design-tokens.ts` (per the amended AC #5).
  - `package.json`: `"audit:tokens": "node scripts/audit-tokens.mjs"` script. No new devDeps.
  - `.github/workflows/ci.yml`: one new step in the `gate` job AFTER `pnpm audit:routes`, BEFORE `pnpm test:a11y`: `run: pnpm audit:tokens`. Sequential gate order preserved (1-4 Spec Change Log).
  - `.gitignore`: add `!lib/` + `!lib/**/*` allow-list exceptions to override the latent Python-template `lib/` ignore rule (this fix is a surfaced-and-found item; it must also be appended to `deferred-work.md` as `source_spec: spec-1-5-...md`).
  - Verification commands must all pass: install/build/audit:tokens/grep `^\s*--[a-z]` (≥57)/grep unsafe-inline (0)/grep construct-only `@media`/`focus-visible` (0)/`npx tsx` DESIGN_TOKENS.length (21)/ls `.github/workflows/` (ci.yml + content-audit.yml).
- **Other deferred items captured during this loopback** (not part of the spec amendments; routed to `defer` per step-04): see `deferred-work.md` entries appended under `source_spec: spec-1-5-...md` for (a) the latent Python-template `.gitignore` `lib/` ignore surfaced and fixed, (b) `TOKEN_VALUE_DRIFT` I/O matrix gap (documented gap per spec; close via a future spine amendment AD-16 surrogate), (c) the TOKEN_NAME_DRIFT gap between `lib/design-tokens.ts` and `app/globals.css` (close via future automated length-and-names assertion).

## Design Notes

- **Why `lib/design-tokens.ts` ships colors (not all 57 tokens):** Today's only TS consumer is `<SignatureCanvas>` (1-6), which reads 3 accents + `--live`. Mirroring all 21 colors keeps the co-source complete; typography/spacing/shape/shadow/gradient tokens are pure CSS — no TS consumer today.
- **Why `audit-tokens.mjs` is grep-based:** The AC says "lint rule (or grep-based CI step)". Grep on a closed allowlist is ~50 lines of Node ESM and matches 1-4's audit-script pattern; ESLint would need a custom rule + plugin + `.mdx` parser config.
- **Why `lib/design-tokens.ts` is included in the walk:** It should reference colors by `var(--...)` form. Including it catches a regression where someone adds a 7th accent by mistake. The allowlist itself is the exemption.

## Verification

**Commands:**

- `pnpm install --frozen-lockfile` -- exit 0; `pnpm-lock.yaml` unchanged.
- `pnpm build` -- exit 0; `<link rel="stylesheet">` for `globals.css` carries `integrity="sha256-..."` (1-2 SRI mechanism).
- `pnpm audit:tokens` -- exit 0 today; exit 1 with `BANNED_HEX:` on regression.
- `grep -cE "^\s*--[a-z]" app/globals.css` -- at least 57 matches.
- `grep -nE "'unsafe-inline'|nonce-|unsafe-eval" app/globals.css` -- no matches.
- `grep -cE "@media[[:space:]]*\(|:focus-visible[[:space:]]*\{" app/globals.css` -- `0` (construct-only pattern; prose mentions of `@media` or `:focus-visible` in comments do not count).
- `npx tsx -e "import {DESIGN_TOKENS} from './lib/design-tokens'; console.log(DESIGN_TOKENS.length)"` -- `21`.
- `ls .github/workflows/` -- exactly `ci.yml` + `content-audit.yml`.

**Manual checks:** Open `app/globals.css` (starts with `@import "tailwindcss";`, single `@theme { ... }` block, 95 `--*` declarations across 21 colors + 13 typography roles × 4 + 9 spacing + 5 shapes + 4 shadows + 4 gradients, NO `@media` blocks, NO `:focus-visible` rule). Open `lib/design-tokens.ts` (`DESIGN_TOKENS` has 21 entries; 4 named accents; no literal hex). Open `scripts/audit-tokens.mjs` (imports 3 new exports from `./audit-routes.shared.mjs`; hand-rolled recursive glob; **walks `lib/design-tokens.ts`** — the closed `ALLOWED_HEX` / `ALLOWED_RGBA` allowlist is the exemption; prints `BANNED_HEX:` on match). Open `.github/workflows/ci.yml` (new `pnpm audit:tokens` step AFTER `pnpm audit:routes`, BEFORE `pnpm test:a11y`; sequential gate order preserved). Open `scripts/audit-routes.shared.mjs` (`AUDIT_ROUTES` unchanged; 3 new exports at the bottom).

## Suggested Review Order

**Closed token set — the AD-18 source-of-truth**

- The `@theme` block codifies the 57-token closed set (21 colors + 13 typography + 9 spacing + 5 shapes + 4 shadows + 4 gradients), each `--*` declaration verbatim from DESIGN.md.
  [`globals.css:24`](../../app/globals.css#L24)
- Color section shows the value-deduplication trick (`#06070B` reused by `--bg`, `--on-accent`, `--on-live`) and the rgba-glass/border/glow cluster.
  [`globals.css:26`](../../app/globals.css#L26)
- Typography uses the expanded 4-key form (`--font-display`, `--text-display`, `--font-weight-display`, `--tracking-display`) per the closed list.
  [`globals.css:49`](../../app/globals.css#L49)
- Spacing includes the responsive `vw`-clamp tokens (`--spacing-section-y`, `--spacing-gutter`) that ship before the AD-19 breakpoint layer.
  [`globals.css:122`](../../app/globals.css#L122)
- Shapes are the 5 `--radius-*` tokens including `--radius-pill` (the only non-rem value).
  [`globals.css:126`](../../app/globals.css#L126)
- Shadows + gradients — the 4 shadow tokens (incl. the accent glow pair) and 4 gradient tokens (the 2 CSS-only + 2 var-driven).
  [`globals.css:133`](../../app/globals.css#L133)

**TS co-source for the 21 color names**

- Header doc comments declare the AD-17 + AD-18 co-source invariant and explain why the allowlist (not a per-file skip) is the exemption.
  [`design-tokens.ts:1`](../../lib/design-tokens.ts#L1)
- `DESIGN_TOKENS` `as const` array of the 21 closed names — the runtime contract for downstream consumers.
  [`design-tokens.ts:32`](../../lib/design-tokens.ts#L32)
- `DesignToken` type derived from the array via `typeof … [number]` so it narrows to a string-literal union.
  [`design-tokens.ts:56`](../../lib/design-tokens.ts#L56)
- Four named `var(--…)` accent constants — the high-traffic consumers (1-6's canvas-modes will reach for these).
  [`design-tokens.ts:62`](../../lib/design-tokens.ts#L62)

**Closed allowlist + grep-based lint runner**

- `AUDIT_TOKEN_GLOBS` declares the 5 source-globs the audit walks; existing `AUDIT_ROUTES` is untouched (single-source-of-truth preserved).
  [`audit-routes.shared.mjs:27`](../../scripts/audit-routes.shared.mjs#L27)
- `ALLOWED_HEX` lists the 12 verbatim color hex values from DESIGN.md lines 309-329, deduplicated by value (the audit matches by value, not by name).
  [`audit-routes.shared.mjs:38`](../../scripts/audit-routes.shared.mjs#L38)
- `ALLOWED_RGBA` lists the 7 glass/border/glow rgba values that consumers may reference inline; shadow + gradient rgba stay in `globals.css` only.
  [`audit-routes.shared.mjs:59`](../../scripts/audit-routes.shared.mjs#L59)
- Hand-rolled `globToRegex` — supports `**` (any depth) and `*` (one segment); the file walks `app/`, `components/`, `lib/` recursively.
  [`audit-tokens.mjs:39`](../../scripts/audit-tokens.mjs#L39)
- `HEX_RE` matches 6- or 8-digit hex with a word-boundary guard; `RGB_RE` matches `rgb(...)` / `rgba(...)` via `[^)]+`.
  [`audit-tokens.mjs:82`](../../scripts/audit-tokens.mjs#L82)
- `findLineForOffset` uses regex `m.index` for the line number — patch from the review (was reporting the first occurrence via `content.indexOf(match.value)`).
  [`audit-tokens.mjs:94`](../../scripts/audit-tokens.mjs#L94)
- Missing-prefix warning + read-error log — patches from the review; fail-loud instead of silent-pass.
  [`audit-tokens.mjs:107`](../../scripts/audit-tokens.mjs#L107)

**CI gate integration**

- New `audit:tokens` script entry — no new devDeps; same `node` invoker as the other audit scripts.
  [`package.json:21`](../../package.json#L21)
- The new `pnpm audit:tokens` step slots in AFTER `pnpm audit:routes` and BEFORE `pnpm test:a11y` — sequential gate order preserved per spec-1-4.
  [`ci.yml:63`](../../.github/workflows/ci.yml#L63)

**Permissive `.gitignore` fix (surfaced incidentally)**

- `!lib/` + `!lib/**/*` allow-list re-includes the project's `lib/` directory, overriding the latent Python-template `lib/` ignore rule from the boilerplate.
  [`.gitignore:255`](../../.gitignore#L255)

**Spec change log + deferred-work trail**

- Three deferred-work entries appended — gitignore fix surfaced, `TOKEN_VALUE_DRIFT` I/O matrix gap, `TOKEN_NAME_DRIFT` gap between TS array and `@theme` block.
  [`deferred-work.md:49`](../deferred-work.md#L49)
