"use client";
import type { ReactNode } from 'react';

/**
 * <NavCurrent> — AD-13 closed-set client component (8 of 10).
 *
 * Renders a plain `<a>` (NOT `next/link` — closed-set discipline; the
 * parent `<Nav>` is a server component, but `<NavCurrent>` is `"use client"`
 * so its `aria-current` derivation can be styled under focus / hover
 * without a server round-trip). Sets `aria-current="page"` only when
 * `isCurrent` is true; otherwise the attribute is omitted (not "false"),
 * which is the WAI-ARIA convention for "this link does not represent the
 * current page".
 *
 * Visual styling is intentionally minimal — the parent `<Nav>` owns the
 * flex layout / spacing, this component only carries the per-link text
 * color + transition so a consumer can override `className` per-link
 * (e.g., a "primary" call-out link in a future variant).
 */
export function NavCurrent({
  href,
  isCurrent,
  children,
  className,
}: {
  href: string;
  isCurrent: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      aria-current={isCurrent ? 'page' : undefined}
      className={['text-fg-2 hover:text-fg transition-colors', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </a>
  );
}
