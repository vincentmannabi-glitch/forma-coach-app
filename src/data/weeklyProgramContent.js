/**
 * Shared coaching copy for weekly cardio, HIIT, functional, and core blocks.
 * Used by weeklyProgramPlan — same quality bar as strength sessions.
 */

/** @typedef {'beginner'|'intermediate'|'advanced'} Tier */

export const CORE_END_OF_SESSION_WHY =
  'Core work stays at the end of strength sessions (unless today is a dedicated core day) so your trunk is fresh for heavy compounds. Pre-fatiguing your abs before squats, deadlifts, or overhead work reduces spinal stability and raises injury risk — we finish with core once lifting is done.'

export const STEADY_STATE_CARDIO = {
  title: 'Zone 2 steady-state cardio',
  duration: '30–60 minutes total',
  intensity:
    'Target roughly 60–70% of your age-predicted max heart rate (220 − age), or use perceived effort: you can speak in full sentences, but it feels like work — not a casual stroll and not breathless.',
  paceGuide:
    'You should be able to hold a conversation without gasping, yet feel like you are working. If you could sing a song easily, add a little pace; if you can only get out a few words at a time, ease back.',
  modalities: [
    'Brisk walking — incline if indoors',
    'Light jogging — nose-breathing possible most of the time',
    'Cycling — moderate resistance, steady cadence',
    'Rowing — damper moderate, stroke rate controlled',
    'Swimming — continuous laps, easy to moderate effort',
    'Elliptical — smooth strides, no bouncing',
  ],
  why:
    'Low-intensity steady work improves fat oxidation and aerobic base without hammering recovery. It supports your fat-loss goal while keeping you able to hit strength sessions hard.',
  feel: 'Slightly warm, breathing a bit heavier than rest, mentally sustainable for the full duration.',
  tooEasy: 'Add incline, pace, or resistance slightly — you should finish knowing you worked, not that you napped.',
  tooHard: 'Back off until talk-test passes: full sentences, sustainable for 30+ minutes.',
  progression: 'Add 5 minutes weekly up to 60 minutes, or add one short weekly interval finish (optional) once steady feels easy.',
  regression: 'Start at 20–25 minutes, flat terrain, or split into two 15-minute walks.',
}

const HIIT_RATIOS = {
  beginner: { work: 20, rest: 40, label: '20 seconds work / 40 seconds rest' },
  intermediate: { work: 30, rest: 30, label: '30 seconds work / 30 seconds rest' },
  advanced: { work: 40, rest: 20, label: '40 seconds work / 20 seconds rest' },
}

/**
 * @param {Tier} tier
 */
export function buildHiitBlock(tier) {
  const t = HIIT_RATIOS[tier] || HIIT_RATIOS.beginner
  return {
    title: 'HIIT — conditioning',
    duration: '15–25 minutes maximum (including warm-up and cool-down)',
    ratio: t.label,
    structure: [
      'Warm up 5–8 minutes: easy movement, joint circles, 2–3 progressive build rounds.',
      `Main block: ${t.label}. Pick 4–6 movements and rotate for 8–12 rounds depending on energy.`,
      'Cool down 3–5 minutes: walk, easy breathing, light stretching.',
    ],
    exercises: [
      'Sprint intervals — bike, rower, or track (adjust to fitness)',
      'Jump squats or squat jumps',
      'Burpees',
      'Mountain climbers',
      'Battle rope alternatives — fast slams or towel slams if no rope',
      'Box jumps or step-ups with explosive intent (stop if sloppy)',
      'Kettlebell swings — hip snap, flat back',
    ],
    schedulingRules: [
      'Do not schedule HIIT on the same day as heavy squat or deadlift emphasis — neural and leg fatigue collide.',
      'Keep at least one full recovery or upper-only day between HIIT sessions when you run HIIT twice in a week.',
    ],
    why: 'Short, high-output intervals improve conditioning and calorie burn without long steady sessions every day.',
    feel: 'Hard but repeatable — last rep of each interval similar quality to the first.',
    tooEasy: 'Shorten rest slightly within your tier, add rounds, or pick harder movements.',
    tooHard: 'Lengthen rest, reduce rounds, or use lower-impact options (bike sprints vs jumping).',
    progression: 'Add one round per week or move up one experience tier when all rounds look sharp.',
    regression: 'Extra rest between rounds, walking recovery between stations, or fewer total rounds.',
  }
}

