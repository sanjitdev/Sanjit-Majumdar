---
title: "Sanjit Majumdar's Engineering Portfolio"
created: 2026-09-23
updated: 2026-09-23
status: final
reviewer_verdict: PASS
reviewer_findings: "Inline validation walk by parent LLM (hobby/solo scope; finalize_reviewers empty in customize.toml). Verdict: PASS — see .memlog.md [event] reviewer gate entry for detail."
spec: ../../specs/spec-sanjit-portfolio/SPEC.md
---

# PRD: Sanjit Majumdar's Engineering Portfolio

*Working title — confirmed.*

## 0. Document Purpose

This PRD is for Sanjit (author, builder, owner), downstream workflow owners (`bmad-architecture`, `bmad-create-epics-and-stories`, `bmad-sprint-planning`, `bmad-build`), and reviewers auditing the build against a stated contract. It is structured with a Glossary-anchored vocabulary, Features grouped with globally numbered stable FR IDs, and inline `[ASSUMPTION: ...]` tags where inferences were made without explicit confirmation.

This PRD builds on upstream artifacts and does not duplicate them:

- **`bmad-spec` output** at `_bmad-output/specs/spec-sanjit-portfolio/` — the canonical five-field kernel contract (`SPEC.md`) plus four companions (`patterns.md`, `content-schema.md`, `architecture-diagrams.md`, `content-sources.md`). The PRD is the formalization of that contract; the spec is the source of truth for any disagreement.
- **`docs/idea.md`** — the author's first-draft portfolio structure and content. Treated as narrative color and prose voice, not as contract.
- **`docs/cv.md`** — the canonical source for all numeric claims about work, stack, scale, and leadership.

## 1. Vision

This is the public engineering portfolio of Sanjit Majumdar — Senior Software Engineer at Brain Station 23 PLC since November 2018, specializing in .NET, Angular, SQL Server, and the integration patterns that make enterprise systems survive their own upgrades. The portfolio's job is not to get Sanjit an interview. The portfolio's job is to **make the interview feel redundant**, because the evidence of Tech Lead-level engineering judgment is already on the screen.

The site is organized around five named engineering patterns — not around jobs. The patterns are: the Canonical Model (for multi-platform ERP integration), the Syncfusion Data-Grid (for high-performance Angular data UIs at scale), the nopCommerce Plugin (for extending third-party commerce platforms without forking), the Ship-Faster Pushback (for delaying releases with receipts), and the Friday Architecture Review (for owning technical decisions across a team without becoming a bottleneck). Case studies cite the patterns they used; the Lab tools cite the patterns they exercise.

The site itself is its own case study. It demonstrates architecture, UI engineering, backend performance, AI usage, accessibility, observability, and product thinking — all in one public artifact. The recruiter-mode toggle, the deep-linkable pattern pages, the live architecture diagram, the "currently building" feed, and the forward-to-hiring-manager button are not features added to a portfolio — they *are* the portfolio. They prove the engineering judgment by being evidence of it.

## 2. Target User

### 2.1 Jobs To Be Done

- **Recruiter (functional):** Quickly determine whether Sanjit is a Tech Lead candidate worth forwarding, in 30 seconds or less, without leaving the site.
- **Hiring manager (functional + emotional):** Receive a forwarded artifact from a recruiter, form a credible first impression of Sanjit in 60 seconds, and decide whether to invest a 30-minute conversation.
- **Fellow engineer (functional + social):** Read how Sanjit thinks, see whether his engineering judgment is sharp, and judge whether they'd want to pair with him.
- **Sanjit himself (functional + emotional):** Maintain a public engineering playground that demonstrates his craft, grows with him, and never requires a CMS dashboard to update.

### 2.2 Non-Users (v1)

- Multi-user CMS collaborators. Sanjit is the sole author; no editor roles, no preview UI.
- Hiring managers who require a PDF résumé as the primary artifact. The interactive site *is* the artifact; a PDF export is a convenience (see FR-9), not the primary surface.
- Non-technical visitors who need a video walkthrough. The site's text is technical by design; a guided tour is a v2 follow-on.
- Visitors who need Bengali localization. The site is English-first in v1 (see `[ASSUMPTION: A7]`).

### 2.3 Key User Journeys

