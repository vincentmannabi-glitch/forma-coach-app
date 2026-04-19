import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildSafeHomeUser } from '../utils/homeSafeUser'
import {
  getDefaultProgramProfile,
  getTodaySessionWithOverride,
  hasProgramSessions,
  loadProgramFromStorage,
  saveProgramToStorage,
} from '../utils/programBuilder'
import { buildProgramForProfile } from '../utils/programBuilderRouter'
import './WorkoutHub.css'

function sessionExercisePreview(program, entry) {
  const raw = program?.sessions?.[entry.sessionKey]
  const moves = raw?.movements || []
  if (!moves.length) return '—'
  return moves
    .slice(0, 5)
    .map((m) => m.exerciseName || m.name)
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
      const fallbackProfile = {
        ...getDefaultProgramProfile({ id: user.id, name: user.name }),
        ...authProfile,
      }
      const built = buildProgramForProfile(fallbackProfile)
      saveProgramToStorage(built)
      return built
    } catch {
      return buildProgramForProfile(getDefaultProgramProfile())
    }
  }, [user.id, user.name, authProfile])

  const today = useMemo(() => {
    const resolved = getTodaySessionWithOverride(program, new Date())
    if ((resolved?.exercises || []).length > 0) return resolved
    const key = resolved?.sessionKey
    if (!key) return resolved
    const raw = program?.sessions?.[key]
    const moves = raw?.movements || []
    return {
      ...resolved,
      exercises: moves.map((m, i) => ({
        id: m.exerciseId || m.id || `ex-${i}`,
        name: m.exerciseName || m.name || '',
        displayName: m.exerciseName || m.displayName || m.name || '',
        sets: m.sets,
        repRange: m.repRange,
      })),
    }
  }, [program])

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
