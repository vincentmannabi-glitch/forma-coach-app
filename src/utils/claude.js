import {
  getSessions,
  getProgramContextSync,
  getCurrentStreakSync,
  getSessionsSync,
  computePersonalRecordsFromSessions,
} from './workouts'
import { loadCheckIns } from './checkinsService'
import { getExerciseById } from '../data/exercises'
import { HOME_EQUIPMENT_OPTIONS } from '../data/homeWorkoutCatalog'
import {
  loadProgramFromStorage,
  hasProgramSessions,
  getTodaySessionWithOverride,
} from './programBuilder'

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'
const ANTHROPIC_MAX_TOKENS = 1500
const USER_FACING_ERROR = 'Something went wrong on our end. Please try again in a moment.'

// ─── Profile helpers ──────────────────────────────────────────────────────────

function equipmentLabel(profile) {
  const ids = profile?.home_equipment_ids?.length
    ? profile.home_equipment_ids
    : [profile?.home_equipment_id].filter(Boolean)
  if (!ids?.length) {
    const single = HOME_EQUIPMENT_OPTIONS.find((o) => o.id === profile?.home_equipment_id)
    return single?.title || profile?.home_equipment_id || 'Not specified'
  }
  return ids.map((id) => HOME_EQUIPMENT_OPTIONS.find((o) => o.id === id)?.title || id).join(', ')
}

function equipmentSummaryLine(profile) {
  const raw = (profile?.equipment || '').trim()
  if (raw) return raw
  return equipmentLabel(profile)
}

function dietaryLine(profile) {
  const a = profile?.dietary_approaches
  return Array.isArray(a) && a.length ? a.join(', ') : 'Not specified'
}

function foodsToAvoidLine(profile) {
  const parts = []
  if (Array.isArray(profile?.food_exclusions) && profile.food_exclusions.length) parts.push(...profile.food_exclusions)
  if (profile?.food_exclusions_other?.trim()) parts.push(profile.food_exclusions_other.trim())
  return parts.length ? parts.join('; ') : 'None specified'
}

function injuriesLine(profile) {
  const has = profile?.injuries
  const details = (profile?.injuries_details || '').trim()
  if (!has && !details) return 'None reported'
  if (!has) return details || 'None reported'
  return details ? `Yes — ${details}` : 'Yes (see app for details)'
}

