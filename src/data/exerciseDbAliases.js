/**
 * Preferred ExerciseDB `/exercises/name/{name}` search strings per FORMA exercise id.
 * Order matters — first match wins.
 */
/** @type {Record<string, string[]>} */
export const EXERCISE_DB_SEARCH_QUERIES = {
  'beg-rdl': ['dumbbell romanian deadlift', 'barbell romanian deadlift'],
  'int-rdl': ['barbell romanian deadlift', 'dumbbell romanian deadlift'],
  'adv-rdl-slow-eccentric': ['barbell romanian deadlift', 'dumbbell romanian deadlift'],
  'int-deadlift': ['barbell deadlift', 'deadlift'],
  'adv-deficit-deadlift': ['barbell deadlift', 'deadlift'],
  'beg-assisted-pushup': ['incline push-up', 'push-up'],
  'int-pullups': ['pull-up', 'chin-up'],
  'int-dips': ['chest dip', 'triceps dip'],
  'adv-weighted-pullups': ['weighted pull-up', 'pull-up'],
  'int-ohp': ['barbell seated overhead press', 'dumbbell shoulder press'],
  'adv-push-press': ['dumbbell push press', 'kettlebell double push press'],
  'int-back-squat': ['barbell full squat', 'barbell squat'],
  'adv-pause-squat': ['barbell full squat', 'barbell squat'],
  'adv-close-grip-bench': ['barbell bench press'],
  'adv-bulgarian-split-squat': ['dumbbell single leg split squat', 'barbell split squat'],
  'cal-beg-scap-pulls': ['scapular pull-up', 'pull-up'],
  'cal-beg-assisted-pullup': ['band assisted pull-up', 'assisted pull-up'],
  'cal-beg-squat': ['barbell full squat', 'kettlebell goblet squat'],
  'cal-beg-hollow': ['jackknife sit-up', 'bicycle crunch'],
  'cal-beg-plank': ['weighted front plank', 'front plank with twist'],
  'cal-beg-incline-pushup': ['incline push-up'],
  'cal-int-pullup': ['pull-up', 'chin-up'],
  'cal-int-dip': ['chest dip', 'triceps dip'],
  'cal-int-bulgarian': ['dumbbell single leg split squat', 'barbell split squat'],
  'cal-int-lsit-tuck': ['hanging pike', 'hanging straight leg raise'],
  'cal-int-knee-raise': ['hanging knee raise', 'hanging straight leg raise'],
  'cal-int-inverted-row': ['inverted row v. 2', 'inverted row'],
  'cal-adv-mu-prog': ['kipping muscle up', 'muscle up'],
  'cal-adv-pistol': ['kettlebell pistol squat', 'pistol squat'],
  'cal-adv-hs-wall': ['handstand push-up'],
  'cal-adv-ttb': ['hanging straight leg raise', 'hanging leg raise'],
  'cal-adv-w-pullup': ['wide grip pull-up', 'pull-up'],
  'cal-adv-fl-tuck': ['front lever', 'front lever reps'],
}

/**
 * @param {object | null | undefined} ex
 * @returns {string[]}
 */
export function getSearchQueriesForExercise(ex) {
  const id = ex?.id != null ? String(ex.id) : ''
  const seen = new Set()
  const out = []

  const push = (s) => {
    const t = String(s || '').trim()
    if (!t) return
    const k = t.toLowerCase()
    if (seen.has(k)) return
    seen.add(k)
    out.push(t)
  }

  const preset = id && EXERCISE_DB_SEARCH_QUERIES[id]
  if (preset) preset.forEach(push)

  push(ex?.displayName)
  push(ex?.name)

  const raw = String(ex?.name || ex?.displayName || '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
  if (raw) {
    const withoutTempo = raw.replace(/^tempo\s+/i, '').trim()
    push(withoutTempo)
    if (withoutTempo.includes('-')) {
      push(withoutTempo.replace(/-/g, ' '))
    }
  }

  return out
}
