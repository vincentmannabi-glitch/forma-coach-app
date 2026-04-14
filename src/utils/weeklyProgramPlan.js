/**
 * Calendar week training plan: strength focus + built-in cardio, functional, and core.
 */

import { dateKeyLocal } from './foodLog'
import { normalizeProgramGoal, getExperienceTier } from '../data/programGoals'
import {
  STEADY_STATE_CARDIO,
  buildHiitBlock,
  FUNCTIONAL_TRAINING_BLOCK,
  SPORT_CONDITIONING_BLOCK,
  ACTIVE_RECOVERY_BLOCK,
  getCoreBlockForTier,
  CORE_END_OF_SESSION_WHY,
} from '../data/weeklyProgramContent'

function startOfWeekSunday(d) {
  const x = new Date(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

/**
 * @param {'fat_loss'|'muscle'|'athlete'|'general'} category
 * @param {number} dayIndex 0=Sun … 6=Sat
 * @param {'beginner'|'intermediate'|'advanced'} tier
 * @param {string} dateKey
 */
function buildDayForCategory(category, dayIndex, tier, dateKey) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const long = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const base = {
    dateKey,
    dayIndex,
    weekdayShort: labels[dayIndex],
    weekdayLabel: long[dayIndex],
  }

  const coreFull = getCoreBlockForTier(tier)

  if (category === 'fat_loss') {
    return { ...base, ...fatLossTemplate(dayIndex, tier, coreFull) }
  }
  if (category === 'muscle') {
    return { ...base, ...muscleTemplate(dayIndex, tier, coreFull) }
  }
  if (category === 'athlete') {
    return { ...base, ...athleteTemplate(dayIndex, tier, coreFull) }
  }
  if (category === 'balanced') {
    return { ...base, ...generalTemplate(dayIndex, tier, coreFull) }
  }
  return { ...base, ...generalTemplate(dayIndex, tier, coreFull) }
}

/**
 * @param {ReturnType<typeof getCoreBlockForTier>} coreFull
 */
function fatLossTemplate(dayIndex, tier, coreFull) {
  switch (dayIndex) {
    case 1:
      return {
        chipLabel: 'Upper · strength',
        rationale:
          'Monday hits upper-body strength while you are fresh from the weekend — quality reps before weekly fatigue stacks.',
        strengthFocus: 'Upper-body compound and accessory volume — press and pull patterns.',
        cardio: null,
        functional: null,
        core: null,
      }
    case 2:
      return {
        chipLabel: 'HIIT · core',
        rationale:
          'HIIT sits after an upper day so legs are not coming off heavy squats or deadlifts — power and conditioning without conflicting with lower strength later in the week.',
        strengthFocus: 'Warm up properly — today’s main stimulus is conditioning and trunk work.',
        cardio: {
          kind: 'hiit',
          ...buildHiitBlock(tier),
          weeklyHint:
            'You can add a second HIIT later in the week only if you have at least one full recovery day before it and you are not on a heavy lower-body day.',
        },
        functional: null,
        core: {
          ...coreFull,
          placement: 'after_hiit',
          note: 'Core follows HIIT when breathing is already elevated — shorter sets, perfect bracing.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 3:
      return {
        chipLabel: 'Lower · strength',
        rationale:
          'Mid-week lower session builds structural strength with time to recover before the next leg exposure.',
        strengthFocus: 'Squat and hinge patterns — progressive loading.',
        cardio: null,
        functional: null,
        core: null,
      }
    case 4:
      return {
        chipLabel: 'Steady cardio',
        rationale:
          'Thursday is zone 2 between leg days — promotes recovery and fat oxidation without stealing from tomorrow’s upper session.',
        strengthFocus: 'Optional light movement prep only — keep lifting minimal.',
        cardio: { kind: 'steady', ...STEADY_STATE_CARDIO },
        functional: null,
        core: null,
      }
    case 5:
      return {
        chipLabel: 'Upper · strength + core',
        rationale:
          'Second upper day adds volume; core finishes after presses and rows so shoulders and spine stayed stable under load.',
        strengthFocus: 'Upper push and pull — moderate to heavy.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: '10–15 minutes after upper work — anti-extension and anti-rotation emphasis.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 6:
      return {
        chipLabel: 'Lower · strength + core',
        rationale:
          'Weekend lower session plus core — more time for warm-up; core last to protect spine during hinges and squats.',
        strengthFocus: 'Lower strength and single-leg accessories if programmed.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Finish with core after all lower-body lifts.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 0:
    default:
      return {
        chipLabel: 'Active recovery / rest',
        rationale:
          'Sunday consolidates adaptation — walk or mobility if you feel good; full rest is also productive.',
        strengthFocus: 'None — recovery priority.',
        cardio: {
          kind: 'active_recovery',
          ...ACTIVE_RECOVERY_BLOCK,
          weeklyHint:
            'For fat loss you want 2–3 steady sessions per week — Thursday is your main zone 2 day; add another 30–40 min easy session here or on any non-lifting day if you want a third.',
        },
        functional: null,
        core: null,
      }
  }
}

function muscleTemplate(dayIndex, tier, coreFull) {
  switch (dayIndex) {
    case 1:
      return {
        chipLabel: 'Upper · push',
        rationale:
          'Push day opens the week with chest, shoulders, and triceps while CNS readiness is high.',
        strengthFocus: 'Horizontal and vertical presses plus shoulder accessories.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Short core finisher — anti-extension work after pressing.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 2:
      return {
        chipLabel: 'Lower · strength',
        rationale:
          'Lower day after upper keeps interference low — heavy legs without fatigued shoulders.',
        strengthFocus: 'Squat and hinge priority.',
        cardio: null,
        functional: null,
        core: null,
      }
    case 3:
      return {
        chipLabel: 'Rest · recovery',
        rationale:
          'Mid-week break lets connective tissue and nervous system recover so Thursday’s pull session is quality.',
        strengthFocus: 'None.',
        cardio: {
          kind: 'steady',
          ...STEADY_STATE_CARDIO,
          optionalNote: 'Optional 20–30 min easy walk if you want movement — not mandatory.',
        },
        functional: null,
        core: null,
      }
    case 4:
      return {
        chipLabel: 'Upper · pull',
        rationale:
          'Pull emphasis balances Monday’s push volume — back thickness and biceps without overlapping yesterday’s leg fatigue.',
        strengthFocus: 'Rows, vertical pulls, rear delts, arms.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Core after pulls — focus on stiffness and control.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 5:
      return {
        chipLabel: 'Lower · strength',
        rationale:
          'Second lower day adds volume for legs and hips — spaced from Tuesday with recovery in between.',
        strengthFocus: 'Variations or intensity methods as appropriate to level.',
        cardio: null,
        functional: null,
        core: null,
      }
    case 6:
      return {
        chipLabel: 'Full body · weak point + core',
        rationale:
          'Saturday ties the week together — address lagging patterns, then core when trunk is still fresh enough for skill work.',
        strengthFocus: 'Full body or priority muscle groups you are bringing up.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Full core menu — quality over speed.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 0:
    default:
      return {
        chipLabel: 'Rest',
        rationale:
          'Complete rest supports muscle repair and glycogen replenishment before Monday.',
        strengthFocus: 'None.',
        cardio: null,
        functional: null,
        core: null,
      }
  }
}

function athleteTemplate(dayIndex, tier, coreFull) {
  switch (dayIndex) {
    case 1:
      return {
        chipLabel: 'Lower · strength',
        rationale:
          'Heavy lower patterns first in the week — power and speed work later need fresh legs later, not crushed quads on Monday.',
        strengthFocus: 'Squat and hinge strength — bar speed matters.',
        cardio: null,
        functional: null,
        core: null,
      }
    case 2:
      return {
        chipLabel: 'Functional + conditioning',
        rationale:
          'Tuesday is for transfer — rotation, jumps, and carries replace generic cardio while conditioning stays high.',
        strengthFocus: 'Low traditional lifting volume — movement quality first.',
        cardio: null,
        functional: { kind: 'functional', ...FUNCTIONAL_TRAINING_BLOCK },
        core: {
          ...coreFull,
          placement: 'after_functional',
          note: 'Rotational core layered after explosive work — match sport timing.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 3:
      return {
        chipLabel: 'Upper · strength',
        rationale:
          'Upper strength mid-week — upper body recovers faster; keeps schedule balanced around leg and conditioning days.',
        strengthFocus: 'Pressing, pulling, upper-back strength.',
        cardio: null,
        functional: null,
        core: null,
      }
    case 4:
      return {
        chipLabel: 'Sport conditioning',
        rationale:
          'Thursday mirrors game demands — intervals and direction changes without stacking on heavy lower strength.',
        strengthFocus: 'Minimal — prep and prime only.',
        cardio: { kind: 'sport_conditioning', ...SPORT_CONDITIONING_BLOCK },
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Anti-rotation and stiffness work after conditioning.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 5:
      return {
        chipLabel: 'Full body · strength',
        rationale:
          'Friday full-body strength ties patterns together before a lighter weekend — good for in-season maintenance.',
        strengthFocus: 'Compound lifts across patterns — moderate volume.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Core stability under fatigue — control first.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 6:
      return {
        chipLabel: 'Active recovery · mobility',
        rationale:
          'Saturday clears stiffness before Sunday off — tissue quality supports next week’s speed work.',
        strengthFocus: 'None — tissue care.',
        cardio: { kind: 'active_recovery', ...ACTIVE_RECOVERY_BLOCK },
        functional: null,
        core: null,
      }
    case 0:
    default:
      return {
        chipLabel: 'Rest',
        rationale:
          'Full recovery before Monday’s lower strength — non-negotiable when training and practice stack.',
        strengthFocus: 'None.',
        cardio: null,
        functional: null,
        core: null,
      }
  }
}

function generalTemplate(dayIndex, tier, coreFull) {
  switch (dayIndex) {
    case 1:
      return {
        chipLabel: 'Upper · strength',
        rationale:
          'Balanced start — upper strength with core finisher for general health and posture.',
        strengthFocus: 'Upper push and pull.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Core finisher 10–12 minutes.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 2:
      return {
        chipLabel: 'Lower · strength',
        rationale:
          'Lower day spaced from weekend — build legs and hips with full recovery before mid-week.',
        strengthFocus: 'Squat and hinge basics.',
        cardio: null,
        functional: null,
        core: null,
      }
    case 3:
      return {
        chipLabel: 'Steady cardio · recovery',
        rationale:
          'Mid-week aerobic work supports heart health and recovery — keeps you moving without extra joint stress.',
        strengthFocus: 'None or very light accessories.',
        cardio: { kind: 'steady', ...STEADY_STATE_CARDIO },
        functional: null,
        core: null,
      }
    case 4:
      return {
        chipLabel: 'Full body · light',
        rationale:
          'Moderate full-body day — technique and volume without crushing so Friday stays productive.',
        strengthFocus: 'Full-body circuit or compound pairs.',
        cardio: null,
        functional: null,
        core: {
          ...coreFull,
          placement: 'end',
          note: 'Core endurance — planks and carries.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 5:
      return {
        chipLabel: 'HIIT · conditioning',
        rationale:
          'End-of-week conditioning — far from Tuesday’s lower strength; short and sharp.',
        strengthFocus: 'Warm-up only.',
        cardio: { kind: 'hiit', ...buildHiitBlock(tier) },
        functional: null,
        core: {
          ...coreFull,
          placement: 'after_hiit',
          note: 'Short core after intervals.',
          whyOrdering: CORE_END_OF_SESSION_WHY,
        },
      }
    case 6:
      return {
        chipLabel: 'Active recovery',
        rationale:
          'Weekend movement — optional hike or swim; sets you up for Monday.',
        strengthFocus: 'None.',
        cardio: { kind: 'active_recovery', ...ACTIVE_RECOVERY_BLOCK },
        functional: null,
        core: null,
      }
    case 0:
    default:
      return {
        chipLabel: 'Rest',
        rationale:
          'Rest day — sleep and nutrition do the work.',
        strengthFocus: 'None.',
        cardio: null,
        functional: null,
        core: null,
      }
  }
}

/**
 * Full calendar week (Sunday → Saturday) with cardio, functional, and core baked in.
 * @param {object | null} user
 * @param {Date} [anchorDate]
 */
export function buildCalendarWeekPlan(user, anchorDate = new Date()) {
  const category = normalizeProgramGoal(user?.goal)
  const tier = getExperienceTier(user?.experience_level)
  const start = startOfWeekSunday(anchorDate)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dk = dateKeyLocal(d)
    const dayIndex = d.getDay()
    days.push(buildDayForCategory(category, dayIndex, tier, dk))
  }
  return {
    category,
    tier,
    weekStartDateKey: dateKeyLocal(start),
    days,
  }
}

/**
 * @param {object | null} user
 * @param {Date} [when]
 */
export function getTodayPlan(user, when = new Date()) {
  const dk = dateKeyLocal(when)
  const plan = buildCalendarWeekPlan(user, when)
  return plan.days.find((d) => d.dateKey === dk) || null
}

/**
 * Second weekly HIIT for fat-loss users who want extra conditioning — only if not landing on leg strength day.
 * Exposed for future UI toggles; template uses one HIIT by default.
 */
export function getHiitFrequencyHint(category) {
  if (category === 'fat_loss') return 'Programmed 1× weekly in the template; add a second HIIT only after at least one rest day and not on heavy leg days.'
  if (category === 'muscle') return 'Optional 1× HIIT or hard conditioning weekly — steady cardio can cover additional work.'
  return 'Conditioning frequency scales with goal — see daily plan.'
}
