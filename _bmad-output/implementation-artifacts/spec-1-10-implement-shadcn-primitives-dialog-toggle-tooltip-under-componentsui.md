---
title: 'Implement shadcn primitives (`Dialog`, `Toggle`, `Tooltip`) under `components/ui/`'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 2
baseline_commit: '8418056b457454bf5b5c6546e2b43a9712a6c9dc' # 1-9 HEAD (story 1-9 commit) at step-03 start of 1-10
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-6-implement-the-10-closed-client-components-ad-13.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AD-15 closes the interactive-primitive surface at exactly three shadcn components — `Dialog`, `Toggle`, `Tooltip` — under `components/ui/`. Downstream epics (E3 mounts `<Tooltip>` on Patterns-cited deep-links, E4 mounts `<Dialog>` on the forward-modal flow, both use `<Toggle>` for filter chips in non-radiogroup contexts) compile against that closed set. Today `components/ui/` does not exist, and no shadcn runtime deps (`@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`) are installed. If E1 ships with a hole in AD-15, E3/E4 hit it as a regression — they will reach for the shadcn recipe and either pull in unscoped primitives or hand-roll focus traps (per spec-1-6 closed-set discipline).

**Approach:** Stand up `components/ui/` with exactly three Radix shadcn primitives (`dialog.tsx`, `toggle.tsx`, `tooltip.tsx`) and ship `lib/utils.ts` (the canonical shadcn location for `cn()`, per the `components.json` `aliases.utils: "@/lib/utils"` declaration). Add the six minimal runtime deps to `package.json` (`@radix-ui/react-dialog`, `@radix-ui/react-toggle`, `@radix-ui/react-tooltip`, `class-variance-authority`, `clsx`, `tailwind-merge`). Ship `components.json` documenting the closed surface (style `"new-york"`, typescript `true`, the `@/components` and `@/lib/utils` aliases). Token-map the shadcn defaults (`bg-background`, `text-foreground`, `border-input`, `ring-ring`) onto the project's closed AD-18 tokens (`bg-bg`, `text-fg`, `border-border-strong`, `ring-accent`) so the primitives fit the spine-line aesthetic on first mount. Per AC #4, NO route imports these primitives in E1 — they sit unused until E3/E4 consumers land.

## Boundaries & Constraints

