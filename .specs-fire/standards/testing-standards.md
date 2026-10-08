# Testing Standards

> How the project verifies behavior. The portfolio leans on
> typechecking, lint, accessibility, Lighthouse budgets, and a small
> set of project-specific audit scripts rather than a unit-test
> framework.

## Required pre-merge checks

| Check | Command | When |
|---|---|---|
| Type check | `pnpm typecheck` | Always |
| Lint | `pnpm lint` | Always |
| Accessibility (a11y) | `pnpm test:a11y` | Always (UI changes) |
| Lighthouse budgets | `pnpm lighthouse` | Always (CI) |

## Audit scripts

These scripts are part of the test surface and live under `scripts/`.
Run them when the relevant domain changes.

| Script | Purpose | Domain |
|---|---|---|
| `audit-routes.mjs` | Routes vs. mount-point map consistency | Routing |
| `audit-routes-mount-points.spec.mjs` | Mount points match route tree | Routing |
| `audit-routes.spec.mjs` | Route spec invariants | Routing |
| `audit-content.mjs` | MDX content schema + frontmatter | Content |
| `audit-tokens.mjs` | Design tokens vs. CSS variables | Design system |
| `audit-budget.mjs` | Performance budget invariants | Performance |

All audits exit non-zero on failure. They are run via `tsx` (TypeScript)
or `node` (CommonJS shim) — never ad-hoc.

## pa11y-ci configuration

- Configured via `.pa11yci.json`.
- Tolerance thresholds: **0 errors**, **0 warnings** for new pages
  until proven otherwise. Existing baseline exceptions are recorded
  in the config.
- HTML reporter shim: `scripts/pa11y-html-reporter.js` is a CommonJS
  shim required by `pa11y-ci` 3.1.0 and is **not** project source.

## Lighthouse CI

- Configured via `.lighthouserc.json`.
- Mobile budgets are the source of truth.
- Local artifacts in `.lighthouseci/` are **git-ignored**.

## What is **not** tested (today)

- No unit-test framework. Vitest / Jest require an ADR to adopt.
- No end-to-end browser tests. `pa11y-ci` + smoke scripts cover the
  most critical journeys.
- No visual regression. UI review is manual against design tokens.

## When a new test surface is needed

1. Propose via an ADR in `_bmad-output/planning-artifacts/architecture/`.
2. Add the framework to `tech-stack.md` (Out-of-scope list removed).
3. Add the script to `package.json#scripts`.
4. Wire it into `.github/workflows/`.

## Smoke scripts

`scripts/smoke-2-2.mts`, `smoke-2-3.mts`, `smoke-2-4.mts`, `smoke-2-5.mts`
exist for staged verification of milestone scenes. Run them when a
work item touches the related surface.

---

**Inheritance**: `fallback` · **Override**: `allowed (module-level)` · **Last updated**: 2026-10-08
