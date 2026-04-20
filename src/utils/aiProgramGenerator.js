/**
 * Program after onboarding — uses buildProgram() from programBuilder.js.
 * Optionally calls the AI endpoint; merge on server still uses the same fallback shape.
 */

import { buildProgram, normalizeUserProfileForProgram, saveProgramToStorage } from './programBuilder'

function mergeStoredProfile(profile = {}) {
  let stored = {}
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('forma_user_profile')
      stored = raw ? JSON.parse(raw) : {}
    }
  } catch {
    stored = {}
  }
  return normalizeUserProfileForProgram({ ...stored, ...(profile && typeof profile === 'object' ? profile : {}) })
}

/**
 * @param {object} profile - Full client profile from onboarding
 * @returns {Promise<{ program: object, aiGenerated: boolean }>}
 */
export async function generateAIProgram(profile) {
  const userProfile = mergeStoredProfile(profile)
  const fallbackProgram = buildProgram(userProfile)

  try {
    const response = await fetch('/api/generate-program', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profile: userProfile, fallbackProgram }),
    })

    if (!response.ok) {
      console.warn('AI program generation failed, using buildProgram fallback')
      saveProgramToStorage(fallbackProgram)
      return { program: fallbackProgram, aiGenerated: false }
    }

    const data = await response.json()

    if (data.program && data.aiGenerated) {
      saveProgramToStorage(data.program)
      return { program: data.program, aiGenerated: true }
    }

    saveProgramToStorage(fallbackProgram)
    return { program: fallbackProgram, aiGenerated: false }
  } catch (err) {
    console.warn('AI program generation error, using buildProgram fallback:', err)
    saveProgramToStorage(fallbackProgram)
    return { program: fallbackProgram, aiGenerated: false }
  }
}
