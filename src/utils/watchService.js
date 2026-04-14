/**
 * Smart watch integration — Apple Watch, Garmin, Fitbit.
 * When connected, app displays live HR during workouts, daily steps on home,
 * sleep data for morning check-in, and RHR/HRV trends on progress.
 * Connection is simulated; real APIs would replace this layer.
 */

const WATCH_STORAGE = 'forma_watch'
const WATCH_DATA_STORAGE = 'forma_watch_data'

export const WATCH_TYPES = ['apple', 'garmin', 'fitbit']

export function getWatchConnection() {
  try {
    const raw = localStorage.getItem(WATCH_STORAGE)
    return raw ? JSON.parse(raw) : { connected: false, type: null }
  } catch {
    return { connected: false, type: null }
  }
}

export function setWatchConnection(connected, type) {
  try {
    localStorage.setItem(WATCH_STORAGE, JSON.stringify({ connected: !!connected, type: connected ? type : null }))
  } catch {
    /* ignore */
  }
}

export function isWatchConnected() {
  return getWatchConnection().connected
}

/** Simulated live heart rate during workout (bpm). */
export function getLiveHeartRate() {
  if (!isWatchConnected()) return null
  try {
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    if (data.liveHeartRate != null) return data.liveHeartRate
    return 72 + Math.floor(Math.random() * 40)
  } catch {
    return null
  }
}

export function setLiveHeartRate(bpm) {
  try {
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    data.liveHeartRate = bpm
    localStorage.setItem(WATCH_DATA_STORAGE, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/** Simulated daily step count. */
export function getTodaySteps() {
  if (!isWatchConnected()) return null
  try {
    const dk = new Date().toISOString().slice(0, 10)
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    const steps = data.stepsByDate || {}
    return steps[dk] ?? Math.floor(3000 + Math.random() * 5000)
  } catch {
    return null
  }
}

export function setTodaySteps(count) {
  try {
    const dk = new Date().toISOString().slice(0, 10)
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    data.stepsByDate = data.stepsByDate || {}
    data.stepsByDate[dk] = count
    localStorage.setItem(WATCH_DATA_STORAGE, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/** Sleep quality for morning check-in: 'poor'|'okay'|'good'|'great'. */
export function getLastNightSleep() {
  if (!isWatchConnected()) return null
  try {
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    return data.lastNightSleep ?? null
  } catch {
    return null
  }
}

export function setLastNightSleep(quality) {
  try {
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    data.lastNightSleep = quality
    localStorage.setItem(WATCH_DATA_STORAGE, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/** Resting heart rate and HRV trends for progress screen. */
export function getRHRHRVTrends() {
  if (!isWatchConnected()) return { rhr: [], hrv: [] }
  try {
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    const rhr = data.rhrTrend || []
    const hrv = data.hrvTrend || []
    return { rhr, hrv }
  } catch {
    return { rhr: [], hrv: [] }
  }
}

export function addRHRHRVEntry(dateKey, rhr, hrv) {
  try {
    const raw = localStorage.getItem(WATCH_DATA_STORAGE)
    const data = raw ? JSON.parse(raw) : {}
    data.rhrTrend = data.rhrTrend || []
    data.hrvTrend = data.hrvTrend || []
    data.rhrTrend.push({ dateKey, value: rhr })
    data.hrvTrend.push({ dateKey, value: hrv })
    while (data.rhrTrend.length > 30) data.rhrTrend.shift()
    while (data.hrvTrend.length > 30) data.hrvTrend.shift()
    localStorage.setItem(WATCH_DATA_STORAGE, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}
