---
title: "PRD Addendum — Sanjit Majumdar's Engineering Portfolio"
prd: prd-Sanjit-Majumdar-2026-09-23
created: 2026-09-23
---

# PRD Addendum

This addendum holds content that contributes to the build but does not belong in the PRD itself — stack choices, technical how, options-considered, sizing data, in-depth provenance for canonical quotes, and content-schema examples.

The PRD is the formal contract; this addendum is the engineering detail behind the contract. Both are read by `bmad-architecture` and `bmad-create-epics-and-stories`.

---

## A.1 Stack — Next.js 14 App Router on Vercel

**Selected stack:**

- **Framework:** Next.js 14 (App Router) — native ISR + on-demand revalidation + RSC + edge functions in one toolchain. `revalidateTag()` makes the content-update flow a one-liner.
- **Hosting:** Vercel — Build, deploy, ISR, edge functions, KV all on one platform.
- **Content source:** Separate `sanjit-content` repo, markdown + MDX, additive frontmatter, deployed site reads via on-demand ISR via webhook.
- **Live state:** Vercel KV (free tier) for currently-building entries and contact-form submissions.
- **Email:** Resend for the forward-to-hiring-manager contact form.
- **Analytics:** Plausible (self-hostable; deferred via `next/script` `strategy="lazyOnload"`).
- **Error tracking:** Sentry, deferred.
- **CI:** GitHub Actions — Lighthouse CI assertion, gzip-budget check, route-invariant check, content-schema validation, unit tests.

**Why this stack:** the four hardest capabilities of the PRD (CAP-2 forward, CAP-5 on-demand content edit, CAP-6 currently-building feed with fallback, CAP-7 performance budget) all push toward the same shape — static-first, edge-deployable, serverless-only. Next.js + Vercel delivers that shape with the least moving parts. The trade-off is vendor-coupling to Vercel, but the additive content schema and the lack of always-on state mean the site can be lifted to any Next.js-compatible host with a single webhook URL change.

**Why not the alternatives:**

- **Astro** — Astro is excellent for content-heavy sites and would hit the perf budget easily. The reason it loses is the on-demand revalidation story: `revalidateTag()` is first-class in Next.js and a built-out pattern in the community. With Astro, the equivalent requires more glue.
- **SvelteKit** — Same trade-off; smaller ecosystem for the specific Vercel integration we want.
- **A pure SSG approach (Hugo, Jekyll)** — Cannot satisfy CAP-5 (content-editable-without-redeployment) without rebuilding on every push. The whole spec is built around on-demand ISR; pure SSG throws that away.
- **A CMS-driven approach (Sanity, Contentful, Strapi)** — Re-introduces an always-on runtime dependency the constraint set explicitly forbids. A separate content repo + on-demand ISR is the same shape without the runtime.

---

## A.2 PDF Generation — Options Considered (Q1)

**Option A — Server-side via Puppeteer / Chromium on Vercel serverless.** Pros: pixel-perfect, identical to the live page. Cons: Puppeteer on Vercel requires `@sparticuz/chromium` (a 50 MB+ dependency), runs the cold-start penalty on every invocation, and pushes against Vercel's 50 MB serverless function size limit. Estimated cold-start: 2–4 seconds.

**Option B — Client-side via the browser's print-to-PDF.** Pros: zero server cost, no cold start, leverages the user's own browser engine. Cons: requires the user to confirm a print dialog; the output style varies between browsers.

**Option C — Server-side via a lightweight HTML-to-PDF library (e.g., `pdf-lib`).** Pros: small footprint, fast cold start. Cons: does not render CSS / web fonts the same way a browser does; the visual fidelity is lower.

**Recommendation:** **Option A**, with a fallback to **Option B** if the Puppeteer function fails or times out. The 2–4 second cold start is acceptable for an action that takes 10+ seconds of recruiter attention anyway; the visual fidelity wins. The Option B fallback covers the corporate-network case where the serverless function is blocked.

**Decision ownership:** architecture skill (`bmad-architecture`) confirms the Puppeteer cold-start cost on Vercel's free tier before committing.

---

## A.3 Live Architecture Diagram — Options Considered (Q2)

**Option A — Hand-coded SVG component.** Pros: zero runtime cost, version-controlled in code, fully editable. Cons: requires updating by hand when the architecture changes.

**Option B — MDX-embedded React component.** Pros: composition with markdown prose, can be styled via the design system. Cons: requires React on the diagram's page only; doesn't add to other routes' bundle.

