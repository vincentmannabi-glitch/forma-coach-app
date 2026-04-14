import { deriveMusclesWorked } from './exerciseCardContent'

function shortMuscleLine(ex) {
  const raw = deriveMusclesWorked(ex)
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length <= 4) {
    return parts.join(', ').replace(/\.$/, '')
  }
  return parts.slice(0, 4).join(', ')
}

function splitDescription(desc) {
  const d = (desc || '').trim()
  if (!d) return { setup: '', movement: '' }
  const sentences = d.split(/(?<=[.!?])\s+/).filter(Boolean)
  return {
    setup: sentences[0] || '',
    movement: sentences[1] || sentences[0] || '',
  }
}

/**
 * Three-line train copy + expandable one-liners. Never more than 3 lines visible by default.
 * @param {object} ex — exercise from library or merged shape
 */
export function getExerciseCoachBlocks(ex) {
  const { setup, movement } = splitDescription(ex?.description)
  const setupCue = setup || (ex?.formTip ? String(ex.formTip).split('.')[0] + '.' : 'Set up with control and full-body tension.')
  const movementCue =
    movement && movement !== setup
      ? movement
      : ex?.formTip && setup
        ? String(ex.formTip).trim()
        : 'Move through the range with steady breathing and full control.'

  const mistakes = Array.isArray(ex?.commonMistakes) ? ex.commonMistakes : []
  const commonMistakeOne = mistakes[0] || 'Rushing reps and losing position under load.'

  const easier = (ex?.regression || '').trim() || 'Reduce load or range until form stays perfect.'
  const harder = (ex?.progression || '').trim() || 'Add load or a harder variation when all reps look the same.'

  return {
    primaryMuscles: shortMuscleLine(ex),
    setupCue: setupCue.replace(/\s+/g, ' ').trim(),
    movementCue: movementCue.replace(/\s+/g, ' ').trim(),
    commonMistakeOne,
    progressionEasier: easier,
    progressionHarder: harder,
  }
}
