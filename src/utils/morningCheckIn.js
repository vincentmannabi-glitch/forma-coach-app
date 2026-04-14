/**
 * Morning check-in storage, session modifiers for Train, and personalised copy.
 */

import { dateKeyLocal } from './foodLog'
import { updateUserProfile } from './auth'
import { getSessionsSync, getCurrentStreakSync, getProgramContextSync } from './workouts'
import * as checkinsService from './checkinsService'
import { getTodayTrainExercisesSync } from './programBuilder.js'
import { buildPersonalizedMorningOpener } from './morningOpeners'
import {
  isMomExperience,
  isPostnatal,
  isPregnant,
  pelvicFloorWarmupCue,
  pelvicFloorCooldownCue,
  pregnancyExerciseGuidance,
  postnatalPhaseGuidance,
} from './momExperience'
import { getAllExcludedExerciseIds } from './userContext'
import { mapExperienceToTrainLevel } from './experienceLevel'

const MODIFIERS_KEY = 'forma_session_modifiers'

/** @typedef {'poor'|'okay'|'good'|'great'} SleepQuality */
/** @typedef {'great'|'tired'|'sore'|'injury'} BodyFeeling */

/**
 * @typedef {{
 *   id: string
 *   at: string
 *   dateKey: string
 *   sleep: SleepQuality
 *   body: BodyFeeling
 *   soreRegion?: string
 *   soreSide?: 'left'|'right'|'both'
 *   soreLevel?: 1|2|3
 *   injuryDuration?: 'just'|'few'|'week'
 *   rehabPhase?: 'acute'|'subacute'|'chronic'
 *   homeHarmony?: 'calm'|'steady'|'hectic'|'rough'
 * }} MorningCheckInEntry
 */

/**
 * @returns {Promise<MorningCheckInEntry[]>}
 */
export async function loadCheckIns() {
  return checkinsService.loadCheckIns()
}

/**
 * @param {Omit<MorningCheckInEntry, 'id'|'at'> & Partial<Pick<MorningCheckInEntry, 'id'|'at'>>} entry
 */
export async function saveMorningCheckIn(entry) {
  await checkinsService.saveMorningCheckIn(entry)
  return { ...entry, id: entry.id || `mc-${Date.now()}`, at: entry.at || new Date().toISOString() }
}

/**
 * @param {string} dateKey
 * @returns {Promise<MorningCheckInEntry|null>}
 */
export async function getCheckInForDateKey(dateKey) {
  return checkinsService.getCheckInForDateKey(dateKey)
}

export async function hasCompletedCheckInToday() {
  const c = await getCheckInForDateKey(dateKeyLocal())
  return c != null
}

export async function getLastCheckInBeforeToday() {
  const tk = dateKeyLocal()
  const list = (await loadCheckIns()).filter((c) => c.dateKey < tk)
  list.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
  return list[0] || null
}

/** @returns {{ exerciseNames: string[]; sessionLabel: string } | null} */
export function getYesterdayTrainingSummary() {
  const sessions = getSessionsSync()
  if (!sessions?.length) return null
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const yk = dateKeyLocal(y)
  const onDay = sessions.filter((s) => dateKeyLocal(new Date(s.completedAt)) === yk)
  if (!onDay.length) return null
  onDay.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  const last = onDay[0]
  const names =
    last.exercises?.map((e) => e.displayName || e.exerciseId).filter(Boolean) || []
  return {
    exerciseNames: names.slice(0, 8),
    sessionLabel: last.sessionName || 'Training session',
  }
}

const BODY_LABEL = {
  great: 'ready to go',
  tired: 'a bit tired',
  sore: 'something sore',
  injury: 'working through an injury',
}

/**
 * @param {object | null} last
 */
export function describeLastCheckIn(last) {
  if (!last) return ''
  const b = BODY_LABEL[last.body] || last.body
  return `Last check-in: sleep ${last.sleep}, body ${b}.`
}

