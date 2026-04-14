/**
 * Safe text helpers for train exercise cards (no media).
 */

/**
 * @param {object} ex
 * @returns {string}
 */
export function deriveMusclesWorked(ex) {
  if (ex?.musclesWorked && String(ex.musclesWorked).trim()) return String(ex.musclesWorked).trim()
  const id = String(ex?.id || '').toLowerCase()
  const name = String(ex?.name || '').toLowerCase()
  const blob = `${id} ${name}`
  if (/(squat|leg.?press|lunge|split|goblet|pistol|bulgarian)/.test(blob)) {
    return 'Quadriceps, glutes, adductors, and core stabilizers.'
  }
  if (/(deadlift|rdl|hinge|hip|good.?morning)/.test(blob)) {
    return 'Hamstrings, glutes, erectors, upper back, and grip.'
  }
  if (/(bench|push.?up|pushup|dip|press|chest|fly|ohp|overhead)/.test(blob)) {
    return 'Chest, shoulders (anterior and medial), triceps, and serratus.'
  }
  if (/(row|pull|lat|pulldown|chin|pull-up|pullup|scap)/.test(blob)) {
    return 'Lats, rhomboids, rear delts, biceps, and grip.'
  }
  if (/(curl|tricep|extension|hammer|skull)/.test(blob)) {
    return 'Elbow flexors or extensors and supporting stabilizers.'
  }
  if (/(plank|hollow|core|ab|crunch|carry|walk|lsit|knee.?raise)/.test(blob)) {
    return 'Core, anti-extension/rotation, and postural control.'
  }
  if (/(jump|burpee|mountain|sprint|conditioning)/.test(blob)) {
    return 'Full-body power, hips, and conditioning systems.'
  }
  return 'Primary movers follow the movement pattern in the description below.'
}

/**
 * @param {object} ex
 * @returns {[number, number]}
 */
export function safeRepRange(ex) {
  const scheme = ex?.repsScheme ?? ex?.reps
  if (typeof scheme === 'string' && scheme.includes('/')) {
    const parts = scheme.split('/').map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n))
    if (parts.length) return [Math.min(...parts), Math.max(...parts)]
  }
  const r = ex?.repRange
  if (Array.isArray(r) && r.length >= 2 && Number.isFinite(Number(r[0])) && Number.isFinite(Number(r[1]))) {
    return [Number(r[0]), Number(r[1])]
  }
  return [8, 12]
}

/**
 * @param {object} ex
 * @returns {number}
 */
export function safeSetCount(ex) {
  const n = Number(ex?.sets)
  if (Number.isFinite(n) && n >= 1 && n <= 20) return Math.floor(n)
  return 3
}

/**
 * Rough load region for progressive overload jumps (upper vs lower).
 * @param {object} ex
 * @returns {'lower' | 'upper'}
 */
export function exerciseLoadRegion(ex) {
  const blob = `${ex?.id || ''} ${ex?.name || ''} ${ex?.displayName || ''}`.toLowerCase()
  if (
    /(squat|leg.?press|leg.?curl|deadlift|rdl|romanian|lunge|split|goblet|pistol|bulgarian|hip.?thrust|calf|glute|hack|sled|leg extension|leg curl|nordic|step-up|box jump)/.test(
      blob,
    )
  ) {
    return 'lower'
  }
  return 'upper'
}

function levelKey(trainLevel) {
  return trainLevel === 'intermediate' ? 'intermediate' : trainLevel === 'advanced' ? 'advanced' : 'beginner'
}

/**
 * @param {object} ex
 * @returns {'bodyweight' | 'dumbbell' | 'barbell'}
 */
export function classifyExerciseLoadType(ex) {
  const blob = `${ex?.id || ''} ${ex?.name || ''} ${ex?.displayName || ''}`.toLowerCase()
  const hasExternalLoad = /(dumbbell|barbell|db-|kettlebell|kb |cable|machine|smith|ez bar|trap bar)/.test(blob)
  if (
    /(pushup|push-up|pullup|pull-up|chin-up|chinup|bodyweight|^air squat|plank|burpee|hanging leg|mountain climber|assisted squat)/.test(blob) &&
    !hasExternalLoad
  ) {
    return 'bodyweight'
  }
  if (/(dumbbell|db-|goblet|kettlebell|kb )/.test(blob)) return 'dumbbell'
  return 'barbell'
}

/**
 * @param {number} kg
 * @returns {number}
 */
export function kgToRoundedLbs(kg) {
  const lbs = Number(kg) * 2.205
  return Math.round(lbs / 2.5) * 2.5
}

/**
 * @param {number} lbs
 * @returns {number}
 */
export function lbsToRoundedKg(lbs) {
  const kg = Number(lbs) / 2.205
  return Math.round(kg * 10) / 10
}

