---
title: 'Set up GitHub Actions CI with Lighthouse, gzip-budget, route-invariant, and pa11y-ci gates'
type: 'feature'
created: '2026-09-24'
status: 'done'
review_loop_iteration: 2
baseline_commit: 'cb6dbb83e5da0dc0fd272e603502a4abcad0c601'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/package.json'
  - '{project-root}/vercel.json'
  - '{project-root}/proxy.ts'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every spine contract (FR-19/20/21/22 + AD-1/8/9/12/20 + the four closed lists in AD-13/15/17/18/19/20) is enforced only by author discipline today. The deferred-work file already lists automated test gaps for `proxy.ts` (1-3) and the CSP-injection boundary (1-2) — both surface a recurring root cause: no CI gate runs on every PR. Stories 1.5/1.6/1.7/1.8/1.9/1.10/1.11 will each introduce one more spine-binding rule; without CI the closed-list discipline degrades into a vibes-based review.

**Approach:** Add a single `.github/workflows/ci.yml` workflow that runs on `pull_request` and `push to main` and chains four spine-asserting gates in order — Lighthouse (mobile profile + Slow 4G, Perf ≥ 95), gzip-budget (`< 100 KB` homepage, `< 200 KB` any other route), route-invariant (every public route carries spine-line + ≥1 proof number + return path), pa11y-ci (every public route WCAG 2.1 AA clean via axe-core + `WCAG2AA` standard) — plus a separate `.github/workflows/content-audit.yml` that runs weekly (`schedule: cron: '17 * * * 1'`) and fails if any Vercel deployment in the past 7 days was triggered by a content-repo commit (AD-9). The PR gate uses a Node 20.9.0 runner, builds the app with `pnpm install --frozen-lockfile` + `pnpm build`, starts `next start` on a port pinned by `PORT=${{ matrix.port }}`, and runs the four gates against the running server. The audit scripts are wired through five new `pnpm` scripts (`lighthouse`, `audit:budget`, `audit:routes`, `audit:content`, `test:a11y`) so the same scripts are exercisable locally and in CI. New devDeps: `@lhci/cli@^0.14.x`, `pa11y-ci@^3.x`. No `playwright` yet (E1.6/E1.7/E1.11 will justify it; today the homepage is a single `<h1>` and the audit can curl/parse HTML without a browser engine — adding Playwright here would be premature).

## Boundaries & Constraints

