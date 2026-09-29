import { useEffect, useState } from 'react'
import DeckView from './DeckView.jsx'
import Site from './site/Site.jsx'
import Backdrop, { useMotionPreference } from './theme/Backdrop.jsx'
import { EVENT } from './content.js'

// Two views on one page: the website (default) and the deck (#/deck).
function useHashRoute() {
  const read = () => (window.location.hash.startsWith('#/deck') ? 'deck' : 'site')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onHash = () => setRoute(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useHashRoute()
  const [motion, setMotion] = useMotionPreference()
  const toggle = () => setMotion((v) => !v)

  useEffect(() => {
    const name = `${EVENT.title} ${EVENT.highlight}`
    document.title = route === 'deck' ? `${name} · Deck` : `${name} · ${EVENT.kicker}`
  }, [route])

  return (
    <>
      {/* Lower density on the deck so the backdrop never competes with slide content. */}
      <Backdrop enabled={motion} density={route === 'deck' ? 0.55 : 1} />
      {route === 'deck'
        ? <DeckView motion={motion} onToggleMotion={toggle} />
        : <Site motion={motion} onToggleMotion={toggle} />}
    </>
  )
}