/**
 * Exact level-aware suggestion ranges for train screen.
 * @param {object} ex
 * @param {'beginner' | 'intermediate' | 'advanced'} trainLevel
 * @returns {{ type: 'bodyweight' } | { type: 'loaded'; kg: [number, number]; lbs: [number, number] }}
 */
export function getExerciseWeightSuggestionRange(ex, trainLevel = 'beginner') {
  const t = classifyExerciseLoadType(ex)
  if (t === 'bodyweight') return { type: 'bodyweight' }
  const lv = levelKey(trainLevel)
  const region = exerciseLoadRegion(ex)
  const upper = region !== 'lower'

  if (lv === 'beginner') {
    if (upper) return { type: 'loaded', kg: [5, 12], lbs: [10, 25] }
    return { type: 'loaded', kg: [8, 15], lbs: [15, 30] }
  }
  if (lv === 'intermediate') {
    if (upper) return { type: 'loaded', kg: [40, 70], lbs: [85, 155] }
    return { type: 'loaded', kg: [60, 100], lbs: [130, 220] }
  }
  if (upper) return { type: 'loaded', kg: [80, 120], lbs: [175, 265] }
  return { type: 'loaded', kg: [100, 160], lbs: [220, 355] }
}

/**
 * Placeholder for weight input (gold styling via CSS). Not shown when value is non-empty.
 * @param {object} ex
 * @param {'beginner' | 'intermediate' | 'advanced'} trainLevel
 * @param {'kg' | 'lbs'} unit
 */
export function getTrainSetWeightPlaceholder(ex, trainLevel = 'beginner', unit = 'kg') {
  const hint = ex?.weightSuggestion != null ? String(ex.weightSuggestion).trim() : ''
  if (hint) {
    const short = hint.length > 52 ? `${hint.slice(0, 49)}…` : hint
    return short
  }
  const r = getExerciseWeightSuggestionRange(ex, trainLevel)
  if (r.type === 'bodyweight') return 'Bodyweight'
  const isLbs = unit === 'lbs'
  const [a, b] = isLbs ? r.lbs : r.kg
  return `${a} to ${b} ${isLbs ? 'lbs' : 'kg'} suggested`
}

/**
 * Midpoint used by "Suggested start" button and headers.
 * @param {object} ex
 * @param {'beginner' | 'intermediate' | 'advanced'} trainLevel
 * @returns {number | null}
 */
export function getSuggestedStartKgForLevel(ex, trainLevel = 'beginner') {
  const r = getExerciseWeightSuggestionRange(ex, trainLevel)
  if (r.type === 'bodyweight') return null
  const [a, b] = r.kg
  return Math.round((((a + b) / 2) * 10)) / 10
}

/** Placeholder for reps field: per-set target when repsPerSet exists, else range. */
export function getTrainSetRepsPlaceholder(ex, setIndex = 0) {
  const per = ex?.repsPerSet
  if (Array.isArray(per) && per.length > 0) {
    const i = Math.min(Math.max(0, setIndex), per.length - 1)
    const v = per[i]
    if (v != null && String(v).trim() !== '') return String(v)
  }
  const [a, b] = safeRepRange(ex)
  return `${a}–${b}`
}

/**
 * e.g. "4 x 8-12 x 40kg" — working weight for display (last / suggested / —).
 * @param {object} ex
 * @param {number|null|undefined} weightKg
 * @param {string} variant
 * @param {boolean} isCircuit
 * @param {object|null} circuitMeta
 */
export function formatExerciseTargetLine(ex, weightKg, variant = 'gym', isCircuit = false, circuitMeta = null, weightUnit = 'kg') {
  if (variant === 'home' && isCircuit && circuitMeta) {
    return `${circuitMeta.rounds} rounds · ${circuitMeta.workSeconds}s on`
  }
  const sets = safeSetCount(ex)
  const scheme = ex?.repsScheme != null ? String(ex.repsScheme) : ex?.reps != null ? String(ex.reps) : ''
  if (scheme.includes('/')) {
    const rest = ex?.restSeconds != null && Number.isFinite(Number(ex.restSeconds)) ? `${Number(ex.restSeconds)}s rest` : 'rest as programmed'
    return `${sets} sets × ${scheme} reps · ${rest}`
  }
  const [a, b] = safeRepRange(ex)
  if (variant === 'home' && b > 25 && a >= 10 && b <= 120 && !isCircuit) {
    const w =
      weightKg != null && Number.isFinite(Number(weightKg)) ? Math.round(Number(weightKg) * 10) / 10 : null
    const wPart = w != null ? `${w}${weightUnit}` : '—'
    return `${sets} x ${a}-${b}s x ${wPart}`
  }
  const w = weightKg != null && Number.isFinite(Number(weightKg)) ? Math.round(Number(weightKg) * 10) / 10 : null
  const wPart = w != null ? `${w}${weightUnit}` : '—'
  return `${sets} x ${a}-${b} x ${wPart}`
}
