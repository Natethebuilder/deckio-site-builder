import { InlineEditProvider, Navigation, SlideErrorBoundary, SlideProvider, useSlides } from '@deckio/deck-engine'
import '@deckio/deck-engine/styles/editable.css'
import project from '../deck.config.js'
import { DeckProgressBar, Mascot } from './theme/Decor.jsx'
import { MotionToggle } from './theme/Backdrop.jsx'

function FloatingMascot() {
  const { current, totalSlides } = useSlides()
  if (current <= 0 || current === totalSlides - 1) return null
  return <Mascot className="floating-mascot" />
}

// One persistent progress bar for the whole deck, so it fills instead of
// re-rendering (and flickering) on every slide change.
function DeckProgress() {
  const { current, totalSlides, visibleIndices = [] } = useSlides()
  const order = visibleIndices.length ? visibleIndices : Array.from({ length: totalSlides }, (_, i) => i)
  const pos = Math.max(0, order.indexOf(current))
  return <DeckProgressBar value={(pos + 1) / order.length} complete={pos === order.length - 1} />
}

export default function DeckView({ motion, onToggleMotion }) {
  const { id, slides, theme } = project
  return (
    <InlineEditProvider overrides={{}} project={id}>
      <SlideProvider totalSlides={slides.length} project={id} slides={slides} theme={theme}>
        <div className="deck-chrome">
          <a className="deck-home-link" href="#/">← Website</a>
          <MotionToggle enabled={motion} onToggle={onToggleMotion} />
        </div>
        <Navigation />
        <DeckProgress />
        <div className="deck" data-project-id={id}>
          {slides.map((SlideComponent, index) => (
            <SlideErrorBoundary key={`${id}-slide-${index}`} index={index}>
              <SlideComponent index={index} project={project} />
            </SlideErrorBoundary>
          ))}
        </div>
        <FloatingMascot />
      </SlideProvider>
    </InlineEditProvider>
  )
}
