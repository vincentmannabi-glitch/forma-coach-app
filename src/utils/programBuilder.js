/**
 * FORMA program engine — logic only. Exercise definitions: programBuilderData.js
 */
import { EXERCISE_LIBRARY, SUPERSET_LIBRARY } from './programBuilderData.js'
import { mapExperienceToTrainLevel } from './experienceLevel.js'
import {
  normalizeGoal as normalizeGoalV2,
  getRepSchemeForGoal,
  buildWeeklySchedule,
  getCardioFinisher,
  shouldDeload,
  applyDeload,
  buildWarmUpSet,
  evaluateProgressionV2,
  handleInjuryFlag,
  REP_SCHEMES,
} from './programBuilderV2'
import { dateKeyLocal } from './foodLog.js'
import { getNutritionCycleSelections } from './nutritionCycling.js'

export const PROGRAM_STORAGE_KEY = 'forma_user_program'
export const SESSION_LOG_KEY = 'forma_session_logs'
export const TODAY_SESSION_KEY = 'forma_today_session'

function localDateKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function loadTodaySessionOverride() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(TODAY_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveTodaySessionOverride(payload) {
  if (typeof localStorage === 'undefined' || !payload) return
  try {
    localStorage.setItem(TODAY_SESSION_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function clearTodaySessionOverride() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(TODAY_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/** Default profile when no localStorage program — beginner gym fat loss 3×/wk */
export function getDefaultProgramProfile(overrides = {}) {
  return {
    id: overrides.id ?? 'forma_local_user',
    name: overrides.name ?? 'Friend',
    goal: 'fat loss',
    training_style: 'gym',
    experience_level: 'Complete beginner',
    days_per_week: 3,
    ...overrides,
  }
}

export function hasProgramSessions(program) {
  if (!program || typeof program !== 'object') return false
  if (Array.isArray(program.sessions) && program.sessions.length > 0 && !program.weeklySchedule) return true
  if (Array.isArray(program.sessionsList) && program.sessionsList.length > 0) return true
  if (Array.isArray(program.weeklySchedule) && program.weeklySchedule.some((d) => d && d.sessionKey)) return true
  if (program.sessions && typeof program.sessions === 'object' && !Array.isArray(program.sessions) && Object.keys(program.sessions).length > 0)
    return true
  return false
}

export function loadProgramFromStorage() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROGRAM_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveProgramToStorage(program) {
  if (typeof localStorage === 'undefined' || !program) return
  try {
    localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(program))
  } catch {
    /* ignore quota */
  }
}

export function resolveProgramWithFallback(programCandidate) {
  if (hasProgramSessions(programCandidate)) return programCandidate
  const stored = loadProgramFromStorage()
  if (hasProgramSessions(stored)) return stored
  return ensureProgramLoaded()
}

export function appendSessionLog(entry) {
  if (typeof localStorage === 'undefined' || !entry) return
  try {
    const raw = localStorage.getItem(SESSION_LOG_KEY)
    let list = []
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) list = parsed
    }
    list.unshift({ ...entry, id: entry.id || `sess-log-${Date.now()}` })
    localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(list.slice(0, 200)))
  } catch {
    /* ignore */
  }
}

const UPPER_INCREMENT_KG = 2.5
const LOWER_INCREMENT_KG = 5
const DELOAD_SETS_MULT = 0.6
const DELOAD_WEIGHT_MULT = 0.6
const DELOAD_REST_ADD_SEC = 30

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const LEVEL_RANK = { beginner: 0, intermediate: 1, advanced: 2 }

const EQUIPMENT_DISPLAY = {
  barbell: 'Barbell and plates',
  dumbbells: 'Dumbbells',
  kettlebell: 'Kettlebell',
  bands: 'Resistance bands',
  medicineBall: 'Medicine ball',
  bodyweight: 'Bodyweight',
  cable: 'Cable stack',
  box: 'Plyo box or step',
  bench: 'Bench',
  pullUpBar: 'Pull-up bar',
  sled: 'Sled or prowler',
  sandbag: 'Sandbag',
  foamRoller: 'Foam roller',
  trapBar: 'Trap bar',
  rings: 'Gymnastic rings',
}

const WARM_UP_PROTOCOL_1 = {
  protocolRef: 'Volume 3 Protocol 1',
  durationMinutes: [10, 12],
  title: 'Prep — mobility and activation',
  steps: [
    'Foam roll thoracic, glutes, IT band — 3 minutes (home without roller: extra floor mobility)',
    'Cat-Cow — 10 reps',
    'Hip circles — 10 each direction each hip',
    'Leg swings — 12 each leg forward and lateral',
    "World's Greatest Stretch — 5 each side",
    'Inchworm — 6 reps',
    'Deep squat hold and hip rock — 8 each side',
    'Ankle dorsiflexion drive — 10 each foot',
    'Thoracic open books — 8 each side',
    'Arm swings and chest opener — 10 reps',
  ],
}

const COOL_DOWN_PROTOCOL_2 = {
  protocolRef: 'Volume 3 Protocol 2',
  durationMinutes: [10, 12],
  title: 'Recovery — full stretch',
  steps: [
    "Child's Pose — 60–90 seconds",
    'Lying spinal twist — 45 seconds each side',
    'Figure-four glute stretch — 45 seconds each side',
    'Hip flexor half-kneeling stretch — 45 seconds each side',
    'Seated hamstring stretch — 45 seconds each side',
    'Standing calf stretch (straight and bent knee) — 30 seconds each',
    'Doorway pec stretch — 45 seconds',
    'Cross-body shoulder stretch — 30 seconds each side',
    'Supine knee to chest — 60 seconds',
  ],
}

const NUTRITION_PHILOSOPHY =
  'Do not remove the foods you love. Swap them for versions that work with your goals. Same ritual. Smarter choice. Sustainable forever.'

/**
 * FORMA Smart Snack Guide — goal-specific suggestions for UI and program.snackRecommendations.
 * @param {string} goalRaw profile.goal or normalized key
 * @returns {{ core: string[]; lateNight?: string[]; onTheGo?: string[]; hydration?: string[] }}
 */
export function getSnackRecommendations(goalRaw) {
  const g = normalizeGoal(goalRaw)
  if (g === 'fatLoss') {
    return {
      core: [
        'Cucumber rounds and tzatziki (~80 kcal)',
        'Edamame chili lime (~130 kcal, 11g protein)',
        'Air-popped popcorn with nutritional yeast (~110 kcal)',
        'Cottage cheese protein bowl (~180 kcal, 24g protein)',
        'Frozen grapes (~60 kcal)',
        'Watermelon with Tajín (~70 kcal)',
        'Hard-boiled eggs with everything bagel seasoning (~140 kcal, 12g protein)',
        'Seaweed snacks and sunflower seeds (~90 kcal)',
      ],
      lateNight: ['Casein protein pudding', 'Air-popped popcorn with cinnamon'],
      onTheGo: ['Chomps beef sticks', 'String cheese', 'Hard-boiled eggs (packaged)'],
    }
  }
  if (g === 'muscleBuilding') {
    return {
      core: [
        'Protein pudding cup — casein, slow release (~20g protein)',
        'Chocolate peanut butter protein shake (~35g protein)',
        'Tuna on rice cakes (~22g protein)',
        'Chicken salad lettuce cups (~28g protein)',
        'Homemade protein bars (~18g protein)',
        'Baked egg muffins (~18g protein)',
        'Greek yogurt mousse (~16g protein)',
        'Overnight protein oats (~28g protein)',
      ],
    }
  }
  if (g === 'strength') {
    return {
      core: [
        'Fairlife Core Power (~40g protein)',
        'Beef jerky with cheese cube',
        'Hard-boiled eggs with deli meat',
        'Almond butter on celery with dark chocolate',
      ],
    }
  }
  if (g === 'endurance' || g === 'athletic') {
    return {
      core: [
        'Pre-session: banana with almond butter',
        'Pre-session: oat bar',
        'Pre-session: corn cakes with nut butter',
        'Post-session: mango turmeric recovery smoothie',
        'Post-session: Greek yogurt, walnuts, cinnamon',
        'Post-session: overnight protein oats',
      ],
      hydration: [
        'Watermelon–mint electrolyte agua fresca',
        'Collagen iced coffee',
      ],
    }
  }
  return getSnackRecommendations('muscleBuilding')
}

function flatSnackListForProgram(goalRaw) {
  const pack = getSnackRecommendations(goalRaw)
  const out = [...(pack.core || [])]
  if (pack.lateNight?.length) out.push('Late night: ' + pack.lateNight.join('; '))
  if (pack.onTheGo?.length) out.push('On the go: ' + pack.onTheGo.join('; '))
  if (pack.hydration?.length) out.push('Hydration: ' + pack.hydration.join('; '))
  return out
}

// ——— library helpers ———

export function getLibraryExercise(id) {
  return EXERCISE_LIBRARY[Number(id)] || null
}

function libraryList() {
  return Object.keys(EXERCISE_LIBRARY).map((k) => Number(k)).sort((a, b) => a - b).map((id) => EXERCISE_LIBRARY[id])
}

function findExerciseIdByName(name) {
  const n = String(name || '').toLowerCase().trim()
  for (const ex of libraryList()) {
    if (ex.name.toLowerCase() === n) return ex.id
  }
  for (const ex of libraryList()) {
    if (ex.name.toLowerCase().includes(n) || n.includes(ex.name.toLowerCase())) return ex.id
  }
  return null
}

// ——— normalisation ———

export function normalizeGoal(goalRaw) {
  const g = String(goalRaw || '').toLowerCase()
  if (g.includes('fat')) return 'fatLoss'
  if (g.includes('muscle')) return 'muscleBuilding'
  if (g.includes('strength')) return 'strength'
  if (g.includes('endur')) return 'endurance'
  if (g.includes('athletic')) return 'athletic'
  return 'muscleBuilding'
}

export function normalizeStyle(styleRaw) {
  const s = String(styleRaw || '').toLowerCase()
  if (s.includes('gymandhome') || s.includes('gym and home') || s.includes('both') || s.includes('hybrid') || s.includes('gymandcalisthenics')) {
    return 'gymAndHome'
  }
  if (s.includes('calisthenics')) return 'home'
  if (s.includes('home')) return 'home'
  return 'gym'
}

/**
 * Auto-detects coarse training style from free-text equipment (onboarding).
 * User never selects gym vs home — equipment drives this.
 */
export function detectTrainingStyle(equipment) {
  const e = (equipment || '').toLowerCase()

  if (
    e.includes('full gym') ||
    e.includes('barbell') ||
    e.includes('squat rack') ||
    e.includes('cables') ||
    e.includes('machines')
  ) {
    return 'gym'
  }

  if (
    e.includes('dumbbells') ||
    e.includes('dumbbell') ||
    e.includes('kettlebell') ||
    e.includes('bench') ||
    e.includes('pull-up bar') ||
    e.includes('pull up bar') ||
    e.includes('chin-up bar')
  ) {
    return 'home_equipped'
  }

  if (e.includes('resistance bands') || /\bbands\b/.test(e)) {
    return 'bands'
  }

  return 'bodyweight'
}

/** Maps detected style → values stored on the user profile / Train tabs. */
export function profileTrainingFieldsFromEquipment(equipment) {
  const d = detectTrainingStyle(equipment || '')
  if (d === 'gym') {
    return { training_style: 'gym', training_styles: ['gym'], trainingStyle: 'gym' }
  }
  if (d === 'bodyweight') {
    return { training_style: 'calisthenics', training_styles: ['calisthenics'], trainingStyle: 'calisthenics' }
  }
  return { training_style: 'home workout', training_styles: ['home workout'], trainingStyle: 'home workout' }
}

/** Home workout catalog tier from onboarding equipment text. */
export function inferHomeEquipmentIdsFromEquipmentText(equipment) {
  const d = detectTrainingStyle(equipment || '')
  const e = (equipment || '').toLowerCase()
  if (d === 'bodyweight') return ['none']
  if (d === 'bands') return ['bands']
  if (d === 'gym') return ['full']
  if (e.includes('barbell') || e.includes('full gym')) return ['full']
  return ['basics']
}

function equipmentTextFromProfile(profile) {
  const parts = []
  if (profile?.equipment != null) parts.push(String(profile.equipment))
  if (Array.isArray(profile?.equipment_list)) {
    profile.equipment_list.forEach((x) => parts.push(String(x)))
  }
  return parts.filter(Boolean).join(', ')
}

function parseEquipmentProfile(profile) {
  const raw = []
  const add = (x) => {
    if (x == null) return
    if (Array.isArray(x)) x.forEach(add)
    else raw.push(String(x).toLowerCase())
  }
  add(profile?.equipment)
  add(profile?.homeEquipment)
  add(profile?.equipment_list)
  const blob = raw.join(' ')
  const set = new Set()
  const has = (re) => re.test(blob)

  if (has(/no equipment|bodyweight only|just body/)) set.add('bodyweight')
  if (has(/dumbbell/)) set.add('dumbbells')
  if (has(/kettlebell|kb\b/)) set.add('kettlebell')
  if (has(/barbell|olympic|trap bar|trapbar/)) {
    set.add('barbell')
    if (has(/trap/)) set.add('trapBar')
  }
  if (has(/band|mini band/)) set.add('bands')
  if (has(/medicine ball|med ball|slam ball/)) set.add('medicineBall')
  if (has(/sandbag/)) set.add('sandbag')
  if (has(/cable/)) set.add('cable')
  if (has(/bench|adjustable bench/)) set.add('bench')
  if (has(/box|plyo/)) set.add('box')
  if (has(/pull.?up|chin.?up bar/)) set.add('pullUpBar')
  if (has(/sled|prowler/)) set.add('sled')
  if (has(/foam roll/)) set.add('foamRoller')
  if (has(/ring|trx/)) set.add('rings')
  const blobHasEquipmentHints = blob.trim().length > 0
  if (
    set.size === 0 &&
    !blobHasEquipmentHints &&
    normalizeStyle(profile?.trainingStyle ?? profile?.training_style) === 'gym'
  ) {
    ;['barbell', 'dumbbells', 'kettlebell', 'cable', 'bench', 'box', 'pullUpBar', 'bands', 'medicineBall'].forEach((x) => set.add(x))
  }
  if (
    set.size === 0 &&
    !blobHasEquipmentHints &&
    normalizeStyle(profile?.trainingStyle ?? profile?.training_style) === 'home'
  ) {
    set.add('bodyweight')
  }
  return set
}

function hasGoodHomeEquipment(equipSet) {
  const hasDb = equipSet.has('dumbbells')
  const hasBand = equipSet.has('bands')
  const hasPu = equipSet.has('pullUpBar')
  return hasDb && (hasBand || hasPu)
}

function gymHomeCounts(days, goodHome) {
  const d = Math.max(2, Math.min(6, days))
  if (d === 2) return { gym: 1, home: 1 }
  if (d === 3) return { gym: 2, home: 1 }
  if (d === 4) return goodHome ? { gym: 2, home: 2 } : { gym: 3, home: 1 }
  if (d === 5) return { gym: 3, home: 2 }
  return { gym: 4, home: 2 }
}

// ——— level / equipment gates ———

function userLevelRank(profile) {
  return LEVEL_RANK[mapExperienceToTrainLevel(profile?.experienceLevel ?? profile?.experience_level)] ?? 0
}

function exerciseLevelAllowed(ex, userRank) {
  const er = LEVEL_RANK[ex.experienceLevel] ?? 0
  return er === userRank
}

function exerciseAllowedForProfile(ex, environment, equipSet, profile) {
  if (!exerciseLevelAllowed(ex, userLevelRank(profile))) return false
  const tags = ex.equipment
  if (tags.length === 0) return true
  for (const tag of tags) {
    if (tag === 'bodyweight') continue
    if (tag === 'bench' && environment === 'home' && !equipSet.has('bench')) continue
    if (!equipSet.has(tag)) return false
  }
  return true
}

// ——— injury ———

function readInjuryFlags(profile) {
  const arr = Array.isArray(profile?.injuries) ? profile.injuries : []
  const s = [...arr, profile?.injuries_details, profile?.injury].join(' ').toLowerCase()
  return {
    knee: /knee/.test(s),
    shoulder: /shoulder/.test(s),
    lowerBack: /lower back|lumbar|disc/.test(s),
  }
}

function isExerciseBlockedByInjury(ex, flags) {
  const n = String(ex?.name || '').toLowerCase()
  if (!n) return false
  if (flags.knee) {
    if (
      n.includes('jump squat') ||
      n.includes('broad jump') ||
      n.includes('box jump') ||
      n.includes('walking lunge') ||
      n.includes('burpee')
    ) return true
  }
  if (flags.lowerBack) {
    if (
      n.includes('romanian deadlift') ||
      n.includes('good morning') ||
      (n.includes('deadlift') && !n.includes('single leg'))
    ) return true
  }
  if (flags.shoulder) {
    if (n.includes('overhead press standing') || n.includes('upright row')) return true
  }
  return false
}

function applyInjuryNameExclusions(list, flags) {
  return (list || []).filter((ex) => !isExerciseBlockedByInjury(ex, flags))
}

const KNEE_SAFE_IDS = new Set([19, 16, 54, 56, 57, 17, 63, 39, 45, 46, 64, 41, 59, 51, 48, 68])
const SHOULDER_SAFE_IDS = new Set([45, 61, 64, 40, 39, 63, 41, 59, 30, 26, 37])
const BACK_SAFE_IDS = new Set([51, 68, 54, 48, 16, 66, 67, 69, 70])

function isKneeContraindicated(ex) {
  const n = ex.name.toLowerCase()
  if (/wall sit|glute bridge|hip thrust|extension|abduction|curl|pull through|good morning|hinge/.test(n) && !/squat|lunge|step|jump|pistol|leg press|wall ball|thruster|burpee/.test(n)) {
    if (ex.movementPattern === 'hinge' && !/squat/.test(n)) return false
  }
  if (ex.movementPattern === 'squat') return !/wall sit/.test(n)
  if (/lunge|step-up|pistol|jump|box jump|burpee|wall ball|thruster|sprint|ski erg|row/i.test(n)) return true
  if (ex.movementPattern === 'power' && /jump|burpee|clean|snatch|slam|bound/i.test(n)) return true
  return false
}

function isShoulderContraindicated(ex) {
  const n = ex.name.toLowerCase()
  return (
    ex.movementPattern === 'push' &&
    (/overhead|ohp|jerk|snatch|wall ball|thruster|arnold|strict press|half kneeling press/i.test(n) || /landmine press/i.test(n))
  ) || /snatch|jerk/i.test(n)
}

function isBackContraindicated(ex) {
  const n = ex.name.toLowerCase()
  if (/deadlift|good morning|rdl|romanian|row|pendlay|meadows|shrug/i.test(n) && /barbell|trap/i.test(n)) return true
  if (ex.name.includes('Barbell') && ex.movementPattern === 'hinge') return true
  return false
}

function injurySubstituteId(ex, flags, userRank) {
  const fromPool = (ids, fallbackId) => {
    const ranked = [...ids]
      .map((id) => getLibraryExercise(id))
      .filter(Boolean)
      .filter((cand) => cand.id !== ex.id && exerciseLevelAllowed(cand, userRank))
    if (ranked.length) return ranked[0].id
    const fallback = getLibraryExercise(fallbackId)
    if (fallback && exerciseLevelAllowed(fallback, userRank)) return fallback.id
    return null
  }
  if (flags.knee && isKneeContraindicated(ex)) {
    return fromPool(KNEE_SAFE_IDS, 54)
  }
  if (flags.shoulder && isShoulderContraindicated(ex)) {
    return fromPool(SHOULDER_SAFE_IDS, 45)
  }
  if (flags.lowerBack && isBackContraindicated(ex)) {
    return fromPool(BACK_SAFE_IDS, 51)
  }
  return null
}

// ——— rep / rest schemes ———

function repSchemeForGoal(goal) {
  return getRepSchemeForGoal(goal)
}

function applyDeloadToScheme(scheme, deload) {
  if (!deload) return scheme
  const sets = Math.max(2, Math.round(scheme.sets * DELOAD_SETS_MULT))
  return {
    ...scheme,
    sets,
    repsPerSet: scheme.repsPerSet.slice(0, sets),
    restSeconds: scheme.restSeconds + DELOAD_REST_ADD_SEC,
    deload: true,
  }
}

// ——— load region & weight suggestion ———

function loadRegionForExercise(ex) {
  const blob = `${ex.name} ${ex.section}`.toLowerCase()
  if (/(squat|lunge|leg|glute|hamstring|hip thrust|deadlift|rdl|hinge|step|calf|pistol|swing|jump|wall sit|extension|knee)/.test(blob)) {
    return 'lower'
  }
  return 'upper'
}

function loadTypeForFormula(ex) {
  const eq = ex.equipment
  if (eq.includes('barbell') || eq.includes('trapBar')) return 'barbell'
  if (eq.includes('dumbbells')) return 'dumbbell'
  if (eq.includes('kettlebell')) return 'dumbbell'
  return 'other'
}

export function buildWeightSuggestionText(ex, bodyweightKg, experienceLevel) {
  const bw = Math.max(45, Number(bodyweightKg) || 70)
  const level = mapExperienceToTrainLevel(experienceLevel)
  const region = loadRegionForExercise(ex)
  const lt = loadTypeForFormula(ex)
  const upper = region !== 'lower'

  const pct = (lo, hi) => `${lo}–${hi}% bodyweight (~${Math.round((bw * lo) / 100 / 2.5) * 2.5}–${Math.round((bw * hi) / 100 / 2.5) * 2.5} kg)`

  if (lt === 'other' || ex.equipment.every((t) => t === 'bodyweight' || t === 'bands')) {
    return 'Bodyweight or light band — follow regression if needed.'
  }

  if (level === 'beginner') {
    if (lt === 'dumbbell' && upper) return `DB upper: ${pct(10, 20)} per hand where applicable.`
    if (lt === 'dumbbell' && !upper) return `DB lower: ${pct(20, 30)} total or per hand as programmed.`
    if (lt === 'barbell' && upper) return `Barbell upper: ${pct(30, 50)} total load guideline.`
    return `Barbell lower: ${pct(50, 70)} total load guideline.`
  }
  if (level === 'intermediate') {
    if (lt === 'dumbbell' && upper) return `DB upper: ${pct(20, 35)} per hand where applicable.`
    if (lt === 'barbell' && upper) return `Barbell upper: ${pct(50, 80)} total load guideline.`
    return `Barbell lower: ${pct(80, 120)} total load guideline.`
  }
  if (lt === 'barbell' && upper) return `Barbell upper: ${pct(80, 150)} total load guideline.`
  return `Barbell lower: ${pct(120, 200)} total load guideline.`
}

// ——— session focus & selection ———

const FOCUS_LOWER = (ex) =>
  ['squat', 'hinge'].includes(ex.movementPattern) ||
  (ex.section || '').includes('Lower') ||
  /lunge|step|pistol|swing|carry|sled|jump squat|box jump/.test(ex.name)

const FOCUS_PUSH = (ex) => ex.movementPattern === 'push' && !/row|curl|face pull|pulldown/i.test(ex.name)
const FOCUS_PULL = (ex) => ex.movementPattern === 'pull' || /face pull|pulldown|row|curl/i.test(ex.name)
const FOCUS_CORE = (ex) => ex.movementPattern === 'core'
const COMPOUNDISH = (ex) =>
  ['squat', 'hinge', 'push', 'pull', 'power'].includes(ex.movementPattern) &&
  !/lateral raise|front raise|shrug|curl|pushdown|extension|fly|face pull|hammer/i.test(ex.name)

function rotatePool(pool, weekIndex) {
  if (!pool.length) return pool
  const w = Number(weekIndex) || 0
  const start = w % pool.length
  return [...pool.slice(start), ...pool.slice(0, start)]
}

function pickUniqueByFocus(candidates, count, usedIds, preferCompound) {
  const out = []
  const pool = preferCompound ? [...candidates].sort((a, b) => Number(COMPOUNDISH(b)) - Number(COMPOUNDISH(a))) : candidates
  for (const ex of pool) {
    if (out.length >= count) break
    if (usedIds.has(ex.id)) continue
    out.push(ex)
    usedIds.add(ex.id)
  }
  return out
}

function selectExercisesForFocus(focus, environment, equipSet, profile, weekIndex, injuryFlags, count = 7) {
  if (focus === 'upper') {
    const pushSide = selectExercisesForFocus('upperPush', environment, equipSet, profile, weekIndex, injuryFlags, 5)
    const pullSide = selectExercisesForFocus('upperPull', environment, equipSet, profile, weekIndex + 11, injuryFlags, 5)
    const merged = [...pushSide.slice(0, 3), ...pullSide.slice(0, 3)]
    const cores = selectExercisesForFocus('core', environment, equipSet, profile, weekIndex + 3, injuryFlags, 4)
    const out = []
    const seen = new Set()
    for (const e of [...merged, ...cores]) {
      if (e && !seen.has(e.id)) {
        seen.add(e.id)
        out.push(e)
      }
      if (out.length >= count) break
    }
    return out.slice(0, count)
  }

  const levelR = userLevelRank(profile)
  const list = applyInjuryNameExclusions(
    libraryList().filter((ex) => exerciseLevelAllowed(ex, levelR) && exerciseAllowedForProfile(ex, environment, equipSet, profile)),
    injuryFlags,
  )

  let filtered = list
  if (focus === 'lower') filtered = list.filter(FOCUS_LOWER)
  else if (focus === 'upperPush') filtered = list.filter(FOCUS_PUSH)
  else if (focus === 'upperPull') filtered = list.filter(FOCUS_PULL)
  else if (focus === 'legs') filtered = list.filter(FOCUS_LOWER)
  else if (focus === 'push') filtered = list.filter(FOCUS_PUSH)
  else if (focus === 'pull') filtered = list.filter(FOCUS_PULL)
  else if (focus === 'core') filtered = list.filter(FOCUS_CORE)
  else if (focus === 'fullBody') {
    filtered = list.filter((ex) => FOCUS_LOWER(ex) || FOCUS_PUSH(ex) || FOCUS_PULL(ex) || FOCUS_CORE(ex))
  }

  if (filtered.length < 4) filtered = list

  filtered = rotatePool(filtered, weekIndex)
  const used = new Set()
  const compounds = pickUniqueByFocus(filtered.filter(COMPOUNDISH), 2, used, true)
  const next = pickUniqueByFocus(filtered.filter((e) => !used.has(e.id)), Math.min(3, count - compounds.length), used, false)
  const corePick = pickUniqueByFocus(filtered.filter(FOCUS_CORE).filter((e) => !used.has(e.id)), Math.max(0, count - compounds.length - next.length), used, false)
  let all = [...compounds, ...next, ...corePick]
  while (all.length < count && all.length < filtered.length) {
    const add = filtered.find((e) => !used.has(e.id))
    if (!add) break
    used.add(add.id)
    all.push(add)
  }
  return all.slice(0, count)
}

function sessionFocusFromSplit(splitId, dayIndex, days) {
  if (splitId === 'fullBody') return 'fullBody'
  if (splitId === 'upperLower') return dayIndex % 2 === 0 ? 'upperPush' : 'lower'
  if (splitId === 'pushPullLegs') {
    const m = dayIndex % 5
    if (m === 0) return 'push'
    if (m === 1) return 'pull'
    if (m === 2) return 'legs'
    if (m === 3) return 'upperPush'
    return 'lower'
  }
  if (splitId === 'pushPullLegsX2') {
    const m = dayIndex % 6
    if (m === 0 || m === 3) return 'push'
    if (m === 1 || m === 4) return 'pull'
    return 'legs'
  }
  return 'fullBody'
}

// For full body we want balanced selection
function selectFullBody(environment, equipSet, profile, weekIndex, injuryFlags) {
  const levelR = userLevelRank(profile)
  const base = libraryList().filter((ex) => exerciseLevelAllowed(ex, levelR) && exerciseAllowedForProfile(ex, environment, equipSet, profile))
  const inj = (ex) => {
    const s = injurySubstituteId(ex, injuryFlags, levelR)
    return s ? getLibraryExercise(s) : ex
  }
  const clean = applyInjuryNameExclusions(
    [...new Map(base.map((e) => [e.id, inj(e)])).values()],
    injuryFlags,
  )

  const pick = (pred, n) => rotatePool(clean.filter(pred), weekIndex).slice(0, n)
  const lower1 = pick((e) => FOCUS_LOWER(e) && COMPOUNDISH(e) && e.movementPattern === 'squat', 5)[0]
  const lower2 = pick((e) => FOCUS_LOWER(e) && COMPOUNDISH(e) && e.movementPattern === 'hinge', 5)[0]
  const push1 = pick((e) => FOCUS_PUSH(e) && COMPOUNDISH(e), 5)[0]
  const pull1 = pick((e) => FOCUS_PULL(e) && COMPOUNDISH(e), 5)[0]
  const acc = pick((e) => !COMPOUNDISH(e) && !FOCUS_CORE(e), 10).slice(0, 2)
  const cores = pick(FOCUS_CORE, 8).slice(0, 2)
  const out = [lower1, lower2, push1, pull1, ...acc, ...cores].filter(Boolean)
  return out.slice(0, 9)
}

// ——— supersets ———

function monthsTraining(profile) {
  const m = Number(profile?.monthsTraining ?? profile?.months_training)
  if (Number.isFinite(m)) return m
  const map = { beginner: 3, intermediate: 18, advanced: 36 }
  return map[mapExperienceToTrainLevel(profile?.experienceLevel ?? profile?.experience_level)] ?? 6
}

function allowSupersets(profile) {
  const level = mapExperienceToTrainLevel(profile?.experienceLevel ?? profile?.experience_level)
  if (level === 'intermediate' || level === 'advanced') return true
  return monthsTraining(profile) > 3
}

function supersetAllowedForCatalog(goal, sessionFocus, level, ssIndex, type) {
  const upper = /push|pull|upper/.test(sessionFocus)
  const i = ssIndex
  if (type === 'antagonist') return (goal === 'muscleBuilding' || goal === 'athletic') && upper && i >= 1 && i <= 12
  if (type === 'agonist') return goal === 'muscleBuilding' && upper && (level === 'intermediate' || level === 'advanced') && i >= 13 && i <= 22
  if (type === 'preExhaust') return goal === 'muscleBuilding' && upper && level === 'advanced' && i >= 23 && i <= 30
  if (type === 'postExhaust') return goal === 'muscleBuilding' && upper && (level === 'intermediate' || level === 'advanced') && i >= 31 && i <= 38
  if (type === 'contrast') return (goal === 'athletic') && upper && i >= 39 && i <= 46
  if (type === 'functionalComplex' || type === 'conditioning')
    return (goal === 'fatLoss' || goal === 'athletic') && i >= 47 && i <= 60
  return false
}

function pickSupersetForSession(goal, sessionFocus, profile, weekOffset = 0) {
  if (!allowSupersets(profile)) return null
  const level = mapExperienceToTrainLevel(profile?.experienceLevel ?? profile?.experience_level)
  const start = ((Number(weekOffset) || 0) % 60) + 1

  for (let k = 0; k < 60; k++) {
    const i = ((start + k - 1) % 60) + 1
    const ss = SUPERSET_LIBRARY[`SS${i}`]
    if (!ss || !supersetAllowedForCatalog(goal, sessionFocus, level, i, ss.type)) continue
    const id1 = findExerciseIdByName(ss.exercise1)
    const id2 = findExerciseIdByName(ss.exercise2)
    if (id1 && id2) return { ss, id1, id2 }
  }
  return null
}

// ——— equipment list & sharing ———

function canonicalEquipmentTags(ex) {
  return [...ex.equipment].sort()
}

function buildEquipmentDeduped(movements) {
  const seen = new Map()
  const list = []
  const firstIntro = new Map()

  for (const m of movements) {
    const ex = getLibraryExercise(m.exerciseNumber)
    if (!ex) continue
    for (const tag of canonicalEquipmentTags(ex)) {
      const label = EQUIPMENT_DISPLAY[tag] || tag
      if (!seen.has(tag)) {
        seen.set(tag, true)
        list.push(label)
        firstIntro.set(tag, m.exerciseName)
      } else {
        m.sharesEquipmentWith = m.sharesEquipmentWith || firstIntro.get(tag) || null
      }
    }
  }
  return list
}

// ——— Conditioning finishers (metabolic circuits) ———

function conditioningFinisherBlock(level, goal) {
  if (goal !== 'fatLoss' && goal !== 'athletic') return null
  const lv = mapExperienceToTrainLevel(level) || 'beginner'
  if (lv === 'advanced') {
    return {
      tier: 'advanced',
      structure: '6 rounds, minimal rest, race pace',
      movements: [
        { name: '200m row, ski erg, or 400m run', reps: '1' },
        { name: 'Kettlebell Snatch', reps: '10 each arm' },
        { name: 'Double KB front rack carry', reps: '50m' },
        { name: 'Medicine ball rotational slam', reps: '10 each side' },
        { name: 'Barbell sumo high pull', reps: '8' },
        { name: 'Overhead dumbbell walking lunge', reps: '20m' },
        { name: 'Sandbag over shoulder', reps: '6' },
      ],
    }
  }
  if (lv === 'intermediate') {
    return {
      tier: 'intermediate',
      structure: '5 rounds EMOM or AMRAP 20 minutes',
      movements: [
        { name: 'Kettlebell Swing', reps: '15' },
        { name: 'Medicine ball deadball over shoulder', reps: '5 each' },
        { name: 'KB single-arm farmers carry', reps: '30m' },
        { name: 'Burpee broad jump', reps: '6' },
        { name: 'Renegade row', reps: '8 each arm' },
        { name: 'Wall ball', reps: '12' },
      ],
    }
  }
  return {
    tier: 'beginner',
    structure: '4 rounds — 40s work / 20s rest',
    movements: [
      { name: 'KB Goblet Squat', reps: '10' },
      { name: 'Med ball slam', reps: '8' },
      { name: 'Banded lateral walk', reps: '10 each side' },
      { name: 'Farmers carry', reps: '20m' },
      { name: 'Push-up', reps: '10' },
      { name: 'Banded face pull', reps: '15' },
    ],
  }
}

function clampSessionDuration(minutesRaw) {
  const v = Number(minutesRaw)
  if (v <= 30) return 30
  if (v <= 45) return 45
  if (v <= 60) return 60
  if (v <= 75) return 75
  return 90
}

function sessionPlanForDuration(sessionMinutes, goal) {
  const min = clampSessionDuration(sessionMinutes)
  if (min === 30) {
    return { sessionMinutes: 30, movements: 5, finisherMode: 'none', warmUpMinutes: 5, coolDownMinutes: 2, shortCoolDownOnly: true }
  }
  if (min === 45) {
    return { sessionMinutes: 45, movements: 6, finisherMode: 'none', warmUpMinutes: 7, coolDownMinutes: 5, shortCoolDownOnly: false }
  }
  if (min === 60) {
    const finisherOptional = goal === 'fatLoss' || goal === 'athletic'
    return { sessionMinutes: 60, movements: 7, finisherMode: finisherOptional ? 'optional' : 'none', warmUpMinutes: 10, coolDownMinutes: 10, shortCoolDownOnly: false }
  }
  if (min === 75) {
    const include = goal === 'fatLoss' || goal === 'athletic'
    return { sessionMinutes: 75, movements: 8, finisherMode: include ? 'included' : 'none', warmUpMinutes: 10, coolDownMinutes: 10, shortCoolDownOnly: false }
  }
  return { sessionMinutes: 90, movements: 9, finisherMode: 'included', warmUpMinutes: 10, coolDownMinutes: 10, shortCoolDownOnly: false }
}

function warmUpForSession(base, minutes) {
  if (minutes >= 10) return base
  if (minutes === 7) return { ...base, durationMinutes: [7, 7], steps: base.steps.slice(0, 7) }
  return { ...base, durationMinutes: [5, 5], steps: base.steps.slice(0, 5) }
}

function coolDownForSession(minutes, shortOnly = false) {
  if (shortOnly) {
    return {
      protocolRef: 'Quick cool-down',
      durationMinutes: [2, 2],
      title: 'Recovery — 2 stretches',
      steps: ['Figure-four glute stretch — 45 seconds each side', 'Hip flexor half-kneeling stretch — 45 seconds each side'],
    }
  }
  if (minutes <= 5) {
    return {
      ...COOL_DOWN_PROTOCOL_2,
      durationMinutes: [5, 5],
      steps: COOL_DOWN_PROTOCOL_2.steps.slice(0, 5),
    }
  }
  return COOL_DOWN_PROTOCOL_2
}

// ——— movement row ———

function withinSessionLoadCue(goalNorm) {
  switch (goalNorm) {
    case 'fatLoss':
      return ' Within session: add load each set as reps drop; aim ~+5–10% from set 1→2, then heavier on sets 3–4.'
    case 'muscleBuilding':
      return ' Within session: classic pyramid — increase load each set while hitting the rep targets.'
    case 'strength':
      return ' Within session: heaviest quality sets early; set 4 should match or beat set 3.'
    case 'endurance':
      return ' Within session: same load all sets; increase weight next session only if all four sets were clean.'
    case 'athletic':
      return ' Within session: wave loading — adjust load to stay explosive on low-rep sets and continuous on the 10s.'
    default:
      return ''
  }
}

function buildMovementRow(order, ex, scheme, profile, injuryFlags, opts) {
  const warmUp = buildWarmUpSet(ex, opts?.goalNormalized || normalizeGoal(profile?.goal))
  const deload = opts?.deloadActive
  const goalNorm = opts?.goalNormalized || normalizeGoal(profile?.goal)
  const sets = scheme.sets
  const repsPerSet = [...scheme.repsPerSet]
  const repsStr = repsPerSet.join('/')
  const sub = injurySubstituteId(ex, injuryFlags, userLevelRank(profile))
  const finalEx = sub ? getLibraryExercise(sub) : ex
  const e = finalEx || ex

  const baseWeightText = buildWeightSuggestionText(e, profile.bodyweight ?? profile.body_weight, profile.experienceLevel ?? profile.experience_level)

  return {
    order,
    exerciseName: e.name,
    exerciseNumber: e.id,
    sets,
    reps: repsStr,
    repsPerSet,
    restSeconds: scheme.restSeconds,
    weightSuggestion: baseWeightText + withinSessionLoadCue(goalNorm),
    coachingCues: e.coachingCues,
    progression: e.progression,
    regression: e.regression,
    isSuperset: false,
    supersetPartner: null,
    supersetType: null,
    equipmentRequired: e.equipment.map((t) => EQUIPMENT_DISPLAY[t] || t).join(', ') || 'Bodyweight',
    sharesEquipmentWith: null,
    substitutionNote: sub ? `Adjusted from library for your profile — regression: ${e.regression}` : null,
    deloadWeightMultiplier: deload ? DELOAD_WEIGHT_MULT : 1,
    warmUpSet: warmUp,
  }
}

function mergeSupersetPair(movements, pair) {
  const i1 = movements.findIndex((m) => m.exerciseNumber === pair.id1)
  const i2 = movements.findIndex((m) => m.exerciseNumber === pair.id2)
  if (i1 < 0 || i2 < 0) return movements
  const a = movements[Math.min(i1, i2)]
  const b = movements[Math.max(i1, i2)]
  a.isSuperset = true
  a.supersetPartner = b.exerciseName
  a.supersetType = pair.ss.type
  b.isSuperset = true
  b.supersetPartner = a.exerciseName
  b.supersetType = pair.ss.type
  return movements
}

// ——— weekly schedule ———

function trainingDayNames(daysPerWeek) {
  if (daysPerWeek === 2) return ['Monday', 'Thursday']
  if (daysPerWeek === 3) return ['Monday', 'Wednesday', 'Friday']
  if (daysPerWeek === 4) return ['Monday', 'Tuesday', 'Thursday', 'Friday']
  if (daysPerWeek === 5) return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
}

function splitMeta(daysPerWeek) {
  const d = Math.max(2, Math.min(6, daysPerWeek))
  if (d === 2) return { id: 'fullBody', sessionTypes: ['fullBody', 'fullBody'] }
  if (d === 3) return { id: 'fullBody', sessionTypes: ['fullBody', 'fullBody', 'fullBody'] }
  if (d === 4) return { id: 'upperLower', sessionTypes: ['upper', 'lower', 'upper', 'lower'] }
  if (d === 5) return { id: 'pushPullLegs', sessionTypes: ['push', 'pull', 'legs', 'upper', 'lower'] }
  return { id: 'pushPullLegsX2', sessionTypes: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] }
}

