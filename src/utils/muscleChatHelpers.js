/**
 * Map user questions to program exercises + enrichment for muscle-related chat.
 */

import { enrichExerciseId } from '../data/movementEnrichment'
import { getAllExercisesFlat } from '../data/exercises'
import { getTodayTrainExercisesSync } from './programBuilder.js'

const LEVEL_STORAGE = 'forma_train_level'

export function getTrainLevelForChat(user) {
  try {
    const k = localStorage.getItem(LEVEL_STORAGE)
    if (k && ['beginner', 'intermediate', 'advanced'].includes(k)) return k
  } catch {
    /* ignore */
  }
  const exp = (user?.experience_level || '').toLowerCase()
  if (exp.includes('advanced')) return 'advanced'
  if (exp.includes('intermediate')) return 'intermediate'
  return 'beginner'
}

/**
 * @param {string[]} keywords — lowercase substrings to match in enrichment (e.g. ['latissimus', 'lat'])
 * @returns {string[]} display names from today's session
 */
export function programExercisesMatchingMuscles(keywords, user) {
  void user
  const list = getTodayTrainExercisesSync('gym', new Date())
  const hits = []
  const kws = keywords.map((k) => k.toLowerCase()).filter(Boolean)
  for (const ex of list) {
    const en = enrichExerciseId(ex.id) || (ex.exerciseNumber != null ? enrichExerciseId(String(ex.exerciseNumber)) : null)
    const blob = en
      ? `${en.primary} ${en.secondary} ${en.stabilizers} ${en.pattern || ''}`.toLowerCase()
      : `${ex.name || ''} ${ex.displayName || ''} ${ex.musclesWorked || ''}`.toLowerCase()
    if (kws.some((kw) => blob.includes(kw))) {
      hits.push(ex.displayName || ex.name)
    }
  }
  return [...new Set(hits)]
}

/**
 * Suggest add-on exercise names from full library (not necessarily in today's session).
 * @param {string[]} keywords
 * @param {number} max
 */
export function suggestExercisesForMuscle(keywords, max = 4) {
  const kws = keywords.map((k) => k.toLowerCase()).filter(Boolean)
  const flat = getAllExercisesFlat()
  const names = []
  for (const ex of flat) {
    const en = enrichExerciseId(ex.id)
    if (!en) continue
    const blob = `${en.primary} ${en.secondary} ${en.stabilizers}`.toLowerCase()
    if (kws.some((kw) => blob.includes(kw))) {
      names.push(ex.name)
    }
  }
  return [...new Set(names)].slice(0, max)
}
