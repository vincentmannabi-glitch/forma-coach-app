/**
 * Knowledge-layer answers for FORMA chat: exercises (166 library), patterns, nutrition, supplements.
 * Supplement replies: benefits + risks, closing line + FORMA disclaimer; no dosages.
 * Returns null when the message should fall through to other coach logic.
 */

import { getExerciseById } from '../data/exercises'
import { enrichExerciseId } from '../data/movementEnrichment'
import { LIBRARY_EXTRA, LIBRARY_EXTRA_COUNT } from '../data/movementLibraryExtra'
import { resolveExerciseQuery, findRowByExactName } from '../data/exerciseRecognition'
import { VARIATIONS_BY_EXERCISE_ID, VARIATIONS_BY_LIBRARY_NAME } from '../data/exerciseVariations'
import {
  MOVEMENT_PATTERNS_EXPLAINED,
  FOOD_PROTEIN,
  OMEGA3_RICH,
  CONCEPTS,
  SUPPLEMENTS,
  SUPPLEMENT_CLOSING_LINE,
  COOKING,
} from '../data/nutritionKnowledge'
import { tryMuscleKnowledgeAnswer } from './muscleKnowledgeAnswer'

export { matchExerciseInText } from '../data/exerciseRecognition'

const LEVEL_STORAGE = 'forma_train_level'

export function experienceTier(user) {
  try {
    const k = localStorage.getItem(LEVEL_STORAGE)
    if (k && ['beginner', 'intermediate', 'advanced'].includes(k)) return k
  } catch {
    /* ignore */
  }
  const exp = (user?.experience_level || '').toLowerCase()
  if (exp.includes('advanced')) return 'advanced'
  if (exp.includes('intermediate')) return 'intermediate'
  return 'beginner'
}

const INJURY_Q =
  /\binjur(y|ed|ies)\b|\bhurt(s|ing)?\b|\bpain\b|\bstrain\b|\brolled\s+my\b|\btweaked\b/i

