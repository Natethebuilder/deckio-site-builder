import { Fragment } from 'react'
import { LOGOS, MARK } from '../content.js'

const BASE = import.meta.env.BASE_URL
const isPath = (icon) => typeof icon === 'string' && /\.(svg|png|webp|jpe?g)$/i.test(icon)

// Emoji or image path from content.js, rendered consistently.
export function Icon({ icon, className = '', size }) {
  if (!icon) return null
  if (isPath(icon)) {
    return (
      <img
        src={`${BASE}${icon}`}
        alt=""
        className={`icon-img ${className}`}
        style={size ? { width: size, height: size } : undefined}
        draggable="false"
      />
    )
  }
  return <span className={`icon-emoji ${className}`} aria-hidden="true" style={size ? { fontSize: size } : undefined}>{icon}</span>
}

export function Mascot({ className = '' }) {
  return (
    <span className={`mascot ${className}`}>
      <img src={`${BASE}copilot-mascot.png`} alt="" className="mascot-img" />
    </span>
  )
}

export function BrandMark({ className = '' }) {
  return <img src={`${BASE}${MARK.src}`} alt={MARK.alt} className={`brand-mark ${className}`} />
}

export function Logos({ className = '', size = 'md' }) {
  return (
    <div className={`logos logos-${size} ${className}`}>
      {LOGOS.map((l) => (
        <Fragment key={l.src}>
          {l.x && <span className="logos-x" aria-hidden="true">×</span>}
          {l.divider && <span className="logos-divider" />}
          <img src={`${BASE}${l.src}`} alt={l.alt} style={{ '--s': l.scale ?? 1 }} />
        </Fragment>
      ))}
    </div>
  )
}

// Rendered ONCE by DeckView so it fills smoothly instead of remounting per slide.
export function DeckProgressBar({ value = 0, complete = false }) {
  const pct = `${Math.max(0, Math.min(1, value)) * 100}%`
  return (
    <div className={`deck-progress ${complete ? 'is-complete' : ''}`} aria-hidden="true">
      <div className="deck-progress-track">
        <span className="deck-progress-fill" style={{ width: pct }} />
      </div>
      <span className="deck-progress-head" style={{ left: pct }} />
    </div>
  )
}
