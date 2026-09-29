# deckio-site-builder

A GitHub Copilot **skill** for building an interactive **event website and slide deck** in one repo, published to GitHub Pages. You give it a GitHub repo, a lab guide or some existing slides, and it scaffolds the site, fills in the content, adds a themed animated backdrop and interactive widgets, checks desktop and mobile with Playwright, and publishes.

Built from these two sites:

| | Website | Deck |
|---|---|---|
| Agentic Data Engineering Winter Bootcamp | [site](https://natethebuilder.github.io/agentic-data-winter-bootcamp/) | [deck](https://natethebuilder.github.io/agentic-data-winter-bootcamp/#/deck) |
| Agentic Governance Lab with Citadel (BAM × Microsoft) | [site](https://natethebuilder.github.io/citadel-agentic-governance-lab/) | [deck](https://natethebuilder.github.io/citadel-agentic-governance-lab/#/deck) |

It uses [DECKIO](https://github.com/deckio-art/deck-engine) (`@deckio/deck-engine`), React 19, Vite and GitHub Pages.

## Install

You need Git, Node 20+ and the [GitHub CLI](https://cli.github.com/) (`gh auth login`) for publishing.

**Windows (PowerShell)**
```powershell
git clone https://github.com/Natethebuilder/deckio-site-builder "$env:TEMP\deckio-site-builder"
& "$env:TEMP\deckio-site-builder\install.ps1"
```

**macOS / Linux**
```bash
git clone https://github.com/Natethebuilder/deckio-site-builder /tmp/deckio-site-builder
bash /tmp/deckio-site-builder/install.sh
```

The script copies `skills/deckio-site-builder` into `~/.copilot/skills/` and installs the Playwright helper used for verification. Then, in Copilot CLI, run `/skills reload` and check it appears in `/skills list`.

To share it only within one project repo, copy `skills/deckio-site-builder` to `.github/skills/deckio-site-builder` in that repo.

## Use

Just ask Copilot. For example:

> Make a website and deck like the Citadel one for this lab: https://github.com/org/repo/tree/main/workshop. It's for Contoso; leave the date as TBC.

> Turn `C:\decks\kickoff.pptx` into a DECKIO website + deck for our spring hackathon, spring themed, and publish it to my GitHub.

> Use the deckio-site-builder skill to build a site for a 2-hour Fabric data agents workshop. Topics are still being decided, so keep them as placeholders.

The skill will:
1. Read the source material (repo, lab folder, .pptx or an existing site).
2. Ask a few questions: co-brand, theme, date, repo name.
3. Scaffold from the template (`scripts/new-site.mjs`).
4. Fill in `src/content.js`, the palette and the logos.
5. Build a topic-specific backdrop, progress bar and one or two interactive widgets.
6. Run `scripts/verify.mjs` (desktop, iPhone 13 and iPhone SE screenshots, overflow and console checks), then fix what it finds.
7. Create the GitHub repo, enable Pages, deploy, and check the live URL.

## What's inside

```
skills/deckio-site-builder/
  SKILL.md                    workflow + rules Copilot follows
  template/                   generic site + deck (all copy in src/content.js)
  scripts/new-site.mjs        scaffold a new project from the template
  scripts/verify.mjs          Playwright visual/overflow audit with contact sheets
  references/
    design-playbook.md        what users liked/disliked; motifs; checklists
    content-model.md          content.js schema, adding sections/slides/widgets
    deck-engine-gotchas.md    deck-engine quirks (active slides, phone layout…)
    publishing.md             GitHub Pages steps
    source-extraction.md      reading repos and .pptx (incl. image-only/protected)
```

You can also use the template without Copilot:

```bash
node skills/deckio-site-builder/scripts/new-site.mjs --dir ./my-event --id my-event --title "My Event"
cd my-event && npm run dev    # http://localhost:5173/my-event/  (deck at #/deck)
```

## Contributing

When a build teaches you something new, such as a user preference, an engine quirk or a good widget, add it to `references/` so the next build benefits.
