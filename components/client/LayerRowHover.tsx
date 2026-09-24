"use client";
import { useEffect, useState } from 'react';

/**
 * <LayerRowHover> — AD-13 closed-set client component (4 of 10).
 *
 * Renders one `<tr>` with `onMouseEnter` / `onMouseLeave` / `onFocus` /
 * `onBlur` toggling a `data-hovered` attribute and firing the
 * `onHoverChange(layer, hovered)` callback. `prefers-reduced-motion`
 * short-circuits the visual change (the row renders unchanged; the
 * callback still fires for parity).
 *
 * The component renders the `<tr>` wrapper; consumers place `<td>` /
 * `<th>` children inside.
 */
export function LayerRowHover({
  layer,
  onHoverChange,
  children,
  className,
}: {
  layer: number;
  onHoverChange?: (layer: number, hovered: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // B13 — early-return when no children to avoid empty <tr/> hydration
  // warnings (React logs a "validateDOMNesting" warning for an empty
  // <tr> in some configs; an explicit null is the clean fix).
  if (!children) return null;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  function fire(next: boolean) {
    setHovered(next);
    onHoverChange?.(layer, next);
  }

  return (
    <tr
      tabIndex={0}
      onMouseEnter={() => fire(true)}
      onMouseLeave={() => fire(false)}
      onFocus={() => fire(true)}
      onBlur={() => fire(false)}
      data-hovered={hovered}
      data-reduced-motion={reducedMotion}
      className={className}
    >
      {children}
    </tr>
  );
}
