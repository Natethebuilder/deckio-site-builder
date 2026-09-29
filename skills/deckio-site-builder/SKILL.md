---
name: deckio-site-builder
description: Build and publish an interactive event website combined with a DECKIO slide deck (React + Vite, GitHub Pages) for a workshop, lab, bootcamp or hackathon. Use when the user wants a site/deck "like the winter bootcamp or Citadel lab one", or asks to turn a GitHub repo, lab guide, workshop folder, or existing .pptx slides into a website with a presentable deck, or mentions deckio / create-deckio / deck-engine.
---

# DECKIO site builder

Produces one repository that serves both an **external event website** (hero, why, agenda, modules, pre-flight checklist, FAQ, join) and a **presentable slide deck** at `#/deck`. Everything is driven by one content file. It then publishes the repository to GitHub Pages.

Reference builds made with this workflow:
- Winter bootcamp (data, festive): https://natethebuilder.github.io/agentic-data-winter-bootcamp/
- Citadel governance lab (BAM × Microsoft): https://natethebuilder.github.io/citadel-agentic-governance-lab/

Paths below are relative to this skill folder (`SKILL_DIR`, the folder containing this file).

## Workflow

### 1. Gather the source material
The user usually gives one or more of these:
- **Repo or lab URL.** Clone it into a temp folder, or read it with the GitHub tools. Pull out the lab/module list, prerequisites, setup commands, architecture, clean-up steps, and any logos or diagrams.
- **.pptx files.** A .pptx is a zip. Slide text is in `ppt/slides/slide*.xml` and images are in `ppt/media/`. DECKIO-exported decks are image-only, so view the PNGs. Sensitivity-labelled files can't be unzipped, so ask for a PDF/PNG export. See `references/source-extraction.md`.
- **An existing DECKIO site to imitate.** Read its `src/content.js` and `src/viz/*`.

Write a short internal outline (event → problem → approach → agenda → modules → prep → clean-up → FAQ) before any code.

### 2. Ask only what you cannot infer
Use `ask_user`, one question per call, with choices. Typical questions:
- Customer or partner for co-branding, and whether you have their logo.
- Theme or mood (seasonal, industry, product), which drives the palette and the backdrop motif.
- Date and format, or leave them as `TBC`.
- GitHub owner and repo name, and public vs private. Pages on a private repo needs a paid plan.

Undecided topics stay as visible placeholders (`[Topic TBC]`). Do not invent agenda content the user said is still undecided.

### 3. Scaffold
```
node "<SKILL_DIR>/scripts/new-site.mjs" --dir <target-folder> --id <repo-name> --title "<Event title>" --description "<one line>"
```
`--id` must equal the GitHub repo name, because it becomes the Pages base path `/<id>/`. The script copies `template/`, replaces tokens, and runs `npm install`.

### 4. Fill the content
- Edit `src/content.js`. It holds all copy for both the site and the deck (schema in `references/content-model.md`). Keep it concise: one-line titles, one or two sentences per card.
- Set the palette in the `:root` variables at the top of `src/index.css` (`--night`, `--brand`, `--brand-2`, `--brand-3`, `--danger`, `--warn`). Everything else derives from them.
- Put logos in `public/logos/`. Trim the SVG viewBox to the artwork. Check that transparent or dark marks are visible on the dark background; fill or outline them if not. Keep `microsoft-mark.svg` for Microsoft co-branding. The favicon is already the Microsoft logo.

### 5. Make it feel bespoke (this is what makes it "cool")
- **Signature backdrop.** Replace the motif in `src/theme/Backdrop.jsx` with one that fits the topic (winter: snow; governance: request packets through a gateway; data: streaming rows). Keep its contract: `enabled` + `density` props, pause when hidden, respect reduced motion, run on phones.
- **Themed progress bar.** Restyle `.deck-progress-*` in `index.css` (winter: Christmas-light bulbs; Citadel: a battlement wall). It must stay persistent and fill smoothly. It must never fade or flicker between slides.
- **One or two bespoke interactive widgets** in `src/viz/Viz.jsx`, used on the site and on a slide. Examples: gateway simulator, architecture map with clickable nodes, layer stack, SQL/KQL query that "returns" the agenda. On slides, animate on the `active` prop, not IntersectionObserver (see `references/deck-engine-gotchas.md`).
- Follow `references/design-playbook.md`. It records what users liked and disliked in earlier builds.

### 6. Verify (do not skip)
```
npm run build
npm run dev -- --port 5210 --strictPort      # async; takes ~8-20 s to start listening
cd "<SKILL_DIR>/scripts"; npm install          # first time only (Playwright)
npx playwright install chromium                # first time only
node "<SKILL_DIR>/scripts/verify.mjs" --url http://localhost:5210/<id>/ --out <tmp>/verify
```
`verify.mjs` screenshots every section and slide on desktop, iPhone 13 and iPhone SE (320 px). It flags horizontal overflow, slides that don't fit, and console, page or HTTP errors, and exits with code 1 if there are problems. **Open every contact sheet it prints with the `view` tool** and fix anything that looks off, even when the audit passes. Repeat until clean.

### 7. Publish
Follow `references/publishing.md`: `git init`, commit (with the Co-authored-by trailer), `gh repo create`, enable Pages with `build_type=workflow`, dispatch `deploy.yml`, watch the run, then load the live URL and run `verify.mjs --quick` against it.

### 8. Report back
Give the live URL, the repo URL, the deck URL (`…/#/deck`), and a short list of the assumptions and placeholders still to be filled.

## Rules
- The site and the deck share `content.js`, so never duplicate copy into components.
- Concise beats complete. Cut any section that has nothing real to say. Set `CLEANUP = []` to hide clean-up.
- Every change must work at 320 px wide. Use `minmax(0, 1fr)` grid columns and `min-width: 0` on flex children that hold code.
- Animations must run on phones too. Only `prefers-reduced-motion` or the motion toggle turns them off.
- Don't add decorative dots or blobs on top of cards. Keep section spacing even (about 96 px desktop / 56 px mobile). Each section should read on its own without big gaps.
- Keep internal material (to-dos, planning, analytics) off the public site unless the user asks. If they do, put it behind a separate route (e.g. `#/internal`) and say it is not access-controlled.