const KNOWLEDGE_INTENT =
  /\b(what('?s| is| are)|how (do|to|much|many|heavy|long)|why|explain|tell me (about|more)|muscles?|form|technique|cue|mistake|regress|progress|substitut|alternative|omega|protein|creatine|caffeine|calorie|macro|deficit|surplus|cico|insulin|tef|mps|supplement|vitamin d|magnesium|bcaa|bcaas|pre[- ]?workout|preworkout|zinc|melatonin|per 100|grams?|cook|doneness|safe to eat|movement pattern|push.?pull|hinge|squat pattern|bench press|deadlift|back squat|barbell row|overhead press|romanian|rdl|ohp)\b/i

const PATTERN_Q =
  /\b(movement )?pattern(s)?\b|\bpush\b.*\bpull\b|\bhinge\b|\bsquat\b.*\b(pull|hinge)\b|\bwhy (are|do) (we|you|I) (group|train)/i

const IDENTITY_BY_ID = {
  'int-barbell-bench':
    'This is the flat barbell bench press: horizontal press on a flat bench with a barbell — not incline, decline, or dumbbells unless you specified those.',
  'int-deadlift':
    'This is the conventional deadlift: bar from the floor with a typical hip-width stance — not sumo, trap bar, or Romanian unless specified.',
  'int-back-squat':
    'This is the back squat: barbell on the upper back — not goblet, front, or hack squat unless specified.',
  'int-barbell-row':
    'This is the bent-over barbell row: horizontal pull with a barbell while hinged — not a cable or machine row unless specified.',
  'int-ohp':
    'This is the standing barbell overhead press from a front rack — not bench press or push press unless specified.',
  'beg-rdl':
    'This is the Romanian deadlift (hinge pattern) as programmed — barbell RDL is the heavier progression when you are ready.',
  'int-rdl': 'This is the barbell Romanian deadlift: hinge with the bar in hand — not a conventional pull from the floor.',
}

const LIBRARY_IDENTITY = {
  'Barbell Curl':
    'This is the standing barbell curl: supinated-grip elbow flexion with a barbell — not hammer or preacher curl unless specified.',
  'Incline Barbell Bench Press':
    'This is the incline barbell bench press: barbell press on an inclined bench — not flat bench or dumbbell incline unless specified.',
}

function splitDescription(desc) {
  const s = (desc || '').trim()
  if (!s) return { setup: '', steps: [] }
  const sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean)
  const setup = sentences[0] || s
  const steps = sentences.length > 1 ? sentences.slice(1) : [s]
  return { setup, steps }
}

function pickVariations(row) {
  if (row.kind === 'app') {
    const list = VARIATIONS_BY_EXERCISE_ID[row.id]
    if (list?.length) return list.slice(0, 3)
    const en = enrichExerciseId(row.id)
    const pat = en?.pattern || ''
    const selfName = getExerciseById(row.id)?.name || row.name
    const siblings = LIBRARY_EXTRA.filter(
      (l) => l.movementPattern === pat && l.name !== selfName,
    ).slice(0, 3)
    if (siblings.length)
      return siblings.map((l) => ({
        name: l.name,
        diffLine: `Related ${pat} option — different tool or body position than your main pick.`,
      }))
  } else {
    const list = VARIATIONS_BY_LIBRARY_NAME[row.lib.name]
    if (list?.length) return list.slice(0, 3)
    const pat = row.lib.movementPattern
    const siblings = LIBRARY_EXTRA.filter((l) => l.id !== row.lib.id && l.movementPattern === pat).slice(0, 3)
    return siblings.map((l) => ({
      name: l.name,
      diffLine: `Same broad pattern (${pat}) with a different setup or emphasis.`,
    }))
  }
  return [
    { name: 'Easier variation', diffLine: 'Reduce load, shorten range, or use a more supported version of the same pattern.' },
    { name: 'Harder variation', diffLine: 'Add load, slow the lowering phase, or choose a longer range when form stays clean.' },
  ].slice(0, 3)
}

function identityLineForRow(row) {
  if (row.kind === 'app' && IDENTITY_BY_ID[row.id]) return IDENTITY_BY_ID[row.id]
  if (row.kind === 'library' && LIBRARY_IDENTITY[row.lib.name]) return LIBRARY_IDENTITY[row.lib.name]
  if (row.kind === 'app') {
    return `We are focusing on ${row.name} exactly as named — not a different grip, angle, or implement unless you asked for one.`
  }
  return `We are focusing on ${row.lib.name} exactly as named — not a different variation unless you asked for one.`
}

function formatVariationLearnMore(name, tier) {
  const r = findRowByExactName(name)
  if (!r) {
    return `Full detail for “${name}” is not in the library yet — try the exact spelling from the movement list or ask with barbell/dumbbell/incline specified.`
  }
  if (r.kind === 'app') {
    const ex = getExerciseById(r.id) || r.ex
    return formatAppExercise(ex, tier)
  }
  return formatLibraryEntry(r.lib, tier)
}

function buildExerciseCoachBlock(row, tier) {
  const movementTitle = row.kind === 'app' ? row.name : row.lib.name
  const identityLine = identityLineForRow(row)

  let musclesLine = ''
  let feelsLike = ''
  let mistakes = []
  let setup = ''
  let steps = []

  if (row.kind === 'app') {
    const ex = getExerciseById(row.id) || row.ex
    const en = enrichExerciseId(ex.id)
    if (en) {
      musclesLine = `Primary: ${en.primary?.join(', ') || '—'}. Secondary: ${en.secondary?.join(', ') || '—'}. Stabilizers: ${en.stabilizers?.join(', ') || '—'}.`
      feelsLike = en.feelsLike || ''
    } else {
      musclesLine = 'See description for muscle emphasis — enrichment not available for this id.'
    }
    description = ex.description || ''
    mistakes = ex.commonMistakes || []
    const sp = splitDescription(description)
    setup = sp.setup
    steps = sp.steps
  } else {
    const lib = row.lib
    musclesLine = `Pattern: ${lib.movementPattern}. Prime: ${lib.musclesPrimary} Secondary: ${lib.musclesSecondary} Stabilizers: ${lib.stabilizers}`
    feelsLike = lib.feelsLike || ''
    const sp = splitDescription(lib.howTo)
    setup = sp.setup
    steps = sp.steps.length ? sp.steps : [lib.howTo]
    mistakes = [lib.mistakes]
  }

  const rawVars = pickVariations(row)
  const variations = rawVars.map((v, i) => ({
    key: `v-${i}-${v.name.replace(/[^a-z0-9]+/gi, '-').slice(0, 32)}`,
    name: v.name,
    diffLine: v.diffLine,
    learnMoreText: formatVariationLearnMore(v.name, tier),
  }))

  const exerciseBlock = {
    movementTitle,
    identityLine,
    musclesLine,
    setup,
    steps,
    mistakes,
    feelsLike,
    variations,
  }

  const lines = [
    `Identifying the movement`,
    `${movementTitle}. ${identityLine}`,
    ``,
    `Muscles`,
    musclesLine,
    ``,
    `Setup`,
    setup,
    ``,
    `Step-by-step`,
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `Common mistakes`,
    ...(row.kind === 'app' ? mistakes.map((m) => `• ${m}`) : mistakes.map((m) => `• ${m}`)),
    ``,
    `What it should feel like when done correctly`,
    feelsLike || 'Stable joints, target muscles doing the work, and smooth breathing — no sharp joint pain.',
    ``,
    `You can also perform this movement like this`,
    ...variations.map((v) => `• ${v.name} — ${v.diffLine}`),
  ]

  const plainText = lines.join('\n')

  return { exerciseBlock, plainText }
}

function formatAppExercise(ex, tier) {
  const en = enrichExerciseId(ex.id)
  const lines = []
  lines.push(`${ex.name} (${ex.level || 'program'} level in FORMA).`)
  if (en) {
    lines.push(
      `Pattern: ${en.pattern}. Equipment: ${en.equipment?.join(', ') || '—'}. Primary: ${en.primary?.join(', ')}. Secondary: ${en.secondary?.join(', ')}. Stabilizers: ${en.stabilizers?.join(', ')}.`,
    )
    lines.push(`How it should feel: ${en.feelsLike}`)
    lines.push(`Why it shows up in programs: ${en.whyProgram}`)
  }
  lines.push(`How to: ${ex.description}`)
  if (ex.commonMistakes?.length) {
    lines.push(`Common mistakes: ${ex.commonMistakes.join('; ')}.`)
  }
  lines.push(`Easier: ${ex.regression}. Harder: ${ex.progression}.`)
  if (ex.formTip) lines.push(`Cue: ${ex.formTip}`)
  if (ex.startingWeight) lines.push(`Starting load idea: ${ex.startingWeight}`)
  if (tier === 'beginner') {
    lines.push(
      `If anything feels sharp or wrong, stop that variation and use the regression — no exercise is worth injuring a joint.`,
    )
  } else if (tier === 'advanced') {
    lines.push(
      `For autoregulation, match RPE to phase: week-to-week add load or reps only when bar speed and position stay honest.`,
    )
  }
  return lines.join(' ')
}

function formatLibraryEntry(lib, tier) {
  const lines = []
  lines.push(`${lib.name} (movement library — ${LIBRARY_EXTRA_COUNT} reference movements beyond your programmed exercises in FORMA).`)
  lines.push(`Pattern: ${lib.movementPattern}. Equipment: ${(lib.equipment || []).join(', ')}.`)
  lines.push(`Prime movers / detail: ${lib.musclesPrimary}`)
  lines.push(`Secondary: ${lib.musclesSecondary}`)
  lines.push(`Stabilizers: ${lib.stabilizers}`)
  lines.push(`How to: ${lib.howTo}`)
  lines.push(`Mistakes to avoid: ${lib.mistakes}`)
  lines.push(`Easier: ${lib.easier} Harder: ${lib.harder}`)
  lines.push(`How it should feel: ${lib.feelsLike}`)
  lines.push(`Why programs include movements like this: ${lib.whyProgram}`)
  if (tier === 'beginner') {
    lines.push(
      `This entry is a pattern guide — if you need eyes on your specific form, a qualified in-person coach is gold.`,
    )
  }
  return lines.join(' ')
}

function lastExerciseFromHistory(messages) {
  const recent = (messages || []).slice(-8)
  for (let i = recent.length - 1; i >= 0; i--) {
    const msg = (recent[i]?.text || '').trim()
    if (!msg) continue
    const r = resolveExerciseQuery(msg)
    if (r.type === 'resolved') return r.row
  }
  return null
}

function loadPatternAnswer(tier) {
  const intro = MOVEMENT_PATTERNS_EXPLAINED.intro
  if (tier === 'beginner') {
    return `${intro} Start by knowing: squat vs hinge (knees forward vs hips back), and balance every push with a pull.`
  }
  const detail = [
    MOVEMENT_PATTERNS_EXPLAINED.push,
    MOVEMENT_PATTERNS_EXPLAINED.pull,
    MOVEMENT_PATTERNS_EXPLAINED.hinge,
    MOVEMENT_PATTERNS_EXPLAINED.squat,
    MOVEMENT_PATTERNS_EXPLAINED.carry,
    MOVEMENT_PATTERNS_EXPLAINED.rotate,
    MOVEMENT_PATTERNS_EXPLAINED.brace,
  ].join(' ')
  return `${intro} ${detail}`
}

function foodProteinAnswer(msg) {
  const lower = msg.toLowerCase()
  for (const [key, v] of Object.entries(FOOD_PROTEIN)) {
    if (lower.includes(key.split(' ')[0]) || lower.includes(key)) {
      const sp = v.servingProtein != null ? `A typical ~${v.servingG}g serving is roughly ${v.servingProtein}g protein.` : ''
      return `${key}: about ${v.per100g}g protein per 100g (${v.note || 'approximate'}). ${sp} Labels beat guesses — cut types and brands vary.`
    }
  }
  return null
}

function wrapSupplementBody(body) {
  return `${body.trim()} ${SUPPLEMENT_CLOSING_LINE}`
}

/** True when the user is asking about omega-3 as a supplement, not only food sources. */
function omega3SupplementQuestion(lower) {
  if (/\bfish oil\b/.test(lower)) return true
  if (/\bomega[- ]?3\b/.test(lower) && /\b(supplement|capsule|pill|softgel|take|should i|how much|dosage)\b/i.test(lower)) return true
  if (/\bhow much\b/i.test(lower) && /\bomega[- ]?3\b/.test(lower)) return true
  if (/\b(epa|dha)\b/.test(lower) && /\b(supplement|fish oil|capsule|pill|take|should i|how much)\b/i.test(lower)) return true
  return false
}

/** Food-only questions about minerals/vitamins — defer to general nutrition, not supplement copy. */
function looksLikeFoodSourceQuestion(lower) {
  return (
    /\b(food|foods|diet|sources?|eat|meal|high in|rich in|which.*\b(has|contain))\b/i.test(lower) &&
    !/\b(supplement|pill|capsule|softgel|take|should i take|how much.*(take|supplement)|dosage)\b/i.test(lower)
  )
}

/** e.g. "how much vitamin D in milk" — not a supplement dosing question. */
function vitaminMineralFoodContentQuestion(lower) {
  if (looksLikeFoodSourceQuestion(lower)) return true
  if (
    /\bhow much\b/i.test(lower) &&
    /\b(in|per|of)\b/i.test(lower) &&
    /\b(egg|milk|salmon|beef|food|serving|cup|oz|ounce|grams?|cooked|chicken|cheese|yogurt|spinach|oyster|cereal|fortified)\b/i.test(lower)
  ) {
    return true
  }
  return false
}

function supplementAnswer(msg) {
  const lower = msg.toLowerCase()

  if (/\bcreatine\b/.test(lower)) return wrapSupplementBody(SUPPLEMENTS.creatine)
  if (/\bpre[- ]?workout\b|\bpreworkout\b/i.test(lower)) return wrapSupplementBody(SUPPLEMENTS.preworkout)
  if (/\b(bcaas|bcaa)\b/i.test(lower)) return wrapSupplementBody(SUPPLEMENTS.bcaa)
  if (/\bprotein powder|whey|casein|pea protein|protein shake\b/i.test(lower)) {
    return wrapSupplementBody(SUPPLEMENTS.protein_powder)
  }
  if (/\bmultivitamin\b/i.test(lower)) return wrapSupplementBody(SUPPLEMENTS.multivitamin)
  if (
    /\b(vitamins?|minerals?)\b/i.test(lower) &&
    /\b(supplement|supplements|pills?|take|should)\b/i.test(lower) &&
    !/\b(vitamin d|vitamin b12|b12|b-12)\b/i.test(lower)
  ) {
    return wrapSupplementBody(SUPPLEMENTS.vitamins_minerals)
  }
  if (/\b(b12|b-12|vitamin b12|cobalamin)\b/i.test(lower)) return wrapSupplementBody(SUPPLEMENTS.b12)
  if (/\b(iron supplement|ferrous)\b/i.test(lower) || (/\biron\b/.test(lower) && /\b(supplement|pill|take)\b/i.test(lower))) {
    return wrapSupplementBody(SUPPLEMENTS.iron)
  }
  if (omega3SupplementQuestion(lower)) return wrapSupplementBody(SUPPLEMENTS.omega3)
  if (/\bvitamin d\b/.test(lower)) {
    if (vitaminMineralFoodContentQuestion(lower) && !/\b(supplement|pill|capsule|take|should i take)\b/i.test(lower)) {
      return null
    }
    return wrapSupplementBody(SUPPLEMENTS.vitamin_d)
  }
  if (/\bmagnesium\b/.test(lower)) {
    if (vitaminMineralFoodContentQuestion(lower) && !/\b(supplement|pill|capsule|take|should i take)\b/i.test(lower)) {
      return null
    }
    return wrapSupplementBody(SUPPLEMENTS.magnesium)
  }
  if (/\bzinc\b/.test(lower)) {
    if (vitaminMineralFoodContentQuestion(lower) && !/\b(supplement|pill|capsule|take|should i take)\b/i.test(lower)) {
      return null
    }
    return wrapSupplementBody(SUPPLEMENTS.zinc)
  }
  if (/\bmelatonin\b/.test(lower)) return wrapSupplementBody(SUPPLEMENTS.melatonin)
  if (/\bcaffeine\b/.test(lower)) return wrapSupplementBody(SUPPLEMENTS.caffeine)
  if (
    /\b(supplement|supplements)\b/i.test(lower) &&
    /\b(should|take|worth|safe|try|use|recommend|good|bad|help|about|what)\b/i.test(lower)
  ) {
    return wrapSupplementBody(SUPPLEMENTS.generic)
  }
  return null
}

function conceptAnswer(msg) {
  const lower = msg.toLowerCase()
  if (/\bcico|calories?\s+in|energy balance|calorie balance\b/.test(lower)) return CONCEPTS.calories_in_out
  if (/\bdeficit\b/.test(lower) && /\bcalor/i.test(lower)) return CONCEPTS.deficit
  if (/\bsurplus\b/.test(lower) && /(muscle|bulk|gain)/i.test(lower)) return CONCEPTS.surplus
  if (/\bmacros?\b|\bmacro(s)?\b|\bmacronutrient/.test(lower)) return CONCEPTS.macros
  if (/\btef\b|thermic effect/i.test(lower)) return CONCEPTS.tef
  if (/\binsulin\b/.test(lower) && /\bcarb/i.test(lower)) return CONCEPTS.insulin
  if (/\bmps\b|muscle protein synthesis/i.test(lower)) return CONCEPTS.mps
  return null
}

function cookingAnswer(msg) {
  const lower = msg.toLowerCase()
  if (/chicken|165|74°|done|cooked through/i.test(lower) && /(chicken|done|safe|cook)/i.test(lower)) return COOKING.chicken_done
  if (/yogurt|sour cream|substitut/i.test(lower)) return COOKING.yogurt_sub
  if (/dairy.?free|no dairy|lactose/i.test(lower)) return COOKING.dairy_free
  if (/salmon|fish.*instead|alternative.*fish/i.test(lower)) return COOKING.salmon_sub
  return null
}

/**
 * @returns {{ type: 'text'; text: string; exerciseBlock?: object } | { type: 'exercise'; text: string; exerciseBlock: object } | null}
 */
export function tryFitnessKnowledgeAnswer(userMessage, user, messages, hi) {
  const t = (userMessage || '').trim()
  if (!t) return null

  if (INJURY_Q.test(t)) return null

  const tier = experienceTier(user)
  const prefix = hi || ''

  const muscleAns = tryMuscleKnowledgeAnswer(t, user, tier, hi)
  if (muscleAns) return muscleAns

  // Movement patterns (explicit)
  if (PATTERN_Q.test(t) || /\bwhat (are|is) (the )?(push|pull|hinge|squat|carry|brace)/i.test(t)) {
    return { type: 'text', text: `${prefix}${loadPatternAnswer(tier)}` }
  }

  // Nutrition / supplements / concepts / cooking
  const sup = supplementAnswer(t)
  if (sup) {
    return { type: 'text', text: `${prefix}${sup}` }
  }

  const conc = conceptAnswer(t)
  if (conc) {
    return { type: 'text', text: `${prefix}${conc}` }
  }

  const cook = cookingAnswer(t)
  if (cook) {
    return { type: 'text', text: `${prefix}${cook}` }
  }

  if (/\bomega[- ]?3|\bepa\b|\bdha\b|fatty fish\b/i.test(t)) {
    const supplementHint = /\b(supplement|fish oil|capsule|pill|softgel|should i take)\b/i.test(t)
    const tail = supplementHint
      ? ` Whole-food protein and fat sources still come first; if you are considering a supplement, we do not suggest amounts here — that belongs with your doctor or a registered dietitian. ${SUPPLEMENT_CLOSING_LINE}`
      : ` Whole-food protein and fat sources still come first.`
    return { type: 'text', text: `${prefix}${OMEGA3_RICH}${tail}` }
  }

  const foodA = foodProteinAnswer(t)
  if (foodA && (KNOWLEDGE_INTENT.test(t) || /\?/.test(t) || /\b(protein|grams?|g)\b/i.test(t))) {
    return { type: 'text', text: `${prefix}${foodA}` }
  }

  if (/\boats?\b/i.test(t) && /(before|pre|workout|training)/i.test(t)) {
    return {
      type: 'text',
      text: `${prefix}Oats are mostly carbs with modest protein and fibre — fine before training if your gut tolerates them. Many people eat them 1–3 hours pre-session; right before, some get bloated. Pair with protein if it is a long gap until your next meal. Total daily carbs and protein matter more than one ritual meal.`,
    }
  }

  // Exercise: exact resolution (canonical defaults + aliases) + structured coach block + variations
  const resolved = resolveExerciseQuery(t)
  if (resolved.type === 'clarify') {
    return { type: 'text', text: `${prefix}${resolved.text}` }
  }

  const followUpLoad =
    /\b(how heavy|what weight|how much weight|rpe|sets?\s+and\s+reps|how many sets)\b/i.test(t) &&
    t.length < 140

  let row = resolved.type === 'resolved' ? resolved.row : null
  if (followUpLoad && !row) {
    row = lastExerciseFromHistory(messages)
  }

  const shortExerciseOnly =
    row &&
    t.length < 72 &&
    !/\b(i|my|today|session|felt|hurt|when|after|before|because|did|logged)\b/i.test(t)

  const hasIntent =
    KNOWLEDGE_INTENT.test(t) || /\?/.test(t) || followUpLoad || shortExerciseOnly

  if (row && hasIntent) {
    const { exerciseBlock, plainText } = buildExerciseCoachBlock(row, tier)
    let out = plainText
    if (followUpLoad) {
      const loadLine =
        tier === 'beginner'
          ? `For load: start where you finish every rep with solid form — often that means leaving 2–3 reps in reserve early on. Add the smallest bump that still feels clean week to week.\n\n`
          : `For load: use RPE — most working sets around 7–9 RPE depending on phase; add weight when reps and bar speed exceed your target band.\n\n`
      out = `${loadLine}${plainText}`
    }
    return { type: 'exercise', text: `${prefix}${out}`, exerciseBlock }
  }

  return null
}
