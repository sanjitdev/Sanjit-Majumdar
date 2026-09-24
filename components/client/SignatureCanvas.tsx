"use client";
import { useEffect, useState } from 'react';
import { CANVAS_MODE_ACCENT, type CanvasMode } from '../../lib/canvas-modes';

/**
 * <SignatureCanvas> — AD-13 closed-set client component (1 of 10).
 *
 * Renders an inline `<svg>` whose geometry is selected by `mode: CanvasMode`.
 * An idle `sigFlow` animation runs under default conditions; collapses to
 * 0.01ms under `prefers-reduced-motion`.
 *
 * **`sigFlow` is SMIL, not CSS.** `<animate>` is an SMIL element and is NOT
 * affected by CSS `prefers-reduced-motion`. The motion gate manipulates the
 * SMIL `dur` attribute imperatively via React state — see the
 * `reducedMotion` state below. (This is a deliberate divergence from CSS
 * conventions; documenting because it's easy to misread as a CSS animation
 * and "fix" the gate by toggling a CSS variable, which has no effect.)
 *
 * Stroke color for each variant is read from `CANVAS_MODE_ACCENT[mode]` so
 * the mode→color mapping has one source of truth
 * (`lib/canvas-modes.ts`). Do not inline `var(--accent)` literals in JSX.
 *
 * SSR/hydration note: We initialize `reducedMotion` in a `useEffect`, which
 * means SSR HTML reflects the default duration and a reduced-motion user
 * sees a brief duration swap on hydration. This is a known small flash —
 * acceptable because this canvas is decorative (`aria-hidden="true"`,
 * `pointer-events: none`, `hidden xl:block`) and does not affect readability.
 */
export function SignatureCanvas({
  mode,
  className,
}: {
  mode: CanvasMode;
  className?: string;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const stroke = CANVAS_MODE_ACCENT[mode];
  const dur = reducedMotion ? '0.01ms' : '2s';

  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
      className={['hidden xl:block', className ?? ''].filter(Boolean).join(' ')}
    >
      {renderGeometry(mode, stroke, dur)}
    </svg>
  );
}

/**
 * Per-mode SVG geometry (each variant is intentionally inline — not a
 * parametric shape system — to keep each mode visually true to the UX-DR).
 * The exhaustive switch + `never` default catches mode-list drift at
 * compile time per `CANVAS_MODE_RUNTIME_DRIFT`.
 */
function renderGeometry(mode: CanvasMode, stroke: string, dur: string) {
  switch (mode) {
    case 'dual-ring':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <circle cx={100} cy={100} r={70} strokeDasharray="6 8" opacity={0.6} />
          <circle cx={100} cy={100} r={40}>
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="42"
              dur={dur}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      );
    case 'filter-graph':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <path d="M20 40 H180 M20 80 H180 M20 120 H180 M20 160 H180" opacity={0.5} />
          <path d="M30 100 L80 60 L130 140 L180 90">
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="120"
              dur={dur}
              repeatCount="indefinite"
            />
          </path>
        </g>
      );
    case 'section-progress':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <rect x={30} y={90} width={140} height={20} rx={4} opacity={0.4} />
          <rect x={30} y={90} height={20} rx={4}>
            <animate
              attributeName="width"
              from="10"
              to="140"
              dur={dur}
              repeatCount="indefinite"
            />
          </rect>
        </g>
      );
    case 'timeline':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <line x1={20} y1={100} x2={180} y2={100} opacity={0.5} />
          <g>
            <circle cx={40} cy={100} r={5} fill={stroke} />
            <circle cx={90} cy={100} r={5} fill={stroke} />
            <circle cx={140} cy={100} r={5} fill={stroke} />
            <circle cx={170} cy={100} r={3} fill={stroke}>
              <animate
                attributeName="cx"
                values="40;90;140;170"
                dur={dur}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>
      );
    case 'decision-graph':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <line x1={100} y1={30} x2={50} y2={120} />
          <line x1={100} y1={30} x2={150} y2={120} />
          <line x1={50} y1={120} x2={150} y2={120} />
          <circle cx={100} cy={30} r={6} fill={stroke} />
          <circle cx={50} cy={120} r={6} fill={stroke} />
          <circle cx={150} cy={120} r={6} fill={stroke} />
        </g>
      );
    case 'experiment-graph':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <path d="M30 150 V50 M30 150 H170" opacity={0.4} />
          <path d="M30 130 C70 80 110 110 170 60">
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="80"
              dur={dur}
              repeatCount="indefinite"
            />
          </path>
        </g>
      );
    case 'activity-feed':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <circle cx={40} cy={50} r={3} fill={stroke}>
            <animate attributeName="opacity" values="0.2;1;0.2" dur={dur} repeatCount="indefinite" />
          </circle>
          <circle cx={100} cy={80} r={3} fill={stroke}>
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur={dur}
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={160} cy={110} r={3} fill={stroke}>
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur={dur}
              repeatCount="indefinite"
              begin="0.4s"
            />
          </circle>
          <path d="M40 50 L100 80 L160 110" opacity={0.6} />
        </g>
      );
    case 'layered-architecture':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <rect x={40} y={40} width={120} height={30} rx={3} opacity={0.85} />
          <rect x={40} y={85} width={120} height={30} rx={3} opacity={0.6} />
          <rect x={40} y={130} width={120} height={30} rx={3} opacity={0.4} />
        </g>
      );
    case 'condensed-4-node-status':
      return (
        <g fill="none" stroke={stroke} strokeWidth={1.25}>
          <line x1={40} y1={100} x2={80} y2={60} />
          <line x1={40} y1={100} x2={80} y2={140} />
          <line x1={120} y1={60} x2={160} y2={100} />
          <line x1={120} y1={140} x2={160} y2={100} />
          <circle cx={40} cy={100} r={6} fill={stroke} />
          <circle cx={80} cy={60} r={5} fill={stroke}>
            <animate attributeName="r" values="5;7;5" dur={dur} repeatCount="indefinite" />
          </circle>
          <circle cx={80} cy={140} r={5} fill={stroke} opacity={0.5} />
          <circle cx={160} cy={100} r={5} fill={stroke} />
        </g>
      );
    default: {
      // Exhaustive-switch compile-time check: any future addition to
      // `CANVAS_MODES` without a matching case here is a TS error.
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
