/**
 * Full integrated session engine — warmup, main, accessory, core, cardio, cooldown.
 * Every session is complete from start to finish. Content scales to available time.
 */

import { getExerciseById } from '../data/exercises'
import { getWarmupContent, getCooldownContent, getCoreBlockForSession, getCardioFinisher } from '../data/sessionContent'
import { getAllExcludedExerciseIds, getInjuryExerciseSubstitutions } from './userContext'
import { mapExperienceToTrainLevel } from './experienceLevel'
const LOWER_IDS = ['squat', 'rdl', 'deadlift', 'leg-press', 'bulgarian', 'goblet-squat', 'pause-squat', 'deficit-deadlift', 'rdl-slow']

/** Main compound IDs by level — heavy work first */
const MAIN_BY_LEVEL = {
  beginner: {
    lower: ['beg-goblet-squat', 'beg-rdl'],
    upper: ['beg-db-bench', 'beg-db-row', 'beg-lat-pulldown'],
    full: ['beg-goblet-squat', 'beg-rdl', 'beg-db-bench', 'beg-db-row'],
  },
  intermediate: {
    lower: ['int-back-squat', 'int-deadlift', 'int-rdl'],
    upper: ['int-barbell-bench', 'int-barbell-row', 'int-ohp', 'int-pullups'],
    full: ['int-back-squat', 'int-deadlift', 'int-barbell-bench', 'int-barbell-row'],
  },
  advanced: {
    lower: ['adv-pause-squat', 'adv-deficit-deadlift', 'adv-bulgarian-split-squat'],
    upper: ['adv-close-grip-bench', 'adv-pendlay-row', 'adv-push-press', 'adv-weighted-pullups'],
    full: ['adv-pause-squat', 'adv-deficit-deadlift', 'adv-close-grip-bench', 'adv-pendlay-row'],
  },
}

/** Accessory IDs by level — support main lifts */
const ACCESSORY_BY_LEVEL = {
  beginner: {
    lower: ['beg-leg-press', 'beg-goblet-squat'],
    upper: ['beg-lat-pulldown', 'beg-db-bench', 'beg-db-row', 'beg-assisted-pushup', 'beg-db-shoulder-press'],
    full: ['beg-lat-pulldown', 'beg-leg-press', 'beg-assisted-pushup'],
  },
  intermediate: {
    lower: ['int-rdl', 'beg-leg-press', 'adv-bulgarian-split-squat'],
    upper: ['int-dips', 'int-barbell-row', 'int-pullups', 'int-ohp'],
    full: ['int-pullups', 'int-dips', 'int-rdl'],
  },
  advanced: {
    lower: ['adv-rdl-slow-eccentric', 'adv-bulgarian-split-squat'],
    upper: ['adv-weighted-pullups', 'adv-pendlay-row', 'adv-push-press'],
    full: ['adv-bulgarian-split-squat', 'adv-weighted-pullups', 'adv-rdl-slow-eccentric'],
  },
}

/** Single-leg / rotational / loaded-carry exercise options */
const FUNCTIONAL_POOL = {
  singleLeg: [
    { id: 'adv-bulgarian-split-squat', name: 'Bulgarian Split Squat' },
    { id: 'beg-goblet-squat', name: 'Goblet Squat' },
  ],
  rotational: [
    { id: 'int-barbell-row', name: 'Barbell Row' },
    { id: 'adv-pendlay-row', name: 'Pendlay Row' },
  ],
  loadedCarry: { id: 'loaded-carry', name: 'Farmer Carry', description: 'Heavy dumbbells or kettlebells, 30–45s each hand. Walk tall, ribs down.' },
}

/**
 * Split pattern from days/week (onboarding). Uses dayInBlock 1..dpw within the current micro-cycle.
 * @param {{ dayInBlock: number; daysPerWeek: number }} ctx
 */
