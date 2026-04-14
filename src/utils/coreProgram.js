import { getExerciseById } from '../data/exercises'
import { mapExperienceToTrainLevel } from './experienceLevel'

function goalId(goalRaw) {
  const g = String(goalRaw || '').toLowerCase()
  if (g.includes('fat')) return 'fat_loss'
  if (g.includes('muscle')) return 'muscle'
  if (g.includes('strength')) return 'strength'
  return 'muscle'
}

function levelWarmup(level) {
  if (level === 'beginner') {
    return { minutes: 5, title: 'Gentle 5-minute warm up' }
  }
  if (level === 'intermediate') {
    return { minutes: 8, title: '8-minute activation warm up' }
  }
  return { minutes: 10, title: '10-minute CNS activation warm up' }
}

const PROGRAM_MATRIX = {
  beginner: {
    fat_loss: {
      restSeconds: 45,
      repRange: [15, 20],
      ids: ['beg-goblet-squat', 'beg-rdl', 'beg-db-bench', 'beg-db-row', 'beg-db-shoulder-press', 'beg-lat-pulldown'],
      label: 'Beginner fat loss session',
    },
    muscle: {
      restSeconds: 75,
      repRange: [10, 15],
      ids: ['beg-goblet-squat', 'beg-rdl', 'beg-db-bench', 'beg-db-row', 'beg-lat-pulldown', 'beg-db-shoulder-press'],
      label: 'Beginner muscle building session',
    },
    strength: {
      restSeconds: 90,
      repRange: [8, 12],
      ids: ['beg-goblet-squat', 'beg-rdl', 'beg-db-bench', 'beg-db-row', 'beg-lat-pulldown', 'beg-db-shoulder-press'],
      label: 'Beginner strength foundation',
    },
  },
  intermediate: {
    fat_loss: {
      restSeconds: 60,
      repRange: [12, 15],
      ids: ['int-back-squat', 'int-rdl', 'int-barbell-bench', 'int-barbell-row', 'int-pullups', 'int-ohp'],
      label: 'Intermediate fat loss session',
    },
    muscle: {
      restSeconds: 90,
      repRange: [8, 12],
      ids: ['int-back-squat', 'int-rdl', 'int-barbell-bench', 'int-barbell-row', 'int-pullups', 'int-ohp'],
      label: 'Intermediate muscle building session',
    },
    strength: {
      restSeconds: 120,
      repRange: [6, 10],
      ids: ['int-back-squat', 'int-rdl', 'int-barbell-bench', 'int-barbell-row', 'int-pullups', 'int-ohp'],
      label: 'Intermediate strength session',
    },
  },
  advanced: {
    fat_loss: {
      restSeconds: 60,
      repRange: [10, 15],
      ids: ['adv-pause-squat', 'adv-deficit-deadlift', 'adv-close-grip-bench', 'adv-weighted-pullups', 'adv-pendlay-row', 'adv-push-press'],
      label: 'Advanced fat loss session',
    },
    muscle: {
      restSeconds: 90,
      repRange: [6, 12],
      ids: ['adv-pause-squat', 'adv-deficit-deadlift', 'adv-close-grip-bench', 'adv-weighted-pullups', 'adv-pendlay-row', 'adv-push-press'],
      label: 'Advanced muscle building session',
    },
    strength: {
      restSeconds: 180,
      repRange: [3, 6],
      ids: ['adv-pause-squat', 'adv-deficit-deadlift', 'adv-close-grip-bench', 'adv-weighted-pullups', 'adv-pendlay-row', 'adv-push-press'],
      label: 'Advanced strength session',
    },
  },
}

export function buildProgramFromProfile(profile) {
  const level = mapExperienceToTrainLevel(profile?.experience_level)
  const goal = goalId(profile?.goal)
  const cfg = PROGRAM_MATRIX[level]?.[goal] || PROGRAM_MATRIX.beginner.muscle
  const warmup = levelWarmup(level)
  const exercises = cfg.ids.map((id, i) => {
    const ex = getExerciseById(id)
    return {
      ...(ex || { id, name: id }),
      displayName: ex?.name || id,
      order: i + 1,
      sets: level === 'advanced' ? 5 : level === 'intermediate' ? 4 : 3,
      repRange: cfg.repRange,
      restSeconds: cfg.restSeconds,
    }
  })
  return { level, goal, warmup, label: cfg.label, restSeconds: cfg.restSeconds, exercises }
}
