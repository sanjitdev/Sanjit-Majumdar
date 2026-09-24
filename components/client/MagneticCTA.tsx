"use client";
import { useEffect, useRef } from 'react';

/**
 * <MagneticCTA> — AD-13 closed-set client component (3 of 10).
 *
 * Renders `<button>`; on mount, registers a passive `pointermove` listener
 * that translates the button by 0.18× pointer offset (clamped ≤8px) ONLY
 * when `matchMedia('(pointer: fine)')` AND NOT
 * `matchMedia('(prefers-reduced-motion: reduce)')` are both true.
 *
 * The listener is added/removed dynamically in response to media-query
 * changes (B9) so a user toggling reduced-motion at the OS level gets the
 * correct gate on the next render without a remount.
 *
 * `pointercancel` is registered alongside `pointerleave` (B2) — touch-system
 * interrupts (e.g., scroll capture) fire `pointercancel`, not `pointerleave`,
 * and a cancel without a reset leaves the button stuck translated.
 *
 * Visual styling for the magnetic and static variants is identical
 * (B1 — no `transition-transform` class, since transitioning an
 * imperatively-set transform produces a laggy spring-back). The static
 * fallback is distinguished only via `data-static` (B11) so consumers and
 * tests can discriminate without visual divergence.
 */
export function MagneticCTA({
  children,
  onClick,
  className,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia || !btnRef.current) return;

    const btn = btnRef.current;

    const handleMove = (e: PointerEvent) => {
      if (!enabledRef.current || !btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-8, Math.min(8, e.clientX - cx)) * 0.18;
      const dy = Math.max(-8, Math.min(8, e.clientY - cy)) * 0.18;
      btnRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const reset = () => {
      if (btnRef.current) btnRef.current.style.transform = '';
    };

    const fineMql = window.matchMedia('(pointer: fine)');
    const reducedMql = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluate = () => {
      const nextEnabled = fineMql.matches && !reducedMql.matches;
      const prevEnabled = enabledRef.current;
      enabledRef.current = nextEnabled;
      if (nextEnabled === prevEnabled) return;
      if (nextEnabled) {
        btn.addEventListener('pointermove', handleMove, { passive: true });
        btn.addEventListener('pointerleave', reset);
        btn.addEventListener('pointercancel', reset);
      } else {
        btn.removeEventListener('pointermove', handleMove);
        btn.removeEventListener('pointerleave', reset);
        btn.removeEventListener('pointercancel', reset);
        btn.style.transform = '';
      }
    };

    evaluate();
    fineMql.addEventListener('change', evaluate);
    reducedMql.addEventListener('change', evaluate);

    return () => {
      fineMql.removeEventListener('change', evaluate);
      reducedMql.removeEventListener('change', evaluate);
      btn.removeEventListener('pointermove', handleMove);
      btn.removeEventListener('pointerleave', reset);
      btn.removeEventListener('pointercancel', reset);
    };
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      data-static={!enabledRef.current}
      className={[
        'min-h-[44px] rounded-md bg-accent px-4 py-2 font-medium text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
