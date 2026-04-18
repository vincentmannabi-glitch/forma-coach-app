/**
 * AI Program Generator — client side
 * Called once after onboarding. Sends the client profile to the AI,
 * gets back a custom program, saves it to localStorage.
 */

import { saveProgramToStorage } from './programBuilder'
import { buildProgramForProfile } from './programBuilderRouter'

/**
 * Generate a personalized program using AI coaching intelligence.
 * Falls back to the logic-based router if AI fails.
 *
 * @param {object} profile - Full client profile from onboarding
 * @returns {Promise<{ program: object, aiGenerated: boolean }>}
 */
export async function generateAIProgram(profile) {
  // Always build the logic-based fallback first — instant, reliable
  const fallbackProgram = buildProgramForProfile(profile)

  try {
    const response = await fetch('/api/generate-program', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profile, fallbackProgram }),
    })

    if (!response.ok) {
      console.warn('AI program generation failed, using fallback')
      return { program: fallbackProgram, aiGenerated: false }
    }

    const data = await response.json()

    if (data.program && data.aiGenerated) {
      saveProgramToStorage(data.program)
      return { program: data.program, aiGenerated: true }
    }

    // AI failed or returned invalid — use fallback
    saveProgramToStorage(fallbackProgram)
    return { program: fallbackProgram, aiGenerated: false }

  } catch (err) {
    console.warn('AI program generation error, using fallback:', err)
    saveProgramToStorage(fallbackProgram)
    return { program: fallbackProgram, aiGenerated: false }
  }
}