function getSessionFocus(ctx) {
  const dpw = Math.min(7, Math.max(1, ctx?.daysPerWeek || 3))
  if (dpw === 1) return 'full'
  const dayIdx = Math.max(0, (ctx?.dayInBlock || 1) - 1) % dpw
  const table = {
    2: ['full', 'full'],
    3: ['full', 'upper', 'lower'],
    4: ['upper', 'lower', 'upper', 'lower'],
    5: ['upper', 'lower', 'upper', 'lower', 'full'],
    6: ['upper', 'lower', 'upper', 'lower', 'upper', 'lower'],
    7: ['upper', 'lower', 'upper', 'lower', 'full', 'upper', 'lower'],
  }
  const arr = table[dpw] || table[3]
  return arr[dayIdx % arr.length]
}

function dedupeExerciseIds(list) {
  const seen = new Set()
  const out = []
  for (const ex of list) {
    if (!ex?.id || seen.has(ex.id)) continue
    seen.add(ex.id)
    out.push(ex)
  }
  return out
}

function applyInjurySubstitutions(main, accessory, user) {
  const map = getInjuryExerciseSubstitutions(user)
  if (!Object.keys(map).length) return { main, accessory }

  const sub = (ex) => {
    const nextId = map[ex.id]
    if (!nextId) return ex
    const fresh = getExerciseById(nextId)
    if (!fresh) return ex
    return {
      ...fresh,
      displayName: fresh.name,
      section: ex.section,
      _substitutedInjury: true,
    }
  }

  let m = main.map(sub)
  let a = accessory.map(sub)
  m = dedupeExerciseIds(m)
  a = dedupeExerciseIds(a)

  const details = (user?.injuries_details || '').toLowerCase()
  if (user?.injuries && details.includes('knee')) {
    const hasLegPress = m.some((x) => x.id === 'beg-leg-press') || a.some((x) => x.id === 'beg-leg-press')
    const hasCurl = m.some((x) => x.id === 'beg-leg-curl') || a.some((x) => x.id === 'beg-leg-curl')
    const curl = getExerciseById('beg-leg-curl')
    if (curl && hasLegPress && !hasCurl) {
      a.push({
        ...curl,
        displayName: curl.name,
        section: 'accessory',
        _substitutedInjury: true,
      })
    }
  }
  if (user?.injuries && details.includes('shoulder')) {
    const hasLat = m.some((x) => x.id === 'beg-lateral-raise') || a.some((x) => x.id === 'beg-lateral-raise')
    const lat = getExerciseById('beg-lateral-raise')
    if (lat && !hasLat) {
      a.push({ ...lat, displayName: lat.name, section: 'accessory', _substitutedInjury: true })
    }
  }

  return { main: m, accessory: a }
}

function getSportAccessoryIds(user) {
  const blob = (user?.sports_or_activities || []).join(' ').toLowerCase()
  const ids = []
  if (/(run|running|marathon|track)/.test(blob)) {
    ids.push('adv-bulgarian-split-squat', 'beg-rdl')
  } else if (/(swim|swimming|triathlon)/.test(blob)) {
    ids.push('beg-lat-pulldown', 'beg-db-row')
  } else if (blob.trim()) {
    ids.push('int-pullups', 'beg-assisted-pushup')
  }
  return [...new Set(ids)]
}

function appendSportAccessories(accessory, main, user, maxAdd, excludeIds) {
  const excl = new Set(excludeIds || [])
  const used = new Set([...main, ...accessory].map((x) => x.id))
  const sportIds = getSportAccessoryIds(user)
  let added = 0
  const out = [...accessory]
  for (const id of sportIds) {
    if (added >= maxAdd) break
    if (excl.has(id) || used.has(id)) continue
    const ex = getExerciseById(id)
    if (!ex) continue
    out.push({ ...ex, displayName: ex.name, section: 'accessory', _sportAccessory: true })
    used.add(id)
    added += 1
  }
  return out
}

/**
 * Training intent for sets/reps/rest (orthogonal to getGoalId nutrition buckets).
 * @returns {'fat_loss' | 'muscle' | 'strength' | 'endurance'}
 */
export function getTrainingIntent(user) {
  const blob = [...(user?.goals || []), user?.goal || ''].join(' ').toLowerCase()
  if (/\b(endurance|muscular endurance)\b/.test(blob)) return 'endurance'
  if (/\b(strength training|powerlifting|1rm|one rep max|max strength)\b/.test(blob) || (blob.includes('strength') && !blob.includes('build muscle'))) {
    return 'strength'
  }
  if (blob.includes('lose fat') || blob.includes('fat loss') || /\b(lean|cutting)\b/.test(blob)) return 'fat_loss'
  if (blob.includes('build muscle') || blob.includes('hypertrophy') || blob.includes('muscle building') || blob.includes('stronger')) {
    return 'muscle'
  }
  if (blob.includes('sport') || blob.includes('athlete') || blob.includes('competition')) return 'muscle'
  return 'muscle'
}

