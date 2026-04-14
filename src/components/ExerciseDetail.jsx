import { useState } from 'react'
import { getExerciseCoachBlocks } from '../utils/exerciseCoachCopy'
import './ExerciseDetail.css'

export default function ExerciseDetail({ exercise, onClose, lastWeight, suggestion }) {
  const [extra, setExtra] = useState(null)
  if (!exercise) return null

  const blocks = getExerciseCoachBlocks(exercise)

  return (
    <div className="exercise-detail-overlay" onClick={onClose}>
      <div className="exercise-detail" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="exercise-detail-close" onClick={onClose}>
          ×
        </button>
        <h2 className="exercise-detail-name">{exercise.name}</h2>

        {lastWeight != null && (
          <p className="exercise-detail-last">Last used: {lastWeight} kg</p>
        )}

        <p className="exercise-detail-muscles">{blocks.primaryMuscles}</p>
        <p className="exercise-detail-line">{blocks.setupCue}</p>
        <p className="exercise-detail-line">{blocks.movementCue}</p>

        <div className="exercise-detail-links">
          <button type="button" className="exercise-detail-link" onClick={() => setExtra((x) => (x === 'm' ? null : 'm'))}>
            Common mistakes
          </button>
          <button type="button" className="exercise-detail-link" onClick={() => setExtra((x) => (x === 'p' ? null : 'p'))}>
            Progression
          </button>
        </div>
        {extra === 'm' && <p className="exercise-detail-reveal">{blocks.commonMistakeOne}</p>}
        {extra === 'p' && (
          <div className="exercise-detail-reveal-block">
            <p className="exercise-detail-reveal">{blocks.progressionEasier}</p>
            <p className="exercise-detail-reveal">{blocks.progressionHarder}</p>
          </div>
        )}

        {suggestion && (
          <div className={`exercise-detail-suggestion ${suggestion.type}`}>
            {suggestion.message}
          </div>
        )}
      </div>
    </div>
  )
}