- **UJ-1. Priya scans Sanjit's portfolio in 30 seconds and decides to forward it.**
  - **Persona + context:** Priya, a tech recruiter at a mid-sized firm, has been asked by her hiring manager to source Tech Lead candidates for a .NET/Angular role. She has 40 portfolios to triage today.
  - **Entry state:** Clicks a link from Sanjit's LinkedIn profile. Cold visit. On a corporate laptop, decent wifi, no time to waste.
  - **Path:** (1) Homepage loads in under 1.5s. (2) Sees the spine line + four proof numbers immediately. (3) Notices the recruiter-mode toggle in the top-right. (4) Clicks it. (5) Sees the condensed forward-ready view: spine line + four proof vectors + "Forward to hiring manager" button + two recommended case studies. (6) Clicks "Forward to hiring manager." (7) A modal opens with a shareable URL and a PDF download.
  - **Climax:** Priya forwards the URL to her hiring manager via Slack DM in under 10 seconds. The artifact is legible cold — the hiring manager doesn't need to click around to understand Sanjit.
  - **Resolution:** Sanjit has a real recruiter forward in 60 seconds of his site being visited.
  - **Edge case:** Priya is on a corporate network that blocks the PDF download. The URL still works; the forward still happens.

- **UJ-2. Marcus, a hiring manager, receives the forwarded link and forms a verdict in 60 seconds.**
  - **Persona + context:** Marcus, engineering director, has been forwarded a link by Priya with the message "worth 30 minutes."
  - **Entry state:** Clicks the link in Slack. The URL contains `?for=recruiter&forward=1&case=wellbook`. The site lands in recruiter-mode.
  - **Path:** (1) Sees the spine line. (2) Sees the four proof vectors with numbers. (3) Sees one recommended case study (Wellbook). (4) Clicks through to the Wellbook case study. (5) Sees the case study opens with the same spine line, the proof numbers, and a "Patterns cited" section listing Canonical Model + Syncfusion Data-Grid. (6) Clicks into the Syncfusion Data-Grid pattern page. (7) Reads three moves, sees the verbatim "we cannot ship a weak and faulty product" quote on the Ship-Faster Pushback pattern page.
  - **Climax:** Marcus has read enough engineering judgment to know whether to invest the 30-minute conversation. The decision is informed, not gut.
  - **Resolution:** Marcus replies to Priya with "yes, schedule it" or "no, pass" — and can justify either answer from the site alone.

- **UJ-3. Sam, a senior engineer, follows a pattern deep link from a Slack thread.**
  - **Persona + context:** Sam, senior backend engineer at a fintech, saw a Slack thread where someone shared Sanjit's pattern URL for "Canonical Model."
  - **Entry state:** Clicks `sanjit.dev/patterns/canonical-model`. Cold visit. On a personal laptop, decent wifi, has 5 minutes.
  - **Path:** (1) Loads the pattern page in under 1.2s. (2) Reads the "when this applies" section. (3) Reads the five moves. (4) Reads the counter-lines — recognizes the "direct DB write" counter-line because Sam has lived it. (5) Clicks the "Example: Wellbook case study" link at the bottom. (6) Reads the case study and sees how the pattern was applied. (7) Bookmarks the pattern URL.
  - **Climax:** Sam has formed an opinion of Sanjit's engineering judgment that he'll carry into any future contact. The pattern page is independently shareable; it doesn't need the homepage to make sense.
  - **Resolution:** Sam has the bookmark. He'll check back when Sanjit publishes a new pattern or a new case study that uses one.

## 3. Glossary

