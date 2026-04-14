import { RECIPES } from '../data/recipes'
import { parseRecipeProteinGrams, getDailyProteinTargetGrams } from './nutrition'
import {
  recipePassesExclusions,
  textMatchesOtherExclusion,
} from './recipeExclusions'
import { recipePassesDiet } from './dietConfig'
import {
  getRecipeFoodsLovedScore,
  recipeContainsHabitsToAvoid,
} from './userContext'
import { pickDailySnacks, getQuickCatchUpSnacks } from './snackEngine'
import { dateKeyLocal } from './foodLog'

/** ~1/3 of daily protein per main meal; snacks cover the remainder. */
export const MEAL_PROTEIN_SHARE = 0.35

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
 * @param {{ dietary_approaches?: string[]; food_exclusions?: string[]; food_exclusions_other?: string; habits_to_move_away?: string }} user
 */
function recipeEligible(recipe, user) {
  if (!recipePassesDiet(recipe, user?.dietary_approaches)) return false
  const ex = new Set(user?.food_exclusions || [])
  if (!recipePassesExclusions(recipe, ex)) return false
  const blob = `${recipe.name} ${(recipe.ingredients || []).join(' ')}`
  if (textMatchesOtherExclusion(blob, user?.food_exclusions_other)) return false
  if (recipeContainsHabitsToAvoid(recipe, user)) return false
  return true
}

/**
 * @returns {import('../data/recipes').Recipe[]}
 */
export function getRecipePool(user) {
  const pool = RECIPES.filter((r) => recipeEligible(r, user))
  return pool.length ? pool : RECIPES
}

/**
 * Pick 3 meals ~35% protein each (best match from pool), then 1–2 snacks for the gap.
 */
export function generateDailyPlan(user, dateKey = dateKeyLocal()) {
  const dailyG = getDailyProteinTargetGrams(user)
  if (dailyG == null || dailyG <= 0) return null

  const mealTarget = dailyG * MEAL_PROTEIN_SHARE
  const pool = getRecipePool(user)
  const rnd = mulberry32(hashSeed(`${user?.email || 'local'}::${dateKey}::meals`))

  const scored = [...pool]
    .map((r) => {
      const pg = parseRecipeProteinGrams(r)
      const d = Math.abs(pg - mealTarget)
      const foodsLovedBoost = getRecipeFoodsLovedScore(r, user)
      return { r, pg, d, tie: rnd(), foodsLovedBoost }
    })
    .sort((a, b) => a.d - b.d || b.foodsLovedBoost - a.foodsLovedBoost || a.tie - b.tie)

  const picked = []
  const used = new Set()
  for (const c of scored) {
    if (picked.length >= 3) break
    if (used.has(c.r.id)) continue
    used.add(c.r.id)
    picked.push(c)
  }

  const slotNames = ['Breakfast', 'Lunch', 'Dinner']
  const meals = picked.slice(0, 3).map((c, i) => {
    const pg = c.pg
    return {
      slot: slotNames[i],
      recipeId: c.r.id,
      recipeName: c.r.name,
      image: c.r.image,
      proteinG: pg,
      proteinPercentOfDaily: Math.min(100, Math.round((pg / dailyG) * 100)),
    }
  })

  const mealSum = meals.reduce((s, m) => s + m.proteinG, 0)
  const snacks = pickDailySnacks(user, dateKey, dailyG, mealSum)

  const plannedProtein = mealSum + snacks.reduce((s, x) => s + x.proteinG, 0)

  return {
    dateKey,
    dailyProteinTarget: dailyG,
    meals,
    snacks,
    plannedProteinTotal: Math.round(plannedProtein * 10) / 10,
  }
}

/**
 * Three quick snacks (under ~2 min) that together cover protein gap.
 */
export function getCatchUpSnacks(user, gapGrams) {
  return getQuickCatchUpSnacks(user, gapGrams)
}

export function getProteinShortfallGrams(user, loggedProteinG) {
  const target = getDailyProteinTargetGrams(user)
  if (target == null) return 0
  return Math.max(0, Math.round((target - loggedProteinG) * 10) / 10)
}

/** From 2pm onward: show if user is materially short on protein for the day. */
export function isAfternoonProteinBehind(user, loggedProteinG, hour = new Date().getHours()) {
  const target = getDailyProteinTargetGrams(user)
  if (target == null || target <= 0) return false
  if (hour < 14) return false
  return getProteinShortfallGrams(user, loggedProteinG) >= 15
}

export function getAfternoonGapGrams(user, loggedProteinG) {
  return getProteinShortfallGrams(user, loggedProteinG)
}

/**
 * @param {{}} user
 * @param {number} loggedProteinG
 * @param {string} [forTomorrowTip] — optional label e.g. "Greek yogurt cup"
 */
export function buildEndOfDaySummary(user, loggedProteinG, dateKey = dateKeyLocal()) {
  const target = getDailyProteinTargetGrams(user)
  if (target == null) return null
  const g = Math.round(loggedProteinG * 10) / 10
  const t = target
  let praise = `You hit ${g}g of your ${t}g protein target today.`
  if (g >= t * 0.95) praise += ' Great effort.'
  else if (g >= t * 0.8) praise += ' Solid day — you were close.'
  else praise += " Tomorrow's a new chance to dial it in."

  let focus = 'Try spacing protein across breakfast, lunch, and an afternoon snack.'
  if (g < t * 0.85) {
    focus = `Tomorrow focus on adding a protein snack mid morning. ${quickSnackTip(user)}`
  } else if (g > t * 1.05) {
    focus = 'Tomorrow you can balance with slightly leaner meals if you like — consistency matters more than one day.'
  } else {
    focus = `Keep the rhythm: ${quickSnackTip(user)}`
  }

  return {
    dateKey,
    headline: praise,
    tip: focus,
  }
}

function quickSnackTip(user) {
  const pool = pickDailySnacks(user, dateKeyLocal(), getDailyProteinTargetGrams(user) || 150, 0)
  const first = pool[0]
  if (first) {
    const mins = first.supplement ? 3 : first.prepMinutes || 5
    return `Here is one that takes about ${mins} minutes: ${first.label}.`
  }
  return 'Prep Greek yogurt or hard boiled eggs ahead so they are ready when hunger hits.'
}
