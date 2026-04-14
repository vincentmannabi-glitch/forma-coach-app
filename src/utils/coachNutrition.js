import { RECIPES } from '../data/recipes'
import { parseRecipeProteinGrams } from './nutrition'

/**
 * Cookbook meals closest to remaining protein (e.g. after a big lunch).
 */
export function getLightDinnerSuggestions(remainingProteinG, limit = 2) {
  if (remainingProteinG == null || remainingProteinG <= 0) return []
  return [...RECIPES]
    .map((r) => ({ r, p: parseRecipeProteinGrams(r) }))
    .filter((x) => x.p > 0 && x.p <= remainingProteinG + 10)
    .sort((a, b) => Math.abs(a.p - remainingProteinG) - Math.abs(b.p - remainingProteinG))
    .slice(0, limit)
    .map((x) => x.r)
}

export function getOverCalorieSupportMessage() {
  return "You went over today. That happens. Here is how tomorrow looks to balance it out — one day never derails a program. Consistency over time does."
}

export function getProteinSafetyNetMessage() {
  return 'FORMA Coach does not judge what you log — it all goes toward your day. Even on pizza and beer days there is always a way to get protein in: Greek yogurt, cottage cheese, a shake, or extra lean meat. Small adds stack up.'
}
