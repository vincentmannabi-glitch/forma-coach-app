/**
 * Normalize onboarding experience (string or multi-select array) for training code.
 * @param {string | string[] | undefined | null} exp
 * @returns {'beginner' | 'intermediate' | 'advanced'}
 */
export function mapExperienceToTrainLevel(exp) {
  const s = Array.isArray(exp) ? exp.join(' ') : String(exp ?? '')
  const lower = s.toLowerCase()
  if (lower.includes('advanced') || lower.includes('competitive')) return 'advanced'
  if (lower.includes('intermediate')) return 'intermediate'
  return 'beginner'
}
