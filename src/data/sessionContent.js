/**
 * Session content: warmup, cooldown, core rotations, cardio finishers.
 * Every section explained in plain English — why each movement is included.
 */

/** @typedef {'lower'|'upper'|'full'} SessionFocus */

const WARMUP_LOWER = {
  minutes: '5–10',
  title: 'Warm up',
  subtitle: 'General prep · activation · mobility',
  movements: [
    {
      name: 'General movement',
      detail: '2–3 minutes easy bike, row, or treadmill walk to raise body temperature.',
      why: 'Warms muscles and joints before loading — reduces injury risk and improves movement quality.',
    },
    {
      name: 'Hip flexor activation',
      detail: 'Standing leg swings forward and back, 10 each leg. Keep it controlled.',
      why: 'Lower body sessions demand hip mobility; activation wakes up the flexors before squats and hinges.',
    },
    {
      name: 'Glute activation',
      detail: 'Glute bridge 2×15, or banded lateral walks for 30 seconds each direction.',
      why: 'Ensures glutes fire before heavy squats and deadlifts — prevents compensations and protects the back.',
    },
    {
      name: 'Ankle mobility',
      detail: 'Knee-over-toe rock or ankle circles, 8 each direction per ankle.',
      why: 'Squat depth and knee tracking depend on ankle range — prep them here.',
    },
    {
      name: 'Hip circles',
      detail: 'Standing hip circles 8 each direction per leg, or 90/90 hip switches.',
      why: 'Opens the hips and lubricates the joint before loaded work.',
    },
  ],
}

const WARMUP_UPPER = {
  minutes: '5–10',
  title: 'Warm up',
  subtitle: 'General prep · shoulder health · thoracic mobility',
  movements: [
    {
      name: 'General movement',
      detail: '2–3 minutes arm circles, light band rows, or easy rowing.',
      why: 'Raises temperature and primes the shoulders for pressing and pulling.',
    },
    {
      name: 'Shoulder rotations',
      detail: 'Internal and external rotations with band or light weight, 10 each.',
      why: 'Rotator cuff activation protects the shoulder before heavy bench and overhead work.',
    },
    {
      name: 'Band pull-aparts',
      detail: '2×15–20. Squeeze shoulder blades at the end of each rep.',
      why: 'Activates rear delts and upper back — essential for balanced pressing.',
    },
    {
      name: 'Thoracic extension',
      detail: 'Cat-cow or thoracic rotations on hands and knees, 8 each side.',
      why: 'Upper back mobility supports overhead position and row mechanics.',
    },
    {
      name: 'Scapular activation',
      detail: 'Scapular push-ups or wall slides, 10–12 reps.',
      why: 'Teaches proper scapular control before loaded pressing and pulling.',
    },
  ],
}

const WARMUP_FULL = {
  minutes: '5–10',
  title: 'Warm up',
  subtitle: 'Full-body prep — hips, shoulders, spine',
  movements: [
    {
      name: 'General movement',
      detail: '3–4 minutes easy bike, row, or jog to raise temperature.',
      why: 'Full-body days load everything — start with systemic warmth.',
    },
    {
      name: 'Hip and shoulder prep',
      detail: 'Leg swings 8 each leg, arm circles 8 each direction.',
      why: 'Quick activation for both lower and upper patterns.',
    },
    {
      name: 'Thoracic and hip mobility',
      detail: 'World’s greatest stretch or 90/90 switches, 4 each side.',
      why: 'Combines spine and hip mobility in one flow.',
    },
    {
      name: 'Band pull-aparts + glute bridge',
      detail: '10 pull-aparts, 10 glute bridges.',
      why: 'Activates posterior chain and upper back for the whole session.',
    },
  ],
}

export function getWarmupContent(focus) {
  if (focus === 'lower') return WARMUP_LOWER
  if (focus === 'upper') return WARMUP_UPPER
  return WARMUP_FULL
}

// --- Cooldown / stretching ---

