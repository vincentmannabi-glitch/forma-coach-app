/**
 * Natural-language branded snack mentions — secondary to whole-food picks.
 */

import { BRANDED_SNACK_PRODUCTS } from '../data/brandedSnackLibrary'
import { recipePassesExclusions, textMatchesOtherExclusion } from './recipeExclusions'
import { recipePassesDiet } from './dietConfig'

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5) | 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h) + 1
}

/**
 * @param {import('../data/brandedSnackLibrary').BrandedSnackProduct} product
 * @param {object | null} user
 */
export function brandedProductPassesUser(product, user) {
  if (!product) return false
  const fake = {
    name: product.name,
    ingredients: [product.ingredientBlob || ''],
  }
  if (!recipePassesDiet(fake, user?.dietary_approaches)) return false
  if (!recipePassesExclusions(fake, user?.food_exclusions || [])) return false
  if (textMatchesOtherExclusion(`${product.name} ${product.ingredientBlob || ''}`, user?.food_exclusions_other)) {
    return false
  }
  const exSet = new Set(user?.food_exclusions || [])
  for (const tag of product.excludeTags || []) {
    if (exSet.has(tag)) return false
  }
  return true
}

function getEligibleBranded(user) {
  return BRANDED_SNACK_PRODUCTS.filter((p) => brandedProductPassesUser(p, user))
}

/**
 * @param {object | null} user
 * @param {{ proteinGap?: number; momMode?: boolean; count?: number }} opts
 */
export function pickBrandedProductsForConversation(user, opts = {}) {
  const count = Math.min(3, Math.max(2, opts.count || 2))
  let pool = getEligibleBranded(user)
  if (opts.momMode) {
    const momPool = pool.filter((p) => p.momFriendly || p.goalsFit?.includes('mom'))
    if (momPool.length >= 2) pool = momPool
  }
  if (!pool.length) return []

  const gap = opts.proteinGap != null ? Math.max(10, opts.proteinGap) : 25
  const rnd = mulberry32(hashSeed(`${user?.email || 'local'}::branded::${opts.momMode ? 'm' : 'g'}::${Math.round(gap)}`))

  const scored = [...pool].map((p) => {
    let score = -Math.abs(p.protein - Math.min(gap / 2, 22))
    if (p.goalsFit?.includes('muscle')) score += 0.5
    if (opts.momMode && p.momFriendly) score += 4
    score += rnd() * 0.3
    return { p, score }
  })
  scored.sort((a, b) => b.score - a.score)

  const out = []
  const usedBrands = new Set()
  for (const { p } of scored) {
    if (out.length >= count) break
    if (out.length > 0 && usedBrands.has(p.brandId)) continue
    out.push(p)
    usedBrands.add(p.brandId)
  }
  for (const { p } of scored) {
    if (out.length >= count) break
    if (!out.some((x) => x.id === p.id)) out.push(p)
  }
  return out.slice(0, count)
}

/**
 * One short paragraph — sounds like a coach, not an ad.
 * @param {object | null} user
 * @param {{ proteinGap?: number; quickOnly?: boolean; momMode?: boolean }} opts
 */
export function buildConvenientAlternativesParagraph(user, opts = {}) {
  const picks = pickBrandedProductsForConversation(user, {
    proteinGap: opts.proteinGap,
    momMode: opts.momMode,
    count: 2,
  })
  if (!picks.length) return ''

  if (opts.momMode) {
    return buildMomHandsFreeParagraph(user, picks)
  }

  const bits = picks.map((p) => {
    const brand = getBrandById(p.brandId)
    const label = brand?.name ? `${brand.name} ${p.name.replace(new RegExp(`^${brand.name}\\s*—\\s*`, 'i'), '')}` : p.name
    return `${label.trim()} — about ${p.calories} calories and ${p.protein}g protein per ${p.servingLabel.replace(/^1\s+/, '')}`
  })

  if (bits.length === 1) {
    return `If you need something ready-made later, ${bits[0].split(' — ')[0]} is one I have seen work: ${bits[0].split(' — ')[1]}.`
  }

  return `If you need something grab-and-go later, two options clients actually use: ${bits[0]}, or ${bits[1]}. Neither has to replace real food — they are just there when time is tight.`
}

/**
 * Parents — one-handed, zero prep; blends named brands + eligibility.
 * @param {object | null} user
 * @param {import('../data/brandedSnackLibrary').BrandedSnackProduct[]} [seedPicks]
 */
export function buildMomHandsFreeParagraph(user, seedPicks) {
  const picks =
    seedPicks && seedPicks.length >= 2
      ? seedPicks
      : pickBrandedProductsForConversation(user, { momMode: true, count: 3 })

  if (!picks.length) {
    return ''
  }

  const sentences = picks.map(
    (p) => `${p.name} (about ${p.calories} kcal, ${p.protein}g protein; ${p.servingLabel})`,
  )

  return `One-handed, zero prep, no shame — things I have seen parents actually finish while holding a baby or chasing a toddler: ${sentences.slice(0, 3).join('; ')}. Pouches, sticks, chips, bars — not instead of real meals, just so you eat something with protein when the house is loud.`
}
