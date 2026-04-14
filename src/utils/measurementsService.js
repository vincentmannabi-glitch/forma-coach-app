import { getCurrentUser } from './auth'

async function getUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
}

function storageKey(userId) {
  return `forma_measurements_${userId}`
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

export async function getMeasurements() {
  const userId = await getUserId()
  if (!userId) return []

  const raw = loadRaw(userId)
  return raw.map((row) => ({
    id: row.id,
    date: row.date,
    weight: row.bodyweight,
    chest: row.chest,
    waist: row.waist,
    hips: row.hips,
    arms: row.arms,
    legs: row.legs,
    body_fat: row.body_fat,
    notes: row.notes,
  })).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function saveMeasurement(entry) {
  const userId = await getUserId()
  if (!userId) return

  const dateStr = entry.date || new Date().toISOString().slice(0, 10)
  const payload = {
    id: entry.id || `meas_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    user_id: userId,
    date: dateStr,
    bodyweight: entry.weight ?? entry.bodyweight,
    body_fat: entry.body_fat,
    chest: entry.chest,
    waist: entry.waist,
    hips: entry.hips,
    arms: entry.arms,
    legs: entry.legs,
    notes: entry.notes,
  }

  const raw = loadRaw(userId)
  const idx = raw.findIndex((r) => r.id === entry.id)
  if (idx >= 0) {
    raw[idx] = { ...raw[idx], ...payload }
  } else {
    raw.push(payload)
  }
  saveRaw(userId, raw)
}

export async function deleteMeasurement(id) {
  const userId = await getUserId()
  if (!userId) return

  const raw = loadRaw(userId).filter((r) => r.id !== id)
  saveRaw(userId, raw)
}
