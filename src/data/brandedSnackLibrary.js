/**
 * Branded high-protein convenience foods — nutrition rounded from typical US retail labels (per serving).
 * FORMA uses these as optional grab-and-go alternatives; whole-food snacks stay primary in coaching.
 */

/**
 * @typedef {{
 *   id: string
 *   brandId: string
 *   name: string
 *   servingLabel: string
 *   calories: number
 *   protein: number
 *   carbs: number
 *   fat: number
 *   fiber?: number
 *   sodiumMg?: number
 *   whereToFind: string
 *   goalsFit: string[]
 *   excludeTags: string[]
 *   ingredientBlob: string
 *   momFriendly?: boolean
 *   notes?: string
 * }} BrandedSnackProduct
 */

/** @type {{ id: string; name: string; about: string }[]} */
export const BRANDED_SNACK_BRANDS = [
  {
    id: 'quest',
    name: 'Quest',
    about: 'High-protein bars, cookies, and chips built around whey isolate — gym-bag friendly.',
  },
  {
    id: 'rxbar',
    name: 'RXBar',
    about: 'Minimal-ingredient bars — dates, egg white, nuts — reads clean on the label.',
  },
  {
    id: 'epic',
    name: 'Epic',
    about: 'Meat-based bars and strips — savoury alternative to sweet protein bars.',
  },
  {
    id: 'jack_links',
    name: 'Jack Links',
    about: 'Widely available jerky — portable protein when you need something salty.',
  },
  {
    id: 'chomps',
    name: 'Chomps',
    about: 'Grass-fed meat sticks — one-handed, no fridge, kid-friendly packaging.',
  },
  {
    id: 'wilde',
    name: 'Wilde',
    about: 'Protein chips made from chicken or egg white — crunchy swap for crisps.',
  },
  {
    id: 'pure_protein',
    name: 'Pure Protein',
    about: 'Budget-friendly bars and shakes with strong protein-per-dollar.',
  },
  {
    id: 'siggis',
    name: "Siggi's",
    about: 'Thick Icelandic skyr — high protein, lower sugar than many yogurts.',
  },
  {
    id: 'chobani',
    name: 'Chobani',
    about: 'Greek yogurt and drinks — grocery staples in most regions.',
  },
  {
    id: 'good_culture',
    name: 'Good Culture',
    about: 'Cottage cheese cups — casein-heavy, slow digesting, very satiating.',
  },
  {
    id: 'fairlife',
    name: 'fairlife',
    about: 'Ultrafiltered dairy shakes — very high protein per bottle.',
  },
  {
    id: 'orgain',
    name: 'Orgain',
    about: 'Plant and dairy-based ready-to-drink shakes — organic positioning.',
  },
  {
    id: 'legendary',
    name: 'Legendary Foods',
    about: 'High-protein pastries and toaster pastries — dessert-like macros.',
  },
  {
    id: 'kind',
    name: 'Kind',
    about: 'Nut-heavy bars — more fat and fibre than pure protein bars; still useful.',
  },
]

