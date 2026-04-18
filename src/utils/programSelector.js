/**
 * FORMA Program Selector
 * Routes each client to the correct program based on their full profile.
 * Every client gets programs built from Vincent's actual training systems —
 * not generic algorithm output.
 */

import { SPORT_PROGRAMS } from '../data/sportProgramsCatalog'
import { getCalisthenicsWorkout } from '../data/calisthenicsWorkout'
import { getHybridWorkout } from '../data/hybridWorkout'
import { getHomeProgram } from '../data/homeWorkoutCatalog'
import { mapExperienceToTrainLevel } from './experienceLevel'

/**
 * Maps a client profile to the correct program type.
 * Returns a program descriptor that programBuilder uses to generate sessions.
 */
export function selectProgramType(profile = {}) {
  const cardio = (profile?.cardio_type || '').toLowerCase()
  const goal = (profile?.goal || '').toLowerCase()
  const equipment = (profile?.equipment || '').toLowerCase()
  const level = mapExperienceToTrainLevel(profile?.experience_level || profile?.experienceLevel) || 'beginner'
  const sports = (profile?.sports_or_activities || []).map(s => s.toLowerCase())

  // ─── Race Fit (formerly Hyrox) ───────────────────────────────────────────
  if (cardio === 'race_fit' || sports.includes('race_fit')) {
    return { type: 'race_fit', level, sport: 'race_fit' }
  }

  // ─── Running ────────────────────────────────────────────────────────────
  if (cardio === 'running' || sports.includes('running')) {
    if (goal.includes('speed') || goal.includes('sprint') || goal.includes('5k')) {
      return { type: 'sport', level, sport: 'running_5k' }
    }
    return { type: 'sport', level, sport: 'running_marathon' }
  }

  // ─── Rowing ─────────────────────────────────────────────────────────────
  if (cardio === 'rowing' || sports.includes('rowing')) {
    return { type: 'sport', level, sport: 'rowing' }
  }

  // ─── CrossFit ───────────────────────────────────────────────────────────
  if (cardio === 'crossfit' || sports.includes('crossfit')) {
    return { type: 'sport', level, sport: 'crossfit' }
  }

  // ─── Cycling ────────────────────────────────────────────────────────────
  if (cardio === 'cycling' || sports.includes('cycling')) {
    return { type: 'sport', level, sport: 'cycling_road' }
  }

  // ─── Swimming ───────────────────────────────────────────────────────────
  if (cardio === 'swimming' || sports.includes('swimming')) {
    return { type: 'sport', level, sport: 'swimming_competitive' }
  }

  // ─── Calisthenics / bodyweight only ─────────────────────────────────────
  if (
    equipment.includes('bodyweight only') ||
    (profile?.training_style || '').toLowerCase().includes('calisthenics')
  ) {
    return { type: 'calisthenics', level }
  }

  // ─── Home with dumbbells/basics ──────────────────────────────────────────
  if (
    equipment.includes('dumbbells') &&
    !equipment.includes('barbell') &&
    !equipment.includes('full gym')
  ) {
    const programId = goal.includes('fat') ? 'db_full_body_3' : 'db_upper_lower'
    return { type: 'home', level, equipmentId: 'basics', programId }
  }

  // ─── Home with bands only ────────────────────────────────────────────────
  if (equipment.includes('resistance bands') && !equipment.includes('dumbbells')) {
    return { type: 'home', level, equipmentId: 'bands', programId: 'bands_total_gym' }
  }

  // ─── Full gym — all goals ────────────────────────────────────────────────
  // Fat loss
  if (goal.includes('fat') || goal.includes('lose') || goal.includes('lean')) {
    return { type: 'gym', level, goal: 'fatLoss' }
  }
  // Muscle building
  if (goal.includes('muscle') || goal.includes('build') || goal.includes('hyper')) {
    return { type: 'gym', level, goal: 'muscleBuilding' }
  }
  // Strength
  if (goal.includes('strength') || goal.includes('strong') || goal.includes('power')) {
    return { type: 'gym', level, goal: 'strength' }
  }
  // Athletic / sport general
  if (goal.includes('athletic') || goal.includes('sport') || goal.includes('performance')) {
    return { type: 'gym', level, goal: 'athletic' }
  }

  // Default: gym full body
  return { type: 'gym', level, goal: 'fatLoss' }
}

/**
 * Get the sport program for a given sport id.
 */
export function getSportProgram(sportId) {
  return SPORT_PROGRAMS.find(p => p.id === sportId) || null
}

/**
 * Build a Race Fit (formerly Hyrox-style) weekly program structure.
 * Uses Vincent's exercise library — 8 stations + strength support.
 */
