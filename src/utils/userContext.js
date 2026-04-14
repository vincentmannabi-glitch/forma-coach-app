/**
 * Central data utilization system. Every onboarding data point actively changes the app.
 * Single source of truth for "how does X affect Y".
 */

const KG_TO_LB = 2.2046226218

// ─── Name ───────────────────────────────────────────────────────────────────

/** First name for all messages, check-ins, notifications, chat. Never generic. */
export function firstName(user) {
  const n = (user?.name || '').trim()
  if (!n) return ''
  return n.split(/\s+/)[0]
}

/** Display name with fallback. */
export function displayName(user, fallback = 'there') {
  return firstName(user) || fallback
}

// ─── Goal ────────────────────────────────────────────────────────────────────

export const GOAL_IDS = {
  FAT_LOSS: 'fat_loss',
  MUSCLE: 'muscle',
  SPORT: 'sport',
  GENERAL: 'general',
}

/** Resolve goal to program- and nutrition-driving id. */
export function getGoalId(user) {
  const goals = user?.goals || [user?.goal].filter(Boolean)
  const blob = goals.map((g) => (g || '').toLowerCase()).join(' ')
  const hasFat = blob.includes('lose fat') || blob.includes('lean')
  const hasMuscle = blob.includes('build muscle') || blob.includes('stronger')
  const hasSport = blob.includes('sport') || blob.includes('competition')
  if (hasFat && hasMuscle) return GOAL_IDS.GENERAL
  if (hasFat) return GOAL_IDS.FAT_LOSS
  if (hasMuscle) return GOAL_IDS.MUSCLE
  if (hasSport) return GOAL_IDS.SPORT
  if (blob.includes('general') || blob.includes('feel better')) return GOAL_IDS.GENERAL
  return GOAL_IDS.GENERAL
}

/** Is fat loss goal — affects cardio emphasis, calorie tone. */
export function isFatLossGoal(user) {
  return getGoalId(user) === GOAL_IDS.FAT_LOSS
}

/** Chat tone: fat loss gets supportive, muscle/sport gets performance-focused. */
export function getGoalChatTone(user) {
  const id = getGoalId(user)
  if (id === GOAL_IDS.FAT_LOSS) return 'supportive'
  if (id === GOAL_IDS.SPORT) return 'performance'
  if (id === GOAL_IDS.MUSCLE) return 'strength'
  return 'balanced'
}

// ─── Bodyweight & Nutrition Targets ───────────────────────────────────────────

export function getBodyWeightPounds(user) {
  if (!user?.body_weight || Number.isNaN(Number(user.body_weight))) return null
  const w = parseFloat(String(user.body_weight))
  if (!Number.isFinite(w) || w <= 0) return null
  const unit = (user.body_weight_unit || 'lb').toLowerCase()
  if (unit === 'kg') return w * KG_TO_LB
  return w
}

/** Hydration target in ml: ~35 ml per kg bodyweight. */
export function getHydrationTargetMl(user) {
  const lbs = getBodyWeightPounds(user)
  if (lbs == null || lbs <= 0) return null
  const kg = lbs / KG_TO_LB
  return Math.round(kg * 35)
}

/** Calorie target. Breastfeeding adds 300–500 kcal. */
export function getCalorieTargetWithBreastfeeding(user) {
  const base = user?.daily_calorie_target
  if (base != null && Number.isFinite(Number(base))) {
    const b = Math.round(Number(base))
    if (user?.breastfeeding) return b + 400
    return b
  }
  const lbs = getBodyWeightPounds(user)
  if (lbs == null) return null
  const baseKcal = Math.round(lbs * 15)
  if (user?.breastfeeding) return baseKcal + 400
  return baseKcal
}

// ─── Breastfeeding ───────────────────────────────────────────────────────────

export function isBreastfeeding(user) {
  return !!user?.breastfeeding
}

// ─── Dietary & Food Preferences ───────────────────────────────────────────────

/** Foods to avoid — checked against every recipe, snack, supplement. */
export function getFoodExclusions(user) {
  const ex = user?.food_exclusions || []
  return Array.isArray(ex) ? ex : []
}

export function getFoodExclusionsOther(user) {
  return (user?.food_exclusions_other || '').trim() || null
}

/** Foods they love — weighted higher in recipe selection. */
export function getFoodsYouLove(user) {
  const f = user?.foods_you_love || []
  return Array.isArray(f) ? f : []
}

