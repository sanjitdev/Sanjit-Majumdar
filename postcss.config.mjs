// postcss.config.mjs — wires Tailwind v4 into Next.js's CSS pipeline.
//
// Why this file exists:
//   Next.js 16 does NOT auto-load @tailwindcss/postcss. The plugin is
//   installed (see package.json `devDependencies`) but nothing imports
//   it, so without this config file Next falls back to its default CSS
//   pipeline (browser-style passthrough). That pipeline does not
//   understand Tailwind v4 directives — @import "tailwindcss" is
//   silently dropped, @theme { ... } triggers a PostCSS warning, and
//   NO utility classes are emitted. Symptom: the compiled CSS file
//   shrinks from a normal ~30–100 KB to ~5 KB containing only the
//   (unrecognized) @theme block, and the rendered page appears
//   unstyled even though the <link rel="stylesheet"> tag is present.
//
// Fix: declare @tailwindcss/postcss as a PostCSS plugin here so
// Next.js's css loader invokes it for every CSS module (incl.
// app/globals.css). After adding this file, restart `pnpm dev` so
// the css loader re-reads its PostCSS config; the next compile will
//   - resolve `@import "tailwindcss"` to Tailwind's preflight + utilities
//   - register every `--token` in `@theme` as both a CSS custom property
//     and a generated utility (e.g. `bg-bg` → `background-color: var(--bg)`)
//   - scan app/, components/, lib/ for class names and emit only the
//     utilities actually used (Tailwind v4 content-scanning is automatic;
//     no `content:` array needed like in v3).
//
// Tailwind v4 note: a `tailwind.config.*` file is NOT required and is
// intentionally absent. All theme config lives in app/globals.css under
// `@theme { ... }` (57 design tokens from AD-18).
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;