**Always:**
- Two workflow files: `.github/workflows/ci.yml` (PR gate) + `.github/workflows/content-audit.yml` (weekly audit). One workflow per file (per AD-12 reviewer contract + the 5b.3 amendment in sprint-status which explicitly forbids a second workflow file).
- PR-gate workflow triggers: `pull_request: { branches: [main] }` AND `push: { branches: [main] }`. `workflow_dispatch` enabled so a maintainer can re-run without a push.
- Weekly workflow triggers: `schedule: cron: '17 * * * 1'` (Mondays at 17:00 UTC, off the :00 hour to spread runner load) AND `workflow_dispatch`.
- PR-gate job matrix: a single Node 20.9.0 job (`ubuntu-latest`); no matrix. Builds with `pnpm install --frozen-lockfile` + `pnpm build` (the spine-blessed Vercel commands per `vercel.json`).
- PR-gate step order: checkout → setup-node (20.9.0, cache: pnpm) → pnpm install --frozen-lockfile → pnpm build → background `next start &` on a pinned port → curl health-check wait → run the 4 gates sequentially (lhci autorun + node audit scripts + pa11y-ci) → upload Lighthouse report + pa11y-ci report artifacts.
- Lighthouse: `@lhci/cli` with `collect.startServerCommand: 'pnpm start'` + `collect.url: ['http://localhost:3000/']` (a single URL is sufficient for the homepage gate; FR-21 binds the assertion to the homepage specifically) + `assert.assertions[0]: { 'categories:performance': ['error', { minScore: 0.95 }] }` + `ci.budget[0]: [{ path: '/', resourceSizes: [{ resourceType: 'script', budget: 51200 }, { resourceType: 'total', budget: 102400 }] }]`.
- gzip-budget: a `scripts/audit-budget.mjs` Node ESM script that fetches each route's HTML, gzips it via `zlib.gzipSync`, and asserts: homepage `< 100 KB`, any other route `< 200 KB`. Script exits non-zero on first violation. Routes enumerated in a closed list at the top of the script (single source of truth for the gate).
- route-invariant: a `scripts/audit-routes.mjs` Node ESM script that fetches each route's HTML and asserts: (1) contains the spine-line verbatim string ("This person builds serious software — and this website is proof."), (2) contains ≥1 of the proof-number set `{7+, 10K+, 35%, 22h, 1.2M, −68%, 7-person, 8+ years}` (closed set per amended AD-12 — single-digit numeric values like `'6'` are intentionally excluded because they are trivially bypassable by any English sentence that happens to contain the digit; the closed list above is the minimum set the future homepage will populate, and E1.11 will own the exact strings), (3) contains `href="/"` OR `href="https://sanjit.dev"`. Routes enumerated in the same closed list as audit-budget.mjs.
- pa11y-ci: `pa11y-ci@^3.x` with `.pa11yci.json` listing the same routes as audit-routes.mjs + the `WCAG2AA` standard + the `axe` runner (axe-core's WCAG 2.1 AA rules are included in the `WCAG2AA` tag set per axe-core's tagging; pa11y@6.2.3's enum constraint — `WCAG2A | WCAG2AA | WCAG2AAA` — makes `WCAG2AA` the only literal that satisfies both the enum and the FR-19/AD-20 intent). Reports HTML artifacts uploaded on every run.
- Weekly content-audit: a job that calls the Vercel deployment API (`vercel.com/api/v6/deployments`) for the past 7 days and asserts each deployment's `meta.githubCommitRef` is NOT a commit from the `sanjit-content` repo. Because the Vercel deployment API does not expose the commit's changed-files list, the heuristic operates on the commit's `gitCommitMessage` substring only (paths like `case-studies/` / `patterns/` / `lab/` / `now-snapshot.json` / `cv.md` appearing in the commit message). Once E2 lands and the Vercel project is bound to two repos, the heuristic can be tightened to compare `meta.githubRepo === 'sanjit-content'` directly. The script is `scripts/audit-content.mjs`. Requires `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` repo secrets.
- `package.json` scripts: `"lighthouse": "lhci autorun"`, `"audit:budget": "node scripts/audit-budget.mjs"`, `"audit:routes": "node scripts/audit-routes.mjs"`, `"audit:content": "node scripts/audit-content.mjs"`, `"test:a11y": "pa11y-ci"`. Each exits non-zero on violation so a local run gives the same signal as CI.
- `package.json` engines stays `>=20.9.0`; `packageManager` stays `pnpm@9.12.0`. New devDeps pin exactly: `@lhci/cli`: `^0.14.0`, `pa11y-ci`: `^3.1.0`. No transitive bloat (Playwright/chromium, Vitest, lighthouse as direct dep — none of these).
- Lighthouse config file lives at `.lighthouserc.json` at the project root (the @lhci/cli default). pa11y-ci config lives at `.pa11yci.json` at the project root (the pa11y-ci default).
- The audit-script routes list is identical across all three scripts (`audit-budget.mjs`, `audit-routes.mjs`, `.pa11yci.json`) — and is sourced from one file: `scripts/audit-routes.shared.mjs` (a single `export const AUDIT_ROUTES = [...]` module). The three call sites import from the shared module so a route addition is a single-line edit.
- Audit routes list, initial content: `['/', '/work', '/projects', '/lab', '/patterns', '/now', '/about', '/recruiter', '/built', '/404']`. The list is closed (per amended AD-12) but only the routes that render content today matter; `/404` is included so the not-found page's invariant is asserted end-to-end.
- Lighthouse JSON + HTML reports + pa11y-ci HTML reports upload as GitHub Actions artifacts (always, even on success) under names `lighthouse-report`, `pa11y-report`, with `if-no-files-found: warn` so a missing artifact does not fail the build.
- The PR workflow runs Lighthouse against the homepage only (per FR-21); the other routes are asserted by gzip-budget + route-invariant + pa11y-ci. Adding Lighthouse to every route belongs to a future story (would require Playwright + LHCI's multi-URL flow).

**Ask First:**
- Changing the Lighthouse minimum score (95) or the gzip-budget thresholds (100 KB / 200 KB) — these are spine-binding numbers (FR-19/20/21) and changing them requires a spine amendment.
- Adding a fifth PR-gate step (e.g., a custom design-token lint, a bundle-analyzer) — defer to a later story with its own ACs.
- Replacing pa11y-ci with axe-core directly — same outcome, more boilerplate; defer.

**Never:**
- Adding a third workflow file (the 5b.3 amendment is explicit: only `ci.yml` + `content-audit.yml`).
- Adding Playwright or any browser engine to devDeps in this story — the audit runs against raw HTML and the homepage gate is a single URL, neither needs a browser.
- Adding a `pages/` directory, a Vue/Svelte/jQuery, an `app/api/` endpoint, or any Node server-side route — CI consumes the built static site via `next start`, no new API surface.
- Adding Sentry/PostHog/Honeycomb/Jaeger — observability beacons are E1.6's `<AnalyticsBeacon>` / `<ErrorBeacon>` (AD-13 closed set).
- Changing the homepage placeholder (`<h1>sanjit.dev</h1>`) — E1.11 owns the full homepage; CI runs against whatever the homepage is today.
- Loosening CSP to make Lighthouse happy (e.g., adding `'unsafe-inline'` to make pa11y-ci pass) — CSP is owned by E1.2 and any change requires a spine amendment.
- Touching `next.config.mjs`, `proxy.ts`, `app/`, `tsconfig.json`, or `eslint.config.mjs` from this story — those are owned by E1.1/E1.2/E1.3/E1.9/E1.11.
- Adding `lhci autorun` to `pnpm build` or `pnpm start` — Lighthouse is its own command, not a side-effect of build/start.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_PR | PR opened against `main`; build succeeds; homepage Perf ≥ 95; gzipped homepage < 100 KB; route-invariant passes; pa11y-ci clean. | All 4 gates green; workflow reports success; merge allowed. | N/A |
| LH_REGRESSION | A PR adds a client component that pushes JS bundle > 50 KB gzipped or pushes Lighthouse Perf below 0.95. | Lighthouse step exits non-zero; PR blocked. | The job fails on the LH step; subsequent steps skipped; workflow summary names the LH report artifact. |
| BUDGET_REGRESSION | A PR adds a heavy hero section pushing homepage gzipped transfer > 100 KB. | `audit-budget.mjs` prints the actual size + threshold and exits 1. | Job fails on the budget step; URL + actual size printed to logs. |
| ROUTE_REGRESSION | A future story (E1.11) ships the homepage without the spine-line string. | `audit-routes.mjs` names the route + the missing substring and exits 1. | Job fails on the route-invariant step. |
| A11Y_REGRESSION | A PR removes `aria-label` from `<nav>`. | pa11y-ci prints the rule violation + URL and exits 1. | Job fails on the a11y step; pa11y-ci HTML report artifact uploaded. |
| CONTENT_AUDIT_TRIGGER | Weekly Monday 17:00 UTC tick on `main`; past 7 days had a content-repo-triggered Vercel deploy (detected via commit-message substring match). | `audit-content.mjs` prints the offending deployment IDs + commit refs and exits 1. | Job fails; weekly workflow red until the next deploy without a content-repo trigger. |
| WORKFLOW_DISPATCH | Maintainer triggers `workflow_dispatch` on the PR workflow. | Same steps run as a normal PR push. | N/A |
| BUILD_FAIL | PR introduces a TypeScript or ESLint error. | `pnpm build` exits non-zero; all gate steps skipped (their `needs: [build]` dependency). | Job fails on `pnpm build`; gates do not run. |

</frozen-after-approval>

## Code Map

Files this story creates:

- `.github/workflows/ci.yml` -- PR-gate workflow; ~50 lines; runs on PR + push to main + dispatch.
- `.github/workflows/content-audit.yml` -- weekly audit; ~25 lines; runs on cron + dispatch.
- `.lighthouserc.json` -- @lhci/cli config; one URL (`/`), mobile profile, Perf ≥ 0.95 budget.
- `.pa11yci.json` -- pa11y-ci config; closed routes list + axe runner + `WCAG2AA` standard.
- `scripts/audit-routes.shared.mjs` -- single-source-of-truth `AUDIT_ROUTES` constant; imported by the three audit scripts.
- `scripts/audit-budget.mjs` -- gzip-budget assertion; ~40 lines; imports `AUDIT_ROUTES` + `gzipSync`.
- `scripts/audit-routes.mjs` -- spine-line + proof-number + return-path assertion; ~50 lines; imports `AUDIT_ROUTES`.
- `scripts/audit-content.mjs` -- Vercel API walker for past-7-days content-repo triggers; ~70 lines; uses `VERCEL_TOKEN` env.
- `_bmad-output/implementation-artifacts/spec-1-4-set-up-github-actions-ci-with-lighthouse-gzip-budget-route-invariant-and-pa11y-ci-gates.md` -- this spec.

Files this story modifies:

- `package.json` -- add 5 scripts (`lighthouse`, `audit:budget`, `audit:routes`, `audit:content`, `test:a11y`) + 2 devDeps (`@lhci/cli@^0.14.0`, `pa11y-ci@^3.1.0`). No engines / packageManager changes.

Reuse / read-only anchors (no edits required, but the implementation agent must not introduce conflicts):

- `AGENTS.md` lines 14–31 -- "Verified commands" section that names the 5 new scripts (currently aspirational; this story makes them real).
- `AGENTS.md` lines 58 -- "GitHub Actions for CI/CD" pinned in the Stack table.
- `AGENTS.md` invariant #9 -- "Route-level invariant in CI" (every public route contains spine-line variant + ≥1 proof number + return path); bound to audit-routes.mjs.
- `AGENTS.md` invariant #10 -- CSP via SRI (CI must NOT loosen CSP to pass Lighthouse); boundary holds.
- `_bmad-output/implementation-artifacts/epic-1-context.md` "Cross-Story Dependencies" line: "1.4 CI gates consume invariants produced by 1.7, 1.8, 1.9, 1.11" — today the homepage is a placeholder, so the route-invariant gate can only check what is on the page (the placeholder fails the spine-line check, but that is E1.11's job to fix).

- `_bmad-output/implementation-artifacts/epic-1-context.md` "Performance budgets (CI-asserted)" line — the exact thresholds this story enforces.
- `_bmad-output/planning-artifacts/epics-Sanjit-Majumdar-2026-09-23/epics.md` lines 229–238 -- Story 1.4 source (acceptance criteria carried verbatim where possible).
- `proxy.ts` -- the 308 redirect added by 1-3; the audit-routes.mjs must check the post-redirect HTML (the proxy is invisible to the audit because Next's `next start` performs the redirect transparently and the audit fetches the resolved URL).
- `vercel.json` -- the spine-blessed `pnpm install --frozen-lockfile` + `pnpm build` commands; the CI workflow reuses them verbatim (no shadow install/build commands).
- `_bmad-output/implementation-artifacts/spec-1-3-...` Spec Change Log and deferred-work.md entries (the proxy-regression-test and CSP-injection-scan defers are owned by THIS story's `audit:routes` + a future custom lint, not by this story as a hard AC).
- `_bmad-output/implementation-artifacts/spec-1-2-...` Spec Change Log -- the CSP closed-list discipline; the CI gate does NOT change CSP (boundary holds).

## Tasks & Acceptance

**Execution:**

- [ ] `scripts/audit-routes.shared.mjs` -- create with `export const AUDIT_ROUTES = ['/', '/work', '/projects', '/lab', '/patterns', '/now', '/about', '/recruiter', '/built', '/404']` (the closed route list from amended AD-12) -- so all three audit scripts share one source of truth.
- [ ] `scripts/audit-budget.mjs` -- create with: `import { AUDIT_ROUTES } from './audit-routes.shared.mjs'`; `import { gzipSync } from 'node:zlib'`; for each route in AUDIT_ROUTES, `fetch('http://localhost:' + PORT + route)`, read body, `gzipSync(body).length`; assert `< 102400` for `/` else `< 204800`; exit 1 on first violation with a message naming the route + actual + threshold -- so the gate is exercisable locally via `pnpm audit:budget`.
- [ ] `scripts/audit-routes.mjs` -- create with: import AUDIT_ROUTES + three closed sets (`SPINE_LINE` verbatim; `PROOF_NUMBERS = ['7+', '10K+', '35%', '22h', '1.2M', '\u221268%', '7-person', '8+ years']` — single-digit numeric values like `'6'` are intentionally excluded per the boundary above; `RETURN_PATH_PATTERNS = ['href="/"', 'href="https://sanjit.dev"']`); for each route, fetch + assert HTML contains SPINE_LINE AND ≥1 PROOF_NUMBERS AND ≥1 RETURN_PATH_PATTERNS; exit 1 on first violation -- so the spine-binding invariants are CI-asserted end-to-end.
- [ ] `scripts/audit-content.mjs` -- create with: read `process.env.VERCEL_TOKEN` + `process.env.VERCEL_PROJECT_ID`; fetch `https://api.vercel.com/v6/deployments?projectId=...&since=<7 days ago unix>`; for each deployment, assert `meta.githubCommitRef` is NOT a commit from `sanjit-content` repo (heuristic: the deployment's `meta.gitCommitMessage` contains `case-studies/` / `patterns/` / `lab/` / `now-snapshot.json` / `cv.md` — operating on the commit message substring only because the Vercel deployment API does not expose the commit's changed-files list); exit 1 on first violation -- so AD-9's no-build-on-content-edits rule is weekly-asserted.
- [ ] `.lighthouserc.json` -- create with: `ci.collect.startServerCommand: 'pnpm start'`, `ci.collect.startServerReadyPattern: 'Ready'`, `ci.collect.url: ['http://localhost:3000/']`, `ci.collect.settings.preset: 'desktop'` is FALSE — use a custom mobile + Slow 4G preset; `ci.assert.assertions[0]: { 'categories:performance': ['error', { minScore: 0.95 }] }`; `ci.upload.target: 'temporary-public-storage'` is FALSE in CI -- use `ci.upload.target: 'filesystem'` with output to `./lhci-reports/` -- so Lighthouse reports land as workflow artifacts.
- [ ] `.pa11yci.json` -- create with: `defaults.timeout: 30000`, `defaults.runner: 'axe'`, `defaults.standard: 'WCAG2AA'` (see Spec Change Log entry: pa11y@6.2.3 accepts only `WCAG2A/2AA/2AAA`; axe-core's WCAG 2.1 AA rules are tagged under the `WCAG2AA` set, so the 2.1 AA *intent* is preserved), `urls` array matching AUDIT_ROUTES (resolved against `http://localhost:3000`), `reporters: ['cli', './scripts/pa11y-html-reporter.js']` (see Spec Change Log entry: pa11y-ci@3.1.0 has no built-in `html` reporter; a local 60-line reporter fills the gap) -- so a11y regressions are CI-asserted.
- [ ] `.github/workflows/ci.yml` -- create with: `name: ci`, `on: { pull_request: { branches: [main] }, push: { branches: [main] }, workflow_dispatch: {} }`, single job `gate: { runs-on: ubuntu-latest, steps: [actions/checkout@v4, pnpm/action-setup@v4 with version: 9.12.0, actions/setup-node@v4 with node-version: 20.9.0 + cache: pnpm, run: pnpm install --frozen-lockfile, run: pnpm build, run: (PORT=3000 pnpm start &) + sleep 5, run: curl -fsS http://localhost:3000/ > /dev/null (health check), run: pnpm lighthouse (LHCI), run: pnpm audit:budget, run: pnpm audit:routes, run: pnpm test:a11y, upload-artifact for lhci-reports/, upload-artifact for pa11y-reports/] }` -- so a PR that regresses any of the 4 spine-binding rules fails the build before merge.
- [ ] `.github/workflows/content-audit.yml` -- create with: `name: content-audit`, `on: { schedule: { cron: '17 * * * 1' }, workflow_dispatch: {} }`, single job `audit: { runs-on: ubuntu-latest, steps: [actions/checkout@v4, actions/setup-node@v4 with node-version: 20.9.0 + cache: pnpm, run: pnpm install --frozen-lockfile, run: pnpm audit:content] }` -- so AD-9's weekly audit is automated.
- [ ] `package.json` -- add scripts: `"lighthouse": "lhci autorun"`, `"audit:budget": "node scripts/audit-budget.mjs"`, `"audit:routes": "node scripts/audit-routes.mjs"`, `"audit:content": "node scripts/audit-content.mjs"`, `"test:a11y": "pa11y-ci"`. Add devDeps: `"@lhci/cli": "^0.14.0"`, `"pa11y-ci": "^3.1.0"`. No engines / packageManager / dependencies changes.

**Acceptance Criteria:**

- Given the project's `.github/workflows/` directory, when inspecting, then `ci.yml` and `content-audit.yml` exist AND no third workflow file exists (5b.3 amendment boundary).
- Given `.github/workflows/ci.yml`, when inspecting, then it triggers on `pull_request` + `push to main` + `workflow_dispatch`, runs on `ubuntu-latest`, uses Node 20.9.0, builds with `pnpm install --frozen-lockfile` + `pnpm build`, starts the server, and runs `pnpm lighthouse`, `pnpm audit:budget`, `pnpm audit:routes`, `pnpm test:a11y` sequentially.
- Given `.github/workflows/content-audit.yml`, when inspecting, then it triggers on `cron: '17 * * * 1'` + `workflow_dispatch`, runs `pnpm audit:content`.
- Given `.lighthouserc.json`, when inspecting, then `ci.collect.url` is `['http://localhost:3000/']` (homepage only) AND `ci.assert.assertions` includes `{ 'categories:performance': ['error', { minScore: 0.95 }] }`.
- Given `.pa11yci.json`, when inspecting, then `defaults.standard` is `WCAG2AA` AND `urls` contains every route from `scripts/audit-routes.shared.mjs` AUDIT_ROUTES.
- Given `scripts/audit-routes.shared.mjs`, when inspecting, then it exports `AUDIT_ROUTES` as an array of strings containing every public route from amended AD-12.
- Given `scripts/audit-budget.mjs` + `scripts/audit-routes.mjs`, when inspecting, then both import `AUDIT_ROUTES` from `./audit-routes.shared.mjs` (single source of truth — no duplicate list).
- Given `scripts/audit-content.mjs`, when inspecting, then it reads `process.env.VERCEL_TOKEN` + `process.env.VERCEL_PROJECT_ID` and exits 1 if any Vercel deployment in the past 7 days was triggered by a content-repo commit (heuristic: `case-studies/` / `patterns/` / `lab/` / `now-snapshot.json` / `cv.md` paths in the commit's `meta.gitCommitMessage` substring — the Vercel deployment API does not expose the commit's changed-files list, so the message substring is the only cross-repo signal available today).
- Given `scripts/audit-routes.mjs`, when inspecting, then `PROOF_NUMBERS` is the closed set `['7+', '10K+', '35%', '22h', '1.2M', '\u221268%', '7-person', '8+ years']` (single-digit numeric values like `'6'` are excluded by design — any sentence with the digit trivially passes a `'6'` substring match, so the closed list is restricted to multi-character tokens that carry semantic meaning).
- Given `package.json`, when inspecting, then `scripts` includes `lighthouse`, `audit:budget`, `audit:routes`, `audit:content`, `test:a11y` AND `devDependencies` includes `@lhci/cli` (^0.14.x) + `pa11y-ci` (^3.1.x).
- Given a local `pnpm start` on port 3000 against a built app, when running `pnpm audit:budget`, then the script exits 0 for a passing route and exits 1 with a printed message for a violating route.
- Given a local `pnpm start` on port 3000 against a built app, when running `pnpm audit:routes`, then the script exits 0 when the route HTML contains the spine-line + a proof number + a return path, and exits 1 with a printed message otherwise.
- Given a local `pnpm start` on port 3000 against a built app, when running `pnpm test:a11y`, then pa11y-ci walks every route from `AUDIT_ROUTES` and produces a `./pa11y-reports/index.html` file.
- Given `pnpm install --frozen-lockfile`, when running, then exit 0 and `pnpm-lock.yaml` is updated with `@lhci/cli` + `pa11y-ci` + their transitive deps but no `playwright`, `vitest`, or `chromium`.
- Given `pnpm build`, when running, then exit 0 (the build is unchanged; CI consumes the build, does not modify it).
- Given `scripts/audit-routes.spec.mjs`, when running `node scripts/audit-routes.spec.mjs`, then exit 0 with a message naming the 8-element closed set; exits 1 if `PROOF_NUMBERS` drifts (length mismatch, re-addition of bypassable single-digit values like `'6'`, or any element shorter than 2 chars).
- Given the audit-script files + `.lighthouserc.json` + `.pa11yci.json` + workflow files, when grep'ing for `'unsafe-inline'` / `nonce-` / `unsafe-eval`, then no matches appear (CSP boundary holds; CI does not loosen CSP).

## Spec Change Log

<!-- Append-only. Entries appear below in chronological order. -->

- **2026-09-24 — `defaults.standard` value**: spec wrote `'WCAG2.1AA'`, but `pa11y@6.2.3` (the engine shipped with `pa11y-ci@3.1.0`) accepts only `WCAG2A | WCAG2AA | WCAG2AAA`. Verified by reading `node_modules/.pnpm/pa11y@6.2.3/node_modules/pa11y/lib/pa11y.js` line 464 (`pa11y.allowedStandards = ['WCAG2A', 'WCAG2AA', 'WCAG2AAA']`). Implemented `.pa11yci.json` with `standard: "WCAG2AA"` — axe-core rules are tagged WCAG 2.0/2.1 and the 2.1 rules are included in the `WCAG2AA` tag set, so the 2.1 AA *intent* is preserved (FR-19 + AD-20); only the literal enum string changed to match what the tool accepts. **Needs human renegotiation** if the literal `WCAG2.1AA` is required (e.g., for a future migration to pa11y 7.x or a different runner).

- **2026-09-24 — `reporters` list / html reporter**: spec wrote `reporters: ['cli', 'html']` with a `html.output` key, but `pa11y-ci@3.1.0` ships only CLI and JSON reporters (verified by listing `node_modules/.pnpm/pa11y-ci@3.1.0/node_modules/pa11y-ci/lib/reporters/` — only `cli.js` and `json.js`). Implemented a 60-line custom HTML reporter at `scripts/pa11y-html-reporter.js` and referenced it as `"./scripts/pa11y-html-reporter.js"` in the `reporters` array. It writes `./pa11y-reports/index.html` on `afterAll` (matching the AC's artifact path), aggregating per-URL pass/fail sections. The CLI reporter remains unchanged, so all error output still streams to the CI log.

- **2026-09-24 — bad_spec loopback iteration 1→2 (3 trigger findings)**: review of iteration-1 implementation surfaced 3 `bad_spec` findings whose root cause was outside `<frozen-after-approval>` — the spec's literal strings were unfulfillable, not the implementation.
  1. **Trigger: AC #5 `defaults.standard is WCAG2.1AA` is unfulfillable.** pa11y@6.2.3's enum (`WCAG2A | WCAG2AA | WCAG2AAA`) does not accept `WCAG2.1AA`. The 2026-09-24 entry above already documented the deviation, but the AC text itself still said `'WCAG2.1AA'` — a no-future-LLM would have re-implemented the spec literally and re-introduced the deviation. **Amended:** AC #5 now reads `defaults.standard is WCAG2AA`. The deviation record stays in the change log; the AC now matches the only implementable literal.
  2. **Trigger: AC #8 heuristic "changed-files list" is not exposed by Vercel.** Vercel's deployment API exposes `meta.gitCommitMessage` (the commit message string) but does not return a list of changed files in the deployment payload. The iteration-1 implementation correctly fell back to message-substring matching, but the AC text claimed "changed-files list" — a no-future-LLM following the AC literally would have invented a fake `meta.changedFiles` field. **Amended:** AC #8 now names `meta.gitCommitMessage` as the substring source and explicitly notes the API constraint. The heuristic set (`case-studies/` / `patterns/` / `lab/` / `now-snapshot.json` / `cv.md`) is unchanged.
  3. **Trigger: PROOF_NUMBERS includes `'6'` (trivially bypassable).** A substring search for `'6'` matches any sentence that happens to contain the digit ("we shipped in 6 weeks", "supported 6 clients", "6am standups"). The iteration-1 implementation shipped this as written, but a route carrying only the spine-line + an unrelated "6" would have passed the route-invariant gate. **Amended:** PROOF_NUMBERS closed set drops `'6'`. The set is now `['7+', '10K+', '35%', '22h', '1.2M', '\u221268%', '7-person', '8+ years']` — every entry is a multi-character token with semantic weight, so a future E1.11 (or any other story) cannot satisfy the gate with a meaningless substring. A new AC was added to lock the closed set verbatim so future drift triggers a build failure. E1.11 owns the exact strings that will appear on the homepage; this story only asserts the gate's *shape*, not the future strings.

  **Known-bad state avoided:** iteration-1's literal strings — `'WCAG2.1AA'` (unfulfillable enum), `'6'` (bypassable proof-number), "changed-files list" (non-existent API field). Future derivations following the amended ACs will hit the same enum constraint and the same bypass test and arrive at the same code without re-deriving the deviation record.

  **KEEP instructions (must survive re-derivation):**
  - Single-source-of-truth `AUDIT_ROUTES` in `scripts/audit-routes.shared.mjs`; all three audit scripts + `.pa11yci.json` import from this module. The iteration-1 implementation got this right; the re-derivation must preserve it.
  - Sequential gate order in `ci.yml`: lighthouse → audit:budget → audit:routes → test:a11y. Failure of an earlier gate must skip later gates via `needs` or step ordering.
  - Two workflow files only: `ci.yml` (PR gate) + `content-audit.yml` (weekly AD-9 audit). 5b.3 amendment forbids a third. The re-derivation must not split `ci.yml` into a per-gate matrix.
  - Custom HTML reporter at `scripts/pa11y-html-reporter.js` writing `./pa11y-reports/index.html` — replaces pa11y-ci@3.1.0's missing built-in. Do not switch to `pa11y-ci-reporter-html` (does not exist); do not switch to JSON-only reports (defeats the human-reviewability AC).
  - 30-iteration health check (`for i in $(seq 1 30)`) with 1-second sleep + curl + early `exit 0`. Faster and more deterministic than `sleep 30` followed by a single curl.
  - Concurrency group `ci-${{ github.workflow }}-${{ github.ref }}` + `cancel-in-progress: true` in `ci.yml` — prevents queue buildup on rapid PR pushes.
  - Content-audit path-heuristic on `meta.gitCommitMessage` substring — the only cross-repo signal Vercel's API exposes today. E2 can tighten this once two-repo bindings land.
  - No Playwright, no bundled browser engine in devDeps. pa11y-ci's existing puppeteer + Lighthouse's own Chromium are sufficient. E1.6/E1.7/E1.11 will justify Playwright when actual client components mount.

## Design Notes

- **Why one workflow file per concern, not one file with both:** The PR-gate runs on every PR (high frequency, must be fast) while the content-audit runs weekly (low frequency, slow Vercel API call). Splitting them keeps the PR-gate cheap and lets the content-audit run on its own schedule without polluting PR feedback with stale audits. The 5b.3 amendment makes this discipline explicit (no second PR-gate workflow file).
- **Why Lighthouse runs against one URL only:** FR-21 binds the Perf ≥ 95 assertion to the homepage specifically; running LH against every public route is a future story (requires Playwright + LHCI's multi-URL flow + per-route assertions). For now, the homepage is the only URL with a binding perf budget; the other routes are asserted by gzip-budget + route-invariant + pa11y-ci.
- **Why no Playwright in this story:** The audit fetches raw HTML via `fetch()` (Node 20.9.0 has built-in `fetch`) and pa11y-ci uses axe-core via headless Chromium via puppeteer (pa11y-ci's default runner). Lighthouse uses its own headless Chromium. Adding Playwright would be a third Chromium — premature. E1.6/E1.7/E1.11 will justify Playwright when the actual client components mount.
- **Why the audit-routes.shared.mjs file:** Three scripts need the same closed route list. Inlining it in three places means a route addition is a three-line edit (and three places to forget). Sharing via a single module means a route addition is one line. The file is `audit-routes.shared.mjs` (the `.shared.mjs` suffix is a project convention for cross-script constants).
- **Why the audit-content.mjs uses a path-heuristic on commit-message substring and not a repo-name check:** Vercel's deployment API exposes `meta.githubCommitRef` (commit SHA) and `meta.githubRepo` (the repo name) but only when the deployment was triggered by GitHub. Critically, the API does NOT expose a list of changed files — only `meta.gitCommitMessage` (a free-form string). The `sanjit-content` repo is a separate project from `sanjit-majumdar` — when E2 ships (story 2.1), a content-repo push triggers a webhook that calls `POST /api/revalidate` (which doesn't trigger a Vercel build per AD-9). The weekly audit's job is to catch a misconfigured content-repo push that DID trigger a Vercel build. The path-heuristic on `meta.gitCommitMessage` substring (matches `case-studies/` / `patterns/` / `lab/` / `now-snapshot.json` / `cv.md`) is the most reliable cross-repo signal even before E2 lands; once E2 is in place and `meta.githubRepo === 'sanjit-content'` becomes a reliable discriminator, the heuristic can be tightened to compare the repo field directly.
- **Why `cron: '17 * * * 1'` (not `0 * * * 1`):** Off-the-hour cron ticks spread GitHub Actions runner load across the week; the spine doesn't care which Monday-hour the audit runs.
- **Why the audit scripts exit 1 on first violation (not collect-all-then-fail):** CI feedback is faster when the first failure is named; collecting all failures makes the log longer and the failure mode less obvious. A future story can switch to collect-all if the dev loop wants it.

## Verification

**Commands:**

- `pnpm install --frozen-lockfile` -- expected: exit 0; `pnpm-lock.yaml` updated with `@lhci/cli` + `pa11y-ci`; no `playwright`, `vitest`, or `chromium` (transitive) added.
- `pnpm build` -- expected: exit 0; build log shows the homepage is a static prerender (unchanged from E1.1).
- `pnpm audit:budget` against a running `next start` -- expected: exit 0 for the placeholder homepage (well under 100 KB); exit 1 with a clear message if violated.
- `pnpm audit:routes` against a running `next start` -- expected: exit 1 today because the placeholder homepage fails the **spine-line** check (line 27 of audit-routes.mjs fires first); the proof-number and return-path checks are not reached today. E1.11 will satisfy the spine-line; the gate is forward-looking for proof-number + return-path coverage. The failure message names the missing substring ("missing spine-line substring").
- `pnpm test:a11y` against a running `next start` -- expected: pa11y-ci produces a `./pa11y-reports/index.html` report (the placeholder homepage may pass or fail depending on axe-core's view of `<h1>sanjit.dev</h1>` — both are acceptable today; the gate is forward-looking).
- `pnpm lighthouse` against a running `next start` -- expected: LHCI runs and emits a report to `./lhci-reports/`; the assertion fails today (the placeholder homepage does not have a perf-optimized build) with a clear message naming the failing assertion (the gate is forward-looking).
- `node -e "const m = await import('./scripts/audit-routes.shared.mjs'); console.log(m.AUDIT_ROUTES.length)"` -- expected: `10`.
- `grep -nE "['\"]6['\"]" scripts/audit-routes.mjs` -- expected: no isolated `'6'` or `"6"` token in PROOF_NUMBERS (the multi-character `7-person`, `8+ years`, `10K+` etc. are unaffected; only the bypassable single-digit entry must be absent).

**Manual checks (if no CLI):**

- Open `.github/workflows/ci.yml` and confirm: `on: pull_request`, `on: push to main`, `on: workflow_dispatch` are all present; Node version is `20.9.0`; the four `pnpm` audit commands run in sequence.
- Open `.github/workflows/content-audit.yml` and confirm: `cron: '17 * * * 1'` is present; `VERCEL_TOKEN` is referenced via `${{ secrets.VERCEL_TOKEN }}`.
- Open `.lighthouserc.json` and confirm: URL is `http://localhost:3000/`; Perf ≥ 0.95 assertion is present.
- Open `.pa11yci.json` and confirm: `WCAG2AA` standard is set (not `WCAG2.1AA`); `urls` array has 10 entries matching `AUDIT_ROUTES`.
- `grep -nE "'unsafe-inline'|nonce-|unsafe-eval" .github/workflows/*.yml scripts/audit-*.mjs .lighthouserc.json .pa11yci.json` -- expected: no matches (CSP boundary holds; CI does not loosen CSP).
- `ls .github/workflows/` -- expected: exactly `ci.yml` and `content-audit.yml` (no third workflow file).

## Suggested Review Order

**Audit script: single-source-of-truth for the closed route list**

- The `AUDIT_ROUTES` constant imported by all three audit scripts prevents drift on route additions.
  [`scripts/audit-routes.shared.mjs`](../../scripts/audit-routes.shared.mjs)

**PR gate: the four assertions chained in order**

- The Lighthouse assertion enforces the homepage perf budget (FR-21) with min-score 0.95 on mobile + Slow 4G.
  [`.lighthouserc.json`](../../.lighthouserc.json)

- The pa11y-ci assertion walks every route from AUDIT_ROUTES against WCAG 2.1 AA (via axe-core's `WCAG2AA` tag set) (FR-19 / AD-20).
  [`.pa11yci.json`](../../.pa11yci.json)

- The gzip-budget script gates total transferred bytes per route against the spine-binding 100/200 KB thresholds (FR-20).
  [`scripts/audit-budget.mjs`](../../scripts/audit-budget.mjs)

- The route-invariant script asserts spine-line + proof number + return path on every route (amended AD-12).
  [`scripts/audit-routes.mjs`](../../scripts/audit-routes.mjs)

**Weekly content-audit: AD-9 enforcement on a separate cadence**

- Vercel API walker rejects content-repo-triggered deployments in the past 7 days (matched on `meta.gitCommitMessage` substring); requires VERCEL_TOKEN + VERCEL_PROJECT_ID secrets.
  [`scripts/audit-content.mjs`](../../scripts/audit-content.mjs)

**Workflow files: one PR gate + one weekly audit**

- PR gate chains checkout → setup-node → install → build → start → 4 audit gates; uploads Lighthouse + pa11y artifacts.
  [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

- Weekly audit runs `pnpm audit:content` on Mondays at 17:00 UTC; off-the-hour to spread runner load.
  [`.github/workflows/content-audit.yml`](../../.github/workflows/content-audit.yml)

**Package wiring: the five spine-blessed scripts enter the spine**

- Five new `pnpm` scripts + two new devDeps; no engines or packageManager changes; lockfile updated.
  [`package.json`](../../package.json)
