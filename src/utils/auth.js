/**
 * Pure localStorage auth. No Supabase. No external API calls.
 * forma_user: { id, email, password, name, onboarding_complete, ...profile }
 * forma_logged_in: "true" when logged in
 */

const USER_KEY = 'forma_user'
const LOGGED_IN_KEY = 'forma_logged_in'
const PROFILE_KEY = 'forma_user_profile'

const EQUIPMENT_ORDER = { full: 4, basics: 3, bands: 2, none: 1 }
function primaryEquipmentId(ids) {
  if (!ids?.length) return 'none'
  const best = ids.reduce((a, id) => ((EQUIPMENT_ORDER[id] ?? 0) > (EQUIPMENT_ORDER[a] ?? 0) ? id : a), ids[0])
  return best || 'none'
}

function hasGoalType(goals, ...keywords) {
  const blob = (goals || []).map((g) => String(g || '').toLowerCase()).join(' ')
  return keywords.some((k) => blob.includes(k))
}
function derivePrimaryGoal(goals) {
  if (!goals?.length) return null
  const g = goals.map((x) => String(x || '').toLowerCase()).join(' ')
  const hasFat = hasGoalType(goals, 'lose fat', 'lean')
  const hasMuscle = hasGoalType(goals, 'build muscle', 'stronger')
  const hasSport = hasGoalType(goals, 'sport', 'competition')
  if (hasFat && hasMuscle) return 'Balanced — lose fat and build muscle'
  if (hasFat && hasSport) return 'Balanced — lose fat and train for sport'
  if (hasMuscle && hasSport) return 'Balanced — build muscle and train for sport'
  if (hasFat && hasGoalType(goals, 'general', 'feel better')) return 'Balanced — lose fat and general fitness'
  return goals[0]
}

function deriveConservativeExperienceLevel(levels) {
  if (!levels?.length) return null
  const blob = levels.map((l) => String(l || '').toLowerCase()).join(' ')
  if (blob.includes('beginner')) return 'Complete beginner'
  if (blob.includes('intermediate')) return 'Intermediate'
  return 'Advanced or competitive'
}

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveProfile(profile) {
  if (profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } else {
    localStorage.removeItem(PROFILE_KEY)
  }
}

function isLoggedIn() {
  return localStorage.getItem(LOGGED_IN_KEY) === 'true'
}

function setLoggedIn(value) {
  if (value) {
    localStorage.setItem(LOGGED_IN_KEY, 'true')
  } else {
    localStorage.removeItem(LOGGED_IN_KEY)
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('forma-auth-changed'))
  }
}

/** Sync. Returns { user, profile } or null if not logged in. */
export function getSessionSync() {
  if (!isLoggedIn()) return null
  const user = loadUser()
  if (!user) return null
  const profile = loadProfile() || user
  return {
    user: { id: user.id, email: user.email },
    profile,
  }
}

/** @returns {Promise<{ user: object; profile: object } | null>} */
export async function getSession() {
  return getSessionSync()
}

/** Sync read of current user. No password in profile shape. */
export function getCurrentUserSync() {
  const session = getSessionSync()
  return session?.profile ?? null
}

/** @returns {Promise<object | null>} */
export async function getCurrentUser() {
  return getCurrentUserSync()
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ ok: boolean; error?: string; onboarding_complete?: boolean }>}
 */
export async function signUp(email, password) {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const newUser = {
    id,
    email: (email || '').trim().toLowerCase(),
    password,
    name: '',
    onboarding_complete: false,
  }
  saveUser(newUser)
  saveProfile({
    id,
    email: (email || '').trim().toLowerCase(),
    name: '',
    goal: 'muscle building',
    training_style: 'gym',
    experience_level: 'Complete beginner',
    days_per_week: 3,
    onboarding_complete: false,
  })
  setLoggedIn(true)
  return { ok: true, onboarding_complete: false }
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ ok: boolean; error?: string; onboarding_complete?: boolean }>}
 */
