/**
 * Filter recipes by user exclusion tags (from onboarding).
 * Uses recipe name + ingredients text (simple keyword heuristics).
 */

const PATTERNS = {
  shellfish: /shrimp|prawn|lobster|crab|clam|mussel|oyster|scallop|shellfish/i,
  fish: /salmon|tuna|cod|tilapia|halibut|trout|mackerel|sardine|anchovy|swordfish|white fish|fish\b|seafood/i,
  pork: /pork|bacon|ham|chorizo|sausage(?![^.]*beef)/i,
  beef: /beef|steak|ground beef|brisket|ribeye|sirloin/i,
  lamb: /lamb/i,
  gluten: /wheat|breadcrumbs|pasta(?![^.]*chickpea)|bread|flour|couscous|barley|rye|seitan|gnocchi|cracker|wrap|tortilla|soy sauce/i,
  dairy: /milk|cheese|yogurt|yoghurt|butter|cream|feta|parmesan|ricotta|mozzarella|greek yogurt|whey(?![^.]*protein isolate)/i,
  eggs: /egg(?!\s*white)|eggs|omelette|mayo/i,
  nuts: /almond|walnut|pecan|cashew|pistachio|peanut|hazelnut|macadamia|nut\b/i,
  soy: /soy|tofu|tempeh|miso|edamame/i,
  onions: /onion|shallot|scallion|green onion/i,
  mushrooms: /mushroom/i,
  spicy: /spicy|chili|chilli|jalapeño|jalapeno|hot sauce|sriracha|gochujang|harissa|cayenne/i,
  raw_fish: /sashimi|sushi|ceviche|raw salmon|raw tuna|tartare|crudo|gravlax/i,
}

/**
 * @param {{ name: string; ingredients: string[] }} recipe
 * @param {Set<string> | string[]} exclusions
 */
export function recipePassesExclusions(recipe, exclusions) {
  if (!recipe || !exclusions || (exclusions instanceof Set && exclusions.size === 0)) return true
  const set = exclusions instanceof Set ? exclusions : new Set(exclusions)
  const blob = `${recipe.name} ${(recipe.ingredients || []).join(' ')}`

  for (const id of set) {
    const re = PATTERNS[id]
    if (re && re.test(blob)) return false
  }
  return true
}

/**
 * @param {string | undefined} other free-text exclusions from user
 */
export function textMatchesOtherExclusion(blob, other) {
  if (!other || !other.trim()) return false
  const terms = other
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const lower = blob.toLowerCase()
  return terms.some((t) => t.length >= 2 && lower.includes(t.toLowerCase()))
}

/** Category patterns for food preferences — recipe must NOT contain non-selected categories. */
const PREFERENCE_CATEGORY_PATTERNS = {
  meat: /beef|pork|lamb|steak|brisket|ribeye|sirloin|ground beef|bacon|ham|chorizo|sausage(?![^.]*chicken)/i,
  chicken: /chicken|turkey(?![^.]*jerky)/i,
  fish: /salmon|tuna|cod|tilapia|halibut|trout|mackerel|sardine|anchovy|swordfish|white fish|fish\b/i,
  seafood: /shrimp|prawn|lobster|crab|clam|mussel|oyster|scallop|shellfish|seafood/i,
  eggs: /egg(?!\s*white)|eggs|omelette|mayo/i,
  dairy: /milk|cheese|yogurt|yoghurt|butter|cream|feta|parmesan|ricotta|mozzarella|greek yogurt|whey(?![^.]*protein isolate)/i,
  gluten: /wheat|breadcrumbs|pasta(?![^.]*chickpea)|bread|flour|couscous|barley|rye|seitan|gnocchi|cracker|wrap|tortilla/i,
  nuts: /almond|walnut|pecan|cashew|pistachio|peanut|hazelnut|macadamia|nut\b/i,
  soy: /soy|tofu|tempeh|miso|edamame/i,
}

/**
 * Recipe passes preference filter: if user selected specific categories (not "everything"),
 * recipe must not contain ingredients from categories they did NOT select.
 * @param {{ name: string; ingredients: string[] }} recipe
 * @param {string[] | null | undefined} preferences e.g. ['meat','chicken','eggs'] or ['everything']
 */
export function recipeMatchesPreferences(recipe, preferences) {
  if (!recipe || !preferences?.length) return true
  if (preferences.includes('everything')) return true
  const prefSet = new Set(preferences)
  const blob = `${recipe.name} ${(recipe.ingredients || []).join(' ')}`
  for (const [cat, re] of Object.entries(PREFERENCE_CATEGORY_PATTERNS)) {
    if (prefSet.has(cat)) continue
    if (re.test(blob)) return false
  }
  return true
}
