import { useEffect, useRef, useState } from 'react'
import { AGENDA, AGENDA_QUERY, TERMINAL } from '../content.js'
import v from './Viz.module.css'

// Starts animations when the element scrolls into view on the website.
// Deck slides are stacked on top of each other, so an IntersectionObserver
// reports ALL of them as visible. On slides, pass `active` instead
// (useSlides().current === index) and it overrides the observer.
export function useInView(ref, threshold = 0.25, active) {
  const [seen, setSeen] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting)
      if (e.isIntersecting) setSeen(true)
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  if (active !== undefined) return { seen: active, visible: active }
  return { seen, visible }
}

export function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <button type="button" className={`${v.copy} ${copied ? v.copied : ''} ${className}`} onClick={copy} aria-label="Copy to clipboard">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export function CodeBlock({ lines, label = 'terminal', copy = true, className = '' }) {
  const text = lines.join('\n')
  return (
    <div className={`${v.code} ${className}`}>
      <div className={v.codeHead}>
        <span className={v.codeLabel}>{label}</span>
        {copy && <CopyButton text={text} />}
      </div>
      <pre>{lines.map((l, i) => <code key={i}>{l}</code>)}</pre>
    </div>
  )
}

// Types TERMINAL.command, then reveals TERMINAL.lines one by one. Loops while visible.
export function Terminal({ className = '', children, active }) {
  const ref = useRef(null)
  const { seen, visible } = useInView(ref, 0.2, active)
  const [typed, setTyped] = useState(0)
  const [shown, setShown] = useState(0)
  const [cycle, setCycle] = useState(0)
  const cmd = TERMINAL.command
  const total = TERMINAL.lines.length

  useEffect(() => {
    if (!seen) return undefined
    setTyped(0)
    setShown(0)
    const timers = []
    for (let i = 1; i <= cmd.length; i++) timers.push(setTimeout(() => setTyped(i), 300 + i * 90))
    const start = 300 + cmd.length * 90 + 450
    for (let j = 1; j <= total; j++) timers.push(setTimeout(() => setShown(j), start + j * 520))
    return () => timers.forEach(clearTimeout)
  }, [seen, cycle, cmd, total])

  useEffect(() => {
    if (!visible || shown < total) return undefined
    const t = setTimeout(() => setCycle((c) => c + 1), 6000)
    return () => clearTimeout(t)
  }, [visible, shown, total])

  const pct = Math.round((shown / total) * 100)
  return (
    <div ref={ref} className={`${v.term} ${className}`}>
      {children}
      <div className={v.termBar}>
        <i /><i /><i />
        <span>{TERMINAL.title}</span>
      </div>
      <div className={v.termBody}>
        <p className={v.termCmd}>
          <span className={v.prompt}>❯</span> {cmd.slice(0, typed)}
          {typed < cmd.length && <span className={v.caret} />}
        </p>
        {TERMINAL.lines.slice(0, shown).map((l) => (
          <p key={l.text} className={`${v.termLine} ${v[l.kind]}`}>
            <span className={v.termGlyph}>{l.kind === 'info' ? '›' : l.kind === 'done' ? '★' : '✓'}</span>
            <span className={v.termText}>{l.text}</span>
            {l.meta && <span className={v.termMeta}>{l.meta}</span>}
          </p>
        ))}
        {typed >= cmd.length && shown < total && <p className={v.termWait}><span className={v.spinner} /> {TERMINAL.waiting}</p>}
      </div>
      <div className={v.termFoot}>
        <span className={v.termProgress}><span style={{ width: `${pct}%` }} /></span>
        <span>{pct}%</span>
      </div>
    </div>
  )
}

const maxMins = Math.max(...AGENDA.map((a) => a.mins))

// The agenda as a query editor + result table. "Run" replays the rows.
export function AgendaQuery({ className = '' }) {
  const ref = useRef(null)
  const { seen } = useInView(ref, 0.2)
  const [run, setRun] = useState(0)
  return (
    <div ref={ref} className={`${v.kql} ${className}`}>
      <div className={v.kqlHead}>
        <span className={v.kqlTab}>{AGENDA_QUERY.file}</span>
        <button type="button" className={v.kqlRun} onClick={() => setRun((r) => r + 1)}>▶ Run</button>
      </div>
      <pre className={v.kqlCode}>
        {AGENDA_QUERY.lines.map((l, i) => <code key={i}>{l}</code>)}
      </pre>
      <div className={v.kqlMeta}>
        <span>✓ Query succeeded</span>
        <span>{AGENDA.length} rows · {AGENDA_QUERY.summary}</span>
      </div>
      <div className={v.table} role="table" key={run}>
        <div className={`${v.row} ${v.rowHead}`} role="row">
          <span role="columnheader">Time</span>
          <span role="columnheader">Block</span>
          <span role="columnheader">Focus</span>
          <span role="columnheader">Minutes</span>
        </div>
        {AGENDA.map((a, i) => (
          <div key={a.title} className={`${v.row} ${seen ? v.rowIn : ''}`} role="row" style={{ '--i': i }}>
            <span role="cell" className={v.cellTime}>{a.start}–{a.end}</span>
            <span role="cell" className={v.cellLab}>{a.title}</span>
            <span role="cell" className={v.cellFocus}>{a.focus}</span>
            <span role="cell" className={v.cellBar}>
              <span className={v.barTrack}><span style={{ width: seen ? `${(a.mins / maxMins) * 100}%` : 0 }} /></span>
              <em>{a.mins}</em>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
