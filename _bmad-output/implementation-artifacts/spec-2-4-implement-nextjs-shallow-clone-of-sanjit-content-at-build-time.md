---
title: 'Implement Next.js shallow-clone of `sanjit-content` at build time'
type: 'feature'
created: '2026-09-28'
status: 'in-review'
review_loop_iteration: 0
baseline_commit: d28a2c0
context:
  - '_bmad-output/implementation-artifacts/spec-2-3-implement-content-reader-libcontent-walking-only-status-published.md'
---

<!-- Target: 900–1300 tokens. Above 1600 = high risk of context rot.
     Never over-specify "how" — use boundaries + examples instead.
     Cohesive cross-layer stories (DB+BE+UI) stay in ONE file.
     IMPORTANT: Remove all HTML comments when filling this template. -->

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2-3 shipped `readContent()` which walks a LOCAL directory, but no build step currently produces that directory. Story 2-4 is the missing wire: the Next.js build pipeline must shallow-clone `sanjit-content` into a local `content/` directory before `next build` (and before `next dev` startup), so every later story (2-5 revalidate, 2-6 TTL fallback, 3.x content rendering, 5a.4 /now page) reads from a deterministic local clone — AD-1's single read path.

**Approach:** A small Node script (`scripts/clone-content.mjs`) that shallow-clones `sanjit-content` into `content/` at the project root via `git clone --depth 1` (auth via `GIT_TOKEN` for Vercel, plain HTTPS for local). Wire it into `package.json` as `prebuild` + `predev` lifecycle hooks so `next build` / `next dev` always see a fresh `content/`. Local-dev shortcut: if `content/` already exists AND `SKIP_CLONE=1` is set (or `CONTENT_LOCAL_OVERRIDE=1`), skip the clone — preserves the existing `sanjit-content/` sub-folder workflow. The script then calls `readContent({ contentRoot: 'content' })` from 2-3 and `process.exit(1)` on any diagnostic (AD-5 build-fail contract). `.gitignore` adds an `allow-list carve-out` for `content/` so the cloned tree never accidentally commits.

## Boundaries & Constraints

**Always:**
- AD-1 single read path: the build pipeline produces `content/` locally; no route ever reads from the GitHub HTTP API at runtime. The clone step runs at CODE-REPO build time (AD-9 compliant), not from a content-repo webhook handler — that is 2-5's territory.
- AD-5 build-fail contract: if `readContent(...).diagnostics.length > 0`, the clone script prints every diagnostic line and `process.exit(1)`s. Drafts are tolerated (no diagnostic); malformed `status: published` entries fail the build with a per-file line.
- Shallow clone only: `git clone --depth 1 <repo> <dir>`. No `--no-tags`, no `--single-branch` flags are required (depth 1 is enough). No full history fetch — AD-1's bounded-build-time contract.
- Auth strategy: env var `GIT_TOKEN` is the canonical name. When present, use `https://x-access-token:${GIT_TOKEN}@github.com/<owner>/<repo>.git`. When absent (local dev fallback), use the public `https://github.com/<owner>/<repo>.git` form (assumes the repo will be made public OR the user has git-credential-helper configured for `github.com`).
- Clone destination: `<project-root>/content/`. NOT `node_modules/.cache/` (that lives across builds and is harder to .gitignore). The reader's default `contentRoot` is `'content'`.
- `.gitignore` carve-out: add `content/` to `.gitignore` AND add a `!.gitkeep` allow-list so the empty `content/` directory is preserved in the repo (Next.js sometimes complains about missing dirs). The cloned tree (`case-studies/`, `patterns/`, `lab/`, `projects/`, `now-snapshot.json`, `cv.md`) is implicitly ignored via the `content/` parent rule.
- Pre-flight `rm -rf content/` before clone (idempotent — re-runs do not accumulate stale entries from a previous fetch). The `rm` is scoped to `<project-root>/content/` ONLY, never `sanjit-content/` (that is a separate sub-folder that holds the local dev fixture, not the clone target).
- `package.json` lifecycle: `prebuild` runs the clone; `predev` runs the clone; both invoke `node scripts/clone-content.mjs`. The `build` script stays `next build` (no change).
- Structured logging: the script emits a single-line JSON log on success `{ event: "content.clone", ok: true, duration_ms, source: <url>, dest: <path>, branch: <head-sha-short> }`. On failure, `{ event: "content.clone", ok: false, error: <message>, ... }`. Honors spine logging convention.
- Reuse the existing 2-3 reader: `import { readContent } from '../lib/content/index.ts'` — no parallel walker.

