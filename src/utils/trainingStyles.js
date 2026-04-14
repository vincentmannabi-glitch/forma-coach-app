/**
 * Canonical training style ids ↔ onboarding `training_style` strings.
 */

export const TRAINING_STYLE_IDS = ['gym', 'calisthenics', 'both', 'home']

const ONBOARDING_TO_ID = {
  'gym weights': 'gym',
  gym: 'gym',
  calisthenics: 'calisthenics',
  both: 'both',
  'gym and calisthenics': 'both',
  'home workout': 'home',
}

export const TRAINING_STYLE_LABELS = {
  gym: 'Gym',
  calisthenics: 'Calisthenics',
  both: 'Hybrid',
  home: 'Home',
}

const LAST_KEY = 'forma_train_last_style'
const TODAY_KEY = 'forma_train_today_override'

function dateKeyLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Map onboarding label to canonical id. */
export function trainingStyleIdFromOnboarding(trainingStyle) {
  if (!trainingStyle || typeof trainingStyle !== 'string') return null
  const k = trainingStyle.trim().toLowerCase()
  return ONBOARDING_TO_ID[k] || null
}

/** Preferred style from user profile (onboarding). */
export function getPreferredTrainingStyleId(user) {
  if (user?.mom_journey && user.mom_journey !== 'standard') return 'home'
  if (user?.parent_snacking) return 'home'
  const styles = user?.training_styles || [user?.training_style].filter(Boolean)
  for (const s of styles) {
    const id = trainingStyleIdFromOnboarding(s || '')
    if (id === 'home') return 'home'
  }
  const hasGym = styles.some((s) => trainingStyleIdFromOnboarding(s) === 'gym')
  const hasCalisthenics = styles.some((s) => trainingStyleIdFromOnboarding(s) === 'calisthenics')
  if (hasGym && hasCalisthenics) return 'both'
  if (hasGym) return 'gym'
  if (hasCalisthenics) return 'calisthenics'
  return trainingStyleIdFromOnboarding(user?.training_style || '') || 'gym'
}

export function getLastUsedTrainingStyleId() {
  try {
    const raw = localStorage.getItem(LAST_KEY)
    if (!raw || !TRAINING_STYLE_IDS.includes(raw)) return null
    return raw
  } catch {
    return null
  }
}

export function setLastUsedTrainingStyleId(styleId) {
  if (!TRAINING_STYLE_IDS.includes(styleId)) return
  try {
    localStorage.setItem(LAST_KEY, styleId)
  } catch {
    /* ignore */
  }
}

/** @returns {{ styleId: string } | null} */
export function readTodayStyleOverride() {
  try {
    const raw = sessionStorage.getItem(TODAY_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o || o.dateKey !== dateKeyLocal() || !TRAINING_STYLE_IDS.includes(o.styleId)) return null
    return { styleId: o.styleId }
  } catch {
    return null
  }
}

export function writeTodayStyleOverride(styleId) {
  if (!TRAINING_STYLE_IDS.includes(styleId)) return
  try {
    sessionStorage.setItem(
      TODAY_KEY,
      JSON.stringify({ dateKey: dateKeyLocal(), styleId }),
    )
  } catch {
    /* ignore */
  }
}

export function clearTodayStyleOverride() {
  try {
    sessionStorage.removeItem(TODAY_KEY)
  } catch {
    /* ignore */
  }
}

/** @returns {string[]} — Training styles the user may choose from (onboarding only). */
export function getAllowedTrainingStyleIds(user) {
  if (user?.mom_journey && user.mom_journey !== 'standard') return ['home']
  if (user?.parent_snacking) return ['home']

  const styles = user?.training_styles || [user?.training_style].filter(Boolean)
  const ids = [...new Set(styles.map((s) => trainingStyleIdFromOnboarding(s)).filter(Boolean))]
  const hasGym = ids.includes('gym')
  const hasCal = ids.includes('calisthenics')
  const hasHome = ids.includes('home')

  if (hasHome && !hasGym && !hasCal) return ['home']
  if (hasGym && hasCal) return ['gym', 'calisthenics', 'both']
  if (hasGym) return ['gym']
  if (hasCal) return ['calisthenics']
  return ['gym']
}

/** Default tab from onboarding (not “last used” / today override). */
export function resolveDefaultTrainingStyleId(user) {
  const allowed = getAllowedTrainingStyleIds(user)
  const preferred = getPreferredTrainingStyleId(user)
  if (allowed.includes(preferred)) return preferred
  return allowed[0] || 'gym'
}

export function clampTrainingStyleId(user, styleId) {
  const allowed = getAllowedTrainingStyleIds(user)
  if (allowed.includes(styleId)) return styleId
  return resolveDefaultTrainingStyleId(user)
}

export function trainPathForStyleId(styleId) {
  const map = {
    gym: '/train/gym',
    calisthenics: '/train/calisthenics',
    both: '/train/both',
    home: '/train/home',
  }
  return map[styleId] || '/train/gym'
}