**Option C — Generated from the build manifest at build time.** Pros: the diagram always reflects reality (zero drift). Cons: requires a build-time introspection step; more machinery.

**Recommendation:** **Option B** for v1, with the SVG authored as an MDX component. The "How this site is built" page reads the Architecture Diagrams companion (`architecture-diagrams.md`) and renders the component inline. The diagrams are static text-art in the companion file; the MDX component renders them with proper styling and click affordances.

The "live" aspect comes from CAP-5: when the architecture changes, the companion file changes, the content webhook fires, the page revalidates. The diagram is always current because the architecture is always written down.

**Decision ownership:** architecture skill (`bmad-architecture`) drafts the MDX component and confirms it does not regress the homepage JS budget.

---

## A.4 Webhook SLA — Options Considered (Q3)

**Option A — Best-effort webhook.** GitHub Action `repository_dispatch` event calls `POST /api/revalidate?tag=<tag>`. If the call fails, the 5-minute TTL fallback regenerates the page anyway. Pros: zero machinery. Cons: a failed webhook means up to 5 minutes of staleness.

**Option B — Webhook + retry queue.** Use a queue (Vercel KV-backed, or Upstash QStash) to retry failed webhook deliveries with exponential backoff. Pros: tighter freshness guarantee. Cons: extra moving part.

**Recommendation:** **Option A** for v1. The 5-minute TTL is the SLA — the freshness budget for content edits is "under 5 minutes, usually under 10 seconds." That's acceptable for a personal portfolio. Option B is the upgrade path if Sanjit starts editing content more frequently (e.g., multiple edits per day) and the 5-minute window becomes a problem.

---

## A.5 Analytics Fallback — Q4

If Plausible is blocked (corporate networks, ad blockers), the forward-button modal degrades silently. No visible indicator — a visible "analytics blocked" message in the modal would be UX noise for a tool that should feel effortless.

The forward action still works; only the observability of the click is lost. Plausible's data is best-effort, not a contract.

---

## A.6 Pattern Citation Rendering — Q5

**Option A — Sidebar list of patterns cited.** Pros: visible alongside the case-study narrative; doesn't break reading flow. Cons: takes up persistent screen real estate.

**Option B — Inline chips.** Pros: visually distinctive; can be tagged as you read. Cons: can clutter dense narrative sections.

**Option C — "Patterns cited" section at the bottom of the case study.** Pros: clean separation between narrative and citation; the section reads like a citation block in a journal paper. Cons: less visible during the read; users may miss it.

**Recommendation:** **Option C** for v1. The "Patterns cited" section sits at the bottom of every case study as a small `h2` with a list of deep-link cards. Each card shows the pattern's name + `one_line` + `→ Read the full opening` link. The visual treatment is consistent across all case studies.

If analytics show that recruiters miss the section in v1 (SM-4 below target), the upgrade is Option B (inline chips near the decision sections of the case study).

---

## A.7 Verbatim Quote Provenance

The two canonical quotes that must appear verbatim in v1, with their provenance and where they live on the site.

### Spine line

> *"He can do it — whatever you give him to build, he can build it for you, and better than others."*

- **Provenance:** Brainstorm session, 2026-09-23, Lotus Blossom technique. User-supplied as the spine line of the entire portfolio.
- **Where it lives:**
  - `/` (homepage hero, verbatim, in the recruiter-mode variant of the hero)
  - `/for=recruiter&forward=1` (forward artifact hero, verbatim)
  - PDF forward artifact (verbatim, top of page)
  - Persistent positioning header (positioning-line variant: "Senior Software Engineer — whatever you give him to build, he can build it for you.")

### Leadership pushback quote (Pattern 4, move-4 anchor)

> *"I showed him the data, told him this doesn't look optimal enough to be shipped — it needs to pass all tests to be able to be shipped. We cannot ship a weak and faulty product."*

- **Provenance:** Brainstorm session, 2026-09-23, user-supplied as the verbatim quote from a real Brain Station 23 incident (test coverage dropped below 60%, PM pushed to ship, Sanjit argued for a 4-day delay, production incident rate fell 40% the next quarter).
- **Where it lives:**
  - `/patterns/ship-faster-pushback#move-4` (canonical anchor)
  - `/work/wellbook` (if Wellbook case study cites the pattern; rendered as a deep-link card)
  - `/about` (under "How I lead" → "Data before debate" section)
  - PDF forward artifact (only if a leadership-themed case study is selected; otherwise omitted)

---

## A.8 Performance Budget Detail

The full perf budget, beyond the headline numbers in NFR-P.

### Total JS budget per route

