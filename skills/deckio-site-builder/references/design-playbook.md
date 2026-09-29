# Design playbook

These are lessons from the first two builds, most of them from direct user feedback. Treat them as defaults.

## What made them feel "cool"
| Ingredient | Winter data bootcamp | Citadel governance lab |
|---|---|---|
| Backdrop motif | Snowfall canvas, moderate density, lower on the deck | Request packets crossing a gateway line: most pass (green), some are blocked (red) |
| Deck progress bar | String of Christmas-light bulbs that light up as you advance | Castle battlement wall that fills in, with a glowing head |
| Signature widget | SQL query editor that "runs" the agenda; data-pipeline visuals | Gateway simulator (send requests, watch policies allow or deny), clickable architecture map, layer stack |
| Palette | Icy blues + festive red/green accents | Deep navy, cyan and steel, with BAM orange as the customer accent |
| Co-branding | Microsoft + GitHub | BAM × Microsoft (+ Citadel mark) |

Pick **one** motif, **one** progress-bar silhouette and **one or two** widgets that come straight from the subject matter. For example: rows streaming into a lakehouse, tokens flowing through a model, containers stacking, or packets being inspected.

## Feedback to respect
- **Be concise.** Short headings, one or two sentences per card. Cut sections that have nothing real to say.
- **Backdrop density is a balance.** The user said both "tone it down" and "you toned it down too much". Keep it visible but calm, and lower on the deck (the template uses density 0.55 there).
- **The progress bar must persist.** Render it once, outside the slides, and animate only its width. Users hated it fading, flickering or re-drawing on each slide change.
- **Progress-bar decorations must not look cropped** at the top edge. Give the element enough height so glows and bulbs aren't clipped.
- **No decorative dots or blobs on top of cards.** "Those white balls on top of the cards look weird."
- **Section spacing.** Sections should read standalone and must not overlap each other. Gaps shouldn't be so large that they feel disconnected. About 96 px of vertical padding on desktop and 56 px on mobile landed well.
- **Hero brand badge.** A big floating label in the top-left of the hero looked bad. Keep branding in the nav.
- **Remove what the user removes.** When they ask to drop a section, delete it from the site, the nav and the deck, then grep to confirm.
- **Don't duplicate motifs.** If the deck has the themed lights, keep them off the landing page.
- **Favicon.** Use the Microsoft logo, which the template already includes.
- **Mobile is first-class.** Everything must look good at 320–390 px. Animations must run on phones too, and no text may overflow (a gift/label chip overflowing was a reported bug).
- **Placeholders are fine.** Leave undecided topics as `[Topic TBC]` rather than inventing them.
- **Audience focus.** Write for the audience (e.g. "data community": SQL/KQL, pipelines, lakehouse visuals) instead of generic AI copy.

## Internal vs external
If the user wants an internal area (to-dos, planning, comms plan, analytics and iteration), add a separate route such as `#/internal` with its own nav. Tell them it is **not** access-controlled on GitHub Pages. Truly private material needs a private repo or another host.

## Visual checklist before publishing
- Hero: title gradient readable, CTAs visible, logos aligned at the same optical height (tune `scale` in `LOGOS`).
- Logos: a transparent-interior mark may vanish on dark backgrounds. Fill it (the Citadel shield needed a white fill) or put it on a light chip.
- Every slide fits inside the frame at 1440×900 with no scroll.
- On phones, deck slides scroll vertically and the nav arrows sit at the bottom without covering content.
- No console errors and no 404s for logos or icons (paths are relative to `public/`, with no leading slash).
