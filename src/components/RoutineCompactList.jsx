import ProgramSessionBlocks from './ProgramSessionBlocks'
import { formatSessionTitleFromChip } from '../utils/sessionDisplay'

export default function RoutineCompactList({ weekPlan, sessionMinutes = 60 }) {
  if (!weekPlan?.days?.length) return null
  const mins = Number(sessionMinutes) > 0 ? Number(sessionMinutes) : 60

  return (
    <div className="routine-compact-list">
      {weekPlan.days.map((d) => {
        const title = formatSessionTitleFromChip(d.chipLabel)
        const hasBlocks = d.cardio || d.functional?.exercises?.length || d.core?.exercises?.length
        return (
          <details key={d.dateKey} className="routine-compact-row">
            <summary className="routine-compact-summary">
              <span className="routine-compact-name">{title}</span>
              <span className="routine-compact-dur">{mins} min</span>
            </summary>
            <div className="routine-compact-body">
              {hasBlocks ? (
                <ProgramSessionBlocks dayPlan={d} />
              ) : (
                <p className="routine-compact-fallback">{d.strengthFocus || '—'}</p>
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}
