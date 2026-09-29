import { BottomBar, Editable, Slide, useSlides } from '@deckio/deck-engine'
import { BrandMark, Icon, Logos } from '../theme/Decor.jsx'
import { CodeBlock, Terminal } from '../viz/Viz.jsx'
import { AGENDA, CLEANUP, EVENT, MODULES, PREP, WHY } from '../content.js'
import s from './Slides.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Every slide is driven by content.js. To add a bespoke slide (e.g. a live
// simulator), copy <Frame> + <Header>, export it, and add it to deck.config.js.
// Animated components on slides MUST use `active` (see useInView in Viz.jsx).
// ─────────────────────────────────────────────────────────────────────────────

function Frame({ index, id, children, orbs = ['orbA', 'orbC'] }) {
  return (
    <Slide index={index} className={s.slide}>
      {orbs.map((o) => <div key={o} className={`orb ${s[o]}`} />)}
      <div className={`${s.body} content-frame content-gutter`}>{children}</div>
      <BottomBar text={<Editable as="span" id={`${id}.footer`}>{EVENT.footer}</Editable>} />
    </Slide>
  )
}

function Header({ id, eyebrow, title, highlight, subtitle }) {
  return (
    <div className={s.header}>
      <Editable as="p" id={`${id}.eyebrow`} className={s.eyebrow}>{eyebrow}</Editable>
      <h1>
        <Editable as="span" id={`${id}.title`}>{title}</Editable>
        {highlight && <>{' '}<Editable as="span" id={`${id}.highlight`} className={s.highlight}>{highlight}</Editable></>}
      </h1>
      {subtitle && <Editable as="p" id={`${id}.subtitle`} multiline className={s.subtitle}>{subtitle}</Editable>}
    </div>
  )
}

const gridFor = (n) => (n >= 4 ? s.grid4 : n === 3 ? s.grid3 : n === 2 ? s.grid2 : '')

export function TitleSlide({ index }) {
  return (
    <Slide index={index} className={s.slide}>
      <div className={`orb ${s.orbA}`} />
      <div className={`orb ${s.orbB}`} />
      <div className={`orb ${s.orbC}`} />
      <div className={`${s.hero} content-frame content-gutter`}>
        <div>
          <span className={s.pill}>
            <span className={s.live} aria-hidden="true" />
            <Editable as="span" id="title.pill">{`${EVENT.format} · ${EVENT.duration} · ${EVENT.kicker}`}</Editable>
          </span>
          <h1>
            <Editable as="span" id="title.before">{EVENT.title}</Editable>{' '}
            <Editable as="span" id="title.highlight" className={s.highlight}>{EVENT.highlight}</Editable>
          </h1>
          <Editable as="p" id="title.subtitle" multiline className={s.subtitle}>{EVENT.tagline}</Editable>
        </div>
        <BrandMark className={s.heroMark} />
      </div>
      <Logos className={s.heroLogos} size="md" />
      <BottomBar text={<Editable as="span" id="title.footer">{EVENT.footer}</Editable>} />
    </Slide>
  )
}