export const FUNCTIONAL_TRAINING_BLOCK = {
  title: 'Functional training — carryover to sport',
  duration: '35–50 minutes',
  why:
    'Movement-based work that transfers to acceleration, deceleration, rotation, and single-leg stability on the field or court. This replaces or supplements generic cardio when performance is the goal.',
  exercises: [
    {
      name: 'Med ball throws',
      detail: 'Chest pass, rotational scoop toss, overhead slam — full hip and torso integration; pick a wall or floor target.',
    },
    {
      name: 'Rotational work',
      detail: 'Landmine rotations, cable chops, half-kneeling twists — brace first, rotate through mid-back, not the low back alone.',
    },
    {
      name: 'Single-leg strength',
      detail: 'Split squats, skater squats, single-leg RDL — control knee tracking and balance before adding load.',
    },
    {
      name: 'Explosive jumps',
      detail: 'Broad jumps, tuck jumps, hurdle hops — stick landings; stop when quality drops.',
    },
    {
      name: 'Agility drills',
      detail: 'Lateral shuffles, pro-agility (5-10-5), short cones — crisp foot contacts, eyes up.',
    },
    {
      name: 'Loaded carries',
      detail: 'Farmer carries, suitcase carries — ribs down, steady steps, distance or time.',
    },
    {
      name: 'Sled push alternatives',
      detail: 'Heavy prowler push, or plate pushes on turf / towel slides on floor if no sled.',
    },
    {
      name: 'Band-resisted sprints',
      detail: 'Partner or anchor band behind you — short accelerations, full extension, smooth mechanics.',
    },
  ],
  feel: 'Athletic — you should feel hips, trunk, and feet working together, not isolated burn only.',
  tooEasy: 'Add load, distance, or speed while keeping mechanics clean.',
  tooHard: 'Reduce resistance, shorten distances, or split into more rest between efforts.',
  progression: 'Weekly add one harder variation or one extra set before chasing max speed.',
  regression: 'Slower tempos, shorter distances, bodyweight-only versions of each pattern.',
}

export const SPORT_CONDITIONING_BLOCK = {
  title: 'Sport-specific conditioning',
  duration: '25–40 minutes',
  why:
    'Energy-system work shaped like your sport — repeat efforts, change of direction, and work-to-rest that match competition demands. Pair with technical work from your coach when you have it.',
  structure: [
    'Prep: dynamic warm-up and 2–3 rehearsal reps at submax speed.',
    'Main: repeat intervals or small-sided work that mirror game rhythm (e.g. 15–30s hard / 45–90s easy).',
    'Finish: low-level movement quality — easy jogs, skips, breathing reset.',
  ],
  feel: 'Hard intervals but repeatable — finish with form intact.',
  tooEasy: 'More rounds, shorter rest, or harder movement constraints.',
  tooHard: 'Fewer rounds, longer rest, or lower impact options.',
  progression: 'Increase total hard minutes slowly week to week.',
  regression: 'Longer rests, fewer hard bouts, or skill-only rehearsal.',
}

export const ACTIVE_RECOVERY_BLOCK = {
  title: 'Active recovery',
  duration: '20–45 minutes',
  body: [
    'Easy walk, light bike, or swim — conversation pace.',
    'Mobility flow: hips, thoracic spine, ankles — no painful stretching.',
    'Optional: 10–15 minutes breathing work (nasal, relaxed) to drop stress.',
  ],
  why: 'Promotes blood flow without adding training stress — helps adaptation from harder days.',
}

