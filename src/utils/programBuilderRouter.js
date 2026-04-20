/**
 * FORMA Program Builder Router
 * Every client gets a tailored program from Vincent's actual training systems.
 * This is the single entry point — replaces direct buildProgram() calls.
 */

import { selectProgramType, getSportProgram, buildRaceFitProgram } from './programSelector'
import { buildProgram, getDefaultProgramProfile, saveProgramToStorage } from './programBuilder'
import { getCalisthenicsWorkout } from '../data/calisthenicsWorkout'
import { getHybridWorkout } from '../data/hybridWorkout'
import { getHomeProgram } from '../data/homeWorkoutCatalog'
import { mapExperienceToTrainLevel } from './experienceLevel'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function applyRequiredInjuryExclusionsToProgram(program, profile) {
  if (!program?.sessions) return program
  const injuryBlob = String(profile?.injuries_details || '').toLowerCase()
  const hasBackIssue = /lower back|\bback\b/.test(injuryBlob)
  const hasKneeIssue = /knee/.test(injuryBlob)
  if (!hasBackIssue && !hasKneeIssue) return program

  const blockedBack = [
    'banded good morning',
    'good morning',
    'romanian deadlift',
    'barbell romanian deadlift',
    'conventional deadlift',
    'jefferson curl',
  ]
  const blockedKnee = [
    'jump squat',
    'broad jump',
    'box jump',
    'walking lunge',
    'burpee',
  ]

  const sessions = Object.fromEntries(
    Object.entries(program.sessions).map(([key, sess]) => {
      const moves = (sess?.movements || []).filter((m) => {
        const name = String(m?.exerciseName || m?.name || '').toLowerCase()
        if (!name) return true
        if (hasBackIssue && blockedBack.some((b) => name.includes(b))) return false
        if (hasBackIssue && name.includes('deadlift') && !name.includes('single leg')) return false
        if (hasKneeIssue && blockedKnee.some((b) => name.includes(b))) return false
        return true
      })
      return [key, { ...sess, movements: moves }]
    }),
  )

  const sessionsList = Array.isArray(program.sessionsList)
    ? program.sessionsList.map((s) => {
      const key = s.sessionKey || s.id
      const nextMovements = sessions[key]?.movements || []
      return { ...s, exercises: nextMovements }
    })
    : program.sessionsList

  return { ...program, sessions, sessionsList }
}

function trainingDayNames(daysPerWeek) {
  const schedules = {
    2: ['Monday', 'Thursday'],
    3: ['Monday', 'Wednesday', 'Friday'],
    4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    5: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  }
  return schedules[Math.max(2, Math.min(6, daysPerWeek))] || schedules[3]
}

function makeRestDays(trainingDays) {
  return DAY_NAMES
    .filter(d => !trainingDays.includes(d))
    .map(d => ({ day: d, environment: 'rest', sessionType: 'rest', sessionName: 'Rest', sessionDuration: 0, equipmentNeeded: [], sessionKey: null }))
}

function sportExercisesToSessionExercises(exercises = []) {
  return exercises.map((ex, i) => ({
    id: ex.id || `sport-ex-${i}`,
    name: ex.name,
    displayName: ex.name,
    sets: ex.sets || 3,
    repRange: ex.repRange || [8, 12],
    restSeconds: ex.restSeconds || 90,
    description: ex.loadCue || ex.formTip || '',
    coachingCues: ex.loadCue || '',
    progression: ex.progression || '',
    regression: ex.regression || '',
    musclesWorked: [],
    order: i + 1,
  }))
}

