/**
 * Workout session tracking. Data stored in localStorage.
 */

import { getCurrentUser } from './auth'
import { dateKeyLocal } from './foodLog'
import { mapExperienceToTrainLevel } from './experienceLevel'
import { exerciseLoadRegion, getSuggestedStartKgForLevel } from './exerciseCardContent'
import {
  ensureProgramLoaded,
  getProgramContextForWorkouts,
} from './programBuilder.js'

let _sessionsCache = []

async function getUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
}

function storageKey(userId) {
  return `forma_sessions_${userId}`
}

function loadSessionsRaw(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessionsRaw(userId, sessions) {
  if (!userId) return
  localStorage.setItem(storageKey(userId), JSON.stringify(sessions))
}

/**
 * @returns {Promise<Array>}
 */
export async function getSessions() {
  const userId = await getUserId()
  if (!userId) return []

  const raw = loadSessionsRaw(userId)
  const sessions = (raw || []).map((row) => ({
    sessionId: row.id,
    sessionName: row.session_name,
    completedAt: row.completed_at || row.date,
    workoutType: row.workout_type,
    exercises: (row.exercises_completed || []).map((ex) => ({
      exerciseId: ex.exerciseId,
      displayName: ex.displayName,
      sets: ex.sets || [],
    })),
    programWeek: row.program_week,
  }))
  sessions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  _sessionsCache = sessions
  return sessions
}

/** Sync access to cached sessions. Call getSessions() first to populate. */
export function getSessionsSync() {
  return _sessionsCache
}

export function getLastSessionExerciseLogSync(exerciseId) {
  const sessions = getSessionsSync()
  for (const s of sessions) {
    const ex = s.exercises?.find((e) => e.exerciseId === exerciseId)
    if (ex?.sets?.length) {
      return { completedAt: s.completedAt, sets: ex.sets }
    }
  }
  return null
}

export function getLastSessionBestWeightKg(exerciseId) {
  const log = getLastSessionExerciseLogSync(exerciseId)
  if (!log?.sets?.length) return null
  let best = 0
  log.sets.forEach((s) => {
    if (!s.completed) return
    const w = parseFloat(s.weight)
    if (Number.isFinite(w) && w > best) best = w
  })
  return best > 0 ? best : null
}

/** e.g. "40 kg × 10 reps" */
export function formatLastSessionLine(exerciseId) {
  const last = getLastSessionExerciseLogSync(exerciseId)
  if (!last?.sets?.length) return null
  const completed = last.sets.filter((s) => s.completed)
  if (!completed.length) return null
  const weights = completed.map((s) => parseFloat(s.weight)).filter(Number.isFinite)
  const reps = completed.map((s) => parseInt(s.reps, 10)).filter(Number.isFinite)
  const w = weights.length ? Math.max(...weights) : null
  const r = reps.length ? Math.round(reps.reduce((a, b) => a + b, 0) / reps.length) : null
  if (w != null && r != null) return `${w} kg × ${r} reps`
  if (w != null) return `${w} kg`
  return null
}

export function getBestCompletedWeightSync(exerciseId) {
  let best = 0
  getSessionsSync().forEach((s) => {
    const ex = s.exercises?.find((e) => e.exerciseId === exerciseId)
    ex?.sets?.forEach((st) => {
      if (!st.completed) return
      const x = parseFloat(st.weight)
      if (Number.isFinite(x) && x > best) best = x
    })
  })
  return best
}

function sessionHitTopOfRepRange(exercise, sets) {
  const maxR = exercise?.repRange?.[1] ?? 12
  if (!sets?.length) return false
  return sets.every((s) => s.completed && parseInt(s.reps, 10) >= maxR)
}

/** Rule of two: last two logged sessions both hit top of rep range for all sets. */
export function twoConsecutiveSessionsHitTopRepRange(exercise, exerciseId) {
  const sessions = getSessionsSync()
  const rows = []
  for (const s of sessions) {
    const ex = s.exercises?.find((e) => e.exerciseId === exerciseId)
    if (ex?.sets?.length) rows.push(ex.sets)
    if (rows.length >= 2) break
  }
  if (rows.length < 2) return false
  return sessionHitTopOfRepRange(exercise, rows[0]) && sessionHitTopOfRepRange(exercise, rows[1])
}

/**
 * Upper body: +2.5 kg. Lower body (squat, hinge, single-leg, calves, etc.): +5 kg.
 * @param {number|string} lastWeight
 * @param {object} [exercise]
 */
export function getNextProgressionWeightKg(lastWeight, exercise) {
  const w = parseFloat(lastWeight)
  if (!Number.isFinite(w) || w <= 0) return null
  const region = exercise ? exerciseLoadRegion(exercise) : 'upper'
  const inc = region === 'lower' ? 5 : 2.5
  return Math.round((w + inc) * 10) / 10
}

export function getSuggestedStartingWeightKg(exercise, user) {
  const sw = exercise?.startingWeight
  if (typeof sw === 'string') {
    const rangeKg = sw.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*kg/i)
    if (rangeKg) {
      return Math.round(((parseFloat(rangeKg[1]) + parseFloat(rangeKg[2])) / 2) * 10) / 10
    }
    const oneKg = sw.match(/(\d+(?:\.\d+)?)\s*kg/i)
    if (oneKg) return parseFloat(oneKg[1])
    const perHand = sw.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*kg.*per hand/i)
    if (perHand) {
      return Math.round((parseFloat(perHand[1]) + parseFloat(perHand[2])) * 10) / 10
    }
  }
  const level = mapExperienceToTrainLevel(user?.experience_level)
  return getSuggestedStartKgForLevel(exercise, level)
}