const COOLDOWN_LOWER = {
  minutes: '5–10',
  title: 'Stretching and cool down',
  subtitle: 'Targeted stretches for the muscles you trained',
  stretches: [
    { name: 'Hip flexor stretch', detail: 'Half-kneeling, drive hips forward. Hold 30–45s each side.' },
    { name: 'Hamstring stretch', detail: 'Seated or standing, gentle reach. Hold 30–45s each side.' },
    { name: 'Quad stretch', detail: 'Standing quad pull or kneeling. Hold 30s each side.' },
    { name: 'Glute stretch', detail: 'Figure-four or pigeon. Hold 30–45s each side.' },
    { name: 'Calf stretch', detail: 'Wall or step stretch. Hold 30s each side.' },
  ],
  why: 'Recovery starts here. Stretching improves blood flow and reduces stiffness after heavy lower work.',
}

const COOLDOWN_UPPER = {
  minutes: '5–10',
  title: 'Stretching and cool down',
  subtitle: 'Targeted stretches for the muscles you trained',
  stretches: [
    { name: 'Chest opener', detail: 'Doorway or corner stretch, arms at 90°. Hold 30–45s.' },
    { name: 'Lat stretch', detail: 'Kneeling or hanging lat stretch. Hold 30s each side.' },
    { name: 'Shoulder cross-body', detail: 'Pull arm across chest. Hold 30s each side.' },
    { name: 'Tricep stretch', detail: 'Overhead or behind-back tricep stretch. Hold 30s each side.' },
    { name: 'Neck release', detail: 'Gentle lateral bend and rotation. Hold 15–20s each side.' },
  ],
  why: 'Upper body holds tension; stretching restores length and supports recovery.',
}

const COOLDOWN_FULL = {
  minutes: '5–10',
  title: 'Stretching and cool down',
  subtitle: 'Brief stretches for everything you trained',
  stretches: [
    { name: 'Hip flexor', detail: '30s each side.' },
    { name: 'Hamstring', detail: '30s each side.' },
    { name: 'Chest opener', detail: '30s.' },
    { name: 'Lat stretch', detail: '30s each side.' },
    { name: 'Glute', detail: '30s each side.' },
  ],
  why: 'Full-body days benefit from a quick hit of each major area — recovery starts here.',
}

export function getCooldownContent(focus) {
  if (focus === 'lower') return COOLDOWN_LOWER
  if (focus === 'upper') return COOLDOWN_UPPER
  return COOLDOWN_FULL
}

// --- Core rotations (3–4 exercises per session, different each day) ---

/** Core rotation sets — each covers anti-extension, anti-rotation, anti-lateral flexion, dynamic */
const CORE_ROTATIONS = [
  {
    exercises: [
      { name: 'Dead bug', type: 'anti-extension', detail: 'Low back glued down. Opposite arm and leg extend. 10 each side.' },
      { name: 'Pallof press', type: 'anti-rotation', detail: 'Band or cable at chest. Press out and hold. 8 each side.' },
      { name: 'Side plank', type: 'anti-lateral flexion', detail: '30s each side. Hips forward, no sag.' },
      { name: 'Bird dog', type: 'dynamic', detail: 'Reach and extend. 8 each side with 2s hold.' },
    ],
  },
  {
    exercises: [
      { name: 'Plank hold', type: 'anti-extension', detail: '30–45s. Squeeze glutes, long spine.' },
      { name: 'Russian twist', type: 'anti-rotation / dynamic', detail: 'Controlled rotation. 10 each side.' },
      { name: 'Suitcase carry', type: 'anti-lateral flexion', detail: 'Heavy carry 30s each side.' },
      { name: 'Hollow body hold', type: 'anti-extension', detail: '20–30s. Ribs down, low back pressed.' },
    ],
  },
  {
    exercises: [
      { name: 'Ab wheel rollout', type: 'anti-extension', detail: 'From knees. 8–10 reps. Stop before hips sag.' },
      { name: 'Cable chop', type: 'anti-rotation', detail: 'High to low or low to high. 8 each side.' },
      { name: 'Side plank with dip', type: 'anti-lateral flexion', detail: 'Dip hip and lift. 6 each side.' },
      { name: 'Dead bug progression', type: 'dynamic', detail: 'Add contralateral hold. 8 each side.' },
    ],
  },
  {
    exercises: [
      { name: 'Bear crawl hold', type: 'anti-extension', detail: '20–30s. Hover knees, stay flat.' },
      { name: 'Pallof hold + rotation', type: 'anti-rotation', detail: 'Hold and rotate. 6 each side.' },
      { name: 'Windmill', type: 'anti-lateral flexion', detail: 'Kettlebell or bodyweight. 6 each side.' },
      { name: 'Bicycle crunch', type: 'dynamic', detail: 'Slow, controlled. 10 each side.' },
    ],
  },
]

