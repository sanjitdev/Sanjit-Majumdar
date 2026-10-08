# Vercel plan-tier audit — `POST /api/forward-pdf` memory budget (≥ 1769 MB)

**Author:** FIRE builder (auto-mode)
**Date:** 2026-10-08
**Story:** epic-2 / story-2-8
**Binds:** AD-7 (Puppeteer Node.js endpoint memory budget)
**Status:** research-only; go/no-go decision pending user confirmation

---

## TL;DR

**Go for E4.3 with the Vercel Pro plan.** Hobby is insufficient because the default `memory` ceiling is 1024 MB and the function needs ≥ 1769 MB for the `@sparticuz/chromium` Puppeteer bundle. Pro's configurable memory (up to 3008 MB) accommodates the requirement without forcing a downgrade of `maxDuration` or runtime settings. Enterprise is not required for this single endpoint.

---

## Question

`POST /api/forward-pdf` (closed serverless endpoint per AD-3, Puppeteer via `@sparticuz/chromium` per AD-7) ships in E4.3. AD-7 binds `≥ 1769 MB` of memory for the Node.js function. Does the current Vercel plan tier support that ceiling? If not, what upgrade is required, and at what cost?

---

## Vercel plan tier memory ceilings (as of 2026-10-08)

The numbers below are cited from Vercel's published documentation at retrieval time. The exact URLs are recorded in the **Sources** section at the bottom; any future contributor verifying this audit should re-fetch and update the table if the ceilings change.

| Plan tier | Memory for Node.js functions | `maxDuration` | Notes |
|---|---|---|---|
| **Hobby** | 1024 MB fixed | 60s on Hobby (after 2024-12 increase; was 10s) | Single team member, personal projects. Default memory cannot be increased. |
| **Pro** | 1024 MB → 3008 MB (configurable per function via `functions.<path>.memory`) | 60s default, configurable up to 300s for some endpoints | Per-function memory configuration is a Pro feature. |
| **Enterprise** | 1024 MB → 3008 MB (configurable, same as Pro) | Up to 800s for some endpoints, custom cold-start budgets | Custom contracts; reserved capacity; not required for a single endpoint. |

**Citation dates:** the memory and `maxDuration` numbers were retrieved 2026-10-08 from the URLs in the Sources section. Vercel rev'd Hobby's `maxDuration` to 60s in late 2024; if you are reading this audit after a Vercel pricing change, re-fetch.

### Does 1769 MB fit?

| Plan | Max memory | 1769 MB achievable? |
|---|---|---|
| Hobby | 1024 MB | **No.** Hobby's memory is fixed at 1024 MB. The Puppeteer bundle will OOM. |
| Pro | 3008 MB | **Yes.** Pro allows configuring `functions.app/api/forward-pdf/route.ts.memory = 1769` (or any value up to 3008). |
| Enterprise | 3008 MB+ | **Yes.** Enterprise is a superset of Pro. |

### Cold-start trade-off (AD-7)

AD-7 lists a 4-second cold-start budget for the Puppeteer endpoint. Puppeteer via `@sparticuz/chromium` typically cold-starts in 2-3 seconds on a warm Lambda; on a cold Vercel function, the chromium download (≈ 50 MB compressed) can push cold-starts to 5-6 seconds on the first invocation after deploy. Pro's reserved concurrency (configurable per project) can mitigate this by keeping one instance warm. Enterprise offers region-pinned warm pools, which is overkill for a portfolio site that gets 1-10 PDF requests per week.

---

## Current plan tier

**Unknown — not recorded in the repo.** The `vercel.json` declares only the framework, install command, and build command; it does not surface the plan tier. The current plan tier lives on the Vercel dashboard (`https://vercel.com/<team>/<project>/settings/billing`) and in the project's Vercel team settings.

**To confirm:** open the Vercel dashboard for `sanjit.dev` → Settings → Billing → Plan. The current plan will be displayed there. If the plan is `Hobby`, this audit's go-decision requires an upgrade. If the plan is `Pro` or `Enterprise`, no upgrade is required.

---

## Recommendation

**Go for E4.3 with the Vercel Pro plan** ($20/seat/month as of 2026-10-08, single seat = $20/month for a solo project).

- If the current plan is **Hobby**: upgrade to Pro before E4.3 ships. The upgrade is one-click on the Vercel dashboard; the cost is $20/month. The 1769 MB memory target fits with headroom; `maxDuration = 60` (AD-7) is the default on Pro and is configurable up to 300s if the cold-start budget is missed.
- If the current plan is **Pro**: no upgrade required. The 1769 MB target fits within Pro's 3008 MB ceiling. E4.3 ships as-is.
- If the current plan is **Enterprise**: no upgrade required; the same Pro settings apply. E4.3 ships as-is.

**Out of scope for this audit:** the Vercel plan upgrade itself (it's a billing decision, not a code change). The user confirms the upgrade before E4.3 ships. The upgrade is treated as a separate intent ("Upgrade Vercel plan for E4 readiness") per the work-item notes.

---

## Cost summary (2026-10-08)

| Item | Cost |
|---|---|
| Vercel Pro (1 seat) | $20/month |
| Vercel Pro (1 seat) annual | $240/year |
| Hobby → Pro upgrade | $0 (one-click) |
| E4.3 Puppeteer endpoint runtime cost | Estimated $0.01-0.05 per PDF (within Vercel's included usage on Pro) |

**Note:** Vercel's per-function memory and duration costs scale linearly with the memory + duration settings. A 1769 MB function running for 10 seconds costs roughly 1.7× a 1024 MB function running for 10 seconds. The portfolio site generates 1-10 PDFs per week (rough estimate based on traffic); the cost is in the noise on Pro's included usage.

---

## Sources

All citations retrieved 2026-10-08:

- Vercel Functions memory configuration: <https://vercel.com/docs/functions/configuring-functions/memory>
- Vercel Hobby plan limits: <https://vercel.com/docs/accounts/plans/hobby-plan>
- Vercel Pro plan limits: <https://vercel.com/docs/accounts/plans/pro-plan>
- Vercel pricing: <https://vercel.com/docs/accounts/plans>
- `@sparticuz/chromium` Puppeteer bundle: <https://github.com/Sparticuz/chromium>
- AD-7 binding: `_bmad-output/planning-artifacts/architecture/architecture-Sanjit-Majumdar-2026-09-23/ARCHITECTURE-SPINE.md` (AD-7)

---

## Verification

- This audit document is committed to the repo at `docs/run-notes/vercel-plan-audit-2026-10-08.md`.
- The go/no-go decision is recorded in the spec at `_bmad-output/implementation-artifacts/spec-2-8-…md`.
- The user confirms the Vercel plan tier (Hobby / Pro / Enterprise) before E4.3 ships.
- The smoke at `scripts/smoke-2-8.mts` asserts this audit document exists and cites the go-decision.
