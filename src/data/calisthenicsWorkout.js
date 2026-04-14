/**
 * Calisthenics-only programs — pull-up bar assumed; progressive skill work by level.
 */

function ex(overrides) {
  return {
    commonMistakes: [],
    ...overrides,
  }
}

const BEGINNER = [
  ex({
    id: 'cal-beg-scap-pulls',
    name: 'Scapular pulls',
    displayName: 'Scapular pulls',
    repRange: [10, 15],
    sets: 3,
    restSeconds: 75,
    description:
      'Hang from a bar with straight arms. Without bending elbows, pull your shoulder blades down and back — think “put them in your back pockets.” You should feel the lats turn on. This teaches real shoulder control before heavy pulling.',
    commonMistakes: ['Shrugging to ears instead of depressing scapula', 'Swinging into reps', 'Bending elbows early'],
    regression: 'Shorter hangs, or chest-supported scap retractions on a bench',
    progression: 'Add slow 3-second lowers after each rep, or move to assisted pull-ups',
    startingWeight: 'Bodyweight — add a slow tempo before load',
    formTip: 'Ribs down, glutes slightly engaged so your low back does not arch.',
  }),
  ex({
    id: 'cal-beg-incline-pushup',
    name: 'Incline push-up',
    displayName: 'Incline push-up',
    repRange: [10, 15],
    sets: 3,
    restSeconds: 75,
    description:
      'Hands on a bench or sturdy box, body in a straight line. Lower chest to edge with elbows tracking ~45°. Press away and lock the plank at the top.',
    commonMistakes: ['Hips sagging', 'Flaring elbows to 90°', 'Piking hips up', 'Half range'],
    regression: 'Higher incline, or wall push-ups',
    progression: 'Lower the incline over weeks, then floor push-ups',
    startingWeight: 'Bodyweight — adjust height, not load',
    formTip: 'Squeeze glutes and quads so the line from head to heel stays rigid.',
  }),
  ex({
    id: 'cal-beg-squat',
    name: 'Tempo squat',
    displayName: 'Tempo squat',
    repRange: [12, 15],
    sets: 3,
    restSeconds: 90,
    description:
      'Feet shoulder-width, toes slightly out. Sit down between hips with knees tracking toes. 3 seconds down, no bounce, drive up with chest tall.',
    commonMistakes: ['Knees caving', 'Heels lifting', 'Collapsing forward', 'Rushing the descent'],
    regression: 'Box squat to a high target, or hold a counter for balance',
    progression: 'Pause squat 1s in the hole, then split squat progressions',
    startingWeight: 'Bodyweight',
    formTip: 'Spread the floor with your feet — think knees out over pinky toes.',
  }),
  ex({
    id: 'cal-beg-assisted-pullup',
    name: 'Band-assisted pull-up',
    displayName: 'Band-assisted pull-up',
    repRange: [6, 10],
    sets: 4,
    restSeconds: 120,
    description:
      'Loop a band on the bar and step or kneel into it for assistance. Start hanging, set shoulders, pull chin over the bar, lower with control.',
    commonMistakes: ['Kicking or kipping for height', 'Neck craning', 'Dropping fast from the top', 'Half reps'],
    regression: 'Heavier band, or jump negatives with slow 3–5s lowering',
    progression: 'Lighter band, then eccentric-only pull-ups',
    startingWeight: 'Band thickness controls difficulty — thinner band = harder',
    formTip: 'Elbows aim toward hips — not flared to the sides.',
  }),
  ex({
    id: 'cal-beg-hollow',
    name: 'Hollow body hold',
    displayName: 'Hollow body hold',
    repRange: [20, 30],
    sets: 3,
    restSeconds: 60,
    description:
      'On your back, press low back into the floor. Lift shoulders and legs slightly, arms overhead. Hold tension — ribs down, quads on.',
    commonMistakes: ['Low back peeling up', 'Holding breath the whole time', 'Neck crunching forward'],
    regression: 'Bent knees hollow, or tuck position',
    progression: 'Rocking hollow, or hollow hang from bar',
    startingWeight: 'Time under tension — add seconds weekly',
    formTip: 'Exhale hard — it makes the abs “grab” the spine.',
  }),
  ex({
    id: 'cal-beg-plank',
    name: 'Forearm plank',
    displayName: 'Forearm plank',
    repRange: [30, 45],
    sets: 3,
    restSeconds: 60,
    description:
      'Forearms down, elbows under shoulders. Body straight from head to heels. Pull elbows toward toes and squeeze glutes.',
    commonMistakes: ['Hips high or sagging', 'Looking up', 'Shrugging shoulders'],
    regression: 'Plank on knees, or short sets with perfect form',
    progression: 'Long-lever plank, or plank shoulder taps',
    startingWeight: 'Bodyweight — build duration before load',
    formTip: 'Push the floor away — shoulder blades should be slightly spread, not collapsed.',
  }),
]