/**
 * Prescription by experience level + intent (Fix: rep ranges / sets / rest).
 */
function getStrengthPrescription(level, intent) {
  if (intent === 'endurance') {
    return { sets: 3, repRange: [21, 30], restSeconds: 60 }
  }
  const L = level === 'beginner' ? 'beg' : level === 'intermediate' ? 'int' : 'adv'
  const I = intent === 'fat_loss' ? 'fat_loss' : intent === 'strength' ? 'strength' : 'muscle'
  /** @type {Record<string, { sets: number; repRange: [number, number]; restSeconds: number }>} */
  const table = {
    beg_fat_loss: { sets: 3, repRange: [15, 20], restSeconds: 45 },
    beg_muscle: { sets: 3, repRange: [10, 12], restSeconds: 90 },
    beg_strength: { sets: 3, repRange: [6, 8], restSeconds: 120 },
    int_fat_loss: { sets: 4, repRange: [12, 15], restSeconds: 60 },
    int_muscle: { sets: 4, repRange: [8, 12], restSeconds: 90 },
    int_strength: { sets: 4, repRange: [4, 6], restSeconds: 180 },
    adv_fat_loss: { sets: 4, repRange: [12, 20], restSeconds: 45 },
    adv_muscle: { sets: 5, repRange: [6, 12], restSeconds: 90 },
    adv_strength: { sets: 5, repRange: [3, 5], restSeconds: 180 },
  }
  const key = `${L}_${I}`
  return table[key] || table.beg_muscle
}

function applyGoalAndExperienceToExercise(ex, user, level) {
  const intent = getTrainingIntent(user)
  const p = getStrengthPrescription(level, intent)
  return {
    ...ex,
    repRange: p.repRange,
    sets: p.sets,
    restSeconds: p.restSeconds,
  }
}

/** Apply prescription to a single exercise (e.g. gym fallback list). */
export function prescribeStrengthExercise(ex, user, level) {
  return applyGoalAndExperienceToExercise(ex, user, level)
}

/**
 * Scale main/accessory counts and sets based on available minutes.
 * Warmup 8, cooldown 8, core 12 are fixed. Cardio 5–20 by goal.
 * Remainder goes to main + accessory.
 */
function scaleForTime(totalMinutes, goal) {
  const warmup = 8
  const cooldown = 8
  const core = 12
  const g = (goal || '').toLowerCase()
  const isFatLoss = (g.includes('lose') || g.includes('fat') || g.includes('lean')) && !g.includes('balanced')
  const isAthlete = (g.includes('sport') || g.includes('competition')) && !g.includes('balanced')
  const isBalanced = g.includes('balanced')
  let cardio = 8
  if (isBalanced) cardio = 10
  else if (isFatLoss) cardio = Math.min(20, Math.max(10, Math.floor((totalMinutes - 36) / 3)))
  else if (isAthlete) cardio = 12
  else cardio = 6

  const strengthMinutes = Math.max(10, totalMinutes - warmup - cooldown - core - cardio)
  const perExercise = 6
  const totalSlots = Math.floor(strengthMinutes / perExercise)
  const mainCount = Math.min(4, Math.max(2, Math.floor(totalSlots * 0.55)))
  const accessoryCount = Math.min(4, Math.max(2, totalSlots - mainCount))
  return { warmup, cooldown, core, cardio, mainCount, accessoryCount }
}

/**
 * Build main and accessory exercises, avoiding duplicates.
 */