// ——— train UI shape ———

export function sessionToTrainExercises(session) {
  const moves = Array.isArray(session?.movements)
    ? session.movements
    : Array.isArray(session?.exercises)
      ? session.exercises
      : []
  return moves.map((m) => {
    const parts = (m.reps || '').split('/').map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n))
    const repRange = parts.length ? [Math.min(...parts), Math.max(...parts)] : [8, 12]
    return {
      id: `ex-${m.exerciseNumber}-${m.order}`,
      name: m.exerciseName || m.name || m.displayName || 'Exercise',
      displayName: m.exerciseName || m.displayName || m.name || 'Exercise',
      order: m.order,
      sets: m.sets,
      repsScheme: m.reps,
      repsPerSet: m.repsPerSet,
      repRange,
      restSeconds: m.restSeconds,
      description: m.coachingCues,
      coachingCues: m.coachingCues,
      weightSuggestion: m.weightSuggestion,
      equipmentRequired: m.equipmentRequired,
      progression: m.progression,
      regression: m.regression,
      exerciseNumber: m.exerciseNumber,
      musclesWorked: getLibraryExercise(m.exerciseNumber)?.musclesWorked?.join(', ') || '',
    }
  })
}

function legacyTrainSession(session, entry) {
  return {
    id: entry.sessionKey,
    name: entry.sessionName || session.name,
    style: entry.environment,
    environment: entry.environment,
    exercises: sessionToTrainExercises(session),
    conditioningFinisher: session.conditioningFinisher,
    conditioningFinisherOptional: session.conditioningFinisherOptional,
    sessionEquipmentList: session.sessionEquipmentList,
    estimatedDuration: session.estimatedDuration,
    warmUp: session.warmUp,
    coolDown: session.coolDown,
  }
}