- **Homepage:** ≤ 50 KB gzipped on first load. This includes the persistent header, the hero, the proof-number cluster, the recruiter-mode toggle, and the case-study / Lab card previews (server-rendered, with client hydration only on interactive elements).
- **Case-study pages:** ≤ 80 KB gzipped on first load. The extra budget accommodates the "Patterns cited" cards (each is a small client component for hover) and the case-study section toggles.
- **Lab tool pages:** Lab tool iframes are lazy-imported only on card click. The page itself is ≤ 60 KB gzipped; the iframe is a separate request.
- **Pattern pages:** ≤ 50 KB gzipped on first load. Static markdown rendering.
- **`/now` page:** ≤ 50 KB gzipped on first load. Server-rendered feed.

### Image strategy

- **Hero illustration:** inline SVG, no request.
- **Case-study cover images:** AVIF first, WebP fallback, `<picture>` with `srcset`. Maximum 60 KB per image at 1x, 90 KB at 2x. Explicit `width` and `height` on every `<img>` to prevent CLS.
- **Lab tool screenshots:** Same strategy. Plus, if the tool is interactive (`interactive: true` frontmatter), the screenshot is replaced by an iframe.
- **Pattern page illustrations:** Inline SVG when possible; otherwise AVIF.

### Font strategy

- **One variable subset webfont.** Inter or similar. Latin + Bengali glyph subset (the Bengali subset ships in the file even if v1 is English-only — v2 will need it without changing the file).
- **`font-display: swap`**, preloaded.
- **System-ui stack as fallback:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- **No icon fonts.** All icons are inline SVG.

### Third-party JS rule

- **No third-party JS on first paint.** Period. Plausible, Sentry, Resend — all deferred via `next/script` `strategy="lazyOnload"` or `requestIdleCallback`.
- **CSP enforcement.** `next.config.js` sets a strict CSP header. The only allowed third-party origins are Plausible's domain and Resend's API endpoint.

### LCP / TTI / CLS targets

- **LCP:** < 1.8s on Slow 4G mobile. LCP element is the hero headline text.
- **TTI:** < 2.5s on Slow 4G.
- **CLS:** < 0.05 site-wide.
- **INP:** < 200ms (replaces FID in Lighthouse v10+).

### 2G budget

- **Total transferred:** Homepage ≤ 100 KB gzipped. Any other route ≤ 200 KB gzipped.
- **Enforcement:** CI build, asserts gzipped transfer weight. Fails the PR that pushes over.

---

## A.9 Content Schema Examples

Six examples of content files in their final frontmatter shape, drawn from the spec's `content-schema.md` companion.

### Case study (Work bucket)

```yaml
---
title: "Wellbook"
client: "International oil & gas organization"
vector: "scale"  # one of: scale, delivery, performance, leadership
stack: [".NET", "Angular", "SQL Server", "Syncfusion"]
period: { start: "2020-01", end: null }
scale: { users: 10000, data: "complex, data-heavy interfaces" }
metrics:
  - { label: "Active users", value: "10,000+", context: "international client" }
  - { label: "Response time", value: "-35%", context: "production" }
  - { label: "Memory", value: "-25%", context: "production" }
patterns: ["canonical-model", "syncfusion-data-grid"]
proof: ["10K+ users", ".NET + Angular", "Enterprise architecture", "Real-time workflows"]
status: published
created: "2024-09-15"
updated: "2026-09-20"
summary: "Enterprise project & governance platform for an international oil & gas organization."
quote:
  text: "We cannot ship a weak and faulty product."
  attribution: "Sanjit, on a release-delay conversation"
---

## Problem

Wellbook was a long-running enterprise project & governance platform...

## Constraints

[markdown]

## Architecture

[markdown]

## Decisions

[markdown]
...
```

### Lab tool (Lab bucket)

```yaml
---
title: "Markdown Diff Tool"
category: "production"  # one of: production, experiment, personal
what_it_is: "A client-side markdown editor with a custom diff view for comparing revisions."
built_with: ["TypeScript", "React", "Web Workers"]
status_label: "Live"
why_it_exists: "I needed a way to compare markdown drafts without trusting a cloud service with my notes."
interesting_part: "The diff is computed in a Web Worker so the UI never blocks — even on 50K-line files."
patterns: ["canonical-model"]  # this tool applies the canonical-model pattern at small scale
interactive: false
status: published
created: "2025-03-12"
updated: "2026-08-01"
summary: "A client-side markdown editor with a custom diff view for comparing revisions."
---
```

### Pattern

