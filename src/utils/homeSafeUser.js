import { getCurrentUserSync } from './auth'

/**
 * Merges auth profile with localStorage user and applies non-null fallbacks so Home never reads undefined.
 * @param {object | null | undefined} profileFromAuth
 * @returns {object}
 */
export function buildSafeHomeUser(profileFromAuth) {
  try {
    const stored = getCurrentUserSync()
    const raw = {
      ...(stored && typeof stored === 'object' ? stored : {}),
      ...(profileFromAuth && typeof profileFromAuth === 'object' ? profileFromAuth : {}),
    }

    const name =
      raw.name != null && String(raw.name).trim() ? String(raw.name).trim() : 'Friend'

    const goal =
      raw.goal != null && String(raw.goal).trim()
        ? String(raw.goal).trim()
        : 'general fitness'

    const experience_level =
      raw.experience_level != null && String(raw.experience_level).trim()
        ? String(raw.experience_level).trim()
        : 'Complete beginner'

    const training_style =
      raw.training_style != null && String(raw.training_style).trim()
        ? String(raw.training_style).trim()
        : 'gym'

    const days = Number(raw.days_per_week ?? raw.daysPerWeek)
    const days_per_week = Number.isFinite(days) && days > 0 ? days : 3
    const session = Number(raw.session_minutes ?? raw.sessionDuration)
    const session_minutes = [30, 45, 60, 75, 90].includes(session) ? session : 60

    const id =
      raw.id != null && String(raw.id).trim()
        ? String(raw.id).trim()
        : 'forma_local_user'

    const email = raw.email != null ? String(raw.email) : ''

    return {
      ...raw,
      id,
      email,
      name,
      goal,
      experience_level,
      training_style,
      days_per_week,
      session_minutes,
      sessionDuration: raw.sessionDuration ?? session_minutes,
      experienceLevel: raw.experienceLevel ?? experience_level,
      trainingStyle: raw.trainingStyle ?? training_style,
      daysPerWeek: raw.daysPerWeek ?? days_per_week,
    }
  } catch {
    return {
      id: 'forma_local_user',
      email: '',
      name: 'Friend',
      goal: 'general fitness',
      experience_level: 'Complete beginner',
      training_style: 'gym',
      days_per_week: 3,
      session_minutes: 60,
      sessionDuration: 60,
      experienceLevel: 'Complete beginner',
      trainingStyle: 'gym',
      daysPerWeek: 3,
    }
  }
}

export function homeGreetingLine(name) {
  const n = name && String(name).trim() ? String(name).trim() : 'Friend'
  const h = new Date().getHours()
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${part}, ${n}`
}
