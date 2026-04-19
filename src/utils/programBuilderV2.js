/**
 * FORMA Program Builder V2
 * Built on Vincent Annabi's complete coaching system.
 */

import { mapExperienceToTrainLevel } from './experienceLevel'

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const UPPER_INCREMENT_KG = 2.5
const LOWER_INCREMENT_KG = 5
const DELOAD_VOLUME_PCT = 0.6
const DELOAD_WEIGHT_PCT = 0.6
const EARLY_DELOAD_THRESHOLD = 3

// ─── Goal Normalization ───────────────────────────────────────────────────────

export function normalizeGoal(raw) {
  const g = (raw || '').toLowerCase()
  if (g.includes('general health') || g.includes('general fitness') || g.includes('health')) return 'generalHealth'
  if (g.includes('fat') || g.includes('lose') || g.includes('weight')) return 'fatLoss'
  if (g.includes('muscle') || g.includes('build') || g.includes('hyper')) return 'muscleBuilding'
  if (g.includes('strength') || g.includes('strong') || g.includes('power')) return 'strength'
  if (g.includes('functional') || g.includes('athletic') || g.includes('sport')) return 'athletic'
  if (g.includes('endurance') || g.includes('cardio') || g.includes('run')) return 'endurance'
  return 'fatLoss'
}

// ─── Rep Schemes ─────────────────────────────────────────────────────────────

const REP_SCHEMES = {
  fatLoss: {
    id: 'fatLoss',
    warmUpReps: 15,
    warmUpPct: 0.55,
    sets: 4,
    repsPerSet: [20, 18, 15, 12],
    restSeconds: 50,
    loadProgression: 'ascending',
    notes: 'Short rest keeps heart rate elevated. Weight climbs 5–10% each set.',
  },
  muscleBuilding: {
    id: 'muscleBuilding',
    warmUpReps: 12,
    warmUpPct: 0.55,
    sets: 4,
    repsPerSet: [15, 12, 10, 8],
    restSeconds: 75,
    loadProgression: 'pyramid',
    notes: 'First two sets prepare the joint. Last two sets are growth sets.',
  },
  strength: {
    id: 'strength',
    warmUpReps: 5,
    warmUpPct: 0.5,
    sets: 4,
    repsPerSet: [5, 5, 3, 3],
    restSeconds: 150,
    loadProgression: 'heavy_first',
    notes: 'Nervous system freshest at start. Heaviest work first. Full recovery between sets.',
  },
  athletic: {
    id: 'athletic',
    warmUpReps: 8,
    warmUpPct: 0.55,
    sets: 4,
    repsPerSet: [8, 6, 10, 6],
    restSeconds: 90,
    loadProgression: 'wave',
    notes: 'Wave loading. Heavy sets train force. Lighter sets train sustained output under fatigue.',
  },
  endurance: {
    id: 'endurance',
    warmUpReps: 20,
    warmUpPct: 0.5,
    sets: 4,
    repsPerSet: [20, 20, 20, 20],
    restSeconds: 35,
    loadProgression: 'flat',
    notes: 'Same load all sets. Progress weight only when all 4 sets completed cleanly.',
  },
  generalHealth: {
    id: 'generalHealth',
    warmUpReps: 10,
    warmUpPct: 0.5,
    sets: 4,
    repsPerSet: [12, 12, 10, 10],
    restSeconds: 75,
    loadProgression: 'steady',
    notes: 'Moderate joint-friendly training; no max effort lifting.',
  },
}

// ─── Split Logic ──────────────────────────────────────────────────────────────

function getSplit(daysPerWeek, goal) {
  const d = Math.max(2, Math.min(6, daysPerWeek))
  if (d === 2) return { id: 'fullBody', days: ['fullBody', 'fullBody'] }
  if (d === 3) {
    if (goal === 'muscleBuilding') return { id: 'ppl', days: ['push', 'pull', 'legs'] }
    return { id: 'fullBody', days: ['fullBody', 'fullBody', 'fullBody'] }
  }
  if (d === 4) return { id: 'upperLower', days: ['upper', 'lower', 'upper', 'lower'] }
  if (d === 5) return { id: 'ppl5', days: ['push', 'pull', 'legs', 'upper', 'conditioning'] }
  return { id: 'ppl6', days: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] }
}

