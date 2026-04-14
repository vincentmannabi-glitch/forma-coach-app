/**
 * Home training programs — full coaching copy, progressions, and structure.
 */

function baseEx(overrides) {
  return {
    commonMistakes: [],
    ...overrides,
  }
}

/** @type {import('../utils/homeWorkoutEngine').HomeEquipmentCard[]} */
export const HOME_EQUIPMENT_OPTIONS = [
  {
    id: 'none',
    title: 'No equipment',
    subtitle: 'Bodyweight only',
    detail: 'Complete programs using only your body — no gear required.',
  },
  {
    id: 'bands',
    title: 'Resistance bands',
    subtitle: 'Any bands at home',
    detail: 'Full-body strength with bands — anchor points and tension explained.',
  },
  {
    id: 'basics',
    title: 'Home basics',
    subtitle: 'Dumbbells, bench, pull-up bar',
    detail: 'Commercial-gym quality splits with dumbbell alternatives to barbell lifts.',
  },
  {
    id: 'full',
    title: 'Full home gym',
    subtitle: 'Barbell, rack, cables, rings',
    detail: 'Serious training at home — same intent as a full gym.',
  },
]

/** Program list per equipment (id + label for picker). */
export const HOME_PROGRAM_PICKERS = {
  none: [
    { id: 'fat_loss_circuit', label: 'Fat loss circuit', blurb: '40s work / 20s rest · 4 rounds · max burn' },
    { id: 'muscle_calisthenics', label: 'Muscle building', blurb: 'Progressive calisthenics · tempo and volume' },
    { id: 'mobility_recovery', label: 'Mobility & recovery', blurb: 'Full-body flow · feel better, move better' },
  ],
  bands: [{ id: 'bands_total_gym', label: 'Total band program', blurb: 'Every major pattern — gym replication' }],
  basics: [
    { id: 'db_upper_lower', label: 'Upper / lower split', blurb: '4 days · balanced volume' },
    { id: 'db_ppl', label: 'Push / pull / legs', blurb: 'Classic split · 3–6 days' },
    { id: 'db_full_body_3', label: 'Full body × 3', blurb: 'Three full-body sessions per week' },
  ],
  full: [
    { id: 'full_upper_lower', label: 'Upper / lower', blurb: 'Barbell + accessories' },
    { id: 'full_ppl', label: 'Push / pull / legs', blurb: 'Heavy compounds + isolation' },
  ],
}