```yaml
---
title: "The Canonical Model Pattern"
opening_number: 1
one_line: "How to integrate many transactional platforms through one canonical system — without writing N unmaintainable adapters."
slug: "canonical-model"
status: published
created: "2026-09-23"
updated: "2026-09-23"
summary: "Define the canonical model first, in language the business already uses."
example_link: "wellbook"
---
```

### Currently-building entry

```yaml
---
title: "CityFix"
started: "2026-08-01"
doing: "Wiring the issue-classifier to the city's open 311 feed."
next: "First end-to-end test with real Dhaka data."
link: "https://github.com/sanjit/cityfix"
status: published
updated: "2026-09-22"
summary: "Making city services easier to discover in Bangladesh."
---
```

### CV / About (single file)

```yaml
---
name: "Sanjit Majumdar"
role: "Senior Software Engineer"
location: "Bangladesh"
contact:
  email: "sanjitmdev@gmail.com"
  phone: "+880 1927025242"
  links:
    - { label: "LinkedIn", href: "https://linkedin.com/in/sanjit-majumdar" }
    - { label: "GitHub", href: "https://github.com/sanjit-majumdar" }
numbers:
  - { label: "Years", value: "7+" }
  - { label: "Users shipped to", value: "10,000+" }
  - { label: "Perf gain", value: "35%" }
  - { label: "Memory reduction", value: "25%" }
philosophy:
  - "Simple beats clever"
  - "Performance is a feature"
  - "AI is a tool, not an architect"
  - "Build for the real world"
---

## About

[markdown body — bio, principles, leadership patterns, personality beats]
```

---

## A.10 Forward Artifact Render Spec

The forward-to-hiring-manager artifact, rendered as both a URL and a PDF, must contain:

1. **Spine line** at the top, verbatim, in a typographic treatment that reads as a positioning statement, not a quote.
2. **Four proof vectors** as a tight cluster of four numbers + labels (7+ yrs / 10K+ users / 35% faster / 7-person team).
3. **One recommended case study** with: title, one-paragraph summary, the scale anchor (`/work/<slug>` URL).
4. **Footer** with the canonical site URL, the spine line in a smaller treatment, and a one-line "Built by Sanjit Majumdar — see more at sanjit.dev."

The PDF version is single-page, A4-portrait, designed for print. The URL version fits in a 1200×630 social-card frame without clipping.

---

## A.11 Open Architecture Decisions (carried into bmad-architecture)

These are the questions the architecture skill should answer, framed by the PRD:

- **`bmad-architecture` decision A** — Which Vercel region(s) for edge functions? Bangladesh visitors should hit a low-latency region; the rest of the world is fine with the default.
- **`bmad-architecture` decision B** — How are content files actually fetched at build / revalidation time — `git clone` in the build step, or a content API backed by the content repo? The webhook flow's reliability depends on this.
- **`bmad-architecture` decision C** — How are case-study pattern citations resolved at build time — string match on slug, or a typed relationship in the schema?
- **`bmad-architecture` decision D** — What's the build-time error model for a malformed frontmatter entry — fail the build, or fall back to a default render? Build-fail is safer; default-fallback is friendlier.
- **`bmad-architecture` decision E** — How is the live architecture diagram kept in sync with the actual deployed system — manual companion updates, or build-time introspection?

---

## A.12 Implementation Note for bmad-build

When `bmad-build` consumes this PRD + addendum, the implementation order should be:

1. **Scaffold the Next.js project** with the additive content schema and the Vercel KV wiring.
2. **Wire the content-update webhook** end-to-end with a test content file.
3. **Build the homepage** with the spine line, hero, proof numbers, and persistent header.
4. **Build the case-study pages** with the pattern citation rendering.
6. **Build the pattern library** with the five patterns and deep-link anchors.
7. **Build the `/now` page** with the stale-state fallback.
8. **Build the Lab index and Lab tool pages** with the Production/Experiment/Personal categorization.
9. **Wire the recruiter-mode toggle** with the URL param and localStorage flag.
10. **Build the forward-to-hiring-manager modal** with both URL and PDF outputs.
11. **Wire Plausible + Sentry** as deferred scripts.
12. **Run the CI gates** — Lighthouse, gzip-budget, route-invariant.
13. **Polish** — visual regressions, mobile testing, slow-network testing.

The order is: infrastructure → content → surface → interactivity → observability → gates. Don't ship a recruiter-mode toggle before the homepage proves the spine line works; don't ship the forward-modal before the case-study pages prove the pattern citations work.

---

*End of addendum.*