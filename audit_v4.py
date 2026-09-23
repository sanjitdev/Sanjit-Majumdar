import re, sys
from pathlib import Path

base = Path(r"C:\ZDrive Folders\Projects\Sanjit-Majumdar\_bmad-output\planning-artifacts\ux-designs\ux-Sanjit-Majumdar-2026-09-23\mockups\v4")
target = sys.argv[1] if len(sys.argv) > 1 else "07-lab.html"
f = base / target
c = f.read_text(encoding="utf-8")

# Strip CSS blocks
ns = re.sub(r"<style[^>]*>.*?</style>", "", c, flags=re.DOTALL)
inline_styles = re.findall(r'\sstyle="', ns)
inline_events = re.findall(r'\son[a-z]+="', c)
ids = re.findall(r'\sid="([^"]+)"', c)
dups = [i for i in set(ids) if ids.count(i) > 1]
hrefs = re.findall(r'href="#([^"]+)"', c)
missing = [h for h in hrefs if h not in ids]
imgs = re.findall(r"<img[^>]*>", c)
no_alt = [i for i in imgs if "alt=" not in i]

print(f"=== {target} ===")
print(f"size: {len(c)} chars")
print(f"inline_styles: {len(inline_styles)}")
print(f"inline_events: {len(inline_events)}")
print(f"dup_ids: {len(dups)} -> {dups[:3]}")
print(f"broken_inpage_anchors: {len(missing)} -> {missing[:5]}")
print(f"imgs_without_alt: {len(no_alt)}")

# cross-page links
cross = re.findall(r'href="([^"#][^"]*)"', c)
print(f"cross_page_links: {len(cross)} -> {cross[:6]}")
