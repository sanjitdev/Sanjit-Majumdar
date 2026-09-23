---
type: spec-companion
spec: SPEC-sanjit-portfolio
title: "Content Sources — Proof-Vector Evidence and Source Paths"
---

# Content Sources

This companion holds two things:

1. The **proof-vector evidence table** — the strongest concrete evidence for each of the four proof vectors, so downstream code and copy both pull from a single source.
2. The **canonical source paths** for the brainstorm artifacts this spec was distilled from, so a future bmad-spec update can re-read them.

---

## Proof-Vector Evidence

The four proof vectors and the strongest evidence backing each. Every claim on the deployed site should map back to one of these rows.

### Stack diversity

- 5+ e-commerce platforms integrated at Brain Station 23 (nopCommerce, Shopify, others).
- Stack: .NET, C#, Angular, TypeScript, SQL Server, Syncfusion, nopCommerce plugin contract, Shopify API.
- 10+ custom nopCommerce plugins delivered across 4+ years.
- Shopify plugin for product image management and inventory workflows.
- ERP integrations across 5+ platforms.

### Scale

- 10,000+ active users on the Norwegian client enterprise app.
- Data-heavy Syncfusion interfaces (large grids, complex filtering, real-time workflows).
- Production system supporting international client with high reliability for 4+ years.

### Engineering depth

- 35% response-time improvement in production.
- 25% memory consumption reduction in production.
- Achieved through targeted backend and frontend optimizations — server-side grid operations, virtualization, OnPush change detection, query tuning, covering indexes.
- (See pattern `syncfusion-data-grid` for the full pattern.)

### Leadership

- Led a 7-member cross-functional team (4 engineers + 3 QA).
- Managing delivery through Azure Boards.
- Enforcing high code quality via code reviews and mentoring.
- Concrete consequence: pushed back on "ship faster" pressure when test coverage dropped below 60%, convinced the PM to delay the release by 4 days, production incident rate fell 40% over the next quarter.
- (See pattern `ship-faster-pushback` for the verbatim quote and pattern `friday-architecture-review` for the day-to-day leadership shape.)

---

## Spine Line and Verbatim Quotes

### Spine line (recruiter-mode hero, fixed copy)

> *"He can do it — whatever you give him to build, he can build it for you, and better than others."*

This is the line the entire site exists to prove. It is the hero of recruiter-mode and a positioning-line variant appears on every public page (CAP-4).

### Leadership pushback quote (Pattern 4, move-4 anchor)

> *"I showed him the data, told him this doesn't look optimal enough to be shipped — it needs to pass all tests to be able to be shipped. We cannot ship a weak and faulty product."*

The exact line, in Sanjit's own words, that convinced the PM. Lives at `/patterns/ship-faster-pushback#move-4` as a stable URL. Recruiters can paste this line verbatim into a hiring-meeting email.

### Anticipatory design framing (memorability thesis, not copy)

The portfolio becomes memorable not because it's clever, but because it makes the visitor feel *already understood* — the site answers the visitor's unspoken thinking so visibly they're impressed it read their mind. This is the design philosophy that drove every decision in the brainstorm; it isn't copy on the page, it's the principle the page implements.

---

## Engineering Philosophy (Author Voice, Out-of-Kernel)

The 4 principles listed in `docs/idea.md`. Author voice; not contract; lives in the About page body, not in SPEC.md or any companion.

1. **Simple beats clever** — If the system can be understood by the next engineer, that's usually the better architecture.
2. **Performance is a feature** — Don't optimize everything. Find the expensive things and fix those.
3. **AI is a tool, not an architect** — Use AI aggressively for implementation, exploration, and review — but architecture and engineering decisions still need reasoning.
4. **Build for the real world** — Networks fail. Requirements change. Users do unexpected things. Production doesn't care about your happy path.

---

## Personality Beats (Author Voice, Out-of-Kernel)

These belong in the Lab Personal category and the About page. They're how the site feels human without reading as a hobby drawer.

- "Serious engineer. Occasionally makes stupid games." (Games category tagline.)
- "Things I have unnecessarily built." (Curated Lab Personal collection.)
- The four-vector proof numbers (7+ / 10K+ / 35% / 7) appear in the hero as a tight cluster — they're the spine in number form.

---

## Source Paths (for bmad-spec update)

The spec was distilled from these brainstorm artifacts. On a future update, bmad-spec re-reads them as the input.

- `../../brainstorming/brainstorm-sanjit-portfolio-2026-09-23/.memlog.md` — canonical record of the brainstorm session.
- `../../brainstorming/brainstorm-sanjit-portfolio-2026-09-23/brainstorm-intent.md` — the intent doc (8 locked decisions, 4 proof vectors, anti-patterns).
- `../../brainstorming/brainstorm-sanjit-portfolio-2026-09-23/architecture-brief.md` — the opinionated architecture brief (Next.js 14, Vercel KV, additive schema, perf budget).
- `../../brainstorming/brainstorm-sanjit-portfolio-2026-09-23/pattern-library.md` — the 5 named patterns (full text; this companion's `patterns.md` derives from it).
- `../../../docs/idea.md` — the user's original first draft of portfolio structure and content.
- `../../../docs/cv.md` — the CV, ground-truth for all numeric claims.

These are audit-only at this point — every load-bearing claim landed in SPEC.md or a companion. Future updates re-read them to pick up new decisions without losing history.
