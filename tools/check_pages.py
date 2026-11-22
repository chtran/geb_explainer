"""Smoke-test every finished explainer in a headless browser before committing.

Checks, for the home page and each section marked done in assets/toc.js:
  - no JavaScript errors and no failed (4xx/5xx) requests while loading
  - every <span class="term"> has a definition in assets/glossary.js
  - every button can be clicked (expanding any collapsed <details> first) without errors
Usage (from the repo root):  python3 tools/check_pages.py
Needs: pip install playwright && playwright install chromium   (or set CHROME=/path/to/chrome)
"""
import functools, http.server, json, os, pathlib, re, socketserver, sys, threading
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
toc = json.loads(re.search(r"window\.GEB_TOC\s*=\s*(\[.*\]);", (root / "assets/toc.js").read_text(), re.S).group(1))
pages = [""] + [e["id"] + "/" for e in toc if e.get("done")]

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=str(root))
srv = socketserver.TCPServer(("127.0.0.1", 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{srv.server_address[1]}/"

failures = 0
with sync_playwright() as p:
    kw = {"args": ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]}
    if os.environ.get("CHROME"): kw["executable_path"] = os.environ["CHROME"]
    browser = p.chromium.launch(**kw)
    for path in pages:
        page = browser.new_page(viewport={"width": 1200, "height": 900})
        errs = []
        page.on("pageerror", lambda e: errs.append(f"JS error: {e}"))
        page.on("response", lambda r: r.status >= 400 and not r.url.endswith("favicon.ico") and errs.append(f"HTTP {r.status}: {r.url}"))
        page.goto(base + path); page.wait_for_timeout(800)
        undefined = page.evaluate("[...document.querySelectorAll('.term')].filter(e=>e.tabIndex!==0).map(e=>e.textContent)") if path else []
        errs += [f"term without a definition in glossary.js: {t!r}" for t in undefined]
        page.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        buttons = page.locator("main button")
        for i in range(buttons.count()):
            b = buttons.nth(i)
            if b.is_visible():
                try: b.click(timeout=2000); page.wait_for_timeout(60)
                except Exception as e: errs.append(f"could not click button {b.inner_text()!r}: {e}")
        page.wait_for_timeout(300)
        print(("OK   " if not errs else "FAIL ") + "/" + path + (f"  ({buttons.count()} buttons clicked)" if path else ""))
        for e in errs: print("     " + e)
        failures += bool(errs)
        page.close()
    browser.close()
srv.shutdown()
sys.exit(1 if failures else 0)
