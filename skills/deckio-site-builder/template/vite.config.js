import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { deckPlugin, tailwindPlugin } from '@deckio/deck-engine/vite'

// GitHub Pages serves project sites from /<repo-name>/. Keep `base` equal to
// the repository name, or '/' for a user site or a custom domain.
export default defineConfig({
  base: '/__PROJECT_ID__/',
  plugins: [
    react({
      include: [/\.[jt]sx?$/, /node_modules\/@deckio\/deck-engine\/.+\.jsx$/],
    }),
    deckPlugin({ inlineEditing: false }),
    tailwindPlugin(),
  ],
})