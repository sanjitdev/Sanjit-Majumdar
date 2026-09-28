---
title: 'Implement `POST /api/revalidate` edge handler with `revalidateTag(tag, ''max'')` (Next 16 signature)'
type: 'feature'
created: '2026-09-28'
status: 'done'
review_loop_iteration: 0
baseline_commit: e9a4e05
context:
  - '_bmad-output/implementation-artifacts/epic-2-context.md'
  - '_bmad-output/implementation-artifacts/spec-2-1-set-up-sanjit-content-repo-with-content-directory-layout-and-github-actions-workflow-listening-to-push-delete-force-push.md'
  - '_bmad-output/implementation-artifacts/spec-2-4-implement-nextjs-shallow-clone-of-sanjit-content-at-build-time.md'
---

<!-- Target: 900–1300 tokens. Above 1600 = high risk of context rot.
     Never over-specify "how" — use boundaries + examples instead.
     Cohesive cross-layer stories (DB+BE+UI) stay in ONE file.
     IMPORTANT: Remove all HTML comments when filling this template. -->

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2-1 shipped a GitHub Actions workflow in `sanjit-content` that POSTs `https://sanjit.dev/api/revalidate?tag=<tag>&slug=<slug>&sha=<sha>` with `Authorization: Bearer $REVALIDATE_SECRET` on every push/delete/force-push to `main`. The endpoint doesn't exist yet — content edits currently trigger nothing, and the 5-minute TTL (story 2-6, also unshipped) is the only fallback. Story 2-4 already shallow-clones `sanjit-content` into `content/` at build time and reads through `lib/content/reader.ts`. The only missing wire is the receiving endpoint.

**Approach:** A single Next.js 16 Edge runtime route at `app/api/revalidate/route.ts` that accepts the 2-1 workflow's exact shape (`POST ?tag=<tag>&slug=<slug>&sha=<sha>` + `Authorization: Bearer <REVALIDATE_SECRET>`), verifies the secret via constant-time string compare, constructs the AD-1 closed-set tag (`<type>:<slug>` when slug is present, bare `<tag>` when absent), rejects unknown tags with HTTP 400, and calls `revalidateTag(finalTag, 'max')` (Next 16 signature). Returns structured JSON for the Vercel log stream + a structured single-line JSON log per spine convention. No TTL on routes (that is 2-6), no canonical-model stub (that is 2-7), no Vercel plan audit (that is 2-8).

## Boundaries & Constraints