export function getTodaySession(program, date = new Date()) {
  if (!program) return null
  if (Array.isArray(program.sessions) && program.sessions.length && !program.weeklySchedule) {
    const idx = date.getDay() % program.sessions.length
    return program.sessions[idx]
  }
  if (!program.weeklySchedule?.length) {
    if (Array.isArray(program.sessionsList) && program.sessionsList.length) {
      const idx = date.getDay() % program.sessionsList.length
      return program.sessionsList[idx]
    }
    return null
  }
  const dayName = DAY_NAMES[date.getDay()]
  const entry = program.weeklySchedule.find((d) => d.day === dayName)
  if (!entry || entry.environment === 'rest') {
    return {
      id: 'rest',
      name: 'Recovery day',
      environment: 'rest',
      exercises: [],
      style: 'rest',
    }
  }
  const sess = program.sessions?.[entry.sessionKey]
  if (!sess) return null
  const built = legacyTrainSession(sess, entry)
  if (Array.isArray(built.exercises) && built.exercises.length > 0) return built
  const fallbackMoves = Array.isArray(program.sessions?.[entry.sessionKey]?.movements)
    ? program.sessions[entry.sessionKey].movements
    : []
  if (!fallbackMoves.length) return built
  return {
    ...built,
    exercises: sessionToTrainExercises({ movements: fallbackMoves }),
  }
}