/**
 * Save a completed workout session.
 * @param {Object} session - { sessionId, sessionName, completedAt, exercises, workoutType }
 */
export async function saveSession(session) {
  const userId = await getUserId()
  if (!userId) return

  const date = new Date(session.completedAt || Date.now())
  const dateStr = date.toISOString().slice(0, 10)
  const exercisesPayload = (session.exercises || []).map((ex) => ({
    exerciseId: ex.exerciseId,
    displayName: ex.displayName || ex.exerciseId,
    sets: ex.sets || [],
  }))

  const totalVolume = calculateSessionVolume(session.exercises)
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  const raw = loadSessionsRaw(userId)
  const newRow = {
    id,
    date: dateStr,
    session_name: session.sessionName,
    workout_type: session.workoutType,
    exercises_completed: exercisesPayload,
    total_volume: totalVolume,
    completed_at: session.completedAt || new Date().toISOString(),
    program_week: session.programWeek,
  }
  raw.unshift(newRow)
  saveSessionsRaw(userId, raw)
  _sessionsCache = []
}

/**
 * @param {string} exerciseId
 */
export async function getSessionsForExercise(exerciseId) {
  const sessions = await getSessions()
  const entries = []
  sessions.forEach((s) => {
    const ex = s.exercises?.find((e) => e.exerciseId === exerciseId)
    if (ex) {
      entries.push({ completedAt: s.completedAt, sets: ex.sets })
    }
  })
  return entries.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
}

function wasSessionEasy(exercise, sets) {
  const minReps = exercise.repRange?.[0] ?? 1
  const allCompleted = sets.every((s) => s.completed)
  const allHitTarget = sets.every((s) => (s.reps ?? 0) >= minReps)
  return allCompleted && allHitTarget
}

function didUserStruggle(exercise, sets) {
  const minReps = exercise.repRange?.[0] ?? 1
  const anyIncomplete = sets.some((s) => !s.completed)
  const lowRepSets = sets.filter((s) => (s.reps ?? 0) < minReps).length
  return anyIncomplete || lowRepSets >= 2
}

/**
 * @param {string} exerciseId
 * @param {object} exercise
 */
