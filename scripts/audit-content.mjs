// Weekly AD-9 content-audit.
// Fetches Vercel deployments for the past 7 days and asserts that none were
// triggered by a commit from the sanjit-content repo. The Vercel deployment
// API does NOT expose a changed-files list -- only meta.gitCommitMessage
// (free-form string). The heuristic therefore matches path tokens
// (case-studies/ | patterns/ | lab/ | now-snapshot.json | cv.md) appearing
// in the commit message substring. Once E2 lands and the Vercel project is
// bound to two repos, this can be tightened to meta.githubRepo === 'sanjit-content'.
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  console.error(
    '[audit:content] FAIL -- VERCEL_TOKEN and VERCEL_PROJECT_ID must be set',
  );
  process.exit(1);
}

// Paths that should never appear in a code-repo commit message.
const CONTENT_PATHS = [
  'case-studies/',
  'patterns/',
  'lab/',
  'now-snapshot.json',
  'cv.md',
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const sinceUnix = Math.floor((Date.now() - SEVEN_DAYS_MS) / 1000);

const url = new URL('https://api.vercel.com/v6/deployments');
url.searchParams.set('projectId', VERCEL_PROJECT_ID);
url.searchParams.set('since', String(sinceUnix));
url.searchParams.set('limit', '100');

const res = await fetch(url, {
  headers: {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
  },
});

if (!res.ok) {
  // Distinguish config errors (401/403) from transient errors (429/5xx) so the
  // weekly run can retry the latter without masking a real credential issue.
  if (res.status === 401 || res.status === 403) {
    console.error(
      `[audit:content] FAIL -- Vercel API auth error HTTP ${res.status} ${res.statusText} (check VERCEL_TOKEN / VERCEL_PROJECT_ID)`,
    );
  } else {
    console.error(
      `[audit:content] FAIL -- Vercel API HTTP ${res.status} ${res.statusText} (transient; weekly retry)`,
    );
  }
  process.exit(1);
}

const payload = await res.json();
const deployments = Array.isArray(payload.deployments) ? payload.deployments : [];

if (deployments.length === 0) {
  console.log('[audit:content] PASS -- no deployments in past 7 days');
  process.exit(0);
}

const offenders = [];
for (const dep of deployments) {
  const meta = dep.meta ?? {};
  const commitMessage = typeof meta.gitCommitMessage === 'string' ? meta.gitCommitMessage : '';
  if (!commitMessage) {
    continue;
  }
  const matchedPath = CONTENT_PATHS.find((path) => commitMessage.includes(path));
  if (matchedPath) {
    offenders.push({
      id: dep.uid ?? dep.id ?? '(unknown)',
      commitRef: meta.githubCommitRef ?? '(unknown)',
      matchedPath,
      commitMessage: commitMessage.slice(0, 200),
    });
  }
}

if (offenders.length > 0) {
  console.error(
    `[audit:content] FAIL -- ${offenders.length} content-repo-triggered deployment(s) in past 7 days:`,
  );
  for (const o of offenders) {
    console.error(
      `  - deployment=${o.id} commitRef=${o.commitRef} matched=${o.matchedPath} message="${o.commitMessage}"`,
    );
  }
  process.exit(1);
}

console.log(`[audit:content] PASS -- ${deployments.length} deployment(s) clean of content-repo triggers`);