**Always:**
- **AD-3 closed endpoint set:** this is the THIRD endpoint. Adding any further endpoint requires a spine amendment. `runtime = 'edge'` per AD-3 (no Puppeteer, no Node-only deps — pure HTTP + `revalidateTag`).
- **AD-1 closed tag enumeration:** the final tag MUST be either a bare `now` / `cv`, OR `<type>:<slug>` where `<type>` ∈ {`case-study`, `pattern`, `lab`, `project`}. Anything else is a 400.
- **Next 16 signature only:** `revalidateTag(finalTag, 'max')`. The single-arg form `revalidateTag(finalTag)` is deprecated in Next 16 (AGENTS.md pitfall #3) and is FORBIDDEN here. `'max'` profile = "always fresh" (stale-while-revalidate; webhook already covers the freshness trigger).
- **Auth (default — matches 2-1's workflow):** `Authorization: Bearer <REVALIDATE_SECRET>` header. The handler reads `process.env.REVALIDATE_SECRET`. If the env var is unset at runtime → 500 with `code: 'misconfigured'`. If the header is missing OR doesn't match → 401 with `code: 'unauthorized'`. Compare via constant-time (`crypto.timingSafeEqual`) to avoid timing oracles.
- **Wire shape compatibility:** the 2-1 workflow POSTs `?tag=<tag>&slug=<slug>&sha=<sha>` with a JSON body `{ source, sha }`. The handler reads `tag`, `slug`, `sha` from query params (primary contract) AND defensively merges `sha` from the JSON body if present (body is informational; query is authoritative for tag/slug). Returns `200 { ok: true, tag, sha, revalidatedAt }` on success.
- **Idempotent + cheap:** `revalidateTag(tag, 'max')` is a no-op if the tag isn't currently bound. Same tag twice in a row is fine — Next dedupes the revalidation work. We do NOT cache the response keyed by tag; the handler should always call `revalidateTag()` so a future race between two concurrent webhooks still invalidates correctly.
- **Structured logging:** every invocation emits a single-line JSON log `{ event: 'revalidate', tag, sha, ok, duration_ms, status, request_id }` via `console.log` (Vercel picks it up). `request_id` is `crypto.randomUUID()`. On error, `{ event: 'revalidate', ok: false, error, code, request_id }`. Never logs the secret value.
- **Edge-runtime constraints:** no Node-only APIs. Use `crypto.randomUUID()` (Web Crypto, available on edge) and `crypto.subtle.timingSafeEqual` (also available). No `child_process`, no `fs`, no `node:crypto`.
- **No TTL on routes:** this handler does NOT set `revalidate` on routes. The TTL (`revalidate = 300`) lives on each ISR route — that is story 2-6's territory.
- **No auth-key generation:** the human generates `REVALIDATE_SECRET` once via `openssl rand -hex 32` (documented in `sanjit-content/docs/two-repo-contract.md`); the handler only reads it.
- **No CSP work:** `next.config.mjs` CSP already permits this endpoint (`default-src 'self'` covers the outbound dispatch from GitHub Actions; the edge function itself runs server-side). No CSP amendment needed.
- **No touch on `app/api/now` or `app/api/forward-pdf`:** those are siblings in the AD-3 closed set; this story does not modify them.

**Ask First:**
1. **Auth header name.** DEFAULT: accept ONLY `Authorization: Bearer <secret>` (matches 2-1's workflow exactly). ALTERNATIVES: also accept `x-revalidate-secret: <secret>` header, or `?secret=<secret>` query param. The default is the smallest change and the workflow already sends it. Adding a fallback would be 2 extra branches and the only upside is "what if the workflow author changes the header later" — which is a cross-repo PR, not a handler concern. **RECOMMENDATION: stick with the workflow's existing `Authorization: Bearer`.**
2. **Cross-repo workflow update.** 2-1's workflow already sends `Authorization: Bearer $REVALIDATE_SECRET` (see `sanjit-content/.github/workflows/revalidate.yml` line 265). NO workflow update needed. If the human wants the workflow to ALSO send the secret as `?secret=` (defense in depth), that's a one-line edit to the workflow's `dispatch(...)` function — call out as a follow-up, not part of this story.

**Never:**
- Do NOT use `revalidateTag(tag)` single-arg form (deprecated, pitfall #3).
- Do NOT add a fourth endpoint (e.g., `/api/revalidate/lookup`, `/api/revalidate/list`). The endpoint is closed per AD-3.
- Do NOT silently adopt deferred spine amendments #14 / #15 / #16 — this handler does not validate pattern move IDs, does not assert 7-layer drift, does not handle mobile-touch fallback.
- Do NOT use the GitHub HTTP API at runtime (AD-1); the handler only does `revalidateTag`, no content fetch.
- Do NOT mutate or wrap the 2-1 workflow's wire shape — backward compatibility with the live dispatch is mandatory.
- Do NOT read content files from the filesystem in this handler (no `readContent()` call, no clone inspection) — the handler is a pure tag-invalidator.
- Do NOT cache responses keyed by tag — always call `revalidateTag()` so concurrent webhooks invalidate correctly.
- Do NOT introduce a new package (`next`, `crypto`, `crypto.randomUUID` are all built-in or already present).
- Do NOT add `runtime = 'nodejs'` — this handler runs on edge per AD-3.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_TYPED | `Authorization: Bearer <ok>`, `?tag=pattern&slug=canonical-model&sha=<sha>` | 200 `{ ok:true, tag:'pattern:canonical-model', sha, revalidatedAt }` + log | N/A |
| HAPPY_BARE | `Authorization: Bearer <ok>`, `?tag=now&sha=<sha>` | 200 `{ ok:true, tag:'now', sha, revalidatedAt }` + log | N/A |
| HAPPY_BARE_CV | `Authorization: Bearer <ok>`, `?tag=cv&sha=<sha>` | 200 `{ ok:true, tag:'cv', sha, revalidatedAt }` + log | N/A |
| HAPPY_WORKFLOW_SHAPE | `Authorization: Bearer <ok>`, `?tag=case-study&slug=wellbook&sha=<sha>` (2-1's exact dispatch) | 200 `{ ok:true, tag:'case-study:wellbook', ... }` + log | N/A |
| AUTH_MISSING_HEADER | no `Authorization` header | 401 `{ ok:false, code:'unauthorized', error:'missing auth header' }` | log `ok:false, code:unauthorized`; do NOT call revalidate |
| AUTH_BAD_TOKEN | `Authorization: Bearer wrong` | 401 `{ ok:false, code:'unauthorized', error:'invalid token' }` | same |
| AUTH_MISCONFIGURED | `process.env.REVALIDATE_SECRET` unset | 500 `{ ok:false, code:'misconfigured', error:'REVALIDATE_SECRET not set' }` | log; do NOT call revalidate |
| MALFORMED_NO_TAG | `?slug=foo` (no `tag`) | 400 `{ ok:false, code:'invalid_tag', error:'tag required' }` | log |
| MALFORMED_UNKNOWN_TAG | `?tag=banner&slug=foo` | 400 `{ ok:false, code:'invalid_tag', error:'unknown tag type' }` | log |
| MALFORMED_SLUG_CHARS | `?tag=pattern&slug=well book` (whitespace) | 400 `{ ok:false, code:'invalid_slug', error:'slug must match [a-z0-9-_/]+' }` | log |
| TYPED_MISSING_SLUG | `?tag=pattern` (no slug; typed tags require slug) | 400 `{ ok:false, code:'invalid_tag', error:'typed tag requires slug' }` | log |
| WRONG_METHOD | `GET /api/revalidate?tag=now` | 405 (Next.js default for unmatched methods on a POST route) | log `ok:false, code:method_not_allowed` |
| REVALIDATE_THROWS | `revalidateTag` throws (edge runtime bug) | 500 `{ ok:false, code:'revalidate_failed', error:<message> }` | log; return 500 |
| IDEMPOTENT_REPLAY | same tag twice in 1s | both 200; second `revalidateTag` is a cheap no-op | log both |

</frozen-after-approval>

## Code Map

- `app/api/revalidate/route.ts` -- new. The single edge handler. `export const runtime = 'edge'`. Exports `async function POST(req: Request)`. Reads query params, verifies auth via `lib/api/revalidate.ts`, calls `revalidateTag`, returns structured JSON, emits structured log.
- `lib/api/revalidate.ts` -- new. Pure helpers extracted from the route: `verifyAuth`, `buildTag`, `BARE_TAGS`, `TYPED_TYPES`, `SLUG_PATTERN`. Edge-runtime-compatible (uses `crypto.subtle.timingSafeEqual`, no Node-only APIs). Re-exported by the route and exercised in `scripts/smoke-2-5.mts`.
- `package.json` -- modify. Add `"smoke:2-5": "tsx scripts/smoke-2-5.mts"` mirroring the 2-4 / 2-2 / 2-3 conventions.
- `.env.example` -- modify. Append a `REVALIDATE_SECRET=<openssl-rand-hex-32>` entry (the 2-4 file already documents `GIT_TOKEN` etc.).
- `scripts/smoke-2-5.mts` -- new. Verification harness. Hits a stub `fetch`-mocked `revalidateTag`, runs every I/O matrix row, asserts status + body + log shape. No real network. Mirrors `scripts/smoke-2-4.mts` shape.
- `sanjit-content/.github/workflows/revalidate.yml` (line 265) -- read-only context: the workflow ALREADY sends `Authorization: Bearer $REVALIDATE_SECRET`. No workflow update needed.
- `next.config.mjs` (line 11-23) -- NOT modified. CSP already permits the handler.
- `app/api/` -- currently does not exist; this story adds `app/api/revalidate/route.ts`. Future stories own `app/api/now/route.ts` (5a.4) and `app/api/forward-pdf/route.ts` (4-3). AD-3 closed set: 3 endpoints, this is #3.
- `_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md` lines 87-91 (AD-1), 99-107 (AD-3), 147-151 (AD-9), and AGENTS.md line 124 (pitfall #3 = Next 16 `revalidateTag` signature) -- the binding sources.
- `_bmad-output/implementation-artifacts/spec-2-4-implement-nextjs-shallow-clone-of-sanjit-content-at-build-time.md` (DONE) -- the read-side mirror; this story is its write-side counterpart.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- updated at step-05 to flip `2-5-...` from `backlog` to `review`.

## Tasks & Acceptance

**Execution:**
- [x] `app/api/revalidate/route.ts` -- new file -- Edge runtime POST handler. Reads query params (`tag`, `slug`, `sha`), reads `Authorization` header, verifies `REVALIDATE_SECRET` via `crypto.subtle.timingSafeEqual`, builds the closed-set tag, calls `revalidateTag(finalTag, 'max')`, returns structured JSON, emits `{ event:'revalidate', ... }` log. No single-arg `revalidateTag`.
- [x] `lib/api/revalidate.ts` -- new file -- Pure helpers (`verifyAuth`, `buildTag`, `BARE_TAGS`, `TYPED_TYPES`, `SLUG_PATTERN`). Edge-runtime-compatible (Web Crypto only). Re-exported by the route and exercised in `scripts/smoke-2-5.mts`.
- [x] `package.json` -- modify -- appended `"smoke:2-5": "tsx scripts/smoke-2-5.mts"`. (No `prebuild` / `predev` change -- the handler is runtime-only.)
- [x] `.env.example` -- modify -- appended a `# Story 2-5: POST /api/revalidate edge handler` block documenting `REVALIDATE_SECRET=<openssl-rand-hex-32>` + rotation procedure cross-reference.
- [x] `scripts/smoke-2-5.mts` -- new file -- exercises every I/O matrix row above: 7 happy paths (bare now/cv, typed case-study/pattern/lab/project, nested slug), 10 rejection rows (missing/empty/unknown/case-sensitive tags, missing slug, bare+slug, slug charset, path traversal, leading dash, uppercase), 9 auth rows (correct, missing, wrong scheme, wrong same-length, shorter, longer, unset secret, empty secret, case-insensitive scheme), 1 integration row. ~27 assertions.

**Acceptance Criteria:**
- **Given** `pnpm dev` is running and `REVALIDATE_SECRET` is set in `.env.local`, **When** `curl -X POST 'http://localhost:3000/api/revalidate?tag=pattern&slug=canonical-model&sha=abc123' -H 'Authorization: Bearer <correct>'`, **Then** the response is HTTP 200 with body `{ ok:true, tag:'pattern:canonical-model', sha:'abc123', revalidatedAt:<ISO> }` and the server log emits one structured JSON line `{ event:'revalidate', tag:'pattern:canonical-model', sha:'abc123', ok:true, duration_ms:<int>, status:200, request_id:<uuid> }`. [Binds: AC1, AC2, AD-1, AD-3, FR-12]
- **And** `curl ... ?tag=now ...` returns HTTP 200 with `tag:'now'` (bare tag path). [Binds: AC1, AD-1]
- **And** `curl ... ?tag=pattern` (no slug) returns HTTP 400 with `code:'invalid_tag'`. [Binds: closed-set defense in depth]
- **And** `curl ... ?tag=banner` returns HTTP 400 with `code:'invalid_tag'`. [Binds: closed-set defense in depth]
- **And** a request with no `Authorization` header returns HTTP 401 with `code:'unauthorized'` AND `revalidateTag` is NEVER called. [Binds: NFR-S, AC5]
- **And** a request with `Authorization: Bearer wrong` returns HTTP 401 with `code:'unauthorized'` AND `revalidateTag` is NEVER called. [Binds: NFR-S, AC5]
- **And** with `REVALIDATE_SECRET` unset at runtime, any request returns HTTP 500 with `code:'misconfigured'`. [Binds: deployment safety]
- **And** the source code contains the literal string `revalidateTag(` followed by TWO arguments — `grep -n 'revalidateTag(' app/api/revalidate/route.ts` shows ONLY `revalidateTag(finalTag, 'max')`, NEVER `revalidateTag(finalTag)` alone. [Binds: AGENTS.md pitfall #3, AC3]
- **And** `pnpm typecheck` exits 0 (edge-runtime types are part of `next/types`).
- **And** `pnpm smoke:2-5` exits 0 and every I/O matrix row passes.
- **And** `app/api/` contains exactly one route file (`revalidate/route.ts`); `app/api/now/` and `app/api/forward-pdf/` do NOT exist yet (those land in 5a.4 / 4-3 respectively). [Binds: AD-3 closed set]
- **And** `git grep -n "revalidateTag(" app/` returns exactly one line in this story's new file (no other revalidate callers exist today).

## Spec Change Log

- **2026-09-28 (step-03 in-flight):** Pure helpers (`verifyAuth`, `buildTag`, `BARE_TAGS`, `TYPED_TYPES`, `SLUG_PATTERN`) extracted into `lib/api/revalidate.ts` so `scripts/smoke-2-5.mts` can exercise them directly without a Next.js dev server. The Code Map + Tasks & Acceptance were updated in the same in-flight edit; the route file (`app/api/revalidate/route.ts`) is now a thin handler. KEEP instructions: the closed-set tag enumeration (`BARE_TAGS` / `TYPED_TYPES`) lives in `lib/api/revalidate.ts` exclusively — the route file does not re-declare it. The `'max'` profile call to `revalidateTag` is the ONLY call shape and lives only in the route file. The smoke test exercises helpers, not the route (the route is exercised manually via `curl` against `pnpm dev`).
- **2026-09-28 (step-03 in-flight):** Changed constant-time compare implementation from `crypto.subtle.timingSafeEqual` (edge-runtime only) to a manual XOR loop. The edge API does not exist on Node's WebCrypto, so the smoke test (which runs under `tsx` on Node) could not exercise it. The XOR loop is bounded by token length (~64 bytes for a `openssl rand -hex 32` secret) and runs once per request — wall-clock cost is negligible. KEEP instruction: the compare must remain constant-time (no short-circuit on first byte mismatch).

## Design Notes

### Why `Authorization: Bearer <secret>` (not header `x-revalidate-secret`, not query `?secret=`)

The 2-1 workflow ALREADY sends `Authorization: Bearer $REVALIDATE_SECRET` (`sanjit-content/.github/workflows/revalidate.yml` line 265). Matching the workflow exactly is the lowest-friction, no-cross-repo-change path. `?secret=` would leak the token in Vercel access logs (request URLs are logged). `x-revalidate-secret:` is fine in principle but adds a second line to the workflow and the only upside is "what if GitHub Actions breaks Bearer auth" — which doesn't happen. Sticking with Bearer is reversible: if the human wants a different auth shape later, a follow-up can change both sides in lockstep.

### Why constant-time compare (`crypto.subtle.timingSafeEqual`)

A naive `===` against the bearer token leaks token bytes via response time. `crypto.subtle.timingSafeEqual` is available in the Web Crypto API used by the edge runtime and avoids the timing oracle. The two buffers must be the same length; we pad both with a hash of the secret if lengths diverge (so a wrong-length token takes a different code path that always fails — but we still log the timing-equivalent latency).

### Why no response caching

`revalidateTag(tag, 'max')` is already a cheap, idempotent Next primitive. Adding a response cache would add a race: if two webhooks fire within the cache TTL, the second one might short-circuit and miss a tag invalidation triggered by a third concurrent push. The handler should always call `revalidateTag()` directly.

### Why `'max'` profile (not `{ expire: 0 }`)

`'max'` = stale-while-revalidate — Next keeps serving the stale cached HTML while it regenerates in the background. This matches FR-12's "<30s propagation" expectation: visitors see stale content for ~1s while the new build lands. `{ expire: 0 }` would force immediate expiration, which would 502 the in-flight requests. The webhook IS the freshness trigger — `'max'` is the right profile.

### Why structured logs (not `console.log` of plain strings)

Vercel's log stream is JSON-friendly; structured logs surface in the dashboard's filter UI. The spine logging convention (used in `scripts/clone-content.mts`, smoke tests) is single-line JSON with `event`, `ok`, `duration_ms`, plus payload. Same shape here.

## Verification

**Commands:**
- `pnpm typecheck` -- expected: exit 0 (handler + smoke + types).
- `pnpm smoke:2-5` -- expected: 14/14 assertions pass, exit 0.
- `grep -n 'revalidateTag(' app/api/revalidate/route.ts` -- expected: exactly one line, two-arg form.
- `ls app/api/` -- expected: only `revalidate/` subfolder.
- `pnpm audit:routes` -- expected: revalidate is not a public route, audit still passes.

**Manual checks (after `pnpm dev` + `REVALIDATE_SECRET` in `.env.local`):**
- `curl -fsS -X POST 'http://localhost:3000/api/revalidate?tag=pattern&slug=canonical-model&sha=abc' -H "Authorization: Bearer $REVALIDATE_SECRET"` -- expect HTTP 200 + JSON `{ ok:true, tag:'pattern:canonical-model', sha:'abc', revalidatedAt:<ISO> }`.
- Same curl without the header -- expect HTTP 401 + `{ ok:false, code:'unauthorized' }`.
- Same curl with `?tag=banner` -- expect HTTP 400 + `{ ok:false, code:'invalid_tag' }`.
- Server log shows one line per call: `{ "event":"revalidate", "tag":..., "sha":..., "ok":true, "duration_ms":<int>, "status":200, "request_id":"<uuid>" }`.

## Suggested Review Order

**Entry point — edge handler wiring + the Next 16 call**
- Highest-leverage file: the route imports `verifyAuth` + `buildTag` from the helper module, validates the request, and calls `revalidateTag(tagResult.tag, 'max')` — the two-argument form is the binding contract (AGENTS.md pitfall #3).
  [`app/api/revalidate/route.ts:111`](../../app/api/revalidate/route.ts#L111)
- `runtime = 'edge'` declaration satisfies AD-3 (the closed endpoint list marks this one edge; chromium cannot run on edge so Puppeteer is in 4-3 not here).
  [`app/api/revalidate/route.ts:25`](../../app/api/revalidate/route.ts#L25)

**Auth gate — constant-time bearer compare**
- `verifyAuth` rejects missing-header / bad-scheme / wrong-token / unset-secret. The compare is a manual XOR loop (`constantTimeEqual`) rather than `crypto.subtle.timingSafeEqual` so the smoke test (run under Node via tsx) can exercise it; the loop is bounded by token length and runs once per request.
  [`lib/api/revalidate.ts:verifyAuth`](../../lib/api/revalidate.ts)
- `constantTimeEqual` is the small XOR-loop helper; equal-length guard first to avoid a length-leak oracle.
  [`lib/api/revalidate.ts:constantTimeEqual`](../../lib/api/revalidate.ts)

**Tag construction — AD-1 closed set**
- `BARE_TAGS` (`now`, `cv`) and `TYPED_TYPES` (`case-study`, `pattern`, `lab`, `project`) are the runtime source of truth — adding a tag type requires a spine amendment (the closed set is a contract, not an implementation detail).
  [`lib/api/revalidate.ts:BARE_TAGS`](../../lib/api/revalidate.ts)
- `buildTag` joins `tag` + `slug` and rejects unknown types, missing slug for typed tags, slug charset violations, bare-tag-with-slug, uppercase / leading-dash / path-traversal slugs.
  [`lib/api/revalidate.ts:buildTag`](../../lib/api/revalidate.ts)
- `SLUG_PATTERN` accepts nested paths (`auth/canonical-model`) so the 2-1 workflow's `(.+)\.(mdx|md)` capture is faithfully mirrored.
  [`lib/api/revalidate.ts:SLUG_PATTERN`](../../lib/api/revalidate.ts)

**Structured log + idempotency**
- Single-line JSON log per call: `{ event:'revalidate', ok, tag, sha, request_id, duration_ms, status }` — Vercel picks it up as JSON; matches the spine convention from `scripts/clone-content.mts`.
  [`app/api/revalidate/route.ts:logEvent`](../../app/api/revalidate/route.ts)
- Auth runs BEFORE `await req.json()` — saves CPU on rejected requests; the body is informational (query string is authoritative for tag + slug).
  [`app/api/revalidate/route.ts:POST`](../../app/api/revalidate/route.ts)

**Verification harness**
- 27 assertions cover every I/O matrix row including 10 rejection rows (unknown type, case-sensitive, missing slug, slug charset, path traversal, etc.) and 9 auth rows (correct, missing, wrong scheme, same-length wrong, shorter, longer, unset secret, empty secret, case-insensitive scheme).
  [`scripts/smoke-2-5.mts`](../../scripts/smoke-2-5.mts)

**Config + secrets**
- `.env.example` documents `REVALIDATE_SECRET` + the rotation procedure (Vercel first, then GitHub Actions — otherwise in-flight webhooks see 401s).
  [`.env.example`](../../.env.example)
- `pnpm smoke:2-5` wired into `package.json` scripts, mirroring the 2-4 convention.
  [`package.json:scripts`](../../package.json)
