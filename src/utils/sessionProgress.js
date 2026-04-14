import { safeSetCount } from './exerciseCardContent'

/** Percent of completed sets (0–100) for a flat exercise list and per-exercise logs. */
export function getSessionSetProgressPct(logs, exercises) {
  if (!exercises?.length) return 0
  let total = 0
  let done = 0
  for (const ex of exercises) {
    const n = safeSetCount(ex)
    total += n
    const sets = logs[ex.id]?.sets || []
    for (let i = 0; i < n; i++) {
      if (sets[i]?.completed) done += 1
    }
  }
  return total > 0 ? (done / total) * 100 : 0
}