export function ChallengeSlide({ index }) {
  return (
    <Frame index={index} id="challenge" orbs={['orbA', 'orbD']}>
      <Header id="challenge" eyebrow={WHY.eyebrow} title={WHY.title} subtitle={WHY.subtitle} />
      <div className={`${s.grid} ${gridFor(WHY.challenges.length)}`}>
        {WHY.challenges.map((c) => (
          <div key={c.title} className={`${s.card} ${s.cardRisk}`}>
            <Icon icon={c.icon} className={s.cardIcon} />
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </Frame>
  )
}

export function SolutionSlide({ index }) {
  return (
    <Frame index={index} id="solution">
      <div className={s.split}>
        <Header id="solution" eyebrow={WHY.solutionEyebrow} title={WHY.solutionTitle} highlight={WHY.solutionHighlight} />
        <BrandMark className={s.sideMark} />
      </div>
      <div className={`${s.grid} ${gridFor(WHY.pillars.length)}`}>
        {WHY.pillars.map((p) => (
          <div key={p.title} className={s.card}>
            <Icon icon={p.icon} className={s.cardIcon} />
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </Frame>
  )
}

export function AgendaSlide({ index }) {
  const modules = AGENDA.filter((a) => !a.aside).length
  return (
    <Frame index={index} id="agenda" orbs={['orbB', 'orbC']}>
      <Header id="agenda" eyebrow="Agenda" title={`${modules} modules,`} highlight={EVENT.duration} />
      <div className={s.timeline}>
        {AGENDA.map((a, i) => (
          <div key={a.title} className={`${s.tl} ${a.aside ? s.tlPre : ''}`} style={{ flexGrow: a.mins, '--i': i }}>
            <span className={s.tlTime}>{a.start}</span>
            <strong>{a.title}</strong>
            <small>{a.focus}</small>
            <em>{a.mins} min</em>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function Steps({ steps }) {
  return (
    <ol className={s.steps}>
      {steps.map((st, i) => (
        <li key={`${st.title}-${i}`}>
          <span>{i + 1}</span>
          <div>
            <strong>{st.title}</strong>
            {st.cmd && <code>{st.cmd}</code>}
            {st.detail && <small>{st.detail}</small>}
          </div>
        </li>
      ))}
    </ol>
  )
}

function ModuleSlide({ index, m, k }) {
  const active = useSlides().current === index
  const orbs = [['orbA', 'orbC'], ['orbB'], ['orbA', 'orbB'], ['orbC', 'orbB']][k % 4]
  const header = <Header id={m.id} eyebrow={`${m.num} · ${m.time}`} title={m.title} subtitle={m.desc} />
  if (m.terminal || m.code) {
    return (
      <Frame index={index} id={m.id} orbs={orbs}>
        <div className={s.twoCol}>
          <div className={s.colText}>
            {header}
            {m.steps?.length > 0 && <Steps steps={m.steps} />}
          </div>
          {m.terminal
            ? <Terminal className={s.term} active={active} key={active ? 'on' : 'off'} />
            : <CodeBlock className={s.term} label={m.code.label} lines={m.code.lines} copy={false} />}
        </div>
      </Frame>
    )
  }
  return (
    <Frame index={index} id={m.id} orbs={orbs}>
      {header}
      <div className={`${s.grid} ${gridFor(m.steps?.length || 0)}`}>
        {(m.steps || []).map((st, i) => (
          <div key={`${st.title}-${i}`} className={`${s.card} ${s.stepCard}`}>
            <span className={s.stepNum}>{String(i + 1).padStart(2, '0')}</span>
            <h3>{st.title}</h3>
            {st.detail && <p>{st.detail}</p>}
            {st.cmd && <code className={s.stepCmd}>{st.cmd}</code>}
          </div>
        ))}
      </div>
    </Frame>
  )
}

export const moduleSlides = MODULES.map((m, k) => {
  const C = ({ index }) => <ModuleSlide index={index} m={m} k={k} />
  C.displayName = `ModuleSlide_${m.id}`
  return C
})

export function PrepSlide({ index }) {
  return (
    <Frame index={index} id="prep" orbs={['orbA']}>
      <Header id="prep" eyebrow="Before the day" title="Pre-flight" highlight="checks" subtitle="The full checklist and copy-ready commands are on the website." />
      <div className={`${s.grid} ${s.grid3}`}>
        {PREP.map((p) => (
          <div key={p.id} className={s.prep}>
            <Icon icon={p.icon} className={s.prepIcon} />
            <div><strong>{p.title}</strong><small>{p.desc}</small></div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

export function CleanupSlide({ index }) {
  return (
    <Frame index={index} id="cleanup" orbs={['orbD', 'orbA']}>
      <Header id="cleanup" eyebrow="Afterwards" title="Clean up to" highlight="stop the meter" subtitle={EVENT.disclaimer} />
      <div className={`${s.grid} ${gridFor(Math.max(2, CLEANUP.length))}`}>
        {CLEANUP.map((c, i) => (
          <div key={c.step} className={`${s.card} ${s.clean}`}>
            <span className={s.cleanNum}>{i + 1}</span>
            <h3>{c.step}</h3>
            <p>{c.detail}</p>
            {c.code && <code>{c.code}</code>}
          </div>
        ))}
      </div>
    </Frame>
  )
}

export function ThankYouSlide({ index }) {
  return (
    <Slide index={index} className={s.slide}>
      <div className={`orb ${s.orbA}`} />
      <div className={`orb ${s.orbB}`} />
      <div className={`orb ${s.orbC}`} />
      <div className={`${s.thanks} content-frame content-gutter`}>
        <BrandMark className={s.thanksMark} />
        <h1><Editable as="span" id="thanks.title" className={s.highlight}>Questions?</Editable></h1>
        <Editable as="p" id="thanks.subtitle" multiline className={s.subtitle}>{EVENT.closing}</Editable>
        <a className={s.link} href={EVENT.primaryLink.href} target="_blank" rel="noreferrer">{EVENT.primaryLink.href.replace(/^https?:\/\//, '')}</a>
        <Logos size="md" className={s.thanksLogos} />
      </div>
      <BottomBar text={<Editable as="span" id="thanks.footer">{EVENT.footer}</Editable>} />
    </Slide>
  )
}
