import { LayerRowHover } from '../../../components/client/LayerRowHover';

// B5 — keep preview URLs out of production search indices. This is a CI
// harness, not a user-facing page; indexing it would surface an unfinished
// internal page in search results.
export const metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

/**
 * Preview harness for `<LayerRowHover>` (1-6).
 *
 * Server component (no `"use client"` at the top). Renders a 4-row
 * `<table>` with `<LayerRowHover>` per row so CI can hit
 * `/__preview/layer-row-hover` and verify:
 *   - 4 rows render
 *   - hovering row N fires `onHoverChange(N, true)`
 *   - keyboard focus (Tab) fires `onHoverChange(N, true)`
 *
 * The `__preview/` (double underscore) folder avoids Next.js's
 * `_components` private-folder convention.
 */
export default function LayerRowHoverPreviewPage() {
  const layers = ['Edge', 'API', 'Worker', 'Database'];

  return (
    <main id="main" className="min-h-screen bg-bg p-8 text-fg">
      <h1 className="font-display text-2xl">LayerRowHover preview</h1>
      <p className="mt-2 text-fg-3">
        CI harness for the AD-13 LayerRowHover contract. Hover or focus a row
        to fire the callback.
      </p>
      <table className="mt-6 w-full max-w-2xl border-collapse">
        <caption className="caption-bottom pb-2 text-left text-fg-3">
          Hover or focus a row to fire the onHoverChange callback. 4 rows
          total.
        </caption>
        <thead>
          <tr className="border-b border-border-strong text-left text-fg-3">
            <th scope="col" className="px-3 py-2">Layer</th>
            <th scope="col" className="px-3 py-2">Index</th>
          </tr>
        </thead>
        <tbody>
          {layers.map((label, i) => (
            <LayerRowHover
              key={label}
              layer={i}
              onHoverChange={(layer, hovered) => {
                if (typeof window !== 'undefined') {
                  // Surface state to the browser console for manual inspection.
                  // (CI checks DOM structure, not console output.)
                  // eslint-disable-next-line no-console
                  console.log(`hover: layer=${layer} hovered=${hovered}`);
                }
              }}
            >
              <td className="min-h-[44px] px-3 py-2 text-fg-2">{label}</td>
              <td className="min-h-[44px] px-3 py-2 text-fg-3">{i}</td>
            </LayerRowHover>
          ))}
        </tbody>
      </table>
    </main>
  );
}