export async function getSuggestionForExercise(exerciseId, exercise) {
  const recentSessions = (await getSessionsForExercise(exerciseId)).slice(0, 4)

  const easySessions = recentSessions.filter((s) => wasSessionEasy(exercise, s.sets))
  const struggleSessions = recentSessions.filter((s) => didUserStruggle(exercise, s.sets))

  if (easySessions.length >= 2) {
    const lastTwo = recentSessions.slice(0, 2)
    if (lastTwo.every((s) => wasSessionEasy(exercise, s.sets))) {
      return {
        type: 'progression',
        message: `You've completed all sets comfortably for 2 sessions. Ready to add weight or try the next variation?`,
      }
    }
  }

  if (struggleSessions.length >= 2) {
    const lastTwo = recentSessions.slice(0, 2)
    if (lastTwo.every((s) => didUserStruggle(exercise, s.sets))) {
      return {
        type: 'regression',
        message: `You've struggled for 2 sessions. Consider reducing weight or trying the easier variation.`,
      }
    }
  }

  return null
}

export async function getLastWeightForExercise(exerciseId) {
  const entries = await getSessionsForExercise(exerciseId)
  const last = entries[0]
  if (!last?.sets?.length) return null
  const withWeight = last.sets.find((s) => s.weight != null && s.weight !== '')
  return withWeight?.weight ?? null
}

export async function getTotalSessionsCompleted() {
  const sessions = await getSessions()
  const byDate = new Set()
  sessions.forEach((s) => {
    const d = new Date(s.completedAt).toDateString()
    byDate.add(d)
  })
  return byDate.size
}

export async function getSessionCount() {
  const sessions = await getSessions()
  return sessions.length
}

/** Sync - uses cache. */
export function getSessionCountSync() {
  return _sessionsCache.length
}

export function calculateSessionVolume(exercises) {
  let total = 0
  exercises?.forEach((ex) => {
    ex.sets?.forEach((s) => {
      if (!s.completed) return
      const w = parseFloat(s.weight)
      const r = parseInt(s.reps, 10)
      if (!Number.isNaN(w) && !Number.isNaN(r) && w >= 0 && r > 0) {
        total += w * r
      }
    })
  })
  return Math.round(total * 10) / 10
}

export async function getProgramContext(daysPerWeek = 3) {
  await getSessions()
  const program = ensureProgramLoaded()
  return getProgramContextForWorkouts(program, daysPerWeek)
}

/** Sync — uses forma_user_program (session cache only for other workout.js helpers). */
export function getProgramContextSync(daysPerWeek = 3) {
  const program = ensureProgramLoaded()
  return getProgramContextForWorkouts(program, daysPerWeek)
}

const PR_PENDING_KEY = 'forma_pr_pending'

async function prStorageKey() {
  const userId = await getUserId()
  return userId ? `${PR_PENDING_KEY}_${userId}` : null
}

export async function getTotalVolumeLifted() {
  const sessions = await getSessions()
  let total = 0
  sessions.forEach((s) => {
    total += calculateSessionVolume(s.exercises)
  })
  return Math.round(total * 10) / 10
}

export async function getCurrentStreak() {
  const sessions = await getSessions()
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
}

/** Sync - uses cache. */
export function getCurrentStreakSync() {
  const sessions = _sessionsCache
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
}

export async function getDaysTrainedThisMonth() {
  const sessions = await getSessions()
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const set = new Set()
  sessions.forEach((s) => {
    const d = new Date(s.completedAt)
    if (d.getFullYear() === y && d.getMonth() === m) {
      d.setHours(0, 0, 0, 0)
      set.add(d.getTime())
    }
  })
  return set.size
}

export async function getTrainingGridLast30Days() {
  const sessions = await getSessions()
  const trained = new Set()
  sessions.forEach((s) => {
    const d = new Date(s.completedAt)
    d.setHours(0, 0, 0, 0)
    trained.add(d.getTime())
  })
  const out = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    out.push(trained.has(d.getTime()))
  }
  return out
}

/**
 * @param {Array} sessions
 */
