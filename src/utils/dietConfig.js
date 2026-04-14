/**
 * Dietary approach system — defines all diet types, recipe compatibility,
 * and filtering logic for meal plans and cookbook.
 */

/** @typedef {'everything'|'keto'|'vegetarian'|'vegan'|'gluten_free'|'dairy_free'|'paleo'|'pescatarian'|'halal'|'kosher'|'intermittent_fasting'|'whole_foods'|'supplements_ok'|'no_preference'} DietaryApproachId */

/** Dietary approaches for onboarding — large gold cards, multi-select. */
export const DIETARY_APPROACH_OPTIONS = [
  { id: 'everything', label: 'I eat everything. No restrictions. Full flexibility.' },
  { id: 'keto', label: 'Keto. Very low carb high fat. Under 20 to 50g carbs per day.' },
  { id: 'vegetarian', label: 'Vegetarian. No meat or fish. Dairy and eggs included.' },
  { id: 'vegan', label: 'Vegan. No animal products whatsoever.' },
  { id: 'gluten_free', label: 'Gluten free. No wheat, barley, rye, or contaminated oats.' },
  { id: 'dairy_free', label: 'Dairy free. No milk, cheese, butter, or dairy based products.' },
  { id: 'paleo', label: 'Paleo. Whole foods only. No grains, legumes, dairy, or processed foods.' },
  { id: 'pescatarian', label: 'Pescatarian. No meat but fish and seafood included.' },
  { id: 'halal', label: 'Halal. Meat must be halal certified.' },
  { id: 'kosher', label: 'Kosher. Food must meet kosher requirements.' },
  { id: 'intermittent_fasting', label: 'Intermittent fasting. Eating window based nutrition.' },
  { id: 'whole_foods', label: 'I prefer natural whole foods only. Minimal processing. No protein powders or artificial ingredients.' },
  { id: 'supplements_ok', label: 'I am open to supplements and protein shakes if needed.' },
  { id: 'no_preference', label: 'I have no preference. Just help me hit my targets.' },
]

/** Diets that require recipe-level compatibility (recipe must have matching tag). */
export const STRICT_DIET_IDS = new Set([
  'keto', 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'paleo', 'pescatarian', 'halal', 'kosher',
])

/** Diets that are additive (whole_foods, supplements_ok modify behaviour but don't filter recipes). */
export const MODIFIER_IDS = new Set(['whole_foods', 'supplements_ok', 'intermittent_fasting'])

/** Primary diet for cookbook header — first strict diet, or 'everything' / 'no_preference'. */
export function getActiveDietLabel(dietaryApproaches = []) {
  if (!dietaryApproaches?.length) return null
  const strict = dietaryApproaches.find((d) => STRICT_DIET_IDS.has(d))
  if (strict) {
    const labels = {
      keto: 'Keto',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      gluten_free: 'Gluten free',
      dairy_free: 'Dairy free',
      paleo: 'Paleo',
      pescatarian: 'Pescatarian',
      halal: 'Halal',
      kosher: 'Kosher',
    }
    return labels[strict] || strict
  }
  if (dietaryApproaches.includes('everything') || dietaryApproaches.includes('no_preference')) return null
  return null
}

/**
 * Compute diet tags from recipe ingredients and nutrition (fallback when not stored).
 * @param {{ name: string; ingredients?: string[]; nutrition?: { label: string; value: string }[] }} recipe
 */
