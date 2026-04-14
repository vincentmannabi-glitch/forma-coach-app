import ProgramSessionBlocks from './ProgramSessionBlocks'
import { formatSessionTitleFromChip } from '../utils/sessionDisplay'

/**
 * One week of the program as expandable session rows.
 */
export default function RoutineWeekSessions({ weekPlan, sessionMinutes = 60 }) {
  if (!weekPlan?.days?.length) return null
  const mins = Number(sessionMinutes) > 0 ? Number(sessionMinutes) : 60

  return (
    <div className="routine-week-sessions" aria-label="Week sessions">
      {weekPlan.days.map((d) => {
        const title = formatSessionTitleFromChip(d.chipLabel)
        const blocks = (
          <ProgramSessionBlocks dayPlan={d} />
        )
        const hasBlocks = d.cardio || d.functional?.exercises?.length || d.core?.exercises?.length
        return (
          <details key={d.dateKey} className="routine-session-card forma-card">
            <summary className="routine-session-summary">
              <span className="routine-session-name">{title}</span>
              <span className="routine-session-meta">
                {d.weekdayShort} · {mins} min
              </span>
            </summary>
            <div className="routine-session-body">
              {hasBlocks ? (
                blocks
              ) : (
                <p className="routine-session-fallback forma-body">{d.strengthFocus || '—'}</p>
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}