export function buildRaceFitProgram(level) {
  const isAdv = level === 'advanced'
  const isInt = level === 'intermediate'

  return {
    id: 'race_fit',
    name: 'Race Fit',
    description: 'Hybrid race conditioning — strength + functional cardio. Built around the 8 race stations with progressive strength support.',
    weeklyStructure: '3–4 sessions per week. Day 1: Strength (lower). Day 2: Race station conditioning. Day 3: Strength (upper + core). Day 4: Full race simulation or intervals.',
    sessions: {
      strength_lower: {
        name: 'Strength — lower body',
        focus: 'Build the legs and posterior chain that power every station.',
        exercises: [
          { name: 'Back Squat or Goblet Squat', sets: 4, repRange: [6, 10], loadCue: isAdv ? '75–85% 1RM' : 'Moderate — 3 reps in reserve', restSeconds: 120 },
          { name: 'Romanian Deadlift', sets: 4, repRange: [8, 12], loadCue: 'Hip hinge — feel hamstrings', restSeconds: 90 },
          { name: 'Dumbbell Walking Lunge', sets: 3, repRange: [10, 14], loadCue: 'Simulates lunging under fatigue', restSeconds: 90 },
          { name: 'Kettlebell Swing', sets: 4, repRange: [15, 20], loadCue: 'Power — hip drive', restSeconds: 60 },
          { name: 'Farmers Carry', sets: 3, repRange: [30, 50], loadCue: 'Heavy — simulates farmers carry station', restSeconds: 90 },
        ],
      },
      race_conditioning: {
        name: 'Race conditioning — stations',
        focus: 'Train the 8 race stations in sequence. Rest 90s between stations.',
        stations: [
          { name: 'SkiErg or Rowing Machine', detail: isAdv ? '200m at race pace' : '150m controlled pace', why: 'Opens the race — upper body endurance and lat power' },
          { name: 'Sled Push', detail: isAdv ? '25m heavy load' : '25m moderate load', why: 'Quad and glute drive — most demanding station' },
          { name: 'Sled Pull or Banded Pull', detail: isAdv ? '25m heavy' : '25m moderate', why: 'Upper back and grip — train this specifically' },
          { name: 'Burpees Broad Jump', detail: isAdv ? '10 reps' : '8 reps', why: 'Full body — most aerobically demanding station' },
          { name: 'Rowing Machine', detail: isAdv ? '200m' : '150m', why: 'Leg and back endurance — technique under fatigue' },
          { name: 'Farmers Carry', detail: isAdv ? '2×24kg × 50m' : '2×16kg × 50m', why: 'Grip and core stability — race specific' },
          { name: 'Sandbag Lunges', detail: isAdv ? '10kg × 25m' : '5kg × 25m', why: 'Leg endurance — mimics race lunging station' },
          { name: 'Wall Balls', detail: isAdv ? '9kg × 15 reps' : '6kg × 12 reps', why: 'Finishing station — squat + press under fatigue' },
        ],
      },
      strength_upper: {
        name: 'Strength — upper body + core',
        focus: 'Build pressing, pulling, and core for race posture and station performance.',
        exercises: [
          { name: 'Barbell or Dumbbell Press', sets: 4, repRange: [6, 10], loadCue: 'Upper body push strength', restSeconds: 120 },
          { name: 'Dumbbell Single Arm Row', sets: 4, repRange: [8, 12], loadCue: 'Lat and rhomboid strength for sled pull', restSeconds: 90 },
          { name: 'Banded Face Pull', sets: 3, repRange: [15, 20], loadCue: 'Shoulder health — race posture', restSeconds: 60 },
          { name: 'Pallof Press', sets: 3, repRange: [10, 12], loadCue: 'Anti-rotation — race core stability', restSeconds: 60 },
          { name: 'Dead Bug', sets: 3, repRange: [8, 10], loadCue: 'Anti-extension — protect back under fatigue', restSeconds: 60 },
        ],
      },
      race_simulation: {
        name: 'Race simulation or intervals',
        focus: isAdv ? 'Full 8-station simulation at race pace.' : 'Interval-based conditioning — 2 stations at a time, 3 rounds.',
        detail: isAdv
          ? 'Complete all 8 stations in order. Time yourself. Rest 2 min between full rounds.'
          : 'Pick 2 stations per round. 3 rounds. Rest 2 min between rounds. Rotate stations each week.',
      },
    },
    nutritionGuidance: 'Higher carb availability on race simulation days. Pre-session: fast-digesting carbs 30–60 min before. Post-session: 25–35g protein + carbs within 45 min. Hydration critical — race conditions cause significant sweat loss.',
    recoveryGuidance: 'Lower legs and grip take the most load. Elevate feet post-session. Sleep 7–9 hours. Easy movement between sessions — no complete rest days if training 4+/week, use active recovery.',
    commonInjuries: ['Lower back from sled push', 'Knee pain from lunges', 'Grip/forearm fatigue', 'Hip flexor tightness'],
  }
}

/**
 * Get display name for cardio type — no trademark issues.
 */
export function getCardioDisplayName(cardioType) {
  const names = {
    none: 'None',
    running: 'Running',
    race_fit: 'Race Fit',
    crossfit: 'CrossFit',
    cycling: 'Cycling',
    rowing: 'Rowing',
    swimming: 'Swimming',
  }
  return names[cardioType] || cardioType
}
