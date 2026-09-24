// Custom HTML reporter for pa11y-ci@3.1.0.
// pa11y-ci 3.1.0 ships only CLI and JSON reporters; this fills the gap.
// Writes ./pa11y-reports/index.html aggregating per-URL pass/fail sections.
// Spec change log entry: "html" reporter missing in pa11y-ci@3.1.0, replaced with
// a ~60-line custom reporter referenced as "./scripts/pa11y-html-reporter.js".
// pa11y-ci expects a factory function: module.exports = function(options, config)
// returning { beforeAll, results, error, afterAll }.

const fs = require('node:fs');
const path = require('node:path');

const REPORT_DIR = path.resolve('./pa11y-reports');
const REPORT_FILE = path.join(REPORT_DIR, 'index.html');

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderIssue(issue) {
  const selector = escapeHtml(issue.selector ?? '(no selector)');
  const code = escapeHtml(issue.code ?? 'unknown');
  const type = escapeHtml(issue.type ?? 'unknown');
  const message = escapeHtml(issue.message ?? '(no message)');
  const context = escapeHtml(issue.context ?? '');
  return `<li class="issue">
  <h3>${code}</h3>
  <p><strong>Type:</strong> ${type}</p>
  <p><strong>Selector:</strong> <code>${selector}</code></p>
  <p><strong>Message:</strong> ${message}</p>
  ${context ? `<pre>${context}</pre>` : ''}
</li>`;
}

function renderResults(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return '<p>No URLs were tested.</p>';
  }
  const sections = results.map((r, idx) => {
    const url = escapeHtml(r.pageUrl ?? r.url ?? `URL #${idx + 1}`);
    const issues = Array.isArray(r.issues) ? r.issues : [];
    const status = issues.length === 0 ? 'pass' : 'fail';
    const issueList = issues.map(renderIssue).join('\n');
    return `<section class="${status}">
  <h2>${status === 'pass' ? 'PASS' : 'FAIL'} &mdash; <a href="${url}">${url}</a></h2>
  <p><strong>Issues:</strong> ${issues.length}</p>
  ${issueList ? `<ul>${issueList}</ul>` : '<p>No issues.</p>'}
</section>`;
  });
  return sections.join('\n');
}

module.exports = function htmlReporter(_options, _config) {
  return {
    beforeAll(urls) {
      // No-op; CLI reporter announces URLs.
    },
    results(_testResults, _reportConfig) {
      // Per-URL hook; aggregate at afterAll.
    },
    error(error, url) {
      // Per-URL error hook; aggregate at afterAll.
    },
    afterAll(report) {
      try {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
        const all = [];
        if (report && report.results && typeof report.results === 'object') {
          for (const [url, issues] of Object.entries(report.results)) {
            all.push({
              pageUrl: url,
              issues: Array.isArray(issues) ? issues : [],
            });
          }
        }
        const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>pa11y-ci report</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 960px; padding: 0 1rem; color: #06070B; background: #FAFAFA; }
  h1 { border-bottom: 2px solid #06070B; padding-bottom: 0.5rem; }
  section { border: 1px solid #ccc; border-radius: 6px; padding: 1rem; margin: 1rem 0; }
  section.pass { border-color: #2a8a2a; }
  section.fail { border-color: #b3261e; background: #fff5f5; }
  .issue { border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem; }
  code { background: #eee; padding: 0 0.25rem; border-radius: 3px; }
  pre { background: #eee; padding: 0.5rem; overflow-x: auto; }
</style>
</head>
<body>
  <h1>pa11y-ci accessibility report</h1>
  <p><strong>Total:</strong> ${escapeHtml(report?.total ?? 0)} | <strong>Passes:</strong> ${escapeHtml(report?.passes ?? 0)} | <strong>Errors:</strong> ${escapeHtml(report?.errors ?? 0)}</p>
  ${renderResults(all)}
</body>
</html>
`;
        fs.writeFileSync(REPORT_FILE, html, 'utf8');
      } catch (err) {
        // Reporter must not crash the run; surface to stderr and continue.
        console.error(`[pa11y-html-reporter] error: ${err.message}`);
      }
    },
  };
};
