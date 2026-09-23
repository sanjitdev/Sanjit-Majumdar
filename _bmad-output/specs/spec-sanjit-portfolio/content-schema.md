---
type: spec-companion
spec: SPEC-sanjit-portfolio
title: "Content Schema — Additive Frontmatter for All Content Types"
---

# Content Schema

The portfolio is content-as-data. Every public route renders from a typed frontmatter shape plus a markdown body. The schema is **additive**: every field except `title` is optional; unknown keys are preserved via Zod `.passthrough()` and exposed on `entry.meta`. Adding a new field never breaks an existing entry — old entries just don't have it.

This companion is the canonical schema downstream code generators, validators, and content-authoring tooling read.

---

## Shared Base — `shared.ts`

```ts
{
  title: string;                       // required
  slug?: string;                       // derived from filename if absent
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  created?: string;                    // ISO 8601
  updated?: string;                    // ISO 8601 — drives ordering on /now
  summary?: string;                    // <= 200 chars, used in cards + meta description
  proof?: string[];                    // bullet-shaped proof numbers ("10K+ users", "35% faster")
  links?: { label: string; href: string }[];
}
```

---

## Case Study (Work) — `case-study.ts`

The Work bucket: things built professionally with deep engineering narrative.

```ts
{ ...shared,
  client?: string;
  vector?: 'scale' | 'delivery' | 'performance' | 'leadership';
  stack?: string[];
  period?: { start: string; end?: string };
  scale?: { users?: number; requests?: string; data?: string };
  metrics?: { label: string; value: string; context?: string }[];
  problem?: string;                   // markdown body
  architecture?: string;
  decisions?: string;
  implementation?: string;
  challenges?: string;
  results?: string;
  patterns?: string[];                // filenames/slugs in /content/patterns
  quote?: { text: string; attribution?: string };
}
```

**Body sections** (rendered in order): Problem → Constraints → Architecture → Decisions → Implementation → Challenges → Results. Each section is markdown; missing sections render as a small "—" rather than an error.

---

## Project — `project.ts`

The Projects bucket: things built because Sanjit thought they should exist (CityFix, Surakkha, etc.).

```ts
{ ...shared,
  tagline?: string;
  stage?: 'concept' | 'building' | 'live' | 'paused';
  repo?: string;
  demo?: string;
  domain?: string;                    // free text ("civic", "personal-finance", "safety")
  for_bd?: boolean;                   // marker: "Building things for Bangladesh"
}
```

---

## Lab Tool — `lab-tool.ts`

The Lab bucket: tools, games, experiments, visualizations, weird ideas. Categorized to keep the Lab professional.

```ts
{ ...shared,
  category: 'production' | 'experiment' | 'personal';
  what_it_is?: string;                // 2 sentences — what problem it solves, who's it for
  built_with?: string[];              // stack list — looks like a CV line
  status_label?: string;              // free text shown as a badge
  why_it_exists?: string;             // 1-2 sentences — the problem/curiosity that started it
  interesting_part?: string;          // 2-3 sentences — the engineering decision or clever move
  interactive?: boolean;              // if true, embed an iframe demo
  demo_src?: string;                  // URL of the sibling Lab host's demo
  patterns?: string[];                // which patterns this tool exercises
}
```

**Category semantics:**
- `production` — tools that run in production somewhere, used by real people. Listed first on the Lab page.
- `experiment` — AI/visualization/architecture experiments. Technical exploration.
- `personal` — games, "things I have unnecessarily built." Listed last; humor defends professionalism.

---

## Pattern — `pattern.ts`

```ts
{ ...shared,
  opening_number: 1 | 2 | 3 | 4 | 5;
  one_line?: string;                  // spine sentence — shown large
  setup?: string;                     // the situation (markdown)
  moves?: { name: string; description: string }[];   // 2-5 named moves
  counter_moves?: string;             // when NOT to play this opening (markdown)
  example_link?: string;              // slug of a case study that played it
}
```

The five current patterns and their slugs are fixed (see `patterns.md`):
- `canonical-model`
- `syncfusion-data-grid`
- `nopcommerce-plugin`
- `ship-faster-pushback`
- `friday-architecture-review`

The deep-link convention `/patterns/<slug>#move-<n>` indexes moves 1..5 within each pattern.

---

## Currently-Building Entry — `now-entry.ts`

Short, append-only, drives `/now` and the homepage feed.

```ts
{ ...shared,
  started?: string;                   // ISO date
  doing?: string;                     // one-line current action
  next?: string;                      // one-line next milestone
  link?: string;
}
```

---

## CV / About — `cv.md` (single file)

Single file; frontmatter holds contact + numbers; body renders the prose bio.

```ts
{
  name: string;
  role: string;
  location?: string;
  contact: { email: string; phone?: string; links?: { label: string; href: string }[] };
  numbers?: { label: string; value: string }[];   // proof-vector evidence
  philosophy?: string[];              // the 4 engineering principles
}
```

**Body** is markdown; the recruiter-mode toggle swaps in a highlighted callout for the leadership bullet (test-coverage drop, 4-day delay, -40% incident rate).

---

## Work ≠ Projects ≠ Lab

The schema enforces the brainstorm's organizing thesis by giving each bucket its own content type. They never merge into a single "Projects" bucket:

- **Work** (`case-study.ts`) — built professionally, deep engineering narrative.
- **Projects** (`project.ts`) — built because Sanjit thought they should exist.
- **Lab** (`lab-tool.ts`) — built because he wanted to experiment.

The schema treats them as siblings; the routing layer renders them on different pages with different navigation entry points.

---

## Additive Schema Rule

A new field can be added to any of the above types by:

1. Adding the field to the Zod schema with `.optional()`.
2. Updating any component that consumes the field (existing components ignore it).

Old entries without the field continue to render correctly. This is enforced by:

```ts
const SharedSchema = z.object({...}).partial({ title: true }).passthrough();
```

`.passthrough()` preserves unknown keys on `entry.meta`. `.partial()` makes every field except `title` optional.

---

## Filename → Slug Convention

Slugs are derived from filenames: `content/case-studies/wellbook.mdx` → `slug: wellbook`. Authors can override via the optional `slug` frontmatter field, but the default is filename-without-extension.

The CI build asserts every published entry has a unique slug; duplicate slugs fail the build.