**Always:**
- Exactly **3 Radix shadcn files** under `components/ui/` ship in this story: `dialog.tsx`, `toggle.tsx`, `tooltip.tsx`. Each begins with `"use client"` at line 1 (Radix portals + DOM APIs). Plus `lib/utils.ts` at the canonical shadcn `cn()` location (NOT under `components/ui/`).
- `lib/utils.ts` exports `cn(...inputs: ClassValue[]): string` combining `clsx` (conditional class join) + `twMerge` (Tailwind conflict resolution). The shadcn-canonical implementation; no project-specific extension. The file lives at `lib/utils.ts` (canonical shadcn location matching `components.json`'s `aliases.utils: "@/lib/utils"`) — consumers import via `import { cn } from '@/lib/utils'`. NO `"use client"` directive (pure utility callable from server components).
- `components/ui/dialog.tsx` ships the Radix Dialog primitive: `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`. `DialogContent` uses `bg-bg-2 text-fg border border-border-strong` (closed AD-18 tokens, NOT the shadcn default `bg-background text-foreground`). The modal/mode contract is the consumer's choice — the primitive ships unopinionated. Per amended AD-15 line 309, the v4 "forward" affordance does NOT use this modal; the primitive is reserved for future use.
- `components/ui/toggle.tsx` ships the Radix Toggle primitive (`cva`-driven variant table: `default`, `outline`) plus `Toggle` named export. Uses `bg-bg-2 text-fg-2 hover:bg-bg-3` for default; `border border-border-strong bg-transparent` for outline. No consumer in E1 (per AC #4 + amended AD-15 line 309); reserved for E3 filter-chip non-radiogroup contexts.
- `components/ui/tooltip.tsx` ships the Radix Tooltip primitive: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `TooltipArrow`. `TooltipContent` uses `bg-bg-3 text-fg border border-border-strong` + `rounded-md` + `shadow-md`. Ships the provider in the same file so consumers do not need a separate import. Per epics.md line 70, `<Tooltip>` mounts on Patterns-cited deep-link hover in E3.
- `components.json` (project root) declares: `style: "new-york"`, `rsc: true`, `tsx: true`, `tailwind: { config: "", css: "app/globals.css", baseColor: "neutral", cssVariables: true, version: "v4" }`, `aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" }`. The file documents the closed surface; adding any field requires a spine amendment.
- All consumer-facing Tailwind class names use the closed AD-18 token names (`bg-bg`, `text-fg`, `border-border-strong`, `ring-accent`, etc.) — NOT the shadcn default palette (`bg-background`, `text-foreground`, `border-input`, `ring-ring`). `pnpm audit:tokens` will fail on any inline hex; this discipline catches drift early.
- Reuse `lib/design-tokens.ts` (1-5) for any named-token reference; do NOT introduce a second token mirror. The shadcn primitives consume the same `var(--bg)`, `var(--fg)`, `var(--accent)` tokens the rest of the closed set consumes.

**Ask First:**
- Adding any shadcn primitive beyond the three (`Dialog`, `Toggle`, `Tooltip`) — even ones that "make sense" like `Dropdown`, `Select`, `Sheet`, `Tabs`, `Accordion`, `Card`. AD-15 is `[CARRYOVER, NO-AMENDMENT]`.
- Importing any of the three primitives from a route in E1 (per AC #4, all three are reserved for E3/E4 consumers; introducing an E1 mount requires an AD-15 amendment).
- Adding `lucide-react` icons (shadcn recipes import from `lucide-react`; project policy per AD-13 closed component set does not include an icon library — substitute plain `<svg>` or text labels).
- Replacing the `cn()` helper with a project-rolled variant (the shadcn-canonical `clsx` + `twMerge` is the AD-15 contract).
- Moving `lib/utils.ts` to `components/ui/utils.ts` (the canonical shadcn location is `lib/utils.ts`; flipping it to `components/ui/` would silently break `components.json`'s `aliases.utils: "@/lib/utils"` declaration and confuse future `pnpm dlx shadcn add` invocations).

**Never:**
- Importing `@radix-ui/react-*` outside `components/ui/` (the three Radix packages are AD-15-bounded; E3/E4 consumers import the wrapped shadcn components, never the Radix primitives directly).
- Importing any shadcn default-palette Tailwind class (`bg-background`, `text-foreground`, `border-input`, `ring-ring`, `bg-popover`, `text-popover-foreground`, `bg-primary`, `text-primary-foreground`, etc.) — those tokens are not in the closed AD-18 set and would silently break the route-invariant at any future mount site.
- Adding `lucide-react`, `@radix-ui/react-icons`, or any other icon library as a transitive dep.
- Mounting any of the three primitives on a user-facing route in this story (per AC #4).
- Modifying `app/layout.tsx` (owned by 1-9), `app/page.tsx` (owned by 1-11), `app/globals.css` (owned by 1-5), `lib/design-tokens.ts` (owned by 1-5), or `lib/canvas-modes.ts` (owned by 1-6).
- Adding a 4th Radix file to `components/ui/` in this story (e.g., `index.ts` barrel, `types.ts`, or a 4th primitive like `Dropdown`/`Select`); the closed Radix surface is exactly the 3 files enumerated above. The `cn()` helper lives at `lib/utils.ts` (NOT under `components/ui/`).
- Using `"use client"` outside `components/ui/` (the layout remains a server component per AD-13).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_BUILD | `pnpm build` | exit 0; 3 Radix primitives compile under `components/ui/`; `lib/utils.ts` compiles; 6 new deps resolve from `pnpm-lock.yaml`; `components.json` is valid JSON. | N/A |
| HAPPY_PATH_LINT | `pnpm audit:tokens` | exit 0; no inline hex outside closed AD-18 set; primitives use token names like `bg-bg-2`, `text-fg`, `border-border-strong`. | N/A |
| CLOSED_SET_INTEGRITY | `ls components/ui/` + `ls lib/utils.ts` | exactly 3 Radix files under `components/ui/`: `dialog.tsx`, `toggle.tsx`, `tooltip.tsx` (no `utils.ts`, no `index.ts`, no `types.ts`, no extra primitive). `lib/utils.ts` exists separately for `cn()`. | N/A |
| CN_HELPER | `import { cn } from '@/lib/utils'; cn('bg-bg-2 text-fg', condition && 'border-border-strong', 'hover:bg-bg-3')` | returns single string with `clsx` join + `twMerge` conflict resolution; import resolves via `tsconfig.json`'s `@/*` path alias. | N/A |
| DIALOG_TOKEN_MAP | inspecting `DialogContent` className | contains `bg-bg-2`, `text-fg`, `border-border-strong`; does NOT contain `bg-background`, `text-foreground`, `border-input`. | N/A |
| TOGGLE_VARIANT_DEFAULT | `<Toggle>label</Toggle>` | renders `<button data-state="off">` with `bg-bg-2 text-fg-2 hover:bg-bg-3`. | N/A |
| TOGGLE_VARIANT_OUTLINE | `<Toggle variant="outline">label</Toggle>` | renders `<button data-state="off">` with `border border-border-strong bg-transparent`. | N/A |
| TOOLTIP_PROVIDER_MOUNT | consumer code mounts `<TooltipProvider delayDuration={200}>` once at the route level | provider state shared across all `<Tooltip>` descendants. | N/A |
| SHADCN_DEFAULT_PALETTE_LEAK | grep `bg-background\|text-foreground\|border-input\|ring-ring\|bg-popover` in `components/ui/*.tsx` | zero matches; primitives are fully token-mapped to AD-18. | TS/audit failure |
| NO_E1_CONSUMER | `grep -r "from.*components/ui" app/` | zero matches; no E1 route imports the primitives. | AC #4 violation |

</frozen-after-approval>

## Code Map

Files this story creates:

- `components/ui/dialog.tsx` — `"use client"` + Radix Dialog primitive + 10 named exports. Token-mapped classNames. ~120 lines.
- `components/ui/toggle.tsx` — `"use client"` + Radix Toggle + `cva` variants (`default`, `outline`). ~50 lines.
- `components/ui/tooltip.tsx` — `"use client"` + Radix Tooltip + `TooltipProvider` re-export. ~70 lines.
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge). ~10 lines. NO `"use client"` (pure utility, callable from server components). Lives at the canonical shadcn `lib/utils.ts` location (matches `components.json` `aliases.utils: "@/lib/utils"`).
- `components.json` — shadcn config (style, aliases, tailwind css path). ~25 lines.

Files this story modifies:

- `package.json` — adds 6 runtime deps: `@radix-ui/react-dialog`, `@radix-ui/react-toggle`, `@radix-ui/react-tooltip`, `class-variance-authority`, `clsx`, `tailwind-merge`. The Radix trio are direct deps (NOT transitive); `cva` + `clsx` + `twMerge` are direct deps of the `cn()` helper.
- `pnpm-lock.yaml` — regenerated by `pnpm install`; do NOT hand-edit.
- `sprint-status.yaml` — sets `1-10-…: backlog → in-progress` at task start; `→ review` at step-05.

Reuse / read-only anchors (no edits required):

- `app/globals.css` (1-5) — `@theme` block defines `--bg`, `--bg-2`, `--bg-3`, `--fg`, `--fg-2`, `--border-strong`, `--accent`, `--shadow-md`, `--radius-md` (closed AD-18 tokens consumed by the primitives via Tailwind utilities).
- `lib/design-tokens.ts` (1-5) — color name mirrors; primitives reference tokens via Tailwind class names, not via `lib/design-tokens.ts` imports.
- `scripts/audit-tokens.mjs` (1-5) — auto-walks `components/**/*.tsx`; the 3 new `.tsx` files will be walked and any inline hex will fail the build. (`lib/utils.ts` is also walked under `lib/**/*.ts`; no inline hex expected.)
- `scripts/audit-routes.shared.mjs` lines 27-33 — `AUDIT_TOKEN_GLOBS` includes `components/**/*.tsx` + `lib/**/*.ts`; the new primitives + `lib/utils.ts` are all in scope.
- `tsconfig.json` lines 27-31 — `@/*` path alias maps to `./*`; consumers can `import { cn } from '@/lib/utils'` (canonical shadcn location).
- `epic-1-context.md` lines 25, 28 — closed shadcn set (3) + `utils.ts` (`cn()`) enumeration; project layout (`components/ui/`).
- `epics.md` lines 305-309 — story 1.10 AC list this spec derives from.
- `ARCHITECTURE-SPINE.md` lines 350, 400-401, 438-442 — shadcn naming conventions, deps section (Radix primitives), structural seed showing `components/ui/` files.
- `deferred-work.md` (existing 1-9 entry) — `<SkipToContent>` + cmdk trigger click-handler wiring deferred to a follow-up story; orthogonal to this story's AD-15 scope.

## Tasks & Acceptance

**Execution:**

- [x] `package.json` — UPDATE: add 6 runtime deps to `dependencies`: `@radix-ui/react-dialog@^1.1.6`, `@radix-ui/react-toggle@^1.1.2`, `@radix-ui/react-tooltip@^1.1.8`, `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^3.0.1`. Run `pnpm install` to regenerate `pnpm-lock.yaml`. Confirm `pnpm typecheck` still exits 0 (no breaking changes from the new deps).
- [x] `lib/utils.ts` — CREATE: `import { clsx, type ClassValue } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }`. ~6 lines. NO `"use client"`. **Use double-quote style consistently** (matches the three `.tsx` primitives in `components/ui/`); the project's shadcn-canonical recipe uses double-quotes throughout.
- [x] `components/ui/dialog.tsx` — CREATE: `"use client"` line 1. Import `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` from `@radix-ui/react-dialog`. Re-export each under the same name (shadcn convention). `DialogContent` `className` MUST include `bg-bg-2 text-fg border border-border-strong rounded-lg shadow-lg` (closed AD-18 tokens). `DialogOverlay` `className` MUST include `bg-bg/72 backdrop-blur-sm` (using closed `--bg` value via Tailwind's `bg-bg/72` opacity utility). No inline hex anywhere. **File ends with a trailing newline** (POSIX).
- [x] `components/ui/toggle.tsx` — CREATE: `"use client"` line 1. Import `Root` from `@radix-ui/react-toggle` and `cva` from `class-variance-authority`. Define `toggleVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-bg-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-on-accent', { variants: { variant: { default: 'bg-bg-2 text-fg-2', outline: 'border border-border-strong bg-transparent hover:bg-bg-3' } }, defaultVariants: { variant: 'default' } })`. Export `Toggle` (forwarded ref to `Root`) and `toggleVariants`. ~30 lines. **File ends with a trailing newline** (POSIX).
- [x] `components/ui/tooltip.tsx` — CREATE: `"use client"` line 1. Import `Provider`, `Root`, `Trigger`, `Portal`, `Content`, `Arrow` from `@radix-ui/react-tooltip`. Re-export as `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipArrow`. `TooltipContent` `className` MUST include `z-50 overflow-hidden rounded-md bg-bg-3 px-3 py-1.5 text-xs text-fg border border-border-strong shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95`. `TooltipArrow` `className` MUST include `fill-bg-3`. No inline hex. **File ends with a trailing newline** (POSIX).
- [x] `components.json` — CREATE at project root: `{ "$schema": "https://ui.shadcn.com/schema.json", "style": "new-york", "rsc": true, "tsx": true, "tailwind": { "config": "", "css": "app/globals.css", "baseColor": "neutral", "cssVariables": true, "version": "v4" }, "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }, "iconLibrary": "lucide" }`. NOTE: `"iconLibrary": "lucide"` is the shadcn default; the project does NOT install `lucide-react` (per Never list); the field documents the closed-set position, not an active dependency.
- [x] `sprint-status.yaml` — UPDATE: `1-10-…: backlog → in-progress` at task start; `→ review` at step-05.

**Acceptance Criteria:**

- Given `components/ui/`, when listing files, then exactly 3 files are present: `dialog.tsx`, `toggle.tsx`, `tooltip.tsx`. No `utils.ts`, no barrel, no `types.ts`, no extra primitive. `cn()` lives at `lib/utils.ts` (canonical shadcn location).
- Given `package.json`, when reading `dependencies`, then the 6 deps are present at the pinned majors: `@radix-ui/react-dialog ^1.1.6`, `@radix-ui/react-toggle ^1.1.2`, `@radix-ui/react-tooltip ^1.1.8`, `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.0.1`. No `lucide-react`. No additional `@radix-ui/*` beyond the trio.
- Given `lib/utils.ts`, when reading line 1, then the file does NOT begin with `"use client"` (pure utility callable from server components); imports use double-quotes consistently (matching the three `.tsx` primitives).
- Given `components/ui/dialog.tsx`, when reading line 1, then the file begins with `"use client"`. When grepping the file for `bg-background|text-foreground|border-input|ring-ring|bg-popover|text-popover-foreground`, then zero matches (token-mapped to AD-18). File ends with a trailing newline.
- Given `components/ui/toggle.tsx`, when reading, then `<Toggle>` renders `<button>` with `data-state` toggling between `on`/`off`; `cva` exports `toggleVariants` with `default` + `outline` variants; the active variant classNames use closed tokens (`bg-bg-2 text-fg-2` for default; `border border-border-strong bg-transparent` for outline).
- Given `components/ui/tooltip.tsx`, when reading, then `<TooltipProvider>`, `<Tooltip>`, `<TooltipTrigger>`, `<TooltipContent>`, `<TooltipArrow>` are all exported; `TooltipContent` uses closed tokens (`bg-bg-3 text-fg border-border-strong shadow-md`); `TooltipArrow` uses `fill-bg-3`.
- Given `components.json`, when validating as JSON, then the file parses cleanly; the `aliases.utils` field is `@/lib/utils` (canonical shadcn location for `cn()`); the `tailwind.css` field is `app/globals.css`.
- Given `pnpm install`, when running, then exit 0; the 6 new deps resolve from `pnpm-lock.yaml`; the lockfile diff is limited to the 6 deps and their transitive closure.
- Given `pnpm typecheck`, when running, then exit 0; `cn()` is callable from server components; `Toggle` + `Tooltip` + `DialogContent` typecheck against the closed AD-18 token utilities.
- Given `pnpm audit:tokens`, when running, then exit 0; the 3 new `.tsx` files under `components/ui/` + `lib/utils.ts` contain zero inline hex outside the closed AD-18 allowlist (12 hex + 8 rgba values from `scripts/audit-routes.shared.mjs`).
- Given `pnpm build`, when running, then exit 0; the 4 files (3 in `components/ui/` + `lib/utils.ts`) compile; no route imports any of the primitives in E1 (per AC #4 — confirmed via `grep -r "from.*components/ui" app/` returning zero matches).
- Given `grep -r "from.*components/ui" app/`, when running, then zero matches (no E1 route imports the primitives).
- Given `grep -r "bg-background\|text-foreground\|border-input\|ring-ring" components/ui/`, when running, then zero matches (the primitives are fully token-mapped to the closed AD-18 set; shadcn default-palette leakage is caught at audit time).

## Spec Change Log

### Iteration 1 (2026-09-24, step-04 review)

**Triggering finding:** Blind Hunter flagged a spec self-contradiction: the task list (`## Tasks & Acceptance` execution list, item 2) specified `components/ui/utils.ts` as the location for the `cn()` helper, while the Acceptance Criterion #9 (`aliases.utils` field) and `components.json` `aliases.utils: "@/lib/utils"` declaration both point at the canonical shadcn location `lib/utils.ts`. A consumer reading `components.json` would import via `@/lib/utils` and find no file; a `pnpm dlx shadcn add` invocation would silently try to overwrite or duplicate the helper. The original implementation followed the (incorrect) task-list path.

### Iteration 2 (2026-09-24, step-04 review)

**Triggering finding:** Blind Hunter iteration-2 flagged that `<TooltipContent>`'s className included the shadcn-canonical animation utilities `animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95`, which require the `tailwindcss-animate` Tailwind plugin. The plugin is NOT installed in this project (and adding it would require a Tailwind config amendment outside the AD-15 closed-surface scope). The animation classes would silently no-op at runtime — Tooltip would open/close with no fade/zoom transition, a behavior contract violation of the shadcn-canonical Tooltip.

**Amendment (patch):**
1. `<TooltipContent>` className replaces the shadcn-canonical animation set with native Tailwind v4 transitions: `transition-opacity transition-transform duration-150 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=delayed-open]:opacity-100 data-[state=delayed-open]:scale-100`. Plus `origin-(--radix-tooltip-content-transform-origin)` to match Radix's transform-origin CSS variable (so the scale transitions from the trigger anchor point, not the tooltip center).
2. JSDoc updated to document the native-v4-transition choice and the rationale (closed AD-15 surface discipline: no new Tailwind plugins).
3. No dep changes (Option B: native classes, not Option A: new plugin dep).

**Verification post-patch:**
- `pnpm typecheck` exit 0 (clean)
- `pnpm audit:tokens` exit 0 (clean)
- `pnpm build` exit 0 (compiled successfully in ~1s; routes `/` + `/_not-found` + Proxy emitted)

**Known-bad state avoided:** Without this patch, E3's first mount of `<Tooltip>` (Patterns-cited deep-link hover) would render with no fade/zoom transition — a visual contract violation that's invisible to all current CI rails (no Playwright/snapshot harness yet, per deferred-work.md 1-6 entries #68/#70-#74).

**KEEP instructions (must survive any further re-derivation):**
- The `tooltip.tsx` animation contract is now: native Tailwind v4 transitions on `opacity` + `transform: scale()` keyed off Radix's `data-state="closed|delayed-open"` attributes. Do NOT reintroduce `animate-in fade-in-0 zoom-in-95` classes without first adding the `tailwindcss-animate` plugin (which is out of scope per the AD-15 closed-surface discipline).
- `origin-(--radix-tooltip-content-transform-origin)` keeps the scale anchor at the trigger's edge; removing this would cause the tooltip to scale from its center, breaking the "pop out from trigger" UX.

**Amendment:**
1. The `cn()` helper moves from `components/ui/utils.ts` to `lib/utils.ts` (canonical shadcn location matching `components.json`).
2. `components/ui/` becomes exactly 3 files (`dialog.tsx`, `toggle.tsx`, `tooltip.tsx`) — the closed AD-15 Radix surface. The `utils.ts` file is no longer in `components/ui/`.
3. The `cn()` helper at `lib/utils.ts` uses **double-quotes** consistently to match the three `.tsx` primitives (was single-quotes in the original draft).
4. All 3 new `.tsx` files under `components/ui/` end with a trailing newline (POSIX) — the original `tooltip.tsx` was missing one.

**Known-bad state avoided:** Without this amendment, E3/E4 consumers following the canonical shadcn `components.json` `aliases.utils: "@/lib/utils"` declaration would import a missing file at `@/lib/utils`, and the next `pnpm dlx shadcn add` invocation would either overwrite the helper at `components/ui/utils.ts` or duplicate it. The AD-15 `[CARRYOVER, NO-AMENDMENT]` closed-surface invariant also depends on consumers reaching for the wrapped shadcn components (not the bare Radix primitives); having `cn()` at the canonical shadcn location is part of that closed-surface hygiene.

**KEEP instructions (must survive re-derivation):**
- Token-mapping contract: all shadcn-default Tailwind class names (`bg-background`, `text-foreground`, `border-input`, `ring-ring`, `bg-popover`, `text-popover-foreground`, etc.) MUST be replaced with the closed AD-18 names (`bg-bg-2`, `text-fg`, `border-border-strong`, `bg-bg-3`, etc.) at write-time.
- `"use client"` directive at line 1 of each `.tsx` file under `components/ui/` (Radix portals + DOM APIs require client boundary). `lib/utils.ts` MUST NOT have `"use client"` (pure utility, callable from server components).
- No `lucide-react` or other icon-library dep. The `components.json` `iconLibrary: "lucide"` field is a "stated but not implemented" sentinel.
- No E1 route imports any of the three primitives (per AC #4 — reserved for E3/E4 consumers).
- The 6 new runtime deps are exactly: `@radix-ui/react-dialog`, `@radix-ui/react-toggle`, `@radix-ui/react-tooltip`, `class-variance-authority`, `clsx`, `tailwind-merge`. No `lucide-react`, no additional `@radix-ui/*`.
- `components.json` declares `style: "new-york"`, `rsc: true`, `tsx: true`, `tailwind.css: "app/globals.css"`, `aliases.utils: "@/lib/utils"` (now actually resolvable because `lib/utils.ts` exists).
- All file-paths in the implementation MUST match the spec verbatim — `components/ui/{dialog,toggle,tooltip}.tsx` for the Radix trio + `lib/utils.ts` for `cn()` + `components.json` at project root.

## Design Notes

- **Why `cn()` lives at `lib/utils.ts` (not `components/ui/utils.ts`):** The canonical shadcn location for the `cn()` helper is `lib/utils.ts`. `components.json`'s `aliases.utils: "@/lib/utils"` declaration matches that canonical location; the `@/lib/utils` import path resolves via `tsconfig.json`'s `@/*` path alias. Placing `utils.ts` under `components/ui/` would (a) silently break the `components.json` alias declaration (consumers reading `components.json` would import via `@/lib/utils` and find nothing), (b) confuse future `pnpm dlx shadcn add` invocations (which write the helper at `lib/utils.ts` by default), and (c) introduce a single file that consumes no Radix primitive — putting it under `components/ui/` (the closed Radix set) muddles the scope discipline. `lib/utils.ts` is a co-source directory owned by 1-5 (design tokens) and 1-6 (canvas modes); the `cn()` helper joins those without expanding the AD-13 / AD-15 surfaces.
- **Why token-map the shadcn defaults onto AD-18 instead of using them as-is:** The project's closed AD-18 token set has different names (`bg-bg`, `text-fg`, `border-border-strong`, `ring-accent`) than the shadcn defaults (`bg-background`, `text-foreground`, `border-input`, `ring-ring`). Using shadcn defaults would (a) silently introduce tokens that are NOT in `app/globals.css`'s `@theme` block, breaking Tailwind utility resolution at first mount, and (b) violate the AD-18 closed-set discipline (`pnpm audit:tokens` would NOT catch the missing tokens because it only walks for inline hex, not for missing utility classes — but the resulting components would render with no styles, a silent failure). Token-mapping the classNames in the source `.tsx` files at write-time (rather than at runtime) means the primitives inherit the project's spine-line aesthetic the moment E3/E4 consumers mount them.
- **Why `<Tooltip>` ships its own `TooltipProvider` re-export:** Radix Tooltip requires a Provider in the React tree for hover-delay state to be shared across multiple `<Tooltip>` instances on the same page. The shadcn convention is to re-export the Provider from the same file as the primitive so consumers have a single import. The Provider itself is a no-op server-side wrapper; the `"use client"` boundary at the top of `tooltip.tsx` keeps the boundary tight.
- **Why `Dialog` ships unopinionated on modal/non-modal mode:** Per amended AD-15 line 309, the v4 "forward" affordance is NOT a modal — recruiter-mode is a route, not state (per amended AD-8). The Radix primitive supports both modes via the consumer's choice of `modal` prop; this story ships the primitive without forcing one or the other so future consumers (E4 forward-modal, E5 subscribe form) can pick. If a later amendment needs a "modal-only" wrapper, it ships as a separate primitive on the closed surface.
- **Why no `lucide-react` despite `components.json` declaring `iconLibrary: "lucide"`:** Shadcn's CLI-generated recipes ship with a `lucide-react` icon import (e.g., `<X />` for the Dialog close button). Project policy per AD-13's closed component set does not include an icon library, and the spine lists no icon dep. The 3 Radix primitives in this story avoid icons entirely (Dialog uses a text close affordance; Toggle/Tooltip render text labels). The `components.json` field documents the closed-set position (no lucide dep) so a future `pnpm dlx shadcn add` invocation is blocked from silently adding one — the field is intentionally set to `lucide` (the shadcn default) but the project's `package.json` does not include it, and the implementation has zero references. This is a "stated but not implemented" sentinel.
- **Why no `app/__preview/` harness for the primitives in this story:** Per AC #4, all three primitives are reserved for E3/E4 consumers; mounting them on a preview route would (a) be the first E1 import of a `components/ui/*` export (violates AC #4), and (b) suffer the `__preview/` private-folder exclusion documented in deferred-work.md (the preview route would never reach the build output). Preview harnesses for these primitives are deferred to the consumer stories (3.x, 4.x) where they belong.

## Verification

**Commands:**

- `ls components/ui/` — expected: `dialog.tsx`, `toggle.tsx`, `tooltip.tsx` (exactly 3 Radix files; no `utils.ts`).
- `ls lib/utils.ts` — expected: file exists (the `cn()` helper lives at the canonical shadcn location).
- `head -1 lib/utils.ts` — expected: NOT `"use client";` (pure utility).
- `head -1 components/ui/dialog.tsx` — expected: `"use client";`.
- `head -1 components/ui/toggle.tsx` — expected: `"use client";`.
- `head -1 components/ui/tooltip.tsx` — expected: `"use client";`.
- `tail -c 1 components/ui/dialog.tsx` — expected: newline (POSIX).
- `tail -c 1 components/ui/toggle.tsx` — expected: newline (POSIX).
- `tail -c 1 components/ui/tooltip.tsx` — expected: newline (POSIX).
- `grep -l "bg-background\|text-foreground\|border-input\|ring-ring\|bg-popover" components/ui/*.tsx` — expected: empty (token-mapped).
- `grep -r "from.*components/ui" app/` — expected: empty (no E1 route imports).
- `node -e "JSON.parse(require('fs').readFileSync('components.json','utf8'))"` — expected: exit 0 (valid JSON).
- `pnpm install` — expected: exit 0; lockfile diff limited to the 6 deps + transitive closure.
- `pnpm typecheck` — expected: exit 0; `cn()` (at `@/lib/utils`) + `Toggle` + `Tooltip` + `DialogContent` all typecheck.
- `pnpm audit:tokens` — expected: exit 0; primitives consume only closed AD-18 tokens; `lib/utils.ts` has no inline hex.
- `pnpm build` — expected: exit 0; 3 Radix primitives + `lib/utils.ts` compile; no E1 route imports them.

**Manual checks:**

- Open `components/ui/dialog.tsx` — confirm line 1 is `"use client";`; `DialogContent` uses `bg-bg-2 text-fg border-border-strong` (closed AD-18 tokens); all 10 Radix-named exports are re-exported; file ends with trailing newline.
- Open `components/ui/toggle.tsx` — confirm `cva` variant table uses `default` + `outline`; default variant uses `bg-bg-2 text-fg-2`; outline uses `border border-border-strong bg-transparent`; `Toggle` is the named export; file ends with trailing newline.
- Open `components/ui/tooltip.tsx` — confirm `TooltipProvider` + `Tooltip` + `TooltipTrigger` + `TooltipContent` + `TooltipArrow` are all exported; `TooltipContent` uses `bg-bg-3 text-fg border-border-strong shadow-md`; file ends with trailing newline.
- Open `lib/utils.ts` — confirm `cn()` is the only export; imports `clsx` and `tailwind-merge`; uses double-quotes consistently with the `.tsx` primitives.
- Open `components.json` — confirm `style: "new-york"`, `aliases.utils: "@/lib/utils"` (now resolvable — `lib/utils.ts` exists), `tailwind.css: "app/globals.css"`.
- Open `package.json` — confirm 6 new deps in `dependencies`; no `lucide-react`; no additional `@radix-ui/*` beyond the trio.

## Suggested Review Order

**Closed AD-15 surface (entry point)**

- Stand up exactly the three Radix shadcn files this story closes on, token-mapped onto AD-18.
  [`dialog.tsx:1`](../../components/ui/dialog.tsx#L1)

- Same closed set, second primitive; `cva` variant table ties `bg-bg-2 text-fg-2` and outline tokens together.
  [`toggle.tsx:1`](../../components/ui/toggle.tsx#L1)

- Same closed set, third primitive; uses native v4 transitions, not the plugin-required canonical set.
  [`tooltip.tsx:1`](../../components/ui/tooltip.tsx#L1)

**Class-joiner helper (co-located with design tokens, not in `components/ui/`)**

- The `cn()` helper lives at the canonical shadcn path so `aliases.utils: "@/lib/utils"` actually resolves.
  [`utils.ts:1`](../../lib/utils.ts#L1)

**shadcn config (documents the closed surface, doesn't add deps)**

- `components.json` declares `style: new-york`, `@/lib/utils`, and `iconLibrary: "lucide"` as a stated-but-not-installed sentinel.
  [`components.json:1`](../../components.json#L1)

**Radix Dialog token-mapping (primary surface concern)**

- All 10 Radix-named exports re-exported under the same names; `DialogContent` uses `bg-bg-2 text-fg border border-border-strong`.
  [`dialog.tsx:54`](../../components/ui/dialog.tsx#L54)

- Dialog scrim uses the `bg-bg/72` alpha-modifier on `--bg`, so the overlay inherits the closed palette token.
  [`dialog.tsx:37`](../../components/ui/dialog.tsx#L37)

- Close affordance is plain text "Close" rather than a `lucide-react` `<X />`, per AD-13's no-icon-library policy.
  [`dialog.tsx:60`](../../components/ui/dialog.tsx#L60)

**Radix Toggle variant table**

- `cva` defines `default` and `outline` variants; active state flips to the accent token.
  [`toggle.tsx:21`](../../components/ui/toggle.tsx#L21)

**Radix Tooltip animation contract (iteration-2 patch — key surface)**

- TooltipContent replaces `animate-in fade-in-0 zoom-in-95` (plugin-required) with native v4 transitions on opacity + scale.
  [`tooltip.tsx:44`](../../components/ui/tooltip.tsx#L44)

- JSDoc records the native-v4 rationale and the `tailwindcss-animate`-plugin constraint.
  [`tooltip.tsx:8`](../../components/ui/tooltip.tsx#L8)

**Dependency manifest (peripherals last)**

- Six runtime deps added — three Radix primitives, plus `cva` + `clsx` + `tailwind-merge` for the `cn()` helper.
  [`package.json:29`](../../package.json#L29)

- Lockfile regenerated by `pnpm install`; not hand-edited.
  [`pnpm-lock.yaml:1`](../../pnpm-lock.yaml#L1)
