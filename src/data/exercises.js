/**
 * Complete exercise database for Beginner, Intermediate, and Advanced levels.
 * Each exercise includes description, mistakes, regression, progression, weight suggestions, and form tip.
 */

export const LEVELS = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
}

const exercises = {
  beginner: [
    {
      id: 'beg-goblet-squat',
      name: 'Goblet Squat',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Hold a dumbbell or kettlebell at your chest like holding a large cup. Stand with feet shoulder-width apart. Lower your body by bending your knees and pushing your hips back, as if sitting into a chair. Go as low as you can while keeping your chest up, then stand back up.',
      commonMistakes: ['Letting knees cave inward', 'Rounding the lower back', 'Not going deep enough or going too deep and losing form', 'Holding breath instead of breathing out as you stand'],
      regression: 'Bodyweight squat with hands on hips, or hold onto a pole for balance',
      progression: 'Increase weight, or try goblet squat with pause at bottom',
      startingWeight: 'Start with 8–12 kg (15–25 lb) or bodyweight if needed',
      formTip: 'Keep your elbows inside your knees at the bottom—this naturally opens your hips.',
    },
    {
      id: 'beg-rdl',
      name: 'Romanian Deadlift',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Hold a dumbbell in each hand in front of your thighs. With a slight bend in your knees, hinge at your hips and push your butt back. Lower the weights along your legs until you feel a stretch in your hamstrings. Squeeze your glutes to stand back up.',
      commonMistakes: ['Rounding the back instead of hinging at hips', 'Bending knees too much (turns into a squat)', 'Letting weights drift away from legs', 'Locking knees at the top'],
      regression: 'Bodyweight hip hinge with hands on hips, or use a resistance band',
      progression: 'Increase weight, or try single-leg RDL',
      startingWeight: 'Start with 5–10 kg (10–20 lb) per hand',
      formTip: 'Think of closing a car door with your hips—push your butt straight back.',
    },
    {
      id: 'beg-db-bench',
      name: 'Dumbbell Bench Press',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Lie on a flat bench with a dumbbell in each hand at shoulder height, palms facing forward. Push the weights up until your arms are straight (but not locked). Lower them slowly back to the start, feeling the chest stretch.',
      commonMistakes: ['Flaring elbows too wide (stresses shoulders)', 'Bouncing weights off chest', 'Lifting hips off bench', 'Not controlling the descent'],
      regression: 'Push-ups from knees, or wall push-ups',
      progression: 'Increase weight, or try dumbbell bench with slight incline',
      startingWeight: 'Start with 4–8 kg (8–15 lb) per hand',
      formTip: 'Keep a slight arch in your lower back—imagine squeezing a pencil between your shoulder blades.',
    },
    {
      id: 'beg-db-row',
      name: 'Dumbbell Row',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Place one knee and hand on a bench. Hold a dumbbell in the other hand, arm hanging straight down. Pull the weight up toward your hip, squeezing your back muscle. Lower slowly and repeat. Switch sides after each set.',
      commonMistakes: ['Rotating the torso instead of keeping it still', 'Shrugging the shoulder instead of pulling with the back', 'Using momentum to swing the weight', 'Pulling elbow too far back (past the body)'],
      regression: 'Inverted row with feet on floor, or resistance band row',
      progression: 'Increase weight, or try chest-supported row',
      startingWeight: 'Start with 5–10 kg (10–20 lb)',
      formTip: 'Pull your elbow toward your back pocket, not your shoulder.',
    },
    {
      id: 'beg-assisted-pushup',
      name: 'Assisted Push-Up',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Start in a plank position with hands on a wall, counter, or elevated surface (the higher, the easier). Lower your chest toward the surface by bending your arms. Push back up to the start. Keep your body in a straight line from head to heels.',
      commonMistakes: ['Sagging hips or piking butt up', 'Flaring elbows out to the sides', 'Not going low enough (chest should nearly touch surface)', 'Holding breath'],
      regression: 'Wall push-ups, or push-ups on a high box',
      progression: 'Lower the surface height, or try standard push-ups on the floor',
      startingWeight: 'Bodyweight only—use wall or box height to adjust difficulty',
      formTip: 'Tuck your elbows about 45 degrees from your body—not straight out, not tucked in tight.',
    },
    {
      id: 'beg-lat-pulldown',
      name: 'Lat Pulldown',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Sit at a lat pulldown machine with knees under the pad. Grasp the bar with hands slightly wider than shoulders. Pull the bar down to your upper chest by squeezing your back. Control the bar back up and repeat.',
      commonMistakes: ['Leaning back too far and using body momentum', 'Pulling the bar behind the neck (hard on shoulders)', 'Shrugging shoulders at the bottom', 'Not pulling elbows down and back'],
      regression: 'Use a resistance band anchored above, or reduce weight significantly',
      progression: 'Increase weight, or try narrow grip variation',
      startingWeight: 'Start with 20–35 kg (45–75 lb) or whatever feels light',
      formTip: 'Think of pulling your elbows to your back pockets, not just moving your hands.',
    },
    {
      id: 'beg-leg-press',
      name: 'Leg Press',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Sit in the leg press with your back flat and feet on the platform, shoulder-width apart. Unlock the safety and lower the platform by bending your knees until they form about 90 degrees. Push through your heels to extend your legs—do not lock your knees at the top.',
      commonMistakes: ['Lowering too deep and rounding the lower back', 'Locking knees at the top', 'Feet too high on platform (hard on back)', 'Pushing through toes instead of heels'],
      regression: 'Reduce weight, or use a smaller range of motion',
      progression: 'Increase weight, or try single-leg press',
      startingWeight: 'Start with 20–40 kg (45–90 lb) total load (excluding sled)',
      formTip: 'Place feet so your knees track over your toes—don\'t let them cave in.',
    },
    {
      id: 'beg-leg-curl',
      name: 'Seated Leg Curl',
      repRange: [12, 20],
      sets: 3,
      restSeconds: 75,
      description:
        'Sit with the pad snug on your ankles. Curl your heels toward your glutes under control. Pause briefly at the top, then lower for a full stretch without letting the stack slam.',
      commonMistakes: ['Lifting hips off the pad', 'Using momentum', 'Cutting range short', 'Pointing toes excessively'],
      regression: 'Lighter weight or single-leg at a time with assistance',
      progression: 'Add a slow 3-second eccentric before increasing load',
      startingWeight: 'Start light — hamstrings fatigue quickly; 15–25 kg is common for beginners',
      formTip: 'Think of pulling your heels to your pockets, not lifting your thighs.',
    },
    {
      id: 'beg-lateral-raise',
      name: 'Dumbbell Lateral Raise',
      repRange: [12, 20],
      sets: 3,
      restSeconds: 60,
      description:
        'Stand tall with dumbbells at your sides, slight bend in elbows. Raise arms out to shoulder height with control — no shrugging. Lower slowly.',
      commonMistakes: ['Swinging the torso', 'Shrugging traps', 'Going too heavy', 'Leading with hands instead of elbows'],
      regression: 'Lean slightly on an incline bench for support, or use cables',
      progression: 'Pause at the top, or try partial ROM drop sets',
      startingWeight: 'Start with 2–6 kg (5–12 lb) per hand',
      formTip: 'Pour water from a jug — slight forward tilt at the top for delt emphasis.',
    },
    {
      id: 'beg-db-shoulder-press',
      name: 'Dumbbell Shoulder Press',
      repRange: [12, 15],
      sets: 3,
      restSeconds: 90,
      description: 'Sit on a bench with back support. Hold a dumbbell in each hand at shoulder height, palms forward. Push the weights straight up until your arms are extended (don\'t lock elbows). Lower slowly back to shoulders.',
      commonMistakes: ['Arching the lower back excessively', 'Pressing weights forward instead of straight up', 'Shrugging shoulders at the top', 'Bouncing weights at the bottom'],
      regression: 'Seated press with lighter weight, or wall slides for mobility first',
      progression: 'Increase weight, or try standing dumbbell press',
      startingWeight: 'Start with 4–8 kg (8–15 lb) per hand',
      formTip: 'Press in a straight line—the weights should travel up and slightly back, not forward.',
    },
  ],
  intermediate: [
    {
      id: 'int-back-squat',
      name: 'Back Squat',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Rest a barbell across your upper back (below the neck, on the traps). Stand with feet shoulder-width apart, toes slightly out. Break at the hips and knees to descend, keeping chest up. Go to parallel or slightly below, then drive through your heels to stand.',
      commonMistakes: ['Good morning pattern—hinging before knees bend', 'Knees caving inward', 'Bar rolling up the neck', 'Cutting depth short'],
      regression: 'Goblet squat or box squat to control depth',
      progression: 'Add weight, or try pause squats or front squat variation',
      startingWeight: 'Start with empty bar (20 kg) or ~50% of bodyweight',
      formTip: 'Screw your feet into the floor—spread the floor apart with your feet to activate glutes.',
    },
    {
      id: 'int-deadlift',
      name: 'Conventional Deadlift',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Stand with feet hip-width apart, bar over mid-foot. Hinge to grip the bar just outside your legs. Set your back flat, chest up. Drive through your heels and extend your hips and knees together to stand. Lower by hinging hips back and bending knees as the bar passes them.',
      commonMistakes: ['Rounding the lower back', 'Bar drifting forward off legs', 'Hips shooting up before chest', 'Not setting the back before the pull'],
      regression: 'Romanian deadlift or trap bar deadlift',
      progression: 'Add weight, or try deficit deadlift for more range',
      startingWeight: 'Start with 60–80 kg (135–175 lb) or ~bodyweight for 8 reps',
      formTip: 'Keep the bar in contact with your legs the entire pull—it should almost scrape your shins.',
    },
    {
      id: 'int-barbell-bench',
      name: 'Barbell Bench Press',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Lie on a flat bench, grip the bar slightly wider than shoulder-width. Unrack and position the bar over your chest. Lower the bar to your mid-chest with control. Press up and slightly back to lockout. Don\'t bounce the bar off your chest.',
      commonMistakes: ['Flaring elbows to 90 degrees', 'Losing tightness in upper back', 'Bouncing the bar', 'Feet not planted on the floor'],
      regression: 'Dumbbell bench press or push-ups',
      progression: 'Add weight, or try close grip or pause bench',
      startingWeight: 'Start with empty bar (20 kg) or ~40% of bodyweight',
      formTip: 'Retract your scapula before unracking—you should feel your upper back on the bench.',
    },
    {
      id: 'int-barbell-row',
      name: 'Barbell Row',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Stand with feet hip-width apart, barbell over mid-foot. Hinge at the hips until your torso is about 45 degrees. Grip the bar and pull it to your lower chest/upper stomach. Lower with control. Keep your back flat throughout.',
      commonMistakes: ['Standing up too much (using legs)', 'Rounding the back', 'Pulling the bar to the belly button', 'Using a jerk to start the pull'],
      regression: 'Dumbbell row or chest-supported row',
      progression: 'Add weight, or try Pendlay row (bar to floor each rep)',
      startingWeight: 'Start with 30–40 kg (65–90 lb) or ~30% of bodyweight',
      formTip: 'Lead with your elbows—they should drive back, not your hands.',
    },
    {
      id: 'int-pullups',
      name: 'Pull-Ups',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Hang from a bar with hands slightly wider than shoulders, palms away. Pull yourself up until your chin clears the bar. Lower with control until arms are fully extended. Avoid kipping or swinging.',
      commonMistakes: ['Incomplete range of motion (not going high or low enough)', 'Shrugging at the top', 'Kipping or swinging', 'Over-gripping and burning out forearms'],
      regression: 'Assisted pull-up machine or band-assisted pull-ups',
      progression: 'Add weight with a belt, or try different grip widths',
      startingWeight: 'Bodyweight; use assistance if needed to hit rep range',
      formTip: 'Start the pull by depressing your scapula—pull your shoulders down and back first.',
    },
    {
      id: 'int-ohp',
      name: 'Overhead Press',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Stand with feet shoulder-width apart, barbell at front rack (resting on shoulders). Brace your core and press the bar straight up. At the top, your head moves forward slightly so the bar finishes over your mid-foot. Lower with control.',
      commonMistakes: ['Excessive lean back (lumbar hyperextension)', 'Pressing the bar forward', 'Not full lockout', 'Losing tightness at the bottom'],
      regression: 'Dumbbell shoulder press or landmine press',
      progression: 'Add weight, or try push press for more load',
      startingWeight: 'Start with empty bar (20 kg) or ~25% of bodyweight',
      formTip: 'Create a straight line from bar to hips—don\'t let the bar drift forward.',
    },
    {
      id: 'int-rdl',
      name: 'Romanian Deadlift',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Same as beginner RDL but with a barbell. Hold the bar in front of your thighs. Hinge at the hips with a slight knee bend. Lower until you feel a hamstring stretch. Drive through the floor and extend your hips to stand.',
      commonMistakes: ['Rounding the back', 'Squatting the weight up', 'Bar drifting away from legs', 'Locking knees at top'],
      regression: 'Dumbbell RDL or single-leg RDL with lighter load',
      progression: 'Add weight, or try stiff-leg deadlift for more stretch',
      startingWeight: 'Start with 40–60 kg (90–135 lb) or ~50% of deadlift max',
      formTip: 'Think of pushing the floor away with your feet while keeping your chest proud.',
    },
    {
      id: 'int-dips',
      name: 'Dips',
      repRange: [8, 12],
      sets: 4,
      restSeconds: 120,
      description: 'Grasp the parallel bars and support yourself with arms straight. Lower your body by bending your elbows until your shoulders are about level with your elbows. Push back up to the start. Lean forward slightly to emphasize chest.',
      commonMistakes: ['Shrugging shoulders (impingement risk)', 'Going too deep for your mobility', 'Flaring elbows out', 'Not controlling the descent'],
      regression: 'Assisted dip machine or bench dips with feet on floor',
      progression: 'Add weight with a dip belt, or try ring dips',
      startingWeight: 'Bodyweight; use assistance if needed',
      formTip: 'Keep your chest up and shoulders back—don\'t let them roll forward.',
    },
  ],
  advanced: [
    {
      id: 'adv-pause-squat',
      name: 'Heavy Back Squat with Pause',
      repRange: [4, 8],
      sets: 4,
      restSeconds: 180,
      description: 'Perform a back squat but pause for 2–3 seconds in the hole (bottom position). This eliminates the stretch reflex and builds strength out of the bottom. Use slightly less weight than your regular squat. Focus on staying tight and breathing.',
      commonMistakes: ['Relaxing in the hole (losing tightness)', 'Bouncing out of the pause', 'Cutting the pause short', 'Letting knees cave during the pause'],
      regression: 'Regular back squat or box squat with pause',
      progression: 'Increase pause length or add weight',
      startingWeight: 'Start with ~75–85% of your regular squat working weight',
      formTip: 'Brace your core and hold your breath during the pause—exhale as you drive up.',
    },
    {
      id: 'adv-deficit-deadlift',
      name: 'Deficit Deadlift',
      repRange: [4, 8],
      sets: 4,
      restSeconds: 180,
      description: 'Stand on a 2–4 inch platform (plate or board) so the bar is lower relative to you. This increases range of motion and strengthens the start of the pull. Use conventional deadlift form. Use 10–15% less weight than your regular deadlift.',
      commonMistakes: ['Rounding the back to reach the bar', 'Not maintaining same form as regular deadlift', 'Using too much weight', 'Platform too high for your mobility'],
      regression: 'Conventional deadlift from floor',
      progression: 'Increase deficit height or add weight',
      startingWeight: 'Start with ~80–90% of your regular deadlift',
      formTip: 'Push your knees out slightly to make room for your torso—this keeps your back flat.',
    },
    {
      id: 'adv-close-grip-bench',
      name: 'Close Grip Bench Press',
      repRange: [4, 8],
      sets: 4,
      restSeconds: 180,
      description: 'Perform a bench press with hands about shoulder-width apart (or slightly closer). Elbows stay closer to your body. This emphasizes triceps and can help your regular bench. Lower to lower chest/sternum.',
      commonMistakes: ['Bringing elbows to the body (should feel uncomfortable)', 'Flaring elbows out', 'Grip too narrow (wrist pain)', 'Not touching chest'],
      regression: 'Regular bench press or dumbbell close grip',
      progression: 'Add weight, or try spoto press (pause an inch above chest)',
      startingWeight: 'Start with ~70–80% of your regular bench',
      formTip: 'Keep your elbows at about 45 degrees—not pinned to your sides, not flared.',
    },
    {
      id: 'adv-weighted-pullups',
      name: 'Weighted Pull-Ups',
      repRange: [4, 8],
      sets: 4,
      restSeconds: 180,
      description: 'Perform pull-ups with additional weight attached via a dip belt or held between your legs. Use the same form as bodyweight pull-ups—full range of motion, controlled tempo. Start conservative with added weight.',
      commonMistakes: ['Cutting range of motion when weight is added', 'Kipping to complete reps', 'Adding too much weight too soon', 'Shrugging at the top'],
      regression: 'Bodyweight pull-ups or assisted weighted pull-ups',
      progression: 'Add weight progressively, or try different grips',
      startingWeight: 'Start with 2.5–5 kg (5–10 lb) added; build from there',
      formTip: 'Initiate the pull with your lats—feel the muscle engage before you move.',
    },
    {
      id: 'adv-pendlay-row',
      name: 'Pendlay Row',
      repRange: [4, 8],
      sets: 4,
      restSeconds: 180,
      description: 'Similar to barbell row but the bar touches the floor between every rep. Torso is more horizontal (~parallel to floor). Explosive pull to the lower chest, then control the bar back to the floor. Reset before each rep.',
      commonMistakes: ['Not letting the bar fully rest on the floor', 'Rounding the back to reach the bar', 'Using momentum instead of pulling', 'Torso angle too upright'],
      regression: 'Regular barbell row or chest-supported row',
      progression: 'Add weight, or try from a deficit',
      startingWeight: 'Start with ~60–70% of your barbell row',
      formTip: 'Reset your breath and back position before each rep—treat each rep as a single.',
    },
    {
      id: 'adv-push-press',
      name: 'Push Press',
      repRange: [4, 8],
      sets: 4,
      restSeconds: 180,
      description: 'From the front rack, use a slight leg drive (dip and drive) to help press the bar overhead. The legs provide momentum; the arms lock it out. This allows heavier loads than strict press. Control the eccentric (lowering).',
      commonMistakes: ['Excessive leg drive (turns into a jerk)', 'Pressing the bar forward', 'Not catching the bar with locked arms', 'Losing tightness in the dip'],
      regression: 'Strict overhead press',
      progression: 'Add weight, or progress to push jerk',
      startingWeight: 'Start with ~10–15% more than your strict press',
      formTip: 'The dip should be straight down and up—minimal forward/back movement.',
    },
    {
      id: 'adv-bulgarian-split-squat',
      name: 'Bulgarian Split Squat',
      repRange: [6, 10],
      sets: 4,
      restSeconds: 120,
      description: 'Stand in a lunge position with your rear foot elevated on a bench. Lower your back knee toward the floor while keeping your front knee over your ankle. Drive through your front heel to stand. Each leg works independently.',
      commonMistakes: ['Front foot too close to the bench', 'Torso too upright', 'Knee caving inward', 'Not enough depth'],
      regression: 'Reverse lunge or split squat with rear foot on floor',
      progression: 'Add dumbbells or barbell, or elevate front foot',
      startingWeight: 'Start with 8–12 kg (15–25 lb) per hand or bodyweight',
      formTip: 'Keep your torso angle consistent—don\'t lean forward as you descend.',
    },
    {
      id: 'adv-rdl-slow-eccentric',
      name: 'Romanian Deadlift with Slow Eccentric',
      repRange: [6, 10],
      sets: 4,
      restSeconds: 120,
      description: 'Perform an RDL but take 3–4 seconds to lower the bar. Control every inch of the descent. The slow eccentric builds hamstring strength and time under tension. Drive up at normal speed.',
      commonMistakes: ['Rounding the back during the slow descent', 'Rushing the last part of the eccentric', 'Using too much weight', 'Not maintaining tension throughout'],
      regression: 'Regular RDL or reduce eccentric tempo to 2 seconds',
      progression: 'Increase tempo to 4–5 seconds or add weight',
      startingWeight: 'Start with ~70–80% of your regular RDL weight',
      formTip: 'Breathe in as you lower—it helps you maintain core stability.',
    },
  ],
}

