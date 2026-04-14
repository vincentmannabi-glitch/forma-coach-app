/**
 * Persist in-progress train session set logs to localStorage (per user, style, calendar day).
 */

/**
 * @param {string} userId
 * @param {string} style gym | both | calisthenics | home | reconnect
 * @param {string} dayKey YYYY-MM-DD
 */
export function trainDraftStorageKey(userId, style, dayKey) {
  return `forma_train_draft_v1_${userId}_${style}_${dayKey}`
}

/**
 * @param {object} saved
 * @param {Array} workoutList
 * @param {(list: Array) => object} initLogs
 */
export function mergeDraftIntoLogs(saved, workoutList, initLogs) {
  const base = initLogs(workoutList)
  if (!saved || typeof saved !== 'object') return base

  workoutList.forEach((ex) => {
    const incoming = saved[ex.id]
    if (!incoming?.sets || !Array.isArray(incoming.sets)) return
    const targetLen = base[ex.id]?.sets?.length ?? 0
    if (!targetLen) return
    const merged = base[ex.id].sets.map((s, i) => {
      const o = incoming.sets[i]
      if (!o || typeof o !== 'object') return s
      return {
        weight: o.weight != null ? String(o.weight) : s.weight,
        reps: o.reps != null ? String(o.reps) : s.reps,
        completed: !!o.completed,
      }
    })
    base[ex.id] = { sets: merged }
  })
  return base
}

export function saveTrainDraft(key, logs) {
  try {
    localStorage.setItem(key, JSON.stringify(logs))
  } catch {
    /* quota */
  }
}