- **Spine line** — The single sentence the entire site exists to prove: *"He can do it — whatever you give him to build, he can build it for you, and better than others."* Appears verbatim on the recruiter-mode hero; positioning-line variants appear on every public page. Fixed copy.
- **Proof vector** — One of four concrete categories of evidence about Sanjit: Stack diversity, Scale, Engineering depth, Leadership. Each vector carries specific numbers from the CV.
- **Pattern** — A named, transferable engineering approach that Sanjit reaches for across projects. Five locked for v1: Canonical Model, Syncfusion Data-Grid, nopCommerce Plugin, Ship-Faster Pushback, Friday Architecture Review. Each has a stable URL and is cited by case studies.
- **Opening** — Synonym for Pattern, used in the chess-opening-book framing.
- **Move** — One of 2–5 named actions within a Pattern. Deep-linkable by `<slug>#move-<n>`.
- **Counter-line** — A specific situation in which the Pattern does *not* apply, with the response.
- **Case study** — A Work-bucket artifact covering a specific project, structured Problem → Constraints → Architecture → Decisions → Implementation → Challenges → Results. Cites patterns via `patterns:` frontmatter.
- **Currently-building entry** — A short entry in the `/now` feed describing what Sanjit is shipping.
- **Lab tool** — A Lab-bucket artifact (tools, games, experiments, visualizations). Categorized as `production` / `experiment` / `personal`.
- **Additive schema** — The content schema rule that every frontmatter field except `title` is optional; unknown keys are preserved via Zod `.passthrough()`. Adding a field never breaks an old entry.
- **On-demand revalidation** — The ISR pattern where a content edit triggers a webhook that calls `revalidateTag()` on the affected route, regenerating only that route within seconds without running the main build pipeline.
- **ISR (Incremental Static Regeneration)** — Next.js's hybrid rendering: pages are statically generated, then re-generated on demand when their content changes.
- **Recruiter-mode** — A client-side toggle (URL param `?for=recruiter` or localStorage flag) that switches the site's surface to a forward-ready view with the spine line, four proof vectors, and the forward-to-hiring-manager button.
- **Forward artifact** — The output of the forward-to-hiring-manager action: a shareable URL plus a PDF. The artifact is legible cold (no prior context required) and renders correctly in Gmail, Outlook, Slack, and LinkedIn DM previews.
- **Pattern library** — The collection of patterns at `/patterns`, organized as an index plus per-pattern deep pages.
- **Decentralized page** — A public route that is a standalone proof surface: spine line + at least one proof number + return path. Removing the homepage from the navigation graph does not break the credibility of any other page.
- **Last-good snapshot** — A fallback JSON file committed to the content repo that the currently-building feed renders when its live source (Vercel KV) is cold or stale. Tagged honestly with `(last updated N days ago)`.
- **Stale-state fallback** — The behavior the currently-building feed uses when its live source returns no data: render the last-good snapshot with an honest timestamp tag, never an empty section or error state.

## 4. Features

### 4.1 Recruiter-Grade First Impression

**Description:** A visitor landing on any public page of the portfolio can, within 30 seconds, name who Sanjit is, what stack he works in, how long he has been doing it, what scale of system he has shipped, and what level of ownership he has held. The homepage is the canonical first-impression surface; the persistent header carries the brand into every other route (UJ-1, UJ-2). Realizes CAP-1.

**Functional Requirements:**

#### FR-1: Persistent positioning header on every public route

A persistent header appears on every public route carrying: (a) the brand mark "Sanjit Majumdar · Engineering," (b) a one-line positioning variant of the spine line, (c) a minimal navigation affordance (Work / Lab / Projects / Now). The header is small (≤ 8 KB gzipped), persistent, and never obstructs content.

**Consequences (testable):**
- Static analysis of generated HTML across all public routes asserts the header is present on every route.
- The header renders within the first 200ms of first paint on Slow 4G mobile.

#### FR-2: Hero with spine line and proof numbers

The homepage hero displays the spine line verbatim, the four proof numbers (7+ yrs / 10K+ users / 35% faster / 7-person team) as a tight visual cluster, and a positioning line ("Senior Software Engineer specializing in .NET, Angular, APIs and scalable systems"). Recruiter-mode replaces the positioning line with a condensed forward-ready view.

**Consequences (testable):**
- Static analysis asserts the spine line text appears verbatim on the homepage hero.
- Static analysis asserts the four proof numbers appear in the hero.
- Recruiter-mode toggle visibly changes the hero within 100ms (no server hit; client-side state).

#### FR-3: Recruiter-mode toggle

A small, persistent toggle in the top-right of every page labeled "For recruiters" switches the site into recruiter-mode (UJ-1). The toggle is a client component that sets a localStorage flag and updates the URL with `?for=recruiter`. The URL change makes recruiter-mode deep-linkable: a recipient clicking a `?for=recruiter` URL lands in recruiter-mode without needing to click the toggle.

**Consequences (testable):**
- Clicking the toggle visibly changes the page (hero, case-study cards, lab cards) within 100ms.
- Reloading the page with `?for=recruiter` in the URL renders recruiter-mode on first paint.
- No server hit occurs on toggle. Network tab confirms.
- Toggling persists across reloads (localStorage) and across navigation (URL param survives `replaceState`).

**Out of Scope:** Behavior-derived recruiter detection (e.g., inferring from referrer URL). The toggle is deterministic.

### 4.2 Recruiter-Mode Forward-to-Hiring-Manager

**Description:** A recruiter who has decided Sanjit is worth a conversation can produce a single shareable artifact that lands the spine line, the four proof vectors, and one or two recommended case studies in a hiring manager's inbox without any editing (UJ-1, UJ-2). Realizes CAP-2.

**Functional Requirements:**

