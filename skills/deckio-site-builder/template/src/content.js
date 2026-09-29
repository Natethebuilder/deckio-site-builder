// ─────────────────────────────────────────────────────────────────────────────
// All copy for the website AND the deck lives here. Edit this file first.
// Icons: an emoji ('🚀') or a path under public/ ('icons/apim.svg').
// Placeholders are written as 'TBC' or wrapped in [brackets] so they are easy to
// find: grep for "TBC" and "[" before publishing.
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT = {
  // Title is split so the second half can be highlighted in the brand gradient.
  title: 'Your Event',
  highlight: 'Title Here',
  shortName: 'Event Site',            // brand text in the site nav
  kicker: 'Customer × Microsoft',     // small mono line above shortName and in pills
  tagline: 'One sentence that says what people will be able to do afterwards.',
  subtitle: 'Two more sentences of context: who it is for, what they will build and why it matters.',
  format: 'Hands-on',                 // Hands-on / Workshop / Bootcamp / Hackathon
  duration: '~3 hours',
  level: 'Intermediate',
  date: null,                         // ISO string ('2026-11-12') or null for "TBC"
  footer: 'CUSTOMER × MICROSOFT · EVENT NAME',
  primaryLink: { label: 'Open the guide', href: 'https://github.com/' },
  sourceRepo: { label: 'source repository', href: 'https://github.com/' },
  closing: 'A closing line for the final slide.',
  disclaimer: 'Use sample data only. Resources you deploy may be billable; clean up afterwards.',
}

// Logos shown in hero, footer and title/closing slides. `x: true` draws a ×
// before the logo (co-branding); `divider: true` draws a vertical rule.
// `scale` tunes optical size, because wordmarks and square marks differ.
export const LOGOS = [
  { src: 'logos/customer.svg', alt: 'Customer', scale: 0.8 },
  { src: 'logos/microsoft-mark.svg', alt: 'Microsoft', x: true },
  { src: 'logos/mark.svg', alt: 'Event mark', divider: true, scale: 1.3 },
]

// Main visual mark: nav brand, title slide, closing slide, join panel.
export const MARK = { src: 'logos/mark.svg', alt: 'Event mark' }

export const FACTS = [
  { value: '~3 h', label: 'hands-on' },
  { value: '4', label: 'modules' },
  { value: '100%', label: 'practical' },
  { value: '1', label: 'working app' },
]

export const WHY = {
  eyebrow: 'Why this matters',
  title: 'State the problem in one line.',
  subtitle: 'One sentence on how this event resolves it.',
  challenges: [
    { icon: '⚡', title: 'Challenge one', desc: 'Short description of a real pain point.' },
    { icon: '🔑', title: 'Challenge two', desc: 'Short description of a real pain point.' },
    { icon: '💸', title: 'Challenge three', desc: 'Short description of a real pain point.' },
    { icon: '🛡️', title: 'Challenge four', desc: 'Short description of a real pain point.' },
  ],
  solutionEyebrow: 'The approach',
  solutionTitle: 'What we will build,',
  solutionHighlight: 'and why it works',
  pillars: [
    { icon: '🧭', title: 'Pillar one', desc: 'What participants get, in one or two sentences.' },
    { icon: '🧱', title: 'Pillar two', desc: 'What participants get, in one or two sentences.' },
    { icon: '📈', title: 'Pillar three', desc: 'What participants get, in one or two sentences.' },
  ],
}

// Agenda: `mins` drives the bar widths and the deck timeline proportions.
// Mark non-module blocks (welcome, break, pre-flight) with `aside: true`.
export const AGENDA = [
  { start: '0:00', end: '0:15', title: 'Welcome', focus: 'Intro and environment check', mins: 15, aside: true },
  { start: '0:15', end: '1:00', title: 'Module 1', focus: '[Topic TBC]', mins: 45 },
  { start: '1:00', end: '1:45', title: 'Module 2', focus: '[Topic TBC]', mins: 45 },
  { start: '1:45', end: '2:30', title: 'Module 3', focus: '[Topic TBC]', mins: 45 },
  { start: '2:30', end: '3:00', title: 'Module 4', focus: '[Topic TBC]', mins: 30 },
]
// The agenda renders as a query that "returns" the schedule. Pick a language
// the audience knows (SQL for data teams, KQL for Azure ops, etc.).
export const AGENDA_QUERY = {
  file: 'agenda.sql',
  summary: '~3 h total',
  lines: [
    'SELECT start, module, focus, minutes',
    'FROM   event.agenda',
    "WHERE  attendee = 'you'",
    'ORDER  BY start;',
  ],
}

