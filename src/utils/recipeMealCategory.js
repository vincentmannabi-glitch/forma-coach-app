/** Recipe ids tagged for pre/post workout filters */
const PRE_WORKOUT_IDS = new Set(['greek-yogurt-parfait', 'avocado-toast-stack'])
const POST_WORKOUT_IDS = new Set(['smoked-salmon-bagel', 'grilled-salmon-bowl', 'korean-bbq-bowl'])

/**
 * @param {{ id?: string }} recipe
 * @param {string} filterId
 * @returns {boolean}
 */
export function recipeMatchesCookbookFilter(recipe, filterId) {
  if (!recipe?.id) return false
  if (filterId === 'all') return true
  if (filterId === 'pre_workout') return PRE_WORKOUT_IDS.has(recipe.id)
  if (filterId === 'post_workout') return POST_WORKOUT_IDS.has(recipe.id)
  return getRecipeMealCategory(recipe) === filterId
}

const OVERRIDES = {
  'korean-bbq-bowl': 'lunch',
  'grilled-salmon-bowl': 'dinner',
  'tomato-herb-pasta': 'dinner',
  'avocado-toast-stack': 'breakfast',
  'teriyaki-chicken-bowl': 'lunch',
  'szechuan-chicken': 'dinner',
  'lemon-herb-chicken': 'dinner',
  'pan-seared-cod': 'dinner',
  'garlic-shrimp-bowl': 'dinner',
  'pork-tenderloin': 'dinner',
  'mushroom-risotto': 'dinner',
  'pesto-gnocchi': 'dinner',
  'caprese-pasta': 'dinner',
  'greek-yogurt-parfait': 'breakfast',
  'smoked-salmon-bagel': 'breakfast',
  'egg-white-scramble': 'breakfast',
  'snack-greek-yogurt-protein-bowl': 'snacks',
  'snack-beef-jerky-apple': 'snacks',
  'snack-cottage-berries': 'snacks',
  'snack-chomps-rice-cake': 'snacks',
  'snack-chobani-almonds': 'snacks',
  'snack-wilde-chicken-chips': 'snacks',
  'snack-hard-boiled-eggs': 'snacks',
  'snack-pure-protein-bar': 'snacks',
  'snack-rxbar': 'snacks',
  'snack-quest-chips': 'snacks',
  'lunch-chicken-caesar-wrap': 'lunch',
  'lunch-turkey-avocado-bowl': 'lunch',
  'lunch-tuna-rice-bowl': 'lunch',
}

/**
 * @param {{ id?: string; name?: string }} recipe
 * @returns {'breakfast' | 'lunch' | 'dinner' | 'snacks'}
 */
export function getRecipeMealCategory(recipe) {
  if (recipe?.mealCategory) return recipe.mealCategory
  if (recipe?.id && OVERRIDES[recipe.id]) return OVERRIDES[recipe.id]
  const n = (recipe?.name || '').toLowerCase()
  if (/toast|parfait|oat|bagel|scramble|smoothie|yogurt|pancake|waffle|^egg /.test(n)) return 'breakfast'
  if (/snack|bite|energy ball|protein bar/.test(n)) return 'snacks'
  if (/salad|wrap|sandwich|soup/.test(n)) return 'lunch'
  if (/bowl/.test(n)) return 'lunch'
  return 'dinner'
}
