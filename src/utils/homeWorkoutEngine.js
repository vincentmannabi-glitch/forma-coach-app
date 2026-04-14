/**
 * @typedef {{ id: string; title: string; subtitle: string; detail: string }} HomeEquipmentCard
 * @typedef {{ id: string; name: string; description: string; commonMistakes: string[]; regression: string; progression: string; formTip: string; sets?: number; repRange?: [number, number]; restSeconds?: number; loadCue?: string; anchorNotes?: string; bandTension?: string }} HomeExercise
 * @typedef {{ id: string; title: string; equipmentId: string; format: 'strength'|'circuit'|'mobility'; intro?: string; rounds?: number; workSeconds?: number; restSeconds?: number; exercises?: HomeExercise[]; stations?: HomeExercise[] }} HomeProgramDefinition
 */

import {
  getHomeProgram,
  HOME_EQUIPMENT_OPTIONS,
  HOME_PROGRAM_PICKERS,
} from '../data/homeWorkoutCatalog'

export { HOME_EQUIPMENT_OPTIONS, HOME_PROGRAM_PICKERS }

/**
 * Hotel room — 6×6 ft, bodyweight only, no furniture.
 * @returns {HomeProgramDefinition}
 */
export function getTravelWorkoutDefinition() {
  return {
    id: 'travel_hotel',
    title: 'Travel mode',
    equipmentId: 'none',
    format: 'strength',
    intro:
      'No furniture, minimal space (~6×6 ft). Move slowly on the first round to map your range. Rest 60–90s between moves, 2–3 minutes between rounds. 3 rounds.',
    exercises: [
      {
        id: 'tr-squat',
        name: 'Air squat',
        description:
          'Feet shoulder-width, sit hips back and down, knees track toes, stand tall. No wall — own your balance.',
        commonMistakes: ['Knees caving', 'Heels lifting', 'Chest falling'],
        regression: 'Box or hold counter when you have support',
        progression: 'Tempo squat or jump squat at home',
        sets: 3,
        repRange: [15, 25],
        restSeconds: 60,
        formTip: 'Brace before you move.',
        loadCue: 'Bodyweight',
      },
      {
        id: 'tr-pushup',
        name: 'Push-up',
        description: 'Hands under shoulders, straight line, full range.',
        commonMistakes: ['Sagging hips', 'Half reps', 'Flared elbows'],
        regression: 'Knee push-up',
        progression: 'Close-grip or tempo',
        sets: 3,
        repRange: [8, 20],
        restSeconds: 60,
        formTip: 'Squeeze glutes and quads.',
        loadCue: 'Bodyweight',
      },
      {
        id: 'tr-rdl',
        name: 'Reverse lunge',
        description: 'Step back softly, knee toward floor, drive through front heel.',
        commonMistakes: ['Torso collapse', 'Knee cave', 'Short steps'],
        regression: 'Static split squat',
        progression: 'Jumping lunge when back home',
        sets: 3,
        repRange: [10, 16],
        restSeconds: 60,
        formTip: 'Vertical front shin.',
        loadCue: 'Bodyweight',
      },
      {
        id: 'tr-plank',
        name: 'Plank',
        description: 'Forearms down, ribs tucked, long spine.',
        commonMistakes: ['Hips high', 'Looking up'],
        regression: 'Inchworm to plank',
        progression: 'Shoulder taps',
        sets: 3,
        repRange: [30, 60],
        restSeconds: 45,
        formTip: 'Exhale to set ribs.',
        loadCue: 'seconds',
      },
      {
        id: 'tr-hip-thrust',
        name: 'Single-leg glute bridge',
        description: 'Floor bridge, one leg extended, hips level.',
        commonMistakes: ['Hip drop', 'Arching'],
        regression: 'Two-leg bridge',
        progression: 'Marching bridge',
        sets: 3,
        repRange: [10, 15],
        restSeconds: 60,
        formTip: 'Drive through heel.',
        loadCue: 'per side',
      },
      {
        id: 'tr-side-plank',
        name: 'Side plank',
        description: 'Elbow under shoulder, hips high, straight line.',
        commonMistakes: ['Hips sagging', 'Rotating'],
        regression: 'Knees bent',
        progression: 'Leg lift',
        sets: 2,
        repRange: [20, 40],
        restSeconds: 45,
        formTip: 'Push floor away.',
        loadCue: 'seconds per side',
      },
      {
        id: 'tr-inchworm',
        name: 'Inchworm',
        description: 'Fold forward, walk hands to plank, walk feet to hands.',
        commonMistakes: ['Rounded standing', 'Short steps'],
        regression: 'Stop at half plank',
        progression: 'Push-up at bottom',
        sets: 2,
        repRange: [6, 10],
        restSeconds: 60,
        formTip: 'Slow and controlled.',
        loadCue: 'reps',
      },
    ],
  }
}

/**
 * @param {HomeProgramDefinition} program
 */
export function normalizeProgramForSession(program) {
  if (!program) return null
  if (program.format === 'circuit') {
    const stations = program.stations || []
    const rounds = program.rounds || 4
    return {
      ...program,
      exercises: stations.map((e, i) => ({
        ...e,
        order: i + 1,
        displayName: e.name,
        sets: rounds,
        repRange: [1, 1],
        restSeconds: program.restSeconds,
        _circuit: {
          workSeconds: program.workSeconds,
          restSeconds: program.restSeconds,
          rounds,
        },
      })),
    }
  }
  const ex = program.exercises || []
  return {
    ...program,
    exercises: ex.map((e, i) => ({
      ...e,
      order: i + 1,
      displayName: e.name,
    })),
  }
}

/**
 * @param {import('./auth').User | null} user
 */
export function resolveNoExcusesProgram(user) {
  const eq = user?.home_equipment_id || 'none'
  const goal = (user?.goal || '').toLowerCase()

  if (eq === 'none') {
    if (goal.includes('lose') || goal.includes('fat') || goal.includes('lean')) {
      return getHomeProgram('none', 'fat_loss_circuit')
    }
    if (goal.includes('mobil') || goal.includes('recover') || goal.includes('yoga')) {
      return getHomeProgram('none', 'mobility_recovery')
    }
    return getHomeProgram('none', 'muscle_calisthenics')
  }
  if (eq === 'bands') return getHomeProgram('bands', 'bands_total_gym')
  if (eq === 'basics') return getHomeProgram('basics', 'db_full_body_3')
  if (eq === 'full') return getHomeProgram('full', 'full_upper_lower')
  return getHomeProgram('none', 'muscle_calisthenics')
}
