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
  resolveTrainSession,
  saveProgramToStorage,
} from '../utils/programBuilder'
import './WorkoutHub.css'

const ROUTES = {
  gym: '/train/gym',
  calisthenics: '/train/calisthenics',
  both: '/train/both',
  home: '/train/home',
  hyrox: '/train/hyrox',
  cardio: '/train/cardio',
}

const STYLE_META = {
  gym: { label: 'Gym', icon: '🏋️', desc: 'Barbell, machine & dumbbell training' },
  calisthenics: { label: 'Calisthenics', icon: '💪', desc: 'Bodyweight strength & skill work' },
  both: { label: 'Hybrid', icon: '⚡', desc: 'Gym and home combined' },
  home: { label: 'Home', icon: '🏠', desc: 'Dumbbell & minimal equipment' },
  hyrox: { label: 'HYROX', icon: '🔥', desc: 'Functional fitness race training' },
  cardio: { label: 'Cardio', icon: '🏃', desc: 'Endurance & conditioning' },
}

/** Fallback HYROX lineup when the built program has no finisher block yet. */
const HYROX_PROGRAM = {
  beginner: {
    structure: '4 rounds — 40s work / 20s rest',
    movements: [
      { name: 'KB Goblet Squat', reps: '10' },
      { name: 'Med ball slam', reps: '8' },
      { name: 'Banded lateral walk', reps: '10 each side' },
      { name: 'Farmers carry', reps: '20m' },
      { name: 'Push-up', reps: '10' },
      { name: 'Banded face pull', reps: '15' },
    ],
  },
  intermediate: {
    structure: '5 rounds EMOM or AMRAP 20 minutes',
    movements: [
      { name: 'Kettlebell Swing', reps: '15' },
      { name: 'Medicine ball deadball over shoulder', reps: '5 each' },
      { name: 'KB single-arm farmers carry', reps: '30m' },
      { name: 'Burpee broad jump', reps: '6' },
      { name: 'Renegade row', reps: '8 each arm' },
      { name: 'Wall ball', reps: '12' },
    ],
  },
  advanced: {
    structure: '6 rounds, minimal rest, race pace',
    movements: [
      { name: '200m row, ski erg, or 400m run', reps: '1' },
      { name: 'Kettlebell Snatch', reps: '10 each arm' },
      { name: 'Double KB front rack carry', reps: '50m' },
      { name: 'Medicine ball rotational slam', reps: '10 each side' },
      { name: 'Barbell sumo high pull', reps: '8' },
      { name: 'Overhead dumbbell walking lunge', reps: '20m' },
      { name: 'Sandbag over shoulder', reps: '6' },
    ],
  },
}

const CARDIO_SESSIONS = {
  beginner: [
    { name: 'Zone 2 Steady State', duration: '30 min', desc: 'Treadmill or bike at conversational pace — 60–70% max HR' },
    { name: 'Walk/Run Intervals', duration: '25 min', desc: '1 min jog / 2 min walk × 8 rounds' },
    { name: 'Incline Walk', duration: '30 min', desc: 'Treadmill at 8–10% incline, moderate pace' },
  ],
  intermediate: [
    { name: 'Tempo Run', duration: '35 min', desc: '10 min warmup + 20 min at comfortably hard pace + 5 min cooldown' },
    { name: 'Bike Intervals', duration: '30 min', desc: '5 rounds: 3 min hard / 2 min easy' },
    { name: 'Rowing Machine', duration: '25 min', desc: '500m on / 1 min rest × 6 rounds' },
  ],
  advanced: [
    { name: 'VO2 Max Intervals', duration: '40 min', desc: '8 × 3 min at 90% max HR / 3 min recovery' },
    { name: 'Ski Erg + Run', duration: '35 min', desc: '500m ski erg + 400m run × 5 rounds' },
    { name: 'Assault Bike Tabata', duration: '20 min', desc: '20s max effort / 10s rest × 20 rounds' },
  ],
}

const STYLE_GRID_IDS = ['gym', 'calisthenics', 'both', 'home', 'hyrox', 'cardio']

