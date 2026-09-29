# Content model (`src/content.js`)

All copy for the site and the deck lives in this file. Components only read it.

| Export | Used by | Shape / notes |
|---|---|---|
| `EVENT` | nav, hero, title/closing slides, footer | `title`, `highlight` (gradient half of the title), `shortName` (nav), `kicker` (e.g. `BAM × Microsoft`), `tagline`, `subtitle`, `format`, `duration`, `level`, `date` (ISO or `null` → "TBC"), `footer` (deck bottom bar), `primaryLink {label, href}`, `sourceRepo {label, href}`, `closing`, `disclaimer` |
| `LOGOS` | hero, footer, title + closing slides | `[{ src, alt, scale?, x?, divider? }]`. `x` draws a × before the logo; `divider` draws a rule; `scale` evens out optical size |
| `MARK` | nav brand, title slide, join panel | `{ src, alt }` |
| `FACTS` | hero stat strip | `[{ value, label }]`, 3–4 items |
| `WHY` | site §01, Challenge + Solution slides | `eyebrow`, `title`, `subtitle`, `challenges[{icon,title,desc}]` (3–4), `solutionEyebrow`, `solutionTitle`, `solutionHighlight`, `pillars[{icon,title,desc}]` (3) |
| `AGENDA` | site §02 query widget, Agenda slide timeline | `[{ start, end, title, focus, mins, aside? }]`. `mins` sets the proportions; `aside` gives a dashed, non-module block |
| `AGENDA_QUERY` | site §02 | `{ file, summary, lines[] }`. Use a query language the audience knows |
| `MODULES` | site §03 cards, one deck slide each | `[{ id, num, time, icon, tag, title, desc, steps[{title, cmd?, detail?}], code?{label, lines[], copy?}, terminal? }]` |
| `MODULE_TAGS` | filter tabs | `{ tagKey: 'Label' }` |
| `TERMINAL` | hero terminal, `terminal: true` module slide | `{ title, command, waiting, lines[{kind: 'info' | 'ok' | 'done', text, meta?}] }` |
| `PREP` | site §04 checklist, Prep slide | `[{ id, icon, title, desc }]`. Progress is saved in localStorage |
| `SETUP` | site §04 command tabs | `{ pwsh: {label, blocks[{label, lines[]}]}, bash: {...} }`. Keep one key if only one shell applies |
| `CLEANUP` | site §04, Cleanup slide | `[{ step, detail, code? }]`. `[]` hides both |
| `FAQ` | site §05 | `[{ q, a }]` |
| `JOIN` | site §06 | `{ eyebrow, title, steps[] }` |
| `STORAGE_PREFIX` | localStorage keys | Set to the project id by the scaffold |

**Icons:** an emoji (`'🚀'`) or a path under `public/` (`'icons/apim.svg'`). Paths have no leading slash, so they work under the Pages base path.

**Placeholders:** write `TBC` or `[Something TBC]`. Grep for `TBC` and `[` before publishing and report what is left.

## Adding sections, slides or widgets
- **New site section:** add it to `NAV` and to the `<main>` in `src/site/Site.jsx`. Reuse `Section` / `.eyebrow` / `.card` and keep the same spacing.
- **New slide:** export a component from `src/slides/Slides.jsx` using `Frame` + `Header`, then add it to `deck.config.js`.
- **New widget:** put it in `src/viz/Viz.jsx` with styles in `Viz.module.css`. Accept an `active` prop so it animates on slides.
- The Citadel repo has good widget examples to copy: `GatewaySimulator`, `ArchitectureMap` and `LayerStack` in https://github.com/Natethebuilder/citadel-agentic-governance-lab/blob/main/src/viz/Viz.jsx.
