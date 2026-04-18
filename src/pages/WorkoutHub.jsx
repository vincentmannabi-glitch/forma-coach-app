import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildSafeHomeUser } from '../utils/homeSafeUser'
import {
  buildProgram,
  getDefaultProgramProfile,
  getTodaySessionWithOverride,
  hasProgramSessions,
  loadProgramFromStorage,
  saveProgramToStorage,
} from '../utils/programBuilder'
import './WorkoutHub.css'

function sessionExercisePreview(program, entry) {
  const raw = program?.sessions?.[entry.sessionKey]
  const moves = raw?.movements || []
  if (!moves.length) return '—'
  return moves
    .slice(0, 5)
    .map((m) => m.exerciseName)
    .filter(Boolean)
    .join(' · ')
}

export default function WorkoutHub() {
  const { profile: authProfile } = useAuth()
  const user = useMemo(() => buildSafeHomeUser(authProfile), [authProfile])

  const program = useMemo(() => {
    try {
      const stored = loadProgramFromStorage()
      if (hasProgramSessions(stored)) return stored
      const built = buildProgram(getDefaultProgramProfile({ id: user.id, name: user.name }))
      saveProgramToStorage(built)
      return built
    } catch {
      return buildProgram(getDefaultProgramProfile())
    }
  }, [user.id, user.name])

  const today = useMemo(() => getTodaySessionWithOverride(program, new Date()), [program])

  const weekRows = useMemo(() => {
    const sched = program?.weeklySchedule || []
    return sched.filter((w) => w.sessionKey)
  }, [program])

  return (
    <div className="workout-hub-page">
      <header className="workout-hub-header">
        <h1 className="workout-hub-title">Train</h1>
      </header>

      <section className="workout-hub-block" aria-label="Today">
        <h2 className="workout-hub-section-label">Today</h2>
        <div className="workout-hub-today-card">
          <p className="workout-hub-today-name">{today?.name || 'Session'}</p>
          <p className="workout-hub-today-meta">
            {(today?.exercises || []).length} exercises
            {today?.estimatedDuration != null ? ` · ~${today.estimatedDuration} min` : ''}
          </p>
          <p className="workout-hub-today-preview">
            {(today?.exercises || []).slice(0, 8).map((e) => e.name || e.displayName).filter(Boolean).join(' · ')}
          </p>
          <Link to="/train/session" className="workout-hub-start-link">
            Start session →
          </Link>
        </div>
      </section>

      <section className="workout-hub-block" aria-label="This week">
        <h2 className="workout-hub-section-label">This week</h2>
        <ul className="workout-hub-week-list">
          {weekRows.map((entry) => (
            <li key={entry.sessionKey} className="workout-hub-week-item">
              <Link to="/train/session" className="workout-hub-week-row-link">
                <span className="workout-hub-week-day">{entry.day}</span>
                <span className="workout-hub-week-name">{entry.sessionName || 'Session'}</span>
                <span className="workout-hub-week-preview">{sessionExercisePreview(program, entry)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
