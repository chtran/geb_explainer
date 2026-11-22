"""Add a content-hash version (?v=xxxxxxxx) to every assets/ link in the site's HTML,
so browsers fetch the new file whenever it changes instead of a cached old copy.
Run from the repo root before committing:  python3 tools/stamp_assets.py"""
import hashlib, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
hashes = {p.name: hashlib.sha1(p.read_bytes()).hexdigest()[:8] for p in (root / "assets").iterdir() if p.is_file()}
pat = re.compile(r'((?:\.\./)?assets/([\w.-]+))(\?v=[0-9a-f]+)?')
for html in root.glob("**/*.html"):
    s = html.read_text()
    new = pat.sub(lambda m: m.group(1) + ("?v=" + hashes[m.group(2)] if m.group(2) in hashes else ""), s)
    if new != s:
        html.write_text(new); print("stamped", html.relative_to(root))