#### FR-4: Forward-to-hiring-manager button

A "Forward to hiring manager" button appears in recruiter-mode on every page. Clicking it opens a modal with two outputs: a shareable URL and a downloadable PDF (per `[ASSUMPTION: A4]`). The modal also shows a preview of the artifact content before the recruiter commits.

**Consequences (testable):**
- The button is visible in recruiter-mode on every page (asserted via static analysis).
- Clicking it opens a modal in under 100ms.
- The modal's URL output is a `?for=recruiter&forward=1&case=<slug>` URL that resolves to the recruiter-mode view.
- The modal's PDF output downloads a single-page PDF rendering the spine line + four proof vectors + the recommended case study.

#### FR-5: Shareable recruiter-mode URL

The shareable URL renders the spine line, four proof vectors, and one recommended case study cold — without requiring the recipient to click anything other than the link. The URL survives preview rendering in Gmail, Outlook, Slack, and LinkedIn DM (the page's first 600px of content is the shareable artifact, optimized for Open Graph / Twitter Card / Slack unfurl).

**Consequences (testable):**
- Opening the URL in an incognito window with no cookies renders the full artifact on first paint.
- Slack/Twitter/Gmail link-preview metadata (OG title, description, image) is set such that the preview contains the spine line and at least one proof number.
- A visual regression test asserts the artifact fits in a 1200×630 social-card frame without clipping.

#### FR-6: PDF forward artifact

A single-page PDF, downloadable from the forward-modal, containing the spine line, the four proof vectors, one recommended case study, and a footer with the canonical site URL. The PDF is generated server-side via a serverless function (per Open Question Q6 — see addendum for options-considered).

**Consequences (testable):**
- The PDF downloads within 5 seconds of clicking the download button.
- The PDF opens in standard PDF readers (Preview, Chrome, Adobe) with all content legible at A4 print scale.
- The PDF is under 500 KB.

### 4.3 Pattern Library

**Description:** The portfolio is organized around five named engineering patterns, not around jobs or a project list. Each pattern has a stable URL, deep-linkable moves, and is cited by case studies and Lab tools (UJ-3). Realizes CAP-3.

**Functional Requirements:**

#### FR-7: Five named patterns at stable URLs

The five patterns — Canonical Model, Syncfusion Data-Grid, nopCommerce Plugin, Ship-Faster Pushback, Friday Architecture Review — are published at `/patterns/<slug>` with stable URLs. Each pattern page renders: setup (when this applies), 2–5 named moves, counter-lines, and an annotation. The Ship-Faster Pushback pattern's `move-4` anchor carries the verbatim quote.

**Consequences (testable):**
- Each of the five pattern URLs returns 200 and renders the pattern structure (asserted via integration test).
- The verbatim quote is present at the Ship-Faster Pushback pattern's `move-4` anchor.
- Deep links `/patterns/<slug>#move-<n>` resolve to specific moves.

#### FR-8: Pattern deep-linkability

Each pattern's moves are deep-linkable individually (`#move-1` through `#move-5`). The case-study and Lab-tool pages cite patterns via the `patterns:` frontmatter field, rendered as deep-link cards with `→ Read the full opening` going to `/patterns/<slug>#move-<n>`.

**Consequences (testable):**
- Static analysis of generated HTML for case-study pages asserts the `→ Read the full opening` links resolve to live pattern URLs.
- The pattern page's `#move-<n>` anchors are present and focusable.

#### FR-9: Pattern index page

A `/patterns` index page lists the five patterns as cards, each with `one_line` (the spine sentence shown large). The index page is reachable from the main navigation.

**Consequences (testable):**
- The `/patterns` page returns 200 and lists exactly five patterns.
- Each card links to its individual pattern URL.

### 4.4 Decentralized Page-as-Proof Surface

**Description:** Every public route — homepage, case study, lab tool, pattern, /now, /about — is a standalone proof surface, not a deep link off a lobby page. Removing the homepage from the navigation graph does not break the credibility of any other page (UJ-2, UJ-3). Realizes CAP-4.

**Functional Requirements:**

#### FR-10: Spine-line + proof-number + return-path invariant

Every public route renders with: (a) the spine line or a positioning-line variant, (b) at least one proof number from the four-vector set, and (c) a visible path back to the rest of the site. This is a route-level invariant enforced in CI via static analysis of generated HTML.

**Consequences (testable):**
- A CI script walks the build output and asserts every route under `/`, `/work`, `/projects`, `/lab`, `/patterns`, `/now`, `/about` contains the spine-line variant, at least one proof number, and a navigation link back to the homepage.
- Failing the assertion fails the build.

#### FR-11: Independent shareability

Each public route, when shared as a cold link, renders legible content without requiring the visitor to have seen any other page. Case-study pages, pattern pages, and Lab tool pages are independently shareable.

**Consequences (testable):**
- Open-graph metadata is set per route (not just site-wide).
- Each route's metadata (title, description, image) reflects the route's content, not the site's overall content.

### 4.5 Content Editing Without Redeployment

**Description:** Sanjit can edit any content file (case study, pattern, lab tool, currently-building entry, CV line) and see the change live without running a build pipeline or pushing to the main code repo (UJ-1 through UJ-3 all rely on this — content freshness is the meta-feature). Realizes CAP-5.

**Functional Requirements:**

#### FR-12: Content source in a separate repo

All portfolio content lives in a separate content repo (`sanjit-content` per `[ASSUMPTION: A3]`). The deployed site reads content via on-demand ISR via a webhook from the content repo's `repository_dispatch` event.

**Consequences (testable):**
- A change to a content file in the content repo triggers `POST /api/revalidate?tag=<tag>` within 30 seconds of push.
- The deployed route reflects the change within 5 seconds of the webhook delivery.
- The main build pipeline does not run on content pushes (asserted via CI log inspection).

#### FR-13: Additive content schema

All content is parsed via Zod with `.partial()` and `.passthrough()`. Every frontmatter field except `title` is optional. Unknown keys are preserved and exposed via `entry.meta`. Adding a new field never breaks an old entry.

**Consequences (testable):**
- A unit test asserts that an entry missing a new field still renders correctly.
- A unit test asserts that an entry with unknown extra fields still renders and exposes those fields via `entry.meta`.

#### FR-14: TTL fallback for ISR

A `revalidate: 300` (5 minutes) TTL is set on every ISR route as a fallback for webhook delivery failure. If the webhook fails, the route regenerates within 5 minutes regardless.

**Consequences (testable):**
- An integration test disables the webhook and asserts the route regenerates within 5 minutes (via TTL).

### 4.6 Live "Currently Building" Feed

**Description:** A live feed shows what Sanjit is shipping right now, and the page never errors if the upstream source is cold (UJ-1). Realizes CAP-6.

**Functional Requirements:**

#### FR-15: /now page with live feed

A `/now` page (Sivers convention) lists the latest currently-building entries. The page is reachable from the main navigation and from the homepage's currently-building section.

**Consequences (testable):**
- The `/now` page returns 200 and renders at least one currently-building entry.
- The page is linked from the main navigation.

#### FR-16: Currently-building homepage section

The homepage renders a small currently-building section with the latest 3–5 entries from the feed.

**Consequences (testable):**
- Static analysis asserts the homepage renders the currently-building section.
- The section renders the latest entries by `updated` timestamp.

#### FR-17: Stale-state fallback

If the live source (Vercel KV per `[ASSUMPTION: A5]`) returns no data or is stale (>7 days), the feed renders the last-good snapshot committed to the content repo at `now-snapshot.json`, tagged honestly with `(last updated N days ago)`. The feed never renders an empty state, never renders an error.

**Consequences (testable):**
- An integration test stubs the live source to return empty data and asserts the feed renders the last-good snapshot with the honest tag.
- An integration test stubs the live source to return data older than 7 days and asserts the feed renders the snapshot.

#### FR-18: RSS / Atom feed

The currently-building feed is exposed as an RSS / Atom feed at `/now/feed.xml`. Recruiters or visitors who subscribe get a quiet notification on every update.

**Consequences (testable):**
- The `/now/feed.xml` URL returns 200 with `Content-Type: application/atom+xml`.
- The feed contains the latest currently-building entries.

### 4.7 Performance Budget Enforcement

**Description:** The site loads fast enough that a recruiter on a bad network never bounces and an engineer on a 2G connection in Bangladesh can still see the spine line. Realizes CAP-7.

**Functional Requirements:**

#### FR-19: Homepage first paint under 1.8s LCP on Slow 4G

The homepage's LCP element (the hero headline text) paints within 1.8 seconds on a throttled Slow 4G mobile profile in Lighthouse CI.

**Consequences (testable):**
- Lighthouse CI assertion: homepage LCP < 1.8s. Failing the assertion fails the build.

#### FR-20: Total transfer under budget

Homepage total transfer is under 100 KB gzipped. Any other public route is under 200 KB gzipped. Enforced by a CI check that builds the site, hits each route, and asserts the gzipped weight.

**Consequences (testable):**
- A CI script asserts `gzip_size(homepage) < 100 KB` and `gzip_size(any_other_route) < 200 KB`.

#### FR-21: Lighthouse Performance ≥ 95

A CI Lighthouse assertion on the mobile profile, Slow 4G throttling, asserts Performance score ≥ 95. Failing the assertion fails the build.

**Consequences (testable):**
- Lighthouse CI assertion: Performance ≥ 95.

#### FR-22: No third-party JS on critical path

No third-party JavaScript (analytics, chat widgets, embeds) loads on first paint. Anything deferred loads via `next/script` with `strategy="lazyOnload"`.

**Consequences (testable):**
- A CI script asserts no third-party JS appears in the critical rendering path (network waterfall check).

## 5. Non-Goals (Explicit)

- **No multi-user CMS dashboard.** Sanjit is the sole author. Content is edited directly in a content repo; no editor role, no preview UI for collaborators, no role-based access.
- **No blog/CMS publishing pipeline.** The "Writing" section is a curated list of posts authored in markdown, not a publishing system with drafts, scheduled publish, or RSS-from-CMS.
- **No analytics-driven personalization.** Recruiter-mode is a deterministic client-side toggle, not a behavior-derived prediction. The same visitor always sees the same mode unless they toggle.
- **No paid third-party services in the critical rendering path.** Plausible or Umami analytics may load deferred via `requestIdleCallback`, but never on first paint, never blocking the spine line.
- **No bespoke backend.** Serverless functions only. No always-on Node/Python process, no WebSocket server, no custom job runner.
- **No Bengali localization in v1.** The 2G-Bangladesh constraint drives performance budget, not localization. Bengali is a v2 follow-on.
- **No behavior-derived recruiter detection.** Recruiter-mode is a deterministic toggle, not inferred from referrer, viewport, or session behavior.
- **No CMS preview UI.** Authors edit content via markdown files and a `git push`; no WYSIWYG preview, no draft preview tokens.

## 6. MVP Scope

### 6.1 In Scope

- All five patterns published at stable URLs (FR-7, FR-8, FR-9).
- All four proof vectors surfaced across the homepage, recruiter-mode, and case studies.
- Recruiter-mode toggle on every page (FR-3).
- Forward-to-hiring-manager button with both URL and PDF outputs (FR-4, FR-5, FR-6).
- Persistent positioning header on every public route (FR-1).
- Decentralized page-as-proof invariant (FR-10, FR-11).
- Content editing without redeployment via webhook + ISR (FR-12, FR-13, FR-14).
- Currently-building feed with stale-state fallback (FR-15, FR-16, FR-17).
- RSS / Atom feed at `/now/feed.xml` (FR-18).
- Performance budget enforcement in CI (FR-19, FR-20, FR-21, FR-22).
- At least 3 case studies (Work bucket) at v1 launch, citing patterns. A fourth case study is acceptable but not required.
- At least 5 Lab tools across Production / Experiment / Personal categories.
- Live architecture diagram ("How this site is built") as a clickable SVG component.

### 6.2 Out of Scope for MVP

- Bengali localization. (v2)
- Writing/blog section with full publishing pipeline. (v2)
- Multi-author CMS workflows. (v2 or never)
- Search functionality across the site. (v2)
- Comment / reaction system. (likely never)
- Newsletter signup beyond the optional RSS-driven email digest. (v2)
- Real-time collaboration on case-study drafts. (never)
- A/B testing of the spine line or hero copy. (never — the spine line is fixed)

## 7. Success Metrics

**Primary**

- **SM-1**: At least one real recruiter (not a friend, not a test user) forwards the site to a hiring manager within 30 days of launch, and the hiring manager replies with substantive engagement within 7 days of the forward. Validates FR-4, FR-5, FR-6, FR-10, FR-11. Definition: a real forward event captured via Plausible custom event + a manual confirmation of the reply.

- **SM-2**: Lighthouse Performance score ≥ 95 on CI across every PR, with zero regressions over a 4-week rolling window. Validates FR-19, FR-20, FR-21, FR-22.

- **SM-3**: A cold link to a case-study page (no homepage visit, no prior context) produces a recruiter-mode toggle or forward-button click within 7 days of launch, measured via Plausible custom event on `?forward=1` URL opens. Validates FR-11.

**Secondary**

- **SM-4**: At least one pattern deep-link (`/patterns/<slug>#move-<n>`) is shared externally (LinkedIn post, Slack thread, blog post) within 90 days of launch. Validates FR-8, FR-9. Measured via Plausible custom event on deep-link URL fragment visits.

- **SM-5**: Zero build-pipeline runs triggered by content edits over a 30-day rolling window. Validates FR-12, FR-13, FR-14. Measured via CI log audit.

- **SM-6**: The currently-building feed renders the last-good snapshot with the honest `(last updated N days ago)` tag — never an empty section, never an error — over 100% of requests in a 30-day rolling window. Validates FR-17.

**Counter-metrics (do not optimize)**

- **SM-C1**: Do not optimize for *time-on-site*. The portfolio is a 30-second-scan-and-forward tool, not an engagement surface. A recruiter who lands, scans, and forwards in 45 seconds is a success. Optimizing for time-on-site would push toward longer hero copy, more carousels, and animated reveals — all of which work against the spine line.

- **SM-C2**: Do not optimize for *raw visitor count*. The site serves recruiters and engineers, not the general public. A site with 200 qualified-recruiter visits per month outperforms a site with 20,000 random visits. Optimizing for visitor count would push toward SEO-bait content and link-building — both of which work against the engineering-judgment framing.

- **SM-C3**: Do not optimize for *number of Lab tools published*. The Lab's quality framing depends on each tool being a credible engineering artifact. Optimizing for tool count would push toward shallow demos. Five good tools beat fifty shallow ones.

## 8. Open Questions

- **Q1** — How is the PDF forward artifact generated — server-side via Puppeteer/Chromium on a Vercel serverless function, or client-side via the browser's print-to-PDF? Affects FR-6 implementation. (See addendum §A.2 for options-considered.)
- **Q2** — How is the live architecture diagram ("How this site is built") authored — hand-coded SVG, MDX-embedded React component, or generated from the build manifest at build time? Affects FR-1 (header) and the Architecture Diagrams companion. (See addendum §A.3 for options-considered.)
- **Q3** — What is the SLA for the on-demand revalidation webhook — best-effort, or backed by a queue with retry? Affects FR-12, FR-14. (See addendum §A.4 for options-considered.)
- **Q4** — What is the fallback for the forward-button modal if Plausible analytics is blocked — silent failure or visible indicator? Affects FR-4 observability. (See addendum §A.5.)
- **Q5** — How are case studies' `pattern:` citations surfaced in the case-study rendering — a sidebar list, inline chips, or a "Patterns cited" section? Affects FR-7 ↔ case-study rendering interaction. (See addendum §A.6.)

## 9. Assumptions Index

*Every `[ASSUMPTION]` from the document, surfaced for explicit confirmation:*

- **A1 (§4.6, MVP Scope)** — v1 ships all 5 patterns and all 4 proof vectors in scope, no MVP cut.
- **A2 (§4.1, FR-3)** — Recruiter-mode toggle is a deterministic client-side toggle (URL param `?for=recruiter` or localStorage flag), not a behavior-derived prediction.
- **A3 (§4.5, FR-12)** — Content source is a separate `sanjit-content` repo; deployed site reads it via on-demand ISR via webhook.
- **A4 (§4.2, FR-4)** — Forward-to-hiring-manager payload ships as BOTH a shareable URL AND a PDF.
- **A5 (§4.6, FR-17)** — Currently-building source of truth is the content repo's `now.mdx` file, with a Vercel KV mirror for phone-updateable entries. KV is the cache; content repo is the source.
- **A6 (§11, Observability)** — Recruiter-mode analytics are measured (Plausible custom event on forward-button click + on recruiter-mode toggle). Iteration on FR-4 requires observability.
- **A7 (§2.2, Non-Users; §5, Non-Goals)** — No Bengali i18n in v1.
- **A8 (§4.3, FR-8)** — Pattern deep-link anchors use the `#move-<n>` convention, with moves numbered 1–5 in declaration order.
- **A9 (§4.5, FR-13)** — The Zod schema's `.passthrough()` exposes unknown keys on `entry.meta` so authors can experiment with new fields without code changes.
- **A10 (§11, Constraints)** — Vercel KV is the canonical "live state" store for currently-building entries; the content repo remains the source of truth for static content.

## 10. Cross-Cutting NFRs

### NFR-P Performance

- **LCP target:** < 1.8s on Slow 4G throttled mobile, with the LCP element being the hero headline text (no images in LCP path).
- **TTI target:** < 2.5s on Slow 4G.
- **CLS:** < 0.05 site-wide.
- **Total JS budget:** ≤ 50 KB gzipped on first load (homepage), ≤ 80 KB on case-study pages (they hydrate the interactive decision trail). Lab tool iframes are lazy-imported only on card click.
- **Total transfer budget:** Homepage ≤ 100 KB gzipped; any other route ≤ 200 KB gzipped.
- **Images:** AVIF first, WebP fallback, `<picture>` with `srcset`. Hero illustration is inline SVG. All raster images pass through `next/image` with explicit width/height to kill CLS. Maximum raster weight per page: 150 KB.
- **Fonts:** One variable subset webfont (latin + Bengali glyph subset ready, per `[ASSUMPTION: A7]` only Latin ships in v1), `font-display: swap`, preloaded. System-ui stack as the immediate fallback. No icon fonts — SVGs only.

### NFR-A Accessibility

- **WCAG 2.1 AA target.** All interactive components keyboard-navigable. All images have meaningful alt text or empty alt for decorative. Color contrast meets AA. Focus indicators visible. The recruiter-mode toggle and the forward-modal are tested with screen readers.
- **No motion-based essential information.** Any animations are decorative; users with `prefers-reduced-motion` see no motion.

### NFR-S Security Posture

- **No secrets in content.** The content repo is public; no API keys, no credentials, no personal data beyond what's already in `cv.md`.
- **Contact form via serverless.** The "Forward to hiring manager" contact form posts to a serverless function that emails via Resend; the email service API key lives in Vercel environment variables, never in content.
- **Content Security Policy:** strict CSP set in `next.config.js` headers; analytics is whitelisted, all other third-party JS is blocked.

### NFR-O Observability

- **Plausible analytics, deferred.** Loaded via `next/script` with `strategy="lazyOnload"`. Custom events: `forward_button_click`, `recruiter_mode_toggle`, `pattern_deep_link_visit`, `case_study_forward_open`.
- **Error tracking:** Sentry (or equivalent) loaded deferred. Captures client-side errors only; no PII.
- **Synthetic monitoring:** Vercel Speed Insights or equivalent for performance regression detection between PRs.

### NFR-C Content Durability

- **CV-as-source-of-truth.** The CV lives as `cv.md` in the content repo; the deployed site reads from it. The CV can never go out of sync with the site because they share a source.
- **Additive schema.** (See FR-13.) Adding a content field never breaks an old entry.
- **Last-good snapshot fallback.** (See FR-17.) The currently-building feed never errors on stale data.
- **Public commit history.** The site's content repo is public; recruiters can see the evolution of Sanjit's positioning over time, which is itself a signal of self-reflection.

## 11. Constraints and Guardrails

### Hosting & Infrastructure

- **Vercel-hosted frontend + serverless functions.** No external infrastructure. Build, deploy, ISR, edge and regional functions all live on one platform.
- **No always-on database.** State that must persist across deploys lives in Vercel KV (free tier). No Postgres, no Mongo, no Redis-on-VM.
- **Static-first rendering.** Every public route is SSG or ISR. Client-side hydration is island-loaded only where it earns weight.

### Content Schema

- **Additive schema enforced.** All content is parsed via Zod with `.partial()` and `.passthrough()`. (See FR-13.)
- **Filename → slug convention.** Slugs derive from filenames; `content/case-studies/wellbook.mdx` → `slug: wellbook`. Authors can override via `slug` frontmatter. CI asserts unique slugs across the published set.

### CI Enforcement

- **Lighthouse Performance ≥ 95 in CI.** Mobile profile, Slow 4G throttling. PRs that regress any performance number fail the build.
- **Gzip-budget check in CI.** Homepage < 100 KB; other routes < 200 KB. Failing the check fails the build.
- **Route-invariant check in CI.** Every public route contains the spine-line variant, at least one proof number, and a navigation link back to the homepage. (See FR-10.)

### Third-Party Services

- **No paid third-party services in the critical rendering path.** Plausible analytics and Sentry load deferred. Anything else (chat widgets, embeds, fonts beyond the subset webfont) is forbidden on first paint.
- **Resend for email.** The forward-to-hiring-manager contact form emails via Resend; the API key lives in Vercel env, never in content.

### Cost & Free Tier

- **Vercel free tier sufficient for v1.** Hobby-tier Vercel supports ISR, KV, and serverless functions at portfolio-traffic scale. No paid tier required until the site receives >100K visitors/month or >1M serverless invocations/month.

---

*End of PRD. Addendum (`addendum.md`) holds overflow content: stack choices, ADR shape, options-considered on the 5 open questions, verbatim quote provenance, performance-budget detail, and content-schema examples.*
