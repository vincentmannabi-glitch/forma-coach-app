/**
 * Variation rows for “You can also perform this movement like this” — names must match
 * exercises.js or movementLibraryExtra.js where possible so Learn more can resolve content.
 */

/** @type {Record<string, { name: string; diffLine: string }[]>} */
export const VARIATIONS_BY_EXERCISE_ID = {
  'int-barbell-bench': [
    { name: 'Incline Barbell Bench Press', diffLine: 'Incline backrest emphasizes upper chest and front delts versus flat bar path.' },
    { name: 'Dumbbell Bench Press', diffLine: 'Independent arms and neutral-grip options; often a longer range at the bottom.' },
    { name: 'Close Grip Bench Press', diffLine: 'Narrower grip shifts more work to triceps and lockout versus chest-dominant press.' },
    { name: 'Decline Bench Press', diffLine: 'Decline setup changes bar path and lower-chest emphasis versus flat bench.' },
  ],
  'int-deadlift': [
    { name: 'Sumo Deadlift', diffLine: 'Wider stance and vertical torso — often more quad and adductor, different hip demand.' },
    { name: 'Trap Bar Deadlift', diffLine: 'Neutral grip and higher handles — different bar path and leg emphasis for many lifters.' },
    { name: 'Romanian Deadlift', diffLine: 'Hinge with minimal knee bend — hammers hamstrings and glutes without floor pull.' },
    { name: 'Deficit Deadlift', diffLine: 'Standing on a small platform increases range and start difficulty versus floor pull.' },
  ],
  'int-back-squat': [
    { name: 'Front Squat', diffLine: 'Bar in front rack — more upright torso, more quad and upper-back demand.' },
    { name: 'Goblet Squat', diffLine: 'Front-loaded dumbbell or kettlebell — self-limiting and great for learning depth.' },
    { name: 'Hack Squat', diffLine: 'Machine supports torso — legs take load with less balance demand than barbell.' },
    { name: 'Safety Bar Squat', diffLine: 'Specialty bar changes shoulder and torso angle versus straight bar on back.' },
  ],
  'int-barbell-row': [
    { name: 'Pendlay Row', diffLine: 'Bar starts on the floor each rep — stricter torso angle and dead stop.' },
    { name: 'T-Bar Row', diffLine: 'Fixed arc and chest-supported options change stability and line of pull.' },
    { name: 'Seated Cable Row', diffLine: 'Cable constant tension; seated support reduces lower-back demand versus hinge row.' },
    { name: 'Chest-Supported Row', diffLine: 'Chest on pad reduces momentum and lower-back load versus standing barbell row.' },
  ],
  'int-ohp': [
    { name: 'Push Press', diffLine: 'Leg drive helps move heavier loads — still overhead finish but not strict press.' },
    { name: 'Dumbbell Shoulder Press', diffLine: 'Independent arms; neutral or pronated grips change shoulder path and stability.' },
    { name: 'Landmine Press', diffLine: 'Arched bar path and single-arm options reduce strict vertical shoulder demand.' },
    { name: 'Push Jerk', diffLine: 'Dip and drive with a catch — Olympic-style overhead, not a strict press.' },
  ],
  'int-rdl': [
    { name: 'Stiff-Leg Deadlift', diffLine: 'Often longer legs straighter knees — more hamstring stretch than typical RDL.' },
    { name: 'Single-Leg RDL', diffLine: 'Unilateral hinge — balance and hip stability work per side.' },
    { name: 'Good Morning', diffLine: 'Bar on back hinges torso — different load angle than bar-in-hands RDL.' },
    { name: 'Trap Bar Deadlift', diffLine: 'Different handles and joint angles — sometimes easier to learn hinge pattern.' },
  ],
  'beg-rdl': [
    { name: 'Romanian Deadlift', diffLine: 'Barbell version of the same hinge with heavier loading potential.' },
    { name: 'Single-Leg RDL', diffLine: 'One-leg hinge for balance and single-side hamstring emphasis.' },
    { name: 'Good Morning', diffLine: 'Bar on upper back — hinge pattern with different leverage than RDL.' },
  ],
}

/** Barbell curl default (library) — keyed by exact library name after we add it */
export const VARIATIONS_BY_LIBRARY_NAME = {
  'Barbell Curl': [
    { name: 'Hammer Curl', diffLine: 'Neutral grip shifts emphasis toward brachialis and brachioradialis versus supinated curl.' },
    { name: 'Preacher Curl', diffLine: 'Arms fixed on pad reduces cheating and stretches biceps at the bottom.' },
    { name: 'Concentration Curl', diffLine: 'Seated, elbow on thigh — strict single-arm curl with minimal momentum.' },
    { name: 'Drag Curl', diffLine: 'Bar stays close to torso — different line of pull and elbow position.' },
  ],
  'Incline Barbell Bench Press': [
    { name: 'Barbell Bench Press', diffLine: 'Flat bench is the default horizontal barbell press for full chest emphasis.' },
    { name: 'Incline Dumbbell Bench Press', diffLine: 'Dumbbells allow independent arms and deeper stretch at the bottom.' },
    { name: 'Decline Bench Press', diffLine: 'Decline angle shifts emphasis toward lower chest versus incline upper.' },
  ],
}
