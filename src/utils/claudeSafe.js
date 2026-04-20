/**
 * Loads Claude integration dynamically so a bad import or missing module cannot crash the app bundle.
 */
export async function sendMessageToCoachSafe(userMessage, fullUserProfile, conversationHistory, systemPromptOverride) {
  try {
    const mod = await import('./claude.js')
    if (typeof mod.sendMessageToCoach !== 'function') {
      console.error('claude.js: sendMessageToCoach is not a function')
      return {
        ok: false,
        errorMessage: 'Something went wrong on our end. Please try again in a moment.',
      }
    }
    return await mod.sendMessageToCoach(userMessage, fullUserProfile, conversationHistory, systemPromptOverride)
  } catch (err) {
    console.error('Claude client failed to load or run', err)
    return {
      ok: false,
      errorMessage: 'Something went wrong on our end. Please try again in a moment.',
    }
  }
}
