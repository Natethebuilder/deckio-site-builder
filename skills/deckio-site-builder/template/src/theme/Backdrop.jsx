import { useEffect, useRef, useState } from 'react'
import { STORAGE_PREFIX } from '../content.js'

// ─────────────────────────────────────────────────────────────────────────────
// Animated canvas behind the site and the deck. This default is "data flow":
// streaks travel left to right through a checkpoint line; most pass and take
// the success colour, a few are stopped and fade in the danger colour.
//
// This is the signature motif to REPLACE per event. Past examples:
//   - winter bootcamp: snowfall (density tuned, lower on the deck)
//   - governance lab: request packets passing/blocked at a gateway
// Keep the contract: fixed full-screen canvas, `enabled` + `density` props,
// pauses when the tab is hidden, respects prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = `${STORAGE_PREFIX}:motion`

export function useMotionPreference() {
  const [on, setOn] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) return saved !== 'off'
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch { return true }
  })
  useEffect(() => {
    try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* ignore */ }
  }, [on])
  return [on, setOn]
}

export function MotionToggle({ enabled, onToggle, label = 'Motion' }) {
  return (
    <button
      type="button"
      className="motion-toggle"
      onClick={onToggle}
      aria-pressed={enabled}
      title={enabled ? 'Pause background animation' : 'Play background animation'}
    >
      <span className={`motion-dot ${enabled ? 'on' : ''}`} aria-hidden="true" />
      <span className="motion-toggle-label">{label} {enabled ? 'on' : 'off'}</span>
    </button>
  )
}

function cssRgb(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const m = raw.match(/^#([0-9a-f]{6})$/i)
  if (!m) return fallback
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export default function Backdrop({ enabled = true, density = 1 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const FLOW = cssRgb('--brand', [60, 200, 232])
    const PASS = cssRgb('--brand-3', [48, 180, 87])
    const STOP = cssRgb('--danger', [255, 92, 92])
    let w = 0
    let h = 0
    let gate = 0
    let items = []
    let raf = 0
    let last = performance.now()

    const spawn = (anywhere) => ({
      x: anywhere ? Math.random() * w : -20 - Math.random() * w * 0.3,
      y: Math.random() * h,
      v: 40 + Math.random() * 70,
      len: 18 + Math.random() * 40,
      r: 1 + Math.random() * 1.2,
      stopped: Math.random() < 0.12,
      state: 'in',
      t: 0,
      a: 0.25 + Math.random() * 0.45,
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      gate = w * (w < 760 ? 0.72 : 0.58)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(90, (w * h) / 22000) * density)
      items = Array.from({ length: n }, () => spawn(true))
      items.forEach((p) => { if (p.x > gate) p.state = p.stopped ? 'in' : 'out' })
    }

    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)

      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, rgba(FLOW, 0))
      g.addColorStop(0.5, rgba(FLOW, 0.1))
      g.addColorStop(1, rgba(FLOW, 0))
      ctx.fillStyle = g
      ctx.fillRect(gate - 0.5, 0, 1, h)

      for (let i = 0; i < items.length; i++) {
        const p = items[i]
        if (p.state === 'in') {
          p.x += p.v * dt
          if (p.x >= gate) {
            if (p.stopped) { p.state = 'stopped'; p.x = gate; p.t = 0 } else p.state = 'out'
          }
        } else if (p.state === 'out') {
          p.x += p.v * 1.15 * dt
        } else {
          p.t += dt
          p.x -= 30 * dt
        }

        if (p.state === 'stopped') {
          const k = Math.max(0, 1 - p.t / 1.1)
          ctx.strokeStyle = rgba(STOP, 0.55 * k)
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(gate, p.y, 3 + p.t * 16, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = rgba(STOP, 0.8 * k)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r + 0.6, 0, Math.PI * 2)
          ctx.fill()
          if (p.t > 1.1) items[i] = spawn(false)
          continue
        }

        const c = p.state === 'out' && p.x > gate + 40 ? PASS : FLOW
        const tail = ctx.createLinearGradient(p.x - p.len, 0, p.x, 0)
        tail.addColorStop(0, rgba(c, 0))
        tail.addColorStop(1, rgba(c, p.a * 0.6))
        ctx.strokeStyle = tail
        ctx.lineWidth = p.r
        ctx.beginPath()
        ctx.moveTo(p.x - p.len, p.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        ctx.fillStyle = rgba(c, p.a)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()

        if (p.x - p.len > w + 10) items[i] = spawn(false)
      }
      raf = requestAnimationFrame(frame)
    }

    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) }
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [enabled, density])

  if (!enabled) return null
  return <canvas ref={ref} className="backdrop" aria-hidden="true" />
}
