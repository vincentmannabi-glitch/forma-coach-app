/**
 * Sport-specific knowledge for FORMA Coach chat.
 * When someone says "I am a marathon runner" the chat immediately understands
 * training demands, common injuries, nutrition needs, and strength work.
 */

import { getSportProgramById, SPORT_PROGRAMS } from './sportProgramsCatalog'

/** Keywords that identify each sport when user mentions their discipline. */
const SPORT_TRIGGERS = {
  running_5k: [
    '5k', '5 k', '5km', '5 km', 'short distance', 'parkrun', 'track runner', 'middle distance',
    'mile', '1500m', '3000m', '10k', '10 k', 'cross country', 'speed runner',
  ],
  running_marathon: [
    'marathon', 'half marathon', 'half-marathon', '21k', '42k', 'ultra', 'ultramarathon',
    'long distance runner', 'endurance runner', 'distance runner', 'london marathon',
    'boston marathon', 'ironman run', 'triathlon run',
  ],
  running_sprinter: [
    'sprinter', 'sprint', '100m', '100 m', '200m', '400m', 'track sprinter', 'short sprint',
    'athlete sprint', 'speed athlete',
  ],
  swimming_competitive: [
    'swimmer', 'swimming', 'competitive swimmer', 'pool swimmer', 'butterfly', 'freestyle',
    'backstroke', 'breaststroke', 'swim team', 'masters swimmer',
  ],
  swimming_triathlete: [
    'triathlete', 'triathlon', 'ironman', '70.3', 'multi-sport', 'brick workout',
    'swim bike run',
  ],
  track_jumpers: [
    'high jump', 'long jump', 'triple jump', 'jumper', 'jumping athlete',
  ],
  track_throwers: [
    'shot put', 'discus', 'javelin', 'hammer throw', 'thrower', 'throwing',
  ],
  track_pole_vault: [
    'pole vault', 'pole vaulter', 'pole vaulting',
  ],
  track_hurdlers: [
    'hurdler', 'hurdles', '110m hurdles', '400m hurdles',
  ],
  cycling_road: [
    'road cyclist', 'road cycling', 'endurance cyclist', 'gran fondo', 'cycling',
    'bike racing', 'tour de france', 'time trial',
  ],
  cycling_mtb: [
    'mountain bike', 'mtb', 'mountain biker', 'criterium', 'crit racing', 'cyclocross',
  ],
  rowing: [
    'rower', 'rowing', 'crew', 'erg', 'concept2', 'sculling', 'sweep',
  ],
  crossfit: [
    'crossfit', 'cross fit', 'functional fitness', 'cf', 'crossfitter', 'box',
  ],
}

/** Map onboarding sport_or_activity (free text) to program id. */
export function mapSportOrActivityToProgramId(sportOrActivity) {
  if (!sportOrActivity || typeof sportOrActivity !== 'string') return null
  const s = sportOrActivity.trim().toLowerCase()
  if (!s) return null
  if (/running|marathon|5k|10k|half|ultra|distance|sprinter/i.test(s)) return s.includes('sprint') ? 'running_sprinter' : s.includes('5k') || s.includes('10k') ? 'running_5k' : 'running_marathon'
  if (/swim|triathlon|ironman|70\.3/i.test(s)) return s.includes('tri') || s.includes('ironman') ? 'swimming_triathlete' : 'swimming_competitive'
  if (/cycl|bike|mtb|criterium/i.test(s)) return s.includes('mountain') || s.includes('mtb') || s.includes('crit') ? 'cycling_mtb' : 'cycling_road'
  if (/row|erg|crew|scull/i.test(s)) return 'rowing'
  if (/crossfit|cf|functional\s+fitness/i.test(s)) return 'crossfit'
  if (/jump|high jump|long jump|triple/i.test(s)) return 'track_jumpers'
  if (/throw|shot|discus|javelin|hammer/i.test(s)) return 'track_throwers'
  if (/pole\s*vault/i.test(s)) return 'track_pole_vault'
  if (/hurdl/i.test(s)) return 'track_hurdlers'
  return null
}

/**
 * Detect which sport(s) the user identifies with from their message or history.
 * @param {string} text — current message
 * @param {string} history — joined recent user messages
 * @returns {string | null} — sport program id or null
 */
export function detectSportFromText(text, history = '') {
  const combined = `${(text || '').toLowerCase()} ${(history || '').toLowerCase()}`
  let best = null
  let bestScore = 0

  for (const [programId, triggers] of Object.entries(SPORT_TRIGGERS)) {
    for (const trigger of triggers) {
      if (combined.includes(trigger.toLowerCase())) {
        const score = trigger.length
        if (score > bestScore) {
          bestScore = score
          best = programId
        }
      }
    }
  }

  // Explicit "I am a X" patterns
  const iAmMatch = combined.match(/\b(?:i'?m|i am|im)\s+(?:a\s+)?([\w\s]+?)(?:\s|\.|,|$)/i)
  if (iAmMatch) {
    const role = iAmMatch[1].toLowerCase().trim()
    for (const [programId, triggers] of Object.entries(SPORT_TRIGGERS)) {
      if (triggers.some((t) => role.includes(t.toLowerCase()))) {
        return programId
      }
    }
  }

  return best
}

/**
 * Get comprehensive sport knowledge for chat responses.
 * @param {string} sportProgramId
 * @returns {object | null}
 */
export function getSportKnowledge(sportProgramId) {
  const program = getSportProgramById(sportProgramId)
  if (!program) return null

  return {
    name: program.name,
    description: program.description,
    trainingDemands: program.description, // Already describes demands
    commonInjuries: program.commonInjuries || [],
    nutrition: program.nutritionGuidance,
    strengthWork: [
      `Main: ${program.mainExercises.map((e) => e.name).join(', ')}`,
      `Accessory: ${program.accessoryExercises.map((e) => e.name).join(', ')}`,
      program.combineWithForma,
    ].join('. '),
    recovery: program.recoveryGuidance,
    weeklyStructure: program.weeklyStructure,
    mobilityFocus: program.mobility.focus,
  }
}

/**
 * Build a sport-aware response block for the chat.
 * Used when user mentions their sport and asks a general question.
 */
export function buildSportContextBlock(sportProgramId) {
  const k = getSportKnowledge(sportProgramId)
  if (!k) return null

  return `SPORT CONTEXT — You are speaking to a ${k.name}. 
Training demands: ${k.trainingDemands}
Common injuries in this sport: ${k.commonInjuries.join(', ') || 'See program for details'}
Nutrition: ${k.nutrition}
Strength work that supports them: ${k.strengthWork}
Recovery: ${k.recovery}
Weekly structure: ${k.weeklyStructure}
Mobility focus: ${k.mobilityFocus.join(', ')}.`
}

/**
 * Quick reply when user first identifies as a sport athlete.
 */
export function getSportWelcomeReply(sportProgramId, firstName = '') {
  const program = getSportProgramById(sportProgramId)
  if (!program) return null

  const hi = firstName ? `${firstName}, ` : ''
  return `${hi}You are a ${program.name}. Your program is already adapted for your sport — ask me about training demands, common injuries, nutrition, or strength work anytime.`
}

/**
 * All sport IDs for iteration.
 */
export const SPORT_PROGRAM_IDS = SPORT_PROGRAMS.map((p) => p.id)
