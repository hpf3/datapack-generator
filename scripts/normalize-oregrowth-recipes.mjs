import { promises as fs } from 'fs'
import path from 'path'

const ROOT = process.cwd()
const RECIPES_DIR = path.join(ROOT, 'public', 'presets', 'oregrowth', 'recipes')

async function listRecipeFiles() {
  const entries = await fs.readdir(RECIPES_DIR, { withFileTypes: true })
  return entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(name => name.endsWith('.json'))
    .filter(name => name !== 'versions.json' && name !== 'index.json')
}

function shouldReroot(obj) {
  // Already normalized recipe looks like pumpkin_crystals.json
  if (obj && typeof obj === 'object' && obj.type && String(obj.type).startsWith('oregrowth:')) {
    return false
  }
  // Conditional wrapper with nested recipe
  if (obj && typeof obj === 'object' && obj.recipe && typeof obj.recipe === 'object') {
    return true
  }
  return false
}

function extractRecipe(obj) {
  if (obj && typeof obj === 'object' && obj.recipe && typeof obj.recipe === 'object') {
    return obj.recipe
  }
  return obj
}

async function normalizeFile(filePath) {
  const rel = path.relative(ROOT, filePath)
  let raw
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch (err) {
    console.warn(`[oregrowth] Skipping unreadable file: ${rel}:`, err.message)
    return { changed: false }
  }

  let obj
  try {
    obj = JSON.parse(raw)
  } catch (err) {
    console.warn(`[oregrowth] Skipping invalid JSON: ${rel}:`, err.message)
    return { changed: false }
  }

  if (!shouldReroot(obj)) {
    return { changed: false }
  }

  const recipe = extractRecipe(obj)
  // Basic sanity check: expect ore growth recipe type
  if (!recipe || typeof recipe !== 'object' || !recipe.type || !String(recipe.type).startsWith('oregrowth:')) {
    console.warn(`[oregrowth] Found wrapper but nested recipe is not an oregrowth recipe: ${rel}`)
    return { changed: false }
  }

  const next = JSON.stringify(recipe, null, 2) + '\n'
  if (next === raw) {
    return { changed: false }
  }
  await fs.writeFile(filePath, next)
  return { changed: true }
}

async function main() {
  try {
    await fs.mkdir(RECIPES_DIR, { recursive: true })
  } catch {}

  const files = await listRecipeFiles()
  let changedCount = 0
  for (const name of files) {
    const filePath = path.join(RECIPES_DIR, name)
    const res = await normalizeFile(filePath)
    if (res.changed) changedCount++
  }

  console.log(`[oregrowth] Normalized ${changedCount} recipe file(s) in ${path.relative(ROOT, RECIPES_DIR)}`)
}

main().catch(err => {
  console.error('[oregrowth] Failed to normalize recipes:', err)
  process.exit(1)
})