/** Recipe match score for foods_you_love: +2 per match. */
export function getRecipeFoodsLovedScore(recipe, user) {
  const loved = getFoodsYouLove(user)
  if (!loved.length || !recipe) return 0
  const blob = `${recipe.name || ''} ${(recipe.ingredients || []).join(' ')}`.toLowerCase()
  const keywords = {
    chicken: ['chicken', 'poultry'],
    beef: ['beef', 'steak', 'brisket'],
    fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia'],
    seafood: ['shrimp', 'prawn', 'lobster', 'crab', 'seafood'],
    eggs: ['egg', 'omelette'],
    dairy: ['dairy', 'cheese', 'yogurt', 'milk'],
    rice: ['rice'],
    pasta: ['pasta', 'noodle'],
    legumes: ['lentil', 'bean', 'chickpea'],
    tofu: ['tofu', 'tempeh'],
    nuts: ['almond', 'walnut', 'nut', 'seed'],
    avocado: ['avocado'],
    salads: ['salad', 'greens', 'spinach', 'kale'],
    soup: ['soup'],
  }
  let score = 0
  for (const id of loved) {
    const terms = keywords[id]
    if (terms && terms.some((t) => blob.includes(t))) score += 2
  }
  return score
}

/** Habits to move away from — never suggested. Free-text match. */
export function recipeContainsHabitsToAvoid(recipe, user) {
  const habits = (user?.habits_to_move_away || '').trim()
  if (!habits || !recipe) return false
  const blob = `${recipe.name || ''} ${(recipe.ingredients || []).join(' ')}`.toLowerCase()
  const terms = habits.split(/[,;.\n]+/).map((s) => s.trim().toLowerCase()).filter((s) => s.length >= 3)
  return terms.some((t) => blob.includes(t))
}

/** Preferred snack types — only these appear. */
export function getFavouriteSnackIds(user) {
  const f = user?.favourite_snack_ids || []
  return Array.isArray(f) ? f.filter(Boolean) : []
}

/** User's supplement preferences from onboarding (multi-select). Used to filter supplement recommendations. */
export function getSupplementPreferences(user) {
  const p = user?.supplement_preferences
  if (!Array.isArray(p) || !p.length) return []
  return p
}

/** Exclude all supplements — whole_foods_only or no_supplements selected. */
export function isSupplementsExcluded(user) {
  const prefs = getSupplementPreferences(user)
  return prefs.includes('whole_foods_only') || prefs.includes('no_supplements')
}

/** Check if a specific supplement type is allowed by user preferences. */
export function isSupplementTypeAllowed(user, type) {
  if (isSupplementsExcluded(user)) return false
  const prefs = getSupplementPreferences(user)
  if (!prefs.length) return true
  return prefs.includes(type)
}

// ─── Injuries & Medical ───────────────────────────────────────────────────────

/**
 * When injuries flag is set and details mention knee/shoulder, we substitute in the session engine
 * instead of only excluding — see fullSessionEngine. Keep only patterns we do not substitute.
 */
export function getInjuryExerciseSubstitutions(user) {
  if (!user?.injuries) return {}
  const details = (user?.injuries_details || '').toLowerCase()
  if (!details) return {}
  const out = {}
  if (details.includes('knee')) {
    Object.assign(out, {
      'beg-goblet-squat': 'beg-leg-press',
      'int-back-squat': 'beg-leg-press',
      'adv-pause-squat': 'beg-leg-press',
      'adv-bulgarian-split-squat': 'beg-leg-press',
    })
  }
  if (details.includes('shoulder')) {
    Object.assign(out, {
      'int-ohp': 'beg-db-shoulder-press',
      'adv-push-press': 'beg-db-shoulder-press',
      'int-barbell-bench': 'beg-db-bench',
      'adv-close-grip-bench': 'beg-db-bench',
    })
  }
  return out
}

/** Exercise IDs to exclude based on injuries_details (free-text). */
export function getExcludedExerciseIdsFromInjuries(user) {
  const details = (user?.injuries_details || '').toLowerCase()
  if (!details || !user?.injuries) return []

  const exclude = []
  const mapping = {
    knee: [],
    back: ['beg-rdl', 'int-deadlift', 'adv-deficit-deadlift', 'int-barbell-row', 'adv-pendlay-row', 'beg-db-row'],
    shoulder: ['int-ohp', 'adv-push-press', 'int-barbell-bench', 'adv-close-grip-bench', 'beg-db-bench'],
    wrist: ['int-barbell-bench', 'int-barbell-row', 'adv-pendlay-row'],
    elbow: ['int-barbell-bench', 'int-barbell-row', 'adv-pendlay-row', 'beg-db-bench'],
    hip: ['beg-goblet-squat', 'int-back-squat', 'beg-rdl', 'int-deadlift'],
    neck: ['int-ohp', 'adv-push-press'],
  }
  for (const [keyword, ids] of Object.entries(mapping)) {
    if (details.includes(keyword)) exclude.push(...ids)
  }
  return [...new Set(exclude)]
}

