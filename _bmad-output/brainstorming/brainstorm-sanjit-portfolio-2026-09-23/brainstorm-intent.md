# Brainstorm Intent — Sanjit's Engineering Portfolio

## The intent

Build a portfolio that *proves* Tech Lead capability rather than claims it. The site itself is the strongest evidence: every page must read like engineering judgment, every interaction must anticipate the recruiter's unspoken thinking, and the artifact must survive being forwarded into a hiring meeting cold. **Spine line (verbatim, recruiter-mode hero):** *"He can do it — whatever you give him to build, he can build it for you, and better than others."* Everything else on the site is evidence supporting that single claim.

## The constraints

- Vercel-hosted (frontend + light serverless; no always-on DB)
- Content editable without re-deployment (content source → on-demand ISR or per-request read)
- Static-first (SSG by default; dynamic only where it earns its weight)
- Additive content schema — adding fields must not break older entries
- Homepage under 100KB; 2G-friendly; first paint fast enough that a recruiter in a bad network never bounces
- Recruiter-must-not-bounce — the 30-second scan must compress to a verdict

## The locked decisions (priority order)

1. **Recruiter-mode toggle is the spine of the credibility surface** — the single sentence the recruiter most wants the hiring manager to read, plus the four proof vectors stacked underneath it.
2. **Pattern library is the organizing principle** — the portfolio is a chess opening book of *named engineering patterns*, not a list of jobs. Five patterns locked (cross-platform ERP integration is one; Architecture Review Pattern chosen for first sharpening).
3. **Decentralized homepage** — every page is a standalone proof surface: 2-sentence Sanjit positioning, at least one proof number, a path back to the rest. No locked doors off the lobby.
4. **CV-as-source-of-truth with versioned history** — claims about work, numbers, tech, leadership are grounded in the CV; CV updates flow into the site without forcing a content rewrite.
5. **Leadership pattern triangle** — *Data before debate / Standards as non-negotiable / Calibrated risk*. The CV underlines leadership least, so this vector gets the most amplification.
6. **Lab reframed professionally** — heading reframe ("what I build when no one tells me what to build"), category tags (Production / Experiment / Personal), micro-case-study shape per tool (What it is / Built with / Status / Why it exists / The interesting part).
7. **The "Forward to hiring manager" button is the real product** — single-page share that lands the recruiter-mode view cold in the hiring manager's inbox, ammo included.
8. **"Currently building" feed** — driven from a content source, with a fallback for stale state; RSS/Atom on the stream as the return trigger.

## The four proof vectors

| Vector | Strongest concrete evidence |
|---|---|
| **Stack diversity** | 5+ e-commerce platforms integrated; .NET + Angular + SQL Server; Syncfusion-heavy Norwegian client app; nopCommerce (10+ plugins) + Shopify plugin |
| **Scale** | 10,000+ active users on the Norwegian client app (real production load, not demo data) |
| **Engineering depth** | 35% perf gain / 25% memory reduction (measured, not claimed) |
| **Leadership** | Led 7-person team (4 eng + 3 QA) via Azure Boards + reviews + mentoring; pushed back on premature release when test coverage dropped below 60% — production incident rate fell 40% next quarter |

## The signature content (verbatim)

- **Spine line (recruiter-mode hero):** *"He can do it — whatever you give him to build, he can build it for you, and better than others."*
- **Leadership pushback quote (the line that convinced the PM, in Sanjit's voice):** *"I showed him the data, told him this doesn't look optimal enough to be shipped — it needs to pass all tests to be able to be shipped. We cannot ship a weak and faulty product."*
- **Anticipatory design framing (the memorability thesis):** the portfolio becomes memorable not because it's clever, but because it makes the visitor feel *already understood* — the site answers the visitor's unspoken thinking so visibly they're impressed it read their mind.

## What this is NOT

- A generic portfolio with a hero image, three project cards, and a contact form
- A "Built with [template]" confession — the site is the proof, not the credit
- A skills grid with self-rating bars
- A 3,000-word About section
- A single bucket of "Projects" with no shape, no patterns, no argument

## Open questions for the next step

1. Which content source backs the live site — headless CMS with on-demand ISR, or a file repo read via a Vercel serverless function?
2. Which two patterns (besides Architecture Review and Cross-Platform ERP Integration) complete the five-pattern opening book?
3. What is the minimal "Forward to hiring manager" payload — a single share URL, a PDF export, or both?
4. How is the `/now` convention surfaced — its own page, a feed block, or both?
5. What is the fallback render for a stale "Currently building" entry — last-known timestamp, hidden section, or honest "as of" banner?