export function getExercisesByLevel(level) {
  const key = level === 'Complete beginner' ? 'beginner' : level === 'Intermediate' ? 'intermediate' : 'advanced'
  return exercises[key] || exercises.beginner
}

export function getExerciseById(id) {
  for (const level of Object.keys(exercises)) {
    const found = exercises[level].find((e) => e.id === id)
    if (found) return { ...found, level }
  }
  return null
}

/** Flat list of all programmed exercises (for chat / movement library). */
export function getAllExercisesFlat() {
  const out = []
  for (const level of Object.keys(exercises)) {
    if (level === 'beginner' || level === 'intermediate' || level === 'advanced') {
      exercises[level].forEach((e) => {
        if (e?.id) out.push({ ...e, level })
      })
    }
  }
  return out
}

const LOWER_IDS = ['squat', 'rdl', 'deadlift', 'leg-press', 'bulgarian', 'goblet-squat', 'pause-squat', 'deficit-deadlift', 'rdl-slow']

export function getWorkoutProgram(level, daysPerWeek) {
  const allExercises = getExercisesByLevel(level)

  if (daysPerWeek <= 2) {
    const mid = Math.ceil(allExercises.length / 2)
    return [
      { id: 'a', name: 'Session A', exercises: allExercises.slice(0, mid) },
      { id: 'b', name: 'Session B', exercises: allExercises.slice(mid) },
    ]
  }

  if (daysPerWeek >= 3) {
    const lower = allExercises.filter((e) => LOWER_IDS.some((s) => e.id.includes(s)))
    const upper = allExercises.filter((e) => !LOWER_IDS.some((s) => e.id.includes(s)))
    if (upper.length > 0 && lower.length > 0) {
      return [
        { id: 'upper', name: 'Upper Body', exercises: upper },
        { id: 'lower', name: 'Lower Body', exercises: lower },
      ]
    }
  }

  return [{ id: 'full', name: 'Full Body', exercises: allExercises }]
}

export default exercises
