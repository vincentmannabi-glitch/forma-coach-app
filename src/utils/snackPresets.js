/**
 * Snack options for coaching, catch-up suggestions, and grocery aggregation.
 * excludeTags: if user excludes this tag, snack is omitted.
 * supplement: true = shake/bar/casein — hide for whole_foods_only.
 */

/** @typedef {{ id: string; label: string; proteinG: number; supplement: boolean; excludeTags: string[]; groceryItems: { mergeKey: string; amount: number; unit: string; label: string; category: string; lineCost: number }[] }} SnackPreset */

/** @type {SnackPreset[]} */
export const SNACK_PRESETS = [
  {
    id: 'jerky',
    label: 'Jerky and dried meats',
    proteinG: 14,
    supplement: false,
    excludeTags: [],
    groceryItems: [
      { mergeKey: 'beef-jerky', amount: 2.5, unit: 'oz', label: 'beef or turkey jerky', category: 'meat-fish', lineCost: 3.2 },
    ],
  },
  {
    id: 'nuts_seeds',
    label: 'Nuts and seeds',
    proteinG: 8,
    supplement: false,
    excludeTags: ['nuts'],
    groceryItems: [
      { mergeKey: 'mixed-nuts', amount: 1.5, unit: 'oz', label: 'mixed nuts or seeds', category: 'dry-goods', lineCost: 0.85 },
    ],
  },
  {
    id: 'fruit',
    label: 'Fruit',
    proteinG: 2,
    supplement: false,
    excludeTags: [],
    groceryItems: [
      { mergeKey: 'apple', amount: 1, unit: 'whole', label: 'apple or pear', category: 'produce', lineCost: 0.75 },
    ],
  },
  {
    id: 'protein_bars',
    label: 'Protein bars',
    proteinG: 20,
    supplement: true,
    excludeTags: [],
    groceryItems: [
      { mergeKey: 'protein-bar', amount: 7, unit: 'bars', label: 'protein bars', category: 'dry-goods', lineCost: 14.0 },
    ],
  },
  {
    id: 'greek_yogurt',
    label: 'Greek yogurt',
    proteinG: 17,
    supplement: false,
    excludeTags: ['dairy'],
    groceryItems: [
      { mergeKey: 'greek-yogurt', amount: 1, unit: 'tub', label: 'plain Greek yogurt (17g protein/serving)', category: 'dairy-eggs', lineCost: 5.5 },
    ],
  },
  {
    id: 'cottage_cheese',
    label: 'Cottage cheese',
    proteinG: 14,
    supplement: false,
    excludeTags: ['dairy'],
    groceryItems: [
      { mergeKey: 'cottage-cheese', amount: 1, unit: 'tub', label: 'low-fat cottage cheese', category: 'dairy-eggs', lineCost: 3.8 },
    ],
  },
  {
    id: 'rice_cakes',
    label: 'Rice cakes',
    proteinG: 3,
    supplement: false,
    excludeTags: ['gluten'],
    groceryItems: [
      { mergeKey: 'rice-cakes', amount: 1, unit: 'pack', label: 'plain rice cakes', category: 'dry-goods', lineCost: 2.2 },
    ],
  },
  {
    id: 'hard_boiled_eggs',
    label: 'Hard boiled eggs',
    proteinG: 12,
    supplement: false,
    excludeTags: ['eggs'],
    groceryItems: [
      { mergeKey: 'eggs-large', amount: 6, unit: 'whole', label: 'large eggs', category: 'dairy-eggs', lineCost: 2.4 },
    ],
  },
  {
    id: 'cheese',
    label: 'Cheese',
    proteinG: 7,
    supplement: false,
    excludeTags: ['dairy'],
    groceryItems: [
      { mergeKey: 'cheese-snack', amount: 2, unit: 'oz', label: 'part-skim cheese sticks or slices', category: 'dairy-eggs', lineCost: 1.6 },
    ],
  },
  {
    id: 'edamame',
    label: 'Edamame',
    proteinG: 11,
    supplement: false,
    excludeTags: ['soy'],
    groceryItems: [
      { mergeKey: 'edamame-frozen', amount: 1, unit: 'bag', label: 'shelled edamame (frozen)', category: 'produce', lineCost: 2.9 },
    ],
  },
  {
    id: 'protein_shakes',
    label: 'Protein shakes',
    proteinG: 25,
    supplement: true,
    excludeTags: [],
    groceryItems: [
      { mergeKey: 'whey-protein', amount: 1, unit: 'tub', label: 'whey protein powder', category: 'supplements', lineCost: 42.0 },
    ],
  },
  {
    id: 'no_snack',
    label: 'I prefer not to snack',
    proteinG: 0,
    supplement: false,
    excludeTags: [],
    groceryItems: [],
  },
]

export const FOOD_EXCLUSION_OPTIONS = [
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'pork', label: 'Pork', icon: '🐷' },
  { id: 'beef', label: 'Beef', icon: '🥩' },
  { id: 'lamb', label: 'Lamb', icon: '🍖' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'nuts', label: 'Nuts', icon: '🥜' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'onions', label: 'Onions', icon: '🧅' },
  { id: 'mushrooms', label: 'Mushrooms', icon: '🍄' },
  { id: 'spicy', label: 'Spicy food', icon: '🌶️' },
  { id: 'raw_fish', label: 'Raw fish', icon: '🍣' },
]

export function getSnackPresetById(id) {
  return SNACK_PRESETS.find((s) => s.id === id)
}