/** @param {Tier} tier */
export function getCoreTierLabel(tier) {
  if (tier === 'advanced') return 'Advanced core'
  if (tier === 'intermediate') return 'Intermediate core'
  return 'Beginner core'
}

/**
 * @param {Tier} tier
 * @returns {{ title: string; exercises: { name: string; detail: string }[]; breathing: string }}
 */
export function getCoreBlockForTier(tier) {
  if (tier === 'advanced') {
    return {
      title: 'Advanced core',
      breathing:
        'Exhale on the hardest effort (concentric or compression); inhale to expand before the next rep. Keep ribs stacked over pelvis — no flaring.',
      exercises: [
        {
          name: 'Hanging leg raises',
          detail: 'Shoulders packed; posterior pelvic tilt to lift legs; stop if grip or swing breaks down.',
        },
        {
          name: 'Dragon flags',
          detail: 'Full-body tension; lower under control; only as far as you can maintain a straight line.',
        },
        {
          name: 'Ab wheel from standing',
          detail: 'Hips extended; small range first; goal is a straight line from knees or feet through shoulders.',
        },
        {
          name: 'Weighted cable crunches',
          detail: 'Spine flexes from thoracic area; hips stay still; feel upper abs loading.',
        },
        {
          name: 'Decline weighted sit-ups',
          detail: 'Weight high on chest; control down; avoid yanking with hip flexors only.',
        },
        {
          name: 'L-sit progressions',
          detail: 'Parallettes or boxes; tuck first; press shoulders down; hold short, quality sets.',
        },
        {
          name: 'Rotational power — med ball slams',
          detail: 'Hips drive first; ball follows; slam through the floor with intent.',
        },
        {
          name: 'Rotational cable chops',
          detail: 'Wide stance; brace; rotate through trunk; resist pull-back with control.',
        },
      ],
    }
  }
  if (tier === 'intermediate') {
    return {
      title: 'Intermediate core',
      breathing:
        'Brace before you move; steady exhale through the sticking point; do not hold breath until you see stars.',
      exercises: [
        {
          name: 'Hanging knee raises',
          detail: 'Posterior pelvic tilt; control swing; pause briefly at the top.',
        },
        {
          name: 'Cable crunches',
          detail: 'Kneeling or standing; flex the ribcage down toward pelvis; hands near head for leverage.',
        },
        {
          name: 'Ab wheel rollout',
          detail: 'From knees first; maintain neutral spine; stop before hips sag.',
        },
        {
          name: 'Weighted plank',
          detail: 'Plate on mid-back; squeeze glutes; long spine; short holds with perfect form.',
        },
        {
          name: 'Russian twists',
          detail: 'Feet down or up; rotate shoulders; weight tracks in an arc — no neck strain.',
        },
        {
          name: 'Bicycle crunches',
          detail: 'Slow elbows to opposite knee; keep low back gently pressed down.',
        },
        {
          name: 'Dragon flag negatives',
          detail: 'Only the eccentric at first; lower for 3–5 seconds; stop if low back arches.',
        },
      ],
    }
  }
  return {
    title: 'Beginner core',
    breathing:
      'Inhale through the nose to prepare; exhale as you brace or move against gravity — that keeps intra-abdominal pressure helpful, not suffocating.',
    exercises: [
      {
        name: 'Dead bug',
        detail: 'Low back glued down; opposite arm and leg extend; move only as far as ribs stay down.',
      },
      {
        name: 'Bird dog',
        detail: 'Hips level; reach long; pause 1–2 seconds; no rotation in the torso.',
      },
      {
        name: 'Plank hold',
        detail: 'Elbows under shoulders; squeeze glutes; think “long spine.”',
      },
      {
        name: 'Glute bridge',
        detail: 'Ribs down at the top; line from knees to shoulders; no overarching.',
      },
      {
        name: 'Pallof press',
        detail: 'Cable or band at chest height; press straight out; resist rotation — feel obliques light up.',
      },
      {
        name: 'Side plank',
        detail: 'Elbow under shoulder; hips forward; short holds, both sides.',
      },
    ],
  }
}