function buildSportProgram(profile) {
  const sessionMinutes = Number(profile?.session_minutes) || Number(profile?.sessionDuration) || 60
  const selector = selectProgramType(profile)
  const sportData = getSportProgram(selector.sport)
  if (!sportData) return null

  const daysPerWeek = Math.max(2, Math.min(6, Number(profile?.days_per_week) || 3))
  const dayNames = trainingDayNames(daysPerWeek)
  const level = mapExperienceToTrainLevel(profile?.experience_level || profile?.experienceLevel) || 'beginner'

  const mainExercises = sportExercisesToSessionExercises(sportData.mainExercises || [])
  const accessoryExercises = sportExercisesToSessionExercises(sportData.accessoryExercises || [])
  const allExercises = [...mainExercises, ...accessoryExercises]

  const warmUp = {
    title: sportData.warmup?.title || 'Warm up',
    steps: (sportData.warmup?.movements || []).map(m => `${m.name}: ${m.detail}`),
  }

  const coolDown = {
    title: 'Cool down',
    steps: (sportData.mobility?.movements || []).map(m => `${m.name} — ${m.detail || ''}`)
  }

  const sessions = {}
  const weeklySchedule = []

  // Distribute exercises across training days — rotate if needed
  dayNames.forEach((day, i) => {
    const sessionKey = `sess-${day.toLowerCase()}-${i}`
    const sessionName = `${day} — ${sportData.name}`

    // Alternate main-heavy and accessory-focused days
    const isMainDay = i % 2 === 0
    const exercises = isMainDay
      ? allExercises.filter((_, idx) => idx < mainExercises.length)
      : allExercises.filter((_, idx) => idx >= mainExercises.length).slice(0, 6)

    sessions[sessionKey] = {
      name: sessionName,
      environment: 'gym',
      warmUp,
      movements: exercises.map((ex, idx) => ({
        ...ex,
        order: idx + 1,
        exerciseName: ex.name,
        exerciseId: ex.id,
        sets: ex.sets,
        repRange: ex.repRange,
        restSeconds: ex.restSeconds,
      })),
      coolDown,
      estimatedDuration: sessionMinutes,
      sessionEquipmentList: [],
    }

    weeklySchedule.push({
      day,
      environment: 'gym',
      sessionType: 'sport',
      sessionName,
      sessionDuration: sessionMinutes,
      equipmentNeeded: [],
      sessionKey,
    })
  })

  weeklySchedule.push(...makeRestDays(dayNames))
  weeklySchedule.sort((a, b) => DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day))

  return applyRequiredInjuryExclusionsToProgram({
    userId: profile?.id || 'forma_local_user',
    goal: profile?.goal || 'athletic',
    trainingStyle: 'gym',
    experienceLevel: level,
    programType: 'sport',
    sport: selector.sport,
    weeklySchedule,
    sessions,
    sessionsList: dayNames.map((day) => {
      const entry = weeklySchedule.find(w => w.day === day && w.sessionKey)
      if (!entry?.sessionKey) return null
      const s = sessions[entry.sessionKey]
      return {
        id: entry.sessionKey,
        name: s.name,
        environment: s.environment,
        exercises: s.movements,
        warmUp: s.warmUp,
        coolDown: s.coolDown,
        estimatedDuration: s.estimatedDuration,
        sessionKey: entry.sessionKey,
        day,
      }
    }).filter(Boolean),
    snackRecommendations: [],
    nutritionPhilosophy: sportData.nutritionGuidance || '',
    weeklyVolume: { daysPerWeek, splitId: `sport_${selector.sport}`, sessionMinutes },
    profileSnapshot: {
      name: profile?.name || 'Friend',
      goal: profile?.goal || 'athletic',
      level,
      daysPerWeek,
    },
    createdAt: new Date().toISOString(),
  }, profile)
}

