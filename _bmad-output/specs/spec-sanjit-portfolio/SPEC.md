---
id: SPEC-sanjit-portfolio
companions:
  - patterns.md
  - content-schema.md
  - architecture-diagrams.md
  - content-sources.md
sources:
  - ../../brainstorming/brainstorm-sanjit-portfolio-2026-09-23/brainstorm-intent.md
  - ../../brainstorming/brainstorm-sanjit-portfolio-2026-09-23/architecture-brief.md
  - ../../brainstorming/brainstorm-sanjit-portfolio-2026-09-23/pattern-library.md
  - ../../../docs/idea.md
  - ../../../docs/cv.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Sanjit's Engineering Portfolio

## Why

A **vision to realize**: a public engineering portfolio that doubles as the strongest evidence of Tech Lead capability. The site is not a CV rendered in HTML — it is the artifact itself, demonstrating architecture, UI engineering, backend, performance, AI usage, and leadership inside the same project. It must serve a real recruiter who has 30 seconds, a real hiring manager who has 60 seconds to decide whether to forward it, a real engineer who wants to see how Sanjit thinks, and Sanjit himself, who will keep extending it as long as he keeps building. The anchor line — *"He can do it — whatever you give him to build, he can build it for you, and better than others"* — is the claim the entire site exists to prove.

## Capabilities

- **CAP-1 — Recruiter-grade first impression**
  - **intent:** A visitor landing on any public page can, within 30 seconds, name who Sanjit is, what stack he works in, how long he has been doing it, what scale of system he has shipped, and what level of ownership he has held.
  - **success:** A neutral test user, given the URL cold with no instructions, can recite (a) Sanjit's name, (b) at least three stack elements, (c) at least two of the four proof-vector numbers (7+ yrs / 10K+ users / 35% perf gain / 7-person team), and (d) which case study they would forward to a hiring manager — all within 30 seconds of first paint. Measured on a throttled Slow 4G mobile profile.

- **CAP-2 — Recruiter-mode "forward to hiring manager" surface**
  - **intent:** A recruiter who has decided Sanjit is worth a conversation can produce a single shareable artifact that lands the spine line, the four proof vectors, and one or two recommended case studies in a hiring manager's inbox without any editing.
  - **success:** A recruiter can click a "Forward to hiring manager" affordance from any page and produce either a single shareable URL or a PDF or both, where the artifact is legible cold (no prior context), includes the spine line verbatim, lists the four proof vectors with their numbers, and links to two case studies. The artifact must render correctly in Gmail, Outlook, Slack, and LinkedIn DM previews.

- **CAP-3 — Pattern library as organizing principle**
  - **intent:** The portfolio is organized around five named, deep-linkable engineering patterns, not around jobs or a project list. Each pattern carries a stable URL and is cited by case studies and Lab tools.
  - **success:** Each of the five patterns (Canonical Model, Syncfusion Data-Grid, nopCommerce Plugin, Ship-Faster Pushback, Friday Architecture Review) has its own stable URL, renders with the structure `when this applies → the moves → counter-lines → annotation`, includes a verbatim quote where one exists, and is cited by at least one case study through a `patterns:` field. Pattern deep-links resolve to specific moves (e.g., `/patterns/canonical-model#move-3`) and are independently shareable.

- **CAP-4 — Decentralized page-as-proof surface**
  - **intent:** Every public route — homepage, case study, lab tool, pattern, /now, /about — is a standalone proof surface, not a deep link off a lobby page.
  - **success:** Every public route renders with: (a) the spine line or a positioning-line variant, (b) at least one proof number from the four-vector set, and (c) a visible path back to the rest of the site. Removing the homepage from the navigation graph does not break the credibility of any other page.

- **CAP-5 — Content editable without redeployment**
  - **intent:** Sanjit can edit any content file (case study, pattern, lab tool, currently-building entry, CV line) and see the change live without running a build pipeline or pushing to the main code repo.
  - **success:** A change to any content file in the content source triggers on-demand revalidation of the affected route within 5 seconds, verified by a CI integration test that edits a content file, waits 5 seconds, and asserts the deployed route reflects the change. Edits to content never run the main build pipeline.

- **CAP-6 — Currently-building feed with stale-state fallback**
  - **intent:** A live feed shows what Sanjit is shipping right now, and the page never errors if the upstream source is cold.
  - **success:** The `/now` and homepage "currently building" surfaces render the latest entries from the live source. If the live source returns no data, the page renders the last-good snapshot committed in the repo with an honest "(last updated N days ago)" tag — never an empty section, never an error state.