function getTrainingDays(daysPerWeek) {
  const schedules = {
    2: ['Monday', 'Thursday'],
    3: ['Monday', 'Wednesday', 'Friday'],
    4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    5: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  }
  return schedules[daysPerWeek] || schedules[3]
}

// ─── Cardio Programming ───────────────────────────────────────────────────────

export function getCardioFinisher(goal, level) {
  if (goal === 'strength') return null
  if (goal === 'muscleBuilding') {
    return {
      type: 'zone2',
      duration: 20,
      description: 'Easy bike or treadmill walk — conversational pace. Cardiovascular maintenance only.',
    }
  }
  if (goal === 'fatLoss') {
    const options = {
      beginner: { type: 'hiit', duration: 10, description: '10 min HIIT finisher — 30s work / 30s rest. Jump rope, bike sprints, or rowing.' },
      intermediate: { type: 'hiit', duration: 12, description: '12 min conditioning finisher — 40s work / 20s rest. KB swings, box jumps, battle ropes.' },
      advanced: { type: 'hiit', duration: 15, description: '15 min high intensity finisher — 45s work / 15s rest. Sled push, ski erg, assault bike.' },
    }
    return options[level] || options.beginner
  }
  if (goal === 'athletic') {
    const options = {
      beginner: { type: 'conditioning', duration: 12, description: '4 rounds 40s/20s — KB goblet squat, med ball slam, farmers carry, push-up.' },
      intermediate: { type: 'conditioning', duration: 15, description: '5 rounds AMRAP — KB swing x15, burpee broad jump x6, wall ball x12, renegade row x8.' },
      advanced: { type: 'conditioning', duration: 20, description: '6 rounds race pace — 200m row + KB snatch x10 + double KB carry 50m + med ball rotational slam x10.' },
    }
    return options[level] || options.beginner
  }
  if (goal === 'endurance') {
    return { type: 'zone2', duration: 30, description: '30 min Zone 2 steady state after session. Easy pace — can hold full conversation.' }
  }
  return null
}

function getOffDayCardio(goal, level) {
  // Every goal gets at least one Zone 2 session per week
  if (goal === 'fatLoss') {
    return {
      type: 'zone2',
      duration: 35,
      description: 'Zone 2 steady state — 35 min walk, bike, or light row at conversational pace. Burns calories without compromising recovery.',
    }
  }
  if (goal === 'muscleBuilding' || goal === 'strength') {
    return {
      type: 'zone2',
      duration: 20,
      description: 'Zone 2 maintenance — 20 min easy bike or walk. For cardiovascular health only. Keep it truly easy.',
    }
  }
  if (goal === 'athletic') {
    return {
      type: 'zone2',
      duration: 50,
      description: 'Zone 2 aerobic base — 45–60 min easy row, bike, or jog. This builds the engine that supports all high intensity work. Non-negotiable.',
    }
  }
  if (goal === 'endurance') {
    return {
      type: 'long_zone2',
      duration: 60,
      description: 'Long slow distance — 60 min at Zone 2. This is your aerobic base session for the week.',
    }
  }
  return { type: 'zone2', duration: 20, description: '20 min easy walk or bike. Active recovery.' }
}

// ─── Weekly Schedule Builder ──────────────────────────────────────────────────

