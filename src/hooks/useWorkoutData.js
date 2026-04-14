import { useState, useEffect, useCallback } from 'react'
import * as workouts from '../utils/workouts'
import { ensureProgramLoaded, getProgramContextForWorkouts } from '../utils/programBuilder.js'

/** Hook to load and cache workout data. Refreshes when refresh() is called (e.g. after saveSession). */
export function useWorkoutData(daysPerWeek = 3) {
  const [sessions, setSessions] = useState([])
  const [programCtx, setProgramCtx] = useState(null)
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const s = await workouts.getSessions()
    setSessions(s)
    const p = ensureProgramLoaded()
    setProgram(p)
    setProgramCtx(getProgramContextForWorkouts(p, daysPerWeek))
    setLoading(false)
  }, [daysPerWeek])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const s = await workouts.getSessions()
      if (cancelled) return
      setSessions(s)
      const p = ensureProgramLoaded()
      if (cancelled) return
      setProgram(p)
      setProgramCtx(getProgramContextForWorkouts(p, daysPerWeek))
      if (cancelled) return
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [daysPerWeek])

  return {
    sessions,
    program,
    programCtx,
    loading,
    refresh,
    getSessionCount: () => sessions.length,
    getCurrentStreak: () => {
      const trained = new Set()
      sessions.forEach((s) => {
        const d = new Date(s.completedAt)
        d.setHours(0, 0, 0, 0)
        trained.add(d.getTime())
      })
      if (trained.size === 0) return 0
      let cursor = new Date()
      cursor.setHours(0, 0, 0, 0)
      const today = cursor.getTime()
      const yesterday = today - 86400000
      if (!trained.has(today)) {
        if (!trained.has(yesterday)) return 0
        cursor = new Date(yesterday)
      }
      let streak = 0
      while (trained.has(cursor.getTime())) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
      }
      return streak
    },
    getTotalSessionsCompleted: () => {
      const byDate = new Set()
      sessions.forEach((s) => byDate.add(new Date(s.completedAt).toDateString()))
      return byDate.size
    },
    computePersonalRecordsFromSessions: () => workouts.computePersonalRecordsFromSessions(sessions),
  }
}