const STYLE_IDS = ['gym', 'home', 'gymAndHome', 'calisthenics', 'both']

function canonicalTrainStyleId(styleId) {
  const s = String(styleId || '').toLowerCase()
  if (s === 'both' || s === 'hybrid' || s.includes('gymand') || s.includes('gym and')) return 'gymAndHome'
  return styleId
}

export function getTodaySessionForStyle(program, styleId, date = new Date()) {
  const today = getTodaySession(program, date)
  if (!today) return null
  const canonical = canonicalTrainStyleId(styleId)
  if (!STYLE_IDS.includes(canonical)) return today
  if (today.environment === 'rest') return today
  if (canonical === 'gymAndHome' || canonical === 'gym') {
    if (today.environment === 'gym' || today.environment === 'home') return today
  }
  if (canonical === 'home' && today.environment === 'home') return today
  if (canonical === 'calisthenics' && today.environment === 'home') return today
  if (canonical === 'gym' && today.environment === 'gym') return today
  const wantEnv = canonical === 'home' || canonical === 'calisthenics' ? 'home' : 'gym'
  const alt = program.weeklySchedule?.find((d) => DAY_NAMES[date.getDay()] === d.day && d.environment === wantEnv)
  if (alt && program.sessions?.[alt.sessionKey]) return legacyTrainSession(program.sessions[alt.sessionKey], alt)
  return today
}

