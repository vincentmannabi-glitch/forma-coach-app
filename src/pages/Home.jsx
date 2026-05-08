import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildSafeHomeUser, homeGreetingLine } from '../utils/homeSafeUser'
import ProgramTrainingCheckIn from '../components/ProgramTrainingCheckIn'
import {
  buildProgram,
  buildAndSaveTodaySessionFromCheckIn,
  clearTodaySessionOverride,
  formatSplit,
  getDefaultProgramProfile,
  getTodaySessionWithOverride,
  hasProgramSessions,
  loadProgramFromStorage,
  normalizeUserProfileForProgram,
  saveProgramToStorage,
} from '../utils/programBuilder'
import './Home.css'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatGoalLabel(rawGoal) {
  const key = String(rawGoal || '').trim()
  const map = {
    fatLoss: 'Fat Loss',
    muscleBuilding: 'Muscle Building',
    strength: 'Strength',
    endurance: 'Endurance',
    athletic: 'Athletic',
  }
  if (map[key]) return map[key]
  const lower = key.toLowerCase()
  if (lower.includes('muscle')) return 'Muscle Building'
  if (lower.includes('fat') || lower.includes('lose')) return 'Fat Loss'
  return key || '—'
}

function formatSplitLabel(rawSplit) {
  const key = String(rawSplit || '').trim()
  const map = {
    fullBody: 'Full Body',
    upperLower: 'Upper / Lower',
    pushPullLegs: 'Push / Pull / Legs',
    calisthenics: 'Calisthenics',
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    upper: 'Upper',
    lower: 'Lower',
    generalHealth: 'General Health',
  }
  if (map[key]) return map[key]
  return key ? key.replace(/([A-Z])/g, ' $1').trim() : '—'
}

function pickSnacks(program, n = 3) {
  const list = Array.isArray(program?.snackRecommendations) ? program.snackRecommendations.filter(Boolean) : []
  if (!list.length) return []
  return list.slice(0, n)
}

function hasCompletedAtLeastOneWorkout(userId, program) {
  try {
    if (userId) {
      const raw = localStorage.getItem(`forma_sessions_${userId}`)
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed) && parsed.length > 0) return true
    }
  } catch {
    /* noop */
  }
  return Array.isArray(program?.sessionHistory) && program.sessionHistory.length > 0
}

/** Find the next scheduled training session from today */
function getNextTrainingSession(program) {
  if (!program?.weeklySchedule || !program?.sessions) return null
  const today = new Date()
  const todayIndex = today.getDay()

  // Search up to 7 days forward for the next training day
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (todayIndex + i) % 7
    const nextDayName = DAY_NAMES[nextDayIndex]
    const entry = program.weeklySchedule.find((d) => d.day === nextDayName && d.sessionKey)
    if (entry?.sessionKey && program.sessions[entry.sessionKey]) {
      const raw = program.sessions[entry.sessionKey]
      const exercises = (raw.movements || []).map((m, idx) => ({
        id: m.exerciseId || m.id || `ex-${idx}`,
        name: m.exerciseName || m.name || '',
        displayName: m.exerciseName || m.name || '',
        sets: m.sets,
        repRange: m.repRange,
        restSeconds: m.restSeconds,
      }))
      return {
        name: entry.sessionName || raw.name || `${nextDayName} session`,
        day: nextDayName,
        daysFromNow: i,
        environment: raw.environment || 'gym',
        exercises,
        estimatedDuration: raw.estimatedDuration,
        warmUp: raw.warmUp,
        coolDown: raw.coolDown,
      }
    }
  }
  return null
}

