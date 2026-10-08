# Project Constitution

> Universal, always-inherited policies. Modules **cannot override** this file.

## Purpose

This constitution establishes non-negotiable engineering policies for the
`Sanjit-Majumdar` portfolio. It is inherited by every work item, run, and
agent in FIRE. Treat it as binding: deviations require an explicit
exception recorded in `.specs-fire/maintenance-log.md` with rationale.

## 1. Git workflow

- **Trunk-based development** on `main`. No long-lived feature branches.
- Every work item ships via a **single commit** on a short-lived branch
  (or directly on `main` when the project is solo and pre-1.0).
- Commit messages follow **Conventional Commits** (`feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`, `test:`, `build:`, `ci:`, `perf:`).
- **No force pushes** to `main`. No skipped hooks (`--no-verify`).
- Secrets are never committed. `.env*` files are git-ignored. Rotate
  any credential that touches the working tree.

## 2. Pull request / change process

- Every change is described in a PR with: **what**, **why**, **risk**,
  and **verification evidence** (typecheck, lint, a11y, Lighthouse,
  audit scripts).
- Reviewers block on constitutional violations, regressions, or
  unverified claims.
- A PR is mergeable only when: `pnpm typecheck`, `pnpm lint`,
  `pnpm test:a11y` (where applicable), and any project audit scripts
  pass locally.

## 3. Code quality gates

- TypeScript **strict mode** is mandatory. `noUncheckedIndexedAccess`
  is on. No `any` in shipped code without an inline justification.
- ESLint (`eslint-config-next/core-web-vitals` + `typescript`) must
  pass with zero warnings.
- All public functions and exported types carry **JSDoc** comments.
- No dead code. Unused exports are removed, not commented out.
- Accessibility is a first-class concern, not an afterthought. New UI
  must be verified against `pa11y-ci` baselines.

## 4. Security & privacy

- All HTTP responses carry a **Content-Security-Policy** header.
  Subresource Integrity (SRI, SHA-256) is required for any third-party
  script.
- No telemetry or analytics script is added without an explicit decision
  in the README / privacy notice.
- PII (recruiter emails, contact form data) is **never** logged in
  plaintext or stored longer than necessary.
- Dependencies are pinned with `pnpm` and reviewed for known CVEs
  before upgrade.

## 5. Performance budget

- Lighthouse mobile scores must remain: **Performance ≥ 95**,
  **Accessibility ≥ 95**, **Best Practices ≥ 95**, **SEO ≥ 95**.
- The CI Lighthouse budget (`lighthouserc.json`) is the source of
  truth. A failing budget blocks merge.
- Client JavaScript is kept on a strictly closed allowlist of
  components (per architecture ADs).

## 6. Testing & verification

- `pnpm typecheck` and `pnpm lint` are mandatory before any change is
  considered complete.
- `pnpm test:a11y` is mandatory when UI changes are touched.
- `pnpm audit:routes`, `pnpm audit:content`, `pnpm audit:tokens`,
  `pnpm audit:budget` run when their respective domains are touched.
- All audit scripts and tests live under `scripts/` and run via
  `tsx` (TypeScript) or `node` (CommonJS shims) — never ad-hoc.

## 7. Documentation

- The `README.md` is the project's front door. Any change to setup,
  commands, stack, or architecture must update it in the same commit.
- Architecture decisions are recorded as ADs in the
  `_bmad-output/planning-artifacts/architecture/` spine.
- FIRE artifacts (`intents/`, `runs/`, `standards/`) are part of the
  source of truth and are committed alongside code.

## 8. Change management

- This constitution is amended only by a documented decision with
  rationale and recorded in the maintenance log.
- Standards files (`tech-stack.md`, `coding-standards.md`,
  `testing-standards.md`, `system-architecture.md`) may be updated as
  the project evolves; changes follow the same review bar as code.

---

**Inheritance**: `always` · **Override**: `never` · **Source of truth**: this file.
