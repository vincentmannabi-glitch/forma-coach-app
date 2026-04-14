import { getCurrentUser } from './auth'

async function getUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
}

function storageKey(userId) {
  return `forma_checkins_${userId}`
}

function loadRaw(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRaw(userId, list) {
  if (!userId) return
  localStorage.setItem(storageKey(userId), JSON.stringify(list))
}

export async function loadCheckIns() {
  const userId = await getUserId()
  if (!userId) return []

  const raw = loadRaw(userId)
  return raw.map((row) => ({
    id: row.id,
    at: row.created_at,
    dateKey: row.date,
    sleep: row.sleep_quality,
    body: row.body_feeling,
    soreRegion: row.soreness_location,
    soreSide: row.soreness_side,
    soreLevel: row.soreness_level,
    injuryDuration: row.injury_duration,
    rehabPhase: row.session_adjusted?.rehabPhase,
    homeHarmony: row.home_harmony,
  })).sort((a, b) => (b.dateKey || '').localeCompare(a.dateKey || ''))
}

export async function saveMorningCheckIn(entry) {
  const userId = await getUserId()
  if (!userId) return

  const dateKey = entry.dateKey || entry.date
  if (!dateKey) return

  const raw = loadRaw(userId)
  const existing = raw.findIndex((r) => r.date === dateKey)
  const row = {
    id: existing >= 0 ? raw[existing].id : `checkin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    user_id: userId,
    created_at: new Date().toISOString(),
    date: dateKey,
    sleep_quality: entry.sleep,
    body_feeling: entry.body,
    soreness_location: entry.soreRegion,
    soreness_side: entry.soreSide,
    soreness_level: entry.soreLevel,
    injury_reported: entry.body === 'injury',
    injury_duration: entry.injuryDuration,
    session_adjusted: { rehabPhase: entry.rehabPhase },
    home_harmony: entry.homeHarmony,
  }
  if (existing >= 0) {
    raw[existing] = row
  } else {
    raw.push(row)
  }
  saveRaw(userId, raw)
}

export async function getCheckInForDateKey(dateKey) {
  const list = await loadCheckIns()
  return list.find((c) => c.dateKey === dateKey) || null
}