// ——— Public: assessment, deload, check-in, skip ———

export function assessExperience({ monthsTraining: months, description, gobletComfort, rdlComfort, benchComfort }) {
  const m = Number(months) || 0
  let score = 0
  if (m >= 24) score += 3
  else if (m >= 8) score += 2
  else if (m >= 3) score += 1
  const desc = String(description || '').toLowerCase()
  if (/overload|periodi|1rm|rpe|block/i.test(desc)) score += 2
  if (/class|hiit|random/i.test(desc)) score += 0
  const comforts = [gobletComfort, rdlComfort, benchComfort].filter(Boolean)
  const confident = comforts.filter((c) => /very|comfort|easy/i.test(String(c))).length
  score += confident
  if (score >= 6) return 'advanced'
  if (score >= 3) return 'intermediate'
  return 'beginner'
}

export function checkDeload(profile = {}, sessionHistory = []) {
  const weeks = Number(profile.weeksCompleted ?? profile.weeks_completed) || 0
  const checkInHistory = Array.isArray(profile.checkInHistory) ? profile.checkInHistory : []
  const result = shouldDeload(weeks, checkInHistory)
  return {
    recommendDeload: result.recommended,
    reason: result.reason || 'none',
    framing: 'Recovery Week / Performance Reset',
    message: result.message || 'Training consistently — keep it up.',
    protocol: {
      volumeReductionPercent: 40,
      weightPercent: 60,
      restAddSeconds: 30,
      noConditioningFinisher: true,
      noSupersets: true,
    },
  }
}

