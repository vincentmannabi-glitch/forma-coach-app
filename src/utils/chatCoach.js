import { updateUserProfile } from './auth'
import { getProgramContextSync, getCurrentStreak, getPersonalRecordsDisplay, getSessionCount } from './workouts'
import { getDailyProteinTargetGrams } from './nutrition'
import { getDailyTotals, dateKeyLocal } from './foodLog'
import { ensureProgramLoaded, getTodayTrainExercisesSync } from './programBuilder.js'
import { isMomExperience } from './momExperience'
import { getExerciseById } from '../data/exercises'
import { tryFitnessKnowledgeAnswer } from './fitnessKnowledgeEngine'
import {
  detectSportFromText,
  getSportWelcomeReply,
  getSportKnowledge,
  mapSportOrActivityToProgramId,
} from '../data/sportKnowledge'
import { handleMovementCoachFlow } from './movementCoachConversation'
import {
  estimateProteinGap,
  getChatSnackRecommendations,
  formatSnackDeepKnowledge,
  snackPassesUser,
} from './snackEngine'
import { searchSnacksByText } from '../data/snackDatabase'
import {
  searchBrandedProductsByText,
  formatBrandedProductCoachBlock,
  getBrandById,
} from '../data/brandedSnackLibrary'
import { brandedProductPassesUser, buildConvenientAlternativesParagraph } from './brandedSnackCoach'

const CHAT_KEY = 'forma_chat_messages'
const CHAT_CTX_KEY = 'forma_chat_context'

const LEVEL_STORAGE = 'forma_train_level'

function contextStorageKey(user) {
  const uid = user?.id || user?.email || ''
  return uid ? `${CHAT_CTX_KEY}_${uid}` : null
}

function greetingForHour() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Map onboarding goal string to a short program label. */
export function goalToProgramLabel(goal) {
  if (!goal || typeof goal !== 'string') return 'training program'
  const g = goal.toLowerCase()
  if (g.includes('lose fat') || g.includes('lean')) return 'fat loss program'
  if (g.includes('build muscle') || g.includes('stronger')) return 'muscle building program'
  if (g.includes('sport') || g.includes('competition')) return 'sport performance program'
  if (g.includes('general') || g.includes('feel better')) return 'general fitness program'
  return 'training program'
}

export function buildWelcomeMessage(user) {
  return `Welcome to FORMA Coach. I am here to help with anything — training, nutrition, recovery, or questions about your program. What would you like to know.`
}

function firstName(user) {
  const raw = (user?.name || '').trim()
  if (!raw) return ''
  return raw.split(/\s+/)[0]
}

/**
 * @returns {{ id: string; role: 'coach' | 'user'; text: string; variant?: 'upgrade'; createdAt: string }[]}
 */
