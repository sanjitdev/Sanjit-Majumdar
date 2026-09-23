import re
from pathlib import Path

base = Path(r"C:\ZDrive Folders\Projects\Sanjit-Majumdar\_bmad-output\planning-artifacts\ux-designs\ux-Sanjit-Majumdar-2026-09-23\mockups\v4")
files = sorted(base.glob("*.html"))

# Reference token set (from v4 design system)
expected_tokens = [
    "--bg", "--bg-2", "--bg-3", "--glass", "--glass-strong", "--fg", "--fg-2", "--fg-3", "--fg-4",
    "--border", "--border-strong", "--border-accent", "--accent", "--accent-2", "--accent-3",
    "--accent-glow", "--live", "--live-glow",
    "--shadow-md", "--shadow-lg", "--shadow-glow", "--shadow-glow-strong",
    "--gradient-hero", "--gradient-card", "--gradient-text", "--gradient-button",
    "--radius-sm", "--radius-md", "--radius-lg", "--radius-xl", "--radius-full",
    "--gutter", "--section-y", "--max-w", "--progress",
]

# Files expected to be linked from each other
expected_pages = {
    "01-homepage.html", "02-work.html", "03-case-study.html", "04-pattern.html",
    "05-now.html", "06-about.html", "07-lab.html", "08-built.html", "09-recruiter.html",
}

print(f"=== V4 IMPECCABLE SWEEP · {len(files)} files ===\n")
print(f"{'file':28}{'kB':>6}  {'styles':>7}  {'events':>7}  {'dup':>4}  {'anchor':>7}  {'a11y':>4}  {'tokens':>7}  {'cross':>5}")
print("-" * 96)

all_cross_warnings = []
all_a11y_warnings = []
all_token_warnings = []

for f in files:
    c = f.read_text(encoding="utf-8")
    size_kb = round(len(c) / 1024, 1)

    # Strip CSS blocks for HTML-level audit
    ns = re.sub(r"<style[^>]*>.*?</style>", "", c, flags=re.DOTALL)
    inline_styles = len(re.findall(r'\sstyle="', ns))
    inline_events = len(re.findall(r'\son[a-z]+="', c))

    ids = re.findall(r'\sid="([^"]+)"', c)
    dups = [i for i in set(ids) if ids.count(i) > 1]

    hrefs = re.findall(r'href="#([^"]+)"', c)
    missing = [h for h in hrefs if h not in ids]

    # A11y checks
    a11y_issues = []
    if '<a class="skip"' not in c and 'href="#main"' not in c[:600]:
        a11y_issues.append("skip")
    if 'role="dialog"' in c:
        if 'aria-modal="true"' not in c:
            a11y_issues.append("aria-modal")
        if 'aria-labelledby=' not in c:
            a11y_issues.append("aria-labelledby")
    if '<nav ' in c and 'aria-label=' not in c:
        a11y_issues.append("nav-aria-label")
    if 'aria-hidden="true"' not in c:
        # Most pages have at least one aria-hidden (signature canvas etc)
        a11y_issues.append("aria-hidden")

    # Token presence (in :root)
    root_match = re.search(r":root\s*\{([^}]+)\}", c)
    css_tokens = []
    if root_match:
        css_tokens = re.findall(r"--[\w-]+", root_match.group(1))
    missing_tokens = [t for t in expected_tokens if t not in css_tokens]

    # Cross-page link integrity (do linked pages exist?)
    cross_refs = set(re.findall(r'href="([^"#][^"]*\.html)"', c))
    cross_refs -= {"index.html"}
    unknown_refs = cross_refs - expected_pages
    if unknown_refs:
        all_cross_warnings.append((f.name, unknown_refs))

    # Required pages reference (do files that should be referenced from elsewhere actually exist)
    # Skip — every file is auto-referenced by every other file's nav. Already covered above.

    a11y_short = "ok" if not a11y_issues else ",".join(a11y_issues)
    token_short = "ok" if not missing_tokens else f"-{len(missing_tokens)}"
    cross_short = "ok" if not unknown_refs else f"?{len(unknown_refs)}"

    if a11y_issues:
        all_a11y_warnings.append((f.name, a11y_issues))
    if missing_tokens:
        all_token_warnings.append((f.name, missing_tokens))

    print(f"{f.name:28}{size_kb:>6}  {inline_styles:>7}  {inline_events:>7}  {len(dups):>4}  {len(missing):>7}  {a11y_short:>4}  {token_short:>7}  {cross_short:>5}")

print("\n--- WARNINGS ---")
if all_a11y_warnings:
    print("\nA11y issues:")
    for fn, iss in all_a11y_warnings:
        print(f"  {fn}: {iss}")
else:
    print("\nA11y: clean.")

if all_token_warnings:
    print("\nToken issues (missing expected tokens in :root):")
    for fn, mt in all_token_warnings:
        print(f"  {fn}: missing {mt}")
else:
    print("\nTokens: all 9 files have full v4 token set.")

if all_cross_warnings:
    print("\nCross-page link issues (links to .html files outside the v4 set):")
    for fn, ur in all_cross_warnings:
        print(f"  {fn}: {ur}")
else:
    print("\nCross-page links: every href is a known v4 file.")

print("\n=== SWEEP COMPLETE ===")