- **CAP-7 — Performance budget enforced**
  - **intent:** The site loads fast enough that a recruiter on a bad network never bounces and an engineer on a 2G connection in Bangladesh can still see the spine line.
  - **success:** Homepage first paint under 1.8s LCP on a throttled Slow 4G mobile profile (Lighthouse); total homepage transfer under 100KB gzipped; any other route under 200KB gzipped; Lighthouse Performance score ≥ 95 on mobile profile. All four numbers are CI-enforced — a PR that regresses any of them fails the build.

## Constraints

- **Vercel-hosted frontend + serverless functions.** No external infrastructure; the entire deployed system lives on one platform.
- **No always-on database.** State that must persist across deploys lives in Vercel KV (free tier). No Postgres, no Mongo, no Redis-on-VM.
- **Static-first rendering.** Every public route is SSG or ISR. Client-side hydration is island-loaded only where it earns weight.
- **Additive content schema.** All content is parsed via Zod with `.partial()` and `.passthrough()`. Every frontmatter field except `title` is optional; unknown keys are preserved and exposed via `entry.meta`. Adding a field never breaks an old entry.
- **Lighthouse Performance ≥ 95 in CI.** Mobile profile, Slow 4G throttling, no CLS, LCP < 1.8s, TTI < 2.5s. A PR that regresses any number fails the build.
- **Every page carries spine line + proof number + return path.** Enforced as a route-level invariant; verified in CI via static analysis of generated HTML.
- **Pattern is a first-class content type with stable deep-link URLs.** Patterns are siblings of case studies in the content schema, not a derived view of them.

## Non-goals

- **No multi-user CMS dashboard.** Sanjit is the single author. Content is edited directly in a content repo; there is no editor role, no preview UI for collaborators, no role-based access.
- **No blog/CMS publishing pipeline.** The "Writing" section is a curated list of posts authored in markdown, not a publishing system with drafts, scheduled publish, or RSS-from-CMS.
- **No analytics-driven personalization.** Recruiter-mode is a deterministic client-side toggle (URL param or localStorage flag), not a behavior-derived prediction. The same visitor always sees the same mode unless they toggle.
- **No paid third-party services in the critical rendering path.** Plausible or Umami analytics may load deferred via `requestIdleCallback`, but never on first paint, never blocking the spine line.
- **No bespoke backend.** Serverless functions only. No always-on Node/Python process, no WebSocket server, no custom job runner.

## Success signal

A real recruiter — a real person, not a friend, not a test user — who has never seen the site can visit, within 60 seconds, name what Sanjit builds, why it matters, and which of his case studies they would forward to a hiring manager — and then actually do the forwarding. Measured by: the site is shareable, the forward-button works end-to-end, and at least one real-world forward produces a hiring-manager reply within a week. The site is its own case study in architecture, UI engineering, performance, AI usage, and product thinking — and that fact is visible to anyone who pokes at the deployed artifact.

## Assumptions

- **A1:** Single-author site; multi-role CMS workflows are out of scope.
- **A2:** Recruiter-mode is a deterministic client-side toggle (URL param or localStorage), not a behavior-derived prediction.
- **A3:** Content is edited in a separate content repo; the deployed site reads it via on-demand ISR via webhook.
- **A4:** The spine line is treated as fixed copy, not user-generated.
- **A5:** Performance budgets are CI-enforced, not advisory.
- **A6:** Lab tool demos are iframe-embedded from a sibling Lab host (`lab.sanjit.dev`) to keep the main route's JS budget intact.
- **A7:** Vercel KV is the canonical "live state" store for currently-building entries; the content repo remains the source of truth for static content.

## Open Questions

- **Q1 — Forward-to-hiring-manager payload shape.** Single shareable URL, PDF export, or both? Affects CAP-2 success shape and the serverless function surface.
- **Q2 — Currently-building source of truth.** Vercel KV (phone-updateable without git push) or a `now.mdx` file in the content repo (simpler, git-versioned)? Affects CAP-5 and CAP-6.
- **Q3 — Recruiter-mode analytics.** Measure forward-button clicks (Plausible custom event) or keep it silent? Affects iteration on CAP-2 and observability.
- **Q4 — Lab demo topology.** Iframe embed to a sibling `lab.sanjit.dev` host, or fully independent Next.js routes under `/lab/[slug]`? Affects deploy topology and JS isolation.
- **Q5 — i18n scope.** Bengali support for any user-facing copy (relevant to the 2G-Bangladesh constraint)? Affects font strategy and content schema.
