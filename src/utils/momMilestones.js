/**
 * Celebration milestones for moms — warm, non-competitive.
 */

import { getSessionCount } from './workouts'
import { isMomExperience } from './momExperience'

const SEEN_KEY = 'forma_mom_milestones_seen'

function key(user) {
  const uid = user?.id || user?.email || ''
  return uid ? `${SEEN_KEY}_${uid}` : null
}

function loadSeen(user) {
  const k = key(user)
  if (!k) return new Set()
  try {
    const raw = localStorage.getItem(k)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function markSeen(id, user) {
  const k = key(user)
  if (!k) return
  const s = loadSeen(user)
  s.add(id)
  try {
    localStorage.setItem(k, JSON.stringify([...s]))
  } catch {
    /* ignore */
  }
}

/**
 * @param {object} user
 * @returns {Promise<{ id: string; title: string; body: string } | null>}
 */
export async function popNextMomMilestoneCelebration(user) {
  if (!user || !isMomExperience(user)) return null

  const seen = loadSeen(user)
  const nSessions = await getSessionCount()

  if (!seen.has('first_session_back') && nSessions === 1) {
    markSeen('first_session_back', user)
    return {
      id: 'first_session_back',
      title: 'First session back',
      body: 'That first session after everything changed? You showed up. That is courage — not motivation, courage. I am proud of you.',
    }
  }

  return null
}