/** @type {BrandedSnackProduct[]} */
export const BRANDED_SNACK_PRODUCTS = [
  // Quest
  {
    id: 'quest-cookie-dough-bar',
    brandId: 'quest',
    name: 'Quest Bar — Chocolate Chip Cookie Dough',
    servingLabel: '1 bar (60 g)',
    calories: 190,
    protein: 21,
    carbs: 21,
    fat: 9,
    fiber: 13,
    sodiumMg: 220,
    whereToFind: 'Supermarkets, Target, Walmart, Amazon, most gas stations with a protein section.',
    goalsFit: ['muscle', 'convenience', 'travel', 'low_prep'],
    excludeTags: ['dairy', 'nuts'],
    ingredientBlob: 'whey protein isolate milk almonds',
    notes: 'Classic whey bar — sweet tooth without a full dessert run.',
  },
  {
    id: 'quest-hero-cookie',
    brandId: 'quest',
    name: 'Quest Hero Bar — Chocolate Caramel Pecan',
    servingLabel: '1 bar (60 g)',
    calories: 200,
    protein: 18,
    carbs: 24,
    fat: 11,
    fiber: 11,
    sodiumMg: 200,
    whereToFind: 'Same retail footprint as other Quest products.',
    goalsFit: ['muscle', 'convenience'],
    excludeTags: ['dairy', 'nuts'],
    ingredientBlob: 'whey protein milk pecan almond',
  },
  // RXBar
  {
    id: 'rxbar-chocolate-sea-salt',
    brandId: 'rxbar',
    name: 'RXBar — Chocolate Sea Salt',
    servingLabel: '1 bar (52 g)',
    calories: 210,
    protein: 12,
    carbs: 23,
    fat: 9,
    fiber: 3,
    sodiumMg: 270,
    whereToFind: 'Whole Foods, Target, Starbucks, airport kiosks, Amazon.',
    goalsFit: ['whole_food_leaning', 'convenience', 'travel'],
    excludeTags: ['eggs', 'nuts'],
    ingredientBlob: 'dates egg white almonds cashew peanut',
    notes: 'Short ingredient list — more carb + fat than a whey bar, but real food texture.',
  },
  {
    id: 'rxbar-blueberry',
    brandId: 'rxbar',
    name: 'RXBar — Blueberry',
    servingLabel: '1 bar (52 g)',
    calories: 210,
    protein: 12,
    carbs: 24,
    fat: 9,
    sodiumMg: 15,
    whereToFind: 'Same as other RXBars — widely stocked.',
    goalsFit: ['convenience', 'travel'],
    excludeTags: ['eggs', 'nuts'],
    ingredientBlob: 'dates egg white almonds cashew blueberry',
    momFriendly: true,
  },
  // Epic
  {
    id: 'epic-beef-sea-salt',
    brandId: 'epic',
    name: 'Epic Bar — Beef Sea Salt + Pepper',
    servingLabel: '1 bar (43 g)',
    calories: 130,
    protein: 11,
    carbs: 15,
    fat: 5,
    sodiumMg: 600,
    whereToFind: 'Whole Foods, REI, Target, some convenience stores.',
    goalsFit: ['fat_loss', 'convenience', 'savoury'],
    excludeTags: ['beef'],
    ingredientBlob: 'beef dried fruit',
    notes: 'Savory — useful when you cannot face another sweet bar.',
  },
  {
    id: 'epic-chicken-sriracha',
    brandId: 'epic',
    name: 'Epic Bar — Chicken Sriracha',
    servingLabel: '1 bar (43 g)',
    calories: 130,
    protein: 15,
    carbs: 5,
    fat: 4,
    sodiumMg: 520,
    whereToFind: 'Outdoor and natural grocers; expanding mainstream.',
    goalsFit: ['muscle', 'savoury'],
    excludeTags: ['spicy'],
    ingredientBlob: 'chicken',
  },
  // Jack Links
  {
    id: 'jack-links-original-1oz',
    brandId: 'jack_links',
    name: 'Jack Links — Original Beef Jerky',
    servingLabel: '1 oz (28 g)',
    calories: 80,
    protein: 11,
    carbs: 6,
    fat: 1,
    sodiumMg: 590,
    whereToFind: 'Everywhere — supermarkets, gas stations, vending, big-box.',
    goalsFit: ['fat_loss', 'travel', 'convenience'],
    excludeTags: ['beef'],
    ingredientBlob: 'beef soy sauce',
    notes: 'Watch sodium if BP is a concern — great protein density per gram.',
  },
  {
    id: 'jack-links-turkey-1oz',
    brandId: 'jack_links',
    name: 'Jack Links — Turkey Jerky',
    servingLabel: '1 oz (28 g)',
    calories: 80,
    protein: 12,
    carbs: 7,
    fat: 0.5,
    sodiumMg: 510,
    whereToFind: 'Same mass retail as beef jerky.',
    goalsFit: ['fat_loss', 'convenience'],
    excludeTags: [],
    ingredientBlob: 'turkey',
  },
  // Chomps
  {
    id: 'chomps-beef-original',
    brandId: 'chomps',
    name: 'Chomps — Original Beef Stick',
    servingLabel: '1 stick (~1.15 oz)',
    calories: 100,
    protein: 10,
    carbs: 0,
    fat: 7,
    sodiumMg: 380,
    whereToFind: 'Target, Whole Foods, Costco, Amazon, natural grocers.',
    goalsFit: ['convenience', 'mom', 'travel', 'kid_friendly'],
    excludeTags: ['beef'],
    ingredientBlob: 'beef',
    momFriendly: true,
    notes: 'One-handed, no mess — easy while wrangling kids.',
  },
  {
    id: 'chomps-turkey',
    brandId: 'chomps',
    name: 'Chomps — Free Range Turkey Stick',
    servingLabel: '1 stick (~1.15 oz)',
    calories: 100,
    protein: 10,
    carbs: 0,
    fat: 6,
    sodiumMg: 350,
    whereToFind: 'Same as Chomps beef — club packs common.',
    goalsFit: ['mom', 'convenience', 'kid_friendly'],
    excludeTags: [],
    ingredientBlob: 'turkey',
    momFriendly: true,
  },
  // Wilde
  {
    id: 'wilde-chicken-chips-original',
    brandId: 'wilde',
    name: 'Wilde Protein Chips — Chicken Sea Salt',
    servingLabel: '1 bag (~1 oz / 28 g)',
    calories: 140,
    protein: 13,
    carbs: 5,
    fat: 8,
    sodiumMg: 280,
    whereToFind: 'Target, Whole Foods, Amazon, some gyms.',
    goalsFit: ['muscle', 'convenience', 'crunch', 'mom'],
    excludeTags: [],
    ingredientBlob: 'chicken protein powder',
    momFriendly: true,
    notes: 'Crunchy hit — about 140 kcal and 13 g protein per bag on most SKUs.',
  },
  {
    id: 'wilde-egg-white-chips',
    brandId: 'wilde',
    name: 'Wilde Protein Chips — Egg White & Buttermilk Ranch',
    servingLabel: '1 bag (~1 oz)',
    calories: 130,
    protein: 11,
    carbs: 6,
    fat: 7,
    sodiumMg: 300,
    whereToFind: 'Natural grocers and online — stock varies by region.',
    goalsFit: ['convenience', 'mom'],
    excludeTags: ['dairy', 'eggs'],
    ingredientBlob: 'egg white buttermilk whey',
    momFriendly: true,
  },
  // Pure Protein
  {
    id: 'pure-protein-chocolate-deluxe',
    brandId: 'pure_protein',
    name: 'Pure Protein Bar — Chocolate Deluxe',
    servingLabel: '1 bar (50 g)',
    calories: 180,
    protein: 20,
    carbs: 18,
    fat: 4.5,
    fiber: 1,
    sodiumMg: 200,
    whereToFind: 'Walmart, Costco, Amazon, pharmacy chains — very common.',
    goalsFit: ['muscle', 'budget', 'travel', 'mom'],
    excludeTags: ['dairy', 'nuts'],
    ingredientBlob: 'whey protein milk peanuts',
    momFriendly: true,
    notes: 'Easy to stash — ~20 g protein in a thin bar.',
  },
  {
    id: 'pure-protein-shake',
    brandId: 'pure_protein',
    name: 'Pure Protein Shake — Chocolate',
    servingLabel: '1 bottle (11 fl oz)',
    calories: 160,
    protein: 30,
    carbs: 5,
    fat: 2,
    sodiumMg: 220,
    whereToFind: 'Same mass retail as bars — refrigerated and shelf-stable versions.',
    goalsFit: ['muscle', 'convenience'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk whey protein isolate',
  },
  // Siggi's
  {
    id: 'siggis-plain-0',
    brandId: 'siggis',
    name: "Siggi's — Plain 0% Icelandic Skyr",
    servingLabel: '1 cup (5.3 oz / 150 g)',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    sodiumMg: 55,
    whereToFind: 'Whole Foods, Kroger banners, Target, most major groceries.',
    goalsFit: ['fat_loss', 'muscle', 'whole_food_leaning'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk',
    notes: 'Add fruit or honey yourself to control carbs.',
  },
  {
    id: 'siggis-4percent',
    brandId: 'siggis',
    name: "Siggi's — 4% Icelandic Skyr — Mixed Berry",
    servingLabel: '1 cup (5.3 oz)',
    calories: 130,
    protein: 11,
    carbs: 13,
    fat: 4,
    sodiumMg: 50,
    whereToFind: 'Same retail as other Siggi tubs.',
    goalsFit: ['muscle', 'satiety'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk berry',
  },
  // Chobani
  {
    id: 'chobani-complete-vanilla',
    brandId: 'chobani',
    name: 'Chobani Complete — Vanilla Shake',
    servingLabel: '1 bottle (10 fl oz)',
    calories: 200,
    protein: 20,
    carbs: 22,
    fat: 4,
    sodiumMg: 120,
    whereToFind: 'Refrigerated dairy aisle — supermarkets nationwide.',
    goalsFit: ['muscle', 'convenience', 'post_workout'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk whey protein',
  },
  {
    id: 'chobani-pouch-vanilla',
    brandId: 'chobani',
    name: 'Chobani Greek Yogurt Pouch — Vanilla (kids line / drinkable)',
    servingLabel: '1 pouch (3.5 oz)',
    calories: 90,
    protein: 8,
    carbs: 12,
    fat: 2,
    sodiumMg: 45,
    whereToFind: 'Yogurt aisle — sold in multi-packs.',
    goalsFit: ['mom', 'kid_friendly', 'convenience'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk yogurt',
    momFriendly: true,
    notes: 'One-handed squeeze — marketed for kids; works for parents too.',
  },
  // Good Culture
  {
    id: 'good-culture-classic-5oz',
    brandId: 'good_culture',
    name: 'Good Culture — Classic Cottage Cheese',
    servingLabel: '1 cup (5 oz)',
    calories: 110,
    protein: 14,
    carbs: 4,
    fat: 5,
    sodiumMg: 460,
    whereToFind: 'Whole Foods, Target, natural grocers, expanding mainstream.',
    goalsFit: ['fat_loss', 'muscle', 'satiety'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk cottage cheese',
    momFriendly: true,
    notes: 'Casein-heavy — slow release; pair with fruit if you want carbs.',
  },
  // fairlife
  {
    id: 'fairlife-core-power-26',
    brandId: 'fairlife',
    name: 'fairlife Core Power — Chocolate (26 g protein)',
    servingLabel: '1 bottle (14 fl oz)',
    calories: 170,
    protein: 26,
    carbs: 28,
    fat: 4.5,
    sodiumMg: 360,
    whereToFind: 'Refrigerated protein drinks — Walmart, gas stations, gyms.',
    goalsFit: ['muscle', 'post_workout', 'convenience'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk whey protein',
  },
  {
    id: 'fairlife-nutrition-plan',
    brandId: 'fairlife',
    name: 'fairlife Nutrition Plan — Chocolate',
    servingLabel: '1 bottle (14 fl oz)',
    calories: 150,
    protein: 30,
    carbs: 8,
    fat: 4.5,
    sodiumMg: 380,
    whereToFind: 'Same cold case as Core Power — check label for exact SKU.',
    goalsFit: ['muscle', 'fat_loss', 'convenience'],
    excludeTags: ['dairy'],
    ingredientBlob: 'milk whey protein isolate',
    notes: 'Very high protein per bottle — great when chewing feels like work.',
  },
  // Orgain
  {
    id: 'orgain-rtd-chocolate',
    brandId: 'orgain',
    name: 'Orgain Organic Nutrition — Creamy Chocolate Fudge',
    servingLabel: '1 carton (11 fl oz)',
    calories: 220,
    protein: 16,
    carbs: 32,
    fat: 6,
    sodiumMg: 260,
    whereToFind: 'Natural grocers, Costco, Amazon.',
    goalsFit: ['convenience', 'organic_preference'],
    excludeTags: ['dairy', 'soy'],
    ingredientBlob: 'organic whey milk soy',
  },
  {
    id: 'orgain-clean-protein-plant',
    brandId: 'orgain',
    name: 'Orgain Clean Protein — Plant Chocolate',
    servingLabel: '1 bottle (11 fl oz)',
    calories: 150,
    protein: 21,
    carbs: 13,
    fat: 4,
    sodiumMg: 280,
    whereToFind: 'Plant-based section — Target, Whole Foods, Amazon.',
    goalsFit: ['plant_based', 'convenience'],
    excludeTags: ['soy', 'nuts'],
    ingredientBlob: 'pea protein almond',
  },
  // Legendary
  {
    id: 'legendary-pop-tart',
    brandId: 'legendary',
    name: 'Legendary Foods — Protein Pastry (e.g. Strawberry)',
    servingLabel: '1 pastry (~50 g)',
    calories: 180,
    protein: 20,
    carbs: 24,
    fat: 8,
    fiber: 8,
    sodiumMg: 220,
    whereToFind: 'Online, some vitamin shops, specialty fitness retailers.',
    goalsFit: ['muscle', 'sweet_tooth'],
    excludeTags: ['dairy', 'nuts', 'gluten'],
    ingredientBlob: 'wheat whey protein milk almond',
    notes: 'Treat-like — fiber is high; check label for your batch.',
  },
  // Kind
  {
    id: 'kind-dark-chocolate-nuts',
    brandId: 'kind',
    name: 'Kind Bar — Dark Chocolate Nuts & Sea Salt',
    servingLabel: '1 bar (40 g)',
    calories: 200,
    protein: 6,
    carbs: 16,
    fat: 16,
    fiber: 7,
    sodiumMg: 20,
    whereToFind: 'Everywhere — checkout lanes, airports, coffee shops.',
    goalsFit: ['satiety', 'travel', 'whole_food_leaning'],
    excludeTags: ['nuts'],
    ingredientBlob: 'almond peanut dark chocolate',
    notes: 'Higher fat than protein — better as a hunger bridge than a protein hit.',
  },
  {
    id: 'kind-protein-bar',
    brandId: 'kind',
    name: 'Kind Protein Bar — Crunchy Peanut Butter',
    servingLabel: '1 bar (50 g)',
    calories: 250,
    protein: 12,
    carbs: 18,
    fat: 17,
    fiber: 5,
    sodiumMg: 140,
    whereToFind: 'Same wide retail as other Kind products.',
    goalsFit: ['muscle', 'travel'],
    excludeTags: ['nuts', 'dairy'],
    ingredientBlob: 'peanut milk protein isolate',
  },
]

export function getBrandedProductById(id) {
  return BRANDED_SNACK_PRODUCTS.find((p) => p.id === id) || null
}

export function getBrandById(id) {
  return BRANDED_SNACK_BRANDS.find((b) => b.id === id) || null
}

export function searchBrandedProductsByText(q) {
  const qq = (q || '').trim().toLowerCase()
  if (!qq) return BRANDED_SNACK_PRODUCTS.slice(0, 24)
  return BRANDED_SNACK_PRODUCTS.filter((p) => {
    const brand = getBrandById(p.brandId)
    const bname = (brand?.name || '').toLowerCase()
    return (
      p.name.toLowerCase().includes(qq) ||
      p.ingredientBlob.toLowerCase().includes(qq) ||
      bname.includes(qq) ||
      qq.split(/\s+/).some((w) => w.length > 2 && (p.name.toLowerCase().includes(w) || bname.includes(w)))
    )
  }).slice(0, 20)
}

/**
 * Coach-facing deep dive (matches snackDatabase style).
 * @param {BrandedSnackProduct} product
 */
export function formatBrandedProductCoachBlock(product) {
  if (!product) return ''
  const brand = getBrandById(product.brandId)
  const macro = `${product.calories} kcal, ${product.protein}g protein, ${product.carbs}g carbs, ${product.fat}g fat per ${product.servingLabel}.`
  const lines = [
    `${brand?.name || 'Brand'} — ${product.name}: ${macro}`,
    `Where to find: ${product.whereToFind}`,
    `Fits best when: ${product.goalsFit.join(', ')}.`,
  ]
  if (product.notes) lines.push(product.notes)
  return lines.join(' ')
}