export function normalizeTrainingCheckIn(ui = {}) {
  const q1 = ui.q1 ?? ui.sleep
  const q2 = ui.q2 ?? ui.soreness
  const q3 = ui.q3 ?? ui.energy
  const q4 = ui.q4 ?? ui.pain
  const q5 = ui.q5 ?? ui.motivation
  return {
    sleep: q1 === 'great' ? 'great' : q1 === 'ok' ? 'ok' : q1 === 'poor' ? 'poor' : q1,
    soreness: q2 === 'none' || q2 === 'not' ? 'not' : q2 === 'slight' || q2 === 'slightly' ? 'slight' : q2 === 'very' ? 'very' : q2,
    energy: q3 === 'high' ? 'high' : q3 === 'normal' ? 'normal' : q3 === 'low' ? 'low' : q3,
    pain: q4 === 'none' || q4 === 'no' ? 'no' : q4 === 'minor' ? 'minor' : q4 === 'real' ? 'real' : q4,
    motivation:
      q5 === 'ready' ? 'ready' : q5 === 'okay' ? 'okay' : q5 === 'low' || q5 === 'really not feeling it' ? 'really not feeling it' : q5,
    painLocation: ui.painLocation,
  }
}

export function adjustSessionForCheckIn(session, checkIn = {}) {
  if (!session?.movements) return session
  const next = JSON.parse(JSON.stringify(session))
  const c = { ...normalizeTrainingCheckIn(checkIn), ...checkIn }
  const sleep = c.sleep || c.q1
  const sore = c.soreness || c.q2
  const energy = c.energy || c.q3
  const pain = c.pain || c.q4
  const motivation = c.motivation || c.q5
  const goalN = c.goalNormalized ?? normalizeGoal(c.goal ?? checkIn.goal)

  let reduceSets = 0
  let intensityDown = false
  let restAdd = 0
  let volumePct = 1
  let recoveryMode = false

  if (sleep === 'poor') {
    reduceSets += 1
    intensityDown = true
    restAdd += 15
  } else if (sleep === 'ok') {
    reduceSets += 1
  }

  if (sore === 'very') {
    volumePct *= 0.8
    if (sleep === 'poor') volumePct *= 0.75
    next.warmUp = {
      ...next.warmUp,
      extraNote: 'Add 5 minutes foam rolling (Volume 3 Protocol 1) before main work.',
    }
  } else if (sore === 'slight' && sleep === 'poor') {
    reduceSets += 1
  }

  if (energy === 'low') {
    next.movements = next.movements.slice(0, Math.max(4, next.movements.length - 1))
    next.shortSessionOptionMinutes = 20
  }
  if (energy === 'high') {
    next.morningUnlock = { bonusSetOptional: true, conditioningOptional: true }
    if (goalN === 'muscleBuilding' && !next.conditioningFinisher) {
      next.conditioningFinisherOptional = conditioningFinisherBlock(
        c.trainLevel ?? mapExperienceToTrainLevel(c.experienceLevel),
        'athletic',
      )
    }
  }

  if (pain === 'real') {
    next.activeRecoveryRecommended = true
    next.movements = next.movements.filter((m) => /bird dog|dead bug|glute bridge|pallof|plank|walk/i.test(m.exerciseName))
  } else if (pain === 'minor') {
    next.injuryFlagZone = c.painLocation || checkIn.painLocation || 'unspecified'
  }

  if (motivation === 'low' || motivation === 'really not feeling it') {
    next.shortSessionOptionMinutes = 20
    next.encouragement = 'Short session beats no session — same day, scaled down.'
  } else if (motivation === 'okay' || motivation === 'feeling okay') {
    next.encouragement = 'You showed up — that is what counts. Execute one quality set at a time.'
  }

  if (sleep === 'poor' && sore === 'very' && energy === 'low') {
    recoveryMode = true
    volumePct = 0.5
    intensityDown = true
    restAdd += 20
    next.coolDown = { ...COOL_DOWN_PROTOCOL_2, recoverySessionNote: 'Full Protocol 2 stretch emphasized today.' }
  }

  if (reduceSets > 0 || volumePct < 1) {
    next.movements = next.movements.map((m) => {
      const sets = Math.max(1, Math.round(m.sets * volumePct) - (reduceSets > 0 ? 1 : 0))
      return { ...m, sets: Math.max(2, sets), restSeconds: m.restSeconds + restAdd }
    })
  }

  if (intensityDown) {
    next.morningCheckInMeta = { ...(next.morningCheckInMeta || {}), intensityStepDown: true }
  }
  if (recoveryMode) next.sessionTheme = 'recovery'

  return next
}