export default function WorkoutHub() {
  const { profile: authProfile } = useAuth()
  const user = useMemo(() => buildSafeHomeUser(authProfile), [authProfile])
  const level = (user?.experience_level || 'beginner').toLowerCase().includes('adv')
    ? 'advanced'
    : (user?.experience_level || '').toLowerCase().includes('int')
      ? 'intermediate'
      : 'beginner'

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

  const hyroxFromProgram = program?.sessions
    ? Object.values(program.sessions).find((s) => s?.hyroxFinisher)?.hyroxFinisher
    : null

  const hyroxProgramBlock = useMemo(() => {
    if (hyroxFromProgram?.movements?.length > 0) return hyroxFromProgram
    return HYROX_PROGRAM[level] || HYROX_PROGRAM.beginner
  }, [hyroxFromProgram, level])

  const previews = useMemo(() => {
    return Object.fromEntries(
      STYLE_GRID_IDS.map((id) => {
        if (id === 'hyrox') {
          const m = hyroxProgramBlock?.movements || []
          const preview = m
            .slice(0, 4)
            .map((x) => x.name)
            .filter(Boolean)
            .join(' · ')
          return [id, { preview: preview || '—' }]
        }
        if (id === 'cardio') {
          const list = CARDIO_SESSIONS[level] || CARDIO_SESSIONS.beginner
          const preview = list
            .slice(0, 3)
            .map((s) => s.name)
            .join(' · ')
          return [id, { preview: preview || '—' }]
        }
        const { session } = resolveTrainSession(program, id, new Date())
        const names = (session?.exercises || []).slice(0, 4).map((e) => e.name || e.displayName).filter(Boolean)
        return [id, { preview: names.join(' · ') }]
      }),
    )
  }, [program, level, hyroxProgramBlock])

  const cardioSessions = CARDIO_SESSIONS[level] || CARDIO_SESSIONS.beginner

  return (
    <div className="workout-hub-page">
      <header className="workout-hub-header">
        <h1 className="workout-hub-title">Train</h1>
      </header>

      {/* TODAY */}
      <section className="workout-hub-block" aria-label="Today">
        <h2 className="workout-hub-section-label">Today</h2>
        <div className="workout-hub-today-card">
          <p className="workout-hub-today-name">{today?.name || 'Session'}</p>
          <p className="workout-hub-today-meta">
            {(today?.exercises || []).length} exercises
            {today?.estimatedDuration != null ? ` · ~${today.estimatedDuration} min` : ''}
          </p>
          <p className="workout-hub-today-preview">
            {(today?.exercises || []).slice(0, 6).map((e) => e.name).join(' · ')}
          </p>
          <Link to="/train/gym" className="workout-hub-start-link">
            Start session →
          </Link>
        </div>
      </section>

      {/* TRAINING STYLES — all six */}
      <section className="workout-hub-block" aria-label="Training styles">
        <h2 className="workout-hub-section-label">Your program this week</h2>
        <div className="workout-hub-cards-grid">
          {STYLE_GRID_IDS.map((id) => (
            <Link key={id} to={ROUTES[id]} className="workout-hub-style-card">
              <span className="workout-hub-style-icon">{STYLE_META[id].icon}</span>
              <span className="workout-hub-style-name">{STYLE_META[id].label}</span>
              <span className="workout-hub-style-desc">{STYLE_META[id].desc}</span>
              <span className="workout-hub-style-preview">{previews[id]?.preview || '—'}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HYROX PROGRAM */}
      <section className="workout-hub-block" aria-label="HYROX">
        <h2 className="workout-hub-section-label">🔥 HYROX Program</h2>
        <div className="workout-hub-hyrox-card">
          <div className="workout-hub-hyrox-header">
            <span className="workout-hub-hyrox-badge">{level.toUpperCase()}</span>
            <span className="workout-hub-hyrox-structure">
              {hyroxProgramBlock?.structure || 'Functional fitness race training'}
            </span>
          </div>
          {hyroxProgramBlock?.movements?.length > 0 ? (
            <ul className="workout-hub-hyrox-movements">
              {hyroxProgramBlock.movements.map((m, i) => (
                <li key={i} className="workout-hub-hyrox-movement">
                  <span className="workout-hub-hyrox-move-name">{m.name}</span>
                  <span className="workout-hub-hyrox-move-reps">{m.reps}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="workout-hub-hyrox-empty">
              Complete your onboarding to unlock your personalized HYROX program.
            </p>
          )}
          <Link to={ROUTES.hyrox} className="workout-hub-start-link">
            Start HYROX session →
          </Link>
        </div>
      </section>

      {/* CARDIO PROGRAM */}
      <section className="workout-hub-block" aria-label="Cardio">
        <h2 className="workout-hub-section-label">🏃 Cardio Program</h2>
        <div className="workout-hub-cardio-list">
          {cardioSessions.map((session, i) => (
            <div key={i} className="workout-hub-cardio-card">
              <div className="workout-hub-cardio-top">
                <span className="workout-hub-cardio-name">{session.name}</span>
                <span className="workout-hub-cardio-duration">{session.duration}</span>
              </div>
              <p className="workout-hub-cardio-desc">{session.desc}</p>
            </div>
          ))}
        </div>
        <Link to={ROUTES.cardio} className="workout-hub-start-link">
          Start cardio session →
        </Link>
      </section>
    </div>
  )
}
