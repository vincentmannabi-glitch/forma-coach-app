/**
 * Local fallback foods + FORMA snack library + Open Food Facts search / barcode.
 */

import { SNACKS } from '../data/snackDatabase'

const SNACK_AS_FOODS = SNACKS.map((s) => ({
  name: `${s.name} (FORMA snack)`,
  calories: s.calories,
  protein: s.protein,
  carbs: s.carbs,
  fat: s.fat,
  source: 'forma_snack',
  snackId: s.id,
  prepMinutes: s.prepMinutes,
  fiber: s.fiber,
  ironMg: s.ironMg,
  calciumMg: s.calciumMg,
}))

const LOCAL_FOODS = [
  { name: 'Chicken breast, grilled (6 oz)', calories: 280, protein: 52, carbs: 0, fat: 6 },
  { name: 'Greek yogurt, plain (1 cup)', calories: 130, protein: 23, carbs: 9, fat: 0 },
  { name: 'Eggs, scrambled (2 large)', calories: 180, protein: 12, carbs: 2, fat: 14 },
  { name: 'Oatmeal, cooked (1 cup)', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: 'Salmon fillet (6 oz)', calories: 370, protein: 34, carbs: 0, fat: 24 },
  { name: 'Brown rice, cooked (1 cup)', calories: 220, protein: 5, carbs: 46, fat: 2 },
  { name: 'Banana (medium)', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Protein shake (30g powder)', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { name: 'Whole milk (1 cup)', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: 'Almonds (1 oz)', calories: 170, protein: 6, carbs: 6, fat: 15 },
  { name: 'Turkey sandwich', calories: 350, protein: 28, carbs: 32, fat: 12 },
  { name: 'Pizza slice (large)', calories: 285, protein: 12, carbs: 36, fat: 10 },
]

function mapOffProduct(p) {
  const n = p.nutriments || {}
  const kcal = n['energy-kcal_100g'] ?? (n.energy_100g ? n.energy_100g / 4.184 : null)
  return {
    name: (p.product_name || p.product_name_en || p.brands || 'Packaged food').trim(),
    calories: Math.round(kcal || 0),
    protein: Math.round((n.proteins_100g || 0) * 10) / 10,
    carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
    fat: Math.round((n.fat_100g || 0) * 10) / 10,
    per100g: true,
    source: 'openfoodfacts',
  }
}

/**
 * @returns {{ local: object[]; remote: object[] }}
 */
export async function searchFoods(query) {
  const q = (query || '').trim().toLowerCase()
  const snackHits = !q
    ? SNACK_AS_FOODS.slice(0, 12)
    : SNACK_AS_FOODS.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 15)
  const baseLocal = !q
    ? LOCAL_FOODS.slice(0, 8)
    : LOCAL_FOODS.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 10)
  const seen = new Set(snackHits.map((s) => s.name))
  const local = [...snackHits, ...baseLocal.filter((f) => !seen.has(f.name))].slice(0, 22)

  let remote = []
  if (q.length >= 2) {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8`
      const r = await fetch(url)
      const j = await r.json()
      remote = (j.products || []).map(mapOffProduct).filter((x) => x.calories > 0 || x.protein > 0)
    } catch {
      remote = []
    }
  }
  return { local, remote }
}

/**
 * @returns {Promise<{ name: string; calories: number; protein: number; carbs: number; fat: number; barcode: string } | null>}
 */
export async function fetchProductByBarcode(barcode) {
  const clean = String(barcode).replace(/\D/g, '')
  if (clean.length < 8) return null
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v0/product/${clean}.json`)
    const j = await r.json()
    if (j.status !== 1 || !j.product) return null
    const m = mapOffProduct(j.product)
    return { ...m, barcode: clean }
  } catch {
    return null
  }
}