function buildCatalog() {
  /** @type {Record<string, Record<string, import('../utils/homeWorkoutEngine').HomeProgramDefinition>>} */
  const out = {
    none: {},
    bands: {},
    basics: {},
    full: {},
  }

  out.none.fat_loss_circuit = {
    id: 'fat_loss_circuit',
    title: 'Fat loss circuit',
    equipmentId: 'none',
    format: 'circuit',
    rounds: 4,
    workSeconds: 40,
    restSeconds: 20,
    intro:
      'Move well, stay tall, and keep transitions quick. 40 seconds on, 20 seconds off. Complete all stations in order — that is one round. Four rounds total. Rest 2–3 minutes between rounds only if needed.',
    stations: [
      baseEx({
        id: 'hw-c-burpee',
        name: 'Burpee',
        description:
          'Hands under shoulders, jump or step back to plank, chest to floor, push up, jump feet to hands, small jump with hands overhead. Soft landings.',
        commonMistakes: ['Sagging hips in plank', 'Skipping range on the push-up', 'Landing hard on the knees'],
        regression: 'Step back instead of jump; hands on a bench or box',
        progression: 'Add a push-up clap at top or tuck jump',
        formTip: 'Breathe: exhale on the way up.',
      }),
      baseEx({
        id: 'hw-c-jump-squat',
        name: 'Jump squat',
        description:
          'Feet shoulder-width, sit hips back, then explode up. Land softly with knees tracking toes. Reset posture each rep.',
        commonMistakes: ['Knees caving', 'Torso folding forward', 'Shallow depth'],
        regression: 'Bodyweight squat with no jump',
        progression: 'Continuous squat jumps or hold light dumbbells when you have equipment',
        formTip: 'Think “quiet feet” on landing.',
      }),
      baseEx({
        id: 'hw-c-mountain-climber',
        name: 'Mountain climber',
        description:
          'Plank position, drive knees toward chest alternately. Hips stay level — no pike.',
        commonMistakes: ['Bouncing hips', 'Hands too far forward', 'Holding breath'],
        regression: 'Slow march with feet on floor',
        progression: 'Cross-body to opposite elbow',
        formTip: 'Press the floor away to keep shoulders stable.',
      }),
      baseEx({
        id: 'hw-c-pushup',
        name: 'Push-up',
        description:
          'Straight line from head to heels. Lower chest to fist height, press up. Elbows ~45° from ribs.',
        commonMistakes: ['Head sagging', 'Elbows flared to 90°', 'Partial range'],
        regression: 'Incline push-up on bench or sofa',
        progression: 'Tempo 3-1-0 or deficit push-up',
        formTip: 'Squeeze glutes to protect the low back.',
      }),
      baseEx({
        id: 'hw-c-alt-lunge',
        name: 'Alternating lunge',
        description:
          'Step forward, drop back knee toward floor, drive through front heel to stand. Alternate legs.',
        commonMistakes: ['Knee over toes collapse', 'Torso leaning too far', 'Short steps'],
        regression: 'Step-back lunge in place',
        progression: 'Jumping or Bulgarian split squat when you add a chair',
        formTip: 'Front shin stays vertical enough to load the glute.',
      }),
      baseEx({
        id: 'hw-c-high-knees',
        name: 'High knees',
        description:
          'Run in place, knees above hip height, quick feet on the balls of the feet.',
        commonMistakes: ['Leaning back', 'Heavy heel strikes', 'Rounded shoulders'],
        regression: 'March in place',
        progression: 'Add light overhead band or faster cadence',
        formTip: 'Pump arms like sprinting.',
      }),
      baseEx({
        id: 'hw-c-plank',
        name: 'Plank hold',
        description:
          'Forearms or hands, ribs down, glutes on. Hold rigid — no sag or pike.',
        commonMistakes: ['Hips high', 'Looking up', 'Holding breath'],
        regression: 'Knees-down plank',
        progression: 'Side plank or long-lever plank',
        formTip: 'Pull elbows toward toes to engage abs.',
      }),
    ],
  }

  out.none.muscle_calisthenics = {
    id: 'muscle_calisthenics',
    title: 'Muscle building — progressive calisthenics',
    equipmentId: 'none',
    format: 'strength',
    intro:
      'Quality reps beat sloppy volume. Rest 90–120s between straight sets. Add difficulty only when every rep looks the same.',
    exercises: [
      baseEx({
        id: 'hw-m-tempo-pushup',
        name: 'Tempo push-up (3-1-0)',
        description:
          '3 seconds lowering, 1 second pause at bottom, explode up. Same line from head to heels.',
        commonMistakes: ['Rushing the negative', 'Cutting depth', 'Breath holding'],
        regression: 'Incline tempo push-up',
        progression: 'Weighted vest or ring push-up when available',
        sets: 4,
        repRange: [6, 10],
        restSeconds: 90,
        formTip: 'Own the bottom — no bounce.',
        loadCue: 'Bodyweight',
      }),
      baseEx({
        id: 'hw-m-pike-pushup',
        name: 'Pike push-up',
        description:
          'Hips high, head toward floor — emphasize shoulders. Hands shoulder-width.',
        commonMistakes: ['Elbows flaring', 'Short range', 'Low back rounding'],
        regression: 'Pike on bench',
        progression: 'Feet elevated pike',
        sets: 3,
        repRange: [8, 12],
        restSeconds: 90,
        formTip: 'Think “triangle pose” with straight line.',
        loadCue: 'Bodyweight',
      }),
      baseEx({
        id: 'hw-m-diamond-pushup',
        name: 'Diamond push-up',
        description:
          'Hands close, index fingers and thumbs touching. Elbows track back toward ribs.',
        commonMistakes: ['Hands too far forward', 'Hips sagging', 'Half reps'],
        regression: 'Hands wider or incline',
        progression: 'Ring dips or weighted dips later',
        sets: 3,
        repRange: [8, 15],
        restSeconds: 90,
        formTip: 'Keep elbows tight — triceps lead.',
        loadCue: 'Bodyweight',
      }),
      baseEx({
        id: 'hw-m-inverted-row',
        name: 'Bodyweight row (table edge)',
        description:
          'Grip a sturdy table edge, body straight, heels on floor. Pull chest to edge. Squeeze shoulder blades.',
        commonMistakes: ['Hips sagging', 'Shrugging neck', 'Jerky reps'],
        regression: 'Higher edge or bent knees',
        progression: 'Feet elevated or one-arm assisted',
        sets: 4,
        repRange: [8, 12],
        restSeconds: 90,
        formTip: 'Initiate the pull by pulling elbows back, not lifting the chin.',
        loadCue: 'Bodyweight',
      }),
      baseEx({
        id: 'hw-m-bss-chair',
        name: 'Bulgarian split squat (chair)',
        description:
          ' Rear foot on chair seat, front foot far enough forward. Vertical torso, knee tracks over toes.',
        commonMistakes: ['Torso folding', 'Knee caving', 'Short stance'],
        regression: 'Split squat without elevation',
        progression: 'Tempo or deficit',
        sets: 3,
        repRange: [8, 12],
        restSeconds: 90,
        formTip: 'Drive through the front heel.',
        loadCue: 'Bodyweight',
      }),
      baseEx({
        id: 'hw-m-sl-glute-bridge',
        name: 'Single-leg glute bridge',
        description:
          'Shoulders on floor, one foot planted, extend hips with glute squeeze. Pause at top.',
        commonMistakes: ['Hyperextending low back', 'Pushing through arms', 'Hip drop'],
        regression: 'Two-leg bridge',
        progression: 'Shoulders elevated or banded abduction',
        sets: 3,
        repRange: [10, 15],
        restSeconds: 75,
        formTip: 'Ribs down — ribs and pelvis move together.',
        loadCue: 'Bodyweight',
      }),
      baseEx({
        id: 'hw-m-hollow',
        name: 'Hollow body hold',
        description:
          'Low back pressed to floor, arms overhead, legs extended. Hold tension — slight shake is fine.',
        commonMistakes: ['Arching off floor', 'Neck crunching', 'Holding breath'],
        regression: 'Tuck hollow',
        progression: 'Rock or hanging hollow',
        sets: 3,
        repRange: [20, 40],
        restSeconds: 60,
        formTip: 'Exhale hard to set ribs down.',
        loadCue: 'Hold seconds (treat reps as seconds)',
      }),
    ],
  }

  out.none.mobility_recovery = {
    id: 'mobility_recovery',
    title: 'Mobility & recovery flow',
    equipmentId: 'none',
    format: 'mobility',
    intro:
      'Breathe slowly through the nose. Never force pain — work up to a comfortable stretch. Rest as needed between moves.',
    exercises: [
      baseEx({
        id: 'hw-mob-hip-90',
        name: 'Hip 90/90',
        description: 'Both legs at 90° angles, rotate from side to side with tall spine.',
        commonMistakes: ['Rounding the back', 'Forcing range', 'Holding breath'],
        regression: 'Hands behind for support',
        progression: 'Lean forward slightly',
        sets: 2,
        repRange: [8, 10],
        restSeconds: 30,
        formTip: 'Lead with the belly button.',
        loadCue: 'Flow — reps are slow switches',
      }),
      baseEx({
        id: 'hw-mob-t-spine',
        name: 'Thoracic rotations',
        description: 'Quadruped or seated, rotate open through mid-back without cranking the neck.',
        commonMistakes: ['Neck leading', 'Low back twisting', 'Rushing'],
        regression: 'Smaller range',
        progression: 'Thread the needle',
        sets: 2,
        repRange: [8, 10],
        restSeconds: 30,
        formTip: 'Eyes follow the hand.',
        loadCue: 'Quality reps',
      }),
      baseEx({
        id: 'hw-mob-wgs',
        name: 'World’s greatest stretch',
        description: 'Lunge position, elbow to instep, rotate to sky, reach back through.',
        commonMistakes: ['Heel lifting', 'Rushing through', 'Losing balance'],
        regression: 'Hand on block',
        progression: 'Add reach overhead',
        sets: 2,
        repRange: [5, 6],
        restSeconds: 45,
        formTip: 'Own each transition.',
        loadCue: 'Per side',
      }),
      baseEx({
        id: 'hw-mob-squat-hold',
        name: 'Deep squat hold',
        description: 'Heels down, knees out, chest up, elbows inside knees.',
        commonMistakes: ['Heels rising', 'Collapsing arches', 'Holding breath'],
        regression: 'Heels on plate or hold support',
        progression: 'Prying squat',
        sets: 2,
        repRange: [30, 60],
        restSeconds: 45,
        formTip: 'Long spine — think “tall” through the crown.',
        loadCue: 'seconds hold',
      }),
      baseEx({
        id: 'hw-mob-dislocate',
        name: 'Shoulder dislocates (band or towel)',
        description: 'Wide grip, slow arc overhead until hands reach hips behind, return.',
        commonMistakes: ['Bending elbows', 'Going too narrow too soon', 'Arching low back'],
        regression: 'Wider grip',
        progression: 'Narrower grip over weeks',
        sets: 2,
        repRange: [10, 15],
        restSeconds: 45,
        formTip: 'This is mobility — not a strength test.',
        loadCue: 'Towel or band',
      }),
      baseEx({
        id: 'hw-mob-pigeon',
        name: 'Pigeon pose',
        description: 'Shin across, back leg long, fold forward gently.',
        commonMistakes: ['Knee pain', 'Torso twisted', 'Forcing fold'],
        regression: 'Figure-4 on back',
        progression: 'Upright pigeon hold',
        sets: 2,
        repRange: [45, 90],
        restSeconds: 30,
        formTip: 'Hips square to the front.',
        loadCue: 'seconds per side',
      }),
      baseEx({
        id: 'hw-mob-couch',
        name: 'Couch stretch',
        description: 'Back knee on pad, shin vertical, squeeze glute, hip forward.',
        commonMistakes: ['Arching low back', 'Knee pain', 'Rushing'],
        regression: 'Foot closer to wall',
        progression: 'Reach overhead',
        sets: 2,
        repRange: [45, 60],
        restSeconds: 30,
        formTip: 'Tuck tailbone slightly.',
        loadCue: 'seconds per side',
      }),
      baseEx({
        id: 'hw-mob-cat-cow',
        name: 'Cat cow',
        description: 'Hands under shoulders, alternate flexion and extension through spine.',
        commonMistakes: ['Moving only neck', 'Rushing', 'Holding breath'],
        regression: 'Smaller range',
        progression: 'Segmental cat-cow',
        sets: 2,
        repRange: [10, 15],
        restSeconds: 30,
        formTip: 'Smooth as water.',
        loadCue: 'Flow',
      }),
      baseEx({
        id: 'hw-mob-child-pose',
        name: 'Child’s pose with lateral reach',
        description: 'Sit to heels, walk hands right and left, breathe into ribs.',
        commonMistakes: ['Neck tension', 'Shoulders hunched', 'Holding breath'],
        regression: 'Hands on block',
        progression: 'Knees wider',
        sets: 2,
        repRange: [6, 8],
        restSeconds: 30,
        formTip: 'Reach long through fingertips.',
        loadCue: 'reaches per side',
      }),
    ],
  }

  const bandAnchor =
    'Anchor heavy: loop band around a squat rack post, closed door (use a door anchor wedge), or a sturdy banister. Light: stand on the band. Shorten the band to increase tension — same movement, harder load. Never let a thin band snap toward your face.'

  out.bands.bands_total_gym = {
    id: 'bands_total_gym',
    title: 'Total band strength',
    equipmentId: 'bands',
    format: 'strength',
    intro: bandAnchor,
    exercises: [
      baseEx({
        id: 'hw-b-squat',
        name: 'Banded squat',
        description:
          'Stand on band, shoulders in loops or hold handles at shoulders. Sit hips back, knees out, stand tall.',
        commonMistakes: ['Knees caving', 'Torso folding', 'Losing band tension at bottom'],
        regression: 'Higher anchor or thicker band',
        progression: 'Pulse at bottom or split stance',
        sets: 4,
        repRange: [10, 15],
        restSeconds: 90,
        formTip: 'Spread the floor with your feet.',
        anchorNotes: 'Stand on band; double the loop for tension.',
        bandTension: 'Medium band for most — use heavy for squats if you are strong.',
      }),
      baseEx({
        id: 'hw-b-rdl',
        name: 'Banded Romanian deadlift',
        description:
          'Stand on band, hinge hips, hands long, stretch band. Feel hamstrings and glutes.',
        commonMistakes: ['Rounding the back', 'Squatting the movement', 'Band drifting forward'],
        regression: 'Softer band or shorter hinge',
        progression: 'Single-leg RDL with band',
        sets: 4,
        repRange: [10, 15],
        restSeconds: 90,
        formTip: 'Bar path vertical — band stays over mid-foot.',
        anchorNotes: 'Stand on band; grip handles low.',
        bandTension: 'Medium to heavy',
      }),
      baseEx({
        id: 'hw-b-row',
        name: 'Banded row',
        description:
          'Anchor chest-level, pull elbows to ribs, squeeze shoulder blades.',
        commonMistakes: ['Shrugging', 'Arching low back', 'Partial range'],
        regression: 'Split stance closer to anchor',
        progression: 'Single arm or staggered stance',
        sets: 4,
        repRange: [12, 15],
        restSeconds: 90,
        formTip: 'Initiate the pull with the back, not the biceps.',
        anchorNotes: 'Door anchor at chest height',
        bandTension: 'Medium',
      }),
      baseEx({
        id: 'hw-b-press',
        name: 'Banded chest press',
        description:
          'Anchor behind you, step forward, press forward, elbows ~45°.',
        commonMistakes: ['Flaring elbows', 'Losing core', 'Hyperextending shoulders'],
        regression: 'Shorter step',
        progression: 'Split stance or single arm',
        sets: 3,
        repRange: [12, 15],
        restSeconds: 90,
        formTip: 'Knuckles toward the ceiling.',
        anchorNotes: 'Behind the back on a post',
        bandTension: 'Medium',
      }),
      baseEx({
        id: 'hw-b-ohp',
        name: 'Banded shoulder press',
        description:
          'Stand on band, press overhead, ribs down, glutes on.',
        commonMistakes: ['Arching hard', 'Pressing in front', 'Shrugging'],
        regression: 'Half kneeling',
        progression: 'Single arm',
        sets: 3,
        repRange: [10, 15],
        restSeconds: 90,
        formTip: 'Finish with biceps by ears.',
        anchorNotes: 'Stand on band; hands in loops',
        bandTension: 'Light to medium',
      }),
      baseEx({
        id: 'hw-b-lateral',
        name: 'Banded lateral raise',
        description:
          'Stand on band, slight lean, raise to shoulder height with soft elbows.',
        commonMistakes: ['Shrugging', 'Swinging', 'Going too high'],
        regression: 'One arm at a time',
        progression: 'Slow tempo',
        sets: 3,
        repRange: [12, 20],
        restSeconds: 60,
        formTip: 'Pour water from a jug — slight lead with thumbs.',
        anchorNotes: 'Stand on band',
        bandTension: 'Light',
      }),
      baseEx({
        id: 'hw-b-pullapart',
        name: 'Banded pull apart',
        description:
          'Hold band shoulder-width, pull to chest height, squeeze rear shoulders.',
        commonMistakes: ['Shrugging', 'Using neck', 'Partial range'],
        regression: 'Longer band',
        progression: 'Overhead pull apart',
        sets: 3,
        repRange: [15, 25],
        restSeconds: 60,
        formTip: 'Think “break the band” with elbows.',
        anchorNotes: 'No anchor — handheld',
        bandTension: 'Light',
      }),
      baseEx({
        id: 'hw-b-curl',
        name: 'Banded bicep curl',
        description:
          'Stand on band, elbows pinned, curl without rocking.',
        commonMistakes: ['Swinging', 'Elbows drifting forward', 'Partial range'],
        regression: 'Wider stance',
        progression: 'Tempo 3-1-0',
        sets: 3,
        repRange: [12, 20],
        restSeconds: 60,
        formTip: 'Squeeze at the top without shrugging.',
        anchorNotes: 'Stand on band',
        bandTension: 'Light to medium',
      }),
      baseEx({
        id: 'hw-b-pushdown',
        name: 'Banded tricep pushdown',
        description:
          'Anchor high, elbows at sides, extend fully.',
        commonMistakes: ['Elbows flaring', 'Torso leaning', 'Partial lockout'],
        regression: 'Step closer to anchor',
        progression: 'Rope or single arm',
        sets: 3,
        repRange: [12, 20],
        restSeconds: 60,
        formTip: 'Split the handles apart at the bottom.',
        anchorNotes: 'Top of door with anchor',
        bandTension: 'Medium',
      }),
      baseEx({
        id: 'hw-b-kickback',
        name: 'Banded glute kickback',
        description:
          'Anchor low, ankle in cuff or loop, extend hip without arching.',
        commonMistakes: ['Arching low back', 'Bending knee', 'Turning out too much'],
        regression: 'Hands on wall',
        progression: 'Straight-leg pulse',
        sets: 3,
        repRange: [12, 20],
        restSeconds: 60,
        formTip: 'Long spine — movement is from the hip.',
        anchorNotes: 'Low anchor behind you',
        bandTension: 'Medium',
      }),
      baseEx({
        id: 'hw-b-clam',
        name: 'Banded clamshell',
        description:
          'Band above knees, side-lying, open top knee without rolling back.',
        commonMistakes: ['Rolling backward', 'Using low back', 'Short range'],
        regression: 'No band',
        progression: 'Band around feet',
        sets: 3,
        repRange: [15, 25],
        restSeconds: 45,
        formTip: 'Heels stay glued.',
        anchorNotes: 'No anchor — band around legs',
        bandTension: 'Mini band',
      }),
    ],
  }

  const dbEx = (name, id, extra) =>
    baseEx({
      id,
      name,
      description: `Commercial-quality dumbbell movement — ${name.toLowerCase()}. Control the eccentric, own the concentric.`,
      commonMistakes: ['Rushing reps', 'Cutting range', 'Losing brace'],
      regression: 'Reduce load or increase incline',
      progression: 'Add load or tempo',
      sets: 4,
      repRange: [8, 12],
      restSeconds: 90,
      formTip: 'Same quality every rep.',
      loadCue: 'Dumbbells — match load to RPE 7–8',
      ...extra,
    })

  out.basics.db_upper_lower = {
    id: 'db_upper_lower',
    title: 'Upper / lower (dumbbells)',
    equipmentId: 'basics',
    format: 'strength',
    intro:
      'Session A: upper push + pull. Session B: lower + core. Rotate A/B across the week. Every exercise matches barbell intent — just with dumbbells and a bench.',
    exercises: [
      dbEx('Dumbbell bench press', 'hw-db-bench', {
        description:
          'Flat bench, dumbbells at shoulder width, elbows ~45°, full range with control.',
      }),
      dbEx('One-arm dumbbell row', 'hw-db-row', {
        description: 'Bench supported, neutral grip, pull to hip without rotating.',
      }),
      dbEx('Dumbbell shoulder press', 'hw-db-press', {
        description: 'Seated with back support, press straight up, lock softly.',
      }),
      dbEx('Dumbbell Romanian deadlift', 'hw-db-rdl', {
        description: 'Hinge with dumbbells, hips back, hamstrings loaded.',
      }),
      dbEx('Goblet squat', 'hw-db-goblet', {
        description: 'Single dumbbell at chest, squat deep with upright torso.',
      }),
      dbEx('Farmer carry', 'hw-db-farmer', {
        description: 'Heavy dumbbells, tall posture, short steps.',
        sets: 3,
        repRange: [30, 50],
        restSeconds: 90,
        loadCue: 'Distance in steps or meters',
      }),
    ],
  }

  out.basics.db_ppl = {
    id: 'db_ppl',
    title: 'Push / pull / legs (dumbbells)',
    equipmentId: 'basics',
    format: 'strength',
    intro: 'Three roles: push day, pull day, leg day. Add a second rotation if you train 6 days.',
    exercises: [
      dbEx('Incline dumbbell press', 'hw-db-incline', {}),
      dbEx('Lateral raise', 'hw-db-lateral', { sets: 3, repRange: [12, 15], restSeconds: 60 }),
      dbEx('Dumbbell skull crusher', 'hw-db-skull', { sets: 3, repRange: [10, 15], restSeconds: 75 }),
      dbEx('Chest-supported row', 'hw-db-csrow', {}),
      dbEx('Hammer curl', 'hw-db-hammer', { sets: 3, repRange: [10, 15], restSeconds: 60 }),
      dbEx('Bulgarian split squat', 'hw-db-bss', { sets: 3, repRange: [8, 12], restSeconds: 90 }),
      dbEx('Romanian deadlift', 'hw-db-rdl2', {}),
    ],
  }

  out.basics.db_full_body_3 = {
    id: 'db_full_body_3',
    title: 'Full body × 3',
    equipmentId: 'basics',
    format: 'strength',
    intro: 'Three full-body sessions weekly — squat pattern, hinge, push, pull, single-leg each day.',
    exercises: [
      dbEx('Goblet squat', 'hw-db-goblet2', {}),
      dbEx('Dumbbell bench press', 'hw-db-bench2', {}),
      dbEx('Dumbbell row', 'hw-db-row2', {}),
      dbEx('Dumbbell RDL', 'hw-db-rdl3', {}),
      dbEx('Half-kneeling single-arm press', 'hw-db-hkpress', { sets: 3, repRange: [8, 12], restSeconds: 75 }),
      dbEx('Plank row', 'hw-db-renrow', { sets: 3, repRange: [8, 12], restSeconds: 75 }),
    ],
  }

  const bb = (name, id, ex) =>
    baseEx({
      id,
      name,
      description: ex.description,
      commonMistakes: ex.commonMistakes || [],
      regression: ex.regression || 'Reduce load',
      progression: ex.progression || 'Add load',
      sets: ex.sets || 4,
      repRange: ex.repRange || [6, 10],
      restSeconds: ex.restSeconds || 120,
      formTip: ex.formTip || 'Brace hard before each rep.',
      loadCue: ex.loadCue || 'Barbell — leave 1–2 reps in reserve',
      ...ex,
    })

  out.full.full_upper_lower = {
    id: 'full_upper_lower',
    title: 'Upper / lower (full home gym)',
    equipmentId: 'full',
    format: 'strength',
    intro: 'Heavy compounds first, accessories after. Rack pins, safety arms, and quality plates — treat it like a commercial gym.',
    exercises: [
      bb('Back squat', 'hw-full-squat', {
        description: 'Bar on upper back, depth you own, drive up with chest tall.',
        commonMistakes: ['Good morning pattern', 'Knees caving', 'Cutting depth'],
      }),
      bb('Barbell bench press', 'hw-full-bench', {
        description: 'Stable arch, bar path to chest, flare through press.',
        commonMistakes: ['Bouncing off chest', 'Flaring early', 'Butt lift'],
      }),
      bb('Barbell row', 'hw-full-bbrow', {
        description: 'Hinge, pull to lower ribs, torso stable.',
        commonMistakes: ['Standing up each rep', 'Yanking', 'Neck craning'],
      }),
      bb('Deadlift', 'hw-full-dead', {
        description: 'Mid-foot bar, flat back, push floor away.',
        commonMistakes: ['Rounded pull', 'Bar forward', 'Hips shooting'],
      }),
      bb('Pull-up', 'hw-full-pullup', {
        description: 'Full hang to chin over bar, control down.',
        commonMistakes: ['Kipping', 'Half reps', 'Shrugging'],
        sets: 4,
        repRange: [5, 12],
        restSeconds: 120,
      }),
    ],
  }

  out.full.full_ppl = {
    id: 'full_ppl',
    title: 'Push / pull / legs (full home gym)',
    equipmentId: 'full',
    format: 'strength',
    intro: 'Rotate sessions. Push: heavy press + accessories. Pull: hinge + row + pull. Legs: squat + hinge + single leg.',
    exercises: [
      bb('Overhead press', 'hw-full-ohp', {
        description: 'Strict press, ribs down, glutes on.',
        commonMistakes: ['Arching hard', 'Pressing forward', 'Leg drive'],
      }),
      bb('Barbell bench press', 'hw-full-bench2', {
        description: 'Same as before — quality reps.',
      }),
      bb('Cable row or ring row', 'hw-full-row', {
        description: 'Horizontal pull, chest tall, full squeeze.',
      }),
      bb('Romanian deadlift', 'hw-full-rdl', {
        description: 'Bar on legs, hinge, feel hamstrings.',
      }),
      bb('Front squat', 'hw-full-front', {
        description: 'Elbows high, upright torso, depth you own.',
      }),
    ],
  }

  return out
}

/**
 * @type {ReturnType<typeof buildCatalog>}
 */
const CATALOG = buildCatalog()

export function getHomeProgramCatalog() {
  return CATALOG
}

export function getHomeProgram(equipmentId, programId) {
  const eq = CATALOG[equipmentId]
  if (!eq) return null
  return eq[programId] || null
}