function buildStrengthBlocks(level, focus, mainCount, accessoryCount, excludeIds = [], mod) {
  const mainIds = (MAIN_BY_LEVEL[level] || MAIN_BY_LEVEL.beginner)[focus] || []
  const accIds = (ACCESSORY_BY_LEVEL[level] || ACCESSORY_BY_LEVEL.beginner)[focus] || []
  const exclude = new Set(excludeIds)
  const used = new Set()

  const main = []
  for (const id of mainIds) {
    if (main.length >= mainCount) break
    if (exclude.has(id)) continue
    const ex = getExerciseById(id)
    if (ex && !used.has(id)) {
      used.add(id)
      main.push({ ...ex, displayName: ex.name, section: 'main' })
    }
  }

  const accessory = []
  for (const id of accIds) {
    if (accessory.length >= accessoryCount) break
    if (exclude.has(id) || used.has(id)) continue
    const ex = getExerciseById(id)
    if (ex) {
      used.add(id)
      accessory.push({ ...ex, displayName: ex.name, section: 'accessory' })
    }
  }

  return { main, accessory }
}

/**
 * Build a complete integrated session.
 * @param {object} user — goal, experience_level, session_minutes
 * @param {{ dayInBlock: number; daysPerWeek: number }} programCtx
 * @param {object} [mod] — morning check-in modifiers (excludeExerciseIds, etc.)
 */
export function buildFullSession(user, programCtx, mod = {}) {
  let level = mapExperienceToTrainLevel(user?.experience_level)
  if (mod?.moderateSwap) {
    if (level === 'advanced') level = 'intermediate'
    else if (level === 'intermediate') level = 'beginner'
  }
  const goal = user?.goal
  const totalMinutes = user?.session_minutes || 60
  const sessionIndex = ((programCtx?.dayInBlock || 1) - 1) + ((programCtx?.programWeek || 1) - 1) * (programCtx?.daysPerWeek || 3)
  const focus = getSessionFocus(programCtx)

  let scale = scaleForTime(totalMinutes, goal)
  if (level === 'beginner') scale = { ...scale, accessoryCount: 0 }
  if (level === 'advanced') scale = { ...scale, accessoryCount: Math.min(6, scale.accessoryCount + 1) }

  const profileExcludes = getAllExcludedExerciseIds(user) || []
  const modExcludes = mod?.excludeExerciseIds || []
  const excludeIds = [...new Set([...profileExcludes, ...modExcludes])]
  let { main, accessory } = buildStrengthBlocks(
    level,
    focus,
    scale.mainCount,
    scale.accessoryCount,
    excludeIds,
    mod
  )

  const inj = applyInjurySubstitutions(main, accessory, user)
  main = inj.main
  accessory = inj.accessory

  if (level === 'beginner') {
    accessory = []
    const sportExtra = getSportAccessoryIds(user).slice(0, 1)
    for (const id of sportExtra) {
      if (excludeIds.includes(id) || main.some((m) => m.id === id)) continue
      const ex = getExerciseById(id)
      if (ex) main.push({ ...ex, displayName: ex.name, section: 'main', _sportAccessory: true })
    }
  } else {
    accessory = appendSportAccessories(accessory, main, user, 2, excludeIds)
  }

  main = dedupeExerciseIds(main.map((ex) => applyGoalAndExperienceToExercise(ex, user, level)))
  accessory = dedupeExerciseIds(accessory.map((ex) => applyGoalAndExperienceToExercise(ex, user, level)))

  const warmup = getWarmupContent(focus)
  const cooldown = getCooldownContent(focus)
  const core = getCoreBlockForSession(sessionIndex)
  const cardio = getCardioFinisher(goal, focus, sessionIndex)

  const isLoadedCarryDay = sessionIndex % 7 === 6

  const allLoggableExercises = [...main, ...accessory].map((ex, i) => ({
    ...ex,
    order: i + 1,
  }))
  const summary = {
    warmup: `${warmup.minutes} min`,
    mainCount: main.length,
    accessoryCount: accessory.length,
    core: `${core.minutes} min`,
    cardio: `${cardio.minutes} min`,
    cooldown: `${cooldown.minutes} min`,
    totalMinutes,
  }

  return {
    focus,
    level,
    summary,
    sections: [
      {
        id: 'warmup',
        title: '1. Warm up',
        subtitle: warmup.subtitle,
        minutes: warmup.minutes,
        content: warmup,
        type: 'warmup',
      },
      {
        id: 'main',
        title: '2. Main strength',
        subtitle: 'Compound movements — most demanding work first',
        exercises: main,
        type: 'strength',
      },
      {
        id: 'accessory',
        title: '3. Accessory',
        subtitle: 'Supporting movements — balance and injury prevention',
        exercises: accessory,
        type: 'strength',
      },
      {
        id: 'core',
        title: '4. Abs and core',
        subtitle: 'Anti-extension · anti-rotation · anti-lateral flexion · dynamic',
        minutes: core.minutes,
        content: core,
        type: 'core',
      },
      {
        id: 'cardio',
        title: '5. Cardio',
        subtitle: cardio.title,
        minutes: cardio.minutes,
        content: cardio,
        type: 'cardio',
      },
      {
        id: 'cooldown',
        title: '6. Stretching and cool down',
        subtitle: cooldown.subtitle,
        minutes: cooldown.minutes,
        content: cooldown,
        type: 'cooldown',
      },
    ],
    functionalWoven: {
      singleLegInLower: focus === 'lower' || focus === 'full',
      rotationalInUpper: focus === 'upper' || focus === 'full',
      loadedCarryThisWeek: isLoadedCarryDay,
      loadedCarryExercise: FUNCTIONAL_POOL.loadedCarry,
    },
    allLoggableExercises,
  }
}