export async function login(email, password) {
  const user = loadUser()
  if (!user) {
    return { ok: false, error: 'Invalid email or password' }
  }
  const emailMatch = (user.email || '').toLowerCase() === (email || '').trim().toLowerCase()
  const passwordMatch = user.password === password
  if (!emailMatch || !passwordMatch) {
    return { ok: false, error: 'Invalid email or password' }
  }
  setLoggedIn(true)
  return { ok: true, onboarding_complete: !!user.onboarding_complete }
}

/**
 * Persist onboarding data. Each field flows into app behaviour:
 * name → chatCoach, Home, userContext.firstName
 * goal → trainingStyles, fullSessionEngine, nutrition, snackEngine, weeklyProgramPlan, homeWorkoutEngine
 * training_style → trainingStyles, userContext.getAvailableEquipmentIds
 * experience_level → fullSessionEngine, nutrition, trainSessionPreview, Gym/Calisthenics/Hybrid/ReconnectTrain
 * bodyweight, body_weight_unit → userContext.getBodyWeightPounds, getCalorieTargetWithBreastfeeding, Settings
 * days_per_week → chatCoach, trainSessionPreview, Home, morningCheckIn, GymTrain, Progress, weeklyProgramPlan
 * session_minutes, mom_session_minutes → fullSessionEngine, userContext.getSessionMinutes
 * injuries, injuries_details → userContext.getExcludedExerciseIdsFromInjuries → fullSessionEngine, morningCheckIn
 * mom_status, pregnancy_*, postnatal_*, birth_type, breastfeeding, doctor_cleared → userContext, momExperience
 * cooking_for_family → momExperience.isCookingForFamily
 * household_size → momExperience.getHouseholdSize → GroceryList, RecipeDetail
 * nutrition_tracker_enabled → Home, Settings, FoodLogger, Progress
 * eating_window, dietary_approaches → dietConfig, snackEngine, Cookbook, dailyNutritionCoach
 * food_exclusions, food_exclusions_other → userContext, snackEngine, recipeExclusions, brandedSnackCoach
 * foods_you_love, favourite_snack_ids, habits_to_move_away → userContext, snackEngine
 * parq_responses, parq_consent → userContext.needsDoctorClearanceFromParq (audit)
 * home_equipment_id → trainSessionPreview, homeWorkoutEngine, HomeWorkoutSession
 * supplement_preferences → userContext.getSupplementPreferences → snackEngine (filter supplements)
 *
 * @param {string} name
 * @param {object} profile
 */
