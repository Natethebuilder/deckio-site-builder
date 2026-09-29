#!/usr/bin/env node
// Scaffold a new website + deck from the template.
//
//   node new-site.mjs --dir <target> --id <repo-name> --title "<Title>" [--description "<text>"] [--no-install]
//
// --id is used for package name, deck id and the GitHub Pages base path, so it
// should match the GitHub repository name (lowercase, hyphens).
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}
const flag = (name) => args.includes(`--${name}`)

const dir = opt('dir')
const id = opt('id')
const title = opt('title', id)
const description = opt('description', title)

if (!dir || !id) {
  console.error('Usage: node new-site.mjs --dir <target> --id <repo-name> --title "<Title>" [--description "<text>"] [--no-install]')
  process.exit(1)
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
  console.error(`--id "${id}" must be lowercase letters, digits and hyphens (it becomes the repo name and URL path).`)
  process.exit(1)
}

const target = resolve(dir)
if (existsSync(target) && readdirSync(target).length > 0) {
  console.error(`${target} already exists and is not empty. Choose another --dir.`)
  process.exit(1)
}

const template = join(dirname(fileURLToPath(import.meta.url)), '..', 'template')
cpSync(template, target, {
  recursive: true,
  filter: (src) => !/[\\/](node_modules|dist|\.vite)([\\/]|$)/.test(src),
})

const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const tokens = {
  'package.json': { __PROJECT_ID__: id },
  'vite.config.js': { __PROJECT_ID__: id },
  'deck.config.js': { __PROJECT_ID__: id },
  'index.html': { __TITLE__: escHtml(title), __DESCRIPTION__: escHtml(description) },
  'src/content.js': { "STORAGE_PREFIX = 'deckio-site'": `STORAGE_PREFIX = '${id}'` },
}
for (const [file, map] of Object.entries(tokens)) {
  const p = join(target, file)
  let text = readFileSync(p, 'utf8')
  for (const [k, v] of Object.entries(map)) text = text.split(k).join(v)
  writeFileSync(p, text)
}

console.log(`✓ Scaffolded ${target}`)
if (!flag('no-install')) {
  console.log('… npm install')
  execSync('npm install --no-audit --no-fund', { cwd: target, stdio: 'inherit' })
}
console.log(`
Next:
  cd "${target}"
  npm run dev          # http://localhost:5173/${id}/  (deck: #/deck)
  Edit src/content.js, src/index.css (palette), public/logos/*`)
