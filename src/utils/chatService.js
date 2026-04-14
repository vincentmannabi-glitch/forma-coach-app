import { getCurrentUser } from './auth'

async function getUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
}

function storageKey(userId) {
  return `forma_chat_messages_${userId}`
}

function loadRaw(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRaw(userId, list) {
  if (!userId) return
  localStorage.setItem(storageKey(userId), JSON.stringify(list))
}

export async function loadChatMessages() {
  const userId = await getUserId()
  if (!userId) return []

  const raw = loadRaw(userId)
  return raw.map((row) => ({
    id: row.id,
    role: row.role,
    text: row.content,
    variant: row.variant,
    createdAt: row.created_at,
    exerciseBlock: row.exercise_block,
    sportBlock: row.sport_block,
  })).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
}

export async function saveChatMessages(messages) {
  const userId = await getUserId()
  if (!userId) return

  if (messages.length === 0) {
    saveRaw(userId, [])
    return
  }

  const rows = messages.map((m) => ({
    id: m.id,
    user_id: userId,
    content: m.text || '',
    role: m.role,
    variant: m.variant,
    exercise_block: m.exerciseBlock,
    sport_block: m.sportBlock,
    created_at: m.createdAt || new Date().toISOString(),
  }))
  saveRaw(userId, rows)
}

export async function appendChatMessage(msg) {
  const userId = await getUserId()
  if (!userId) return

  const raw = loadRaw(userId)
  raw.push({
    id: msg.id,
    user_id: userId,
    content: msg.text || '',
    role: msg.role,
    variant: msg.variant,
    exercise_block: msg.exerciseBlock,
    sport_block: msg.sportBlock,
    created_at: msg.createdAt || new Date().toISOString(),
  })
  saveRaw(userId, raw)
}
