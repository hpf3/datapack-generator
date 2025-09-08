import { promises as fs } from 'fs'
import path from 'path'

const ROOT = process.cwd()
const RECIPES_DIR = path.join(ROOT, 'public', 'presets', 'oregrowth', 'recipes')
const INDEX_FILE = path.join(RECIPES_DIR, 'index.json')
const VERSIONS_FILE = path.join(RECIPES_DIR, 'versions.json')

async function main() {
  try {
    await fs.mkdir(RECIPES_DIR, { recursive: true })
  } catch {}

  // Discover preset files
  const entries = await fs.readdir(RECIPES_DIR, { withFileTypes: true })
  const jsonFiles = entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(n => n.endsWith('.json') && n !== 'index.json' && n !== 'versions.json')

  // Load optional version constraints
  /** @type {Record<string, {minVersion?: string, maxVersion?: string}>} */
  let versions = {}
  try {
    const raw = await fs.readFile(VERSIONS_FILE, 'utf8')
    versions = JSON.parse(raw)
  } catch {}

  const index = jsonFiles
    .map(n => n.replace(/\.json$/i, ''))
    .sort((a, b) => a.localeCompare(b))
    .map(name => {
      const v = versions[name] || {}
      const entry = { name }
      if (v.minVersion) entry.minVersion = v.minVersion
      if (v.maxVersion) entry.maxVersion = v.maxVersion
      return entry
    })

  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2) + '\n')
  console.log(`[oregrowth] Wrote index with ${index.length} entries -> ${path.relative(ROOT, INDEX_FILE)}`)
}

main().catch(err => {
  console.error('[oregrowth] Failed to generate index:', err)
  process.exit(1)
})

