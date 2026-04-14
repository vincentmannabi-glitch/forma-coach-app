/**
 * Moms & pregnancy experience — tone, phases, training caps, and coaching copy.
 */

/** @typedef {'standard'|'parent'|'pregnant'|'postnatal'} MomJourney */

export const MOM_WELCOME_AFTER_ONBOARDING = `You already do everything for everyone. This is the one thing that is just for you.

Your program is built around your life — not the other way around. Short sessions. Real food your family will love. Someone checking in on you every morning.

We are going to make this the easiest it has ever been.

Welcome to FORMA Coach.`

export function isMomExperience(user) {
  if (!user) return false
  const j = user.mom_journey
  if (j && j !== 'standard') return true
  if (user.parent_snacking) return true
  return false
}

export function isPregnant(user) {
  return user?.mom_journey === 'pregnant'
}

export function isPostnatal(user) {
  return user?.mom_journey === 'postnatal'
}

/** @param {object} user */
export function getHouseholdSize(user) {
  const n = user?.household_size
  if (typeof n === 'number' && n >= 1 && n <= 12) return n
  return isMomExperience(user) ? 4 : 1
}

/**
 * @returns {'0-6'|'6-12'|'12-26'|'26+'|null}
 */
export function getPostnatalBand(user) {
  return user?.postnatal_band || null
}

/**
 * @returns {1|2|3|null}
 */
export function getPregnancyTrimester(user) {
  const t = user?.pregnancy_trimester
  if (t === 1 || t === 2 || t === 3) return t
  return null
}

/** @returns {number|null} */
export function getPregnancyWeeks(user) {
  const w = user?.pregnancy_weeks
  if (typeof w === 'number' && w >= 1 && w <= 42) return w
  return null
}

/** @returns {number|null} */
export function getPostnatalWeeks(user) {
  const w = user?.postnatal_weeks
  if (typeof w === 'number' && w >= 1 && w <= 52) return w
  return null
}

/** @returns {'natural'|'caesarean'|null} */
export function getBirthType(user) {
  const b = user?.birth_type
  if (b === 'natural' || b === 'caesarean') return b
  return null
}

export function isBreastfeeding(user) {
  return user?.breastfeeding === true
}

export function isExerciseCleared(user) {
  return user?.exercise_cleared === true || user?.doctor_cleared === true
}

export function isCookingForFamily(user) {
  return user?.cooking_for_family === true
}

/** Session length cap in minutes (total including warm-up feel). */
export function getMomSessionCapMinutes(user, modifiers = null) {
  const preferred = user?.mom_session_minutes
  if (typeof preferred === 'number' && [20, 30, 45].includes(preferred)) return preferred
  let cap = 45
  if (modifiers?.momMicroSession) return Math.min(cap, 15)
  if (modifiers?.momShorterSession) return Math.min(cap, 25)
  return cap
}

export function shouldDefaultHomeTraining(user) {
  return isMomExperience(user)
}

export function momTrainingIntroLine(user) {
  if (!isMomExperience(user)) return ''
  return 'Every session fits a living room, garden, or hotel — equipment optional. Nap times and school runs come first.'
}

export function pregnancyExerciseGuidance(trimester) {
  if (trimester === 1) {
    return 'First trimester: move in a way that feels steady — avoid breath-holding and overheating; sip water; stop if you feel dizzy or cramping and speak with your midwife or doctor about anything that worries you.'
  }
  if (trimester === 2) {
    return 'Second trimester: many people feel stronger now — keep loads conversational, avoid lying flat on your back for long stretches, and get clearance for anything high-impact.'
  }
  if (trimester === 3) {
    return 'Third trimester: balance and breathing matter most — shorter sets, slower transitions, and your care team should sign off on anything new.'
  }
  return ''
}

export function postnatalPhaseGuidance(band) {
  if (band === '0-6') {
    return 'These first weeks: gentle walking, breathing, and pelvic floor connection — no rush, no comparison. Your body is healing; we keep load light until you are cleared.'
  }
  if (band === '6-12') {
    return 'Weeks six to twelve: gradual return — we still bias the floor of your core and pelvic floor before we chase heavy numbers.'
  }
  if (band === '12-26') {
    return 'Three to six months postpartum: strength builds in waves — we progress when your body says yes more often than no.'
  }
  if (band === '26+') {
    return 'Six months and beyond: full training is on the menu when you feel ready — still no guilt on light days.'
  }
  return ''
}

export function pelvicFloorWarmupCue() {
  return 'Easy breathing: inhale through the nose, let the ribs expand; exhale like fogging a mirror — feel the lower abs draw in without gripping. Three slow rounds — this is your foundation for everything today.'
}

export function pelvicFloorCooldownCue() {
  return 'Finish with a gentle pelvic floor reset: lie on your side or stay tall — a few slow breaths, letting the hips stay heavy. No strain — just closure after the work.'
}

export function pregnancyFoodDisclaimer() {
  return 'Some foods need extra care in pregnancy — we flag recipes when it matters. Anything uncertain goes to your midwife or doctor, not a guess from an app.'
}

export function momProgressHeadline() {
  return 'How you feel matters as much as the numbers'
}

export function momCookbookHeader() {
  return "This week feeds your whole family — not just you"
}

export function momCookbookSub() {
  return 'Real food everyone can share. Your portions are tuned to your goal; the table stays happy.'
}
