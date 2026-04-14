/**
 * Hybrid programs — gym strength plus calisthenics skill in one session.
 */
import { getExerciseById } from './exercises'
import { getCalisthenicsExerciseById } from './calisthenicsWorkout'

function resolve(ref) {
  if (ref.startsWith('gym:')) {
    const id = ref.slice(4)
    return getExerciseById(id)
  }
  if (ref.startsWith('cal:')) {
    const id = ref.slice(4)
    return getCalisthenicsExerciseById(id)
  }
  return getExerciseById(ref) || getCalisthenicsExerciseById(ref)
}

/** @type {Record<string, string[][]>} — 3 rotating sessions per level */
const HYBRID_SESSIONS = {
  beginner: [
    ['gym:beg-db-bench', 'gym:beg-db-row', 'cal:cal-beg-assisted-pullup', 'gym:beg-lat-pulldown', 'cal:cal-beg-incline-pushup', 'cal:cal-beg-hollow'],
    ['gym:beg-goblet-squat', 'gym:beg-rdl', 'cal:cal-beg-squat', 'gym:beg-leg-press', 'cal:cal-beg-plank', 'cal:cal-beg-scap-pulls'],
    ['gym:beg-db-row', 'gym:beg-lat-pulldown', 'cal:cal-beg-assisted-pullup', 'gym:beg-db-shoulder-press', 'cal:cal-beg-incline-pushup', 'cal:cal-beg-plank'],
  ],
  intermediate: [
    ['gym:int-barbell-bench', 'gym:int-ohp', 'cal:cal-int-pullup', 'gym:int-barbell-row', 'cal:cal-int-dip', 'cal:cal-int-inverted-row'],
    ['gym:int-back-squat', 'gym:int-deadlift', 'cal:cal-int-bulgarian', 'gym:int-pullups', 'cal:cal-int-lsit-tuck', 'cal:cal-int-knee-raise'],
    ['gym:int-deadlift', 'gym:int-barbell-row', 'cal:cal-int-pullup', 'gym:int-pullups', 'cal:cal-int-inverted-row', 'cal:cal-int-knee-raise'],
  ],
  advanced: [
    ['gym:adv-close-grip-bench', 'gym:adv-push-press', 'cal:cal-adv-w-pullup', 'gym:adv-pendlay-row', 'cal:cal-adv-mu-prog', 'cal:cal-adv-hs-wall'],
    ['gym:adv-pause-squat', 'gym:adv-deficit-deadlift', 'cal:cal-adv-pistol', 'gym:adv-weighted-pullups', 'cal:cal-adv-fl-tuck', 'cal:cal-adv-ttb'],
    ['gym:adv-deficit-deadlift', 'gym:adv-pendlay-row', 'cal:cal-adv-w-pullup', 'gym:adv-weighted-pullups', 'cal:cal-adv-mu-prog', 'cal:cal-adv-fl-tuck'],
  ],
}

export function getHybridWorkout(levelKey, dayInBlock, daysPerWeek) {
  const key = ['beginner', 'intermediate', 'advanced'].includes(levelKey) ? levelKey : 'beginner'
  const sessions = HYBRID_SESSIONS[key] || HYBRID_SESSIONS.beginner
  const idx = (Math.max(1, dayInBlock || 1) - 1) % sessions.length
  const refs = sessions[idx] || sessions[0]

  const list = []
  refs.forEach((ref) => {
    const ex = resolve(ref)
    if (ex) list.push({ ...ex })
  })

  return list.map((ex, i) => ({
    ...ex,
    order: i + 1,
  }))
}

export function buildHybridListForTrain(levelKey, mod, programCtx) {
  let level = levelKey
  if (mod?.moderateSwap) {
    if (level === 'advanced') level = 'intermediate'
    else if (level === 'intermediate') level = 'beginner'
  }

  const dpw = programCtx?.daysPerWeek || 3
  const dayInBlock = programCtx?.dayInBlock || 1

  let list = getHybridWorkout(level, dayInBlock, dpw)

  if (mod?.excludeExerciseIds?.length) {
    const exclude = new Set(mod.excludeExerciseIds)
    list = list.filter((ex) => !exclude.has(ex.id))
  }

  list = list.map((ex, i) => ({ ...ex, order: i + 1 }))

  if (list.length === 0) {
    list = getHybridWorkout('beginner', 1, 3)
  }

  return list
}