/**
 * One-line session summary for display.
 */
export function getSessionSummaryLine(session) {
  const s = session.summary
  const accPart = s.accessoryCount > 0 ? ` · ${s.accessoryCount} accessories` : ''
  return `Warm up ${s.warmup} · ${s.mainCount} main${accPart} · Core ${s.core} · Cardio ${s.cardio} · Cool down ${s.cooldown} · Total ~${s.totalMinutes} min`
}

/**
 * Build full session using a pre-built strength list (e.g. from Calisthenics or Hybrid).
 * All provided exercises go into the main block; warmup, core, cardio, cooldown are added.
 */
export function buildFullSessionWithStrengthList(user, programCtx, mod, strengthExercises) {
  const level = mapExperienceToTrainLevel(user?.experience_level)
  let adjLevel = level
  if (mod?.moderateSwap) {
    if (level === 'advanced') adjLevel = 'intermediate'
    else if (level === 'intermediate') adjLevel = 'beginner'
  }
  const totalMinutes = user?.session_minutes || 60
  const goal = user?.goal
  const sessionIndex = ((programCtx?.dayInBlock || 1) - 1) + ((programCtx?.programWeek || 1) - 1) * (programCtx?.daysPerWeek || 3)
  const focus = getSessionFocus(programCtx)

  const warmup = getWarmupContent(focus)
  const cooldown = getCooldownContent(focus)
  const core = getCoreBlockForSession(sessionIndex)
  const cardio = getCardioFinisher(goal, focus, sessionIndex)

  const main = (strengthExercises || []).map((ex, i) => ({
    ...applyGoalAndExperienceToExercise(ex, user, adjLevel),
    displayName: ex.displayName || ex.name,
    section: 'main',
    order: i + 1,
  }))

  const allLoggableExercises = main

  const summary = {
    warmup: warmup.minutes,
    mainCount: main.length,
    accessoryCount: 0,
    core: core.minutes,
    cardio: cardio.minutes,
    cooldown: cooldown.minutes,
    totalMinutes,
  }

  return {
    focus,
    level: adjLevel,
    summary,
    sections: [
      { id: 'warmup', title: '1. Warm up', subtitle: warmup.subtitle, minutes: warmup.minutes, content: warmup, type: 'warmup' },
      { id: 'main', title: '2. Main strength', subtitle: 'Primary training block', exercises: main, type: 'strength' },
      { id: 'core', title: '3. Abs and core', subtitle: 'Anti-extension · anti-rotation · anti-lateral flexion · dynamic', minutes: core.minutes, content: core, type: 'core' },
      { id: 'cardio', title: '4. Cardio', subtitle: cardio.title, minutes: cardio.minutes, content: cardio, type: 'cardio' },
      { id: 'cooldown', title: '5. Stretching and cool down', subtitle: cooldown.subtitle, minutes: cooldown.minutes, content: cooldown, type: 'cooldown' },
    ],
    functionalWoven: {},
    allLoggableExercises,
  }
}
