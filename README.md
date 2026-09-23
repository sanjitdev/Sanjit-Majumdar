# Sanjit Majumdar — Engineering Portfolio

> **A portfolio that proves what I can do instead of just telling people what I can do.**

Public engineering portfolio for **Sanjit Majumdar**. This repository is the **source of truth for planning and implementation artifacts** produced under the [BMAD-Method](https://github.com/bmad-code-org/BMAD-METHOD) workflow, plus the Next.js 16 codebase that ships to [sanjit.dev](https://sanjit.dev).

---

## Table of contents

- [What this repo is](#what-this-repo-is)
- [Architecture at a glance](#architecture-at-a-glance)
- [Repository layout](#repository-layout)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Verified commands](#verified-commands)
- [Architecture Decision Records (ADRs)](#architecture-decision-records-adrs)
- [Design system](#design-system)
- [Accessibility](#accessibility)
- [Performance budget](#performance-budget)
- [CI / CD](#ci--cd)
- [Repository hygiene](#repository-hygiene)
- [Contributing](#contributing)
- [License](#license)
- [Maintainer](#maintainer)

---

## What this repo is

This is **not** a greenfield empty repo. It's a working planning + implementation workspace with two layers:

1. **Planning layer** — `_bmad/` (the BMAD framework, vendored) and `_bmad-output/` (generated artifacts: brainstorming notes, planning-artifacts, implementation-artifacts, specs, test-artifacts). The architecture spine (`_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md`) defines **20 ADs** as binding rules for everything below.
2. **Implementation layer** — the Next.js 16 / React 19 / Tailwind v4 / TypeScript codebase that materializes the spine. Content lives in MDX with Zod-validated frontmatter; routes ship as SSG/ISR with a strictly closed set of client components.

The repo currently contains the planning spine, supporting artifacts, and a small set of Python tooling (`audit_v4.py`, `sweep_v4.py`) used to validate the v4 UX mockups. The Next.js application tree (`app/`, `content/`, `components/`, `lib/`) will land here as the spine is implemented.

### Core idea (from `docs/idea.md`)

The homepage should immediately communicate:

- Who you are
- What you build
- How you think
- What you've accomplished
- What you're technically capable of
- What you're currently building
- Actual things people can interact with

The rest of the site is a **public engineering playground** — case studies, patterns, a lab, a live "now" ticker, and a recruiter-mode forward artifact.

---

## Architecture at a glance

```
┌────────────────────────────────────────────────────────────────────┐
│                            sanjit.dev                              │
├────────────────────────────────────────────────────────────────────┤
│  Edge (Vercel)         │  Node.js runtime                          │
│  ─ GET  /api/now       │  ─ POST /api/forward-pdf (Puppeteer)      │
│  ─ POST /api/revalidate│                                           │
├────────────────────────────────────────────────────────────────────┤
│  Next.js 16 (App Router, Turbopack)                                │
│  ─ Static-first (SSG/ISR) for every public route                   │
│  ─ 10 closed client components (AD-13)                             │
│  ─ 9 closed signature-canvas modes (AD-17)                         │
│  ─ ~30 closed design tokens (AD-18)                                │
│  ─ 4 closed breakpoints (AD-19)                                    │
├────────────────────────────────────────────────────────────────────┤
│  Content          │  Persistence            │  Services            │
│  ─ MDX 3.x        │  ─ Upstash Redis        │  ─ Resend (email)    │
│  ─ Velite (opt.)  │  ─ 2 KV namespaces      │  ─ Plausible         │
│  ─ Zod 4 schemas  │  ─ ISR tag invalidation │  ─ Sentry            │
│                   │                         │  ─ Turnstile         │
├────────────────────────────────────────────────────────────────────┤
│  CI: GitHub Actions · Lighthouse CI · Playwright · Vitest · pa11y  │
└────────────────────────────────────────────────────────────────────┘
```

> See [ARCHITECTURE-SPINE.md](_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md) for the full binding specification. **Spine version: v5** (`amended_for: v4-ux`).

---

## Repository layout

```
Sanjit-Majumdar/
├── AGENTS.md                            # Operating manual for AI/code agents
├── README.md                            # ← you are here
├── LICENSE
├── .gitignore                           # Comprehensive ignore patterns
├── .gitattributes                       # Line endings, diff drivers, linguist
│
├── docs/                                # Human-authored source-of-truth docs
│   ├── cv.md                            # Canonical CV source
│   └── idea.md                          # Core idea + suggested structure
│
├── audit_v4.py                          # UX mockup validator (token coverage)
├── sweep_v4.py                          # UX mockup sweeper (cross-link checks)
│
├── _bmad/                               # BMAD framework (vendored, read-only)
│   ├── core/  bmb/  bmm/  cis/  gds/  ...
│   ├── _config/  scripts/  render/
│   └── config.toml  config.user.toml
│
└── _bmad-output/                        # Generated artifacts (trackable)
    ├── brainstorming/                   # Brainstorming sessions, notes
    ├── planning-artifacts/              # PRD, architecture, UX, epics
    │   ├── architecture/
    │   │   └── architecture-Sanjit-Majumdar-2026-09-23/
    │   │       └── ARCHITECTURE-SPINE.md    # ← the contract
    │   └── ux-designs/
    │       └── ux-Sanjit-Majumdar-2026-09-23/
    │           ├── DESIGN.md
    │           ├── EXPERIENCE.md
    │           └── mockups/v4/*.html
    ├── implementation-artifacts/        # Code-level artifacts
    ├── specs/                            # Per-feature specs
    └── test-artifacts/                   # Test plans, E2E reports
```

> **When the Next.js implementation lands**, expect: `app/`, `components/`, `content/`, `lib/`, `public/`, `proxy.ts`, `next.config.js`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `tailwind.config.*` (omitted in favor of CSS-first), `vitest.config.ts`, `playwright.config.ts`, `lighthouserc.json`.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16.3.6+** | App Router, Turbopack default, `revalidateTag(tag, 'max')` |
| Runtime | **React 19.2+** | Bundled with Next 16 |
| Language | **TypeScript ≥ 5.1.0** | Type safety end-to-end |
| Content | **MDX 3.x** (+ Velite optional) | Long-form content with typed frontmatter |
| Schema | **Zod 4.6+** | Frontmatter validation, additive `.passthrough()` |
| Styles | **Tailwind CSS 4.x** (CSS-first) | `@import "tailwindcss"` in `app/globals.css` |
| Persistence | **Upstash Redis** (via Vercel Marketplace) | Replaces retired Vercel KV |
| Email | **Resend** | Hiring-manager forward form |
| Analytics | **Plausible** | Self-hostable, privacy-respecting |
| Errors | **Sentry** | Deferred-load |
| PDF | **Puppeteer** + `@sparticuz/chromium` | Node.js runtime, ≥ 1769 MB memory |
| Bot protection | **Cloudflare Turnstile** | Contact form |
| UI primitives | **shadcn/ui** (Dialog, Toggle, Tooltip only) | Closed list (AD-15) |
| Perf | **Lighthouse CI** | Mobile profile, Slow 4G |
| E2E | **Playwright** | Route invariants + ISR revalidation |
| Unit | **Vitest** | Content-schema validation (AD-5) |
| A11y | **pa11y-ci** | WCAG 2.1 AA enforcement (AD-20) |
| CI/CD | **GitHub Actions** | PR checks, scheduled audits |
| Package manager | **pnpm** | Frozen lockfile in CI |

**Node.js minimum:** 20.9.0 (pinned in `package.json` `engines`).

---

## Getting started

### Prerequisites

- **Node.js ≥ 20.9.0** (use `nvm` or `fnm`)
- **pnpm** (install: `corepack enable && corepack prepare pnpm@latest --activate`)
- **Git**

### Clone

```bash
git clone https://github.com/sanjit/sanjit-majumdar.git
cd sanjit-majumdar
pnpm install --frozen-lockfile
```

### Local development

```bash
pnpm dev          # Next.js dev server on http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint (Next.js + Tailwind v4 + TS)
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright E2E
```

### Useful one-offs

```bash
pnpm audit:budget     # Gzip-budget check (homepage ≤ 100 KB, routes ≤ 200 KB)
pnpm audit:routes     # Spine-line + proof-number + return-path check
pnpm audit:content    # Content-repo build trigger audit (weekly)
pnpm lighthouse       # Perf regression assertion (mobile / Slow 4G)
pnpm test:a11y        # pa11y-ci sweep across all public routes
```

### Python tooling (UX mockup validation)

```bash
python audit_v4.py    # Audit token coverage in v4 mockups
python sweep_v4.py    # Sweep cross-page link integrity
```

These scripts target `_bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/mockups/v4/` and assert that the reference token set and expected page links are present.

---

## Verified commands

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies (frozen lockfile in CI) |
| `pnpm dev` | Local dev server (Turbopack, port 3000) |
| `pnpm build` | Production build (Turbopack) |
| `pnpm start` | Serve production build locally |
| `pnpm test` | Vitest unit tests (incl. content-schema validation per AD-5) |
| `pnpm test:e2e` | Playwright E2E (route invariants + ISR per AD-12) |
| `pnpm lint` | ESLint (Next.js + Tailwind v4 + TS) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lighthouse` | Lighthouse CI assertion (mobile, Slow 4G; fails if Perf < 95 or LCP > 1.8s) |
| `pnpm audit:budget` | Gzip budget check (FR-20) |
| `pnpm audit:routes` | Route-invariant check (AD-12) |
| `pnpm audit:content` | Weekly content-repo deployment audit (AD-9) |
| `pnpm test:a11y` | `pa11y-ci` WCAG 2.1 AA sweep (AD-20) |

---

## Architecture Decision Records (ADRs)

The spine carries **20 ADs**. They are binding — any code that violates them fails review.

### Stack (pinned, AD-1..AD-3, AD-5, AD-9, AD-11)

- Next.js 16.3.6+ / React 19.2+ / TS ≥ 5.1.0
- Zod 4.6+ for all content frontmatter
- MDX 3.x (Velite optional)
- Tailwind v4 (CSS-first, no `tailwind.config.ts`)
- Upstash Redis via Vercel Marketplace (no Vercel KV)
- CSP via SRI — **nonce path explicitly rejected** (AD-11)
- Content edits trigger `revalidateTag(tag, 'max')` via webhook — never a full build (AD-1, AD-9)

### Closed lists (modifying requires a spine amendment)

- **Client components** (AD-13, 10 closed): `SignatureCanvas`, `ScrollProgress`, `CommandPalette`, `MagneticCTA`, `AnalyticsBeacon`, `ErrorBeacon`, `LayerRowHover`, `SkipToContent`, `NavCurrent`, `FilterChipGroup`.
- **shadcn primitives** (AD-15, 3 closed): `Dialog`, `Toggle`, `Tooltip`.
- **Serverless endpoints** (AD-3, 3 closed): `GET /api/now`, `POST /api/forward-pdf`, `POST /api/revalidate`.
- **KV namespaces** (AD-2, 2 closed): `now`, `contact`.
- **ISR tag names**: `<type>:<slug>` for typed; bare for `now` and `cv`.
- **Signature-canvas modes** (AD-17, 9 closed): `home`, `work`, `case-study`, `pattern`, `now`, `about`, `lab`, `built`, `recruiter`.
- **Design tokens** (AD-18): ~30 closed CSS custom properties in `app/globals.css` `@theme`.
- **Responsive breakpoints** (AD-19, 4 closed): `xl ≥ 1280`, `lg 1100–1279`, `md 900–1099`, `sm < 900`.

### 16 invariants (non-negotiable)

> See [ARCHITECTURE-SPINE.md § Invariants](_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md#invariants) for the full list. Highlights:

1. Every public route is SSG or ISR (AD-1).
2. No layout-level `"use client"` boundary (AD-13).
3. Build fails on malformed `status: published` frontmatter; drafts excluded (AD-5).
4. Content edits never trigger a build — only `revalidateTag(tag, 'max')` does (AD-1, AD-9).
5. Recruiter-mode is a route, not a client state (AD-8).
6. Forward flow is route-level — no modal (AD-14).
7. Every public route contains spine-line variant + ≥1 proof number from `{7+, 10K+, 35%, 22h, 1.2M, −68%, 7-person, 6, 8+ years}` + return path `href="/"` (AD-12).
8. Snapshot write-back is owned by a GitHub Action in `sanjit-content` reading KV — never a serverless function writing back (AD-10).
9. Signature-canvas mode is route-determined; idle animation only; collapses under `prefers-reduced-motion` (AD-17).
10. Design tokens are closed — inline hex/px outside the token set is a review failure (AD-18).
11. WCAG 2.1 AA floor enforced by `pa11y-ci` in CI (AD-20).

---

## Design system

Closed design tokens (AD-18) live as Tailwind v4 `@theme` custom properties in `app/globals.css`. Three accent tokens — `--accent` (brand / primary), `--accent-2` (Built page only), `--accent-3` (Lab page only) — **never co-occur on the same surface**.

Reference the tokens via `var(--token-name)`; never inline hex/px values outside the closed set.

**Signature-canvas (AD-17):** each public route renders exactly one of the 9 closed modes. Idle animation is the only animation; collapses under `prefers-reduced-motion`.

**Responsive (AD-19):** 4-way ladder. The signature-canvas slot is `display: none` below `xl`; mobile reflows the freed 240×240 + 24 px right margin.

---

## Accessibility

The site has a **WCAG 2.1 AA floor** (AD-20):

- Semantic landmarks throughout
- `SkipToContent` is the first focusable element
- Command palette: `role="dialog" aria-modal="true" aria-labelledby`
- `aria-current="page"` on the active nav link
- `aria-hidden="true"` on the signature canvas and decorative hairlines
- `aria-live="polite"` on the NOW ticker list
- `prefers-reduced-motion` honored site-wide
- `pointer:fine AND NOT prefers-reduced-motion` gates the magnetic CTA
- Touch targets ≥ 44 px on mobile

Enforced in CI by `pa11y-ci` against every public route (`pnpm test:a11y`).

---

## Performance budget

| Route | Gzip budget (FR-20) |
|---|---|
| `/` (homepage) | **≤ 100 KB** |
| Any other route | **≤ 200 KB** |

Lighthouse CI runs on every PR against the mobile profile on Slow 4G and **fails the PR** if:

- Performance score **< 95**, **or**
- LCP **> 1.8 s**

---

## CI / CD

- **GitHub Actions** for build, test, lint, typecheck, E2E, Lighthouse, pa11y
- **Frozen lockfile** in CI (`pnpm install --frozen-lockfile`)
- **PR-blocking checks:** typecheck, lint, unit + E2E, route-invariant audit, gzip budget, Lighthouse, pa11y
- **Weekly scheduled:** `audit:content` (content-repo deployment audit)
- **Sentry** captures runtime errors from serverless functions
- **Structured logging:** every serverless function emits `{ request_id, route, duration_ms, status }`. `request_id` is `crypto.randomUUID()` server-side; GitHub Actions uses the run ID. Error shape: `{ error: { code, message, request_id } }`

---

## Repository hygiene

This repo ships with a curated ignore + attribute surface so editors, CI, and language-detection tools all behave the same:

- **`.gitignore`** — covers OS junk (macOS, Windows, Linux), IDE state (VS Code, Cursor, JetBrains, Vim, Eclipse, Xcode, VS), AI tooling (`.claude/`, `.codex/`, `.cursor/`, `.impeccable/`), Python (`__pycache__/`, `.venv/`, `.mypy_cache/`, `.ruff_cache/`, etc.), Node/JS (`node_modules/`, `dist/`, `.next/`, `.turbo/`), secrets (`.env*` with `.env.example` allow-listed), and BMAD-specific helpers.
- **`.gitattributes`** — single canonical LF (`* text=auto eol=lf`), lockfiles LF-locked, binary files explicitly marked, linguist hints for accurate language stats on GitHub, `diff=python` driver attached, `export-subst` on metadata files, `merge=union` on lockfiles and generated BMAD artifacts.

Recommended global git config (run once per machine):

```bash
git config --global core.autocrlf input   # Windows: don't auto-convert on checkout
git config --global core.eol lf
git config --global core.safecrlf warn
```

And to enable the Python diff hunk header (requires the diff driver to be configured):

```ini
# ~/.gitconfig
[diff "python"]
    xfuncname = "^(@@ |def |class |async def )"
```

---

## Contributing

This is a personal portfolio, but the planning artifacts are first-class and the spine is the contract.

### Workflow

1. **Read** the [AGENTS.md](AGENTS.md) operating manual and the [Architecture Spine](_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md).
2. **Propose** changes via a planning artifact (PRD amendment, epic, or spec under `_bmad-output/`) **before** writing code. Closed lists require a spine amendment.
3. **Implement** against the spine. Run `pnpm typecheck && pnpm lint && pnpm test && pnpm audit:budget && pnpm audit:routes` locally before pushing.
4. **Verify** with `pnpm lighthouse` and `pnpm test:a11y` for any UI-affecting change.
5. **Open a PR** — every PR must pass CI; route-invariant audits will block you if a public route is missing the spine-line + proof number + return path.

### Editing the spine

ADs are amended **in place** for ADs 4, 6, 8, 12, 13, 14, 16; appended for ADs 17–20. Bump the spine version in the document header and add an entry to the change log.

### Code style

- **File names:** kebab-case (`wellbook.mdx`, `canonical-model.mdx`). Slugs derive from filenames, overridable via `slug` frontmatter.
- **Component names:** PascalCase. `"use client"` at file top is the source of truth for client components.
- **Zod schemas:** end in `Schema` (`CaseStudySchema`).
- **Middleware:** `proxy.ts` at project root (Next 16; `middleware.ts` is deprecated). Used for nothing CSP-related.
- **Secrets:** Vercel env vars only. No `.env` files committed. No secrets in content.

---

## License

MIT — see [LICENSE](LICENSE) (or your chosen license). Until the license file lands, treat the contents as **All rights reserved** by Sanjit Majumdar.

---

## Maintainer

**Sanjit Majumdar** — [sanjit.dev](https://sanjit.dev)

For agent / AI-assistant operating instructions, see [AGENTS.md](AGENTS.md).

---

<sub>Built under the [BMAD-Method](https://github.com/bmad-code-org/BMAD-METHOD) planning framework. Architecture spine: v5 (`amended_for: v4-ux`), 20 binding ADs.</sub>