export function computeDietTags(recipe) {
  const tags = new Set()
  const blob = `${recipe?.name || ''} ${(recipe?.ingredients || []).join(' ')}`.toLowerCase()
  const has = (patterns) => patterns.some((p) => new RegExp(p, 'i').test(blob))
  const getNum = (labelPat) =>
    parseFloat((recipe?.nutrition || []).find((n) => labelPat.test(n.label))?.value || '0')
  const carbG = getNum(/carb/i)
  const fiberG = getNum(/fiber|fibre/i)
  const netCarbs = Math.max(0, carbG - fiberG)
  const hasMeat = has(['beef', 'pork', 'lamb', 'chicken', 'turkey'])
  const hasFish = has(['salmon', 'tuna', 'cod', 'shrimp', 'fish', 'seafood'])
  const hasDairy = has(['milk', 'cheese', 'butter', 'yogurt', 'cream', 'parmesan', 'feta', 'mozzarella'])
  const hasEggs = has(['egg'])
  const hasGrains = has(['rice', 'pasta', 'bread', 'flour', 'wheat', 'oat', 'barley', 'rye'])
  const hasLegumes = has(['bean', 'lentil', 'chickpea', 'edamame'])
  const hasGluten = has(['wheat', 'bread', 'pasta', 'flour', 'barley', 'rye', 'soy sauce'])
  if (!hasMeat && !hasFish) tags.add('vegetarian')
  if (!hasMeat && !hasFish && !hasDairy && !hasEggs) tags.add('vegan')
  if (!hasGluten) tags.add('gluten_free')
  if (!hasDairy) tags.add('dairy_free')
  if (!hasGrains && !hasLegumes && !hasDairy && (hasMeat || hasFish)) tags.add('paleo')
  if (!hasMeat && hasFish) tags.add('pescatarian')
  if (netCarbs <= 20 && !hasGrains && !hasLegumes) tags.add('keto')
  return [...tags]
}

/** Recipe passes dietary filter: must match ALL user-selected strict diets. */
export function recipePassesDiet(recipe, dietaryApproaches = []) {
  if (!dietaryApproaches?.length) return true
  const strictSelected = dietaryApproaches.filter((d) => STRICT_DIET_IDS.has(d))
  if (strictSelected.length === 0) return true
  const recipeTags = new Set(recipe?.dietTags || computeDietTags(recipe))
  return strictSelected.every((d) => recipeTags.has(d))
}

/** Get diet tags for display (badges). */
export function getRecipeDietBadges(recipe) {
  const tags = recipe?.dietTags || computeDietTags(recipe)
  const labels = {
    keto: 'Keto',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    gluten_free: 'Gluten free',
    dairy_free: 'Dairy free',
    paleo: 'Paleo',
    pescatarian: 'Pescatarian',
    halal: 'Halal',
    kosher: 'Kosher',
  }
  return tags.filter((t) => labels[t]).map((t) => ({ id: t, label: labels[t] }))
}

/** User wants whole foods only (no supplements). */
export function isWholeFoodsOnly(user) {
  const approaches = user?.dietary_approaches || []
  return approaches.includes('whole_foods') && !approaches.includes('supplements_ok')
}

/** User is okay with supplements. */
export function isSupplementsOk(user) {
  const approaches = user?.dietary_approaches || []
  return approaches.includes('supplements_ok') || approaches.includes('everything') || approaches.includes('no_preference')
}

/** User has intermittent fasting — needs eating window. */
export function hasIntermittentFasting(user) {
  return (user?.dietary_approaches || []).includes('intermittent_fasting')
}

/** Default eating window: 16:8 — e.g. 12pm–8pm. */
export function getEatingWindow(user) {
  const w = user?.eating_window
  if (w && typeof w === 'object' && w.start != null && w.end != null) return w
  return { start: 12, end: 20 }
}

/** Foods you love — multi-select for prioritising in cookbook. */
export const FOODS_YOU_LOVE_OPTIONS = [
  { id: 'chicken', label: 'Chicken', icon: '🍗' },
  { id: 'beef', label: 'Beef', icon: '🥩' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'seafood', label: 'Seafood', icon: '🦐' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'rice', label: 'Rice', icon: '🍚' },
  { id: 'pasta', label: 'Pasta', icon: '🍝' },
  { id: 'legumes', label: 'Legumes', icon: '🫘' },
  { id: 'tofu', label: 'Tofu & tempeh', icon: '🧈' },
  { id: 'nuts', label: 'Nuts & seeds', icon: '🥜' },
  { id: 'avocado', label: 'Avocado', icon: '🥑' },
  { id: 'salads', label: 'Salads & greens', icon: '🥗' },
  { id: 'soup', label: 'Soup', icon: '🍲' },
]
