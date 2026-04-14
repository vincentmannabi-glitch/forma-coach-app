import { getCurrentUser } from './auth'

export function dateKeyLocal(d = new Date()) {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

async function getUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
}

function storageKey(userId) {
  return `forma_food_entries_${userId}`
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

export async function getAllFoodEntries() {
  const userId = await getUserId()
  if (!userId) return []

  const raw = loadRaw(userId)
  return raw.map((row) => ({
    id: row.id,
    name: row.name,
    calories: row.calories ?? 0,
    protein: row.protein ?? 0,
    carbs: row.carbs ?? 0,
    fat: row.fat ?? 0,
    dateKey: row.date_key,
    loggedAt: row.logged_at,
    source: row.source,
    barcode: row.barcode,
  })).sort((a, b) => (b.loggedAt || '').localeCompare(a.loggedAt || ''))
}

export async function addFoodEntry(entry) {
  const userId = await getUserId()
  if (!userId) return

  const id = `food_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const row = {
    id,
    user_id: userId,
    name: entry.name,
    calories: entry.calories ?? 0,
    protein: entry.protein ?? 0,
    carbs: entry.carbs ?? 0,
    fat: entry.fat ?? 0,
    date_key: entry.dateKey || dateKeyLocal(),
    logged_at: entry.loggedAt || new Date().toISOString(),
    source: entry.source,
    barcode: entry.barcode,
  }
  const raw = loadRaw(userId)
  raw.unshift(row)
  saveRaw(userId, raw)
}

export async function deleteFoodEntry(id) {
  const userId = await getUserId()
  if (!userId) return

  const raw = loadRaw(userId).filter((r) => r.id !== id)
  saveRaw(userId, raw)
}

export async function getEntriesForDay(dateKey) {
  const all = await getAllFoodEntries()
  return all.filter((e) => e.dateKey === dateKey)
}

export async function getDailyTotals(dateKey) {
  const entries = await getEntriesForDay(dateKey)
  const t = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  entries.forEach((e) => {
    t.calories += e.calories || 0
    t.protein += e.protein || 0
    t.carbs += e.carbs || 0
    t.fat += e.fat || 0
  })
  return {
    ...t,
    calories: Math.round(t.calories),
    protein: Math.round(t.protein * 10) / 10,
    carbs: Math.round(t.carbs * 10) / 10,
    fat: Math.round(t.fat * 10) / 10,
  }
}
