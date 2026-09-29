import { useEffect, useRef, useState } from 'react'
import { BrandMark, Icon, Logos, Mascot } from '../theme/Decor.jsx'
import { MotionToggle } from '../theme/Backdrop.jsx'
import { AgendaQuery, CodeBlock, Terminal } from '../viz/Viz.jsx'
import {
  CLEANUP, EVENT, FACTS, FAQ, JOIN, MODULE_TAGS, MODULES, PREP, SETUP, STORAGE_PREFIX, WHY,
} from '../content.js'
import s from './Site.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Website sections, top to bottom. Each <Section> is standalone, numbered and
// linked from the nav. Add a bespoke interactive section (simulator, map,
// explorer…) right after "why": that is what makes each site memorable.
// Put `data-pop` on items that should pop in as they scroll into view.
// ─────────────────────────────────────────────────────────────────────────────

const NAV = [
  ['why', 'Why'],
  ['agenda', 'Agenda'],
  ['modules', 'Modules'],
  ['prepare', 'Get ready'],
  ['faq', 'FAQ'],
]

const PREP_KEY = `${STORAGE_PREFIX}:prep`

function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add(s.in)),
      { root, threshold: 0.08 },
    )
    root.querySelectorAll(`.${s.reveal}`).forEach((el) => io.observe(el))

    const itemIo = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, k) => {
        e.target.style.setProperty('--i', k)
        e.target.classList.add(s.popIn)
        itemIo.unobserve(e.target)
      })
    }, { root, threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    root.querySelectorAll('[data-pop]').forEach((el) => { el.classList.add(s.pop); itemIo.observe(el) })

    return () => { io.disconnect(); itemIo.disconnect() }
  }, [rootRef])
}

function useActiveSection(rootRef) {
  const [active, setActive] = useState('top')
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { root, rootMargin: '-45% 0px -50% 0px' },
    )
    root.querySelectorAll('[data-panel]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
  return active
}

