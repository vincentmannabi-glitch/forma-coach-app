/**
 * Muscle anatomy, movement patterns, soreness, and mind–muscle chat answers.
 */

import {
  MOVEMENT_PATTERNS_DEEP,
  REGIONAL_MUSCLES,
  MUSCLE_ENTRIES,
  MIND_MUSCLE_CUES,
} from '../data/muscleKnowledge'
import { programExercisesMatchingMuscles, suggestExercisesForMuscle } from './muscleChatHelpers'
import { expandExerciseAbbreviations } from '../data/exerciseRecognition'

function tierParagraph(tier, beginner, advanced) {
  if (tier === 'advanced') return advanced || beginner
  return beginner
}

function findMuscleEntry(lower) {
  const sorted = [...MUSCLE_ENTRIES].sort((a, b) => {
    const la = Math.max(...a.matchNames.map((m) => m.length))
    const lb = Math.max(...b.matchNames.map((m) => m.length))
    return lb - la
  })
  for (const m of sorted) {
    for (const name of m.matchNames) {
      if (lower.includes(name.toLowerCase())) return m
    }
  }
  return null
}

function findRegionalRegion(lower) {
  if (/\b(chest|pec|pectoral)\b/.test(lower)) return 'chest'
  if (/\b(back|lat|lats|rhomboid|trap|erector|scapul)\b/.test(lower)) return 'back'
  if (/\b(shoulder|deltoid|delt|cuff|rotator)\b/.test(lower)) return 'shoulders'
  if (/\b(arm|biceps|triceps|brachialis|forearm)\b/.test(lower)) return 'arms'
  if (/\b(core|core muscle|abs|abdominal|oblique|diaphragm|pelvic)\b/.test(lower)) return 'core'
  if (/\b(leg|quad|hamstring|glute|calf|hip flexor|adductor|abduct|vmo|knee)\b/.test(lower)) return 'legs'
  return null
}

function patternDeepMatch(lower) {
  if (/\b(squat pattern|squatting pattern|how to squat|squat depth|ankle mobility.*squat|squat stance)\b/.test(lower)) return 'squat'
  if (/\b(hip hinge|hinge pattern| hinge\b|rdl vs squat|difference between squat and hinge)\b/.test(lower)) return 'hinge'
  if (/\b(push pattern|horizontal push|vertical push|push pull balance|press pattern)\b/.test(lower)) return 'push'
  if (/\b(pull pattern|horizontal pull|vertical pull|pull more than push)\b/.test(lower)) return 'pull'
  if (/\b(carry pattern|farmer carry|suitcase carry|loaded carry)\b/.test(lower)) return 'carry'
  if (/\b(rotation pattern|anti-rotation|woodchop|pallof|cable chop)\b/.test(lower)) return 'rotation'
  if (/\b(brace pattern|bracing|hollow body|dead bug|bird dog|anti-extension)\b/.test(lower)) return 'brace'
  return null
}

function isSorenessQuestion(lower) {
  return (
    /\b(sore|achy|stiff|doms|delayed onset)\b/.test(lower) &&
    /\b(after|session|workout|yesterday|lifted|squat|deadlift|bench|row|press|training|gym|legs|arms|chest|back)\b/.test(lower)
  )
}

function isMindMuscleQuestion(lower) {
  return (
    /\b(can'?t feel|cannot feel|don'?t feel|not feeling|mind muscle|activate|activation|fire|feel my)\b/.test(lower)
  )
}

function mindMuscleCue(lower) {
  const exp = expandExerciseAbbreviations(lower)
  for (const row of MIND_MUSCLE_CUES) {
    for (const term of row.match) {
      const n = term.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim()
      if (n.length > 2 && exp.includes(n)) {
        const parts = Object.entries(row)
          .filter(([k]) => k !== 'match')
          .map(([k, v]) => `${k}: ${v}`)
        return parts.join(' ')
      }
    }
  }
  return null
}

/**
 * @returns {{ type: 'text'; text: string } | null}
 */
