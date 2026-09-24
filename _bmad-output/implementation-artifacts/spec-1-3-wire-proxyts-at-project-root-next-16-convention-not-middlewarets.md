---
title: 'Wire proxy.ts at project root (Next 16 convention; NOT middleware.ts)'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'dbf31b7958f074e0e92f048e0508fd7c24c5790e'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/next.config.mjs'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Recruiter-mode is canonically a route (`/recruiter`), not client state (AD-8, amended AD-12). The stale-bookmark path `/?for=recruiter*` — the share URL that surfaces in earlier forward emails, talk slide footers, and recruiter notes — must map to `/recruiter*` via a 308 permanent redirect so the bookmark survives forever and the canonical share form is enforced. The redirect must live in `proxy.ts` at the project root (Next 16 convention per AGENTS.md pitfall #4), not in the deprecated `middleware.ts` path, and must not inject any nonce-based CSP (CSP is owned by `next.config.mjs` headers per AD-11).

**Approach:** Add a single `proxy.ts` file at the project root containing a `proxy` function exported as default. The function matches `request.nextUrl.pathname === '/'` AND `request.nextUrl.searchParams.has('for')` with value `'recruiter'`, then returns `NextResponse.redirect(new URL('/recruiter' + remainingSearch, request.url), { status: 308 })`, preserving every other query parameter verbatim. The `/recruiter` route itself is built in E4 (story 4.1); this story only wires the redirect because the recruit-mode canonical-share form is spelled out in AD-8 today and stale bookmarks are already in flight. The proxy runs at the edge by default (`runtime` left implicit), produces no dynamic rendering, and never touches CSP.

## Boundaries & Constraints

