/**
 * One-line previews for Train hub — from forma_user_program only.
 */
import { ensureProgramLoaded, resolveTrainSession } from './programBuilder.js'

function estimateMinutes(exerciseCount, hasConditioningFinisher) {
  const base = 10 + exerciseCount * 8
  return Math.max(28, Math.round(base + (hasConditioningFinisher ? 18 : 0)))
}

/**
 * @param {string} styleId — resolved against today’s program (use "program" for equipment-based plan)
 * @param {object} user
 * @returns {string}
 */
export function getTrainSessionPreviewLine(styleId, user) {
  void user
  const program = ensureProgramLoaded()
  const { session } = resolveTrainSession(program, styleId, new Date())
  if (!session || session.environment === 'rest') {
    return 'Recovery day — light movement optional'
  }
  const n = (session.exercises || []).length
  const names = (session.exercises || []).slice(0, 3).map((e) => e.displayName || e.name).join(', ')
  const hasFinisher = !!session.conditioningFinisher || !!session.conditioningFinisherOptional
  const mins = session.estimatedDuration ?? estimateMinutes(n, hasFinisher)
  const label = session.name || 'Today’s session'
  return `${label}: ${names || 'Programmed lifts'} (${n} moves, ~${mins} min)`
}
