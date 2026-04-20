import { buildSystemPrompt, loadProgramFromStorage, normalizeUserProfileForProgram } from './programBuilder'

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'
const ANTHROPIC_MAX_TOKENS = 1500
const USER_FACING_ERROR = 'Something went wrong on our end. Please try again in a moment.'

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

export async function sendMessageToCoach(userMessage, fullUserProfile, conversationHistory = [], systemPromptOverride = '') {
  const profile = normalizeUserProfileForProgram(buildPromptProfile(fullUserProfile))
  const program = loadProgramFromStorage()

  const systemPrompt = (systemPromptOverride || '').trim() || buildSystemPrompt(profile, program)

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
