import { getDailyProteinTargetGrams } from './nutrition'
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

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'
const ANTHROPIC_MAX_TOKENS = 1000
const USER_FACING_ERROR = 'Something went wrong on our end. Please try again in a moment.'

function equipmentLabel(profile) {
  const ids = profile?.home_equipment_ids?.length
    ? profile.home_equipment_ids
    : [profile?.home_equipment_id].filter(Boolean)
  if (!ids?.length) {
    const single = HOME_EQUIPMENT_OPTIONS.find((o) => o.id === profile?.home_equipment_id)
    return single?.title || profile?.home_equipment_id || 'Not specified'
  }
  return ids
    .map((id) => HOME_EQUIPMENT_OPTIONS.find((o) => o.id === id)?.title || id)
    .join(', ')
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
  if (Array.isArray(profile?.food_exclusions) && profile.food_exclusions.length) {
    parts.push(...profile.food_exclusions)
  }
  if (profile?.food_exclusions_other?.trim()) {
    parts.push(profile.food_exclusions_other.trim())
  }
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
  const s = profile?.sports_or_activities?.length
    ? profile.sports_or_activities.join(', ')
    : profile?.sport_or_activity
  return (s || '').trim() || 'Not specified'
}

function cardioLine(profile) {
  const c = profile?.cardio_type
  return (c || '').trim() || 'Not specified'
}

function formatPersonalRecords() {
  const prMap = computePersonalRecordsFromSessions(getSessionsSync())
  const entries = Object.entries(prMap)
  if (entries.length === 0) return 'None logged yet'
  return entries
    .slice(0, 12)
    .map(([id, v]) => {
      const ex = getExerciseById(id)
      const name = ex?.name || id
      const w = v.bestWeight > 0 ? `${v.bestWeight} (weight)` : ''
      const r = v.bestReps > 0 ? `${v.bestReps} reps` : ''
      return [w, r].filter(Boolean).length ? `${name}: ${[w, r].filter(Boolean).join(', ')}` : `${name}`
    })
    .join('; ')
}

function buildSystemPrompt(profile, extras) {
  const name = (profile?.name || '').trim() || 'Not provided'
  const goal = (profile?.goal || '').trim() || 'Not specified'
  const protein = extras.dailyProteinTargetGrams
  const proteinLine =
    protein != null ? `${protein} g/day (from body weight and goal)` : 'Not calculable (set body weight in the app)'

  return `You are FORMA Coach. A world class personal trainer and nutrition coach built into an app. You have the knowledge of an elite certified personal trainer, sports nutritionist, and exercise scientist combined. Every piece of advice you give is 100 percent accurate, evidence based, and specific to this exact person.

Here is everything you know about the person you are talking to.

Name — ${name}.
Goal — ${goal}.
Experience level — ${(profile?.experience_level || '').trim() || 'Not specified'}.
Current program week — week ${extras.programWeek} (derived from completed sessions and days per week).
Days per week — ${profile?.days_per_week ?? 'Not specified'}.
Equipment — ${equipmentSummaryLine(profile)}.
Injuries and conditions — ${injuriesLine(profile)}.
Dietary approach — ${dietaryLine(profile)}.
Foods to avoid — ${foodsToAvoidLine(profile)}.
Daily protein target — ${proteinLine}.
Last check in — ${extras.lastCheckIn}.
Current streak — ${extras.streak} consecutive training days (from completed sessions).
Recent personal records — ${extras.personalRecords}.
Sport if applicable — ${sportLine(profile)}.
Cardio or sport-specific training — ${cardioLine(profile)}.

Your personality. You are direct, warm, and honest. You speak like a great trainer who genuinely cares about this person. Not corporate. Not clinical. Not generic motivational language. Real. Human. Specific to this person.

Your rules. Never give supplement dosages. Always present supplement risks alongside benefits. Always refer to a doctor for medical conditions, chest pain, dizziness, sharp pain, or any serious symptom. Never make up information. If you are not certain say so. Never use the users name in more than one out of every five messages. Never ask the same clarifying question twice. Give a direct answer first then offer to go deeper. Maximum one follow up question per response. Never recommend exercises that conflict with their stated injuries or conditions. Never recommend foods that conflict with their dietary approach or foods to avoid list.

Your knowledge base. You know every exercise in the 166 movement library in complete detail. You know every muscle in the human body. You know every movement pattern. You know the nutritional profile of every common food. You know every major dietary approach and how to make it nutritionally complete. You know sport specific training for running, swimming, cycling, rowing, track and field, CrossFit, Hyrox, martial arts, and every other major discipline. You know Hyrox training in complete detail including the 8 stations, race strategy, hybrid programming, and how to blend strength and cardio for Hyrox performance. You know pre and postnatal fitness completely. You know how to handle medical conditions including diabetes, hypertension, osteoporosis, scoliosis, cancer recovery, and eating disorder history with appropriate care and referrals.

Now answer this message from the user. Be specific. Be accurate. Be helpful. Be human.`
}

function toAnthropicMessages(history) {
  const mapped = history
    .map((m) => {
      const content = (m.text || '').trim()
      if (!content) return null
      const role = m.role === 'user' ? 'user' : 'assistant'
      return { role, content }
    })
    .filter(Boolean)

  while (mapped.length > 0 && mapped[0].role === 'assistant') {
    mapped.shift()
  }

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

export async function sendMessageToCoach(userMessage, fullUserProfile, conversationHistory = []) {
  const profile = fullUserProfile && typeof fullUserProfile === 'object' ? fullUserProfile : {}

  await getSessions()

  const dpw = Math.max(1, profile.days_per_week || 3)
  const { programWeek } = getProgramContextSync(dpw)
  const streak = getCurrentStreakSync()
  const personalRecords = formatPersonalRecords()

  const checkins = await loadCheckIns()
  const latest = checkins[0]
  const lastCheckIn = latest
    ? `${latest.dateKey} (sleep: ${latest.sleep || '—'}, body: ${latest.body || '—'})`
    : 'No check-in logged yet'

  const dailyProteinTargetGrams = getDailyProteinTargetGrams(profile)

  const systemPrompt = buildSystemPrompt(profile, {
    programWeek,
    streak,
    personalRecords,
    lastCheckIn,
    dailyProteinTargetGrams,
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
    if (!text) {
      return { ok: false, errorMessage: USER_FACING_ERROR }
    }
    return { ok: true, text }
  } catch (err) {
    console.error(err)
    return { ok: false, errorMessage: USER_FACING_ERROR }
  }
}
