/**
 * Re-engagement: detect absence, personalize copy, suppress after repeated dismissals,
 * and track genuine comebacks (training or chat).
 */

const LAST_OPEN_KEY = 'forma_last_app_open'
const STATE_KEY = 'forma_reengagement_state'

function email() {
  return localStorage.getItem('forma_auth') || ''
}

function lastOpenKey() {
  const e = email()
  return e ? `${LAST_OPEN_KEY}_${e}` : null
}

function stateKey() {
  const e = email()
  return e ? `${STATE_KEY}_${e}` : null
}

function loadState() {
  const k = stateKey()
  if (!k) return { ignoredStreak: 0, suppressed: false }
  try {
    const raw = localStorage.getItem(k)
    const o = raw ? JSON.parse(raw) : {}
    return {
      ignoredStreak: typeof o.ignoredStreak === 'number' ? o.ignoredStreak : 0,
      suppressed: !!o.suppressed,
      lastReengagedAt: o.lastReengagedAt || null,
    }
  } catch {
    return { ignoredStreak: 0, suppressed: false }
  }
}

function isSuppressed() {
  const st = loadState()
  return st.suppressed || st.ignoredStreak >= 3
}

function saveState(partial) {
  const k = stateKey()
  if (!k) return
  const prev = loadState()
  try {
    localStorage.setItem(k, JSON.stringify({ ...prev, ...partial }))
  } catch {
    /* ignore */
  }
}

const PENDING_SESSION_KEY = 'forma_reengagement_pending'

/** While overlay or follow-up is active — cleared on engage, defer, or dismiss. */
export function setReengagementSessionPending(payload) {
  try {
    sessionStorage.setItem(
      PENDING_SESSION_KEY,
      JSON.stringify({ tier: payload.tier, daysAbsent: payload.daysAbsent, at: Date.now() }),
    )
  } catch {
    /* ignore */
  }
}

export function getReengagementSessionPending() {
  try {
    const raw = sessionStorage.getItem(PENDING_SESSION_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o || typeof o.tier !== 'string') return null
    return o
  } catch {
    return null
  }
}

export function clearReengagementSessionPending() {
  try {
    sessionStorage.removeItem(PENDING_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * @returns {{ show: boolean; daysAbsent: number; tier: '3'|'7'|'14'|null; isFirstVisit: boolean; suppressed: boolean }}
 */
export function evaluateReengagement() {
  const key = lastOpenKey()
  if (isSuppressed()) {
    return { show: false, daysAbsent: 0, tier: null, isFirstVisit: false, suppressed: true }
  }

  if (!key) {
    return { show: false, daysAbsent: 0, tier: null, isFirstVisit: false, suppressed: false }
  }

  const raw = localStorage.getItem(key)
  if (!raw) {
    return { show: false, daysAbsent: 0, tier: null, isFirstVisit: true, suppressed: false }
  }

  const last = new Date(raw)
  if (Number.isNaN(last.getTime())) {
    return { show: false, daysAbsent: 0, tier: null, isFirstVisit: true, suppressed: false }
  }

  const now = new Date()
  const diffMs = now.getTime() - last.getTime()
  const daysAbsent = Math.floor(diffMs / 86400000)

  if (daysAbsent < 3) {
    return { show: false, daysAbsent, tier: null, isFirstVisit: false, suppressed: false }
  }

  const tier = daysAbsent >= 14 ? '14' : daysAbsent >= 7 ? '7' : '3'

  return {
    show: true,
    daysAbsent,
    tier,
    isFirstVisit: false,
    suppressed: false,
  }
}

/** Call when user is active and we are NOT showing the re-engagement overlay. */
export function recordNormalAppVisit() {
  const key = lastOpenKey()
  if (!key) return
  try {
    localStorage.setItem(key, new Date().toISOString())
  } catch {
    /* ignore */
  }
}

/** After Let's go → training — resets deferral streak. */
export function dismissReengagement() {
  clearReengagementSessionPending()
  saveState({ ignoredStreak: 0, lastReengagedAt: new Date().toISOString(), suppressed: false })
  recordNormalAppVisit()
}

/** User chose "I need more time" — count toward suppression; still update last visit.
 *  Session pending is kept until they send a chat message (markReengagementEngaged) or tap Let's go (dismiss). */
export function recordReengagementDeferAndVisit() {
  const st = loadState()
  const next = st.ignoredStreak + 1
  saveState({ ignoredStreak: next, suppressed: next >= 3 })
  recordNormalAppVisit()
}

/** User replied in chat or trained — genuine re-engagement. */
export function markReengagementEngaged() {
  clearReengagementSessionPending()
  saveState({ ignoredStreak: 0, lastReengagedAt: new Date().toISOString(), suppressed: false })
  recordNormalAppVisit()
}

/** Stop showing overlays after 3 consecutive deferrals (no training / no coach reply tracked). */
export function suppressReengagementForever() {
  saveState({ suppressed: true })
}

export function getReengagementState() {
  return loadState()
}