**Always:**
- File lives at `proxy.ts` at the project root (Next 16 convention; same layer as `next.config.mjs`, `package.json`).
- Default export is named `proxy` (Next 16's required name; the prior `middleware` name is deprecated).
- Matcher config: a `config = { matcher: ['/'] }` block at the bottom — narrows the proxy to homepage-path requests only so the edge runtime doesn't execute on every asset, API, or static file.
- 308 status (not 301, not 302) — `308 Permanent Redirect` preserves the HTTP method and is the spine-blessed code for the stale-bookmark case per amended AD-12.
- Query-param preservation rule: take `searchParams` from the incoming request, drop only `for` (since it has been consumed by the matcher), pass through every remaining param in their original order. Result target is `/recruiter?<remaining>` — never `/recruiter/` (no trailing slash on the canonical URL).
- Match is exact: `request.nextUrl.pathname === '/'` AND `request.nextUrl.searchParams.get('for') === 'recruiter'`. Any other value of `for` (or absent `for`) must pass through untouched.
- No headers are rewritten, no CSP is injected, no cookies are set — the proxy returns the redirect verbatim.
- No new files beyond `proxy.ts`; no changes to `package.json`, `next.config.mjs`, `app/`, `tsconfig.json`.

**Ask First:**
- Adding additional redirects (e.g. `/?for=*` patterns beyond `recruiter`) — requires a spine amendment because it grows the redirect surface area beyond AD-8.
- Switching the proxy runtime from the default (edge) to `nodejs` — only if a downstream requirement forces it; defer.

**Never:**
- Creating a `middleware.ts` file at the project root (deprecated path; AGENTS.md pitfall #4).
- Adding a nonce- or `'unsafe-inline'`-based CSP via the proxy (CSP lives in `next.config.mjs`; per AD-11 + E1.2 boundary).
- Setting cookies, rewrites, or headers — the proxy's only output is the redirect.
- Matching on a path other than `/` — `/:path*` would over-fire and match assets like `/favicon.ico` if the matcher is broadened.
- Importing server-only modules (DB drivers, Node fs) in `proxy.ts` — keep it edge-safe.
- Returning a 307, 301, 302, or 303 — only 308 carries the permanent + method-preserving semantics the stale-bookmark case needs.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | `GET /?for=recruiter&forward=1&case=wellbook` | 308 redirect to `/recruiter?forward=1&case=wellbook` (Location header); `for` is dropped, others preserved verbatim. | N/A |
| NO_FOR_PARAM | `GET /` | Proxy passes through; Next.js serves the homepage (`<h1>sanjit.dev</h1>` for now, `<Hero>` + `<ProofVectorCluster>` once E1.11 lands) without a redirect. | N/A |
| WRONG_FOR_VALUE | `GET /?for=builder&case=foo` | Proxy passes through (only `for=recruiter` matches). | N/A |
| EMPTY_QUERY | `GET /?for=recruiter` (no extra params) | 308 redirect to `/recruiter` (no trailing `?`). | N/A |
| DEEPER_PATH | `GET /work?for=recruiter` | Proxy passes through — matcher is `/` exact; `/work` is not a stale-bookmark pattern. | N/A |

</frozen-after-approval>

## Code Map

Files this story creates (single new file + this spec):

- `proxy.ts` -- new file at project root; the Next 16 proxy that performs the 308 redirect. ~20 lines.
- `_bmad-output/implementation-artifacts/spec-1-3-wire-proxyts-at-project-root-next-16-convention-not-middlewarets.md` -- this spec.

Reuse / read-only anchors (no edits required, but the implementation agent must not introduce conflicts):

- `AGENTS.md` line 94 -- "Middleware/proxy: `proxy.ts` at project root (Next 16; `middleware.ts` is deprecated). Used for nothing CSP-related (per AD-11 — nonce path rejected)."
- `AGENTS.md` pitfall #4 -- "`middleware.ts` was renamed to `proxy.ts` in Next 16. New code uses `proxy.ts` at project root. `middleware.ts` still works but is deprecated; spine convention is `proxy.ts`."
- `AGENTS.md` invariant #6 -- "Recruiter-mode is a route, not a client state -- `app/recruiter/page.tsx` is an SSG route. `?for=recruiter` URL param maps to this route (canonical share form for the forward artifact)."
- `AGENTS.md` invariant #9 (route invariant in CI) -- later assertable end-to-end; today the proxy is exercised by manual curl.
- `next.config.mjs` -- CSP lives here (E1.2 boundary); proxy must NOT touch Content-Security-Policy.
- `_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 219–227 -- Story 1.3 source (acceptance criteria carried into this spec verbatim where possible).
- `_bmad-output/implementation-artifacts/epic-1-context.md` -- "Recruiter-route stub (amended AD-8 + AD-12)" line: "1.11's footer 'For recruiters?' link must 308-redirect via `proxy.ts` (1.3) to `/recruiter*` even though the `/recruiter` route itself is built in E4."
- `_bmad-output/implementation-artifacts/spec-1-2-…` -- prior story's continuity: `next.config.mjs` owns CSP; proxy is a strictly separate concern; the spec-1-2 boundary "Adding `proxy.ts` or `middleware.ts` to inject per-request headers (per AD-11, header emission lives in `next.config.mjs`)" still holds -- in 1-3, the proxy adds redirects, not headers, so it does not conflict with the 1-2 boundary.

## Tasks & Acceptance

**Execution:**

- [x] `proxy.ts` -- create the file at the project root with `import { NextResponse, type NextRequest } from 'next/server'`, a default-exported async `proxy(request: NextRequest)` function that checks `request.nextUrl.pathname === '/'` AND `request.nextUrl.searchParams.get('for') === 'recruiter'`, builds `new URL('/recruiter', request.url)`, copies `searchParams` from the incoming request into the new URL (excluding `for`), and returns `NextResponse.redirect(target, { status: 308 })` -- so the canonical share form is enforced and stale bookmarks survive.
- [x] `proxy.ts` -- append `export const config = { matcher: ['/'] }` so the edge runtime only executes on requests with pathname `/` -- so asset, API, and static-file requests are not intercepted.
- [x] (verification only, no file change) `pnpm build` succeeds and emits a build log that does not warn about a deprecated `middleware.ts` path -- so the spine convention is honored.

**Acceptance Criteria:**

- Given a running `pnpm start` against a built app, when a `curl -sI 'http://localhost:3000/?for=recruiter&forward=1&case=wellbook'` is issued, then the response carries `HTTP/1.1 308` (or `308 Permanent Redirect`) and a `Location:` header whose value is exactly `/recruiter?forward=1&case=wellbook` (path + remaining params, no trailing slash, no `for=`).
- Given the same curl harness, when `curl -sI 'http://localhost:3000/?for=recruiter'` (no other params) is issued, then the response is `308` with `Location: /recruiter` (no trailing `?`).
- Given the same curl harness, when `curl -sI 'http://localhost:3000/?for=builder'` is issued, then the response is `200` (homepage served unchanged) -- the proxy does not match unrelated `for` values.
- Given the same curl harness, when `curl -sI 'http://localhost:3000/'` is issued, then the response is `200` (homepage served unchanged) -- the proxy does not match requests without `for`.
- Given the file tree, when inspecting, then `proxy.ts` exists at the project root AND no `middleware.ts` file exists at the project root -- so the deprecated path is not introduced.
- Given `proxy.ts`, when inspecting, then the file exports a default function named `proxy` AND `export const config = { matcher: ['/'] }` -- so the new file matches the Next 16 spine convention.
- Given `proxy.ts`, when inspecting source for `nonce-` or `'unsafe-inline'`, then no match -- so CSP is not injected via the proxy (AD-11 boundary with E1.2 holds).
- Given `pnpm build` output, when inspecting build logs, then no warning about `middleware.ts` deprecation appears AND no new dependencies were introduced in `package.json` (the proxy uses Next's built-in `NextResponse`/`NextRequest` only).

## Spec Change Log

<!-- Append-only. Entries appear below in chronological order. -->

## Design Notes

- **Why the proxy returns 308 and not 301:** A stale bookmark like `https://sanjit.dev/?for=recruiter&case=wellbook` is a forward artifact shipped months ago. 301 strips the query string on most browsers and is _not_ method-preserving; 308 preserves both, which is exactly what the share form needs. The spine (epics.md story 1.3 + amended AD-12) explicitly chose 308 for this reason.
- **Why the matcher is `['/']` and not `['/:path*']`:** The `?for=recruiter*` pattern only ever appears on the homepage path. Broader matchers would intercept requests for assets, API routes, and static files, paying edge compute for no behavior change. The narrow matcher keeps the edge runtime budget tight.
- **Why this story ships before `/recruiter` exists (story 4.1):** Stale bookmarks are already in flight — sharing the wrong shape today would force every recruiter to re-ask. Shipping the redirect first means the link they already have never 404s, even during the gap before story 4.1 lands. The placeholder `/recruiter` will simply 404 until then, which is acceptable (better than silently dropping the redirect entirely, which would lose the spine contract).
- **Why `searchParams` is rebuilt rather than reused via `URL` API:** The incoming `searchParams` is a `URLSearchParams` object; iterating it into a fresh `URLSearchParams` (omitting `for`) guarantees preservation of insertion order, multiple-values-per-key edge cases, and percent-encoding round-trip. The `?for=recruiter&forward=1` round-trip via `new URLSearchParams(request.nextUrl.searchParams)` → `delete('for')` → assign-on-new-URL is the canonical idiom in Next 16 proxy examples.

## Verification

**Commands:**

- `pnpm install --frozen-lockfile` -- expected: exit 0, lockfile unchanged (no new deps; proxy uses Next built-ins).
- `pnpm build` -- expected: exit 0; no `middleware.ts` deprecation warning; build log mentions `proxy.ts` (Next 16 surfaces this in its build summary).
- `pnpm start &` then `curl -sI 'http://localhost:3000/?for=recruiter&forward=1&case=wellbook'` -- expected: `HTTP/1.1 308` and `Location: /recruiter?forward=1&case=wellbook`.
- `curl -sI 'http://localhost:3000/?for=recruiter'` -- expected: `308` with `Location: /recruiter` (no trailing `?`).
- `curl -sI 'http://localhost:3000/?for=builder'` -- expected: `200` (homepage unchanged).
- `curl -sI 'http://localhost:3000/'` -- expected: `200` (homepage unchanged).
- `ls proxy.ts && ! ls middleware.ts` -- expected: `proxy.ts` exists; `middleware.ts` is absent.

**Manual checks (if no CLI):**

- Open the build log from `pnpm build` and confirm a single match block for `'/'` is emitted (or, if not surfaced, that no edge-route warnings appear).
- `grep -nE "nonce-|'unsafe-inline'" proxy.ts` -- expected: no matches (CSP boundary holds).

## Suggested Review Order

- Proxy entry point: async `proxy()` default export returns either `NextResponse.next()` or a 308 redirect — the spine-blessed redirect home for stale `?for=recruiter*` bookmarks.
  [`proxy.ts:7`](../../proxy.ts#L7)

- Match predicate: exact-match guard `pathname === '/' && for === 'recruiter'` — anything else passes through untouched, including `?for=builder` and deeper paths like `/work`.
  [`proxy.ts:10`](../../proxy.ts#L10)

- Redirect target construction: `new URL('/recruiter', request.url)` resets path/query cleanly so the rebuild step below is the only source of truth.
  [`proxy.ts:14`](../../proxy.ts#L14)

- Query-param rebuild: copy `URLSearchParams`, drop only `for`, preserve insertion order and multi-value keys via `URLSearchParams.toString()` round-trip.
  [`proxy.ts:18`](../../proxy.ts#L18)

- 308 response: `NextResponse.redirect(target, { status: 308 })` is the method-preserving permanent redirect the spine requires for stale bookmarks.
  [`proxy.ts:23`](../../proxy.ts#L23)

- Narrow matcher: `matcher: ['/']` (NOT `/:path*`) — keeps asset, API, and static-file requests outside the edge runtime's intercept.
  [`proxy.ts:30`](../../proxy.ts#L30)

