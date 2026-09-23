# Reconcile: Stitch Output vs Captured Decisions

> Workspace: `_bmad-output/planning-artifacts/ux-designs/ux-Sanjit-Majumdar-2026-09-23/`
> Compared: 5 mockups + DESIGN.md from `mockups/obsidian_precision/` against `.memlog.md` (entries 1–13) and the PRD / spec / cv.md.

## What Stitch got right (keep)

- **Visual register:** obsidian-canvas + electric-blue accent + emerald "live" state. Calm, structural, monochrome. Reads Linear/Vercel/Raycast. Matches "quietly sharp + modern-tech-portfolio" exactly.
- **Sharp corners:** DEFAULT `0.125rem` (2px), max `0.75rem` (12px). The handoff prompt asked for sharper than shadcn defaults — Stitch tightened them.
- **Geometric sans + mono pair:** Geist for headings, Inter for body, JetBrains Mono for technical artifacts. The label/code typography reads as developer tooling.
- **4-tile proof cluster on hero:** correct shape, with metadata rails (TRACK / PEAK LOAD / IMPACT / SAFETY) — earns the "hero block (loud)" decision.
- **Spine line on hero:** verbatim, no softening. Verified in homepage hero HTML line 23.
- **Recruiter-mode: footer opt-in.** "For recruiters? (Condensed mode)" appears as a footer-level button. Micro-footer also surfaces `?for=recruiter` deep-link in code-typography. Hidden-by-default posture respected.
- **Pattern page = engineering playbook format.** Sections visible: When to Deploy / What it is / How To Do It (4 numbered moves) / When NOT to Use / Concrete Boundary Adapter Snippet. Counter-line is its own section, visually distinct. Spine line shown in header.
- **/now = vertical ticker.** Active dot per entry, color-coded (green active / cyan dormant). Honest timestamp. Stack chips. Reads as a status page.
- **Case-study structure:** Problem → Constraints → Architecture → Decisions → Implementation → Challenges → Measurable Results. Patterns Applied rail at top with 3 deep-link cards. Measurable Results block with -35% / 99.995% / -72% lift.
- **Footer `For recruiters?` toggle** present on every surface — solves the findability concern from the override entry.

## What Stitch invented (must reconcile before final)

### 1. Identity / role / location (high severity — wrong facts)

| Mock | Stitch wrote | Should be |
|---|---|---|
| Homepage hero | "Staff & Senior Engineering Execution" / "L6 EQUIV" / "LOC: SF_BAY_AREA // UTC-8" / "Distributed Pipelines" / "Low-Latency WebGL & Canvas" / "Available for select high-stakes technical contracts" | "Senior Software Engineer" / no L6-equivalent / Dhaka, Bangladesh (UTC+6) / ".NET, Angular, APIs and scalable systems" / available-for-engagement copy per cv.md |
| Recruiter mode header | "RECRUITER CONDENSED VIEW · URL PARAM: ?FOR=RECRUITER" — fine. But "EXECUTIVE BRIEF // CANDIDATE ID: SM-0441-SYS" + "ACTIVE SEARCH READY" | "Executive Brief // Sanjit Majumdar" + status-quiet (no "ACTIVE SEARCH READY" — your cv is about being a senior engineer, not a job-seeker signal) |
| Recruiter proof tile 01 | "7+ Years · Staff & Lead Systems · Lo8 systems architect..." | "7+ yrs · Senior Software Engineer · .NET, Angular, APIs" |
| Recruiter proof tile 04 | "7 Engineers · Technical Steering · Owned technical standards..." | "7-person team · Technical Leadership · Led engineering/QA team" |
| Recruiter quick-facts panel | "Staff / Principal Software Engineer" / "$1.4M ARR / infra savings" / "United States (EST)" / "US Citizen / Authorized for all standard W2 or C2C contracts" / Primary Skills: Distributed Systems & Storage, High-Throughput Services, Enterprise Frontend, Data Infrastructure, Observability SRE; Languages: PostgreSQL, Redis, C++, Go, NET & Node.js; Infra/Tools: Docker, React, WebSockets, AWS/GCP; "Immediate Engagement" — 24h turnaround; "KPMG" / "Vigil" / "asm" clients | All fabricated. Should reflect: Senior Software Engineer at Brain Station 23 since Nov 2018; stack: C#, .NET, Angular, TypeScript, SQL Server, APIs; no client list (employer is Brain Station 23); location: Dhaka, Bangladesh; availability per cv |

**Resolution:** Rebuild hero and recruiter mode copy against cv.md. Keep the visual structure exactly as-is. Strip US/FAANG/client-name fabrications.

### 2. /now entries (medium severity — wrong projects)

