import { SNACKS } from '../data/snackDatabase'

export const NUTRITION_HISTORY_KEY = 'forma_nutrition_history'

export const NUTRITION_CATEGORIES = [
  'high protein',
  'sweet',
  'salty',
  'creamy',
  'late night',
  'meal prep',
  'on the go',
]

const DAY_MS = 24 * 60 * 60 * 1000
const LOOKBACK_DAYS = 28
const PICKS_PER_CATEGORY = 10

function isSweet(snack) {
  return /berry|banana|fruit|chocolate|cinnamon|honey|mango|grape|smoothie|pudding|oat/i.test(`${snack.name} ${snack.ingredientBlob}`)
}

function isSalty(snack) {
  return /jerky|egg|tuna|cottage|cheese|cracker|pickles|edamame|popcorn|hot sauce|bagel/i.test(`${snack.name} ${snack.ingredientBlob}`)
}

function isCreamy(snack) {
  return /yogurt|cottage|kefir|smoothie|pudding|shake/i.test(`${snack.name} ${snack.ingredientBlob}`)
}

function isLateNight(snack) {
  return /casein|pudding|kefir|yogurt|cottage|milk|protein/i.test(`${snack.name} ${snack.ingredientBlob}`)
}

function isMealPrep(snack) {
  return Number(snack.prepMinutes) >= 5
}

function isOnTheGo(snack) {
  return Boolean(snack.quickUnder2) || /grab|bar|shake|jerky|cup|pack/i.test(snack.name)
}

function categoryPool(category) {
  const key = String(category || '').toLowerCase()
  if (key === 'high protein') return SNACKS.filter((s) => Number(s.protein) >= 20)
  if (key === 'sweet') return SNACKS.filter(isSweet)
  if (key === 'salty') return SNACKS.filter(isSalty)
  if (key === 'creamy') return SNACKS.filter(isCreamy)
  if (key === 'late night') return SNACKS.filter(isLateNight)
  if (key === 'meal prep') return SNACKS.filter(isMealPrep)
  if (key === 'on the go') return SNACKS.filter(isOnTheGo)
  return SNACKS
}

function loadHistory() {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(NUTRITION_HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory(history) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(history.slice(-2500)))
  } catch {
    /* noop */
  }
}

function pickTenForCategory(category, history, now = new Date()) {
  const pool = categoryPool(category)
  if (!pool.length) return []
  const cutoff = now.getTime() - LOOKBACK_DAYS * DAY_MS
  const recent = history.filter((h) => h?.category === category && Date.parse(h.date || '') >= cutoff)
  const recentNames = new Set(recent.map((h) => h.name))

  const remaining = pool.filter((s) => !recentNames.has(s.name))
  const start = Math.abs(Math.floor(now.getTime() / DAY_MS)) % pool.length
  const rotatedRemaining = [...remaining.slice(start % Math.max(1, remaining.length)), ...remaining.slice(0, start % Math.max(1, remaining.length))]
  const picks = rotatedRemaining.slice(0, PICKS_PER_CATEGORY)

  if (picks.length < PICKS_PER_CATEGORY) {
    const selected = new Set(picks.map((p) => p.name))
    const oldestFirst = [...history]
      .filter((h) => h?.category === category && h?.name && pool.some((s) => s.name === h.name))
      .sort((a, b) => Date.parse(a.date || 0) - Date.parse(b.date || 0))
    for (const entry of oldestFirst) {
      if (picks.length >= PICKS_PER_CATEGORY) break
      if (selected.has(entry.name)) continue
      const snack = pool.find((s) => s.name === entry.name)
      if (!snack) continue
      picks.push(snack)
      selected.add(snack.name)
    }
  }

  if (picks.length < PICKS_PER_CATEGORY) {
    const selected = new Set(picks.map((p) => p.name))
    for (const snack of pool) {
      if (picks.length >= PICKS_PER_CATEGORY) break
      if (selected.has(snack.name)) continue
      picks.push(snack)
      selected.add(snack.name)
    }
  }
  return picks.slice(0, PICKS_PER_CATEGORY)
}

export function getNutritionCycleSelections(now = new Date()) {
  const history = loadHistory()
  const date = new Date(now).toISOString()
  const nextHistory = [...history]
  const byCategory = {}
  for (const category of NUTRITION_CATEGORIES) {
    const picks = pickTenForCategory(category, nextHistory, now)
    byCategory[category] = picks.map((s) => s.name)
    for (const snack of picks) {
      nextHistory.push({ name: snack.name, date, category })
    }
  }
  saveHistory(nextHistory)
  return byCategory
}