export function loadChatMessages() {
  const key = storageKey()
  if (!key) return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/**
 * @param {ReturnType<typeof loadChatMessages>} messages
 */
export function saveChatMessages(messages) {
  const key = storageKey()
  if (!key) return
  localStorage.setItem(key, JSON.stringify(messages))
}

function loadChatContext(user) {
  const key = contextStorageKey(user)
  if (!key || typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const o = JSON.parse(raw)
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}

function saveChatContext(ctx, user) {
  const key = contextStorageKey(user)
  if (!key || typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(ctx))
}

function getTrainLevel(user) {
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

const MEDICAL_STOP =
  /chest\s*pain|heart\s*pain|pain\s*in\s*(my\s*)?chest|dizzy|dizziness|feel\s*faint|fainting|passed\s*out|numbness|numb\s|can'?t\s+feel|can\s*not\s*feel|sharp\s*stabbing|stabbing\s*pain|short(ness)?\s*of\s*breath|can'?t\s+breathe|trouble\s+breath|severe\s*headache|blood\s+in|vision\s*went|lost\s*vision/i

const PRO_COACH =
  /\b(real|human|certified)\s+coach\b|coach\s+(to\s+)?review|review\s+(my\s+)?session|voice\s*note|personal\s+feedback|feedback\s+on\s+my\s+(session|workout|sets)|watch\s+my\s+session|check\s+my\s+form\b/i

const APP_INFO =
  /\bwhat\s+is\s+forma|what\s+does\s+this\s+app|how\s+does\s+forma\s+work|what\s+can\s+forma|how\s+do(es)?\s+(this|the)\s+app/i

const SNACK_IDEA_Q =
  /\b(what|which)\s+(should|can)\s+i\s+(eat|have)\b.*\bsnack|\bsnack\s+ideas?|healthy\s+snack\b|something\s+to\s+snack|good\s+snack\b/i

const PROGRAM_Q =
  /\b(my\s+)?program\b|my\s+plan\b|what\s+am\s+i\s+(doing|following)|training\s+plan|workout\s+plan|what\s+week\b|how\s+many\s+days\b/i

const SPORT_Q =
  /\b(marathon|5k|sprinter|swimmer|triathlete|cyclist|rower|crossfit|jumper|thrower|hurdler|pole\s*vault)\b|\b(my\s+)?sport\b|\b(common\s+)?injuries?\s+(in|for)\b|\btraining\s+demands?\b|\bstrength\s+work\s+(for|that\s+support)\b|\bnutrition\s+(for|as\s+a)\b|\bi'?m\s+(a\s+)?(runner|swimmer|cyclist|rower|triathlete)/i

const NUTRITION_Q =
  /\bprotein\b|nutrition|eating|calories|macros|food\s+log|hit\s+my\s+target|daily\s+target/i

const WHY_EXERCISE =
  /why\s+(am\s+i|are\s+we|do\s+i)\s+(doing\s+)?|what'?s\s+the\s+point\s+of|purpose\s+of\s+(the\s+)?|why\s+this\s+exercise|why\s+(goblet|squat|deadlift|bench|row|press|pull)/i

/** “Sore” after workouts is handled in muscle knowledge (DOMS); injury flow uses pain/hurt/injury. */
const INJURY_Q =
  /\binjur(y|ed|ies)\b|\bhurt(s|ing)?\b|\bpain\b|\bstrain\b|\brolled\s+my\b|\btweaked\b/i

const SLOW_PROGRESS =
  /slow\s+progress|not\s+progressing|plateau|stuck|no\s+results|not\s+seeing\s+results|when\s+will\s+i\s+see/i

const MOTIVATION_Q =
  /\bmotivat|can'?t\s+stay\s+consistent|feel\s+like\s+quitting|don'?t\s+feel\s+like|discouraged|lost\s+motivation|unmotivated/i

const STRESS_Q =
  /overwhelm|overwhelmed|stressed|too\s+much\s+on\s+my\s+plate|burned\s*out|burnout|can'?t\s+cope|anxious\s+about\s+(training|the\s+gym|working\s+out)/i

function userMessagesJoined(messages, max = 12) {
  return messages
    .filter((m) => m.role === 'user')
    .slice(-max)
    .map((m) => m.text)
    .join(' ')
}

function findExerciseMention(text, user) {
  void user
  const list = getTodayTrainExercisesSync('gym', new Date())
  const lower = text.toLowerCase()
  let best = null
  let bestLen = 0
  for (const ex of list) {
    const nm = (ex.displayName || ex.name || '').toLowerCase()
    if (!nm) continue
    if (lower.includes(nm) && nm.length > bestLen) {
      bestLen = nm.length
      best = ex
    }
    const short = nm.split(/\s+/)[0]
    if (short.length > 3 && lower.includes(short) && short.length > bestLen) {
      bestLen = short.length
      best = ex
    }
  }
  if (best) return getExerciseById(best.id) || best
  for (const word of lower.split(/[^a-z0-9]+/)) {
    if (word.length < 4) continue
    for (const ex of list) {
      const id = (ex.id || '').toLowerCase()
      const nm = (ex.displayName || ex.name || '').toLowerCase()
      if (id.includes(word) || nm.includes(word)) {
        return getExerciseById(ex.id) || ex
      }
    }
  }
  return null
}

function exerciseWhyForGoal(exercise, user) {
  const goal = (user?.goal || '').toLowerCase()
  const name = exercise?.name || 'This lift'
  if (goal.includes('lose fat') || goal.includes('lean')) {
    return `${name} builds muscle that keeps your metabolism higher while you are in a deficit — so you lose fat, not just scale weight. It also trains movement quality under load, which matters when calories are tighter.`
  }
  if (goal.includes('muscle') || goal.includes('stronger')) {
    return `${name} is in your plan to add strength and muscle in the right places: heavy-enough work in safe patterns, with enough volume to grow. It pairs with the rest of your session so you are not hammering the same tissue every day.`
  }
  if (goal.includes('sport') || goal.includes('competition')) {
    return `${name} supports power and resilience for what you do outside the gym — stronger hips, trunk, and upper back transfer to almost every sport. We keep the pattern consistent so you can load it week to week.`
  }
  return `${name} trains strength and movement quality in a balanced way so you feel better day to day and can handle harder work over time — without beating up your joints.`
}

function formatProgramDetails(user) {
  const dpw = user?.days_per_week || 3
  const ctx = getProgramContextSync(dpw)
  const level = getTrainLevel(user)
  ensureProgramLoaded()
  const workout = getTodayTrainExercisesSync('gym', new Date())
  const names = workout.map((e) => e.displayName || e.name).join(', ')
  const goal = user?.goal || 'your goal'
  const style = user?.training_style || 'your preferred training style'
  return { ctx, names, goal, style, level, sessions: getSessionCount() }
}

function formatNutrition(user) {
  const target = getDailyProteinTargetGrams(user)
  if (target == null) {
    return {
      text: 'Add your body weight in Settings so I can lock in your daily protein number — right now I do not have enough to calculate it.',
      target: null,
    }
  }
  const t = getDailyTotals(dateKeyLocal())
  const pct = Math.min(100, Math.round((t.protein / target) * 100))
  let closeness = 'right on track'
  if (pct < 50) closeness = 'still climbing toward'
  else if (pct < 80) closeness = 'getting close to'
  else if (pct >= 95) closeness = 'basically at'
  return {
    text: `Your daily protein target is ${target}g (from your weight and goal). Today you have logged about ${Math.round(t.protein * 10) / 10}g — that is ${pct}% of the way there, so you are ${closeness} where we want you for the day.`,
    target,
    logged: t.protein,
    pct,
  }
}

function topPRSummary(user) {
  const pr = getPersonalRecordsDisplay()
  const entries = Object.entries(pr)
    .map(([id, v]) => {
      const ex = getExerciseById(id)
      const name = ex?.name || id
      const best = v.bestWeight > 0 ? `${v.bestWeight} kg` : `${v.bestReps} reps`
      return { name, line: `${name} (${best})` }
    })
    .filter((e) => e.line)
  if (!entries.length) return null
  return entries.slice(0, 2).map((e) => e.line).join('; ')
}

/** @returns {{ type: 'text' | 'upgrade' | 'exercise'; text: string; exerciseBlock?: object }} */
export function getCoachResponse(userMessage, options = {}) {
  const user = options.user || null
  const messages = options.messages || []
  const t = (userMessage || '').trim()
  const fn = firstName(user)
  const hi = fn ? `${fn}, ` : 'Hey — '

  if (!t) {
    return { type: 'text', text: `${hi}Tell me what is on your mind — I am right here.` }
  }

  const ctx = loadChatContext(user)
  const history = userMessagesJoined(messages)

  // --- Sport: use onboarding sport_or_activity first, then detect from message ---
  const sportFromProfile = mapSportOrActivityToProgramId(user?.sport_or_activity)
  const sportFromText = detectSportFromText(t, history)
  const sportId = sportFromProfile || ctx.sportProgramId || sportFromText
  if (sportFromText && sportFromText !== ctx.sportProgramId) {
    saveChatContext({ ...ctx, sportProgramId: sportFromText }, user)
  }
  if (sportId && !ctx.sportProgramId && (/\bi'?m\s+(a\s+)?|i am\s+(a\s+)?/i.test(t) || SPORT_Q.test(t))) {
    const welcome = getSportWelcomeReply(sportId, fn)
    if (welcome) return { type: 'text', text: welcome }
  }

  // --- Sport-specific questions (injuries, nutrition, strength, training) — include Learn More ---
  const effectiveSportId = sportId || ctx.sportProgramId
  if (effectiveSportId && (SPORT_Q.test(t) || /\binjuries?\b|\bnutrition\b|\bstrength\b|\btraining\s+demands?\b|\bcommon\s+problems?\b|\bmovement\b|\bprogression\b/i.test(t))) {
    const k = getSportKnowledge(effectiveSportId)
    if (k) {
      const learnMore = `Training demands: ${k.trainingDemands}\n\nWeekly structure: ${k.weeklyStructure}\n\nStrength: ${k.strengthWork}\n\nNutrition: ${k.nutrition}\n\nRecovery: ${k.recovery}\n\nCommon injuries: ${k.commonInjuries.join(', ')}\n\nMobility focus: ${k.mobilityFocus.join(', ')}`
      if (/\binjur/i.test(t)) {
        return {
          type: 'sportDetail',
          text: `${hi}For ${k.name}, common injuries to watch for: ${k.commonInjuries.join(', ')}. Prevention focuses on mobility and accessory work — glute medius, hip flexors, and sport-specific prep.`,
          sportBlock: { learnMore },
        }
      }
      if (/\bnutrition/i.test(t)) {
        return { type: 'sportDetail', text: `${hi}${k.nutrition}`, sportBlock: { learnMore } }
      }
      if (/\bstrength|\bwhat\s+should\s+i\s+do\s+in\s+the\s+gym|\bgym\s+work\b/i.test(t)) {
        return { type: 'sportDetail', text: `${hi}${k.strengthWork}`, sportBlock: { learnMore } }
      }
      if (/\btraining\s+demands?|\bwhat\s+(does|do)\s+.*\s+need\b/i.test(t)) {
        return { type: 'sportDetail', text: `${hi}${k.trainingDemands}`, sportBlock: { learnMore } }
      }
    }
  }

  // --- Active flows (injury / slow progress) ---
  if (ctx.injuryFlow?.step && ctx.injuryFlow.step !== 'done') {
    return handleInjuryStep(t, user, ctx)
  }
  if (ctx.slowFlow?.step && ctx.slowFlow.step !== 'done') {
    return handleSlowStep(t, user, ctx)
  }

  if (ctx.snackFlow?.step === 'protein') {
    let proteinGap = parseFloat(String(t).replace(/[^\d.]/g, ''))
    if (!Number.isFinite(proteinGap) || proteinGap < 0) {
      if (/not\s*sure|don'?t know|estimate|you\s+pick|no\s*idea/i.test(t)) {
        proteinGap = estimateProteinGap(user) ?? 35
      } else {
        return {
          type: 'text',
          text: `${hi}Give me a number in grams (for example 30) or say "not sure" so I can estimate from your food log.`,
        }
      }
    }
    saveChatContext({ ...ctx, snackFlow: { step: 'prep', proteinGap } }, user)
    return {
      type: 'text',
      text: `${hi}About ${Math.round(proteinGap)}g to weave in. Do you want something quick (under ~2 minutes) or are you okay with a little prep?`,
    }
  }

  if (ctx.snackFlow?.step === 'prep') {
    const low = t.toLowerCase()
    const quickOnly =
      /\b(quick|fast|under\s*2|two\s*minute|grab|no\s+prep|instant|rush)\b/i.test(low) &&
      !/\b(okay|ok|fine)\s+with\s+(a\s+)?(little\s+)?prep/i.test(low)
    const momMode =
      !!user?.parent_snacking ||
      /\b(baby|babies|toddler|infant|newborn|nursing|breastfeed|nappy|diaper|mum|mums|mom|moms|mother|one[\s-]?hand|holding\s+a\s+kid|postnatal|postpartum)\b/i.test(
        history,
      )
    const recs = getChatSnackRecommendations(user, {
      proteinGap: ctx.snackFlow.proteinGap || 30,
      quickOnly,
      preferMom: momMode,
    })
    saveChatContext({ ...ctx, snackFlow: { step: 'done' } }, user)
    if (!recs.length) {
      return {
        type: 'text',
        text: `${hi}I could not find snacks in our library that match your exclusions — check Settings, or name one ingredient you have and I will work from that.`,
      }
    }
    const blocks = recs.map((s, i) => {
      const line = `${i + 1}. ${s.name} — ${s.calories} kcal, ${s.protein}g protein, ${s.carbs}g carbs, ${s.fat}g fat, ${s.fiber}g fibre; iron ~${s.ironMg}mg, calcium ~${s.calciumMg}mg; prep ~${s.prepMinutes} min.`
      return s.note ? `${line} Note: ${s.note}` : line
    })
    const branded = buildConvenientAlternativesParagraph(user, {
      proteinGap: ctx.snackFlow.proteinGap || 30,
      quickOnly,
      momMode,
    })
    const lead = momMode
      ? `${hi}Whole food first — then we layer in what works when your hands are full. Here are three from your library that fit your profile${quickOnly ? ' and are quick' : ''}:`
      : `${hi}I start with whole foods whenever we can — here are three concrete options that fit your profile${quickOnly ? ' and are quick to pull together' : ''}:`
    const tail = branded ? `\n\n${branded}` : ''
    return {
      type: 'text',
      text: `${lead}\n\n${blocks.join('\n\n')}${tail}`,
    }
  }

  // Medical — before movement flows so urgent messages are never misparsed as flow answers
  if (MEDICAL_STOP.test(t)) {
    return {
      type: 'text',
      text: `${hi}Stop training right now and get medical attention — chest pain, dizziness, severe or sudden pain, numbness, or trouble breathing are not things to push through in an app chat. This is not negotiable. Call your doctor or emergency services if it feels urgent. When you are cleared, we can pick training back up safely.`,
    }
  }

  const movementCoach = handleMovementCoachFlow(t, user, messages, hi, ctx)
  if (movementCoach) {
    saveChatContext(movementCoach.ctx, user)
    return { type: 'text', text: movementCoach.text }
  }

  const knowledge = tryFitnessKnowledgeAnswer(t, user, messages, hi)
  if (knowledge) return knowledge

  if (/\btell me about\b|\b(full )?nutrition (for|on)\b|\bnutrition profile of\b/i.test(t)) {
    const brandedHits = searchBrandedProductsByText(t)
    const tl = t.toLowerCase()
    const passBranded = brandedHits.filter((p) => brandedProductPassesUser(p, user))
    const bMatch =
      passBranded.find((p) => {
        const brand = getBrandById(p.brandId)
        if (brand && tl.includes(brand.name.toLowerCase())) return true
        return p.name.toLowerCase().split(/\s+/).some((w) => w.length > 3 && tl.includes(w))
      }) || (passBranded.length === 1 ? passBranded[0] : null)
    if (bMatch) {
      return { type: 'text', text: `${hi}${formatBrandedProductCoachBlock(bMatch)}` }
    }
    const hits = searchSnacksByText(t)
    const s = hits.find((h) =>
      h.name
        .toLowerCase()
        .split(/\s+/)
        .some((w) => w.length > 3 && t.toLowerCase().includes(w)),
    )
    if (s) {
      if (!snackPassesUser(s, user)) {
        return {
          type: 'text',
          text: `${hi}${s.name} conflicts with your onboarding exclusions — I will not recommend it as a default. Ask "what should I eat as a snack?" and I will suggest three swaps that fit your profile.`,
        }
      }
      return { type: 'text', text: `${hi}${formatSnackDeepKnowledge(s, user)}` }
    }
  }

  if (SNACK_IDEA_Q.test(t) && (!ctx.snackFlow || ctx.snackFlow.step === 'done')) {
    saveChatContext({ ...ctx, snackFlow: { step: 'protein' } }, user)
    return {
      type: 'text',
      text: `${hi}Two quick questions. Roughly how much protein do you still need today? (Grams is best — or say "not sure" and I will estimate from your log.)`,
    }
  }

  // 2) Pro coach / session review
  if (PRO_COACH.test(t)) {
    return {
      type: 'upgrade',
      text: `${hi}Pro members get a real certified coach who reviews every single session personally and sends voice note feedback within 24 hours. Your coach sees everything — every set, every rep, every weight, every check in. It is like having a trainer in your corner every single week. Want to upgrade to Pro for $99.99 a month?`,
    }
  }

  // 3) Overwhelmed / stressed (before generic upgrade)
  if (STRESS_Q.test(t)) {
    updateUserProfile({ coach_recommended_light_training: true })
    return {
      type: 'text',
      text: `${hi}Thank you for saying that — it matters. Feeling overwhelmed is real, and it does not make you soft. I have nudged your profile toward lighter sessions for now: shorter work, easier loads, same consistency. A 20-minute session beats no session, every time. You can still move; we just take the pressure off. Reply anytime — I have got you.`,
    }
  }

  // 4) Injury — start flow
  if (INJURY_Q.test(t) && (!ctx.injuryFlow || ctx.injuryFlow.step === 'done')) {
    saveChatContext({
      ...ctx,
      injuryFlow: { step: 'part', startedAt: new Date().toISOString() },
    }, user)
    return {
      type: 'text',
      text: `${hi}I am sorry you are dealing with that — let us take it seriously. Which body part is bothering you most (one word or short phrase is fine)?`,
    }
  }

  // 5) Slow progress — start flow
  if (SLOW_PROGRESS.test(t) && (!ctx.slowFlow || ctx.slowFlow.step === 'done')) {
    saveChatContext({
      ...ctx,
      slowFlow: { step: 'weeks', answers: {} },
    }, user)
    return {
      type: 'text',
      text: `${hi}Let us look at this properly. How many weeks have you been following this program (roughly)?`,
    }
  }

  // 6) Motivation — personal
  if (MOTIVATION_Q.test(t)) {
    const streak = getCurrentStreak()
    const prLine = topPRSummary(user)
    const week = getProgramContextSync(user?.days_per_week || 3).programWeek
    const parts = [
      `${hi}I hear you — motivation is not a personality trait, it is a season.`,
      streak > 0
        ? `You have a ${streak}-day training streak on the books — that is not luck, that is proof you can show up when it is inconvenient.`
        : `Showing up this week still counts even if the streak number is not there yet.`,
      prLine
        ? `Your numbers have moved: ${prLine}. That is real progress, not hype.`
        : `Week ${week} is further than week one — you have more reps under your belt than when you started.`,
      `One session this week, done with intent, still moves you forward. Want to talk about what feels hardest — time, energy, or doubt?`,
    ]
    return { type: 'text', text: parts.join(' ') }
  }

  // 7) Program
  if (PROGRAM_Q.test(t)) {
    const progSportId = mapSportOrActivityToProgramId(user?.sport_or_activity) || ctx.sportProgramId || detectSportFromText(t, history)
    if (progSportId) {
      const sk = getSportKnowledge(progSportId)
      if (sk) {
        return {
          type: 'text',
          text: `${hi}You are on the ${sk.name} program. ${sk.weeklyStructure} Strength: ${sk.strengthWork.slice(0, 150)}… Ask me about injuries, nutrition, or strength work for more detail.`,
        }
      }
    }
    const d = formatProgramDetails(user)
    return {
      type: 'text',
      text: `${hi}Here is your setup: goal is "${d.goal}". You are in program week ${d.ctx.programWeek}, training ${d.ctx.daysPerWeek} days per week (${d.ctx.weekday} today). Your current level is ${d.level} — today’s session is built around: ${d.names}. Style you picked: ${d.style}. You have logged ${d.sessions} completed sessions so far. That is the real program — not a generic template.`,
    }
  }

  // 8) Nutrition
  if (NUTRITION_Q.test(t)) {
    const nutSportId = mapSportOrActivityToProgramId(user?.sport_or_activity) || ctx.sportProgramId || detectSportFromText(t, history)
    if (nutSportId) {
      const nk = getSportKnowledge(nutSportId)
      if (nk && nk.nutrition) {
        return {
          type: 'text',
          text: `${hi}For your ${nk.name} training: ${nk.nutrition} Your general intake still matters — protein for recovery, enough carbs around sessions.`,
        }
      }
    }
    const n = formatNutrition(user)
    return { type: 'text', text: `${hi}${n.text}` }
  }

  // 9) Why exercise (specific)
  if (WHY_EXERCISE.test(t)) {
    const ex = findExerciseMention(t, user)
    if (ex) {
      const why = exerciseWhyForGoal(ex, user)
      return {
        type: 'text',
        text: `${hi}${why} If it ever feels off for your body, we adjust load or variation — the principle stays, the details flex.`,
      }
    }
    return {
      type: 'text',
      text: `${hi}Each lift in your session is there to match your goal, balance patterns (push/pull, hinge/squat), and progress safely. Tell me the exact exercise name you mean and I will break down that one.`,
    }
  }

  // 10) App / FORMA
  if (APP_INFO.test(t)) {
    return {
      type: 'text',
      text: `${hi}FORMA Coach is your training and nutrition home base: structured workouts that fit your level, a cookbook and daily protein coaching, progress tracking, and this chat so you are never guessing alone. It learns from what you log — sessions, food, check-ins — and speaks in plain language, like a coach who actually knows you. We are not here to shame you; we are here to keep you consistent.`,
    }
  }

  // 11) Context memory: leg day + knee in history
  const hist = `${history} ${t}`.toLowerCase()
  if (/\bleg\s*day|lower\s+body|squat\s+day/i.test(t) && /\bknee/.test(hist)) {
    return {
      type: 'text',
      text: `${hi}You mentioned your knee before — thanks for trusting me with that. For leg day today: cap intensity if anything feels sharp, warm up longer, and favor ranges that feel stable. If it is sore but dull, lighter loads and higher reps can work. If it is sharp or unstable, swap leg work for what you can do pain-free and consider getting it checked. I would rather you leave a rep in the tank than force a hero set.`,
    }
  }

  // 12) FAQ short answers (personalized opener)
  if (/\brpe\b|rate\s+of\s+perceived/i.test(t)) {
    return {
      type: 'text',
      text: `${hi}RPE is how hard a set feels — often 1–10. RPE 8 means ~2 reps left; RPE 9 means one left. It lets you train hard without always grinding to failure, which matters especially week ${getProgramContextSync(user?.days_per_week || 3).programWeek} when fatigue stacks.`,
    }
  }

  if (/\bprogressive\s+overload\b/i.test(t)) {
    return {
      type: 'text',
      text: `${hi}Progressive overload means slowly increasing demand over time — weight, reps, quality, or a harder variation. You do not need a PR every session; you need a trend. Your logged sessions are where we see that trend.`,
    }
  }

  // 13) Unanswerable → honest + upgrade
  if (
    t.length > 8 &&
    (/\b(visa|legal|tax|pregnant|pregnancy|surgery|medication|diagnos)\b/i.test(t) ||
      /\b(should i|is it safe|will i die|guarantee)\b/i.test(t))
  ) {
    return {
      type: 'upgrade',
      text: `${hi}That is a great question — honestly, it is outside what I can answer confidently from here. Let me connect you with your Pro coach who can give you a proper, personal answer. Want to upgrade to Pro for $99.99 a month?`,
    }
  }

  if (/^(hi|hello|hey|hiya)\b/i.test(t) || /^(thanks|thank you|thx)\b/i.test(t)) {
    return {
      type: 'text',
      text: `${hi}${/^(thanks|thank you|thx)/i.test(t) ? 'You got it. ' : ''}I am here — training, nutrition, or how you are feeling: what do you want to tackle?`,
    }
  }

  if (t.length < 160 && !/\?/.test(t)) {
    return {
      type: 'text',
      text: `${hi}Tell me a bit more so I can be specific — are we talking about today’s session, food, recovery, or something else?`,
    }
  }

  return {
    type: 'upgrade',
    text: `${hi}That is a great question. I do not have enough context to answer that one the way you deserve. Your Pro coach can look at your full history and give you a straight answer within 24 hours. Want to upgrade to Pro for $99.99 a month?`,
  }
}

function handleInjuryStep(t, user, ctx) {
  const flow = ctx.injuryFlow || { step: 'part' }
  const fn = firstName(user)
  const hi = fn ? `${fn}, ` : 'Hey — '
  const next = { ...ctx }

  if (flow.step === 'part') {
    next.injuryFlow = { ...flow, step: 'duration', part: t.trim() }
    saveChatContext(next, user)
    return {
      type: 'text',
      text: `${hi}Got it — thanks. How long has ${t.trim()} been bothering you (days, weeks)?`,
    }
  }

  if (flow.step === 'duration') {
    next.injuryFlow = { ...flow, step: 'quality', duration: t.trim() }
    saveChatContext(next, user)
    return {
      type: 'text',
      text: `${hi}Understood. Is it more of a sharp pain, or a dull ache / soreness?`,
    }
  }

  if (flow.step === 'quality') {
    const sharp = /\bsharp|stabbing|shooting|pinch|catching|cannot|can'?t\s+straighten|unbearable/i.test(t)
    next.injuryFlow = { ...flow, step: 'done', quality: t.trim() }
    saveChatContext(next, user)

    if (sharp || /\bweek|month|constant|every\s+day|worse\b/i.test(flow.duration || '')) {
      updateUserProfile({ coach_recommended_light_training: true, coach_injury_note: flow.part || 'unspecified' })
      return {
        type: 'text',
        text: `${hi}Thank you for the detail. Sharp pain, or anything that is getting worse or does not make sense with rest, is worth a real clinician — please see a doctor or physiotherapist before we load that area hard. I have marked your profile to favour lighter, pain-free training in the meantime. No hero sets — move if you can, stop if you cannot.`,
      }
    }

    updateUserProfile({ coach_recommended_light_training: true, coach_injury_note: `soreness: ${flow.part}` })
    return {
      type: 'text',
      text: `${hi}Sounds like classic soreness or irritation — annoying, but different from something dangerous. I have set your profile to lighter sessions for now: reduce loads ~10%, add a warm-up set, and stop any movement that bites. If it flips to sharp or swells badly, get it checked. You are not derailing anything by protecting the tissue.`,
    }
  }

  return { type: 'text', text: `${hi}Tell me more when you are ready.` }
}

function handleSlowStep(t, user, ctx) {
  const flow = ctx.slowFlow || { step: 'weeks', answers: {} }
  const fn = firstName(user)
  const hi = fn ? `${fn}, ` : 'Hey — '
  const next = { ...ctx }

  if (flow.step === 'weeks') {
    next.slowFlow = { ...flow, step: 'nutrition', answers: { ...flow.answers, weeks: t.trim() } }
    saveChatContext(next, user)
    return {
      type: 'text',
      text: `${hi}Thanks. How consistent has nutrition been — rough percentage of days you hit protein, or "pretty good / messy / all over the place"?`,
    }
  }

  if (flow.step === 'nutrition') {
    next.slowFlow = { ...flow, step: 'sleep', answers: { ...flow.answers, nutrition: t.trim() } }
    saveChatContext(next, user)
    return { type: 'text', text: `${hi}And sleep — roughly how many nights a week do you get 7+ hours?` }
  }

  if (flow.step === 'sleep') {
    const answers = { ...(flow.answers || {}), sleep: t.trim() }
    next.slowFlow = { ...flow, step: 'done', answers }
    saveChatContext(next, user)

    const n = formatNutrition(user)
    const proteinHint =
      n.target != null
        ? `Your protein target is ${n.target}g; logging shows where the gap is.`
        : 'Dial in protein first — it is the lever most people under-hit.'

    const advice = [
      `${hi}Here is a straight take based on what you said: weeks training: "${answers.weeks || '?'}", nutrition: "${answers.nutrition || '?'}", sleep: "${answers.sleep || '?'}".`,
      proteinHint,
      `If sleep is short, gains and recovery stall before your program does — one earlier bedtime this week is a real intervention.`,
      `If nutrition has been messy, pick two repeat meals you actually like and run them on autopilot for 10 days — fewer decisions, more consistency.`,
      `In the gym, add one small win: an extra rep at the same weight, or one more set logged with intent. Progress is boring before it is obvious.`,
    ]
    return { type: 'text', text: advice.join(' ') }
  }

  return { type: 'text', text: `${hi}Let us keep digging — what feels stuck?` }
}

export function newMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