export default function Home() {
  const navigate = useNavigate()
  const { profile: authProfile } = useAuth()
  const [checkInBusy, setCheckInBusy] = useState(false)

  const user = useMemo(() => {
    try {
      return buildSafeHomeUser(authProfile)
    } catch {
      return buildSafeHomeUser(null)
    }
  }, [authProfile])

  const greeting = useMemo(() => {
    try {
      return homeGreetingLine(user?.name)
    } catch {
      return 'Hello, Friend'
    }
  }, [user?.name])

  const program = useMemo(() => {
    try {
      const stored = loadProgramFromStorage()
      if (hasProgramSessions(stored)) return stored
      const storedProfileRaw = localStorage.getItem('forma_user_profile')
      const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : {}
      const fullUserProfile = normalizeUserProfileForProgram({
        ...getDefaultProgramProfile({
          id: user?.id ?? 'forma_local_user',
          name: user?.name ?? 'Friend',
        }),
        ...storedProfile,
      })
      const built = buildProgram(fullUserProfile)
      saveProgramToStorage(built)
      return built
    } catch {
      try {
        const storedProfileRaw = localStorage.getItem('forma_user_profile')
        const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : {}
        const fallback = buildProgram(normalizeUserProfileForProgram({ ...getDefaultProgramProfile(), ...storedProfile }))
        saveProgramToStorage(fallback)
        return fallback
      } catch {
        return {
          profileSnapshot: { goal: 'fatLoss', level: 'beginner', name: 'Friend', style: 'gym', daysPerWeek: 3 },
          snackRecommendations: [],
          nutritionPhilosophy: '',
          weeklySchedule: [],
          sessions: {},
        }
      }
    }
  }, [user?.id, user?.name])

  const todaySession = useMemo(() => {
    try {
      return getTodaySessionWithOverride(program, new Date())
    } catch {
      return { name: 'Training', environment: 'gym', exercises: [], estimatedDuration: null }
    }
  }, [program])

  const isRestDay = todaySession?.environment === 'rest' || (Array.isArray(todaySession?.exercises) && todaySession.exercises.length === 0 && todaySession?.environment !== 'gym' && todaySession?.environment !== 'home')
  const hasCompletedWorkout = useMemo(() => hasCompletedAtLeastOneWorkout(user?.id, program), [user?.id, program])
  const showWelcomeSchedule = isRestDay && !hasCompletedWorkout

  const nextSession = useMemo(() => {
    if (!isRestDay) return null
    return getNextTrainingSession(program)
  }, [isRestDay, program])

  const displaySession = isRestDay && nextSession ? nextSession : todaySession

  const snacks = useMemo(() => pickSnacks(program, 3), [program])

  const exCount = Array.isArray(displaySession?.exercises) ? displaySession.exercises.length : 0
  const durationMinutes = Number(displaySession?.estimatedDuration ?? displaySession?.sessionDuration ?? program?.sessionMinutes)
  const duration =
    Number.isFinite(durationMinutes) && durationMinutes > 0
      ? `${durationMinutes} min`
      : '—'

  const sessionTitle = useMemo(() => {
    if (isRestDay && nextSession) {
      const label = nextSession.daysFromNow === 1 ? 'Tomorrow' : `${nextSession.day}`
      return `Next session — ${label}`
    }
    return displaySession?.name && String(displaySession.name).trim() ? displaySession.name : 'Today\'s session'
  }, [isRestDay, nextSession, displaySession])

  const handleCheckIn = useCallback(
    (answers) => {
      setCheckInBusy(true)
      try {
        buildAndSaveTodaySessionFromCheckIn(program, answers, new Date())
        navigate('/train/session')
      } catch (e) {
        console.error(e)
      } finally {
        setCheckInBusy(false)
      }
    },
    [program, navigate],
  )

  const handleSkipCheckIn = useCallback(() => {
    try {
      clearTodaySessionOverride()
    } catch {
      /* noop */
    }
  }, [])

  const goalLabel = useMemo(() => {
    const programGoal = formatGoalLabel(program?.profileSnapshot?.goal)
    const userGoal = formatGoalLabel(user?.goal)
    if (userGoal !== '—') return userGoal
    return programGoal
  }, [program?.profileSnapshot?.goal, user?.goal])

  const levelLabel = useMemo(() => {
    const lv = program?.profileSnapshot?.level ?? user?.experienceLevel ?? ''
    const pretty = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
    return pretty[lv] || lv || '—'
  }, [program?.profileSnapshot?.level, user?.experienceLevel])

  const splitLabel = formatSplit(program?.split || '') || '—'

  return (
    <div className="home-page">
      <p className="home-greeting">{greeting}</p>
      <section className="home-zone1" style={{ marginTop: 28 }}>
        <div className="home-hero-card">
          <h2 className="home-hero-title">
            {showWelcomeSchedule ? 'Welcome to your training week' : isRestDay ? 'Recovery day' : 'Today\'s training'}
          </h2>
          <p className="home-hero-meta home-hero-session-title">{sessionTitle}</p>
          <p className="home-hero-meta">
            {duration} · {exCount} exercise{exCount === 1 ? '' : 's'}
          </p>
          <p className="home-hero-meta">
            Goal: {goalLabel} · Level: {levelLabel} · Split: {splitLabel}
          </p>
          {showWelcomeSchedule && (
            <p className="home-hero-meta" style={{ opacity: 0.85 }}>
              Today is a rest day, so here is your full weekly schedule to get started.
            </p>
          )}
          {!showWelcomeSchedule && isRestDay && (
            <p className="home-hero-meta" style={{ opacity: 0.6, fontSize: '0.85rem' }}>
              Rest and recover today — your next session is previewed above.
            </p>
          )}
          {showWelcomeSchedule ? (
            <div className="home-snack-block">
              <p className="home-snack-label">Your weekly schedule</p>
              <ul className="home-snack-list">
                {(program?.weeklySchedule || []).map((entry) => (
                  <li key={`${entry.day}-${entry.sessionKey || 'rest'}`}>
                    {entry.day}: {entry.sessionKey ? (entry.sessionName || 'Training session') : 'Recovery'}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {program?.nutritionPhilosophy ? (
            <p className="home-hero-meta home-nutrition-line">{program.nutritionPhilosophy}</p>
          ) : null}
          {snacks.length > 0 ? (
            <div className="home-snack-block">
              <p className="home-snack-label">Smart snacks</p>
              <ul className="home-snack-list">
                {snacks.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="home-hero-actions">
            <button type="button" className="home-hero-cta" onClick={() => navigate('/train/session')}>
              {showWelcomeSchedule ? 'View session details' : isRestDay ? 'View next session' : 'Start session'}
            </button>
          </div>
          {!showWelcomeSchedule && !isRestDay && (
            <ProgramTrainingCheckIn onSubmit={handleCheckIn} onSkip={handleSkipCheckIn} disabled={checkInBusy} />
          )}
        </div>
      </section>
    </div>
  )
}