export function buildWeeklySchedule(goal, daysPerWeek) {
  const split = getSplit(daysPerWeek, goal)
  const trainingDays = getTrainingDays(daysPerWeek)
  const schedule = []

  // Find best off day for Zone 2 — midweek preferred
  const allDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const offDays = allDays.filter(d => !trainingDays.includes(d))
  const zone2Day = offDays.includes('Wednesday') ? 'Wednesday' :
    offDays.includes('Saturday') ? 'Saturday' : offDays[0] || null

  allDays.forEach((day, i) => {
    const isTraining = trainingDays.includes(day)
    const isZone2 = !isTraining && day === zone2Day
    const focusIndex = trainingDays.indexOf(day)
    const focus = isTraining ? split.days[focusIndex] : null

    schedule.push({
      day,
      type: isTraining ? 'training' : isZone2 ? 'cardio' : 'rest',
      focus,
      sessionKey: isTraining ? `sess-${day.toLowerCase()}` : null,
      zone2: isZone2 ? getOffDayCardio(goal, 'beginner') : null,
    })
  })

  return schedule
}

// ─── Progressive Overload Engine ─────────────────────────────────────────────

export function evaluateProgressionV2({ exerciseId, region = 'upper', sessionHistory = [], failStreak = 0 }) {
  const increment = region === 'lower' ? LOWER_INCREMENT_KG : UPPER_INCREMENT_KG

  if (failStreak >= 2) {
    return {
      action: 'decrease',
      decreaseKg: increment,
      reason: 'two_consecutive_failures',
      message: 'Weight dropped one increment. Rebuild from here.',
    }
  }

  const relevant = sessionHistory
    .filter(s => Array.isArray(s?.exercises))
    .map(s => s.exercises.find(ex => ex.exerciseId === exerciseId))
    .filter(Boolean)
    .slice(-1)

  if (!relevant.length) return { action: 'hold', reason: 'no_history' }

  const last = relevant[0]
  const allCompleted = (last.sets || []).every(s => s.completed && parseInt(s.reps) >= (last.repRange?.[0] || 8))

  if (allCompleted) {
    return {
      action: 'increase',
      increaseKg: increment,
      reason: 'all_sets_completed',
      message: `Add ${increment}kg next session. You earned it.`,
    }
  }

  return { action: 'hold', reason: 'not_all_sets_completed' }
}

// ─── Injury Management ────────────────────────────────────────────────────────

export function handleInjuryFlag(exercise, injuryZone, consecutivePainSessions) {
  const autoSubstitute = exercise?.regression || 'Use bodyweight variation or skip'

  if (consecutivePainSessions >= 3) {
    return {
      action: 'permanent_substitute_and_refer',
      substitution: autoSubstitute,
      message: 'This movement has caused pain for 3 consecutive sessions. It has been permanently substituted until you confirm the injury has resolved. Please consult a medical professional.',
      requiresDoctorReferral: true,
      permanentUntilCleared: true,
    }
  }

  return {
    action: 'substitute',
    substitution: autoSubstitute,
    message: `Substituted to regression due to ${injuryZone} flag. Monitor across sessions.`,
    requiresDoctorReferral: false,
    permanentUntilCleared: false,
  }
}

// ─── Deload Detection ─────────────────────────────────────────────────────────

export function shouldDeload(weeksCompleted, checkInHistory = []) {
  // Scheduled deload every 4-6 weeks
  if (weeksCompleted >= 4 && weeksCompleted % 4 === 0) {
    return {
      recommended: true,
      reason: 'scheduled',
      message: `You have trained consistently for ${weeksCompleted} weeks. Your body is ready for a recovery week. Volume drops 40%, weight drops to 60%. Same movements.`,
    }
  }

  // Early deload from biofeedback
  const recentCheckIns = checkInHistory.slice(-EARLY_DELOAD_THRESHOLD)
  if (recentCheckIns.length >= EARLY_DELOAD_THRESHOLD) {
    const allPoor = recentCheckIns.every(c =>
      c.sleep === 'poor' && (c.soreness === 'very' || c.soreness === 'high') && (c.energy === 'low')
    )
    if (allPoor) {
      return {
        recommended: true,
        reason: 'biofeedback',
        message: 'Your last 3 check-ins show poor sleep, high soreness, and low energy. Your body is telling you it needs recovery now. Take a deload week.',
      }
    }
  }

  return { recommended: false }
}

