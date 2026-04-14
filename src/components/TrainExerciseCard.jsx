import { useEffect, useState } from 'react'
import {
  formatExerciseTargetLine,
  getTrainSetWeightPlaceholder,
  getTrainSetRepsPlaceholder,
  kgToRoundedLbs,
} from '../utils/exerciseCardContent'
import { getExerciseCoachBlocks } from '../utils/exerciseCoachCopy'

/**
 * Expandable exercise card — description + set tracker only (no video).
 */
export default function TrainExerciseCard({
  exercise,
  expanded,
  onToggleExpand,
  sets,
  onUpdateSet,
  onSetComplete,
  lastWeightHint,
  lastSessionLine,
  suggestedStartKg,
  progressionNextKg,
  onProgressionAccept,
  onProgressionSkip,
  prSetIndices,
  substituted,
  variant = 'gym',
  isCircuit = false,
  circuitMeta = null,
  headerWeightKg = null,
  trainLevel = 'beginner',
  weightUnit = 'kg',
}) {
  const ex = exercise || {}
  const name = ex.displayName || ex.name || 'Exercise'
  const order = ex.order ?? '—'
  const blocks = getExerciseCoachBlocks(ex)
  const prSet = prSetIndices instanceof Set ? prSetIndices : new Set(prSetIndices || [])

  const [openExtra, setOpenExtra] = useState(null)

  useEffect(() => {
    if (!expanded) setOpenExtra(null)
  }, [expanded])

  const targetWeight = headerWeightKg == null
    ? null
    : weightUnit === 'lbs'
      ? kgToRoundedLbs(headerWeightKg)
      : headerWeightKg

  const targetSummaryLine = formatExerciseTargetLine(
    ex,
    targetWeight,
    variant,
    isCircuit,
    circuitMeta,
    weightUnit,
  )

  const weightPh = getTrainSetWeightPlaceholder(ex, trainLevel, weightUnit)

  return (
    <div className={`train-card train-card--text-only ${expanded ? 'expanded' : ''}`}>
      <button type="button" className="train-card-header" onClick={onToggleExpand} aria-expanded={expanded}>
        <span className="train-card-num">{order}</span>
        <div className="train-card-meta">
          <span className="train-card-name">
            {name}
            {substituted ? (
              <span className="train-card-badge" title="Adjusted for today">
                {' '}
                · adjusted
              </span>
            ) : null}
          </span>
          {lastSessionLine ? (
            <span className="train-card-last-under-name">Last session {lastSessionLine}</span>
          ) : null}
          <span className="train-card-target-line">{targetSummaryLine}</span>
          {ex.weightSuggestion ? (
            <span className="train-card-weight-hint">{String(ex.weightSuggestion).split(' Within session')[0]}</span>
          ) : null}
        </div>
        <span className="train-card-chevron">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="train-card-body">
          <p className="train-coach-muscles">{blocks.primaryMuscles}</p>
          {(ex.coachingCues || ex.description) && (
            <p className="train-coach-line train-coach-line--emph">{String(ex.coachingCues || ex.description)}</p>
          )}
          <p className="train-coach-line">{blocks.setupCue}</p>
          <p className="train-coach-line">{blocks.movementCue}</p>
          {(ex.equipmentRequired || ex.progression || ex.regression) && (
            <div className="train-program-detail">
              {ex.equipmentRequired ? (
                <p className="train-coach-line">
                  <strong>Equipment:</strong> {ex.equipmentRequired}
                </p>
              ) : null}
              {ex.progression ? (
                <p className="train-coach-line">
                  <strong>Progression:</strong> {ex.progression}
                </p>
              ) : null}
              {ex.regression ? (
                <p className="train-coach-line">
                  <strong>Regression:</strong> {ex.regression}
                </p>
              ) : null}
            </div>
          )}

          <div className="train-coach-links">
            <button
              type="button"
              className="train-coach-link"
              onClick={(e) => {
                e.stopPropagation()
                setOpenExtra((v) => (v === 'm' ? null : 'm'))
              }}
            >
              Common mistakes
            </button>
            <button
              type="button"
              className="train-coach-link"
              onClick={(e) => {
                e.stopPropagation()
                setOpenExtra((v) => (v === 'p' ? null : 'p'))
              }}
            >
              Progression
            </button>
          </div>
          {openExtra === 'm' && <p className="train-coach-reveal">{blocks.commonMistakeOne}</p>}
          {openExtra === 'p' && (
            <div className="train-coach-reveal-block">
              <p className="train-coach-reveal">{blocks.progressionEasier}</p>
              <p className="train-coach-reveal">{blocks.progressionHarder}</p>
            </div>
          )}

          {variant === 'home' && ex.anchorNotes && (
            <p className="train-coach-line train-coach-line--subtle">{ex.anchorNotes}</p>
          )}

          {!lastSessionLine && lastWeightHint != null && (
            <p className="train-coach-last">Last log: {lastWeightHint} {weightUnit}</p>
          )}
          {suggestedStartKg != null && (
            <button
              type="button"
              className="train-suggest-pill"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateSet(0, { weight: String(suggestedStartKg), reps: '' })
              }}
            >
              {weightPh}
            </button>
          )}
          {progressionNextKg != null && (
            <div className="train-progression-row">
              <p className="train-progression-copy">Ready to progress — try {progressionNextKg} {weightUnit} today.</p>
              <div className="train-progression-actions">
                <button type="button" className="train-progression-yes" onClick={(e) => { e.stopPropagation(); onProgressionAccept?.() }}>
                  Use it
                </button>
                <button type="button" className="train-progression-skip" onClick={(e) => { e.stopPropagation(); onProgressionSkip?.() }}>
                  Skip
                </button>
              </div>
            </div>
          )}
          <p className="train-video-note">Video demonstrations coming soon</p>

          <div className="train-card-sets-block">
            <div className="train-set-header">
              <span>{isCircuit ? 'Round' : 'Set'}</span>
              <span>{variant === 'home' ? 'Load / notes' : `Weight (${weightUnit.toUpperCase()})`}</span>
              <span>{isCircuit ? '✓' : 'Reps'}</span>
              <span>Done</span>
            </div>
            {(Array.isArray(sets) ? sets : []).map((s, i) => (
              <div key={i} className={`train-set-row ${s.completed ? 'done' : ''} ${prSet.has(i) ? 'train-set-row--pr' : ''}`}>
                <span className="train-set-idx">
                  {i + 1}
                  {prSet.has(i) && <span className="train-set-pr">PR</span>}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="train-set-input train-set-input--weight"
                  placeholder={variant === 'home' ? 'Load or notes' : weightPh}
                  value={s.weight ?? ''}
                  onChange={(e) => onUpdateSet(i, { weight: e.target.value })}
                  disabled={s.completed}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  className="train-set-input train-set-input--reps"
                  placeholder={isCircuit ? '1' : getTrainSetRepsPlaceholder(ex, i)}
                  value={s.reps ?? ''}
                  onChange={(e) => onUpdateSet(i, { reps: e.target.value })}
                  disabled={s.completed}
                />
                <button
                  type="button"
                  className={`train-set-check ${s.completed ? 'on' : ''}`}
                  onClick={() => onSetComplete(i, !s.completed)}
                  aria-label={s.completed ? 'Mark set incomplete' : 'Mark set complete'}
                >
                  {s.completed ? '✓' : '○'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