// One card on the site and one slide in the deck per module.
// `steps` become the numbered list on the slide; `code` is a copyable block.
// `tag` groups modules into filter tabs on the site (keys of MODULE_TAGS).
export const MODULES = [
  {
    id: 'm1', num: 'Module 1', time: '45 min', icon: '🚀', tag: 'core',
    title: '[Module 1 title]',
    desc: 'What participants do and what they leave with.',
    steps: [
      { title: 'First step', cmd: 'git clone … && npm install' },
      { title: 'Second step', cmd: 'npm run setup' },
    ],
    code: { label: 'terminal', lines: ['git clone https://github.com/<org>/<repo>.git', 'cd <repo>', 'npm run setup'] },
    terminal: true, // show the animated TERMINAL next to this module's slide
  },
  {
    id: 'm2', num: 'Module 2', time: '45 min', icon: '🧪', tag: 'core',
    title: '[Module 2 title]',
    desc: 'What participants do and what they leave with.',
    steps: [{ title: 'Step', detail: 'Short detail' }, { title: 'Step', detail: 'Short detail' }],
  },
  {
    id: 'm3', num: 'Module 3', time: '45 min', icon: '🤖', tag: 'core',
    title: '[Module 3 title]',
    desc: 'What participants do and what they leave with.',
    steps: [{ title: 'Step', detail: 'Short detail' }, { title: 'Step', detail: 'Short detail' }],
  },
  {
    id: 'm4', num: 'Module 4', time: '30 min', icon: '📊', tag: 'optional',
    title: '[Module 4 title]',
    desc: 'What participants do and what they leave with.',
    steps: [{ title: 'Step', detail: 'Short detail' }],
    code: { label: 'query', lines: ['SELECT module, COUNT(*) AS done', 'FROM   event.progress', 'GROUP  BY module;'] },
  },
]
export const MODULE_TAGS = { core: 'Core', optional: 'Optional' }

// Animated terminal in the hero and on the `terminal: true` module slide.
export const TERMINAL = {
  title: 'event-workspace · local',
  command: 'npm run setup',
  waiting: 'working…',
  lines: [
    { kind: 'info', text: 'Preparing your environment', meta: 'local' },
    { kind: 'ok', text: 'Tools installed', meta: 'node · git' },
    { kind: 'ok', text: 'Sample data loaded', meta: 'data/*' },
    { kind: 'ok', text: 'Credentials verified', meta: 'az · gh' },
    { kind: 'done', text: 'Ready for the event' },
  ],
}

// Pre-event checklist. Progress is saved per browser (localStorage).
export const PREP = [
  { id: 'account', icon: '🔐', title: 'Account access', desc: 'Sign in to the accounts you will need on the day.' },
  { id: 'tools', icon: '🧰', title: 'Tools installed', desc: 'List the CLIs, editors and runtimes.' },
  { id: 'repo', icon: '📦', title: 'Repository cloned', desc: 'git clone … and check out the right branch.' },
  { id: 'data', icon: '🗂️', title: 'Sample data ready', desc: 'Where to download it and where to put it.' },
]

// Copy-ready setup commands with a shell toggle. Keep one key for a single shell.
export const SETUP = {
  pwsh: {
    label: 'PowerShell',
    blocks: [
      { label: '1 · clone', lines: ['git clone https://github.com/<org>/<repo>.git', 'Set-Location <repo>'] },
      { label: '2 · sign in', lines: ['az login'] },
    ],
  },
  bash: {
    label: 'Bash',
    blocks: [
      { label: '1 · clone', lines: ['git clone https://github.com/<org>/<repo>.git', 'cd <repo>'] },
      { label: '2 · sign in', lines: ['az login'] },
    ],
  },
}

// After-event clean-up. Set to [] to hide the block and the slide.
export const CLEANUP = [
  { step: 'Delete the resource group', detail: 'Removes everything the event deployed.', code: 'az group delete -n <rg> --yes' },
]

export const FAQ = [
  { q: 'Who is this for?', a: 'Describe the audience and the skills you assume.' },
  { q: 'What do I need to bring?', a: 'Laptop, accounts, anything else.' },
  { q: 'Does it cost anything?', a: 'Be explicit about billable resources.' },
  { q: 'Can I use my own laptop?', a: 'Yes or no, and why.' },
]

export const JOIN = {
  eyebrow: 'Event day',
  title: 'See you there',
  steps: ['Complete the checklist on this page', 'Clone the repository', 'Bring your laptop and your questions'],
}

// Namespace for localStorage keys (checklist progress, motion toggle).
export const STORAGE_PREFIX = 'deckio-site'
