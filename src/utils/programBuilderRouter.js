/**
 * Program entry for screens that need a default program.
 * Delegates to buildProgram() in programBuilder.js (single source of truth).
 */

import { buildProgram, getDefaultProgramProfile, normalizeUserProfileForProgram } from './programBuilder'

export function buildProgramForProfile(profile = {}) {
  let storedProfile = {}
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('forma_user_profile')
      storedProfile = raw ? JSON.parse(raw) : {}
    }
  } catch {
    storedProfile = {}
  }
  const merged = normalizeUserProfileForProgram({
    ...getDefaultProgramProfile(),
    ...storedProfile,
    ...(profile && typeof profile === 'object' ? profile : {}),
  })
  return buildProgram(merged)
}
