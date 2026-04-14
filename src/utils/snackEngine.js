/**
 * Snack filtering, scoring, and recommendations against user profile + exclusions.
 */

import { SNACKS, getSnackById } from '../data/snackDatabase'
import { recipePassesExclusions, textMatchesOtherExclusion } from './recipeExclusions'
import { recipePassesDiet } from './dietConfig'
import { getFavouriteSnackIds, isSupplementsExcluded, isSupplementTypeAllowed } from './userContext'
import { getDailyProteinTargetGrams } from './nutrition'
import { getDailyTotals, dateKeyLocal } from './foodLog'

function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h) + 1
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5) | 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * @param {import('../data/snackDatabase').SnackItem} snack
 * @param {object | null} user
 */
function getSnackSupplementTypes(snack) {
  if (!snack?.supplement) return []
  const types = []
  if (snack.presetIds?.includes('protein_shakes') || /shake|powder|whey|casein/i.test(snack.name || '')) types.push('protein_shakes')
  if (snack.presetIds?.includes('protein_bars') || /bar\b/i.test(snack.name || '')) types.push('protein_bars')
  if (snack.tags?.includes('performance_pre')) types.push('pre_workout')
  if (!types.length) types.push('protein_shakes')
  return types
}

export function snackPassesUser(snack, user) {
  if (!snack) return false
  if (snack.supplement) {
    if (isSupplementsExcluded(user)) return false
    const types = getSnackSupplementTypes(snack)
    if (types.length && !types.some((t) => isSupplementTypeAllowed(user, t))) return false
  }
  if (snack.needsBlender && user?.has_blender !== true) return false

  const ex = user?.food_exclusions || []
  const fake = {
    name: snack.name,
    ingredients: [snack.ingredientBlob || ''],
  }
  if (!recipePassesExclusions(fake, ex)) return false
  if (textMatchesOtherExclusion(`${snack.name} ${snack.ingredientBlob || ''}`, user?.food_exclusions_other)) {
    return false
  }
  const exSet = new Set(ex)
  for (const tag of snack.excludeTags || []) {
    if (exSet.has(tag)) return false
  }
  const snackRecipe = { name: snack.name, ingredients: [snack.ingredientBlob || ''] }
  if (!recipePassesDiet(snackRecipe, user?.dietary_approaches)) return false
  return true
}

/**
 * @param {object | null} user
 */
export function getEligibleSnacksFromDb(user) {
  let pool = SNACKS.filter((s) => snackPassesUser(s, user))
  const favIds = getFavouriteSnackIds(user).filter((id) => id && id !== 'no_snack')
  if (favIds.length > 0) {
    const favSet = new Set(favIds)
    pool = pool.filter((s) => s.presetIds?.some((pid) => favSet.has(pid)))
  }
  return pool
}

function goalBoost(user, snack) {
  const g = (user?.goal || '').toLowerCase()
  if (g.includes('lose') || g.includes('lean')) {
    if (snack.tags.includes('fat_loss')) return 2
  }
  if (g.includes('muscle') || g.includes('stronger')) {
    if (snack.tags.includes('muscle')) return 2
  }
  if (g.includes('sport') || g.includes('competition')) {
    if (snack.tags.includes('performance_pre') || snack.tags.includes('performance_post')) return 1
  }
  return 0
}

/**
 * @param {import('../data/snackDatabase').SnackItem} snack
 * @param {number} dailyG
 */
export function toPlanSnack(snack, dailyG) {
  return {
    id: snack.id,
    label: snack.name,
    proteinG: snack.protein,
    proteinPercentOfDaily: Math.min(100, Math.round((snack.protein / dailyG) * 100)),
    calories: snack.calories,
    carbs: snack.carbs,
    fat: snack.fat,
    fiber: snack.fiber,
    ironMg: snack.ironMg,
    calciumMg: snack.calciumMg,
    prepMinutes: snack.prepMinutes,
    supplement: snack.supplement,
    note: snack.note,
  }
}

/**
 * Two snacks per day, weekly rotation, favourites + goal + optional parent mode.
 * @param {object} user
 * @param {string} dateKey
 * @param {number} dailyG
 * @param {number} mealProteinSum
 */
export function pickDailySnacks(user, dateKey, dailyG, mealProteinSum) {
  const pool = getEligibleSnacksFromDb(user)
  if (!pool.length || dailyG <= 0) return []

  const remaining = Math.max(0, dailyG - mealProteinSum)
  const rnd = mulberry32(hashSeed(`${user?.email || 'local'}::${dateKey}::snackpick`))
  const favSet = new Set((user?.favourite_snack_ids || []).filter((id) => id && id !== 'no_snack'))

  const scored = pool.map((s) => {
    let w = rnd()
    if ([...favSet].some((fid) => s.presetIds?.includes(fid))) w += 3
    w += goalBoost(user, s)
    if (user?.parent_snacking && s.tags.includes('mom')) w += 2
    if (remaining > 40 && s.protein >= 18) w += 0.5
    if (remaining < 25 && s.protein <= 15) w += 0.5
    return { s, w }
  })
  scored.sort((a, b) => b.w - a.w)

  const out = []
  const used = new Set()
  for (const { s } of scored) {
    if (out.length >= 2) break
    if (used.has(s.id)) continue
    out.push(toPlanSnack(s, dailyG))
    used.add(s.id)
  }
  return out
}

/**
 * @param {object} user
 * @param {number} gapGrams
 */
