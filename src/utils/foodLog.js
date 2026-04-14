/**
 * Food logging. Data in Supabase.
 */

import * as foodService from './foodLogService'

/** @typedef {{ id: string; name: string; calories: number; protein: number; carbs: number; fat: number; dateKey: string; loggedAt: string; source?: string; barcode?: string }} FoodEntry */

const SUMMARY_KEY = 'forma_nutrition_weekly_shown'
const EOD_KEY = 'forma_nutrition_eod_shown'

function prefKey(uid) {
  return uid ? `${SUMMARY_KEY}_${uid}` : null
}

function eodKey(uid) {
  return uid ? `${EOD_KEY}_${uid}` : null
}

export const dateKeyLocal = foodService.dateKeyLocal

/** @returns {Promise<FoodEntry[]>} */
export async function getAllFoodEntries() {
  return foodService.getAllFoodEntries()
}

/** @param {FoodEntry} entry */
export async function addFoodEntry(entry) {
  return foodService.addFoodEntry(entry)
}

/** @param {string} id */
export async function deleteFoodEntry(id) {
  return foodService.deleteFoodEntry(id)
}

/**
 * @param {string} dateKey
 * @returns {Promise<FoodEntry[]>}
 */
export async function getEntriesForDay(dateKey) {
  return foodService.getEntriesForDay(dateKey)
}

/**
 * @param {string} dateKey
 */
export async function getDailyTotals(dateKey) {
  return foodService.getDailyTotals(dateKey)
}

/** Average daily protein over last 7 days as % of target (rounded). */
export async function getLast7DaysProteinTargetHitPct(dailyProteinTarget) {
  if (!dailyProteinTarget || dailyProteinTarget <= 0) return null
  let sum = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const t = await getDailyTotals(dateKeyLocal(d))
    sum += t?.protein || 0
  }
  const avg = sum / 7
  return Math.min(200, Math.round((avg / dailyProteinTarget) * 100))
}

/** Food names sorted by log count (last 90 days). */
export async function getMostLoggedFoods(limit = 12) {
  const entries = await getAllFoodEntries()
  const cutoff = Date.now() - 90 * 86400000
  const counts = new Map()
  entries.forEach((e) => {
    if (new Date(e.loggedAt).getTime() < cutoff) return
    const key = (e.name || '').trim().toLowerCase()
    if (!key) return
    const prev = counts.get(key) || { name: e.name, n: 0, last: e }
    prev.n += 1
    prev.last = e
    counts.set(key, prev)
  })
  return [...counts.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((x) => x.last)
}

/** Unique food fingerprints for quick log (name + typical macros from last log). */
export async function getQuickLogPresets(limit = 10) {
  const foods = await getMostLoggedFoods(limit)
  return foods.map((e) => ({
    name: e.name,
    calories: e.calories,
    protein: e.protein,
    carbs: e.carbs,
    fat: e.fat,
  }))
}

/**
 * Daily totals for charts: array of { dateKey, ...totals }
 * @param {number} daysBack
 */
export async function getDailyTotalsHistory(daysBack = 30) {
  const out = []
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dk = dateKeyLocal(d)
    const t = await getDailyTotals(dk)
    out.push({ dateKey: dk, ...t })
  }
  return out
}

/**
 * @returns {Promise<{ weekStart: string; weekEnd: string; bestProteinDay: string; bestProteinG: number; avgCalories: number; daysHitCalorieTarget: number; tip: string } | null>}
 */
export async function computeWeeklyNutritionSummary(targets) {
  if (!targets?.calories) return null
  const today = new Date()
  const dow = today.getDay()
  const daysFromSunday = dow
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - daysFromSunday)
  sunday.setHours(0, 0, 0, 0)

  let bestProteinG = 0
  let bestProteinDay = ''
  let calSum = 0
  let daysWithData = 0
  let daysHit = 0

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    const dk = dateKeyLocal(d)
    const t = await getDailyTotals(dk)
    if (t.calories > 0 || t.protein > 0) daysWithData += 1
    calSum += t.calories
    if (t.protein > bestProteinG) {
      bestProteinG = t.protein
      bestProteinDay = d.toLocaleDateString(undefined, { weekday: 'long' })
    }
    if (targets.calories > 0 && t.calories <= targets.calories && t.calories >= targets.calories * 0.85) {
      daysHit += 1
    }
  }

  const avgCalories = daysWithData > 0 ? Math.round(calSum / 7) : 0

  let tip =
    'Keep logging — patterns become clearer every week, and small tweaks beat perfect days.'
  if (bestProteinG < targets.protein * 0.8) {
    tip = 'Try front-loading protein at breakfast or lunch so dinner does not carry the whole day.'
  } else if (avgCalories > targets.calories * 1.1) {
    tip = 'Aim for one extra walk or slightly smaller portions at your heaviest meal next week.'
  } else if (daysHit < 3) {
    tip = 'Pick two repeatable meals you enjoy and repeat them — fewer decisions makes consistency easier.'
  }

  return {
    weekStart: dateKeyLocal(sunday),
    weekEnd: dateKeyLocal(new Date(sunday.getTime() + 6 * 86400000)),
    bestProteinDay: bestProteinDay || '—',
    bestProteinG: Math.round(bestProteinG * 10) / 10,
    avgCalories,
    daysHitCalorieTarget: daysHit,
    tip,
  }
}

export function getLastShownSummaryWeek(uid) {
  const k = prefKey(uid)
  if (!k || typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}

export function setLastShownSummaryWeek(weekStartKey, uid) {
  const k = prefKey(uid)
  if (!k || typeof localStorage === 'undefined') return
  localStorage.setItem(k, weekStartKey)
}

/** Last dateKey for which the end-of-day nutrition summary was dismissed. */
export function getLastEodShownDateKey(uid) {
  const k = eodKey(uid)
  if (!k || typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}

export function setLastEodShownDateKey(dateKey, uid) {
  const k = eodKey(uid)
  if (!k || typeof localStorage === 'undefined') return
  localStorage.setItem(k, dateKey)
}

