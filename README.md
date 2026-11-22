# GEB explainers

A section-by-section visual + audio companion to Douglas Hofstadter's *Gödel, Escher, Bach*.

**Live site:** https://chtran.github.io/geb_explainer/

## Structure
```
index.html          home page: every section of the book, linked when its explainer exists
glossary.html       searchable glossary (reads GLOSSARY.md)
GLOSSARY.md         running list of every term defined, and where it first appeared
assets/geb.css      shared look (colours, type, cards, nav)
assets/music.js     shared audio synth + piano-roll drawing (Web Audio API)
assets/toc.js       the book's table of contents; drives the home page and prev/next links
assets/nav.js       adds "All chapters" + previous/next links to each explainer
NN-slug/index.html  one explainer per section, e.g. 01-introduction/
```

## Adding a new explainer
1. Find the section's `id` in `assets/toc.js` and create that folder with an `index.html`.
2. Start the page with `<body data-chapter="<id>">`, link `../assets/geb.css`, and load `../assets/toc.js`, `../assets/nav.js` and (if it plays music) `../assets/music.js`.
3. Set `done: true` for that entry in `assets/toc.js`.
4. Add the new terms to `GLOSSARY.md`.

To preview locally with working links and glossary, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Conventions
- One self-contained page per section; no build step. Only shared files live in `assets/`.
- Colour code: Gödel = blue `#2c5282`, Escher = green `#2f6b4f`, Bach = red `#9b2f2f`, highlights = gold `#b7862b`, on parchment `#f6f1e7`. Type: EB Garamond (body), Inter (UI), JetBrains Mono (code).
- No voice narration — audio is music demos only, synthesized live.
- **No undefined words.** A reader starting at the top must never hit a term that hasn't been explained yet. Define every new technical word in plain language at its *first* use — inline in parentheses, or in a small "words" box just before the paragraph that needs it. Mark it with `<span class="term">`.
- Terms defined in earlier explainers still get a one-line reminder at first use in each new explainer. Keep `GLOSSARY.md` up to date.
- Each page ends with a one-breath recap, a short self-check quiz and a collapsible glossary of its new words.
- Keep it simple: prefer the clearest explanation over extra panels and widgets.
- Copyrighted art (e.g. Escher's prints) is linked, never copied. Paraphrase the book — no long quotes.