const INTERMEDIATE = [
  ex({
    id: 'cal-int-pullup',
    name: 'Pull-up',
    displayName: 'Pull-up',
    repRange: [5, 10],
    sets: 4,
    restSeconds: 120,
    description:
      'Dead hang, full extension at bottom. Pull until chin clears bar without excessive kip. Lower with control to straight arms.',
    commonMistakes: ['Half range at bottom', 'Excessive arching', 'Forward head', 'Rushing eccentrics'],
    regression: 'Band assist or eccentric-only reps',
    progression: 'Weighted pull-up, or chest-to-bar variations',
    startingWeight: 'Add small load when you can hit clean sets of 8',
    formTip: 'Think “elbows to back pockets” on the way up.',
  }),
  ex({
    id: 'cal-int-dip',
    name: 'Parallel bar dip',
    displayName: 'Parallel bar dip',
    repRange: [6, 12],
    sets: 3,
    restSeconds: 120,
    description:
      'Support yourself on parallel bars, shoulders depressed. Lower until shoulders are below elbows or you hit comfortable depth. Press up without shrugging.',
    commonMistakes: ['Dipping past shoulder tolerance', 'Flared elbows', 'Kipping out of the bottom'],
    regression: 'Bench dip with feet on floor, or band-assisted dip',
    progression: 'Ring dips, or weighted dip',
    startingWeight: 'Bodyweight — add load with a belt when form stays crisp',
    formTip: 'Keep ribs down — do not let the low back turn this into a chest flop.',
  }),
  ex({
    id: 'cal-int-bulgarian',
    name: 'Bulgarian split squat',
    displayName: 'Bulgarian split squat',
    repRange: [8, 12],
    sets: 3,
    restSeconds: 90,
    description:
      'Rear foot elevated on a bench behind you. Front foot far enough forward that the knee can track over the ankle. Lower straight down, drive up through the front heel.',
    commonMistakes: ['Torso collapsing', 'Knee caving', 'Standing too close to bench'],
    regression: 'Split squat with rear toe on floor only',
    progression: 'Slow 3s eccentric, or add a light dumbbell goblet',
    startingWeight: 'Bodyweight first — then hold a single dumbbell at chest',
    formTip: 'If you feel only quad burn in the back leg, move front foot forward.',
  }),
  ex({
    id: 'cal-int-lsit-tuck',
    name: 'L-sit tuck (parallettes or dip bars)',
    displayName: 'L-sit tuck hold',
    repRange: [10, 20],
    sets: 3,
    restSeconds: 90,
    description:
      'Support on bars, press shoulders down. Lift knees toward chest without collapsing the upper back. Hold compression.',
    commonMistakes: ['Shrugging to ears', 'Dumping into shoulder extension', 'Holding breath'],
    regression: 'Knee tucks for reps instead of long holds',
    progression: 'Single-leg L-sit, or hanging knee raise to L',
    startingWeight: 'Hold time — progress seconds before straightening legs',
    formTip: 'Push the bars away — active shoulders protect the joint.',
  }),
  ex({
    id: 'cal-int-inverted-row',
    name: 'Inverted row',
    displayName: 'Inverted row',
    repRange: [8, 12],
    sets: 3,
    restSeconds: 90,
    description:
      'Set a bar in a rack at hip height. Hang underneath, heels on floor, body straight. Pull chest to bar, pause, lower.',
    commonMistakes: ['Hips sagging', 'Pulling with arms only', 'Cutting range short'],
    regression: 'Higher bar angle (more upright body)',
    progression: 'Elevate feet, or add tempo pauses',
    startingWeight: 'Bodyweight — elevate feet before adding vest',
    formTip: 'Squeeze a towel between glutes to keep the line honest.',
  }),
  ex({
    id: 'cal-int-knee-raise',
    name: 'Hanging knee raise',
    displayName: 'Hanging knee raise',
    repRange: [8, 15],
    sets: 3,
    restSeconds: 75,
    description:
      'Hang from bar, set shoulders. Lift knees toward chest without swinging. Control the lower — no slam down.',
    commonMistakes: ['Huge kip', 'Using neck', 'Letting shoulders shrug to ears'],
    regression: 'Captain’s chair knee raises',
    progression: 'Straight leg raises, or toes-to-bar',
    startingWeight: 'Bodyweight',
    formTip: 'Exhale as knees rise — it locks the hollow.',
  }),
]