**Ask First:** TWO_ITEMS_SURFACED — both are 2-line decisions that the human should weigh in on. The orchestrator may proceed with the DEFAULTS below if auto-mode is active and the human has not responded; defaults are reversible.
1. **Auth strategy.** DEFAULT: GitHub fine-grained PAT read-only, stored as `GIT_TOKEN` env var on Vercel. ALTERNATIVES: (a) Vercel GitHub App (one-click connect — works for public repos; private repos need a separate GitHub App or deploy key); (b) SSH deploy key in `~/.ssh/id_ed25519` and `GIT_SSH_COMMAND`; (c) make `sanjit-content` public and skip auth entirely. The default (PAT) is the lowest-friction option and works on Hobby + Pro plans.
2. **Local-dev shortcut.** DEFAULT: respect `SKIP_CLONE=1` env var — if set, the clone step logs `{ event: "content.clone", ok: true, skipped: true, reason: "SKIP_CLONE=1" }` and exits 0. This lets `pnpm dev` use the pre-populated `sanjit-content/` content (via a separate symlink or manual `cp -r sanjit-content/content content` step documented in the script's `--help`). ALTERNATIVE: always clone, even if `content/` exists (simpler, but overrides local edits).

**Never:**
- Do NOT touch Story 2-5's `POST /api/revalidate` handler — that's a separate webhook handler, not the clone.
- Do NOT touch Story 2-6's `revalidate: 300` TTL fallback on routes — routes do not exist yet; that lands when content routes ship (E3 onward).
- Do NOT silently adopt deferred spine amendments AGENTS.md #14 (AD-4 move-id validation), #15 (AD-6 + AD-12 7-layer drift), #16 (AD-7 + AD-14 mobile-touch fallback). The clone script does NOT validate `pattern_moves` overrides — that is 3.3's partial mitigation territory.
- Do NOT introduce a new package (no `simple-git`, no `node-fetch`, no `git-clone` dep — `child_process.spawnSync('git', [...])` is sufficient; `git` ships with Vercel's Node 20.9+ build image).
- Do NOT clone into `node_modules/.cache/` (cache eviction would silently re-trigger a remote clone mid-build; fragile).
- Do NOT clone `sanjit-content/` into itself (the sub-folder exists locally for dev; the script must `cd` to project root before computing paths).
- Do NOT add a network call to GitHub's HTTP API from the script (the read path is `git clone`, period — that satisfies AD-1).
- Do NOT use `fetch()` or `axios` to call GitHub (rejected: adds a dep, slower than `git clone --depth 1`, breaks the "build step is a thin shell around `git`" contract).
- Do NOT mutate the parent `sanjit-content/` sub-folder — it's the local dev fixture (story 2-1's repo), not the build target. The clone destination is `<project-root>/content/`, not `sanjit-content/content/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_LOCAL_CLONE | `GIT_TOKEN` absent, `git` available, network OK | Clone lands in `content/`; reader runs; diagnostics 0; exit 0 | N/A |
| HAPPY_VERCEL_CLONE | `GIT_TOKEN=<pat>`, `git` available, network OK | Authenticated clone lands in `content/`; reader runs; exit 0 | N/A |
| SKIP_CLONE_OVERRIDE | `SKIP_CLONE=1` | Logs `skipped: true`, calls reader on existing `content/` (or stub-empty if missing); exit 0 | if reader returns diagnostics, exit 1 (AD-5 still binds) |
| MISSING_GIT_BINARY | `git` not on `$PATH` | Logs `{ ok: false, error: "git not found on PATH" }`; exit 1 | non-recoverable |
| AUTH_FAIL | `GIT_TOKEN` invalid OR repo private and unauthenticated | `git clone` exits non-zero; script captures stderr, logs `{ ok: false, error: <last stderr line> }`; exit 1 | non-recoverable; user fixes token |
| NETWORK_FAIL | Network unreachable mid-clone | `git clone` exits non-zero; script exits 1 with last stderr | non-recoverable |
| CONTENT_DIR_NOT_EMPTY | `content/` exists (from prior run or local fixture) | `rm -rf content/` first, then clone fresh | safe: scoped to project root |
| READER_MALFORMED_PUBLISHED | `readContent(...).diagnostics.length > 0` | Print every diagnostic line; exit 1 (AD-5) | caller sees the per-file shape from story 2-3 |
| READER_NO_PUBLISHED | `readContent(...).published.length === 0` (fresh content repo) | Log `published: 0, drafts: N`; exit 0 (empty repo is valid) | N/A |
| LOCAL_DEV_NO_NETWORK | `SKIP_CLONE=1` set + `content/` already populated | Skips clone; reader runs; exit 0 | N/A |

</frozen-after-approval>

## Code Map

- `scripts/clone-content.mjs` — new. The clone script. Spawns `git clone --depth 1`, removes any stale `content/` first, then imports the 2-3 reader and gates on diagnostics.
- `package.json` — modify. Add `"prebuild": "node scripts/clone-content.mjs"` + `"predev": "node scripts/clone-content.mjs"` (lifecycle hooks fire before `build` / `dev`).
- `.gitignore` — modify. Add `content/` (with `!.gitkeep` allow-list) so the cloned tree never accidentally commits.
- `content/.gitkeep` — new. Empty file to preserve the `content/` directory in the repo before the first clone.
- `.env.example` — new. Documents `GIT_TOKEN=<github-pat-readonly>` for Vercel (NOT `.env` — secrets are never committed).
- `lib/content/reader.ts` (line 263) — reuse point: `readContent({ contentRoot: 'content' })` is the canonical call from the clone script. No changes to the reader itself.
- `lib/content/index.ts` (line 35) — reuse point: `import { readContent } from '../lib/content/index.ts'` from the clone script.
- `sanjit-content/` (project-root sub-folder) — read-only context: this is the local dev fixture from story 2-1. The clone script does NOT touch it. Local devs who want to bypass the clone can `cp -r sanjit-content/content/* content/` and set `SKIP_CLONE=1`.
- `next.config.mjs` — NOT modified. The clone runs via package.json `prebuild` lifecycle, not via a Next.js config hook (keeps the platform config single-purpose: CSP + SRI only).
- `proxy.ts` — NOT modified. The proxy is for runtime request routing, not for build-time hooks.
- `_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 361-369 — canonical AC source for Story 2.4 (the one this spec implements).
- `sanjit-content/.github/workflows/revalidate.yml` — read-only context: the WRITE-side contract that posts to `/api/revalidate`. The clone script is the READ-side mirror of that contract.
- AGENTS.md pitfalls #14, #15, #16 — DO NOT silently adopt any of these; the clone script does not validate `pattern_moves`, 7-layer drift, or mobile-touch fallback.

## Tasks & Acceptance

**Execution:**
- [ ] `scripts/clone-content.mjs` -- new file -- the clone script. Spawns `git clone --depth 1` (auth via `GIT_TOKEN`); `rm -rf content/` first; calls `readContent({ contentRoot: 'content' })`; exits 0 on success, exits 1 on clone error or reader diagnostics (AD-5). Emits a single-line JSON log per the spine convention.
- [ ] `package.json` -- modify -- add `"prebuild": "node scripts/clone-content.mjs"` and `"predev": "node scripts/clone-content.mjs"` to `scripts`. Existing `build` / `dev` stay unchanged.
- [ ] `.gitignore` -- modify -- append a `content/ + !content/.gitkeep` block (around line 282 where `.next/` is; keep alphabetical-ish grouping with the other build/cache ignores). Includes a dated comment.
- [ ] `content/.gitkeep` -- new file -- empty placeholder; preserves `content/` directory in the repo before the first clone runs.
- [ ] `.env.example` -- new file -- documents `GIT_TOKEN=<github-fine-grained-pat-readonly>` for Vercel; same template style as other env-driven configs in the project (none exist today; this is the first).
- [ ] `scripts/smoke-2-4.mts` -- new file -- verification harness. Stubs `git` via a tiny tempdir git repo (so the test does not need network); points the script at it via env-var override of the source URL; asserts success path + skip path + auth-fail path + reader-diagnostic path. Mirrors `scripts/smoke-2-2.mts` + `scripts/smoke-2-3.mts` shape.

**Acceptance Criteria:**
- **Given** a clean clone of the code repo with `git` on `$PATH` and `GIT_TOKEN` set to a valid PAT, **When** `pnpm build` runs, **Then** `scripts/clone-content.mjs` fires before `next build`, lands `content/` populated with `case-studies/`, `patterns/`, `lab/`, `projects/`, `now-snapshot.json`, `cv.md`, and the build proceeds. [Binds: AC1, AC2, AD-1, AD-9]
- **And** the clone is shallow (`--depth 1`) — verified by `git -C content log --oneline | wc -l` returning exactly 1 commit (no history fetched). [Binds: AC2, AD-1 bounded-build-time contract]
- **And** no route handler, page, or layout imports `lib/content` from a path other than the cloned `content/` (i.e., the reader's `contentRoot: 'content'` is the only path) — verified by a grep that finds zero matches for `contentRoot: 'sanjit-content'`. [Binds: AC3, AD-1]
- **And** `.gitignore` contains `content/` and `content/.gitkeep` is tracked — verified by `git check-ignore content/case-studies/wellbook.mdx` exiting 0 (correctly ignored) and `git ls-files content/.gitkeep` listing the file (correctly tracked). [Binds: AD-1, AD-9 no accidental commits]
- **And** `SKIP_CLONE=1 pnpm dev` does not attempt a clone (verified by the absence of `git clone` in the spawned process tree, plus the JSON log line with `skipped: true`). [Binds: local-dev shortcut — Ask-First item 2]
- **And** if the clone produces a malformed published entry (simulated by writing a broken `.mdx` into the test repo), the script exits 1 with the per-file diagnostic line printed (AD-5 build-fail contract). [Binds: AD-5]
- **And** `.env.example` exists at project root, contains `GIT_TOKEN`, and is NOT a real `.env` — verified by `git ls-files .env.example` succeeding and `git check-ignore .env` exiting 0. [Binds: secrets hygiene]
- **And** the smoke test (`scripts/smoke-2-4.mts`) passes every row of the I/O matrix above (HAPPY_LOCAL_CLONE, HAPPY_VERCEL_CLONE, SKIP_CLONE_OVERRIDE, MISSING_GIT_BINARY, AUTH_FAIL, READER_MALFORMED_PUBLISHED, READER_NO_PUBLISHED, LOCAL_DEV_NO_NETWORK). [Binds: verification surface]

## Spec Change Log

## Design Notes

### Lifecycle hook vs `next.config.mjs` hook

Two options for the build invocation:

(a) `package.json` `prebuild` + `predev` lifecycle hooks. Fires automatically before `next build` and `next dev`. Works on Vercel (Vercel runs `pnpm build` which respects the lifecycle). Idiomatic for `pnpm`/`npm` projects.

(b) `next.config.mjs` hook via `experimental.beforeBuild` or a custom plugin. More invasive — would need a Next.js plugin, adds complexity.

**Chose (a).** Lifecycle hooks are the standard npm/pnpm pattern, work on Vercel out of the box (Vercel runs `pnpm install` then `pnpm build`; the `prebuild` script fires automatically), and keep `next.config.mjs` single-purpose (CSP + SRI only).

### Why clone into `content/` (not `node_modules/.cache/`)

`node_modules/.cache/sanjit-content/` would be ephemeral and triggered by Next.js's cache eviction logic — a future cache size reduction could silently re-trigger a network clone mid-build, with no clear error surface. `<project-root>/content/` is permanent for the lifetime of the build process, `.gitignore`d, and matches the reader's expected `contentRoot: 'content'`. Tradeoff: `content/` appears in `ls` output, but that's the same shape as `sanjit-content/` (the local fixture) — operators already expect a content-shaped directory at the project root.

### Why a single `scripts/clone-content.mjs` (not splitting clone + reader gate)

Story 2-3's reader is a pure function; its `readContent()` returns `diagnostics[]`. The AD-5 contract says "fail the build on malformed published". A clean separation would be `clone-content.mjs` (clone only) + `gate-content.mjs` (reader + diagnostics). **Rejected** for two reasons: (1) the script's contract is "produce a valid `content/` AND verify it before the build" — these are inseparable; (2) splitting would require a third `prebuild` step that depends on the first completing (npm lifecycle hooks do not support `preX` + `preY` chaining beyond one level of prefix). The single-script shape is the smallest artifact that satisfies AD-1 + AD-5 in one shot.

### Local-dev shortcut rationale

`SKIP_CLONE=1` is the simplest env var name (mirrors `SKIP_PREFLIGHT_CHECK`, `SKIP_INSTALL`, etc. — common in `pnpm`/`npm` ecosystems). ALTERNATIVE considered `CONTENT_LOCAL=1` (more descriptive) but `SKIP_CLONE` matches the script's action more precisely (it's a skip, not a location).

## Verification

**Commands:**
- `pnpm build` -- expected: `[content.clone] ok (duration_ms=NNNN, source=https://..., dest=content)` then `next build` proceeds; exit 0
- `pnpm dev` -- expected: same log line as above; `next dev` starts; exit 0
- `SKIP_CLONE=1 pnpm build` -- expected: `[content.clone] skipped (reason=SKIP_CLONE=1)`; next build proceeds against existing `content/`; exit 0 (assuming existing content passes reader)
- `node scripts/clone-content.mjs` -- expected: standalone run works (no lifecycle required); exit 0 on success
- `npx tsx scripts/smoke-2-4.mts` -- expected: all I/O matrix rows pass; exit 0

**Manual checks (if no CLI):**
- `git -C content log --oneline | wc -l` should return `1` (shallow clone verified)
- `ls content/` should show `case-studies/`, `patterns/`, `lab/`, `projects/`, `now-snapshot.json`, `cv.md`
- `git check-ignore content/case-studies/whatever.mdx` should exit 0 (cloned tree ignored)
- `git ls-files content/.gitkeep` should list the file (placeholder tracked)
- `git ls-files .env.example` should list the file; `git check-ignore .env` should exit 0