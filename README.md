# GEB explainers

Interactive, visual, sound-on explainers for Douglas Hofstadter's *Gödel, Escher, Bach: an Eternal Golden Braid*, one page per section of the book (dialogues and chapters).

**Live site:** https://chtran.github.io/geb_explainer/ (GitHub Pages, deployed from `main`)

This README is the brief for anyone, human or agent, building the next explainer. The **Taste** section matters most: it records what worked and what was rejected while building the first page (`01-introduction/`), which is the reference example.

---

## Who it's for

- **Public readers.** Anyone may land on a page. Never address one particular reader, their copy of the book, their reading progress, or anything from a private conversation ("You know do-re-mi…", "in your copy…", "next in your reading…" were all removed).
- **Assume only everyday knowledge**, e.g. do-re-mi and school arithmetic. No assumed music theory (keys, scales, note letters), logic (proof, axiom) or math beyond that.
- **A reader goes top to bottom.** The page must make sense read straight through, without jumping ahead or already knowing the book.

## Taste: how these explainers should feel

### 1. Explain in order, and never skip a step
The most common feedback was "I don't understand X", where X used an idea that hadn't been explained yet, or two parts didn't visibly connect.
- **Define every term at its first use**, in plain words. Inline in parentheses, or in a short "words" box right before the paragraph that needs it. Examples that had to be fixed: "fugue" used before being explained; "C minor" used with readers who didn't know notes have letter names; `S0+S0=SS0` shown before saying what `S` means.
- **Build prerequisites first, simplest first.** When an idea rests on others, lay them out as small numbered steps, each using only what came before. Section 3 became: note names → what a key is → changing key → Bach's climbing canon. Gödel became: liar paradox → "this has no proof" → Gödel numbering ((a) a tiny language, (b) symbol codes, (c) packing with prime powers, worked on a small example) → how that builds "I have no proof".
- **Spell out the connection between steps.** If step 3 is a tool for step 2, say so, and show how it's used. "Gödel then built a formula whose number is *g*" was too big a jump. It needed its own step showing *why* self-reference is hard and *how* it's achieved, with an everyday analogy (Quine's self-describing English sentence).
- **Answer the reader's real question directly.** "A key is the setting a piece lives in: a home note plus a family of 7 notes" beat a vague one-liner.
- **Use a small worked example before a general tool.** `0=0 → codes 1, 3, 1 → 2¹ × 3³ × 5¹ = 270`, then the interactive builder.

### 2. Keep it simple and concise
- One clear explanation beats extra panels. A restructure that added a "what Bach sent the King" panel, a roadmap, listening links, a riddle puzzle and a canon-vs-fugue diagram was judged **worse** ("too overcomplicated") and reverted.
- **Make optional depth optional.** Background some readers already know goes in a collapsed panel (`<details class="primer">`, e.g. "Music basics: notes and keys"), with a one-line summary after it for those who skip.
- **No UI chatter.** Remove helper text the reader doesn't need: "new words are underlined like this", "turn your volume up", global "Stop sound" buttons, glossary links and lists.
- Concise doesn't mean terse. Add the sentence that's needed to follow, and nothing more.

### 3. Interactivity should build intuition, not decorate
Kept and liked:
- **See and hear the same thing.** The canon lab draws both voices as a piano roll while they play, and keyboards light up each note as it sounds.
- **Make the hidden thing measurable.** The canon lab's **clash meter** (red bands plus a percentage) shows *why* some canons sound good.
- **Let readers compare.** Step one key vs jump across the ring, with the keyboard colouring notes kept, new and dropped, and a line saying "5 of 7 notes stay".
- **Offer a solution.** "Show the best setting" buttons answer "what's the optimal configuration?". When there's a puzzle or exercise, give a way to reveal the answer, with the reason.
- Small, direct manipulations: click a piano key to hear it, click symbols to build a formula, "Suppose it's true…" step-throughs.

Rules:
- **Consistency.** The same thing must look and sound the same everywhere. Clicking "C minor" on the ring once played chords while playback played a melody, which confused. A demo labelled C minor once actually played in A minor. Labels, pictures and sounds must agree.
- **Be honest about approximations.** Say "simplified", "rhythm approximate", or "here: notes 1, 2, 6, 10 or 11 keys apart count as a clash" when a model simplifies.
- **Verify numbers by computing them**, not by intuition. The canon puzzle's assumed answer (2 bars) turned out wrong: 1 bar clashes least. Check claims like "5 of 7 notes shared" with code.

### 4. Sound
- **No voice narration.** It was built, then removed by request. Audio is music only, synthesized live with Web Audio.
- **Every Play button toggles to "■ Stop"** while its sound plays, and resets when the sound ends or another starts. Only one sound plays at a time. Use `playToggle(button, startFn)` from `assets/music.js`.

### 5. Definitions by hover, not glossary lists
- Mark every defined word `<span class="term">word</span>` and put its definition in `assets/glossary.js` (key = lowercase singular; plurals like "primes" match automatically). Hovering or tapping shows it.
- Terms first defined in earlier explainers still get `class="term"` at their first use on a new page, plus a short inline reminder if the page depends on them.
- No glossary sections, glossary pages or glossary links.

### 6. Copyright and sources
- Never embed copyrighted art (Escher's prints are under copyright). Link to official sources (mcescher.com, museum pages) and draw original diagrams that convey the idea.
- Paraphrase the book. No long quotes. Bach's music is public domain, but recordings usually aren't: synthesize, or link.
- Check historical and musical facts before stating them.

### 7. Design language
- Parchment background, EB Garamond body, Inter for UI, JetBrains Mono for formulas.
- Colour code: **Gödel blue** `#2c5282`, **Escher green** `#2f6b4f`, **Bach red** `#9b2f2f`, **gold** `#b7862b` for highlights and "playing now", ink `#1f1c17`.
- Building blocks in `assets/geb.css`: numbered section headings (`.sec-head` + `.num`), sub-steps (`.step-h` with a gold badge `.sn`), `.card`, `.intuit` (gold-bordered "Intuition"/"Definition" box), `.words` (dashed box defining words before they're used), `.primer` (collapsible basics), `.chips`, `.legend`, `.row`, `.small-note`. Give headings a real design; don't leave plain text or Unicode circled numbers (①) as headings.
- Each page ends with a one-breath recap and a 4–5 question self-check quiz.

## How the user works with you (process)
- They read a section of the book, then ask for its explainer. Then they read the page top to bottom and give feedback on whatever confuses them. Expect several rounds. Treat each confusion as a gap in the explanation, not in the reader.
- When feedback says a change made things worse, **restore the previous version exactly** (use git), keeping only the parts they explicitly liked.
- Keep changes scoped to what was asked, and report anything else you changed or noticed (e.g. a bug fixed along the way).
- Every change: test, stamp assets, commit with a descriptive message, push to `main`. The live site updates in a minute or two.

## Repo structure
```
index.html             home page: all 42 sections of the book; done ones are linked
NN-slug/index.html     one explainer per section, e.g. 01-introduction/ (the reference example)
assets/geb.css         shared look (colours, type, components, nav, tooltips)
assets/music.js        shared audio: ac(), newBus(), stopSound(), pluck(), playToggle(),
                       piano-roll drawRoll()/playVoices(), themes ROYAL and FJ
assets/toc.js          the book's table of contents (single source); `done: true` marks a finished explainer
assets/nav.js          "All chapters" link + previous/next links on each explainer
assets/glossary.js     every defined term → plain-language definition (single source)
assets/terms.js        hover/tap tooltips for <span class="term">
tools/stamp_assets.py  adds ?v=<content hash> to asset links so browsers never use stale cached files
tools/check_pages.py   headless smoke test of the home page and every finished explainer
```
Page-specific code (e.g. the keyboards and Gödel builder in `01-introduction/`) stays inline. Move a component into `assets/` once a second page needs it.

## Adding a new explainer
1. Find the section's `id` in `assets/toc.js` (e.g. `02-three-part-invention`) and create that folder with an `index.html`. Copy the head, the scripts and the overall skeleton from `01-introduction/index.html`.
2. Use `<body data-chapter="<id>">`. Link `../assets/geb.css`. Load `../assets/toc.js`, `../assets/glossary.js`, `../assets/terms.js` (defer), `../assets/nav.js` (defer), and `../assets/music.js` if it plays sound.
3. Write it following **Taste** above. Add new terms to `assets/glossary.js`.
4. Set `done: true` for the section in `assets/toc.js`.
5. Before committing:
   - `python3 tools/stamp_assets.py`
   - `python3 tools/check_pages.py` (must print only `OK` lines; needs Playwright and Chromium, or `CHROME=/path/to/chrome`)
   - read the page top to bottom as a newcomer: is every word defined before use, and is every step connected to the one before?
6. Commit and push to `main`.

Local preview: run `python3 -m http.server` in the repo root, then open http://localhost:8000.