/**
 * @param {{ user: object; programWeek: number }} ctx
 */
export function buildMorningLeadLine(ctx) {
  return buildPersonalizedMorningOpener({
    user: ctx.user,
    programWeek: ctx.programWeek,
    daysPerWeek: ctx.user?.days_per_week || ctx.daysPerWeek || 3,
  })
}

/** Map diagram region id -> exercise ids to soften or remove when sore */
export const REGION_TO_EXERCISE_IDS = {
  knee: ['beg-goblet-squat', 'int-back-squat', 'adv-pause-squat', 'beg-leg-press'],
  quad: ['beg-goblet-squat', 'int-back-squat', 'adv-pause-squat', 'beg-leg-press'],
  hamstring: ['beg-rdl', 'int-deadlift', 'adv-deficit-deadlift'],
  lower_back: ['beg-rdl', 'int-deadlift', 'adv-deficit-deadlift', 'int-barbell-row', 'adv-pendlay-row'],
  upper_back: ['int-barbell-row', 'adv-pendlay-row', 'beg-db-row', 'int-pullups', 'adv-weighted-pullups'],
  shoulder: ['int-ohp', 'adv-push-press', 'int-barbell-bench', 'adv-close-grip-bench', 'beg-db-bench'],
  elbow: ['int-barbell-bench', 'adv-close-grip-bench', 'beg-db-bench', 'int-barbell-row'],
  wrist: ['int-barbell-bench', 'int-barbell-row', 'adv-pendlay-row'],
  hip: ['beg-goblet-squat', 'int-back-squat', 'beg-rdl', 'int-deadlift'],
  ankle: ['beg-goblet-squat', 'int-back-squat', 'beg-leg-press'],
  neck: ['int-ohp', 'adv-push-press'],
  chest: ['int-barbell-bench', 'adv-close-grip-bench', 'beg-db-bench'],
  glute: ['beg-rdl', 'int-deadlift', 'adv-deficit-deadlift'],
  calf: ['beg-leg-press'],
  groin: ['beg-goblet-squat', 'int-back-squat'],
}

export function injuryToRehabPhase(duration) {
  if (duration === 'just') return 'acute'
  if (duration === 'few') return 'subacute'
  return 'chronic'
}

/**
 * Count consecutive calendar days (ending yesterday) with knee soreness logged.
 */