/** PAR-Q any "yes" → recommend doctor clearance. */
export function needsDoctorClearanceFromParq(user) {
  const answers = user?.parq_responses
  if (!Array.isArray(answers)) return false
  return answers.some((a) => a === true)
}

// ─── Pregnancy & Postnatal ────────────────────────────────────────────────────

export function isPregnant(user) {
  return user?.mom_status === 'pregnant' || user?.mom_journey === 'pregnant'
}

export function isPostnatal(user) {
  return user?.mom_status === 'postnatal' || user?.mom_journey === 'postnatal'
}

export function isCaesarean(user) {
  return user?.birth_type === 'caesarean'
}

/** Contraindicated exercises for pregnancy (by trimester). */
export function getPregnancyExcludedExerciseIds(user) {
  if (!isPregnant(user)) return []
  const tri = user?.pregnancy_trimester
  const exclude = [
    'int-back-squat', 'adv-pause-squat', 'adv-deficit-deadlift',
    'int-barbell-bench', 'adv-close-grip-bench', 'beg-db-bench',
    'int-ohp', 'adv-push-press',
  ]
  if (tri === 3) {
    exclude.push('beg-rdl', 'int-deadlift', 'int-barbell-row', 'adv-pendlay-row')
  }
  return exclude
}

/** Postnatal excluded — direct core loading until cleared. */
export function getPostnatalExcludedExerciseIds(user) {
  if (!isPostnatal(user)) return []
  const band = user?.postnatal_band
  const exclude = []
  if (band === '0-6' || (isCaesarean(user) && band === '6-12')) {
    exclude.push('int-barbell-bench', 'adv-close-grip-bench', 'adv-pause-squat', 'int-back-squat')
  }
  return exclude
}

/** All profile-derived exercise exclusions. */
export function getAllExcludedExerciseIds(user) {
  const sets = [
    getExcludedExerciseIdsFromInjuries(user),
    getPregnancyExcludedExerciseIds(user),
    getPostnatalExcludedExerciseIds(user),
  ]
  return [...new Set(sets.flat())]
}

// ─── Equipment ────────────────────────────────────────────────────────────────

/** Available equipment ids. Gym = barbell, dumbbell, etc. Home = bands, basics, etc. */
export function getAvailableEquipmentIds(user) {
  const styles = user?.training_styles || [user?.training_style].filter(Boolean)
  const styleBlob = styles.map((s) => (s || '').toLowerCase()).join(' ')
  const homeEqIds = user?.home_equipment_ids || [user?.home_equipment_id].filter(Boolean)
  const primaryHomeEq = homeEqIds.includes('full') ? 'full' : homeEqIds.includes('basics') ? 'basics' : homeEqIds.includes('bands') ? 'bands' : 'none'

  if (styleBlob.includes('home')) {
    const ids = ['bodyweight']
    if (primaryHomeEq === 'bands' || primaryHomeEq === 'basics' || primaryHomeEq === 'full') ids.push('bands')
    if (primaryHomeEq === 'basics' || primaryHomeEq === 'full') ids.push('dumbbell')
    if (primaryHomeEq === 'full') ids.push('barbell', 'cable', 'machine')
    return ids
  }
  if (styleBlob.includes('calisthenics')) return ['bodyweight', 'bands']
  if (styleBlob.includes('gym') || styleBlob.includes('calisthenics')) return ['barbell', 'dumbbell', 'cable', 'machine', 'bands']
  return ['barbell', 'dumbbell', 'cable', 'machine', 'bands']
}

/** Exercise requires equipment not available. */
export function exerciseRequiresUnavailableEquipment(exercise, user) {
  const available = new Set(getAvailableEquipmentIds(user))
  const req = exercise?.equipment || []
  const reqArr = Array.isArray(req) ? req : [req].filter(Boolean)
  if (!reqArr.length) return false
  return reqArr.some((e) => e && !available.has(e))
}

// ─── Experience Level ─────────────────────────────────────────────────────────

/** When multiple levels, use most conservative for programming safety. */
export function getExperienceLevel(user) {
  const levels = user?.experience_levels || [user?.experience_level].filter(Boolean)
  const blob = levels.map((e) => (e || '').toLowerCase()).join(' ')
  if (blob.includes('advanced') || blob.includes('competitive')) return 'advanced'
  if (blob.includes('intermediate')) return 'intermediate'
  return 'beginner'
}

// ─── Days Per Week & Session ──────────────────────────────────────────────────

export function getDaysPerWeek(user) {
  const n = user?.days_per_week
  return typeof n === 'number' && n >= 1 && n <= 7 ? n : 3
}

export function getSessionMinutes(user) {
  const n = user?.session_minutes || user?.mom_session_minutes
  return typeof n === 'number' && n >= 15 && n <= 120 ? n : 60
}
