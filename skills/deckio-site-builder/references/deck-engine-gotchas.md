# @deckio/deck-engine gotchas

- **Slides are stacked, so IntersectionObserver is useless on them.** Every slide is `position:absolute; inset:0`, so an observer reports all of them as visible. Animate on the current slide instead:
  ```jsx
  const active = useSlides().current === index
  <Widget active={active} key={active ? 'on' : 'off'} />   // key restarts the animation
  ```
  `useInView(ref, threshold, active)` in `src/viz/Viz.jsx` returns `active` directly when it is passed.
- **Slide components** receive `{ index, project }`. Wrap content in the engine's `Slide`, plus `BottomBar` for the footer text. See `Frame` in `src/slides/Slides.jsx`.
- **`deck.config.js`** lists slide components in order. `moduleSlides` generates one slide per module, so adding a module in `content.js` adds a slide automatically.
- **Routing.** The template uses the hash: `#/deck` shows the deck and anything else shows the site. The Pages base path is set by `base: '/<id>/'` in `vite.config.js`.
- **Engine chrome uses hashed class names.** Target them with attribute selectors: `[class*="_navBtn_"]`, `_prev_`, `_next_`, `_bar_`, `exportGroup`, `keyHint`, `progressTrack`, `navWrapper`, and `button[title="Back to home"]`. The site scroll container matches `[class*="_site_"]`.
- **Phone deck.** Under `@media (max-width:760px), (max-height:500px)` the template lets slides scroll vertically, moves the nav arrows to the bottom and hides the export chrome. Keep those overrides in `index.css`.
- **Measuring slide fit.** A `.slide`'s scroll size is inflated by the decorative orbs, so measure the content wrapper instead (`verify.mjs` does this).
- **Export mode.** `html[data-export-mode="capture"]` is set during PDF/PNG export. Hide persistent chrome such as the progress bar under it.
- **Overflow on small screens** nearly always comes from long code lines forcing min-content width. Use `grid-template-columns: minmax(0, 1fr)` (not `1fr`) and `min-width: 0` on flex children, and let `pre` scroll horizontally.
- **Dev server start-up** can take 8–20 s on Windows before it listens. Poll the URL before running Playwright.
- **Reduced motion.** Canvas backdrops must stop when `prefers-reduced-motion` is set or the motion toggle is off. They must also pause on `visibilitychange`.
