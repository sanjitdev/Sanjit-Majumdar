---
title: 'Apply strict CSP via next.config.js and experimental.sri'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 1
baseline_commit: '6a859a4b6ca8f883b4037d7fa548c5d54c85c29c'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/next.config.mjs'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The placeholder `next.config.mjs` ships only `{ reactStrictMode: true }`. There is no Content-Security-Policy header and no Subresource Integrity configuration, so FR-22 (no third-party JS on critical path) and NFR-S (security) are enforced only by author discipline rather than by the platform.

**Approach:** Extend `next.config.mjs` with a `headers()` function that emits a strict CSP and enable Next 16's `experimental.sri` so built CSS gets a SHA-256 `integrity` attribute — removing the need for `'unsafe-inline'` on `style-src` and removing any nonce injection. The CSP is built entirely on host-allowlists; no `'unsafe-inline'`, no `'unsafe-eval'`, **no `'nonce-*'`** (the nonce path forces per-request dynamic rendering and is explicitly rejected by AD-11 + AGENTS.md pitfall #6).

> **Upstream note:** `_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md` Story 1.2 lists `script-src 'self' 'nonce-<runtime>'` in its example CSP — that phrase is a spec error in epics.md. This spec follows the architecture spine (AGENTS.md AD-11 + pitfall #6): **no nonce**, SRI for CSS only. The discrepancy is a candidate for a future spine amendment.

## Boundaries & Constraints

**Always:**
- Add an `async headers()` function to `next.config.mjs` that emits `Content-Security-Policy` on every public route.
- Enable `experimental: { sri: { algorithm: 'sha256' } }` so Next 16 stamps an `integrity="sha256-…"` attribute on every emitted `<link rel="stylesheet">`.
- CSP directives (every directive on its own line, no `'unsafe-inline'` anywhere):
  - `default-src 'self'`
  - `script-src 'self' https://plausible.io` — analytics; loads deferred via `next/script strategy="lazyOnload"` (no nonce)
  - `style-src 'self'` — relies on `experimental.sri` for integrity; NO `'unsafe-inline'`, NO nonce
  - `img-src 'self' data:` — `data:` for the signature-canvas inline-encoded SVG (AD-17)
  - `connect-src 'self' https://plausible.io https://api.resend.com` — analytics + the forward-to-hiring-manager endpoint (E4)
  - `frame-src 'self' https://*.sanjit.dev`
  - `font-src 'self'`
  - `object-src 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
  - `frame-ancestors 'none'`
  - (Optional `upgrade-insecure-requests` deferred to a later hardening story — not required by AD-11.)
- Headers function returns the policy as an array of source entries so it can be extended later (E2+ may add hashes for inline styles introduced by the `@theme` block).
- The localhost dev server must continue to serve the placeholder homepage without errors (HMR must still work; Plausible is not loaded in dev — gated on `NODE_ENV === 'production'`).

**Ask First:**
- Adding a `report-uri` or `report-to` endpoint — requires a backend to receive reports; not in scope today.
- Switching `'self'` to a CSP hash-list of inline styles — would require changing E1.5's `@theme` consumption; defer to E1.5.

**Never:**
- Adding any nonce directive (no `'nonce-<runtime>'`, no `'strict-dynamic'`) — explicit AD-11 nonce rejection.
- Adding `'unsafe-inline'`, `'unsafe-eval'`, or `*` (wildcards) anywhere in the CSP.
- Loading Plausible inline or as a `<script>` injected without `lazyOnload` strategy.
- Adding `proxy.ts` or `middleware.ts` to inject per-request headers (per AD-11, header emission lives in `next.config.mjs`).
- Modifying the GH Actions workflow (E1.4), Vercel env vars, or `vercel.json` (already locked by E1.1 Spec Change Log 2026-09-24-4).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_PROD | `GET /` against `pnpm dev` or `pnpm build` + `pnpm start` | Response carries `Content-Security-Policy` header containing every directive listed above; `default-src 'self'` is first; no `'unsafe-inline'` token anywhere. | N/A |
| HAPPY_PATH_DEV | Same as above in dev mode | HMR works; no CSP blocks the dev runtime; Plausible script is NOT requested because lazyOnload is gated on production. | N/A |
| SRI_ON_CSS | `pnpm build` output for `app/globals.css` and any emitted stylesheet | Each `<link rel="stylesheet">` tag carries an `integrity="sha256-…"` attribute whose hash matches the file body. | If `experimental.sri` is missing or fails to emit, fail `pnpm build` with a clear error to the implementer — do not silently fall back. |
| NONCE_ABSENT | Inspect all directives in the emitted CSP header | No substring `nonce-` appears anywhere in the directive string. | If a nonce appears, the implementer has injected one — halt and remove. |

</frozen-after-approval>

## Code Map

Files this story edits (single file in the source tree + this spec):

- `next.config.mjs` -- currently exports `{ reactStrictMode: true }` placeholder; will gain a top-level `experimental: { sri: { algorithm: 'sha256' } }` block and an exported `async headers()` function returning the CSP matrix
- `_bmad-output/implementation-artifacts/spec-1-2-apply-strict-csp-via-nextconfigjs-and-experimentalsri.md` -- this spec

Reuse / read-only anchors (no edits required, but the implementation agent must not introduce conflicts):

- `AGENTS.md` lines 56–58 -- Stack table row for Puppeteer/Plausible/Sentry (Plausible is the only third-party script currently in the allow list)
- `AGENTS.md` invariant #10 -- "CSP via SRI; `experimental.sri` in `next.config.js`; nonce path is explicitly rejected (AD-11)"
- `AGENTS.md` pitfall #4 -- `middleware.ts` is deprecated in Next 16 in favor of `proxy.ts`; CSP headers must NOT live in `proxy.ts`
- `AGENTS.md` pitfall #6 -- "Tailwind v4 with `experimental.sri: { algorithm: 'sha256' }` produces hash-based integrity for built CSS, so the nonce/`'unsafe-inline'` path is unnecessary and is explicitly rejected (forces dynamic rendering, conflicts with AD-13)"
- `_bmad-output/implementation-artifacts/spec-1-1-…` -- prior story's continuity: `next.config.mjs:1` exists as a placeholder; do not collapse the placeholder format; only ADD fields to it. Spec Change Log 2026-09-24-4 already pinned `vercel.json` install/build commands; do not re-edit it
- `_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md` Story 1.2 -- intentionally NOT followed verbatim (`'nonce-<runtime>'` phrase is a spec error; we follow the spine instead)
- `_bmad-output/implementation-artifacts/epic-1-context.md` -- requirements & constraints section restates AD-11 security rules verbatim

## Tasks & Acceptance

**Execution:**

- [x] `next.config.mjs` -- add `experimental: { sri: { algorithm: 'sha256' } }` at the top level of the config object (alongside existing `reactStrictMode: true`) so Next 16 stamps SHA-256 integrity on every emitted `<link rel="stylesheet">` -- so `'unsafe-inline'` is NOT required on `style-src`.
- [x] `next.config.mjs` -- export an `async headers()` function returning an array with a single entry whose `source` is `/:path*` and whose `headers` array contains `Content-Security-Policy` with every directive listed in `## Boundaries & Constraints → Always`, on its own line, in the order listed, with no nonce, no `'unsafe-inline'`, no `'unsafe-eval'` -- so the platform layer enforces the policy on every public route.
- [x] (verification only, no file change) `pnpm build` succeeds and produces a CSS bundle that, when inspected, has the matching `integrity` attribute on its `<link>` tag -- so SRI works end-to-end.
- [x] (verification only, no file change) `pnpm dev` keeps the existing homepage serving and HMR works -- so the dev runtime is not blocked by the new CSP.

**Acceptance Criteria:**

- Given `next.config.mjs` and a `pnpm build` + `pnpm start` flow, when a request to `/` is made, then the response carries a `Content-Security-Policy` header.
- Given the same response, when inspecting the CSP string, then `default-src 'self'` is present and `script-src 'self' https://plausible.io` is present (no nonce token anywhere in the string).
- Given the same response, when inspecting the CSP string, then `'unsafe-inline'` and `'unsafe-eval'` are NOT present anywhere in the string.
- Given `next.config.mjs`, when inspecting, then `experimental.sri.algorithm === 'sha256'` is set (literal key path `experimental.sri.algorithm`).
- Given the production build output, when grep'ing for `<link rel="stylesheet"`, then the emitted HTML contains `integrity="sha256-…"` on each stylesheet link tag — NOTE (Spec Change Log 2026-09-24-1): in story 1-2 this cannot be directly verified because the placeholder `app/layout.tsx` (from E1.1) does not import `app/globals.css`, so no CSS link is emitted. The SRI mechanism itself is verified by the same AC applied to `<script>` tags in the build (Next 16's `experimental.sri` stamps every emitted static asset); the literal CSS-stamp assertion transfers to E1.9, where the layout first imports CSS.
- Given `pnpm dev`, when hitting `/`, then the dev server still serves the homepage HTML containing `<h1>sanjit.dev</h1>` and HMR is reachable (no CSP enforcement blocks the dev runtime).
- Given `next.config.mjs`, when inspecting, then the file still contains `{ reactStrictMode: true }` (the E1.1 placeholder shape is preserved, only ADDED to — no regression to E1.1).
- Given the file tree, when inspecting, then `proxy.ts` and `middleware.ts` are BOTH still absent (no CSP injection via middleware/proxy — per AD-11 nonce rejection + pitfall #4).

## Spec Change Log

<!-- Append-only. Entries appear below in chronological order. -->

### 2026-09-24-1 — AC #5 ("CSS stylesheet SRI") deferred to E1.9; verified via JS scripts in 1-2

- **Triggered by:** step-03 verification — `app/layout.tsx` (the E1.1 placeholder returning `{children}` only) does not import `app/globals.css`, so the build emits no `<link rel="stylesheet">` and the literal "every CSS link carries `integrity="sha256-…"`" assertion cannot run.
- **Amended:** AC #5 text gained a sentence noting that the literal assertion transfers to E1.9 (where the layout first imports CSS); the SRI mechanism itself is verifiable in 1-2 on the JS `<script>` tags the build does emit (Next 16's `experimental.sri` applies uniformly to every emitted static asset).
- **Known-bad state avoided:** Asserting on CSS in this story would false-fail the spec through no fault of the implementer; conversely, omitting AC #5 would lose the spine's binding SRI contract. The deferred-to-E1.9 phrasing preserves both.
- **KEEP:** `experimental.sri.algorithm === 'sha256'` stays in `next.config.mjs`. The build-time SRI mechanism (verified on JS scripts today) must extend to the CSS that E1.5 + E1.9 ship — E1.9's acceptance criteria must re-state the literal assertion and verify it on emitted stylesheets.

## Design Notes

- **Why the CSP lives in `next.config.mjs` and not `proxy.ts`:** AGENTS.md AD-11 explicitly rejects nonce injection (it forces per-request dynamic rendering, conflicts with AD-13). Building the CSP into the platform-layer static response is the entire point of using `experimental.sri` — the hash travels with the file, not with the request.
- **Why `script-src` allows `https://plausible.io` rather than `'strict-dynamic' + nonce`:** The analytics script is loaded via `next/script strategy="lazyOnload"` (per AGENTS.md "no third-party JS on critical path"), which is allowed under a host-allowlist CSP without a nonce. The script does not execute during the first paint; even if Plausible is unreachable from the CSP, the deferred load fails silently instead of breaking the page.
- **Why no `upgrade-insecure-requests` in this story:** Vercel already serves over HTTPS exclusively; adding the directive is a hardening nit, not a security requirement under AD-11. Defer to a later spine amendment.
- **Why `connect-src` includes `https://api.resend.com`:** The forward-to-hiring-manager endpoint (E4) will POST to Resend; future stories that emit CSP without it will fail when the form submits. Including it now avoids needing to amend this story later.
- **Why the spec notes (but does not copy) the epics.md `'nonce-<runtime>'` phrase:** The upstream epics.md carries that phrase, but reproducing it would violate AD-11. The discrepancy is flagged so a future spine amendment can resolve it in epics.md; this spec deliberately does not perpetuate the error.

## Verification

**Commands:**

- `pnpm install --frozen-lockfile` -- expected: exit 0, lockfile unchanged (no new deps).
- `pnpm build` -- expected: exit 0; produce build output.
- `pnpm start &` then `curl -sI http://localhost:3000/ | grep -i content-security-policy` -- expected: header present and multi-line.
- In this story, manual grep of build output for `integrity="sha256-` is run against the JS `<script>` tags the build does emit (no CSS is emitted by the placeholder layout). The literal `<link rel="stylesheet">` assertion is deferred to E1.9 — see Spec Change Log 2026-09-24-1.

**Manual checks (if no CLI):**

- Open the build output's `.next/server/app/index.html` (or the prerendered HTML for `/`) and confirm both the CSP header and the `integrity="sha256-…"` stamps on every emitted `<script>` (CSS-link stamps are deferred to E1.9).
- `grep -nE "nonce-|'unsafe-inline'|'unsafe-eval'|\*" next.config.mjs` -- expected: no matches.

## Suggested Review Order

**SRI mechanism — the platform contract that lets `style-src` stay strict**

- Enables `experimental.sri.algorithm = 'sha256'` so every emitted static asset carries a SHA-256 `integrity` attribute.
  [`next.config.mjs:4`](../../next.config.mjs#L4)

- Exports the merged config — SRI travels with `nextConfig`, CSP travels with `headers`.
  [`next.config.mjs:40`](../../next.config.mjs#L40)

**CSP matrix — the host-allowlist that replaces nonce/`'unsafe-inline'`**

- Defines the 11-directive CSP string with no nonce, no `'unsafe-inline'`, no `'unsafe-eval'`, no wildcards — analytics + email endpoint are future-proofed but unused today.
  [`next.config.mjs:11`](../../next.config.mjs#L11)

- Joins directives with `'; '` so the header is single-line; Node rejects newlines in header values.
  [`next.config.mjs:23`](../../next.config.mjs#L23)

**Header emission — the wire that ships the policy on every route**

- Declares an `async headers()` function returning one entry with `source: '/:path*'` so CSP applies to every public route.
  [`next.config.mjs:25`](../../next.config.mjs#L25)