export function applyDeload(session) {
  if (!session?.movements) return session
  return {
    ...session,
    isDeload: true,
    movements: session.movements.map(m => ({
      ...m,
      sets: Math.max(2, Math.round(m.sets * DELOAD_VOLUME_PCT)),
      deloadWeightPct: DELOAD_WEIGHT_PCT,
      weightSuggestion: `${Math.round(DELOAD_WEIGHT_PCT * 100)}% of normal working weight — focus on movement quality.`,
    })),
  }
}

// ─── Warm-up Set Builder ──────────────────────────────────────────────────────

export function buildWarmUpSet(exercise, goal) {
  const scheme = REP_SCHEMES[goal] || REP_SCHEMES.fatLoss
  return {
    isWarmUp: true,
    reps: scheme.warmUpReps,
    weightPct: scheme.warmUpPct,
    description: `Warm-up set at ${Math.round(scheme.warmUpPct * 100)}% of working weight. ${scheme.warmUpReps} reps. Does not count toward programmed sets.`,
  }
}

// ─── Session Duration Plan ────────────────────────────────────────────────────

function getSessionPlan(minutes, goal) {
  const m = Math.min(90, Math.max(30, Number(minutes) || 60))
  if (m <= 30) return { movements: 4, hasFinisher: false, warmUpMin: 5, coolDownMin: 2 }
  if (m <= 45) return { movements: 5, hasFinisher: false, warmUpMin: 7, coolDownMin: 5 }
  if (m <= 60) return { movements: 6, hasFinisher: goal === 'fatLoss' || goal === 'athletic', warmUpMin: 10, coolDownMin: 8 }
  if (m <= 75) return { movements: 7, hasFinisher: true, warmUpMin: 10, coolDownMin: 10 }
  return { movements: 8, hasFinisher: true, warmUpMin: 10, coolDownMin: 10 }
}

// ─── Main Export: getRepScheme ────────────────────────────────────────────────

export function getRepSchemeForGoal(goal) {
  return REP_SCHEMES[normalizeGoal(goal)] || REP_SCHEMES.fatLoss
}

// ─── Session Builder (integrates with existing programBuilder.js) ─────────────

export function buildSessionV2(profile = {}) {
  const goal = normalizeGoal(profile.goal)
  const level = mapExperienceToTrainLevel(profile.experience_level || profile.experienceLevel) || 'beginner'
  const daysPerWeek = Math.max(2, Math.min(6, Number(profile.days_per_week || profile.daysPerWeek) || 3))
  const sessionMinutes = Number(profile.session_minutes || profile.sessionDuration) || 60

  const scheme = REP_SCHEMES[goal] || REP_SCHEMES.fatLoss
  const plan = getSessionPlan(sessionMinutes, goal)
  const schedule = buildWeeklySchedule(goal, daysPerWeek)
  const cardioFinisher = getCardioFinisher(goal, level)
  const deloadStatus = shouldDeload(
    Number(profile.weeksCompleted || profile.weeks_completed) || 0,
    profile.checkInHistory || []
  )

  return {
    goal,
    level,
    scheme,
    plan,
    schedule,
    cardioFinisher,
    deloadStatus,
    warmUpSet: buildWarmUpSet({}, goal),
    progressionRules: {
      upperBodyIncrement: UPPER_INCREMENT_KG,
      lowerBodyIncrement: LOWER_INCREMENT_KG,
      rule: 'Complete all programmed sets and reps → add increment next session. Fail twice → drop one increment.',
    },
    injuryProtocol: {
      flagAfterSessions: 3,
      action: 'permanent_substitute_and_refer',
    },
    deloadProtocol: {
      scheduledEveryWeeks: 4,
      volumeDrop: '40%',
      weightDrop: '40%',
      earlyTrigger: 'Poor sleep + high soreness + low energy for 3 consecutive check-ins',
    },
  }
}

export { REP_SCHEMES, UPPER_INCREMENT_KG, LOWER_INCREMENT_KG }

