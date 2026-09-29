import {
  TitleSlide,
  ChallengeSlide,
  SolutionSlide,
  AgendaSlide,
  moduleSlides,
  PrepSlide,
  CleanupSlide,
  ThankYouSlide,
} from './src/slides/Slides.jsx'
import { CLEANUP, EVENT } from './src/content.js'

// Slide order. Add bespoke slides (e.g. an interactive simulator) by exporting
// them from Slides.jsx and inserting them here.
export default {
  id: '__PROJECT_ID__',
  title: `${EVENT.title} ${EVENT.highlight}`,
  subtitle: EVENT.tagline,
  description: EVENT.subtitle,
  icon: '✨',
  accent: '#3cc8e8',
  theme: 'dark',
  appearance: 'dark',
  order: 1,
  slides: [
    TitleSlide,
    ChallengeSlide,
    SolutionSlide,
    AgendaSlide,
    ...moduleSlides,
    PrepSlide,
    ...(CLEANUP.length ? [CleanupSlide] : []),
    ThankYouSlide,
  ],
}
