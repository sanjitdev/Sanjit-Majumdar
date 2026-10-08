---
work_item_id: wi-4-revalidate-handler
intent: close-out-epic-2
story_ref: epic-2 / story-2-5
title: POST /api/revalidate edge handler with revalidateTag(tag, 'max')
status: pending
complexity: medium
mode: confirm
autonomy_bias_applied: balanced
depends_on: [wi-3-clone-sanjit-content-at-build-time]
binds:
  ad: [AD-1, AD-3, AD-9]
  fr: [FR-12, FR-14]
source_spec: _bmad-output/implementation-artifacts/spec-2-5-implement-post-apirevalidate-edge-handler-with-revalidatetag-tag-max-next-16-signature.md
current_state: review (sprint-status.yaml 2026-09-28)
created: 2026-10-08T18:30:00Z
---

# Work item — POST /api/revalidate edge handler with revalidateTag(tag, 'max')

## What ships

The third AD-3 serverless endpoint:
`app/api/revalidate/route.ts`.

- `export const runtime = 'edge'` (AD-3).
- Accepts
  `POST /api/revalidate?tag=<tag>[&slug=<slug>][&sha=<sha>]` with
  `Authorization: Bearer <REVALIDATE_SECRET>`.
- Constructs the full ISR tag:
  `<type>:<slug>` for typed (`case-study`, `pattern`, `lab`,
  `project`); bare `<tag>` for `now` and `cv`. AD-1 closed set.
- Calls `revalidateTag(finalTag, 'max')` — two-arg form only per
  Next 16 (`AGENTS.md` pitfall #3).
- Returns `{ ok: true, revalidated: finalTag, request_id }` on
  success; `{ error: { code, message, request_id } }` on failure.

## Acceptance criteria

1. `app/api/revalidate/route.ts` exports `runtime = 'edge'` and a
   `POST` handler. No other HTTP methods are implemented.
2. Auth via `Authorization: Bearer <REVALIDATE_SECRET>` header.
   No header / wrong token → 401 with structured JSON error.
3. Tag construction respects the AD-1 closed set: bare tags
   (`now`, `cv`) accepted as-is; typed tags accept `<type>` ∈
   {`case-study`, `pattern`, `lab`, `project`} and require a
   non-empty `<slug>`. Any other shape → 400 with a diagnostic.
4. Two-arg `revalidateTag(finalTag, 'max')` call. Single-arg
   `revalidateTag(finalTag)` is forbidden by AGENTS.md pitfall #3
   — assert not present in code.
5. `scripts/smoke-2-5.mts` exercises the wire shape end-to-end
   (without an actual deploy), asserts tag construction, asserts
   the runtime boundary (via code inspection — the runtime export
   is text-asserted, not runtime-tested, per the deferred-work
   entry for 2-5).
6. `pnpm typecheck` exits 0; `pnpm smoke:2-5` exits 0 with
   all 27 assertions passing (per the 2026-09-28 sprint note).

## Verification

- `pnpm typecheck`
- `pnpm smoke:2-5`
- `pnpm lint`
- Code inspection: `grep "revalidateTag(" app/api/revalidate/route.ts`
  returns only the two-arg form.
- Code inspection: `grep "export const runtime" app/api/revalidate/route.ts`
  returns `export const runtime = 'edge'`.

## Notes

- Already at step-05 (review) per sprint-status.yaml. Resume
  from step-06.
- The handler is the third and final AD-3 serverless endpoint;
  adding any other endpoint requires a spine amendment.
- WI-5 (sanjit-content repo + workflow) invokes this handler.
- A separate audit (`scripts/audit-edge-runtimes.spec.mjs`) for
  AD-3 compliance is in the E1 retrospective action items — not
  in scope here (Future CI hardening intent).
