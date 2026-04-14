import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildSafeHomeUser } from '../utils/homeSafeUser'
import { getExerciseById } from '../data/exercises'
import { normalizeProgramGoal } from '../data/programGoals'
import {
  getProgramContext,
  getSessions,
  getCurrentStreak,
  getTrainingGridLast30Days,
  getPersonalRecordsDisplay,
  getPendingPRCelebration,
  clearPendingPRCelebration,
  getBiggestStrengthGainPct,
} from '../utils/workouts'
import { getMeasurements } from '../utils/measurements'
import './Progress.css'

export default function Progress() {
  const location = useLocation()
  const { profile: authProfile } = useAuth()
  const user = useMemo(() => buildSafeHomeUser(authProfile), [authProfile])
  const [tick, setTick] = useState(0)
  const [pendingPRs, setPendingPRs] = useState(null)
  const [programCtx, setProgramCtx] = useState(() => ({
    programWeek: 1,
    dayInBlock: 1,
    daysPerWeek: 3,
  }))
  const [streak, setStreak] = useState(0)
  const [grid30, setGrid30] = useState([])
  const [prMap, setPrMap] = useState({})
  const [measurements, setMeasurements] = useState([])
  const [strengthGainPct, setStrengthGainPct] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      await getSessions()
      if (cancelled) return
      const gain = getBiggestStrengthGainPct()
      const [
        pr,
        ctx,
        st,
        g30,
        prDisp,
        m,
      ] = await Promise.all([
        getPendingPRCelebration(),
        getProgramContext(user.days_per_week),
        getCurrentStreak(),
        getTrainingGridLast30Days(),
        getPersonalRecordsDisplay(),
        getMeasurements(),
      ])
      if (!cancelled) {
        setPendingPRs(pr)
        setProgramCtx(ctx)
        setStreak(st)
        setGrid30(g30?.length === 30 ? g30 : Array.from({ length: 30 }, () => false))
        setPrMap(prDisp || {})
        setMeasurements(m || [])
        setStrengthGainPct(gain)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user, tick])

  useEffect(() => {
    setTick((t) => t + 1)
  }, [location.pathname])

  useEffect(() => {
    const onFocus = () => setTick((t) => t + 1)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const prList = useMemo(() => {
    return Object.entries(prMap)
      .map(([exerciseId, v]) => {
        const ex = getExerciseById(exerciseId)
        return {
          exerciseId,
          name: ex?.name || exerciseId,
          bestWeight: v.bestWeight,
          bestReps: v.bestReps,
        }
      })
      .filter((r) => r.bestWeight > 0 || r.bestReps > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [prMap])

  const celebrationIds = useMemo(() => new Set(pendingPRs?.exerciseIds || []), [pendingPRs])

  useEffect(() => {
    if (!pendingPRs?.exerciseIds?.length) return
    const t = setTimeout(async () => {
      await clearPendingPRCelebration()
      setPendingPRs(null)
    }, 12000)
    return () => clearTimeout(t)
  }, [pendingPRs])

  const dismissCelebration = async () => {
    await clearPendingPRCelebration()
    setPendingPRs(null)
  }

  const goalCategory = normalizeProgramGoal(user?.goal)

  const weightLossKg = useMemo(() => {
    const withW = measurements
      .filter((e) => e.weight != null && Number.isFinite(e.weight))
      .map((e) => ({ ...e, t: new Date(e.date).getTime() }))
      .sort((a, b) => a.t - b.t)
    if (withW.length < 2) return null
    const first = withW[0].weight
    const last = withW[withW.length - 1].weight
    const delta = first - last
    return delta > 0 ? Math.round(delta * 10) / 10 : 0
  }, [measurements])

  const headline = useMemo(() => {
    if (goalCategory === 'fat_loss') {
      if (weightLossKg == null) return { value: '—', label: 'Total weight change', trend: null }
      return {
        value: `${weightLossKg}`,
        label: 'kg total change',
        trend: weightLossKg > 0 ? 'up' : 'flat',
      }
    }
    if (goalCategory === 'muscle') {
      const v = strengthGainPct
      if (v == null) return { value: '—', label: 'Strength gain', trend: null }
      return { value: `+${v}%`, label: 'Biggest strength gain', trend: 'up' }
    }
    return { value: `${streak}`, label: 'Day streak', trend: streak > 0 ? 'up' : 'flat' }
  }, [goalCategory, weightLossKg, strengthGainPct, streak])

  const todayIdx = 29
  const gridCells = grid30.map((trained, i) => ({
    trained,
    isToday: i === todayIdx,
  }))

  return (
    <div className="progress-page">
      <header className="progress-header">
        <h1 className="progress-title">Progress</h1>
      </header>

      {pendingPRs?.exerciseIds?.length > 0 && (
        <div className="progress-pr-banner progress-pr-banner--pop" role="status">
          <span className="progress-pr-banner-text">New records</span>
          <button type="button" className="progress-pr-dismiss" onClick={dismissCelebration}>
            Dismiss
          </button>
        </div>
      )}

      <section className="progress-hero" aria-label="Primary outcome">
        <div className="progress-hero-row">
          {headline.trend === 'up' && <span className="progress-trend progress-trend--up" aria-hidden>↑</span>}
          {headline.trend === 'flat' && headline.value !== '—' && (
            <span className="progress-trend progress-trend--flat" aria-hidden>→</span>
          )}
          <p className="progress-hero-value">{headline.value}</p>
        </div>
        <p className="progress-hero-label">{headline.label}</p>
      </section>

      <section className="progress-section" aria-label="Consistency">
        <h2 className="progress-h2">Last 30 Days</h2>
        <div className="progress-grid-30" role="img" aria-label="Training days">
          {gridCells.map((cell, i) => (
            <div
              key={i}
              className={`progress-grid-square ${cell.trained ? 'is-on' : ''} ${cell.isToday ? 'is-today' : ''}`}
            />
          ))}
        </div>
      </section>

      <section className="progress-section progress-pr-section" aria-label="Personal records">
        <h2 className="progress-h2">Personal Records</h2>
        {prList.length === 0 ? (
          <p className="progress-pr-empty">
            Complete your first session to start tracking records
          </p>
        ) : (
          <ul className="progress-pr-list">
            {prList.map((row) => {
              const isNew = celebrationIds.has(row.exerciseId)
              return (
                <li key={row.exerciseId} className={`progress-pr-row ${isNew ? 'progress-pr-row--celebrate' : ''}`}>
                  <span className="progress-pr-name">{row.name}</span>
                  <span className="progress-pr-right">
                    <span className="progress-pr-metrics">
                      {row.bestWeight > 0 ? `${row.bestWeight} kg` : '—'}
                      {row.bestReps > 0 ? ` · ${row.bestReps} reps` : ''}
                    </span>
                    {isNew && (
                      <span className="progress-pr-badge progress-pr-badge--anim" aria-label="New record">
                        PR
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