| Stitch wrote | Should be (per idea.md / cv.md) |
|---|---|
| "Ray-marching WebGPU volumetric renderer" (commit #7f2b98c) | **CityFix** — making annoying city services easier to discover |
| "Wellbook v2 Multi-Region Database Failover Drill" | **Surakkha** — water safety monitoring concept for Bangladesh |
| "Compiling a custom Lisp dialect to WASM bytecode" | (Personal Lab tool — replace with one of your actual Lab projects) |
| "Engineering Leadership Playbook: Code Review SLAs" | (Could be reframed as a real piece of process work, or replace) |

**Resolution:** Swap /now entries to match your real currently-building list. Visual structure (vertical ticker with colored dots, stack chips, commit hash slot) stays — fill with honest content.

### 3. Case-study stack + framing (medium severity — wrong employer / wrong stack)

| Stitch wrote | Should be |
|---|---|
| Wellbook subtitle: "Multi-tenant Clinical Records Engine" / HIPAA / SOC2 Type II compliance / event-sourced distributed projections | Wellbook per spec is **"Enterprise project & governance platform for an international oil & gas organization"** — not clinical. Replace clinical framing with oil & gas. |
| Stack rail: ".NET 8 / PostgreSQL / Next.js" | `.NET / Angular / SQL Server / APIs` per cv.md. |
| Architecture diagram nodes: "Vector Clock Concurrency" / Raft Consensus / BOSH-CF / k8s / Terraform | Replace with realistic ERP-integration diagram (Canonical Model pattern from spec). |
| HyperLog case study: Rust / ClickHouse / Kafka / LZ4 / 1.2B events/day / cost-cut $84k→$31k | **Drop HyperLog entirely** — it's not a project you worked on. Use one of your real case studies (Wellbook is the lead). |
| PR pings "KPMG", "Vigil", "asm", "Edge Vault Token Broker", "LedgeStream", "Micro-Xaml Canvas Studio", "ZerveVault" | All fabricated client names. Strip. |

**Resolution:** Rewrite case-study text to match real Wellbook context. Drop HyperLog. Visual scaffolding (Patterns Applied rail, Decisions & Tradeoffs table, code-viewport) stays.

### 4. Spine-line quote formatting (low severity — typographic)

Hero uses straight quotes (`"` `"`) around the spine line. Recruiter mode uses straight quotes. Pattern page uses curly typographic quotes (`"` `"`) for the spine line in the metadata italic block.

**Resolution:** Lock spine-line rendering to **curly typographic quotes** (`"` `"`) in display contexts, **straight quotes** in metadata/italic contexts. Mostly cosmetic; mention in DESIGN.md.

### 5. Pattern page framing (low severity — different pattern name)

Stitch rendered the **Canonical Data Model** (multi-tenant domain boundaries, schema drift) — slightly different from your spec's **Canonical Model** pattern (multi-platform ERP integration). The framework is right but the title and example should match the spec.

**Resolution:** Rename to **Canonical Model** (spec terminology); reframe the example to ERP integration with three systems (procurement, finance, vendor portal) per spec.

## Surface coverage matrix

| IA surface (from EXPERIENCE.md) | Stitch covered? | Status |
|---|---|---|
| `/` homepage | ✓ homepage_hero_engineer_default | Reconcile copy |
| `/` recruiter-mode | ✓ recruiter_mode_condensed_homepage | Reconcile copy (highest priority) |
| `/work/<slug>` case study | ✓ case_study_wellbook_clinical_architecture | Reconcile content (wellbook framing, drop HyperLog) |
| `/patterns/<slug>` pattern detail | ✓ pattern_canonical_data_model | Reconcile pattern title |
| `/now` | ✓ now_currently_building_feed | Reconcile entries |
| `/built` | ✗ missing | Generate via Stitch follow-up OR spec via EXPERIENCE.md only |
| `/lab` | partial (3 cards in homepage Lab teaser) | Optional — Lab teaser sufficient for v1 |
| `/about` / `/projects` | ✗ missing | Optional — EXPERIENCE.md covers behavior |
| Forward modal | ✗ missing | EXPERIENCE.md covers; can mock later |

**Action:** The 5 Stitch surfaces cover ~70% of the IA. `/built` is the most-needed 6th surface; the rest are documented in EXPERIENCE.md and can be mocked at build-time or in a v2 handoff.

## What survives as DESIGN.md tokens (no changes needed)

- Color tokens (full Material 3 dark palette + light)
- Typography ramp (Geist/Inter/JetBrains Mono)
- Rounded scale (2/4/6/12, full reserved for status indicators only)
- Spacing scale (xs/sm/md/lg/xl + gutter/margin at 3 breakpoints)
- Component patterns (buttons, code chips, status badges, engineering cards, forms, terminal windows)

## Decisions log to add

- `[override]` Stitch invented role/stack/location/client fabrications. Replace with cv.md-sourced content; preserve visual scaffolding.
- `[change]` /now entries to be rewritten against real currently-building list (CityFix, Surakkha, real Lab tools).
- `[decision]` Pattern page title "Canonical Data Model" → "Canonical Model" per spec.
- `[decision]` Add `/built` to v1 follow-up mock list; do not block finalize.
- `[assumption]` HyperLog case study dropped (not a real project). Use Wellbook as the lead case study; spec lists 3-5 case studies — Wellbook is canonical, others deferred to v1.5.