function sportLine(profile) {
  const cardio = (profile?.cardio_type || '').trim()
  const s = profile?.sports_or_activities?.length
    ? profile.sports_or_activities.join(', ')
    : profile?.sport_or_activity
  return [cardio, s].filter(Boolean).join(', ') || 'None'
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('forma_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function buildPromptProfile(profile) {
  const stored = readStoredUser() || {}
  return {
    ...stored,
    ...(profile && typeof profile === 'object' ? profile : {}),
    body_weight: profile?.body_weight ?? profile?.bodyweight ?? stored.body_weight ?? stored.bodyweight ?? null,
    goal: profile?.goal ?? stored.goal ?? 'general fitness',
    experience_level: profile?.experience_level ?? stored.experience_level ?? 'Complete beginner',
    days_per_week: profile?.days_per_week ?? stored.days_per_week ?? 3,
    equipment: profile?.equipment ?? stored.equipment ?? '',
    injuries_details: profile?.injuries_details ?? stored.injuries_details ?? '',
  }
}

function getBodyweightLbs(profile) {
  const fromProfile = Number(profile?.bodyweight ?? profile?.body_weight)
  if (Number.isFinite(fromProfile) && fromProfile > 0) return fromProfile
  const stored = readStoredUser()
  const fromStored = Number(stored?.bodyweight ?? stored?.body_weight)
  if (Number.isFinite(fromStored) && fromStored > 0) return fromStored
  return 180
}

function formatPersonalRecords() {
  const prMap = computePersonalRecordsFromSessions(getSessionsSync())
  const entries = Object.entries(prMap)
  if (entries.length === 0) return 'None logged yet'
  return entries.slice(0, 12).map(([id, v]) => {
    const ex = getExerciseById(id)
    const name = ex?.name || id
    const w = v.bestWeight > 0 ? `${v.bestWeight} kg` : ''
    const r = v.bestReps > 0 ? `${v.bestReps} reps` : ''
    return [w, r].filter(Boolean).length ? `${name}: ${[w, r].filter(Boolean).join(', ')}` : name
  }).join('; ')
}

function buildProgramSummary() {
  try {
    const program = loadProgramFromStorage()
    if (!program || !hasProgramSessions(program)) return 'No program built yet.'
    const schedule = program.weeklySchedule || []
    const sessions = program.sessions || {}
    return schedule.map((entry) => {
      if (!entry.sessionKey || !sessions[entry.sessionKey]) return `${entry.day}: Rest`
      const s = sessions[entry.sessionKey]
      const names = (s.movements || []).map((m) => m.exerciseName || m.name || '').filter(Boolean).join(', ')
      return `${entry.day} (${entry.sessionType || 'training'}): ${names || 'No exercises listed'}`
    }).join('\n')
  } catch { return 'Program unavailable.' }
}

function buildTodaySessionSummary() {
  try {
    const program = loadProgramFromStorage()
    if (!program) return 'No program loaded.'
    const today = getTodaySessionWithOverride(program, new Date())
    if (!today || today.environment === 'rest') return 'Today is a rest day.'
    const exercises = (today.exercises || []).map((ex, i) => {
      const sets = ex.sets || 4
      const reps = ex.repRange ? `${ex.repRange[0]}–${ex.repRange[1]} reps` : 'as programmed'
      const cues = ex.coachingCues || ex.description || ''
      return `${i + 1}. ${ex.displayName || ex.name} — ${sets}×${reps}${cues ? ` | ${cues}` : ''}`
    }).join('\n')
    return `${today.name || 'Training'}:\n${exercises}`
  } catch { return "Today's session unavailable." }
}

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(profile, extras) {
  const name = (profile?.name || '').trim() || 'this client'
  const goal = (profile?.goal || '').trim() || 'general fitness'
  const bodyweightLbs = getBodyweightLbs(profile)
  const proteinLine = `${Math.round(bodyweightLbs * 0.8)}g/day (0.8g/lb)`

  return `You are FORMA Coach. An elite personal trainer and nutrition coach with the knowledge of a certified strength and conditioning specialist, sports nutritionist, and exercise scientist. You think like a real coach — not a chatbot that reads lists.

When a client talks to you, you look at everything you know about them and use your coaching expertise to give them something specific and genuinely useful. You do not give generic answers. You do not say "it depends." You give real coaching based on their actual situation.

━━━ WHO YOU ARE COACHING RIGHT NOW ━━━

Name: ${name}
Goal: ${goal}
Experience level: ${(profile?.experience_level || 'Not specified')}
Body weight: ${bodyweightLbs} lbs
User goal (raw): ${profile?.goal || 'general fitness'}
User experience level (raw): ${profile?.experience_level || 'Complete beginner'}
User days per week (raw): ${profile?.days_per_week ?? 3}
User equipment (raw): ${profile?.equipment || equipmentSummaryLine(profile)}
User injuries details (raw): ${(profile?.injuries_details || '').trim() || 'None reported'}
Equipment: ${equipmentSummaryLine(profile)}
Days per week: ${profile?.days_per_week ?? 'Not specified'}
Session length: ${profile?.session_minutes || 60} minutes
Injuries / limitations: ${injuriesLine(profile)}
Sport or cardio training: ${sportLine(profile)}
Dietary approach: ${dietaryLine(profile)}
Foods to avoid: ${foodsToAvoidLine(profile)}
Daily protein target: ${proteinLine}
Current training streak: ${extras.streak} days
Last check-in: ${extras.lastCheckIn}
Program week: ${extras.programWeek}
Personal records: ${extras.personalRecords}

━━━ THEIR CURRENT PROGRAM ━━━

${extras.programSummary}

━━━ TODAY'S SESSION ━━━

${extras.todaySessionSummary}

━━━ HOW YOU THINK AS A COACH ━━━

When a client asks you anything, you run through this mental process before answering:

1. LOOK AT THE FULL PICTURE. Who is this person? What is their goal, their equipment, their level, their injuries, their sport? Every answer should be filtered through all of that.

2. THINK LIKE A TRAINER. If you were standing in the gym with this client right now, what would you actually say? Not what a textbook says — what would a great coach with 10 years of experience say to THIS person.

3. BE SPECIFIC TO THEM. If they ask about exercise selection, pick movements that match their equipment, their level, their injuries, and their goal. If they are a runner building strength, you think about single-leg stability, hip drive, and injury prevention — not just generic "do squats." If they are doing Race Fit training, you think about the demands of sled pushes, farmers carries, and functional conditioning. If they lift at home with dumbbells, you never suggest a barbell movement.

4. USE YOUR FULL KNOWLEDGE. You know every major movement pattern — squat, hinge, push, pull, carry, rotate, brace. You know how to sequence them, how to progress them, how to regress them. You know how rep ranges, rest periods, and load interact with different goals. You know sport-specific demands — running economy, race conditioning, rowing mechanics, CrossFit energy systems. You know nutrition at a clinical level. USE ALL OF IT.

5. ADAPT TO THEIR SITUATION. Injured? You work around it and tell them exactly how. Low energy today? You scale it down and tell them what to do instead. Feeling strong? You push them. Not progressing? You diagnose why and fix it.

6. GIVE THEM WHAT THEY ACTUALLY NEED. Sometimes that is a straight answer. Sometimes it is a modified workout. Sometimes it is a reality check. Always give them something they can act on immediately.

━━━ YOUR RULES ━━━

- Never give generic advice. Always filter through this specific client's profile.
- Never recommend an exercise they cannot do with their equipment or given their injuries.
- Never recommend food that conflicts with their dietary approach or exclusions.
- Never give supplement dosages. Always include risks alongside any supplement benefit.
- Always refer to a doctor for chest pain, dizziness, sharp pain, or any medical concern.
- Never make up data or claim certainty where you have none — say so and give your best coaching judgment.
- Never say you do not know the user's body weight. Use the provided body weight value in this prompt.
- Use their name at most once every five messages.
- Give a direct answer first, then offer to go deeper.
- One follow-up question maximum per response.
- Be direct, warm, and real. Not corporate. Not generic. Not a robot reading a manual.

Now read this client's message and respond as their coach.`
}

// ─── Anthropic API ────────────────────────────────────────────────────────────

function toAnthropicMessages(history) {
  const mapped = history
    .map((m) => {
      const content = (m.text || '').trim()
      if (!content) return null
      return { role: m.role === 'user' ? 'user' : 'assistant', content }
    })
    .filter(Boolean)

  while (mapped.length > 0 && mapped[0].role === 'assistant') mapped.shift()

  const out = []
  for (const m of mapped) {
    const last = out[out.length - 1]
    if (last && last.role === m.role) {
      last.content = `${last.content}\n\n${m.content}`
    } else {
      out.push({ role: m.role, content: m.content })
    }
  }
  return out
}

async function callAnthropicViaServerless({ systemPrompt, messages }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  })

  const raw = await res.text()
  if (!res.ok) {
    console.error('Anthropic API error', res.status, raw.slice(0, 500))
    return null
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    console.error('Anthropic API: invalid JSON')
    return null
  }

  const text = data.content?.find((c) => c.type === 'text')?.text?.trim() || ''
  return text || null
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function sendMessageToCoach(userMessage, fullUserProfile, conversationHistory = []) {
  const profile = buildPromptProfile(fullUserProfile)

  await getSessions()

  const dpw = Math.max(1, profile.days_per_week || 3)
  const { programWeek } = getProgramContextSync(dpw)
  const streak = getCurrentStreakSync()
  const personalRecords = formatPersonalRecords()

  const checkins = await loadCheckIns()
  const latest = checkins[0]
  const lastCheckIn = latest
    ? `${latest.dateKey} (sleep: ${latest.sleep || '—'}, energy: ${latest.energy || '—'})`
    : 'No check-in logged yet'

  const dailyProteinTargetGrams = Math.round(getBodyweightLbs(profile) * 0.8)
  const programSummary = buildProgramSummary()
  const todaySessionSummary = buildTodaySessionSummary()

  const systemPrompt = buildSystemPrompt(profile, {
    programWeek,
    streak,
    personalRecords,
    lastCheckIn,
    dailyProteinTargetGrams,
    programSummary,
    todaySessionSummary,
  })

  const recent = conversationHistory.slice(-10)
  const messages = toAnthropicMessages(recent)
  const lastUser = messages[messages.length - 1]
  if (lastUser?.role === 'user' && !(lastUser.content || '').trim() && (userMessage || '').trim()) {
    lastUser.content = userMessage.trim()
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return { ok: false, errorMessage: USER_FACING_ERROR }
  }

  try {
    const text = await callAnthropicViaServerless({ systemPrompt, messages })
    if (!text) return { ok: false, errorMessage: USER_FACING_ERROR }
    return { ok: true, text }
  } catch (err) {
    console.error(err)
    return { ok: false, errorMessage: USER_FACING_ERROR }
  }
}