function Section({ id, idx, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className={s.panel} data-panel>
      <div className={`${s.section} ${s.reveal}`}>
        <div className={s.sectionHead}>
          <p className={s.eyebrow}><span className={s.eyebrowIdx}>{idx}</span>{eyebrow}</p>
          <h2>{title}</h2>
          {subtitle && <p className={s.lead}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

function ModuleBrowser() {
  const tags = Object.keys(MODULE_TAGS).filter((t) => MODULES.some((m) => m.tag === t))
  const [filter, setFilter] = useState('all')
  const list = MODULES.filter((m) => filter === 'all' || m.tag === filter)
  return (
    <div>
      {tags.length > 1 && (
        <div className={s.tabs} role="tablist" aria-label="Filter modules">
          {[['all', 'All', MODULES.length], ...tags.map((t) => [t, MODULE_TAGS[t], MODULES.filter((m) => m.tag === t).length])].map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              className={`${s.tab} ${filter === id ? s.tabOn : ''}`}
              onClick={() => setFilter(id)}
            >
              {label} <span className={s.tabCount}>{count}</span>
            </button>
          ))}
        </div>
      )}
      <div className={`${s.grid} ${s.g2} ${s.labs}`} key={filter}>
        {list.map((m, i) => (
          <article key={m.id} className={`${s.lab} ${s.labIn}`} style={{ '--i': i }}>
            <div className={s.labHead}>
              <Icon icon={m.icon} className={s.labIcon} />
              <span className={s.labNum}>{m.num}</span>
              {m.tag && tags.length > 1 && <span className={s.labTag}>{MODULE_TAGS[m.tag]}</span>}
              <span className={s.labTime}>{m.time}</span>
            </div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            {m.code && <CodeBlock lines={m.code.lines} label={m.code.label} copy={m.code.copy !== false} />}
          </article>
        ))}
      </div>
    </div>
  )
}

function PrepChecklist() {
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PREP_KEY)) || {} } catch { return {} }
  })
  useEffect(() => {
    try { localStorage.setItem(PREP_KEY, JSON.stringify(done)) } catch { /* ignore */ }
  }, [done])

  const count = PREP.filter((p) => done[p.id]).length
  const pct = Math.round((count / PREP.length) * 100)
  const all = count === PREP.length

  return (
    <div className={s.checklist}>
      <div className={s.checkHead}>
        <div>
          <span className={`${s.checkScore} ${all ? s.checkScoreDone : ''}`}>{count}/{PREP.length}</span>
          <span className={s.checkLabel}>{all ? 'All set. See you there.' : 'checks done'}</span>
        </div>
        <div className={s.progress} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul>
        {PREP.map((p) => (
          <li key={p.id} data-pop>
            <label className={`${s.checkItem} ${done[p.id] ? s.checked : ''}`}>
              <input
                type="checkbox"
                checked={Boolean(done[p.id])}
                onChange={(e) => setDone((d) => ({ ...d, [p.id]: e.target.checked }))}
              />
              <span className={s.checkBox} aria-hidden="true">{done[p.id] ? '✓' : ''}</span>
              <Icon icon={p.icon} className={s.checkIcon} />
              <span className={s.checkText}>
                <strong>{p.title}</strong>
                <small>{p.desc}</small>
              </span>
              <span className={`${s.badge} ${done[p.id] ? s.badgePass : ''}`}>{done[p.id] ? 'DONE' : 'TO DO'}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SetupCommands() {
  const shells = Object.entries(SETUP)
  const [shell, setShell] = useState(shells[0][0])
  return (
    <div className={s.setup}>
      <div className={s.setupHead}>
        <h3>Setup commands</h3>
        {shells.length > 1 && (
          <div className={s.seg} role="tablist" aria-label="Shell">
            {shells.map(([id, sh]) => (
              <button key={id} type="button" role="tab" aria-selected={shell === id} className={shell === id ? s.segOn : ''} onClick={() => setShell(id)}>
                {sh.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {SETUP[shell].blocks.map((b) => <CodeBlock key={b.label} label={b.label} lines={b.lines} />)}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return 'TBC'
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default function Site({ motion, onToggleMotion }) {
  const rootRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  useReveal(rootRef)
  const active = useActiveSection(rootRef)

  const go = (id) => rootRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className={s.site} ref={rootRef} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}>

      <header className={`${s.nav} ${scrolled ? s.navScrolled : ''}`}>
        <button type="button" className={s.brand} onClick={() => go('top')}>
          <BrandMark className={s.brandMark} />
          <span className={s.brandText}><small>{EVENT.kicker}</small><strong>{EVENT.shortName}</strong></span>
        </button>
        <nav className={s.navLinks} aria-label="Sections">
          {NAV.map(([id, label]) => (
            <button key={id} type="button" className={active === id ? s.navActive : ''} aria-current={active === id ? 'true' : undefined} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
        <div className={s.navActions}>
          <MotionToggle enabled={motion} onToggle={onToggleMotion} />
          <a className={s.btnPrimary} href="#/deck">▶ Deck</a>
        </div>
      </header>

      <main>
        <section id="top" className={`${s.panel} ${s.heroPanel}`} data-panel>
          <div className={s.hero}>
            <div className={s.heroText}>
              <span className={s.pill}>
                <span className={s.pillLive} aria-hidden="true" />
                {EVENT.format} · {EVENT.duration} · {EVENT.level}
              </span>
              <h1>
                {EVENT.title} <span className={s.highlight}>{EVENT.highlight}</span>
              </h1>
              <p className={s.heroLead}>
                <strong>{EVENT.tagline}</strong> {EVENT.subtitle}
              </p>
              <div className={s.ctaRow}>
                <a className={s.btnPrimary} href="#/deck">▶ Present the deck</a>
                <button type="button" className={s.btnGhost} onClick={() => go('modules')}>See the modules</button>
              </div>
              <dl className={s.facts}>
                {FACTS.map((f) => (
                  <div key={f.label}><dt>{f.value}</dt><dd>{f.label}</dd></div>
                ))}
                <div><dt>{formatDate(EVENT.date)}</dt><dd>date</dd></div>
              </dl>
            </div>
            <div className={s.heroArt}>
              <Terminal className={s.terminal}>
                <Mascot className={s.perched} />
              </Terminal>
              <Logos size="md" className={s.heroLogos} />
            </div>
          </div>
          <button type="button" className={s.scrollCue} onClick={() => go('why')} aria-label="Next section">
            <span>scroll</span><i aria-hidden="true">↓</i>
          </button>
        </section>

        <Section id="why" idx="01" eyebrow={WHY.eyebrow} title={WHY.title} subtitle={WHY.subtitle}>
          <div className={s.challenges}>
            {WHY.challenges.map((c) => (
              <div key={c.title} className={s.challenge} data-pop>
                <Icon icon={c.icon} className={s.challengeIcon} />
                <div><strong>{c.title}</strong><small>{c.desc}</small></div>
              </div>
            ))}
          </div>
          <div className={`${s.grid} ${s.g3}`}>
            {WHY.pillars.map((p) => (
              <article key={p.title} className={s.card} data-pop>
                <Icon icon={p.icon} className={s.cardIcon} />
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="agenda" idx="02" eyebrow="Agenda" title={`${EVENT.duration}, hands-on`} subtitle="Run the query to replay the schedule.">
          <AgendaQuery />
        </Section>

        <Section id="modules" idx="03" eyebrow="Modules" title="What you will build" subtitle="Each module ends with something working.">
          <ModuleBrowser />
        </Section>

        <Section id="prepare" idx="04" eyebrow="Get ready" title="Pre-flight checks" subtitle="Tick these off before the day. Your progress is saved in this browser only.">
          <div className={s.prepGrid}>
            <PrepChecklist />
            <SetupCommands />
          </div>
          {CLEANUP.length > 0 && (
            <div className={s.cleanup}>
              <div className={s.cleanupHead}>
                <span className={s.cleanupIcon} aria-hidden="true">🧹</span>
                <div>
                  <h3>Afterwards: clean up</h3>
                  <p>{EVENT.disclaimer}</p>
                </div>
              </div>
              <ol className={s.cleanupSteps}>
                {CLEANUP.map((c, i) => (
                  <li key={c.step} data-pop>
                    <span className={s.stepNum}>{i + 1}</span>
                    <div>
                      <strong>{c.step}</strong>
                      <small>{c.detail}</small>
                      {c.code && <code>{c.code}</code>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Section>

        <Section id="faq" idx="05" eyebrow="FAQ" title="Frequently asked questions">
          <div className={s.faq}>
            {FAQ.map((f) => (
              <details key={f.q} className={s.faqItem} data-pop>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section id="join" className={`${s.panel} ${s.joinPanel}`} data-panel>
          <div className={`${s.register} ${s.reveal}`}>
            <div>
              <p className={s.eyebrow}><span className={s.eyebrowIdx}>06</span>{JOIN.eyebrow}</p>
              <h2>{JOIN.title}</h2>
              <ol className={s.steps}>
                {JOIN.steps.map((step, i) => (
                  <li key={step}><span>{i + 1}</span>{step}</li>
                ))}
              </ol>
              <div className={s.ctaRow}>
                <a className={s.btnPrimary} href={EVENT.primaryLink.href} target="_blank" rel="noreferrer">{EVENT.primaryLink.label} ↗</a>
                <a className={s.btnGhost} href="#/deck">▶ Present the deck</a>
              </div>
            </div>
            <BrandMark className={s.registerMark} />
          </div>
          <footer className={s.footer}>
            <Logos size="sm" />
            <p>
              {EVENT.kicker}. Built on the <a href={EVENT.sourceRepo.href} target="_blank" rel="noreferrer">{EVENT.sourceRepo.label}</a>.{' '}
              {EVENT.disclaimer}
            </p>
            <p className={s.footerSmall}>Built with DECKIO</p>
          </footer>
        </section>
      </main>
    </div>
  )
}
