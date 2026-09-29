#!/usr/bin/env node
// Visual + layout audit for a DECKIO website + deck.
//
//   node verify.mjs --url http://localhost:5173/<id>/ [--out ./verify-out] [--quick]
//
// Needs Playwright next to this script: `npm install` in this folder once, then
// `npx playwright install chromium`.
//
// What it does:
//   1. Desktop 1440×900: screenshot every site section ([data-panel]) and every
//      slide; flag slides whose content runs into the bottom bar or off-screen.
//   2. iPhone 13 (390px) and iPhone SE (320px): flag any element wider than the
//      viewport (ignores content inside horizontal scrollers), screenshot the
//      site in steps and every slide.
//   3. Collect console errors, page errors and failed requests.
//   4. Build contact sheets (grids of screenshots) so an agent can review many
//      screens in a few image views.
// Exit code 1 if any problem was found. Results: <out>/report.json
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

let chromium, devices
try {
  ({ chromium, devices } = await import('playwright'))
} catch {
  console.error('Playwright not found. Run once in the skill scripts folder:\n  npm install && npx playwright install chromium')
  process.exit(2)
}

const args = process.argv.slice(2)
const opt = (n, f) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : f }
const URL = opt('url')
const OUT = resolve(opt('out', 'verify-out'))
const QUICK = args.includes('--quick')
if (!URL) { console.error('Usage: node verify.mjs --url http://localhost:5173/<id>/ [--out dir] [--quick]'); process.exit(1) }
const base = URL.replace(/#.*$/, '').replace(/\/?$/, '/')

rmSync(OUT, { recursive: true, force: true })
const report = { url: base, errors: [], desktopSlides: [], mobile: {} }

const pad = (n) => String(n).padStart(2, '0')
const SITE_ROOT = '[class*="_site_"]'

function watch(page, tag) {
  page.on('pageerror', (e) => report.errors.push(`${tag} pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && report.errors.push(`${tag} console: ${m.text()}`))
  page.on('response', (r) => r.status() >= 400 && report.errors.push(`${tag} HTTP ${r.status()} ${r.url()}`))
}

// Elements wider than the viewport, skipping anything inside a horizontal scroller.
const overflowProbe = ({ rootSel, W }) => {
  const root = document.querySelector(rootSel) || document.body
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX
      if (ox !== 'visible') return true
    }
    return false
  }
  return [...root.querySelectorAll('*')]
    .filter((e) => {
      const r = e.getBoundingClientRect()
      if (!r.width || getComputedStyle(e).position === 'fixed') return false
      if (e.classList.contains('orb') || e.closest('.orb')) return false
      return (r.right > W + 1 || r.left < -1) && !clipped(e)
    })
    .slice(0, 12)
    .map((e) => {
      const r = e.getBoundingClientRect()
      const cls = (e.className?.baseVal ?? e.className ?? '').toString().split(' ')[0].slice(0, 40)
      return `${e.tagName.toLowerCase()}.${cls} [${Math.round(r.left)}→${Math.round(r.right)}] "${(e.textContent || '').trim().slice(0, 40)}"`
    })
}

async function freshPage(ctx, tag) {
  const page = await ctx.newPage()
  watch(page, tag)
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  return page
}

async function deckShots(page, dir, tag, { mobile }) {
  await page.goto(`${base}#/deck`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const total = await page.evaluate(() => document.querySelectorAll('.slide').length)
  const issues = []
  for (let i = 0; i < total; i++) {
    await page.waitForTimeout(QUICK ? 700 : 1600)
    const info = await page.evaluate(({ mobile }) => {
      const s = document.querySelector('.slide.active') || document.querySelectorAll('.slide')[0]
      const sr = s.getBoundingClientRect()
      const els = [...s.querySelectorAll('*')].filter((e) => !e.closest('.orb') && !/_bar_/.test(e.className?.toString?.() || '') && !e.closest('[class*="_bar_"]'))
      let bottom = 0; let right = 0
      for (const e of els) {
        const r = e.getBoundingClientRect()
        if (!r.width || !r.height) continue
        bottom = Math.max(bottom, r.bottom + s.scrollTop)
        right = Math.max(right, r.right)
      }
      return {
        overflowX: Math.round(right - sr.right),
        // Desktop slides must fit above the bottom bar (~44px); phones scroll vertically.
        overflowY: mobile ? 0 : Math.round(bottom - (sr.bottom - 44)),
      }
    }, { mobile })
    if (info.overflowX > 1) issues.push(`${tag} slide ${i}: content ${info.overflowX}px wider than screen`)
    if (info.overflowY > 1) issues.push(`${tag} slide ${i}: content ${info.overflowY}px below the safe area`)
    await page.screenshot({ path: join(dir, `deck-${pad(i)}.png`) })
    await page.keyboard.press('ArrowRight')
  }
  return { total, issues }
}

async function contactSheet(browser, dir, prefix, perSheet, width, outPrefix) {
  const files = readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.png')).sort()
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
  const out = []
  for (let k = 0; k < files.length; k += perSheet) {
    const imgs = files.slice(k, k + perSheet).map((f) => `<figure><img src="data:image/png;base64,${readFileSync(join(dir, f)).toString('base64')}"><figcaption>${f}</figcaption></figure>`).join('')
    await page.setContent(`<style>body{margin:0;background:#222;display:flex;flex-wrap:wrap;gap:8px;padding:8px;font:12px sans-serif;color:#fff;width:1584px}figure{margin:0}img{width:${width}px;display:block}</style>${imgs}`)
    await page.waitForTimeout(200)
    const p = `${outPrefix}-${k / perSheet}.png`
    await page.screenshot({ path: p, fullPage: true })
    out.push(p)
  }
  await page.close()
  return out
}

const browser = await chromium.launch()
const sheets = []

// ── Desktop ──────────────────────────────────────────────────────────────────
{
  const dir = join(OUT, 'desktop'); mkdirSync(dir, { recursive: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await freshPage(ctx, 'desktop')
  await page.waitForTimeout(QUICK ? 1500 : 4500)
  await page.screenshot({ path: join(dir, 'site-00-top.png') })
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-panel]')].map((e) => e.id).filter(Boolean))
  let n = 1
  for (const id of ids.slice(1)) {
    await page.evaluate(({ id, sel }) => {
      const r = document.querySelector(sel)
      const el = document.getElementById(id)
      if (r) { r.style.scrollBehavior = 'auto'; r.scrollTo(0, el.offsetTop - 70) } else el.scrollIntoView()
    }, { id, sel: SITE_ROOT })
    await page.waitForTimeout(QUICK ? 900 : 2200)
    await page.screenshot({ path: join(dir, `site-${pad(n++)}-${id}.png`) })
  }
  const deck = await deckShots(page, dir, 'desktop', { mobile: false })
  report.desktopSlides = deck.issues
  await ctx.close()
  sheets.push(...await contactSheet(browser, dir, 'site', 4, 780, join(OUT, 'sheet-desktop-site')))
  sheets.push(...await contactSheet(browser, dir, 'deck', 4, 780, join(OUT, 'sheet-desktop-deck')))
}

// ── Mobile ───────────────────────────────────────────────────────────────────
for (const name of ['iPhone 13', 'iPhone SE']) {
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const dir = join(OUT, slug); mkdirSync(dir, { recursive: true })
  const ctx = await browser.newContext({ ...devices[name] })
  const page = await freshPage(ctx, slug)
  await page.waitForTimeout(1500)
  const W = await page.evaluate(() => innerWidth)
  const siteOverflow = await page.evaluate(overflowProbe, { rootSel: SITE_ROOT, W })
  const H = await page.evaluate((sel) => (document.querySelector(sel) || document.scrollingElement).scrollHeight, SITE_ROOT)
  const step = Math.round((await page.evaluate(() => innerHeight)) * 0.9)
  let n = 0
  for (let y = 0; y < H; y += step) {
    await page.evaluate(({ y, sel }) => {
      const r = document.querySelector(sel) || document.scrollingElement
      r.style.scrollBehavior = 'auto'; r.scrollTo(0, y)
    }, { y, sel: SITE_ROOT })
    await page.waitForTimeout(QUICK ? 400 : 900)
    await page.screenshot({ path: join(dir, `site-${pad(n++)}.png`) })
  }
  const deck = await deckShots(page, dir, slug, { mobile: true })
  // Element-level overflow check on the last slide state is not enough; re-check each slide quickly.
  const deckOverflow = []
  await page.goto(`${base}#/deck`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  for (let i = 0; i < deck.total; i++) {
    const o = await page.evaluate(overflowProbe, { rootSel: '.slide.active', W })
    if (o.length) deckOverflow.push({ slide: i, elements: o })
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(250)
  }
  report.mobile[name] = { width: W, siteOverflow, deckIssues: deck.issues, deckOverflow }
  await ctx.close()
  sheets.push(...await contactSheet(browser, dir, 'site', 10, 300, join(OUT, `sheet-${slug}-site`)))
  sheets.push(...await contactSheet(browser, dir, 'deck', 10, 300, join(OUT, `sheet-${slug}-deck`)))
}

await browser.close()

report.sheets = sheets
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2))

const problems = [
  ...report.errors,
  ...report.desktopSlides,
  ...Object.entries(report.mobile).flatMap(([d, m]) => [
    ...m.siteOverflow.map((e) => `${d} site overflow: ${e}`),
    ...m.deckIssues,
    ...m.deckOverflow.map((o) => `${d} slide ${o.slide} overflow: ${o.elements.join(' | ')}`),
  ]),
]
console.log(problems.length ? `✗ ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}` : '✓ No layout problems or errors found')
console.log(`\nContact sheets to review (view each image):\n  ${sheets.join('\n  ')}`)
console.log(`Report: ${join(OUT, 'report.json')}`)
process.exit(problems.length ? 1 : 0)