export async function countConsecutiveKneeSoreDays() {
  const list = await loadCheckIns()
  const kneeDays = new Set()
  list.forEach((c) => {
    if (c.body === 'sore' && c.soreRegion === 'knee' && (c.soreLevel || 0) >= 1) {
      kneeDays.add(c.dateKey)
    }
  })
  let streak = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (kneeDays.has(dateKeyLocal(d))) {
    streak += 1
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/** Consecutive calendar days ending today with sleep = poor (uses saved check-ins). */
export async function countConsecutivePoorSleepDays() {
  const list = await loadCheckIns()
  const m = new Map(list.map((c) => [c.dateKey, c]))
  const d = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const dk = dateKeyLocal(d)
    const c = m.get(dk)
    if (!c || c.sleep !== 'poor') break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/** Consecutive days logging the same sore region (body = sore). */
export async function countConsecutiveSoreRegionDays(region) {
  if (!region) return 0
  const list = await loadCheckIns()
  const m = new Map(list.map((c) => [c.dateKey, c]))
  const d = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const dk = dateKeyLocal(d)
    const c = m.get(dk)
    if (!c || c.body !== 'sore' || c.soreRegion !== region) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

const EXCLUDE_SWAP_COPY = {
  'int-barbell-bench': 'Barbell bench replaced with cable flyes — less shoulder stress, same chest work.',
  'beg-db-bench': 'Dumbbell bench replaced with cable flyes or machine press — smoother shoulders.',
  'adv-close-grip-bench': 'Close-grip bench replaced with cable press-downs and flyes — elbow-friendly.',
  'int-pullups': 'Pull-ups swapped for lat pulldown or band-assisted pulls — same pattern, less aggravation.',
  'adv-weighted-pullups': 'Weighted pull-ups eased to bodyweight or pulldown — protect irritated tissue.',
  'int-ohp': 'Overhead press replaced with incline dumbbell press or landmine press.',
  'adv-push-press': 'Push press replaced with landmine or dumbbell shoulder press.',
  'int-back-squat': 'Back squat replaced with goblet squat or leg press — reduce spine demand.',
  'adv-pause-squat': 'Pause squat replaced with box squat or tempo goblet squat.',
  'int-deadlift': 'Deadlift replaced with Romanian deadlift or hip hinge with lighter load.',
  'adv-deficit-deadlift': 'Deficit deadlift replaced with rack pulls or RDL — reduce range stress.',
  'beg-goblet-squat': 'Goblet squat reduced range or swapped for leg press if knee-intolerant.',
}

function appendSwapNotesForExcludes(excludeIds, changeLog) {
  const seen = new Set()
  excludeIds.forEach((id) => {
    const line = EXCLUDE_SWAP_COPY[id]
    if (line && !seen.has(line)) {
      seen.add(line)
      changeLog.push(line)
    }
  })
  if (excludeIds.some((id) => id.includes('bench') || id.includes('press')) && seen.size === 0) {
    changeLog.push('Heavy pressing patterns swapped for cables or machines — same intent, less joint stress.')
  }
}

function estimateSessionMinutes(levelKey, mod, user) {
  let list = buildWorkoutListForTrain(levelKey, mod)
  const n = list.length
  const warmup = 8 + (mod?.extraWarmupMinutes || 0)
  let m = Math.max(28, Math.round(warmup + n * 8 + 8))
  if (isMomExperience(user)) {
    m = Math.min(m, 45)
    if (mod?.momMicroSession) m = Math.min(m, 15)
    else if (mod?.momShorterSession) m = Math.min(m, 24)
  }
  return m
}

function sessionTitleFromProgram(dayInBlock, dpw) {
  const t3 = ['Full-body strength', 'Lower-body emphasis', 'Upper-body emphasis']
  const t4 = ['Lower-body power', 'Upper-body push', 'Leg volume', 'Upper pull']
  const arr = dpw <= 3 ? t3 : t4
  return arr[(Math.max(1, dayInBlock) - 1) % arr.length]
}

/**
 * @param {MorningCheckInEntry} entry
 * @param {{ level?: string; daysPerWeek?: number; experienceLevel?: string; user?: object } | undefined} opts
 */
export async function computeSessionModifiersFromCheckIn(entry, opts = {}) {
  const levelKey = opts.level || mapExperienceToTrainLevel(opts.experienceLevel) || 'beginner'
  const dpw = opts.daysPerWeek ?? 3
  const user = opts.user

  const changeLog = []
  const banners = []
  /** @type {string[]} */
  const excludeExerciseIds = [...(getAllExcludedExerciseIds(user) || [])]
  /** @type {{ title: string; lines: string[] }[]} */
  const rehabBlocks = []
  let intensityMultiplier = 1
  let moderateSwap = false
  let extraWarmupMinutes = 0
  let weightIncreaseSuggestion = false
  let progressionHint = null
  let kneeRehabActive = false
  let momShorterSession = false
  let momMicroSession = false

  const streak = getCurrentStreakSync()
  const kneeStreak = await countConsecutiveKneeSoreDays()
  kneeRehabActive = kneeStreak >= 3
  if (kneeRehabActive) {
    changeLog.push('Knee focus: three days in a row logging knee soreness — we are prioritising a knee-friendly day.')
    rehabBlocks.push({
      title: 'Knee rehab priority',
      lines: [
        'Pain-free range first: slow bodyweight squat to a comfortable depth, 2–3 sets of 8.',
        'Terminal knee extensions or short-arc quads if you have a band.',
        'Easy hamstring and calf mobility — no aggressive stretching into pain.',
      ],
    })
  }

  if (entry.sleep === 'poor') {
    intensityMultiplier = 0.8
    moderateSwap = true
    extraWarmupMinutes = 8
    changeLog.push('Sleep was rough — intensity scaled ~20% and heavy compounds swapped for moderate accessories.')
    banners.push({
      type: 'sleep',
      text: "Today's session has been adjusted for your recovery.",
    })
    if (isMomExperience(user)) {
      momShorterSession = true
      changeLog.push('Family reality: we shortened the clock so you can still move without borrowing from tomorrow.')
    }
  }

  if (isMomExperience(user) && entry.homeHarmony === 'rough') {
    intensityMultiplier = Math.min(intensityMultiplier, 0.82)
    momShorterSession = true
    extraWarmupMinutes = Math.max(extraWarmupMinutes, 4)
    changeLog.push('Home sounded heavy — we eased the session so you are not paying for it twice.')
    banners.push({
      type: 'home',
      text: 'When home is a lot, training steps back — still here, just kinder.',
    })
  }

  if (isMomExperience(user) && entry.homeHarmony === 'hectic') {
    intensityMultiplier = Math.min(intensityMultiplier, 0.9)
    momShorterSession = true
    changeLog.push('Hectic morning — trimmed time and load so something is still doable.')
  }

  if (isMomExperience(user) && entry.sleep === 'poor' && entry.homeHarmony === 'rough') {
    momMicroSession = true
    intensityMultiplier = Math.min(intensityMultiplier, 0.75)
    changeLog.push('Rough night plus a full house — micro-session mode: short, simple, done.')
  }

  if (entry.body === 'great') {
    if (streak >= 14 && entry.sleep !== 'poor') {
      weightIncreaseSuggestion = true
      progressionHint =
        'Two weeks consistent — if last week felt smooth, add a small bump (about 2.5–5 kg) on one main lift when reps felt easy.'
      changeLog.push('You have been consistent for two weeks — if last week felt smooth, add a small bump on one lift.')
    }
  }

  if (entry.body === 'tired') {
    intensityMultiplier = Math.min(intensityMultiplier, 0.9)
    extraWarmupMinutes = Math.max(extraWarmupMinutes, 5)
    changeLog.push('A bit tired — slightly reduced target intensity and a longer warm-up.')
  }

  if (entry.body === 'sore' && entry.soreRegion) {
    const ids = new Set(REGION_TO_EXERCISE_IDS[entry.soreRegion] || [])
    ids.forEach((id) => excludeExerciseIds.push(id))
    changeLog.push(
      `Soreness (${entry.soreRegion}${entry.soreSide ? `, ${entry.soreSide}` : ''}, level ${entry.soreLevel || '?'}) — we pulled exercises that typically aggravate that area.`,
    )
    rehabBlocks.push({
      title: 'Mobility and prep',
      lines: [
        '5–10 minutes easy cardio or walking to raise temperature.',
        'Controlled articular rotations for the joints above and below the sore spot.',
        entry.soreLevel === 3
          ? 'Level 3 soreness: avoid loading painful ranges today — substitute or skip matching patterns.'
          : entry.soreLevel === 2
            ? 'Level 2: reduce load and volume on related patterns; leave 3+ reps in reserve.'
            : 'Level 1: light loading and thorough warm-up usually clears this — still move with quality.',
      ],
    })
    banners.push({
      type: 'sore',
      text: 'We removed or swapped aggravating lifts and added mobility — details are in your summary below.',
    })
    if (entry.soreRegion === 'shoulder') {
      rehabBlocks.push({
        title: 'Warm-up add-on',
        lines: ['Band pull-aparts: 3×15–20 — squeeze the shoulder blades, easy tempo, no shrug.'],
      })
    }
    const soreStreak = await countConsecutiveSoreRegionDays(entry.soreRegion)
    if (soreStreak >= 5) {
      changeLog.push(
        `Same area logged ${soreStreak} mornings in a row — starting a structured rehab emphasis for that region.`,
      )
      moderateSwap = true
      intensityMultiplier = Math.min(intensityMultiplier, 0.8)
      rehabBlocks.push({
        title: 'Regional rehab (auto-started)',
        lines: [
          'Pain-free range every day beats one hero session — small doses, consistent.',
          'If loading still bites after warm-up, keep today to activation and walking.',
        ],
      })
      banners.push({
        type: 'pattern',
        text: 'Repeated soreness pattern — we prioritised rehab-style work for that area today.',
      })
    }
  }

  if (entry.body === 'injury' && entry.injuryDuration) {
    const phase = entry.rehabPhase || injuryToRehabPhase(entry.injuryDuration)
    const phaseCopy = {
      acute: 'Acute phase: protect the tissue, keep easy blood flow, avoid painful ranges.',
      subacute: 'Subacute phase: gradual loading with pain not above 3/10 during or after.',
      chronic: 'Longer-standing: structured progression — small wins weekly, no hero sets.',
    }
    rehabBlocks.push({
      title: `Rehab focus (${phase})`,
      lines: [phaseCopy[phase] || phaseCopy.subacute],
    })
    intensityMultiplier = Math.min(intensityMultiplier, 0.75)
    moderateSwap = true
    extraWarmupMinutes = Math.max(extraWarmupMinutes, 10)
    changeLog.push(`Injury path (${entry.injuryDuration}) — ${phase} phase: lighter overall and technique-first loading.`)
    banners.push({
      type: 'injury',
      text: 'Rehab-first today — no regular training block until you are cleared; follow the phases below.',
    })
  }

  if (kneeRehabActive) {
    moderateSwap = true
    intensityMultiplier = Math.min(intensityMultiplier, 0.85)
  }

  const finalExclude = [...new Set(excludeExerciseIds)]
  appendSwapNotesForExcludes(finalExclude, changeLog)

  const poorStreak = await countConsecutivePoorSleepDays()
  let recoveryWeekSuggested = false
  if (poorStreak >= 3) {
    recoveryWeekSuggested = true
    changeLog.push('Three consecutive poor-sleep mornings — a recovery week (lighter volume, earlier bed, more walks) is worth considering.')
    banners.push({
      type: 'recovery',
      text: 'Three rough sleep nights in a row — consider a recovery week: fewer hard sets, more easy movement, protect sleep.',
    })
  }

  const pc = getProgramContextSync(dpw)
  const sessionSummaryTitle = sessionTitleFromProgram(pc.dayInBlock, dpw)

  if (isPostnatal(user)) {
    const band = user?.postnatal_band
    rehabBlocks.unshift({
      title: 'Pelvic floor & breath (built in)',
      lines: [pelvicFloorWarmupCue()],
    })
    rehabBlocks.push({
      title: 'Cool-down — same team',
      lines: [pelvicFloorCooldownCue()],
    })
    changeLog.push(postnatalPhaseGuidance(band) || 'Postnatal path: we bias recovery-friendly work first.')
    banners.push({
      type: 'postnatal',
      text: 'Pelvic floor and breath are woven into warm-up and cool-down — simple language, no clinic vibe.',
    })
  }

  if (isPregnant(user)) {
    const tri = user?.pregnancy_trimester
    banners.push({
      type: 'pregnancy',
      text: 'Pregnancy training stays conservative — stop for pain, bleeding, dizziness, or anything your team would want to know about.',
    })
    changeLog.push(pregnancyExerciseGuidance(tri))
  }

  if (isPostnatal(user) && user?.postnatal_band === '0-6') {
    intensityMultiplier = Math.min(intensityMultiplier, 0.55)
    moderateSwap = true
    momMicroSession = true
    momShorterSession = true
    changeLog.push(
      'Early postpartum: walking, breathing, and gentle core connection — we keep load light until you are cleared for more.',
    )
    banners.push({
      type: 'postnatal-early',
      text: '0–6 weeks: gentle movement priority. Follow your clinician’s guidance for anything beyond easy walking.',
    })
  }

  const draftMod = {
    moderateSwap,
    excludeExerciseIds: finalExclude,
    extraWarmupMinutes,
    kneeRehabActive,
    momShorterSession,
    momMicroSession,
  }
  const estimatedMinutes = estimateSessionMinutes(levelKey, draftMod, user)

  if (user?.injuries === false) {
    rehabBlocks.splice(
      0,
      rehabBlocks.length,
      ...rehabBlocks.filter(
        (b) =>
          /pelvic floor|breath \(built|Cool-down — same team/i.test(b.title),
      ),
    )
  }

  return {
    dateKey: entry.dateKey || dateKeyLocal(),
    intensityMultiplier,
    moderateSwap,
    excludeExerciseIds: finalExclude,
    rehabBlocks,
    banners,
    changeLog,
    weightIncreaseSuggestion,
    progressionHint,
    kneeRehabActive,
    extraWarmupMinutes,
    estimatedMinutes,
    sessionSummaryTitle,
    recoveryWeekSuggested,
    consecutivePoorSleep: poorStreak,
    momShorterSession,
    momMicroSession,
  }
}

async function persistModifiers(mod, user) {
  const uid = user?.id || user?.email || ''
  if (!uid || typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(`${MODIFIERS_KEY}_${uid}`, JSON.stringify(mod))
  } catch {
    /* ignore */
  }
}

/**
 * Call after saving a morning check-in.
 * @param {MorningCheckInEntry} entry
 * @param {object} [user]
 */
export async function applyCheckInAndStoreModifiers(entry, user) {
  const level = mapExperienceToTrainLevel(user?.experience_level)
  const mod = await computeSessionModifiersFromCheckIn(entry, {
    level,
    daysPerWeek: user?.days_per_week || 3,
    experienceLevel: user?.experience_level,
    user,
  })
  persistModifiers(mod, user)

  if ((await countConsecutiveKneeSoreDays()) >= 3) {
    updateUserProfile({ knee_rehab_program: true })
  }
  if (entry.body === 'injury') {
    updateUserProfile({ coach_rehab_only: true, coach_rehab_since: entry.dateKey })
  }
  if (entry.body === 'sore' && entry.soreRegion && (await countConsecutiveSoreRegionDays(entry.soreRegion)) >= 5) {
    updateUserProfile({ sore_rehab_auto: true, sore_rehab_region: entry.soreRegion })
  }
  return mod
}

/**
 * Copy for the post-check-in summary card on Home.
 */
export function buildCheckInSummaryLines({ entry, mod, user }) {
  const level = mapExperienceToTrainLevel(user?.experience_level)
  const lines = []
  const title = mod?.sessionSummaryTitle || 'Today’s session'
  lines.push(`${title} — tailored to how you checked in.`)

  if (entry.body === 'sore' && entry.soreRegion) {
    lines.push(
      `Session adjusted for ${entry.soreRegion.replace('_', ' ')} soreness (${entry.soreSide || 'side'}, level ${entry.soreLevel}).`,
    )
  }
  if (entry.sleep === 'poor') {
    lines.push('Intensity reduced ~20%, compounds swapped for accessories, extra warm-up added.')
  }
  if (mod?.changeLog?.length) {
    const swaps = mod.changeLog.filter(
      (l) => l.includes('replaced') || l.includes('swapped') || l.includes('→'),
    )
    swaps.slice(0, 2).forEach((l) => lines.push(l))
  }
  if (mod?.estimatedMinutes) {
    lines.push(`Estimated ${mod.estimatedMinutes} minutes including warm-up.`)
  }
  return { title, lines, minutes: mod?.estimatedMinutes, levelKey: level }
}

/** @returns {Promise<ReturnType<typeof computeSessionModifiersFromCheckIn> | { excludeExerciseIds: string[] }>} */
export async function loadTodaySessionModifiers(user) {
  const uid = user?.id || user?.email || ''
  const profileExcludes = getAllExcludedExerciseIds(user) || []
  if (!uid || typeof localStorage === 'undefined') {
    return { excludeExerciseIds: profileExcludes }
  }
  try {
    const raw = localStorage.getItem(`${MODIFIERS_KEY}_${uid}`)
    if (!raw) return { excludeExerciseIds: profileExcludes }
    const mod = JSON.parse(raw)
    if (mod.dateKey !== dateKeyLocal()) return { excludeExerciseIds: profileExcludes }
    const merged = [...new Set([...profileExcludes, ...(mod.excludeExerciseIds || [])])]
    return { ...mod, excludeExerciseIds: merged }
  } catch {
    return { excludeExerciseIds: profileExcludes }
  }
}

/**
 * Build workout list for Train: applies exclusions and moderate swap when needed.
 * @param {string} levelKey
 * @param {ReturnType<typeof computeSessionModifiersFromCheckIn>|null} mod
 */
export function buildWorkoutListForTrain(levelKey, mod) {
  let list = getTodayTrainExercisesSync('gym', new Date()).map((ex, i) => ({
    ...ex,
    order: ex.order ?? i + 1,
    _substitutedFromModerate: false,
  }))

  if (mod?.moderateSwap && list.length > 0) {
    list = list.map((ex) => ({
      ...ex,
      _substitutedFromModerate: true,
      sets: Math.max(2, (Number(ex.sets) || 3) - 1),
    }))
  }

  if (mod?.excludeExerciseIds?.length) {
    const exclude = new Set(mod.excludeExerciseIds)
    list = list.filter((ex) => !exclude.has(ex.id))
  }

  list = list.map((ex, i) => ({ ...ex, order: i + 1 }))
  return list
}

export function formatWeightHintKg(kg, multiplier) {
  if (kg == null || kg === '') return null
  const n = parseFloat(kg)
  if (Number.isNaN(n)) return kg
  return Math.round(n * multiplier * 10) / 10
}

/**
 * Short coach line after check-in is saved.
 * @param {MorningCheckInEntry} entry
 */
export function buildPostCheckInCoachCopy(entry, user) {
  const parts = []
  const mom = isMomExperience(user)
  if (entry.sleep === 'poor') {
    parts.push(
      mom
        ? 'Rough sleep noted — I have softened today’s session so you are not paying for the night twice.'
        : 'I have eased today’s session for your sleep — more warm-up, lighter loads, same consistency.',
    )
  } else if (entry.sleep === 'great') {
    parts.push('Great sleep is a performance cheat code — use it.')
  }
  if (entry.body === 'great') {
    parts.push('Body says go — run the plan with intent.')
  } else if (entry.body === 'tired') {
    parts.push('A little flat is normal — we left room in the tank.')
  } else if (entry.body === 'sore' && entry.soreRegion) {
    parts.push(
      `Noted the ${entry.soreRegion.replace('_', ' ')} (${entry.soreSide || 'side'}, level ${entry.soreLevel}) — training steps around it.`,
    )
  } else if (entry.body === 'injury') {
    parts.push(
      `Rehab-first mode (${entry.rehabPhase || 'phased'}) — quality reps, no sharp pain.`,
    )
  }
  if (mom && entry.homeHarmony === 'rough') {
    parts.push('When home is heavy, training gets smaller on purpose — still a win.')
  }
  return parts.join(' ')
}
