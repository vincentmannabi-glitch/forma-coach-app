import { getRecipeById, DEFAULT_WEEK_RECIPE_IDS, MEAL_SWAP_OPTIONS } from '../data/recipes'
import { generateDailyPlan } from './dailyNutritionCoach'
import { getSnackById } from '../data/snackDatabase'
import { getSnackPresetById } from './snackPresets'
import { dateKeyLocal } from './foodLog'

export const CATEGORY_ORDER = [
  'produce',
  'meat-fish',
  'dairy-eggs',
  'dry-goods',
  'condiments',
  'supplements',
]

export const CATEGORY_LABELS = {
  produce: 'Produce',
  'meat-fish': 'Meat and Fish',
  'dairy-eggs': 'Dairy and Eggs',
  'dry-goods': 'Dry Goods',
  condiments: 'Condiments',
  supplements: 'Supplements',
}

/** @param {number} n */
export function formatAmount(n) {
  if (!Number.isFinite(n)) return '0'
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n))
  const fracMap = [
    [0.25, '¼'],
    [0.33, '⅓'],
    [0.5, '½'],
    [0.67, '⅔'],
    [0.75, '¾'],
  ]
  const whole = Math.floor(n)
  const frac = Math.round((n - whole) * 100) / 100
  for (const [v, sym] of fracMap) {
    if (Math.abs(frac - v) < 0.06) {
      return whole > 0 ? `${whole}${sym}` : sym
    }
  }
  const s = n.toFixed(2).replace(/\.?0+$/, '')
  return s
}

/**
 * @param {string[]} recipeIds
 * @param {number} servings
 * @returns {{ id: string; mergeKey: string; amount: number; unit: string; label: string; category: string; lineCost: number; displayLine: string }[]}
 */
export function aggregateGroceryItems(recipeIds, servings) {
  const map = new Map()

  for (const rid of recipeIds) {
    const recipe = getRecipeById(rid)
    if (!recipe?.groceryItems?.length) continue

    for (const item of recipe.groceryItems) {
      const key = `${item.mergeKey}::${item.unit}`
      const scaledAmount = item.amount * servings
      const scaledCost = item.lineCost * servings

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          mergeKey: item.mergeKey,
          amount: scaledAmount,
          unit: item.unit,
          label: item.label,
          category: item.category,
          lineCost: scaledCost,
        })
      } else {
        const ex = map.get(key)
        ex.amount += scaledAmount
        ex.lineCost += scaledCost
      }
    }
  }

  return [...map.values()].map((row) => ({
    ...row,
    displayLine: `${formatAmount(row.amount)} ${row.unit} ${row.label}`.trim(),
  }))
}

/**
 * @param {string[]} recipeIds
 * @param {number} servings
 */
export function computeWeeklyTotals(recipeIds, servings) {
  let totalCost = 0
  let weeklyProteinFromMeals = 0

  for (const rid of recipeIds) {
    const recipe = getRecipeById(rid)
    if (!recipe) continue
    const g = parseInt(String(recipe.protein).replace(/\D/g, ''), 10) || 0
    weeklyProteinFromMeals += g * servings
    if (recipe.groceryItems?.length) {
      for (const item of recipe.groceryItems) {
        totalCost += item.lineCost * servings
      }
    }
  }

  return { totalCost, weeklyProteinFromMeals }
}

/**
 * Snacks for all 7 days of the current calendar week (Sun–Sat), from daily plan presets.
 * @param {{ email?: string; body_weight?: number; food_approach?: string; food_exclusions?: string[]; favourite_snack_ids?: string[] } | null} user
 */
export function aggregateWeeklySnackGroceries(user) {
  if (!user?.body_weight) return []
  const map = new Map()
  const today = new Date()
  const dow = today.getDay()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - dow)
  sunday.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    const dk = dateKeyLocal(d)
    const plan = generateDailyPlan(user, dk)
    if (!plan?.snacks?.length) continue
    for (const sn of plan.snacks) {
      const preset = getSnackById(sn.id) || getSnackPresetById(sn.id)
      if (!preset?.groceryItems?.length) continue
      for (const item of preset.groceryItems) {
        const key = `${item.mergeKey}::${item.unit}`
        const scaledAmount = item.amount
        const scaledCost = item.lineCost
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            mergeKey: item.mergeKey,
            amount: scaledAmount,
            unit: item.unit,
            label: item.label,
            category: item.category,
            lineCost: scaledCost,
          })
        } else {
          const ex = map.get(key)
          ex.amount += scaledAmount
          ex.lineCost += scaledCost
        }
      }
    }
  }

  return [...map.values()].map((row) => ({
    ...row,
    displayLine: `${formatAmount(row.amount)} ${row.unit} ${row.label}`.trim(),
  }))
}

/**
 * Merge multiple aggregateGroceryItems-style arrays (same mergeKey+unit).
 */
export function mergeGroceryLists(lists) {
  const map = new Map()
  for (const list of lists) {
    for (const row of list) {
      const key = `${row.mergeKey}::${row.unit}`
      if (!map.has(key)) {
        map.set(key, { ...row })
      } else {
        const ex = map.get(key)
        ex.amount += row.amount
        ex.lineCost += row.lineCost
      }
    }
  }
  return [...map.values()].map((row) => ({
    ...row,
    displayLine: `${formatAmount(row.amount)} ${row.unit} ${row.label}`.trim(),
  }))
}

/**
 * @param {ReturnType<typeof aggregateGroceryItems>} items
 */
/**
 * @param {number} slotIndex 0–3
 * @param {string} currentRecipeId
 */
export function getSwapChoicesForSlot(slotIndex, currentRecipeId) {
  const baseId = DEFAULT_WEEK_RECIPE_IDS[slotIndex]
  const alt = MEAL_SWAP_OPTIONS[baseId]
  if (!alt?.length) return []
  const pool = [baseId, ...alt]
  return pool.filter((id) => id !== currentRecipeId)
}

export function groupByCategory(items) {
  /** @type {Record<string, typeof items>} */
  const out = {}
  for (const cat of CATEGORY_ORDER) {
    out[cat] = []
  }
  for (const item of items) {
    const c = item.category && out[item.category] != null ? item.category : 'dry-goods'
    out[c].push(item)
  }
  return out
}