const ADVANCED = [
  ex({
    id: 'cal-adv-w-pullup',
    name: 'Weighted pull-up',
    displayName: 'Weighted pull-up',
    repRange: [3, 6],
    sets: 5,
    restSeconds: 150,
    description:
      'Use a dip belt or light vest. Same standards as bodyweight — full extension each rep, chin over bar, controlled negative.',
    commonMistakes: ['Shortening range for heavier loads', 'Losing scapular control', 'Ego lifting'],
    regression: 'Drop weight until reps are perfect',
    progression: 'More load, or one-arm assisted work',
    startingWeight: 'Add 2.5–5 kg only when bodyweight sets are strong',
    formTip: 'Treat heavy sets like strength — brace and own each rep.',
  }),
  ex({
    id: 'cal-adv-mu-prog',
    name: 'Muscle-up transition drill',
    displayName: 'Muscle-up transition drill',
    repRange: [3, 6],
    sets: 4,
    restSeconds: 120,
    description:
      'Use low rings or a bar. Practice the turnover from pull to support — band or foot assist is fine. Stop before form breaks.',
    commonMistakes: ['Rushing the catch', 'Chicken-winging the elbows', 'Training through shoulder pinch'],
    regression: 'Jumping muscle-up with slow negative',
    progression: 'Strict muscle-up, then ring muscle-up',
    startingWeight: 'Technique first — low reps, crisp reps',
    formTip: 'Pull the bar to your sternum before you think about sitting over.',
  }),
  ex({
    id: 'cal-adv-pistol',
    name: 'Pistol squat (assisted)',
    displayName: 'Pistol squat',
    repRange: [3, 8],
    sets: 3,
    restSeconds: 120,
    description:
      'Hold a light counterweight or TRX for balance. Sit back on one leg, keep heel down, control depth. Stand without bouncing.',
    commonMistakes: ['Heel lifting', 'Knee caving', 'Collapsing forward'],
    regression: 'Box pistol to high box, or split squat',
    progression: 'No hands, then slow negatives',
    startingWeight: '5–10 lb dumbbell counterweight often helps balance',
    formTip: 'Reach arms forward only as much as needed — hips do the work.',
  }),
  ex({
    id: 'cal-adv-fl-tuck',
    name: 'Front lever tuck hold',
    displayName: 'Front lever tuck hold',
    repRange: [8, 15],
    sets: 4,
    restSeconds: 120,
    description:
      'Hang from bar, set shoulders. Pull hips toward horizontal with knees tucked. Fight to keep elbows straight.',
    commonMistakes: ['Bending arms to fake height', 'Dumping shoulder', 'Holding breath'],
    regression: 'Inverted hang leg raises, or band-assisted lever',
    progression: 'Single leg tuck, then straddle lever progressions',
    startingWeight: 'Hold time — track seconds, not ego',
    formTip: 'Depress scapula first — lever is lat-driven, not bicep.',
  }),
  ex({
    id: 'cal-adv-hs-wall',
    name: 'Wall handstand hold',
    displayName: 'Wall handstand',
    repRange: [20, 45],
    sets: 4,
    restSeconds: 90,
    description:
      'Chest to wall preferred: hands shoulder-width, walk up into a line. Push the floor, ribs in, toes light on wall.',
    commonMistakes: ['Banana back', 'Head hanging', 'Collapsed shoulders'],
    regression: 'Pike or box handstand, or shorter holds',
    progression: 'Freestanding kick-ups, or handstand push-up depth',
    startingWeight: 'Time — add shoulder prep first if wrists complain',
    formTip: 'Grip the floor with fingers — micro-balance starts in the hands.',
  }),
  ex({
    id: 'cal-adv-ttb',
    name: 'Toes to bar',
    displayName: 'Toes to bar',
    repRange: [5, 12],
    sets: 3,
    restSeconds: 90,
    description:
      'From hollow hang, lift toes to touch bar with minimal kip. If strict is not there yet, use small hip pulse but keep control.',
    commonMistakes: ['Giant kip every rep', 'Neck strain', 'Ripping through shoulders'],
    regression: 'Knee raises, or toes-to-eye-level',
    progression: 'Strict reps, then weighted variations',
    startingWeight: 'Bodyweight',
    formTip: 'Shoulders stay active — never hang like a sack.',
  }),
]

const BY_LEVEL = {
  beginner: BEGINNER,
  intermediate: INTERMEDIATE,
  advanced: ADVANCED,
}

export function getCalisthenicsExerciseById(id) {
  for (const lvl of Object.keys(BY_LEVEL)) {
    const found = BY_LEVEL[lvl].find((e) => e.id === id)
    if (found) return { ...found, level: lvl }
  }
  return null
}

export function getCalisthenicsWorkout(levelKey) {
  const key = ['beginner', 'intermediate', 'advanced'].includes(levelKey) ? levelKey : 'beginner'
  return (BY_LEVEL[key] || BY_LEVEL.beginner).map((e, i) => ({
    ...e,
    order: i + 1,
  }))
}

export function buildCalisthenicsListForTrain(levelKey, mod) {
  let level = levelKey
  if (mod?.moderateSwap) {
    if (level === 'advanced') level = 'intermediate'
    else if (level === 'intermediate') level = 'beginner'
  }

  let list = getCalisthenicsWorkout(level).map((ex, i) => ({
    ...ex,
    order: i + 1,
  }))

  if (mod?.excludeExerciseIds?.length) {
    const exclude = new Set(mod.excludeExerciseIds)
    list = list.filter((ex) => !exclude.has(ex.id))
  }

  list = list.map((ex, i) => ({ ...ex, order: i + 1 }))

  if (list.length === 0) {
    list = getCalisthenicsWorkout('beginner').slice(0, 4).map((ex, i) => ({ ...ex, order: i + 1 }))
  }

  return list
}
