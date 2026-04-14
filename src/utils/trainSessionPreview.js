/**
 * One-line previews for Train hub — from forma_user_program only.
 */
import { ensureProgramLoaded, resolveTrainSession } from './programBuilder.js'

function estimateMinutes(exerciseCount, hyrox) {
  const base = 10 + exerciseCount * 8
  return Math.max(28, Math.round(base + (hyrox ? 18 : 0)))
}

/**
 * @param {'gym'|'calisthenics'|'both'|'home'} styleId
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
  const hyrox = !!session.hyroxFinisher || !!session.hyroxFinisherOptional
  const mins = session.estimatedDuration ?? estimateMinutes(n, hyrox)
  const label = session.name || 'Today’s session'
  return `${label}: ${names || 'Programmed lifts'} (${n} moves, ~${mins} min)`
}