export async function completeOnboarding(name, profile = {}) {
  const user = loadUser()
  if (!user || !isLoggedIn()) return

  const goalsArr = profile.goals ?? [profile.goal].filter(Boolean)
  const derivedGoal = derivePrimaryGoal(goalsArr) || profile.goal || 'muscle building'
  const trainingStyles = profile.training_styles ?? [profile.training_style].filter(Boolean)
  const experienceLevels = profile.experience_levels ?? [profile.experience_level].filter(Boolean)
  const resolvedExperience = deriveConservativeExperienceLevel(experienceLevels) || profile.experience_level || 'Complete beginner'
  const updated = {
    ...user,
    name: name || user.name,
    onboarding_complete: true,
    goals: goalsArr,
    goal: derivedGoal,
    training_styles: trainingStyles,
    training_style: trainingStyles[0] || 'gym',
    sports_or_activities: profile.sports_or_activities ?? [profile.sport_or_activity].filter(Boolean),
    sport_or_activity: (profile.sports_or_activities ?? [profile.sport_or_activity].filter(Boolean)).join(', ') || null,
    experience_levels: experienceLevels,
    experience_level: resolvedExperience,
    bodyweight: profile.body_weight ?? profile.bodyweight,
    body_weight_unit: profile.body_weight_unit,
    days_per_week: profile.days_per_week,
    session_minutes: profile.session_minutes,
    sessionDuration: profile.sessionDuration ?? profile.session_minutes,
    injuries: profile.has_injuries,
    injuries_details: profile.injuries_details,
    mom_status: profile.mom_journey,
    pregnancy_weeks: profile.pregnancy_weeks,
    postnatal_weeks: profile.postnatal_weeks,
    pregnancy_trimester: profile.pregnancy_trimester,
    postnatal_band: profile.postnatal_band,
    birth_type: profile.birth_type,
    breastfeeding: profile.breastfeeding,
    doctor_cleared: profile.exercise_cleared,
    mom_session_minutes: profile.mom_session_minutes,
    cooking_for_family: profile.cooking_for_family,
    household_size: profile.household_size,
    parent_snacking: profile.parent_snacking,
    nutrition_tracker_enabled: profile.nutrition_tracker_enabled,
    eating_window: profile.eating_window,
    food_exclusions: profile.food_exclusions,
    food_exclusions_other: profile.food_exclusions_other,
    foods_you_love: profile.foods_you_love,
    favourite_snack_ids: profile.favourite_snack_ids,
    habits_to_move_away: profile.habits_to_move_away,
    parq_responses: profile.parq_responses,
    parq_consent: profile.parq_consent,
    dietary_approaches: profile.dietary_approaches,
    home_equipment_ids: profile.home_equipment_ids ?? (profile.home_equipment_id ? [profile.home_equipment_id] : ['none']),
    home_equipment_id: primaryEquipmentId(profile.home_equipment_ids ?? (profile.home_equipment_id ? [profile.home_equipment_id] : ['none'])),
    sport_or_activity: profile.sport_or_activity,
    supplement_preferences: profile.supplement_preferences,
  }

  saveUser(updated)
  saveProfile({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    goal: updated.goal,
    goals: updated.goals,
    training_style: updated.training_style,
    training_styles: updated.training_styles,
    experience_level: updated.experience_level,
    experience_levels: updated.experience_levels,
    days_per_week: updated.days_per_week,
    session_minutes: updated.session_minutes,
    sessionDuration: updated.sessionDuration ?? updated.session_minutes,
    trainingStyle: updated.training_style,
    experienceLevel: updated.experience_level,
    daysPerWeek: updated.days_per_week,
    onboarding_complete: true,
  })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('forma-auth-changed'))
  }
}

/** @param {object} updates */
export async function updateUserProfile(updates) {
  const user = loadUser()
  if (!user || !isLoggedIn()) return

  const allowed = [
    'bodyweight', 'body_weight_unit', 'name', 'goal', 'goals', 'training_style', 'training_styles',
    'experience_level', 'experience_levels', 'days_per_week', 'session_minutes', 'sessionDuration', 'injuries', 'injuries_details',
    'home_equipment_id', 'home_equipment_ids', 'sport_or_activity', 'sports_or_activities',
    'mom_status', 'pregnancy_weeks', 'postnatal_weeks', 'breastfeeding', 'doctor_cleared', 'notifications_enabled',
    'knee_rehab_program', 'coach_rehab_only', 'coach_rehab_since', 'coach_recommended_light_training',
    'coach_injury_note', 'sore_rehab_auto', 'sore_rehab_region',
    'parent_snacking', 'nutrition_tracker_enabled',
  ]
  const filtered = {}
  for (const k of allowed) {
    if (k in updates) filtered[k] = updates[k]
  }
  if (Object.keys(filtered).length === 0) return

  const updated = { ...user, ...filtered }
  saveUser(updated)
  const currentProfile = loadProfile() || {}
  saveProfile({ ...currentProfile, ...filtered })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('forma-auth-changed'))
  }
}

/** @returns {Promise<{ completed: boolean } | null>} */
export async function checkOnboardingComplete() {
  const user = loadUser()
  if (!user || !isLoggedIn()) return null
  return { completed: !!user.onboarding_complete }
}

export async function logout() {
  setLoggedIn(false)
  saveUser(null)
  saveProfile(null)
}

/** Subscribe to auth changes (login/logout). */
export function onAuthChanged(callback) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener('forma-auth-changed', handler)
  return () => window.removeEventListener('forma-auth-changed', handler)
}

/** Clear all forma_* keys from localStorage. */
export function clearAllLocalData() {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith('forma_')) keys.push(k)
  }
  keys.forEach((k) => localStorage.removeItem(k))
}