/**
 * Apply check-in to today’s scheduled raw session and persist forma_today_session (train UI shape).
 */
export function buildAndSaveTodaySessionFromCheckIn(program, checkInUi, date = new Date()) {
  if (!program?.weeklySchedule?.length || !program.sessions) return null
  const dk = localDateKey(date)
  const dayName = DAY_NAMES[date.getDay()]
  const entry = program.weeklySchedule.find((d) => d.day === dayName && d.sessionKey)
  if (!entry?.sessionKey) return null
  const raw = program.sessions[entry.sessionKey]
  if (!raw?.movements) return null

  const adjPayload = {
    ...normalizeTrainingCheckIn(checkInUi),
    goalNormalized: program.goal,
    trainLevel: program.experienceLevel,
    experienceLevel: program.experienceLevel,
    painLocation: checkInUi.painLocation,
  }
  const adjusted = adjustSessionForCheckIn(JSON.parse(JSON.stringify(raw)), adjPayload)
  const legacy = legacyTrainSession(adjusted, entry)
  const payload = {
    dateKey: dk,
    programCreatedAt: program.createdAt,
    sessionKey: entry.sessionKey,
    checkIn: checkInUi,
    ...legacy,
  }
  saveTodaySessionOverride(payload)
  return payload
}

export function getTodaySessionWithOverride(program, date = new Date()) {
  const resolvedProgram = resolveProgramWithFallback(program)
  const dk = localDateKey(date)
  const override = loadTodaySessionOverride()
  if (override?.dateKey === dk && Array.isArray(override.exercises)) {
    return override
  }
  return getTodaySession(resolvedProgram, date)
}

export function resolveTrainSession(program, styleId, date = new Date()) {
  const resolvedProgram = resolveProgramWithFallback(program)
  const dk = localDateKey(date)
  const override = loadTodaySessionOverride()
  if (override?.dateKey === dk && Array.isArray(override.exercises) && override.exercises.length >= 0) {
    return { session: override, fromCheckIn: true }
  }
  return { session: getTodaySessionForStyle(resolvedProgram, styleId, date), fromCheckIn: false }
}

export function appendCompletedSessionToProgram(program, entry) {
  if (!program || typeof program !== 'object') return null
  const hist = Array.isArray(program.sessionHistory) ? [...program.sessionHistory] : []
  hist.push(entry)
  const next = { ...program, sessionHistory: hist.slice(-80) }
  saveProgramToStorage(next)
  clearTodaySessionOverride()
  return next
}

export function handleSkip(reason, exercise, sessionContext) {
  const r = String(reason || '').toLowerCase()
  const reg = exercise?.regression || getLibraryExercise(exercise?.exerciseNumber)?.regression || 'Use a lighter variation from the library.'
  if (/no equipment|equipment/.test(r)) return { action: 'substitute', useRegression: reg, message: 'Swapped to regression that needs less equipment.' }
  if (/injury|pain/.test(r)) return { action: 'substitute_or_remove', useRegression: reg, flag: true, message: 'Regression applied; flag if pain persists across sessions.' }
  if (/too hard|difficult/.test(r)) return { action: 'regress', useRegression: reg, message: 'Use regression cues from the library.' }
  if (/too easy/.test(r)) return { action: 'progress', useProgression: exercise?.progression, message: 'Progress variation or add load next set.' }
  if (/time/.test(r)) return { action: 'shorten', keepCompounds: true, message: 'Keep main lifts; drop accessories first.' }
  if (/already trained|muscle/.test(r)) return { action: 'swap_muscle', message: 'Swap to a different pattern to keep balance.' }
  if (/not feeling/.test(r)) return { action: 'swap_same_muscle', message: 'Choose another movement for the same target muscle.' }
  if (/sore/.test(r)) return { action: 'reduce_sets', setsMinus: 1, message: 'Reduce sets by one for this lift; keep the pattern.' }
  return { action: 'coach_review', message: 'Review cues and regression before continuing.' }
}

// ——— Progressive overload evaluation ———

export function evaluateProgressionForExercise({ exerciseId, region = 'upper', repRange = [8, 12], sessionHistory = [], tooEasy, failStreak = 0 }) {
  if (tooEasy) {
    return { action: 'increase', increaseKg: region === 'lower' ? LOWER_INCREMENT_KG : UPPER_INCREMENT_KG, reason: 'reported_too_easy' }
  }
  return evaluateProgressionV2({ exerciseId, region, sessionHistory, failStreak })
}

// ——— Shared loaders: all UI reads forma_user_program (build if missing) ———

export function ensureProgramLoaded() {
  let p = loadProgramFromStorage()
  if (!hasProgramSessions(p)) {
    p = buildProgram(getDefaultProgramProfile())
    saveProgramToStorage(p)
  }
  return p
}

/** Today’s exercise rows for Train/chat (same shape as legacy todaysWorkout where possible). */
export function getTodayTrainExercisesSync(styleId = 'gym', date = new Date()) {
  const program = ensureProgramLoaded()
  const { session } = resolveTrainSession(program, styleId, date)
  const raw = session?.exercises || []
  return raw.map((ex, i) => ({
    id: ex.id,
    displayName: ex.displayName || ex.name,
    name: ex.name,
    sets: ex.sets,
    repRange: ex.repRange,
    repsMin: ex.repRange?.[0],
    repsMax: ex.repRange?.[1],
    order: ex.order ?? i + 1,
    restSeconds: ex.restSeconds,
    repsScheme: ex.repsScheme,
    repsPerSet: ex.repsPerSet,
    description: ex.description || ex.coachingCues,
    progression: ex.progression,
    regression: ex.regression,
    exerciseNumber: ex.exerciseNumber,
    musclesWorked: ex.musclesWorked,
    weightSuggestion: ex.weightSuggestion,
    equipmentRequired: ex.equipmentRequired,
  }))
}

export function getProgramContextForWorkouts(program, fallbackDaysPerWeek = 3) {
  const resolvedProgram = resolveProgramWithFallback(program)
  const sched = resolvedProgram?.weeklySchedule || []
  const trainingEntries = sched.filter((w) => w.sessionKey)
  const dpw = Math.max(
    1,
    Number(resolvedProgram?.weeklyVolume?.daysPerWeek) || trainingEntries.length || fallbackDaysPerWeek,
  )
  const dayName = DAY_NAMES[new Date().getDay()]
  const todayEntry = sched.find((w) => w.day === dayName)
  const trainingDayNames = trainingEntries.map((w) => w.day)
  let dayInBlock = 1
  if (todayEntry?.sessionKey && trainingDayNames.length) {
    const idx = trainingDayNames.indexOf(dayName)
    dayInBlock = idx >= 0 ? idx + 1 : 1
  } else {
    dayInBlock = 0
  }
  const cw = Number(resolvedProgram?.progressiveOverload?.currentWeek)
  const programWeek = Number.isFinite(cw) ? cw + 1 : 1
  return {
    programWeek,
    dayInBlock,
    daysPerWeek: dpw,
    weekday: dayName,
    todaySessionName: todayEntry?.sessionName || null,
    splitId: resolvedProgram?.weeklyVolume?.splitId || null,
  }
}

