/**
 * Today's workout exercise order by level (maps to exercise ids in exercises.js).
 * Display names match product copy.
 */

import { getExerciseById } from './exercises'

const ORDER = {
  beginner: [
    { id: 'beg-goblet-squat', displayName: 'Goblet Squat' },
    { id: 'beg-rdl', displayName: 'Dumbbell Romanian Deadlift' },
    { id: 'beg-db-bench', displayName: 'Dumbbell Bench Press' },
    { id: 'beg-db-row', displayName: 'Dumbbell Row' },
    { id: 'beg-lat-pulldown', displayName: 'Lat Pulldown' },
    { id: 'beg-leg-press', displayName: 'Leg Press' },
  ],
  intermediate: [
    { id: 'int-back-squat', displayName: 'Back Squat' },
    { id: 'int-deadlift', displayName: 'Conventional Deadlift' },
    { id: 'int-barbell-bench', displayName: 'Barbell Bench Press' },
    { id: 'int-barbell-row', displayName: 'Barbell Row' },
    { id: 'int-ohp', displayName: 'Overhead Press' },
    { id: 'int-pullups', displayName: 'Pullups' },
  ],
  advanced: [
    { id: 'adv-pause-squat', displayName: 'Pause Squat' },
    { id: 'adv-deficit-deadlift', displayName: 'Deficit Deadlift' },
    { id: 'adv-close-grip-bench', displayName: 'Close Grip Bench' },
    { id: 'adv-weighted-pullups', displayName: 'Weighted Pullups' },
    { id: 'adv-pendlay-row', displayName: 'Pendlay Row' },
    { id: 'adv-push-press', displayName: 'Push Press' },
  ],
}

export function getTodaysWorkout(levelKey) {
  const key = ['beginner', 'intermediate', 'advanced'].includes(levelKey)
    ? levelKey
    : 'beginner'
  const list = ORDER[key] || ORDER.beginner
  return list
    .map((entry, index) => {
      const base = getExerciseById(entry.id)
      if (!base) return null
      const { level, ...rest } = base
      return {
        ...rest,
        displayName: entry.displayName,
        order: index + 1,
      }
    })
    .filter(Boolean)
}

export const LEVEL_KEYS = ['beginner', 'intermediate', 'advanced']
export const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}
