import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildSafeHomeUser, homeGreetingLine } from '../utils/homeSafeUser'
import ProgramTrainingCheckIn from '../components/ProgramTrainingCheckIn'
import {
  buildProgram,
  buildAndSaveTodaySessionFromCheckIn,
  clearTodaySessionOverride,
  getDefaultProgramProfile,
  getTodaySessionWithOverride,
  hasProgramSessions,
  loadProgramFromStorage,
  saveProgramToStorage,
} from '../utils/programBuilder'
import './Home.css'

function pickSnacks(program, n = 3) {
  const list = Array.isArray(program?.snackRecommendations) ? program.snackRecommendations.filter(Boolean) : []
  if (!list.length) return []
  return list.slice(0, n)
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
      const built = buildProgram(
        getDefaultProgramProfile({
          id: user?.id ?? 'forma_local_user',
          name: user?.name ?? 'Friend',
        }),
      )
      saveProgramToStorage(built)
      return built
    } catch {
      try {
        const fallback = buildProgram(getDefaultProgramProfile())
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

  const snacks = useMemo(() => pickSnacks(program, 3), [program])

  const envLabel =
    todaySession?.environment === 'rest'
      ? 'Recovery day'
      : todaySession?.environment === 'home'
        ? 'Home day'
        : todaySession?.environment === 'gym'
          ? 'Gym day'
          : 'Training'

  const exCount = Array.isArray(todaySession?.exercises) ? todaySession.exercises.length : 0
  const duration =
    todaySession?.estimatedDuration != null && Number.isFinite(Number(todaySession.estimatedDuration))
      ? `${todaySession.estimatedDuration} min`
      : '—'

  const sessionTitle = todaySession?.name && String(todaySession.name).trim() ? todaySession.name : 'Today’s session'

  const handleCheckIn = useCallback(
    (answers) => {
      setCheckInBusy(true)
      try {
        buildAndSaveTodaySessionFromCheckIn(program, answers, new Date())
      } catch (e) {
        console.error(e)
      } finally {
        setCheckInBusy(false)
      }
    },
    [program],
  )

  const handleSkipCheckIn = useCallback(() => {
    try {
      clearTodaySessionOverride()
    } catch {
      /* noop */
    }
  }, [])

  const goalLabel = useMemo(() => {
    const g = program?.profileSnapshot?.goal
    const map = {
      fatLoss: 'Fat loss',
      muscleBuilding: 'Muscle building',
      strength: 'Strength',
      endurance: 'Endurance',
      athletic: 'Athletic',
      hyrox: 'Athletic',
    }
    if (g && map[g]) return map[g]
    return user?.goal && String(user.goal).trim() ? user.goal : g || '—'
  }, [program?.profileSnapshot?.goal, user?.goal])
  const levelLabel = useMemo(() => {
    const lv = program?.profileSnapshot?.level ?? user?.experienceLevel ?? ''
    const pretty = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
    return pretty[lv] || lv || '—'
  }, [program?.profileSnapshot?.level, user?.experienceLevel])
  const splitLabel = program?.formulas?.frequencySplit ?? program?.weeklyVolume?.splitId ?? '—'

  return (
    <div className="home-page">
      <p className="home-greeting">{greeting}</p>
      <section className="home-zone1" style={{ marginTop: 28 }}>
        <div className="home-hero-card">
          <h2 className="home-hero-title">Today&apos;s training</h2>
          <p className="home-hero-meta home-hero-session-title">{sessionTitle}</p>
          <p className="home-hero-meta">
            {envLabel} · {duration} · {exCount} exercise{exCount === 1 ? '' : 's'}
          </p>
          <p className="home-hero-meta">
            Goal: {goalLabel} · Level: {levelLabel} · Split: {splitLabel}
          </p>
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
            <button type="button" className="home-hero-cta" onClick={() => navigate('/train/gym')}>
              Start session
            </button>
          </div>
          <ProgramTrainingCheckIn onSubmit={handleCheckIn} onSkip={handleSkipCheckIn} disabled={checkInBusy} />
        </div>
      </section>
    </div>
  )
}
