/**
 * TheMealDB — free random meals, cached per ISO week in localStorage.
 * @see https://www.themealdb.com/api.php
 */

export const THEMEALDB_CACHE_KEY = 'forma_themealdb_week_recipes_v1'

function isoWeekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((t - y) / 86400000 + 1) / 7)
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function ingredientsFromMeal(m) {
  const out = []
  for (let i = 1; i <= 20; i += 1) {
    const ing = m[`strIngredient${i}`]
    const meas = m[`strMeasure${i}`]
    if (ing && String(ing).trim()) {
      out.push(meas && String(meas).trim() ? `${String(meas).trim()} ${String(ing).trim()}` : String(ing).trim())
    }
  }
  return out.length ? out : ['See meal instructions']
}

function estimateNutrition(m) {
  const cat = (m.strCategory || '').toLowerCase()
  if (cat.includes('chicken')) return { calories: 480, protein: '38g' }
  if (cat.includes('beef')) return { calories: 520, protein: '42g' }
  if (cat.includes('seafood')) return { calories: 420, protein: '36g' }
  if (cat.includes('pasta')) return { calories: 440, protein: '18g' }
  if (cat.includes('vegetarian') || cat.includes('vegan')) return { calories: 380, protein: '14g' }
  if (cat.includes('pork') || cat.includes('lamb')) return { calories: 500, protein: '38g' }
  if (cat.includes('breakfast')) return { calories: 360, protein: '16g' }
  if (cat.includes('dessert')) return { calories: 340, protein: '6g' }
  return { calories: 420, protein: '28g' }
}

function mapMealToRecipe(m) {
  const id = `themealdb-${m.idMeal}`
  const name = m.strMeal || 'Meal'
  const image = m.strMealThumb
    ? `${m.strMealThumb}/preview`
    : 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'

  const { calories, protein } = estimateNutrition(m)
  const instructions = (m.strInstructions || 'Enjoy while hot.').split(/\r?\n/).filter(Boolean).slice(0, 8)
  const steps = instructions.map((text) => ({ text }))
  const cat = (m.strCategory || '').toLowerCase()
  const mealCategory =
    /breakfast|starter|side|dessert|snack/.test(cat) ? 'snacks' : /beef|chicken|pork|lamb|pasta|seafood|vegetarian|vegan/.test(cat) ? 'dinner' : 'lunch'

  return {
    id,
    name,
    image,
    protein,
    calories,
    prepTime: 'Varies',
    ingredients: ingredientsFromMeal(m),
    steps: steps.length ? steps : [{ text: m.strInstructions || 'Prepare and serve.' }],
    nutrition: [
      { label: 'Calories', value: String(calories), unit: 'kcal' },
      { label: 'Protein', value: protein.replace('g', ''), unit: 'g' },
    ],
    mealCategory,
    themealdb: true,
    themealdbCategory: m.strCategory || '',
  }
}

export async function loadThemealdbWeekRecipes() {
  const week = isoWeekKey()
  try {
    const raw = localStorage.getItem(THEMEALDB_CACHE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p?.week === week && Array.isArray(p.recipes) && p.recipes.length) return p.recipes
    }
  } catch {
    /* ignore */
  }

  const recipes = []
  for (let n = 0; n < 9; n += 1) {
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
      if (!res.ok) continue
      const data = await res.json()
      const m = data?.meals?.[0]
      if (!m?.idMeal) continue
      recipes.push(mapMealToRecipe(m))
    } catch {
      /* network */
    }
  }

  try {
    localStorage.setItem(THEMEALDB_CACHE_KEY, JSON.stringify({ week, recipes }))
  } catch {
    /* quota */
  }
  return recipes
}

/** Resolve a rotating TheMealDB recipe when opening detail by id. */
export function getCachedThemealdbRecipeById(id) {
  if (!id || !String(id).startsWith('themealdb-')) return null
  try {
    const raw = localStorage.getItem(THEMEALDB_CACHE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    const list = Array.isArray(p?.recipes) ? p.recipes : []
    return list.find((r) => r.id === id) || null
  } catch {
    return null
  }
}