export function getQuickCatchUpSnacks(user, gapGrams) {
  if (gapGrams <= 5) return []
  const pool = getEligibleSnacksFromDb(user).filter((s) => s.quickUnder2 || s.prepMinutes <= 2)
  if (!pool.length) return []

  const sorted = [...pool].sort((a, b) => b.protein - a.protein)
  const out = []
  let sum = 0
  for (const s of sorted) {
    if (out.length >= 3) break
    if (out.some((o) => o.id === s.id)) continue
    out.push(toPlanSnack(s, getDailyProteinTargetGrams(user) || 150))
    sum += s.protein
    if (sum >= gapGrams) break
  }
  while (out.length < 3 && out.length < sorted.length) {
    const next = sorted.find((s) => !out.some((o) => o.id === s.id))
    if (!next) break
    out.push(toPlanSnack(next, getDailyProteinTargetGrams(user) || 150))
  }
  return out.slice(0, 3)
}

/**
 * @param {object | null} user
 * @param {number} minutesUntilTrain
 */
export function getPreWorkoutSnackSuggestion(user, minutesUntilTrain = 75) {
  const pool = getEligibleSnacksFromDb(user).filter((s) => s.tags.includes('performance_pre'))
  const fallback = getEligibleSnacksFromDb(user).filter((s) => s.carbs >= 15)
  const pick = (arr) => {
    const r = mulberry32(hashSeed(`${user?.email || 'local'}::prewo::${dateKeyLocal()}`))()
    return [...arr].sort(() => r - 0.5)[0]
  }
  if (minutesUntilTrain < 45) {
    const quick = pool.filter((s) => s.quickUnder2 || s.prepMinutes <= 5)
    const s = pick(quick.length ? quick : pool.length ? pool : fallback)
    return s
      ? {
          snack: s,
          copy: `You are training soon — keep it light and easy to digest. ${s.name} (${s.carbs}g carbs, ${s.protein}g protein, ~${s.prepMinutes} min prep).`,
        }
      : null
  }
  const fuller = pool.filter((s) => s.calories >= 200)
  const s = pick(fuller.length ? fuller : pool.length ? pool : fallback)
  return s
    ? {
        snack: s,
        copy: `With a bit more time before training, ${s.name} gives you fuel without feeling heavy (${s.carbs}g carbs, ${s.protein}g protein). Prep ~${s.prepMinutes} min.`,
      }
    : null
}

/**
 * @param {object | null} user
 */
export function getPostWorkoutSnackSuggestion(user) {
  const pool = getEligibleSnacksFromDb(user).filter((s) => s.tags.includes('performance_post'))
  const fallback = getEligibleSnacksFromDb(user).filter((s) => s.protein >= 15)
  const r = mulberry32(hashSeed(`${user?.email || 'local'}::postwo::${dateKeyLocal()}`))()
  const sorted = [...(pool.length ? pool : fallback)].sort(() => r - 0.5)
  const s = sorted[0]
  return s
    ? {
        snack: s,
        copy: `Recovery window: ${s.name}. About ${s.protein}g protein and ${s.carbs}g carbs to refill glycogen — ${s.calories} kcal, ~${s.prepMinutes} min.`,
      }
    : null
}

/**
 * Chat: three snacks given protein gap and quick vs prep preference.
 * @param {object} user
 * @param {{ proteinGap: number; quickOnly: boolean; preferMom?: boolean }} prefs
 */
export function getChatSnackRecommendations(user, prefs) {
  const gap = Math.max(0, prefs.proteinGap || 0)
  let pool = getEligibleSnacksFromDb(user)
  if (prefs.quickOnly) {
    pool = pool.filter((s) => s.quickUnder2 || s.prepMinutes <= 5)
  }
  if (!pool.length) pool = getEligibleSnacksFromDb(user)

  const scored = pool.map((s) => {
    let score = -Math.abs(s.protein - Math.min(gap / 2, 35))
    if (s.tags?.includes('whole_food')) score += 3
    if (prefs.preferMom && s.tags?.includes('mom')) score += 4
    if (goalBoost(user, s)) score += 2
    if ([...(user?.favourite_snack_ids || [])].some((id) => s.presetIds?.includes(id))) score += 2
    return { s, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map((x) => x.s)
}

/**
 * Estimate protein still needed from targets + log.
 * @param {object} user
 */
export function estimateProteinGap(user) {
  const t = getDailyProteinTargetGrams(user)
  if (t == null) return null
  const logged = getDailyTotals(dateKeyLocal()).protein
  return Math.max(0, Math.round((t - logged) * 10) / 10)
}

/**
 * Long text for coach: one snack with alternatives.
 * @param {import('../data/snackDatabase').SnackItem} snack
 * @param {object | null} user
 */
export function formatSnackDeepKnowledge(snack, user) {
  if (!snack) return ''
  const t = getDailyProteinTargetGrams(user)
  const gap = estimateProteinGap(user)
  const lines = [
    `${snack.name}: ${snack.calories} kcal, ${snack.protein}g protein, ${snack.carbs}g carbs, ${snack.fat}g fat, ${snack.fiber}g fibre.`,
    `Micronutrients (approx): iron ${snack.ironMg}mg, calcium ${snack.calciumMg}mg.`,
    `Prep time: about ${snack.prepMinutes} minutes${snack.quickUnder2 ? ' — quick option.' : '.'}`,
  ]
  if (snack.note) lines.push(`Note: ${snack.note}`)
  if (t != null && gap != null) {
    lines.push(
      `Against your ${t}g daily protein target you still have about ${gap}g to go today — this snack moves you ${snack.protein}g closer.`,
    )
  }
  const alts = getEligibleSnacksFromDb(user)
    .filter((s) => s.id !== snack.id && Math.abs(s.protein - snack.protein) < 8)
    .slice(0, 2)
  if (alts.length) {
    lines.push(`Similar alternatives: ${alts.map((a) => a.name).join('; ')}.`)
  }
  return lines.join(' ')
}

export { getSnackById }
