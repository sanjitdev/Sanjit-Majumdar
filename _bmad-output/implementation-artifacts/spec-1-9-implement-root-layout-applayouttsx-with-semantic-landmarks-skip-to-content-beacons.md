---
title: 'Implement root layout (`app/layout.tsx`) with semantic landmarks, beacons, footer, proxy `x-pathname` header'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 1
baseline_commit: 'd4e2596' # 1-8 HEAD at step-03 start of 1-9
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-6-implement-the-10-closed-client-components-ad-13.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-7-implement-persistent-nav-with-brand-mark-links-command-palette-trigger-magnetic-cta-scroll-progress.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-8-implement-hero-plus-proofvectorcluster-for-the-homepage.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** UX-DR1 + UX-DR2 + FR-19 require every public route to ship with semantic landmarks (`<header role="banner">`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer role="contentinfo">`) and deferred `<AnalyticsBeacon>` (Plausible) + `<ErrorBeacon>` (Sentry). Today `app/layout.tsx` returns `children` directly — no `<html>`, no `<body>`, no `globals.css` import — so the deployed site renders unstyled HTML with zero Tailwind utility resolution (confirmed at HEAD: a 1-8 `<Hero>` preview shows the spine line and proof numbers in raw default UA styling). `<Nav>` needs `currentPath` to render `aria-current="page"` on the active link, but `proxy.ts` does not surface the request pathname to the layout today. If 1-11 ships the homepage before the layout is fixed, FR-19 fails on first paint.

**Approach:** Stand up `app/layout.tsx` as a server component (no `"use client"` at line 1) that imports `app/globals.css`, mounts the existing closed AD-13 beacon components (`<AnalyticsBeacon>` + `<ErrorBeacon>`) in `<head>`, mounts `<Nav>` with `currentPath` derived from `headers().get('x-pathname')` (set by an additive `proxy.ts` amendment), wraps `{children}` in `<main id="main">`, and renders an empty `<footer>` landmark. The `proxy.ts` amendment is a 5-line additive change — it does NOT touch the existing 308 redirect logic or the matcher; it only attaches the request pathname as a header so the server-component layout can read it via `next/headers`. **No new files under `components/client/`** — `<SkipToContent>` (the 10th AD-13 component) is deferred to a follow-up story (per `deferred-work.md` entry this story appends).

## Boundaries & Constraints

**Always:**
- `app/layout.tsx` is a **server component** (no `"use client"` at line 1). AD-13 invariant: no layout-level client boundary.
- `app/layout.tsx` MUST import `./globals.css` so Tailwind v4 utilities resolve on every route.
- `<html lang="en">` MUST wrap the entire tree; `<body>` MUST carry `className="min-h-screen bg-bg text-fg antialiased font-sans"` (consumes closed AD-18 tokens `--bg`, `--fg`, `--font-sans`).
- `<AnalyticsBeacon>` (Plausible) + `<ErrorBeacon>` (Sentry stub) MUST mount in `<head>` with deferred loading (`next/script` `strategy="lazyOnload"` — already baked into both components from 1-6).
- `<Nav>` MUST render directly below the beacons; the layout passes `currentPath` derived from `headers().get('x-pathname') ?? '/'`.
- `<main id="main">` MUST wrap `{children}` (UX-DR1 + UX-DR2 — `<SkipToContent>` (when added later) will jump here via `href="#main"`).
- `<footer role="contentinfo" aria-label="Site footer">` MUST render after `<main>`. For 1-9 it is empty (no copy, no links — the "For recruiters?" footer link is owned by 1-11 per the epic-1-context.md cross-story table). The `aria-label` is a placeholder so 1-11's footer content slots in without restructuring the landmark.
- Export `metadata = { title: { default: 'Sanjit Majumdar — Senior Software Engineer', template: '%s | Sanjit Majumdar' }, description: 'Senior software engineer. I build, ship, and run the gap.', metadataBase: new URL('https://sanjit.dev'), openGraph: { ... } }` at module scope (server-component metadata export).
- **AD-13 invariant after this story**: `components/client/` still contains exactly **9 files** (the original 7 from 1-6 + `NavCurrent` + `ScrollProgress` from 1-7). The 10th file (`SkipToContent`) ships in a follow-up story.
- **`currentPath` derivation**: `app/layout.tsx` calls `headers().get('x-pathname')` (set by `proxy.ts`) and passes it to `<Nav currentPath={currentPath} />`. Default fallback: `'/'` when header is missing.
- **`proxy.ts` amendment (additive only)**: at the top of the function body, add `const requestHeaders = new Headers(request.headers); requestHeaders.set('x-pathname', nextUrl.pathname);`. Both the pass-through `return NextResponse.next();` and the `return NextResponse.redirect(target, { status: 308 });` change to pass `{ request: { headers: requestHeaders } }` (redirect also passes `headers: requestHeaders` on the response so downstream `fetch` from the redirected URL carries the header). The 308 redirect logic + matcher remain unchanged.
- Reuse `lib/design-tokens.ts` (1-5) + `app/globals.css` (1-5); no new devDeps; no new design tokens; no inline hex/px outside the closed AD-18 set.
- No `viewport` export (Next.js 16 emits viewport meta per-route; 1-11's homepage owns its `viewport` export).

**Ask First:**
- Adding an 10th file under `components/client/` in this story (would require splitting out the `<SkipToContent>` work — already deferred to a follow-up).
- Replacing the `headers().get('x-pathname')` strategy with a `usePathname()`-based approach (would require converting `<Nav>` to a client component — violates AD-13).
- Wiring the cmdk trigger's click handler in this story (would require either a new client component OR an inline `<Script>` event delegator — both are scope expansions; deferred to a follow-up).
- Changing the `<html lang="en">` to a different locale.
- Replacing the empty `<footer>` with substantive copy (footer content is owned by 1-11).

**Never:**
- Modifying any file in `components/client/` (the 1-6/1-7 client components are owned by their stories; this story ships ZERO new files under that directory).
- Modifying `components/Nav.tsx` (owned by 1-7).
- Modifying `app/page.tsx` (owned by 1-11).
- Modifying `app/globals.css` or `lib/design-tokens.ts` (owned by 1-5).
- Modifying `lib/canvas-modes.ts` (owned by 1-6).
- Modifying the 308 redirect LOGIC in `proxy.ts` (owned by 1-3). This story ADDS the `x-pathname` header setter AND widens the matcher from `['/']` to `['/:path*']` so the header reaches the layout on every navigation; the 308 redirect trigger is independent of the matcher (it only fires for `/?for=recruiter`).
- Modifying `scripts/audit-routes.shared.mjs` `AUDIT_ROUTES` / `PROOF_NUMBERS` / `ALLOWED_HEX` / `ALLOWED_RGBA`.
- Adding the `For recruiters?` footer link (owned by 1-11).
- Creating `<SkipToContent>` in this story (deferred to follow-up per the split decision).
- Mounting `<Hero>` or `<ProofVectorCluster>` (owned by 1-8, mounted by 1-11).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_BUILD | `pnpm build` | exit 0; layout compiles; `x-pathname` header set by proxy; `<Nav>` + beacons + footer emitted. | N/A |
| HAPPY_PATH_LINT | `pnpm audit:tokens` | exit 0; layout consumes `bg-bg` + `text-fg` + `font-sans` only; no inline hex. | N/A |
| CLOSED_SET_INTEGRITY | `ls components/client/` | exactly 9 files (unchanged from end of 1-7); `<SkipToContent>` MUST NOT exist yet. | N/A |
| LANDMARKS_PRESENT | rendered HTML at `/` | `<header role="banner">` + `<nav aria-label="Primary">` (inside `<header>`) + `<main id="main">` + `<footer role="contentinfo" aria-label="Site footer">` all present. | N/A |
| BEACONS_DEFERRED | inspecting `<head>` | `<Script>` tags for Plausible + Sentry-stub rendered with `strategy="lazyOnload"`; NO script blocks first paint. | N/A |
| NAV_CURRENT_PATH_PROXY | request to `/work` | `proxy.ts` sets `x-pathname: /work`; layout reads via `headers().get('x-pathname')`; `<Nav>` passes `currentPath="/work"` → `<NavCurrent href="/work" isCurrent={true}>` renders `aria-current="page"`. | fallback to `'/'` if header missing |
| NAV_CURRENT_PATH_HOMEPAGE | request to `/` | `proxy.ts` sets `x-pathname: /`; `<NavCurrent href="/">` is current; other 6 links are not. | N/A |
| STYLES_APPLIED | inspecting `<body>` | Tailwind utilities resolve; `bg-bg` renders `#06070B`; `text-fg` renders `#FAFAFA`. | N/A |
| FOOTER_EMPTY_1_9 | inspecting `<footer>` | empty `<footer role="contentinfo" aria-label="Site footer">` present; 1-11 will fill it. | N/A |
| PROXY_HEADER_PRESENT | request flow | `proxy.ts` `NextResponse.next({ request: { headers: requestHeaders } })` carries `x-pathname` to all routes; 308 redirect also carries the header on the response. | if proxy matcher excludes the route, fallback `'/'` applies |
| LANG_ATTRIBUTE | inspecting `<html>` | `<html lang="en">`. | N/A |
| METADATA_INHERITANCE | `<title>` rendered | `<title>Sanjit Majumdar — Senior Software Engineer</title>` on `/`; template `'%s \| Sanjit Majumdar'` available for child routes. | N/A |

</frozen-after-approval>

## Code Map

Files this story modifies:

- `app/layout.tsx` — full rewrite: import `globals.css`; import the 4 client components + `Nav` + `headers`; export `metadata`; render `<html lang="en"><body className="min-h-screen bg-bg text-fg antialiased font-sans"><AnalyticsBeacon /><ErrorBeacon /><Nav currentPath={...} /><main id="main">{children}</main><footer role="contentinfo" aria-label="Site footer" /></body></html>`. ~25 lines.
- `proxy.ts` — additive amendment: set `x-pathname` request header on both pass-through and 308 redirect paths. Existing 308 redirect logic + matcher unchanged. ~35 lines.
- `sprint-status.yaml` — sets `1-9-…: backlog → in-progress` at task start; `→ review` at step-05.
- `deferred-work.md` — APPEND one entry per workflow rules.

Reuse / read-only anchors (no edits required):

- `lib/design-tokens.ts` (1-5) — token names referenced via Tailwind utilities; no new tokens.
- `app/globals.css` (1-5) — `@theme` block: `--bg`, `--fg`, `--font-sans` consumed via Tailwind utility classes.
- `components/Nav.tsx` (1-7) — server component accepting `currentPath: string`.
- `components/client/NavCurrent.tsx` (1-7) — renders `aria-current="page"` when `isCurrent`.
- `components/client/AnalyticsBeacon.tsx` (1-6) — Plausible `<Script strategy="lazyOnload">`; mount in layout `<head>`.
- `components/client/ErrorBeacon.tsx` (1-6) — Sentry stub `<Script strategy="lazyOnload">`; mount in layout `<head>`.
- `proxy.ts` (1-3) — base file; this story makes a 5-line additive change to set `x-pathname`.
- `epic-1-context.md` lines 25-26, 39, 44 — UX-DR1 + UX-DR2 + UX-DR5 + AD-13 no-SPA-shell contracts.
- `epics.md` lines 291-299 — story 1.9 AC list this spec derives from.
- `deferred-work.md` — receives one new entry from this story.
- `scripts/audit-tokens.mjs` (1-5) — auto-walks `app/**/*.tsx` + `components/**/*.tsx`; layout is walked.
- `next.config.mjs` (1-2) — CSP/SRI applies to all paths; no new constraints.
- `tsconfig.json` — `strict: true`, `noUncheckedIndexedAccess: true`; `headers()` from `next/headers` returns `ReadonlyHeaders` (sync in Next 16).

## Tasks & Acceptance

**Execution:**

- [x] `proxy.ts` — UPDATE: at the top of the function body (before the existing `if` block), add `const requestHeaders = new Headers(request.headers); requestHeaders.set('x-pathname', nextUrl.pathname);`. Change `return NextResponse.next();` to `return NextResponse.next({ request: { headers: requestHeaders } });`. The 308 redirect branch keeps `NextResponse.redirect(target, { status: 308 })` WITHOUT `headers: requestHeaders` (the `headers` arg on `NextResponse.redirect` is RESPONSE headers, not request). Widen the matcher from `['/']` to `['/:path*']` so the `x-pathname` header reaches the layout on every navigation. The 308 redirect trigger logic remains unchanged (only fires for `/?for=recruiter`). Update the header comment to document both branches.
- [x] `app/layout.tsx` — REWRITE: import `'./globals.css'` (line 1) + `import { Nav } from '../components/Nav'` + `import { AnalyticsBeacon } from '../components/client/AnalyticsBeacon'` + `import { ErrorBeacon } from '../components/client/ErrorBeacon'` + `import { headers } from 'next/headers'`. Export `metadata = { title: { default: 'Sanjit Majumdar — Senior Software Engineer', template: '%s | Sanjit Majumdar' }, description: 'Senior software engineer. I build, ship, and run the gap.', metadataBase: new URL('https://sanjit.dev'), openGraph: { title: 'Sanjit Majumdar — Senior Software Engineer', description: 'Senior software engineer. I build, ship, and run the gap.', url: 'https://sanjit.dev', siteName: 'Sanjit Majumdar', type: 'website' } }`. The default export `RootLayout({ children })` does `const currentPath = headers().get('x-pathname') ?? '/';` then returns `<html lang="en"><body className="min-h-screen bg-bg text-fg antialiased font-sans"><AnalyticsBeacon /><ErrorBeacon /><Nav currentPath={currentPath} /><main id="main">{children}</main><footer role="contentinfo" aria-label="Site footer" /></body></html>`. ~25 lines.
- [x] `sprint-status.yaml` — UPDATE 1-9 status `backlog → in-progress` at task start; `→ review` at step-05.
- [x] `deferred-work.md` — APPEND one entry: `source_spec: <this spec path>; summary: The 10th AD-13 client component `<SkipToContent>` (sr-only + `:focus:not-sr-only` reveal to `<main id="main">`) is deferred to a follow-up story to keep this spec under the 1,600-token SCOPE STANDARD budget; evidence: the spec split at step-02 chose the layout + landmarks + beacons as the main goal (FR-19 blocker for 1-11). SkipToContent is the only AD-13 amendment gap remaining after this story; a follow-up story ships `components/client/SkipToContent.tsx` and inserts `<SkipToContent />` as the first body child of the layout. cmdk trigger click-handler wiring is also deferred to the same follow-up story (would require either an 11th client component OR a `<Script>` event delegator; both are scope expansions the narrowed 1-9 explicitly rejects).`

**Acceptance Criteria:**

- Given `components/client/`, when listing files, then exactly **9 files** are present: `SignatureCanvas.tsx`, `CommandPalette.tsx`, `MagneticCTA.tsx`, `LayerRowHover.tsx`, `FilterChipGroup.tsx`, `AnalyticsBeacon.tsx`, `ErrorBeacon.tsx`, `NavCurrent.tsx`, `ScrollProgress.tsx`. `<SkipToContent>` MUST NOT exist yet (deferred).
- Given `app/layout.tsx`, when reading, then line 1 imports `./globals.css`, line 2+ imports the 3 client components + `<Nav>` + `headers`, exports `metadata` with the title template `'%s | Sanjit Majumdar'`, the `RootLayout` function is a server component (no `"use client"` at the top), calls `headers().get('x-pathname') ?? '/'` to derive `currentPath`, and returns `<html lang="en"><body className="min-h-screen bg-bg text-fg antialiased font-sans"><AnalyticsBeacon /><ErrorBeacon /><Nav currentPath={currentPath} /><main id="main">{children}</main><footer role="contentinfo" aria-label="Site footer" /></body></html>`.
- Given the rendered HTML at `/`, when inspecting the DOM tree, then `<html lang="en">` is present, `<body>` carries `class="min-h-screen bg-bg text-fg antialiased font-sans"`, the document order is `<AnalyticsBeacon>` + `<ErrorBeacon>` (in `<head>`) → `<Nav>` → `<main id="main">` → `<footer role="contentinfo" aria-label="Site footer">`. Landmarks: `<header role="banner">` (from `<Nav>`), `<nav aria-label="Primary">` (from `<Nav>`), `<main id="main">`, `<footer role="contentinfo">`.
- Given the `<Nav>` element on a request to `/work`, when inspecting, then `aria-current="page"` appears on the `<NavCurrent href="/work">` link (proxy sets `x-pathname: /work`; layout reads via `headers()`; `<Nav>` passes `currentPath="/work"`).
- Given the `<Nav>` element on a request to `/`, when inspecting, then `aria-current="page"` appears on the `<NavCurrent href="/">` link (the homepage); all other 6 links render without `aria-current`.
- Given the `<head>` element, when inspecting, then `<script>` tags for Plausible + Sentry-stub render with `strategy="lazyOnload"` (Next.js emits the strategy attribute on the rendered `<script>` tag). No scripts block first paint.
- Given `pnpm build`, when running, then exit 0; layout compiles; `x-pathname` header setter in proxy.ts compiles; `<Nav>` receives `currentPath` from layout.
- Given `pnpm audit:tokens`, when running, then exit 0; the layout consumes `bg-bg` + `text-fg` + `font-sans` only (closed AD-18 tokens). No inline hex/px outside the closed set.
- Given `pnpm typecheck`, when running, then exit 0; `headers().get('x-pathname')` returns `string | null`; the nullish coalescing `?? '/'` narrows to `string`; `<Nav currentPath={currentPath} />` typechecks.
- Given `pnpm start` (or `pnpm dev`) and a request to `/`, when inspecting `request.headers` server-side (via `console.log(headers())`), then `x-pathname` is `"/"`. When inspecting a request to `/work`, then `x-pathname` is `"/work"`. When inspecting a request to `/?for=recruiter`, then `proxy.ts` redirects to `/recruiter` with status 308 AND carries `x-pathname: /recruiter` on the redirect response.
- Given `git diff HEAD~ -- app/layout.tsx proxy.ts`, when inspecting, then `proxy.ts` has the additive `requestHeaders.set('x-pathname', ...)` line + both `NextResponse.next()` and `NextResponse.redirect()` calls pass the headers object; `app/layout.tsx` is a full rewrite adding `<html>` + `<body>` + globals.css import + the 4 component mounts + the footer landmark.

## Spec Change Log

### Iteration 1 (2026-09-24, step-04 review)

**Triggering findings:** Blind Hunter + Edge Case Hunter + Verification Gap Reviewer all flagged the same defect — `proxy.ts` matcher `['/']` (from 1-3) is too narrow for the `<Nav aria-current>` AC. The matcher only intercepts `/`, so `x-pathname` is never set for `/work`, `/about`, `/recruiter`, etc., and the layout's `?? '/'` fallback causes `<NavCurrent href="/">` to be marked current on every page. Blind Hunter + Edge Case Hunter also flagged a secondary defect: `NextResponse.redirect(target, { status: 308, headers: requestHeaders })` puts REQUEST headers on the RESPONSE, leaking internal `x-pathname` to the browser. The original spec contradicted itself: AC claims `aria-current="page"` on `href="/work"` when on `/work`, but the spec also forbids touching the matcher.

**Amendments:**
1. `proxy.ts` matcher widened from `['/']` to `['/:path*']`. The 308 redirect trigger (`nextUrl.pathname === '/' && searchParams.get('for') === 'recruiter'`) is independent of the matcher — it still only fires for the canonical-share form. Asset, API, and static-file requests stay outside the edge runtime's intercept because Next.js's matcher syntax (`/:path*`) only matches page navigations, not `/_next/*` or `/api/*`. The "Never" prohibition on touching the matcher was relaxed to clarify that widening is required.
2. `proxy.ts` 308 redirect branch: removed `headers: requestHeaders` from the `NextResponse.redirect` call. The `headers` arg in `NextResponse.redirect` is RESPONSE headers, not request — attaching it leaks internal routing hints. The destination layout reads a fresh `x-pathname` from the proxy's pass-through branch on the redirected request to `/recruiter`.
3. `app/page.tsx`: reverted to the 1-11-owned stub (`<h1>sanjit.dev</h1>`). The temporary `<Hero />` preview mount from the screenshot-debug session was outside 1-9 scope.
4. `app/layout.tsx`: trailing newline added (was missing).

**Known-bad state avoided:** Without these amendments, every non-homepage route would render the Home nav link as active (silent fallback bug), and the 308 redirect response would carry an internal `x-pathname` header to the browser.

**KEEP instructions (must survive re-derivation):**
- The server-component layout pattern (`headers().get('x-pathname') ?? '/'`) is the canonical way to derive `currentPath` without violating AD-13 (no client-component wrapper for `usePathname`).
- The `x-pathname` header is set UNCONDITIONALLY on every intercepted request (both pass-through and 308 redirect paths) via the cloned `requestHeaders` object.
- `<Nav>` already exists (1-7) and consumes `currentPath: string` via its existing prop API; no changes to `components/Nav.tsx` are required for this story.
- The empty `<footer role="contentinfo" aria-label="Site footer">` is the structural placeholder; 1-11 fills the body content.
- `<SkipToContent>` and cmdk trigger click-handler wiring remain deferred to a follow-up story per the deferred-work.md entry this story appended.
- `metadata.title.template` is `'%s | Sanjit Majumdar'` and child routes that set `title` strings will inherit this pattern.
- The `<body>` class set is `min-h-screen bg-bg text-fg antialiased font-sans` (closed AD-18 tokens + Tailwind utilities; consumed via `globals.css`).

## Suggested Review Order

**Proxy contract — `x-pathname` injection + 308 redirect (highest-leverage entry point)**

- Two responsibilities documented at the top of `proxy.ts`; both must hold.
  [`proxy.ts:3`](../../proxy.ts#L3)
- Server-component layout reads pathname via `next/headers`; AD-13 no-SPA-shell preserved.
  [`layout.tsx:30`](../../app/layout.tsx#L30)
- Cloned requestHeaders get the pathname set unconditionally before either branch fires.
  [`proxy.ts:19`](../../proxy.ts#L19)
- Pass-through branch forwards the cloned headers via `NextResponse.next({ request: ... })`.
  [`proxy.ts:23`](../../proxy.ts#L23)
- 308 redirect intentionally omits `headers: requestHeaders` — response ≠ request headers.
  [`proxy.ts:40`](../../proxy.ts#L40)
- Matcher widened `['/']` → `['/:path*']` so header reaches the layout on every navigation.
  [`proxy.ts:48`](../../proxy.ts#L48)

**Server-component root layout (the structural deliverable)**

- `globals.css` import is line 1 — without it Tailwind utilities don't resolve at all.
  [`layout.tsx:1`](../../app/layout.tsx#L1)
- `<html lang="en">` wraps the entire tree (AD-20 + UX-DR1 accessibility floor).
  [`layout.tsx:33`](../../app/layout.tsx#L33)
- `<body>` consumes the closed AD-18 token set: `--bg`, `--fg`, `--font-sans` via Tailwind.
  [`layout.tsx:34`](../../app/layout.tsx#L34)
- Beacons mount in document order before `<Nav>`; both use `strategy="lazyOnload"`.
  [`layout.tsx:35`](../../app/layout.tsx#L35)
- `<Nav>` receives `currentPath` derived server-side; no client `usePathname` wrapper.
  [`layout.tsx:37`](../../app/layout.tsx#L37)
- `<main id="main">` wraps `{children}` (UX-DR1 — `aria-current` jumps here).
  [`layout.tsx:38`](../../app/layout.tsx#L38)
- Empty `<footer role="contentinfo" aria-label="Site footer">` — 1-11 fills content.
  [`layout.tsx:39`](../../app/layout.tsx#L39)
- `metadata` export with title template `'%s | Sanjit Majumdar'` + OG defaults.
  [`layout.tsx:9`](../../app/layout.tsx#L9)

**AD-13 closed-set invariant preserved**

- `components/client/` still at 9 files; `<SkipToContent>` deferred to follow-up story.
  [`components/client/`](../../components/client/)

**Documentation trail**

- Spec Change Log (iteration 1) records the matcher widening + redirect patch rationale.
  [`spec-1-9:103`](./spec-1-9-implement-root-layout-applayouttsx-with-semantic-landmarks-skip-to-content-beacons.md#L103)

## Design Notes

- **Why `currentPath` is derived via `headers().get('x-pathname')`, not `usePathname()`:** `usePathname()` is a client-side hook and would require either converting `<Nav>` to a client component (violates AD-13 — `<Nav>` is a server component per spec-1-7) or wrapping `<NavCurrent>` consumers in a parent client component (would force `<Nav>` to be `"use client"` too). Both options violate AD-13's no-SPA-shell discipline. The `headers().get('x-pathname')` + `proxy.ts` header amendment is server-only: the layout reads the header synchronously in the RSC render, passes the string to `<Nav>`, and `<NavCurrent>` renders `aria-current` server-side based on the canonical pathname. Zero client JS for path highlighting. The `proxy.ts` amendment is a 5-line additive change (does not touch the existing 308 redirect or matcher).
- **Why the `proxy.ts` `x-pathname` amendment does not affect the 308 redirect behavior:** The pass-through branch (`NextResponse.next({ request: { headers: requestHeaders } })`) forwards the `x-pathname` request header to downstream server components (the layout reads it via `headers()`). The 308 redirect branch (`NextResponse.redirect(target, { status: 308 })`) intentionally does NOT pass `requestHeaders` because the `headers` arg in `NextResponse.redirect` is RESPONSE headers, not request — attaching it would leak the internal `x-pathname` to the browser. The destination layout on `/recruiter` will get a fresh `x-pathname` set by the proxy's pass-through branch on the redirected request.
- **Why the matcher widens to `['/:path*']`:** The matcher must cover every public route so `x-pathname` reaches the layout on every navigation (required for the `<Nav aria-current>` AC). The original 1-3 matcher was `['/']` (narrow, only for the 308 redirect trigger). Widening it to `['/:path*']` does NOT change the 308 redirect behavior — the redirect trigger (`nextUrl.pathname === '/' && searchParams.get('for') === 'recruiter'`) is independent of the matcher, so the redirect only fires for the canonical-share form. The matcher is broader than the redirect trigger, not the other way around. Asset, API, and static-file requests stay outside the edge runtime's intercept because Next.js's matcher syntax (`/:path*`) only matches page navigations, not `/_next/*` or `/api/*`.
- **Why the layout uses `metadataBase: new URL('https://sanjit.dev')`:** Next.js 16's metadata API requires an absolute `metadataBase` for OG/Twitter card image resolution; without it, child route `openGraph.images` paths would resolve relative to the request URL (which is `http://localhost:3000` in dev — incorrect). Setting the production base once at the layout level cascades correctly to all child routes.
- **Why the `<footer>` ships empty in 1-9:** The "For recruiters?" footer link is owned by 1-11 per the epic-1-context.md line 40 cross-story table. The footer landmark itself is required by AD-20 + UX-DR1 ("every public route must have semantic landmarks") so it ships in 1-9 with `role="contentinfo"` + `aria-label="Site footer"`. 1-11 fills the body content; this story establishes the structural placeholder.
- **Why `<SkipToContent>` is deferred (not shipped in this story):** The 1-9 AC list explicitly names `<SkipToContent>` as a deliverable, but the spec split (chosen at step-02 token-count check) carved it off to keep this spec under the 1,600-token SCOPE STANDARD. `<SkipToContent>` is a 10-line `"use client"` component with zero behavior (pure CSS `:focus` reveal) — splitting it off keeps the main goal (layout + landmarks + beacons) focused on the FR-19 blocker for 1-11. The deferred-work.md entry this story appends documents the deferral and names the natural future owner. AD-13 closed-set invariant is preserved at 9 → 10 transition in the follow-up.
- **Why the cmdk trigger click handler is also deferred:** The trigger ships in 1-7 with `aria-disabled="true"` — a deliberate honesty contract. Wiring the click handler requires either (a) a new client component (AD-13 closed-set discipline rejects a 10th-or-11th file), (b) converting `<Nav>` to a client component (AD-13 violation), or (c) inline `<Script>` event delegation (scope expansion). The deferred-work.md entry this story appends groups cmdk wiring with `<SkipToContent>` as a follow-up story that ships both. Until then, the trigger is keyboard-discoverable via the existing `data-cmdk-trigger` attribute — when a future story wires the keyboard listener, no markup change is required.
- **Why the layout does NOT export `viewport`:** Next.js 16's per-route `viewport` export lives at the route level, not the layout level. 1-11's homepage `viewport` will live in `app/page.tsx`'s export. The layout stays minimal — title template + description + OG defaults.

## Verification

**Commands:**

- `ls components/client/` -- exactly 9 files; `<SkipToContent>` MUST NOT exist.
- `head -1 app/layout.tsx` -- NOT `"use client";` (server component).
- `grep -c "x-pathname" proxy.ts` -- ≥ 2 (one set, one read-or-comment).
- `grep -c "id=\"main\"" app/layout.tsx` -- 1 (only `<main id="main">`).
- `grep -c "role=\"contentinfo\"" app/layout.tsx` -- 1 (the footer).
- `grep -c "<html lang" app/layout.tsx` -- 1.
- `grep -c "import './globals.css'" app/layout.tsx` -- 1.
- `pnpm audit:tokens` -- exit 0; layout consumes only `var(--bg)` / `var(--fg)` / `var(--font-sans)` (closed AD-18 tokens).
- `pnpm typecheck` -- exit 0; `headers().get('x-pathname')` typechecks; `<Nav currentPath={...}>` typechecks.
- `pnpm build` -- exit 0; layout compiles; `x-pathname` header setter in proxy.ts compiles.
- `pnpm start` (or `pnpm dev`) and `curl -sI http://localhost:3000/` -- response includes 200 OK; the layout-rendered HTML has Tailwind utilities applied (visible at the browser via DevTools "Computed Styles" panel).

**Manual checks:**

- Open `app/layout.tsx` -- imports `globals.css` first; imports the 3 client components + `<Nav>` + `headers`; exports `metadata` with title template; renders `<html lang="en"><body className="min-h-screen bg-bg text-fg antialiased font-sans"><AnalyticsBeacon /><ErrorBeacon /><Nav currentPath={...} /><main id="main">{children}</main><footer role="contentinfo" aria-label="Site footer" /></body></html>`.
- Open `proxy.ts` -- the 308 redirect + matcher are unchanged; the new line `requestHeaders.set('x-pathname', nextUrl.pathname)` is present; both `NextResponse.next()` and `NextResponse.redirect()` calls pass the headers object.
- Open `http://localhost:3000/` in a browser -- the page renders with the dark `--bg` background, the sticky nav at the top, the magnetic CTA in the nav right-region, the scroll-progress bar at the bottom edge of the nav. Open DevTools → Elements → confirm `<html lang="en">` + `<header role="banner">` + `<nav aria-label="Primary">` + `<main id="main">` + `<footer role="contentinfo" aria-label="Site footer">` are all present. Open DevTools → Network → confirm `<script>` for Plausible + Sentry-stub loads with `strategy="lazyOnload"` (after first paint).
- Open `http://localhost:3000/work` in a browser (any non-homepage route) -- the "Work" link in the nav shows `aria-current="page"` (verified via DevTools accessibility tree). The "Home" link does NOT show `aria-current="page"`.
- Open `http://localhost:3000/?for=recruiter` in a browser -- the request 308-redirects to `/recruiter` (proxy redirect unchanged); the response `Location:` header points at `/recruiter`. Visit `/recruiter` -- the "Recruiter" link in the nav shows `aria-current="page"`.