export function getCoreBlockForSession(sessionIndex) {
  const idx = sessionIndex % CORE_ROTATIONS.length
  return {
    minutes: '10–15',
    exercises: CORE_ROTATIONS[idx].exercises,
    note: 'Every session includes a core block. Anti-extension, anti-rotation, anti-lateral flexion, and one dynamic movement — angles change throughout the week.',
  }
}

// --- Cardio finishers by goal and session type ---

export function getCardioFinisher(goal, sessionFocus, sessionIndex) {
  const g = (goal || '').toLowerCase()
  const isFatLoss = (g.includes('lose') || g.includes('fat') || g.includes('lean')) && !g.includes('balanced')
  const isAthlete = (g.includes('sport') || g.includes('competition')) && !g.includes('balanced')
  const isBalanced = g.includes('balanced')

  if (isAthlete && !isBalanced) {
    return {
      minutes: '10–15',
      title: 'Conditioning integration',
      type: 'athlete',
      content: sessionFocus === 'full'
        ? 'Sprint intervals: 6×20s max effort, 90s rest. Bike, rower, or track.'
        : sessionFocus === 'lower'
          ? 'Complex: 3 rounds — 5 goblet squat, 5 jump squat, 200m run. Rest 2 min between rounds.'
          : 'Circuit: 3 rounds — 10 med ball slams, 10 battle rope slams, 10 burpees. Rest 90s between rounds.',
      why: 'Athletes need work capacity and conditioning woven into strength — not separate.',
    }
  }

  if (isBalanced) {
    return {
      minutes: '8–12',
      title: 'Conditioning finisher',
      type: 'balanced',
      content: 'Moderate cardio — bike, row, or incline walk. Conversation pace with optional short intervals. Supports both fat loss and recovery.',
      why: 'Balanced goals get moderate conditioning — enough to aid fat loss without compromising muscle building or recovery.',
    }
  }

  if (isFatLoss) {
    if (sessionFocus === 'upper') {
      return {
        minutes: '10–20',
        title: 'Cardio finisher',
        type: 'upper_fat_loss',
        content: 'Rowing machine or battle-rope style circuit. 40s work / 20s rest for 4–6 rounds. Keeps heart rate up without fatiguing legs for tomorrow.',
        why: 'Upper days leave legs fresh — rowing and ropes burn calories without stealing from lower-body recovery.',
      }
    }
    if (sessionFocus === 'lower') {
      return {
        minutes: '10–20',
        title: 'Cardio finisher',
        type: 'lower_fat_loss',
        content: 'Cycling or incline walking. Steady effort, 60–70% max HR. Keep it conversational — no extra leg loading.',
        why: 'Lower days already taxed the legs — cycling or walking maintains calorie burn without piling on more squats.',
      }
    }
    return {
      minutes: '10',
      title: 'HIIT finisher',
      type: 'full_fat_loss',
      content: '10 minutes max. 20s on / 40s off. Jump rope, burpees, or bike sprints. 8–10 rounds.',
      why: 'Full-body days get a short, sharp finisher — no longer than 10 minutes to preserve recovery.',
    }
  }

  // Muscle building — minimal cardio
  return {
    minutes: '5–10',
    title: 'Light cardio',
    type: 'muscle',
    content: 'Easy bike or walk. Conversation pace. Aids recovery and blood flow without interfering with muscle building.',
    why: 'Just enough to support cardiovascular health — not enough to blunt gains.',
  }
}