export function computePersonalRecordsFromSessions(sessions) {
  const pr = {}
  sessions.forEach((session) => {
    session.exercises?.forEach((ex) => {
      const id = ex.exerciseId
      if (!id) return
      if (!pr[id]) pr[id] = { bestWeight: 0, bestReps: 0 }
      ex.sets?.forEach((set) => {
        if (!set.completed) return
        const w = parseFloat(set.weight)
        const r = parseInt(set.reps, 10)
        if (Number.isFinite(w) && w > 0) {
          pr[id].bestWeight = Math.max(pr[id].bestWeight, w)
        }
        if (Number.isFinite(r) && r > 0) {
          pr[id].bestReps = Math.max(pr[id].bestReps, r)
        }
      })
    })
  })
  return pr
}

export async function detectNewPRsAfterSessionSave() {
  const sessions = await getSessions()
  if (sessions.length < 1) return
  const after = computePersonalRecordsFromSessions(sessions)
  const before = computePersonalRecordsFromSessions(sessions.slice(0, -1))
  const exerciseIds = new Set()
  const ids = new Set([...Object.keys(before), ...Object.keys(after)])
  ids.forEach((id) => {
    const a = after[id] || { bestWeight: 0, bestReps: 0 }
    const b = before[id] || { bestWeight: 0, bestReps: 0 }
    if (a.bestWeight > b.bestWeight || a.bestReps > b.bestReps) {
      exerciseIds.add(id)
    }
  })
  const key = await prStorageKey()
  if (key && exerciseIds.size > 0 && typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify({ exerciseIds: [...exerciseIds], at: Date.now() }))
  }
}

export async function getPendingPRCelebration() {
  const key = await prStorageKey()
  if (!key || typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.exerciseIds?.length) return null
    return data
  } catch {
    return null
  }
}

export async function clearPendingPRCelebration() {
  const key = await prStorageKey()
  if (key && typeof localStorage !== 'undefined') localStorage.removeItem(key)
}

export async function getPersonalRecordsDisplay() {
  const sessions = await getSessions()
  return computePersonalRecordsFromSessions(sessions)
}

function startOfWeekSunday(d) {
  const x = new Date(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Date keys (YYYY-MM-DD) with at least one completed session. Uses session cache. */
export function getTrainedDateKeysSync() {
  const set = new Set()
  getSessionsSync().forEach((s) => {
    set.add(dateKeyLocal(new Date(s.completedAt)))
  })
  return set
}

/** Completed sessions whose local date falls in the current Sun–Sat week. */
export function getSessionsCompletedThisCalendarWeek() {
  const start = startOfWeekSunday(new Date())
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  let c = 0
  getSessionsSync().forEach((s) => {
    const d = new Date(s.completedAt)
    if (d >= start && d < end) c += 1
  })
  return c
}

/**
 * Largest % increase in best weight for any exercise from first half of training history vs current PRs.
 */
export function getBiggestStrengthGainPct() {
  const sessions = [...getSessionsSync()].sort(
    (a, b) => new Date(a.completedAt) - new Date(b.completedAt),
  )
  if (sessions.length < 2) return null
  const mid = Math.max(1, Math.floor(sessions.length / 2))
  const early = sessions.slice(0, mid)
  const prEarly = computePersonalRecordsFromSessions(early)
  const prAll = computePersonalRecordsFromSessions(sessions)
  let best = 0
  Object.keys(prAll).forEach((id) => {
    const wNow = prAll[id]?.bestWeight || 0
    const wWas = prEarly[id]?.bestWeight || 0
    if (wWas > 0 && wNow > wWas) {
      const pct = ((wNow - wWas) / wWas) * 100
      if (pct > best) best = pct
    }
  })
  return best > 0 ? Math.round(best * 10) / 10 : null
}

/** Heaviest weight (kg) logged on any completed set this calendar week. */
export function getBestLiftWeightThisWeek() {
  const start = startOfWeekSunday(new Date())
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  let best = 0
  getSessionsSync().forEach((s) => {
    const d = new Date(s.completedAt)
    if (d < start || d >= end) return
    s.exercises?.forEach((ex) => {
      ex.sets?.forEach((set) => {
        if (!set.completed) return
        const w = parseFloat(set.weight)
        if (Number.isFinite(w) && w > best) best = w
      })
    })
  })
  return best
}
