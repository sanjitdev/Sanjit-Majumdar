"use client";
import { useEffect, useState } from 'react';

/**
 * <FilterChipGroup> — AD-13 closed-set client component (5 of 10).
 *
 * Renders a single-select radiogroup pattern with role="radiogroup" on the
 * wrapper + role="radio" + aria-checked on each chip. This is the WAI-ARIA
 * APG pattern for one-of-N selection; aria-pressed (the toggle-button
 * pattern) is semantically wrong for single-select.
 *
 * Controlled/uncontrolled hybrid: if `selected` prop is provided, the
 * component is controlled (the internal state shadows it for the initial
 * render only). If `selected` is undefined, the component is uncontrolled.
 *
 * The `active` calculation uses `selected !== undefined ? selected : internal`
 * (NOT `??`) so that an explicitly empty `selected=""` is honored as a
 * valid (intentionally deselected) state and does not collapse to the
 * uncontrolled `internal` value.
 *
 * Edge case (B14): if `chips.length === 0`, the wrapper is rendered as an
 * empty radiogroup. AT announces "Filters, radiogroup, 0 items" — which is
 * honest and avoids an unannounced empty wrapper.
 *
 * Touch target: ≥44px min-height is enforced on the small breakpoint via
 * Tailwind's `min-h-[44px]`.
 */
export function FilterChipGroup({
  chips,
  selected,
  onSelect,
  className,
}: {
  chips: { id: string; label: string }[];
  selected?: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState<string>('');

  // Re-sync internal state when the controlled `selected` prop changes
  // (covers uncontrolled-fallback-then-controlled, prop-drives-rerender, etc.).
  // `selected` may be `undefined` (uncontrolled mode); coerce to '' so the
  // setter's SetStateAction<string> type stays satisfied.
  useEffect(() => {
    setInternal(selected ?? '');
  }, [selected]);

  // B14 — empty state renders just the wrapper, no children.
  if (chips.length === 0) {
    return <div role="radiogroup" aria-label="Filters" className={className} />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Filters"
      className={['flex flex-wrap gap-2', className ?? ''].filter(Boolean).join(' ')}
    >
      {chips.map((c) => {
        const active = selected !== undefined ? selected : internal;
        const checked = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => {
              setInternal(c.id);
              onSelect(c.id);
            }}
            className={[
              'min-h-[44px] rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              checked
                ? 'border-accent bg-accent text-on-accent'
                : 'border-border-strong bg-bg-2 text-fg-2 hover:border-accent hover:text-accent',
            ].join(' ')}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
