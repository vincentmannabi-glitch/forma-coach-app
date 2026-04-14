import { useState, useEffect, useCallback } from 'react'
import {
  getDailyTotals,
  computeWeeklyNutritionSummary,
  getLastShownSummaryWeek,
  setLastShownSummaryWeek,
  getLastEodShownDateKey,
  setLastEodShownDateKey,
  dateKeyLocal,
} from '../utils/foodLog'
import { buildEndOfDaySummary } from '../utils/dailyNutritionCoach'

export function useDailyTotals(dateKey) {
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDailyTotals(dateKey).then((t) => {
      if (!cancelled) {
        setTotals(t || { calories: 0, protein: 0, carbs: 0, fat: 0 })
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [dateKey])

  const refresh = useCallback(() => {
    getDailyTotals(dateKey).then(setTotals)
  }, [dateKey])

  return { totals, loading, refresh }
}

export function useWeeklySummary(targets, nutritionTrackerOn, tick, uid) {
  const [weeklySummary, setWeeklySummary] = useState(null)

  useEffect(() => {
    if (!targets?.calories || !nutritionTrackerOn) {
      setWeeklySummary(null)
      return
    }
    let cancelled = false
    computeWeeklyNutritionSummary(targets).then((s) => {
      if (!cancelled) setWeeklySummary(s)
    })
    return () => { cancelled = true }
  }, [targets, nutritionTrackerOn, tick])

  const lastShown = uid ? getLastShownSummaryWeek(uid) : null
  const showWeeklyCard =
    weeklySummary &&
    nutritionTrackerOn &&
    new Date().getDay() === 0 &&
    lastShown !== weeklySummary.weekStart

  const dismissWeekly = useCallback(
    (weekStartKey) => {
      if (uid) setLastShownSummaryWeek(weekStartKey, uid)
    },
    [uid]
  )

  return { weeklySummary, showWeeklyCard, dismissWeekly }
}

export function useEodSummary(user, dailyProtein, tick, nowTick, uid) {
  const [eodSummary, setEodSummary] = useState(null)

  useEffect(() => {
    if (!user || dailyProtein == null) {
      setEodSummary(null)
      return
    }
    let cancelled = false
    async function load() {
      const last = uid ? getLastEodShownDateKey(uid) : null
      const tk = dateKeyLocal()
      const h = new Date().getHours()

      if (h >= 21 && last !== tk) {
        const t = await getDailyTotals(tk)
        if (!cancelled) setEodSummary(buildEndOfDaySummary(user, t.protein, tk) || null)
        return
      }
      if (h < 12) {
        const y = new Date()
        y.setDate(y.getDate() - 1)
        const yk = dateKeyLocal(y)
        if (last !== yk) {
          const t = await getDailyTotals(yk)
          if (!cancelled && (t.protein > 0 || t.calories > 0)) {
            setEodSummary(buildEndOfDaySummary(user, t.protein, yk) || null)
            return
          }
        }
      }
      if (!cancelled) setEodSummary(null)
    }
    load()
    return () => { cancelled = true }
  }, [user, dailyProtein, tick, nowTick, uid])

  const dismissEod = useCallback(
    (dateKey) => {
      if (uid) setLastEodShownDateKey(dateKey, uid)
    },
    [uid]
  )

  return { eodSummary, dismissEod }
}
