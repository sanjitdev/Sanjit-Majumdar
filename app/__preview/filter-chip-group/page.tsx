import { FilterChipGroup } from '../../../components/client/FilterChipGroup';

// B5 — keep preview URLs out of production search indices. This is a CI
// harness, not a user-facing page; indexing it would surface an unfinished
// internal page in search results.
export const metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

/**
 * Preview harness for `<FilterChipGroup>` (1-6).
 *
 * Server component (no `"use client"` at the top). Mounts
 * `<FilterChipGroup>` with 3 sample chips inside `<main id="main">` so CI
 * can hit `/__preview/filter-chip-group` and verify:
 *   - 3 chips render with `aria-pressed` on the selected chip
 *   - 44px min-height touch target is enforced on small breakpoint
 *
 * The `__preview/` (double underscore) folder avoids Next.js's
 * `_components` private-folder convention.
 */
export default function FilterChipGroupPreviewPage() {
  const chips = [
    { id: 'all', label: 'All' },
    { id: 'design', label: 'Design' },
    { id: 'code', label: 'Code' },
  ];

  return (
    <main id="main" className="min-h-screen bg-bg p-8 text-fg">
      <h1 className="font-display text-2xl">FilterChipGroup preview</h1>
      <p className="mt-2 text-fg-3">
        CI harness for the AD-13 FilterChipGroup contract. Three sample chips,
        one selected (aria-pressed=true), 44px touch target.
      </p>
      <div className="mt-6">
        <FilterChipGroup
          chips={chips}
          selected="all"
          onSelect={(id) => {
            if (typeof window !== 'undefined') {
              (window as unknown as { __lastFilterId?: string }).__lastFilterId = id;
            }
          }}
        />
      </div>
    </main>
  );
}