function startOfWeekSunday(d) {
  const x = new Date(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * 7-day strip labels from weeklySchedule (Sunday → Saturday).
 * @returns {{ weekStartDateKey: string; days: Array<{ dateKey: string; dayIndex: number; weekdayShort: string; chipLabel: string; sessionKey: string | null }> }}
 */
export function buildCalendarWeekPlanFromProgram(program, anchorDate = new Date()) {
  const p = program && hasProgramSessions(program) ? program : ensureProgramLoaded()
  const sched = p?.weeklySchedule || []
  const start = startOfWeekSunday(anchorDate)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dk = dateKeyLocal(d)
    const dayIndex = d.getDay()
    const longName = DAY_NAMES[dayIndex]
    const entry = sched.find((w) => w.day === longName)
    let chipLabel = 'Rest'
    if (entry && entry.sessionKey) {
      const type = (entry.sessionType || 'session').replace(/([A-Z])/g, ' $1').trim()
      chipLabel = type
    }
    days.push({
      dateKey: dk,
      dayIndex,
      weekdayShort: WEEKDAY_SHORT[dayIndex],
      chipLabel,
      sessionKey: entry?.sessionKey ?? null,
    })
  }
  return {
    weekStartDateKey: dateKeyLocal(start),
    days,
    goal: p?.goal,
    splitId: p?.weeklyVolume?.splitId,
  }
}

// ——— buildProgram ———

export function buildProgram(profile = {}, opts = {}) {
  const storedProg = opts.preserveSessionHistory !== false ? loadProgramFromStorage() : null
  const sessionHistory = Array.isArray(profile?.sessionHistory)
    ? profile.sessionHistory
    : Array.isArray(storedProg?.sessionHistory)
      ? storedProg.sessionHistory
      : []

  const userId = String(profile?.id ?? profile?.userId ?? 'forma_local_user')
  const goal = normalizeGoal(profile?.goal)
  const equipmentText = equipmentTextFromProfile(profile)
  const trainingStyle = String(equipmentText).trim()
    ? normalizeStyle(detectTrainingStyle(equipmentText) === 'gym' ? 'gym' : 'home')
    : normalizeStyle(profile?.trainingStyle ?? profile?.training_style)
  const experienceLevel = mapExperienceToTrainLevel(profile?.experienceLevel ?? profile?.experience_level)
  const daysPerWeek = Math.max(2, Math.min(6, Number(profile?.daysPerWeek ?? profile?.days_per_week) || 3))
  const sessionMinutes = clampSessionDuration(profile?.sessionDuration ?? profile?.session_minutes ?? 60)
  const bodyweightKg = Number(profile?.bodyweight ?? profile?.body_weight) || 70
  const weekIndex = Number(opts.weekIndex ?? profile?.weeksCompleted ?? profile?.currentWeek ?? 0) || 0
  const equipSet = parseEquipmentProfile(profile)
  const injuryFlags = readInjuryFlags(profile)
  const deloadInfo = checkDeload({ ...profile, sessionHistory }, sessionHistory)
  const deloadActive = Boolean(opts.deloadActive)

  let scheme = repSchemeForGoal(goal)
  scheme = applyDeloadToScheme(scheme, deloadActive)

  const finisherForGoal = !deloadActive
    ? conditioningFinisherBlock(experienceLevel, goal) || conditioningFinisherBlock(experienceLevel, 'athletic')
    : null
  const timePlan = sessionPlanForDuration(sessionMinutes, goal)

  const split = splitMeta(daysPerWeek)
  const dayNames = trainingDayNames(daysPerWeek)
  const gh = trainingStyle === 'gymAndHome' ? gymHomeCounts(daysPerWeek, hasGoodHomeEquipment(equipSet)) : null

  const weeklySchedule = []
  const sessions = {}
  dayNames.forEach((day, i) => {
    const focus = split.sessionTypes[i] || 'fullBody'
    let environment = trainingStyle === 'home' ? 'home' : 'gym'
    if (trainingStyle === 'gymAndHome' && gh) {
      environment = i < gh.gym ? 'gym' : 'home'
    }

    const sessionKey = `sess-${day.toLowerCase()}-${i}`
    const sessionName = `${day} — ${focus.replace(/([A-Z])/g, ' $1').trim()}`

    let picked =
      focus === 'fullBody'
        ? selectFullBody(environment, equipSet, { ...profile, bodyweight: bodyweightKg }, weekIndex + i, injuryFlags)
        : selectExercisesForFocus(focus, environment, equipSet, { ...profile, bodyweight: bodyweightKg }, weekIndex + i, injuryFlags, timePlan.movements)

    picked = picked.slice(0, timePlan.movements)

    let movements = picked.map((ex, idx) =>
      buildMovementRow(idx + 1, ex, scheme, profile, injuryFlags, { deloadActive, goalNormalized: goal }),
    )

    const ss = pickSupersetForSession(goal, focus, profile, weekIndex + i)
    const supersetGoals = ['muscleBuilding', 'athletic', 'fatLoss']
    if (ss && !deloadActive && supersetGoals.includes(goal)) {
      movements = mergeSupersetPair(movements, ss)
    }

    const sessionEquipmentList = buildEquipmentDeduped(movements)
    const equipNeeded = [...sessionEquipmentList]

    const warmUpBase =
      environment === 'home' && !equipSet.has('foamRoller')
        ? { ...WARM_UP_PROTOCOL_1, homeNote: 'No foam roller — replace rolling with extra floor mobility from the same protocol.' }
        : WARM_UP_PROTOCOL_1
    const warmUp = warmUpForSession(warmUpBase, timePlan.warmUpMinutes)

    const conditioningFinisher = timePlan.finisherMode === 'included' ? finisherForGoal : null
    const conditioningFinisherOptional = timePlan.finisherMode === 'optional' ? finisherForGoal : null
    const coolDown = coolDownForSession(timePlan.coolDownMinutes, timePlan.shortCoolDownOnly)
    const estimatedDuration = timePlan.sessionMinutes

    sessions[sessionKey] = {
      name: sessionName,
      environment,
      warmUp,
      movements,
      conditioningFinisher,
      conditioningFinisherOptional,
      coolDown,
      estimatedDuration,
      sessionEquipmentList,
    }

    weeklySchedule.push({
      day,
      environment,
      sessionType: focus,
      sessionName,
      sessionDuration: estimatedDuration,
      equipmentNeeded: equipNeeded,
      sessionKey,
    })
  })

  for (let d = 0; d < 7; d++) {
    const name = DAY_NAMES[d]
    if (dayNames.includes(name)) continue
    weeklySchedule.push({ day: name, environment: 'rest', sessionType: 'rest', sessionName: 'Rest', sessionDuration: 0, equipmentNeeded: [], sessionKey: null })
  }

  weeklySchedule.sort((a, b) => DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day))

  const sessionsList = dayNames.map((day) => {
    const entry = weeklySchedule.find((w) => w.day === day && w.sessionKey)
    if (!entry?.sessionKey) return null
    return legacyTrainSession(sessions[entry.sessionKey], entry)
  }).filter(Boolean)

  const injuryMods = []
  if (injuryFlags.knee) injuryMods.push('Knee: compound knee-dominant work swapped for hip extension, leg extension band, and upper-body volume.')
  if (injuryFlags.shoulder) injuryMods.push('Shoulder: overhead pressing removed; lateral raises, face pulls, and supported rows emphasized.')
  if (injuryFlags.lowerBack) injuryMods.push('Lower back: heavy axial loading reduced; anti-extension core and glute emphasis.')

  const nutritionOptionsByCategory = getNutritionCycleSelections(new Date())
  const snackRecommendations = (nutritionOptionsByCategory['high protein'] || []).slice(0, 10)

  return {
    userId,
    goal,
    trainingStyle,
    experienceLevel,
    sessionHistory,
    weeklySchedule,
    sessions,
    /** @deprecated Prefer weeklySchedule + sessions; kept for UI list length */
    sessionsList,
    progressiveOverload: {
      scheme: scheme.id,
      withinSessionIncrements: {
        fatLoss: '+5–10% upper / +10% lower between sets where applicable',
        muscleBuilding: 'Progress load set to set within prescribed rep targets',
        strength: 'Heaviest sets first; match or beat set 3 on set 4',
        endurance: 'Flat load all sets; increase next session if all sets clean',
        wave: 'Alternate power and capacity sets as programmed',
      },
      sessionToSessionRules: {
        topOfHeaviestRangeTwoSessions: { upperBodyKg: UPPER_INCREMENT_KG, lowerBodyKg: LOWER_INCREMENT_KG, bodyweight: 'Harder variation or add reps' },
        failedMinimumReps: 'Hold load; flag in session notes',
        tooEasy: 'Jump to next increment immediately',
      },
      currentWeek: weekIndex,
      deloadDue: deloadInfo.recommendDeload,
    },
    morningCheckInAdjustments: {
      reference: 'Five-question check-in adjusts volume, intensity, rest, exercise selection, and finishers.',
    },
    injuries: Array.isArray(profile?.injuries) ? profile.injuries : profile?.injuries ? [profile.injuries] : [],
    injuryModifications: injuryMods,
    snackRecommendations,
    nutritionOptionsByCategory,
    nutritionPhilosophy: NUTRITION_PHILOSOPHY,
    weeklyVolume: {
      daysPerWeek,
      sessionMinutes,
      splitId: split.id,
      sessionsScheduled: dayNames.length,
    },
    nextSessionSuggestions: {
      deload: deloadInfo,
      note: 'Log all sets in session history to drive automatic progression.',
    },
    createdAt: new Date().toISOString(),
    profileSnapshot: {
      name: profile?.name || 'Friend',
      goal,
      style: trainingStyle,
      level: experienceLevel,
      daysPerWeek,
      bodyweightKg,
    },
    formulas: {
      frequencySplit: split.id,
      progressiveOverload: {
        upperIncreaseKg: UPPER_INCREMENT_KG,
        lowerIncreaseKg: LOWER_INCREMENT_KG,
        trigger: 'two_consecutive_sessions_top_of_range_heaviest_set',
      },
      deload: deloadInfo,
      prescription: scheme,
    },
  }
}
