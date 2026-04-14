import { useEffect, useState } from 'react'
import { getExerciseById } from '../data/exercises'
import { getExerciseCoachBlocks } from '../utils/exerciseCoachCopy'

function formatRepRange(ex) {
  const min = Number(ex?.repsMin) || Number(ex?.repMin) || Number(ex?.minReps) || 0
  const max = Number(ex?.repsMax) || Number(ex?.repMax) || Number(ex?.maxReps) || 0
  if (min > 0 && max > 0) return `${min}-${max}`
  if (max > 0) return `${max}`
  if (min > 0) return `${min}`
  return '—'
}

function strengthRows(exercises) {
  if (!exercises?.length) return []
  return exercises.map((ex) => ({
    exerciseId: ex.id,
    name: ex.displayName || ex.name || 'Exercise',
    right: `${ex.sets || 3} × ${formatRepRange(ex)}`,
  }))
}

function sectionBlocks(session) {
  const out = []
  const secs = session?.sections || []
  const byId = (id) => secs.find((s) => s.id === id)

  const wu = byId('warmup')
  if (wu?.content?.movements?.length) {
    out.push({
      key: 'warmup',
      label: 'Warm Up',
      rows: wu.content.movements.map((m) => ({
        exerciseId: null,
        name: m.name,
        right: m.detail || '—',
      })),
    })
  }

  const main = byId('main')
  const acc = byId('accessory')
  const mainEx = [...(main?.exercises || []), ...(acc?.exercises || [])]
  if (mainEx.length) {
    out.push({
      key: 'mainwork',
      label: 'Main Work',
      rows: strengthRows(mainEx),
    })
  }

  const core = byId('core')
  if (core?.content?.exercises?.length) {
    out.push({
      key: 'core',
      label: 'Core',
      rows: core.content.exercises.map((m) => ({
        exerciseId: null,
        name: m.name,
        right: m.detail || '—',
      })),
    })
  }

  const cardio = byId('cardio')
  if (cardio?.content) {
    out.push({
      key: 'cardio',
      label: 'Cardio Finisher',
      rows: [
        {
          exerciseId: null,
          name: cardio.content.title || 'Cardio',
          right: cardio.content.duration || `${cardio.minutes || '—'} min`,
        },
      ],
    })
  }

  const cd = byId('cooldown')
  if (cd?.content?.stretches?.length) {
    out.push({
      key: 'cooldown',
      label: 'Cool Down',
      rows: cd.content.stretches.map((s) => ({
        exerciseId: null,
        name: s.name,
        right: s.detail || '—',
      })),
    })
  }

  return out
}

export default function TrainHubTodaySession({ session }) {
  const blocks = sectionBlocks(session)
  const [openKey, setOpenKey] = useState(null)
  const [extraKey, setExtraKey] = useState(null)

  useEffect(() => {
    setExtraKey(null)
  }, [openKey])

  if (!blocks.length) return null

  return (
    <div className="train-hub-today" aria-label="Today session">
      {blocks.map((block) => (
        <article key={block.key} className="train-hub-section-card">
          <p className="train-hub-block-label">{block.label}</p>
          <div className="train-hub-section-rows">
            {block.rows.map((row, i) => {
              const rowKey = `${block.key}-${i}`
              const expanded = openKey === rowKey
              const exLib = row.exerciseId ? getExerciseById(row.exerciseId) : null
              const coach = exLib ? getExerciseCoachBlocks(exLib) : null

              return (
                <div key={rowKey} className="train-hub-ex-wrap">
                  <button
                    type="button"
                    className={`train-hub-ex-row ${expanded ? 'is-open' : ''}`}
                    onClick={() => setOpenKey(expanded ? null : rowKey)}
                  >
                    <span className="train-hub-ex-name">{row.name}</span>
                    <span className="train-hub-ex-meta">{row.right}</span>
                  </button>
                  {expanded && coach && (
                    <div className="train-hub-coach">
                      <p className="train-hub-coach-muscles">{coach.primaryMuscles}</p>
                      <p className="train-hub-coach-line">{coach.setupCue}</p>
                      <p className="train-hub-coach-line">{coach.movementCue}</p>
                      <div className="train-hub-coach-links">
                        <button
                          type="button"
                          className="train-hub-coach-link"
                          onClick={(e) => {
                            e.stopPropagation()
                            const k = `${rowKey}-m`
                            setExtraKey((x) => (x === k ? null : k))
                          }}
                        >
                          Common mistakes
                        </button>
                        <button
                          type="button"
                          className="train-hub-coach-link"
                          onClick={(e) => {
                            e.stopPropagation()
                            const k = `${rowKey}-p`
                            setExtraKey((x) => (x === k ? null : k))
                          }}
                        >
                          Progression
                        </button>
                      </div>
                      {extraKey === `${rowKey}-m` && (
                        <p className="train-hub-coach-reveal">{coach.commonMistakeOne}</p>
                      )}
                      {extraKey === `${rowKey}-p` && (
                        <div className="train-hub-coach-reveal-block">
                          <p className="train-hub-coach-reveal">{coach.progressionEasier}</p>
                          <p className="train-hub-coach-reveal">{coach.progressionHarder}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {expanded && !coach && (
                    <p className="train-hub-ex-fallback">{row.right}</p>
                  )}
                </div>
              )
            })}
          </div>
        </article>
      ))}
    </div>
  )
}
