/**
 * Wellness check-ins for moms — energy, sleep quality, mood, clothes fit (local only).
 */

const KEY = 'forma_mom_wellness'

function storageKey() {
  const e = typeof localStorage !== 'undefined' ? localStorage.getItem('forma_auth') : ''
  return e ? `${KEY}_${e}` : null
}

/** @typedef {{ dateKey: string; energy: 1|2|3|4|5; sleepQ: 1|2|3|4|5; mood: 1|2|3|4|5; clothesFit: 'tighter'|'same'|'looser'|'na'; note?: string }} MomWellnessEntry */

export function loadMomWellnessEntries() {
  const k = storageKey()
  if (!k) return []
  try {
    const raw = localStorage.getItem(k)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** @param {Omit<MomWellnessEntry, 'dateKey'> & { dateKey?: string }} partial */
export function saveMomWellnessEntry(partial) {
  const k = storageKey()
  if (!k) return
  const dk = partial.dateKey || new Date().toISOString().slice(0, 10)
  const list = loadMomWellnessEntries().filter((e) => e.dateKey !== dk)
  list.push({
    dateKey: dk,
    energy: partial.energy,
    sleepQ: partial.sleepQ,
    mood: partial.mood,
    clothesFit: partial.clothesFit || 'na',
    note: partial.note,
  })
  list.sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1))
  try {
    localStorage.setItem(k, JSON.stringify(list.slice(-120)))
  } catch {
    /* ignore */
  }
}

export function getLatestMomWellness() {
  const list = loadMomWellnessEntries()
  return list.length ? list[list.length - 1] : null
}