function buildCalisthenicsProgram(profile) {
  const sessionMinutes = Number(profile?.session_minutes) || Number(profile?.sessionDuration) || 60
  const level = mapExperienceToTrainLevel(profile?.experience_level || profile?.experienceLevel) || 'beginner'
  const daysPerWeek = Math.max(2, Math.min(6, Number(profile?.days_per_week) || 3))
  const dayNames = trainingDayNames(daysPerWeek)

  const exercises = getCalisthenicsWorkout(level)

  const sessions = {}
  const weeklySchedule = []

  dayNames.forEach((day, i) => {
    const sessionKey = `sess-${day.toLowerCase()}-${i}`
    const sessionName = `${day} — Calisthenics`

    // Rotate different sets of exercises each day
    const start = (i * 4) % exercises.length
    const dayExercises = [...exercises.slice(start), ...exercises.slice(0, start)].slice(0, 6)

    sessions[sessionKey] = {
      name: sessionName,
      environment: 'home',
      warmUp: {
        title: 'Warm up',
        steps: ['Arm circles 20 each direction', 'Hip circles 10 each way', 'Leg swings 10 each leg', 'Shoulder rotations 10 each direction', 'Inchworm 5 reps'],
      },
      movements: dayExercises.map((ex, idx) => ({
        exerciseId: ex.id,
        exerciseName: ex.displayName || ex.name,
        id: ex.id,
        name: ex.displayName || ex.name,
        displayName: ex.displayName || ex.name,
        sets: ex.sets || 3,
        repRange: ex.repRange || [8, 12],
        restSeconds: ex.restSeconds || 90,
        description: ex.description || '',
        coachingCues: ex.formTip || '',
        progression: ex.progression || '',
        regression: ex.regression || '',
        order: idx + 1,
      })),
      coolDown: {
        title: 'Cool down',
        steps: ['Child\'s pose 60s', 'Hip flexor stretch 45s each side', 'Chest opener 30s', 'Hamstring stretch 45s each side'],
      },
      estimatedDuration: sessionMinutes,
      sessionEquipmentList: ['Bodyweight', 'Pull-up bar (optional)'],
    }

    weeklySchedule.push({
      day, environment: 'home', sessionType: 'calisthenics',
      sessionName, sessionDuration: sessionMinutes,
      equipmentNeeded: ['Bodyweight'], sessionKey,
    })
  })

  weeklySchedule.push(...makeRestDays(dayNames))
  weeklySchedule.sort((a, b) => DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day))

  return applyRequiredInjuryExclusionsToProgram({
    userId: profile?.id || 'forma_local_user',
    goal: profile?.goal || 'muscle building',
    trainingStyle: 'home',
    experienceLevel: level,
    programType: 'calisthenics',
    weeklySchedule,
    sessions,
    sessionsList: dayNames.map((day) => {
      const entry = weeklySchedule.find(w => w.day === day && w.sessionKey)
      if (!entry?.sessionKey) return null
      const s = sessions[entry.sessionKey]
      return {
        id: entry.sessionKey, name: s.name, environment: s.environment,
        exercises: s.movements, warmUp: s.warmUp, coolDown: s.coolDown,
        estimatedDuration: s.estimatedDuration, sessionKey: entry.sessionKey, day,
      }
    }).filter(Boolean),
    snackRecommendations: [],
    nutritionPhilosophy: 'Fuel your bodyweight training with whole foods and adequate protein — 1.6–2g per kg bodyweight daily.',
    weeklyVolume: { daysPerWeek, splitId: 'calisthenics', sessionMinutes },
    profileSnapshot: { name: profile?.name || 'Friend', goal: profile?.goal, level, daysPerWeek },
    createdAt: new Date().toISOString(),
  }, profile)
}