export function tryMuscleKnowledgeAnswer(userMessage, user, tier, hi) {
  const prefix = hi || ''
  const t = (userMessage || '').trim()
  const lower = t.toLowerCase()

  if (/\b(squat vs hinge|difference between squat and hinge|squat and hinge difference)\b/i.test(lower)) {
    const h = MOVEMENT_PATTERNS_DEEP.hinge
    const s = MOVEMENT_PATTERNS_DEEP.squat
    const body = tierParagraph(
      tier,
      `Squat: ${s.beginner}\n\nHinge: ${h.beginner}\n\nIn short: squats are more knee-forward; hinges push the hips back with less knee bend.`,
      `Squat mechanics emphasize simultaneous hip and knee flexion with an upright-ish torso depending on variation. Hinge emphasizes hip flexion with relatively more fixed knee angle; erectors isometrically resist spinal flexion. Confusing them under load often loads the lumbar spine in flexion (hinge done wrong) or turns a squat into a good-morning.`,
    )
    return { type: 'text', text: `${prefix}${body}` }
  }

  // Deep movement pattern (single pattern)
  const pk = patternDeepMatch(lower)
  if (pk && /\b(pattern|squat|hinge|push|pull|carry|rotation|brace|mobility|fault|balance)\b/i.test(t)) {
    const p = MOVEMENT_PATTERNS_DEEP[pk]
    if (!p) return null
    const body = tierParagraph(
      tier,
      `${p.title}. Primary: ${p.primary}\n\n${p.beginner}\n\n${p.formaNote}`,
      `${p.title}. Primary: ${p.primary}\n\n${p.advanced}\n\n${p.formaNote}`,
    )
    return { type: 'text', text: `${prefix}${body}` }
  }

  // Regional “tell me about chest/back” without a specific muscle
  if (/\b(tell me about|explain|what muscles|muscle groups in|muscles in)\b/.test(lower)) {
    const reg = findRegionalRegion(lower)
    if (reg && REGIONAL_MUSCLES[reg]) {
      const r = REGIONAL_MUSCLES[reg]
      const body = tierParagraph(tier, r.beginner, r.advanced)
      return { type: 'text', text: `${prefix}${r.title} (${reg}).\n\n${body}` }
    }
  }

  // Specific muscle entry
  const entry = findMuscleEntry(lower)
  const muscleIntent =
    /\b(muscle|what is|where is|how does|tell me about|explain|injury|feel|sore|stretch|contraction|function|origin|insertion|anatomy)\b/i.test(
      lower,
    ) ||
    t.length < 100
  if (entry && muscleIntent && !isSorenessQuestion(lower) && !isMindMuscleQuestion(lower)) {
    const reg = REGIONAL_MUSCLES[entry.region]
    const regional = reg ? `\n\nRegional context: ${tierParagraph(tier, reg.beginner, reg.advanced)}` : ''
    const core = tierParagraph(tier, entry.beginner, entry.advanced)
    const prog = programExercisesMatchingMuscles(entry.keywords, user)
    const progLine =
      prog.length > 0
        ? `\n\nIn your current FORMA session level, these lifts train this area: ${prog.join(', ')}.`
        : `\n\nYour program still hits this region through compound patterns — the exact exercise names depend on your level.`
    const add = suggestExercisesForMuscle(entry.keywords, user)
    const addLine =
      add.length > 0
        ? `\n\nYou could add more focus with (examples from the library): ${add.join(', ')}.`
        : ''
    return {
      type: 'text',
      text: `${prefix}${core}${regional}${progLine}${addLine}`,
    }
  }

  // Soreness after session (DOMS education — not medical)
  if (isSorenessQuestion(lower) && !/\b(sharp|stabbing|pop|tear|snap|numb|tingling|can'?t bear weight|swelling|fever)\b/i.test(lower)) {
    const entry = findMuscleEntry(lower)
    const region = entry?.region || findRegionalRegion(lower)
    const regionText = region && REGIONAL_MUSCLES[region] ? ` Typical ${region} muscles: ${REGIONAL_MUSCLES[region].title}.` : ''
    const kws = entry?.keywords || (region ? [region] : ['quadriceps', 'glute'])
    const prog = programExercisesMatchingMuscles(entry?.keywords || kws, user)
    const progLine =
      prog.length > 0
        ? `Given your session template, the most likely contributors are: ${prog.join(', ')}.`
        : `Your session uses compound lifts — several muscles can share the same soreness after hard work.`

    const doms = `Delayed onset muscle soreness (DOMS) often peaks 24–48 hours after a new stimulus, more reps, or heavier loads. It usually feels like a dull, widespread muscle ache — not a pinpoint joint line. ${progLine}${regionText}`

    const warn = ` Red flags: sharp pain, joint locking, swelling, numbness, or pain that worsens with light activity — those should be checked by a clinician, not trained through.`

    return { type: 'text', text: `${prefix}${doms}${warn}` }
  }

  // Mind–muscle / can’t feel muscle
  if (isMindMuscleQuestion(lower)) {
    const cue = mindMuscleCue(lower)
    const entry = findMuscleEntry(lower)
    const region = entry?.region
    const generic =
      region === 'chest'
        ? `Slow the tempo, reduce load, and use a 2-second pause at the bottom of the press; keep shoulder blades pinned.`
        : region === 'back'
          ? `Lighten the weight, pull with the elbow not the hand, and pause 1 second at peak contraction.`
          : `Reduce load, slow the eccentric, and add a 1-second pause at the hardest point while keeping joints stacked.`

    const body = cue
      ? `For this movement pattern: ${cue}\n\nAlso: ${generic}`
      : `${generic} Name the exact exercise (e.g. “barbell bench press”) and I can narrow cues further.`

    return { type: 'text', text: `${prefix}${body}` }
  }

  // “Movement patterns” overview (7 patterns)
  if (
    /\b(seven|7)\b.*\b(pattern|patterns)\b/.test(lower) ||
    /\b(fundamental movement patterns|all movement patterns)\b/.test(lower)
  ) {
    const keys = Object.keys(MOVEMENT_PATTERNS_DEEP)
    const lines = keys.map((k) => {
      const p = MOVEMENT_PATTERNS_DEEP[k]
      return `• ${p.title}: ${p.primary}`
    })
    const intro =
      tier === 'advanced'
        ? `The seven patterns FORMA uses: squat, hinge, push, pull, carry, rotation/anti-rotation, and brace.`
        : `Think of training as seven big patterns: squat, hinge, push, pull, carry, rotation, and brace.`
    return { type: 'text', text: `${prefix}${intro}\n\n${lines.join('\n')}` }
  }

  return null
}
