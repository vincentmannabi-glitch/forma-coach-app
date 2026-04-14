/**
 * Normalize onboarding goal strings to program categories used by weekly planning.
 * @param {string | string[] | undefined} goal — single goal string or goals array
 * @returns {'fat_loss' | 'muscle' | 'athlete' | 'general' | 'balanced'}
 */
function goalToLowerBlob(g) {
  if (g == null) return ''
  if (typeof g === 'string') return g.toLowerCase()
  if (typeof g === 'number' || typeof g === 'boolean') return String(g).toLowerCase()
  return ''
}

export function normalizeProgramGoal(goal) {
  const goals = Array.isArray(goal) ? goal : [goal]
  const blob = goals.map((g) => goalToLowerBlob(g)).join(' ')
  const hasFat = blob.includes('lose fat') || blob.includes('lean')
  const hasMuscle = blob.includes('build muscle') || blob.includes('stronger')
  const hasSport = blob.includes('sport') || blob.includes('competition')
  if (hasFat && hasMuscle) return 'balanced'
  if (hasFat && hasSport) return 'balanced'
  if (hasMuscle && hasSport) return 'balanced'
  if (hasFat) return 'fat_loss'
  if (hasMuscle) return 'muscle'
  if (hasSport) return 'athlete'
  return 'general'
}

/**
 * Map experience to HIIT / core progression tier.
 * When multiple levels, use most conservative for safety.
 * @param {string | string[] | undefined} experienceLevel — single or array
 * @returns {'beginner' | 'intermediate' | 'advanced'}
 */
export function getExperienceTier(experienceLevel) {
  const arr = Array.isArray(experienceLevel) ? experienceLevel : [experienceLevel]
  const levels = arr
    .filter((x) => x != null && x !== '')
    .map((s) => (typeof s === 'string' ? s : String(s)).toLowerCase())
  if (levels.some((s) => s.includes('beginner'))) return 'beginner'
  if (levels.some((s) => s.includes('intermediate'))) return 'intermediate'
  if (levels.some((s) => s.includes('advanced') || s.includes('competitive'))) return 'advanced'
  return 'beginner'
}