function buildHomeProgramFromCatalog(profile, selector) {
  const sessionMinutes = Number(profile?.session_minutes) || Number(profile?.sessionDuration) || 60
  const { equipmentId, programId } = selector
  const homeProgram = getHomeProgram(equipmentId, programId)
  if (!homeProgram) return null

  const level = mapExperienceToTrainLevel(profile?.experience_level || profile?.experienceLevel) || 'beginner'
  const daysPerWeek = Math.max(2, Math.min(6, Number(profile?.days_per_week) || 3))
  const dayNames = trainingDayNames(daysPerWeek)

  const exercises = (homeProgram.exercises || homeProgram.stations || [])
  const sessions = {}
  const weeklySchedule = []

  dayNames.forEach((day, i) => {
    const sessionKey = `sess-${day.toLowerCase()}-${i}`
    const sessionName = `${day} — ${homeProgram.title}`

    sessions[sessionKey] = {
      name: sessionName,
      environment: 'home',
      warmUp: { title: 'Warm up', steps: ['5 min general movement', 'Hip mobility', 'Shoulder circles', 'Leg swings'] },
      movements: exercises.slice(0, 6).map((ex, idx) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        id: ex.id,
        name: ex.name,
        displayName: ex.name,
        sets: ex.sets || 3,
        repRange: ex.repRange || [10, 15],
        restSeconds: ex.restSeconds || 90,
        description: ex.description || '',
        coachingCues: ex.formTip || ex.loadCue || '',
        progression: ex.progression || '',
        regression: ex.regression || '',
        order: idx + 1,
      })),
      coolDown: { title: 'Cool down', steps: ['Child\'s pose 60s', 'Hip flexor stretch 45s each', 'Hamstring stretch 45s each'] },
      estimatedDuration: sessionMinutes,
      sessionEquipmentList: [equipmentId],
    }

    weeklySchedule.push({
      day, environment: 'home', sessionType: 'home',
      sessionName, sessionDuration: sessionMinutes,
      equipmentNeeded: [equipmentId], sessionKey,
    })
  })

  weeklySchedule.push(...makeRestDays(dayNames))
  weeklySchedule.sort((a, b) => DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day))

  return applyRequiredInjuryExclusionsToProgram({
    userId: profile?.id || 'forma_local_user',
    goal: profile?.goal || 'fat loss',
    trainingStyle: 'home',
    experienceLevel: level,
    programType: 'home',
    weeklySchedule,
    sessions,
    sessionsList: dayNames.map((day) => {
      const entry = weeklySchedule.find(w => w.day === day && w.sessionKey)
      if (!entry?.sessionKey) return null
      const s = sessions[entry.sessionKey]
      return {
        id: entry.sessionKey, name: s.name, environment: s.environment,
        exercises: s.movements, warmUp: s.warmUp, coolDown: s.coolDown,
        estimatedDuration: s.estimatedDuration, sessionKey: entry.sessionKey, day,
      }
    }).filter(Boolean),
    snackRecommendations: [],
    nutritionPhilosophy: homeProgram.intro || '',
    weeklyVolume: { daysPerWeek, splitId: `home_${programId}`, sessionMinutes },
    profileSnapshot: { name: profile?.name || 'Friend', goal: profile?.goal, level, daysPerWeek },
    createdAt: new Date().toISOString(),
  }, profile)
}

