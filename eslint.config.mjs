import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "*.tsbuildinfo",
      "coverage/**",
      // CommonJS shim required by pa11y-ci 3.1.0 (no HTML reporter shipped).
      // Uses `require()` + `module.exports`; not project source code.
      "scripts/pa11y-html-reporter.js",
    ],
  },
];

export default config;
