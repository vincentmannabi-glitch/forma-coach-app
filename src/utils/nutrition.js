import { getRecipeById } from '../data/recipes'
import {
  getBodyWeightPounds as getBodyWeightPoundsFromContext,
  getCalorieTargetWithBreastfeeding,
  getHydrationTargetMl as getHydrationTargetMlFromContext,
} from './userContext'

/**
 * @param {{ protein?: string }} recipe
 */
export function parseRecipeProteinGrams(recipe) {
  if (!recipe?.protein) return 0
  const n = parseInt(String(recipe.protein).replace(/\D/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * @param {{ body_weight?: number; body_weight_unit?: string } | null} user
 * @returns {number | null} weight in pounds, or null if missing
 */
export function getBodyWeightPounds(user) {
  return getBodyWeightPoundsFromContext(user)
}

/**
 * Grams protein per lb bodyweight per day based on goal and experience.
 * Advanced athletes: 1 g/lb. Fat loss: 0.7. Muscle building: 0.8.
 * @param {{ goal?: string; experience_level?: string } | null} user
 */
export function getProteinGramsPerPound(user) {
  if (!user) return 0.8
  const exp = (user.experience_level || '').toLowerCase()
  if (exp.includes('advanced') || exp.includes('competitive')) {
    return 1
  }
  const goal = (user.goal || '').toLowerCase()
  if (goal.includes('lose fat') || goal.includes('lean')) return 0.7
  if (goal.includes('build muscle') || goal.includes('stronger')) return 0.8
  if (goal.includes('sport') || goal.includes('competition')) return 0.8
  if (goal.includes('general') || goal.includes('feel better')) return 0.7
  return 0.8
}

/**
 * Daily protein target in grams from body weight (g per lb per day).
 * @param {{ body_weight?: number; body_weight_unit?: string; goal?: string; experience_level?: string } | null} user
 * @returns {number | null}
 */
export function getDailyProteinTargetGrams(user) {
  const lbs = getBodyWeightPounds(user)
  if (lbs == null) return null
  const mult = getProteinGramsPerPound(user)
  return Math.round(lbs * mult)
}

export function getWeeklyProteinTargetGrams(user) {
  const d = getDailyProteinTargetGrams(user)
  if (d == null) return null
  return d * 7
}

/**
 * @param {{ protein?: string }} recipe
 * @param {{ body_weight?: number; body_weight_unit?: string; goal?: string; experience_level?: string } | null} user
 * @returns {number | null} 0–100+ or null if no target
 */
export function getMealProteinPercentOfDaily(recipe, user) {
  const daily = getDailyProteinTargetGrams(user)
  if (daily == null || daily <= 0) return null
  const meal = parseRecipeProteinGrams(recipe)
  return Math.round((meal / daily) * 100)
}

/**
 * Sum of protein (g) from planned meals for the week × servings per meal.
 */
export function getWeeklyProteinFromRecipes(recipeIds, servings) {
  let sum = 0
  for (const rid of recipeIds) {
    const r = getRecipeById(rid)
    if (!r) continue
    sum += parseRecipeProteinGrams(r) * servings
  }
  return sum
}

/**
 * Average daily protein from cookbook meals only (weekly sum / 7).
 */
export function getAvgDailyProteinFromCookbook(recipeIds, servings) {
  return getWeeklyProteinFromRecipes(recipeIds, servings) / 7
}

/**
 * True if cookbook meals alone average below daily target (with small tolerance).
 */
export function isCookbookBelowProteinTarget(user, recipeIds, servings) {
  const daily = getDailyProteinTargetGrams(user)
  if (daily == null) return false
  const avg = getAvgDailyProteinFromCookbook(recipeIds, servings)
  return avg < daily * 0.98
}

/**
 * Daily calorie + macro targets for the food tracker.
 * Uses bodyweight, goal, and breastfeeding (adds 300–500 kcal). Bodyweight from profile or measurements.
 */
export function getDailyMacroTargets(user) {
  const protein = getDailyProteinTargetGrams(user)
  const lbs = getBodyWeightPounds(user)
  if (protein == null || lbs == null) return null
  let calorieTarget = getCalorieTargetWithBreastfeeding(user)
  if (calorieTarget == null) {
    calorieTarget = Math.round(lbs * 15)
  }
  calorieTarget = Math.max(calorieTarget, Math.round(protein * 4 + 200))
  const proteinCal = protein * 4
  const remaining = Math.max(calorieTarget - proteinCal, 0)
  const carbs = Math.round((remaining * 0.45) / 4)
  const fat = Math.round((remaining * 0.55) / 9)
  return {
    calories: calorieTarget,
    protein,
    carbs: Math.max(carbs, 0),
    fat: Math.max(fat, 0),
  }
}

/** Hydration target in ml — from bodyweight (~35 ml/kg). */
export function getHydrationTargetMl(user) {
  return getHydrationTargetMlFromContext(user)
}