function buildRaceFitSessionProgram(profile) {
  const sessionMinutes = Number(profile?.session_minutes) || Number(profile?.sessionDuration) || 60
  const level = mapExperienceToTrainLevel(profile?.experience_level || profile?.experienceLevel) || 'beginner'
  const daysPerWeek = Math.max(2, Math.min(6, Number(profile?.days_per_week) || 4))
  const dayNames = trainingDayNames(daysPerWeek)
  const rfData = buildRaceFitProgram(level)

  const sessionTypes = ['strength_lower', 'race_conditioning', 'strength_upper', 'race_simulation']
  const sessions = {}
  const weeklySchedule = []

  dayNames.forEach((day, i) => {
    const sessionKey = `sess-${day.toLowerCase()}-${i}`
    const sType = sessionTypes[i % sessionTypes.length]
    const sData = rfData.sessions[sType]
    const sessionName = `${day} — ${sData?.name || 'Race Fit'}`

    const exercises = (sData?.exercises || sData?.stations || []).map((ex, idx) => ({
      exerciseId: `rf-${sType}-${idx}`,
      exerciseName: ex.name,
      id: `rf-${sType}-${idx}`,
      name: ex.name,
      displayName: ex.name,
      sets: ex.sets || 3,
      repRange: ex.repRange || [8, 12],
      restSeconds: ex.restSeconds || 90,
      description: ex.detail || ex.loadCue || ex.why || '',
      coachingCues: ex.loadCue || ex.why || '',
      order: idx + 1,
    }))

    sessions[sessionKey] = {
      name: sessionName,
      environment: 'gym',
      warmUp: { title: 'Race Fit warm up', steps: ['5 min easy row or ski erg', 'Hip circles 10 each way', 'Shoulder mobility', 'Glute activation', 'Build-up sets on first exercise'] },
      movements: exercises,
      coolDown: { title: 'Cool down', steps: ['Lower leg elevation 5 min', 'Hip flexor stretch 60s each', 'Thoracic rotations', 'Quad stretch 45s each'] },
      estimatedDuration: sessionMinutes,
      sessionEquipmentList: ['Barbell', 'Dumbbells', 'Kettlebell', 'Ski Erg or Rowing Machine'],
    }

    weeklySchedule.push({
      day, environment: 'gym', sessionType: sType,
      sessionName, sessionDuration: sessionMinutes,
      equipmentNeeded: ['Full gym'], sessionKey,
    })
  })

  weeklySchedule.push(...makeRestDays(dayNames))
  weeklySchedule.sort((a, b) => DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day))

  return applyRequiredInjuryExclusionsToProgram({
    userId: profile?.id || 'forma_local_user',
    goal: profile?.goal || 'athletic',
    trainingStyle: 'gym',
    experienceLevel: level,
    programType: 'race_fit',
    weeklySchedule,
    sessions,
    sessionsList: dayNames.map((day) => {
      const entry = weeklySchedule.find(w => w.day === day && w.sessionKey)
      if (!entry?.sessionKey) return null
      const s = sessions[entry.sessionKey]
      return {
        id: entry.sessionKey, name: s.name, environment: s.environment,
        exercises: s.movements, warmUp: s.warmUp, coolDown: s.coolDown,
        estimatedDuration: s.estimatedDuration, sessionKey: entry.sessionKey, day,
      }
    }).filter(Boolean),
    snackRecommendations: [],
    nutritionPhilosophy: rfData.nutritionGuidance,
    weeklyVolume: { daysPerWeek, splitId: 'race_fit', sessionMinutes },
    profileSnapshot: { name: profile?.name || 'Friend', goal: 'athletic', level, daysPerWeek },
    createdAt: new Date().toISOString(),
  }, profile)
}

/**
 * Main entry point — replaces buildProgram() everywhere.
 * Routes to the right program based on the client's full profile.
 */
export function buildProgramForProfile(profile = {}) {
  try {
    const selector = selectProgramType(profile)

    switch (selector.type) {
      case 'sport': {
        const result = buildSportProgram(profile)
        if (result) return result
        break
      }
      case 'race_fit': {
        const result = buildRaceFitSessionProgram(profile)
        if (result) return result
        break
      }
      case 'calisthenics': {
        const result = buildCalisthenicsProgram(profile)
        if (result) return result
        break
      }
      case 'home': {
        const result = buildHomeProgramFromCatalog(profile, selector)
        if (result) return result
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('programBuilderRouter error, falling back to gym builder:', err)
  }

  // Default: full gym builder (unchanged, handles all gym goal types)
  let storedProfile = {}
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('forma_user_profile') : null
    storedProfile = raw ? JSON.parse(raw) : {}
  } catch {
    storedProfile = {}
  }
  const fullUserProfile = { ...storedProfile, ...(profile || {}) }
  return applyRequiredInjuryExclusionsToProgram(buildProgram(fullUserProfile), fullUserProfile)
}
