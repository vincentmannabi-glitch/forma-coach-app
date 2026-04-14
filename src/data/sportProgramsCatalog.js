/**
 * Sport-specific training programs — properly designed systems built around
 * the specific demands of each athletic discipline. Not generic fitness with a sport label.
 *
 * Each program includes: sport-specific warm-up, main training block, accessory work,
 * mobility/flexibility, nutrition guidance, recovery guidance, and how to combine with FORMA strength.
 */

/** @typedef {{ id: string; name: string; detail: string; why?: string }} MovementItem */
/** @typedef {{ id: string; name: string; description: string; sets?: number; repRange?: [number, number]; loadCue?: string; formTip?: string; exerciseId?: string }} SportExercise */
/** @typedef {{ focus: string[]; movements: MovementItem[] }} MobilityBlock */
/** @typedef {{ title: string; movements: MovementItem[] }} WarmupBlock */

/** @typedef {{
 *   id: string
 *   name: string
 *   category: string
 *   description: string
 *   warmup: WarmupBlock
 *   mainExercises: SportExercise[]
 *   accessoryExercises: SportExercise[]
 *   mobility: MobilityBlock
 *   weeklyStructure: string
 *   nutritionGuidance: string
 *   recoveryGuidance: string
 *   combineWithForma: string
 *   commonInjuries?: string[]
 * }} SportProgram */

const m = (id, name, detail, why) => ({ id, name, detail, why })
const ex = (overrides) => ({
  sets: 3,
  repRange: [8, 12],
  ...overrides,
})

/** @type {SportProgram[]} */
export const SPORT_PROGRAMS = [
  // ─── RUNNING: 5K and short distance ─────────────────────────────────────────
  {
    id: 'running_5k',
    name: '5K & short distance runner',
    category: 'running',
    description: 'Speed-focused program. Track intervals, fartlek, tempo runs. Strength for single-leg power, hip drive, ankle stiffness. Plyometrics: bounding, single-leg hops, box jumps.',
    warmup: {
      title: 'Runner warm-up — activation and mobility',
      movements: [
        m('w1', 'Leg swings', 'Forward and lateral, 10 each direction per leg. Prepare hip flexors and abductors.', 'Running demands hip mobility; activation reduces injury risk.'),
        m('w2', 'Ankle circles and calf raises', '8 circles each direction, 10 calf raises. Ankle stiffness supports push-off.', 'Stiff ankle = better energy return; mobility prevents restriction.'),
        m('w3', 'Hip flexor activation', 'Half-kneeling hip flexor stretch with posterior tilt, 30s each side.', 'Tight hip flexors limit stride; prep them before loading.'),
        m('w4', 'Thoracic rotations', 'Seated or quadruped, 8 each side. Spine rotation for arm drive.', 'Upper body rotation supports running economy.'),
        m('w5', 'Light plyometric prep', '4–6 pogo hops, 4–6 A-skips. Prime the nervous system.', 'Prepares tendons for plyometric and speed work.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-5k-bss', name: 'Bulgarian split squat', exerciseId: 'adv-bulgarian-split-squat', sets: 4, repRange: [6, 10], loadCue: 'Heavy — single-leg power transfer.' }),
      ex({ id: 'sp-5k-hip-thrust', name: 'Hip thrust', loadCue: 'Focus on hip drive — glute power for push-off.', sets: 4, repRange: [8, 12] }),
      ex({ id: 'sp-5k-single-leg-rdl', name: 'Single-leg RDL', exerciseId: 'beg-rdl', loadCue: 'Balance and hamstring — ankle stiff, hip hinged.', sets: 3, repRange: [8, 12] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-5k-box-jump', name: 'Box jump', loadCue: 'Explosive — land soft, reset between reps.', sets: 4, repRange: [4, 6] }),
      ex({ id: 'sp-5k-bounding', name: 'Bounding', loadCue: 'Exaggerated running stride — drive knee, push through ankle.', sets: 3, repRange: [20, 30] }),
      ex({ id: 'sp-5k-single-leg-hop', name: 'Single-leg hops', loadCue: 'Forward or lateral — stick the landing.', sets: 3, repRange: [6, 10] }),
      ex({ id: 'sp-5k-pallof', name: 'Pallof press', loadCue: 'Anti-rotation — resist rotation with band or cable.', sets: 3, repRange: [8, 12] }),
      ex({ id: 'sp-5k-dead-bug', name: 'Dead bug', loadCue: 'Anti-extension core — opposite arm/leg.', sets: 3, repRange: [8, 10] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Hamstrings', 'Thoracic spine', 'Ankle dorsiflexion'],
      movements: [
        m('mo1', '90/90 hip stretch', 'Both legs at 90°, switch sides. Hold 30–45s each.'),
        m('mo2', 'Couch stretch', 'Back knee down, drive hip forward. 45s each side.'),
        m('mo3', 'World\'s greatest stretch', 'Lunge, elbow to instep, rotate. 4 each side.'),
        m('mo4', 'Thoracic rotations', 'Quadruped or seated. 8 each side.'),
      ],
    },
    weeklyStructure: '2–3 strength sessions per week. Place strength after easy runs or rest days — never the day before a key speed session. Example: Mon tempo, Tue strength, Wed intervals, Thu easy, Fri rest, Sat long easy, Sun strength.',
    nutritionGuidance: 'Higher carb availability for speed sessions — eat normally or slightly higher carbs the night before intervals. Post-run: 20–30g protein within 2 hours. Hydration critical for short intense efforts.',
    recoveryGuidance: 'Sleep 7–9 hours. Easy days must be easy — heart rate zone 1–2. Limit strength to 2–3×/week so legs can absorb run volume. One full rest day per week.',
    combineWithForma: 'Use FORMA strength sessions in place of the "strength" blocks above — they are designed for runners. Skip FORMA cardio; your running is your cardio. On high-volume weeks, reduce to 1–2 FORMA sessions.',
    commonInjuries: ['IT band syndrome', 'Patellofemoral pain', 'Shin splints', 'Plantar fasciitis', 'Achilles tendinopathy'],
  },

  // ─── RUNNING: Half marathon and marathon ────────────────────────────────────
  {
    id: 'running_marathon',
    name: 'Half marathon & marathon runner',
    category: 'running',
    description: 'Endurance-focused. Long slow distance, lactate threshold, easy aerobic base. Strength for injury prevention: glute medius, hip flexors, tibialis anterior, single-leg stability. Low plyometric volume, high mobility.',
    warmup: {
      title: 'Endurance runner warm-up',
      movements: [
        m('w1', 'Dynamic leg swings', 'Forward and lateral, 10 each. Gentle — you have volume today.'),
        m('w2', 'Ankle mobility', 'Circles and dorsiflexion, 8 each.'),
        m('w3', 'Glute activation', 'Banded clamshells or lateral walks, 10 each side.'),
        m('w4', 'Hip flexor stretch', 'Half-kneeling, 30s each.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-mar-clamshell', name: 'Clamshell', loadCue: 'Glute medius — side-lying, slow and controlled.', sets: 3, repRange: [15, 20] }),
      ex({ id: 'sp-mar-banded-abduction', name: 'Banded hip abduction', loadCue: 'Lateral walks or standing abduction. Glute medius focus.', sets: 3, repRange: [12, 15] }),
      ex({ id: 'sp-mar-tib-raise', name: 'Tibialis raise', loadCue: 'Dorsiflexion against wall or band. Shin splint prevention.', sets: 3, repRange: [15, 20] }),
      ex({ id: 'sp-mar-single-leg-stance', name: 'Single-leg balance', loadCue: '30–45s each leg. Add eyes closed for progression.', sets: 2, repRange: [1, 1] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-mar-squat', name: 'Goblet squat', exerciseId: 'beg-goblet-squat', loadCue: 'Light — form and range, not load.', sets: 3, repRange: [12, 15] }),
      ex({ id: 'sp-mar-rdl', name: 'RDL', exerciseId: 'beg-rdl', loadCue: 'Hamstring and glute — moderate load.', sets: 3, repRange: [10, 12] }),
      ex({ id: 'sp-mar-copenhage', name: 'Copenhagen plank', loadCue: 'Adductor strength — injury prevention.', sets: 2, repRange: [15, 25] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Hamstrings', 'Calves', 'Thoracic spine', 'IT band'],
      movements: [
        m('mo1', 'Hip flexor stretch', 'Couch or half-kneeling. 45–60s each.'),
        m('mo2', 'Hamstring stretch', 'Seated or standing. 45s each.'),
        m('mo3', 'Calf stretch', 'Wall or step. 45s each.'),
        m('mo4', '90/90 hip switch', 'Flow between sides. 6–8 switches.'),
        m('mo5', 'Thoracic rotations', '8 each side.'),
      ],
    },
    weeklyStructure: '1–2 strength sessions. Never the day before a long run or key workout. Example: Mon easy, Tue threshold, Wed strength, Thu easy, Fri rest, Sat long run, Sun strength or rest.',
    nutritionGuidance: 'Carbohydrate periodisation: higher carbs before and after long runs and key sessions. Fuelling during long runs: 30–60g carbs/hour for efforts over 90 min. Recovery: 1.2–1.6 g/kg protein, refuel carbs within 30–60 min post-long run. Sodium and fluids for sweat losses.',
    recoveryGuidance: 'Sleep is non-negotiable — 7–9 hours. Easy runs must stay easy (zone 1–2). One full rest day minimum. Consider compression, ice baths, or contrast after very long runs. Build volume gradually.',
    combineWithForma: 'Use 1–2 FORMA strength sessions per week. Choose lower-body and injury-prevention focus. Skip FORMA cardio entirely. On peak mileage weeks, one FORMA session is enough.',
    commonInjuries: ['IT band syndrome', 'Patellofemoral pain', 'Shin splints', 'Plantar fasciitis', 'Achilles tendinopathy', 'Stress fractures'],
  },

  // ─── RUNNING: Sprinter and track athlete ─────────────────────────────────────
  {
    id: 'running_sprinter',
    name: 'Sprinter & track athlete',
    category: 'running',
    description: 'Power and explosiveness. Short maximal sprints, acceleration mechanics, max velocity, block starts. Heavy strength: squats, deadlifts, hip thrusts, power cleans. Plyometrics: depth jumps, bounding, single-leg explosions. Very low volume, very high intensity. Long recovery.',
    warmup: {
      title: 'Sprinter warm-up — neural activation',
      movements: [
        m('w1', 'Dynamic mobility', 'Leg swings, hip circles, ankle mobility. 5 min.'),
        m('w2', 'Builds', '60–80–100% efforts over 50–60 m. 3–4 reps.'),
        m('w3', 'Activation', 'Banded glute bridges, clamshells. 10 each.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-spr-squat', name: 'Back squat', exerciseId: 'int-back-squat', sets: 4, repRange: [4, 6], loadCue: 'Heavy — 85–90% 1RM. Quality over volume.' }),
      ex({ id: 'sp-spr-deadlift', name: 'Deadlift', exerciseId: 'int-deadlift', sets: 4, repRange: [4, 6], loadCue: 'Heavy — posterior chain power.' }),
      ex({ id: 'sp-spr-hip-thrust', name: 'Hip thrust', sets: 4, repRange: [6, 8], loadCue: 'Heavy — hip extension power.' }),
      ex({ id: 'sp-spr-power-clean', name: 'Power clean', loadCue: 'Explosive — triple extension.', sets: 4, repRange: [3, 5] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-spr-depth-jump', name: 'Depth jump', loadCue: 'Drop from 12–18 in, explode up. 4–6 reps.', sets: 3, repRange: [4, 6] }),
      ex({ id: 'sp-spr-bounding', name: 'Bounding', loadCue: 'Maximum distance per bound. 6–8 bounds.', sets: 3, repRange: [6, 8] }),
      ex({ id: 'sp-spr-single-leg-hop', name: 'Single-leg explosive hop', loadCue: 'Max height or distance. 4–6 each leg.', sets: 3, repRange: [4, 6] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Hamstrings'],
      movements: [
        m('mo1', 'Hip flexor stretch', 'Couch stretch. 45–60s each.'),
        m('mo2', 'Hamstring stretch', '45–60s each.'),
      ],
    },
    weeklyStructure: '2 strength sessions per week, well-spaced from sprint sessions. Never lift heavy the day before competition or max-velocity day. 48–72 hours between intense sessions.',
    nutritionGuidance: 'Adequate protein (1.6–2.2 g/kg) for power and recovery. Carbs around training. Creatine may support power output. Hydration and electrolyte balance.',
    recoveryGuidance: 'Long recovery between sessions — 48–72 hours for nervous system. Sleep 8+ hours. No excessive conditioning. Quality over quantity.',
    combineWithForma: 'Use FORMA for heavy compound sessions. Skip FORMA cardio and high-rep accessory. Keep FORMA to 2 sessions — your sprint work is the priority.',
    commonInjuries: ['Hamstring strain', 'Hip flexor strain', 'Achilles tendinopathy', 'Lower back pain'],
  },

  // ─── SWIMMING: Competitive swimmer ───────────────────────────────────────────
  {
    id: 'swimming_competitive',
    name: 'Competitive swimmer',
    category: 'swimming',
    description: 'Dryland focused on shoulder health, core stability, rotational power. Lat pulldowns, rows, external rotations, serratus activation, hollow holds, rotational med ball throws. No heavy overhead pressing. Thoracic rotation and shoulder internal rotation mobility.',
    warmup: {
      title: 'Swimmer dryland warm-up',
      movements: [
        m('w1', 'Shoulder circles', 'Internal and external. 10 each direction.'),
        m('w2', 'Band pull-aparts', '15–20. Scapular activation.'),
        m('w3', 'Thoracic rotations', '8 each side. Spine mobility for rotation.'),
        m('w4', 'Hip flexor stretch', '30s each. Hip drive in kicks.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-swim-lat', name: 'Lat pulldown', exerciseId: 'beg-lat-pulldown', loadCue: 'Horizontal pull pattern — not behind neck.', sets: 4, repRange: [8, 12] }),
      ex({ id: 'sp-swim-row', name: 'Cable or dumbbell row', exerciseId: 'beg-db-row', loadCue: 'Full retraction. Balance with lat work.', sets: 4, repRange: [8, 12] }),
      ex({ id: 'sp-swim-erc', name: 'External rotation', loadCue: 'Band or cable. Rotator cuff health.', sets: 3, repRange: [15, 20] }),
      ex({ id: 'sp-swim-serratus', name: 'Serratus wall slide', loadCue: 'Scapular protraction along wall.', sets: 3, repRange: [12, 15] }),
      ex({ id: 'sp-swim-hollow', name: 'Hollow body hold', loadCue: '30–45s. Core stability for streamlined position.', sets: 3, repRange: [1, 1] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-swim-medball', name: 'Rotational med ball throw', loadCue: 'Against wall or partner. Rotational power.', sets: 3, repRange: [8, 10] }),
      ex({ id: 'sp-swim-hip-flexor', name: 'Hip flexor strengthening', loadCue: 'Hanging leg raise or reverse hyper. Kick power.', sets: 3, repRange: [10, 15] }),
    ],
    mobility: {
      focus: ['Thoracic rotation', 'Shoulder internal rotation', 'Hip flexors', 'Ankle plantarflexion'],
      movements: [
        m('mo1', 'Thoracic rotations', 'Thread the needle, seated rotation. 8 each side.'),
        m('mo2', 'Sleeper stretch', 'Shoulder internal rotation. 30s each.'),
        m('mo3', 'Doorway pec stretch', '30s. Counter rounded shoulders.'),
        m('mo4', 'Ankle mobility', 'Plantarflexion for kick. 8 each.'),
      ],
    },
    weeklyStructure: '2–3 dryland sessions. Place after swim or on easy days. Never heavy dryland the morning of a key swim session.',
    nutritionGuidance: 'High calorie needs — swimming burns significant energy. Protein 1.6–2.0 g/kg. Carbs for sessions. Hydration — you may not feel sweat but you lose fluid.',
    recoveryGuidance: 'Shoulder care is priority. Ice or contrast after heavy swimming. Sleep 8+ hours. Monitor shoulder fatigue.',
    combineWithForma: 'Use FORMA for pulling and core. Avoid FORMA overhead pressing — use horizontal press or skip. FORMA cardio optional; swimming is primary.',
    commonInjuries: ['Swimmer\'s shoulder', 'Impingement', 'Rotator cuff strain', 'Lower back pain'],
  },

  // ─── SWIMMING: Triathlete ───────────────────────────────────────────────────
  {
    id: 'swimming_triathlete',
    name: 'Triathlete',
    category: 'swimming',
    description: 'Supports running, cycling, swimming without causing fatigue that compromises technique. Lower volume strength, higher frequency. Injury prevention and power transfer. Nutrition for multiple daily sessions and brick workouts.',
    warmup: {
      title: 'Triathlete strength warm-up',
      movements: [
        m('w1', 'Full-body dynamic', 'Leg swings, arm circles, thoracic rotations. 5 min.'),
        m('w2', 'Hip and glute activation', 'Banded walks, glute bridges. 10 each.'),
        m('w3', 'Shoulder prep', 'Band pull-aparts, shoulder circles.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-tri-squat', name: 'Goblet or back squat', exerciseId: 'beg-goblet-squat', loadCue: 'Moderate — not to failure. Support all three disciplines.', sets: 3, repRange: [10, 12] }),
      ex({ id: 'sp-tri-rdl', name: 'RDL', exerciseId: 'beg-rdl', loadCue: 'Posterior chain — running and cycling.', sets: 3, repRange: [10, 12] }),
      ex({ id: 'sp-tri-row', name: 'Row', exerciseId: 'beg-db-row', loadCue: 'Swim and bike posture.', sets: 3, repRange: [10, 12] }),
      ex({ id: 'sp-tri-core', name: 'Pallof press', loadCue: 'Anti-rotation — transfer across sports.', sets: 3, repRange: [10, 12] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-tri-clam', name: 'Clamshell', loadCue: 'Glute medius — injury prevention.', sets: 2, repRange: [15, 20] }),
      ex({ id: 'sp-tri-serratus', name: 'Serratus activation', loadCue: 'Wall slides or protraction. Shoulder health.', sets: 2, repRange: [12, 15] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Thoracic spine', 'Hamstrings', 'Shoulders'],
      movements: [
        m('mo1', 'World\'s greatest stretch', '4 each side.'),
        m('mo2', 'Hip flexor stretch', '45s each. Cycling and running both shorten them.'),
        m('mo3', 'Thoracic rotations', '8 each.'),
      ],
    },
    weeklyStructure: '2 strength sessions. Mid-week and weekend, away from key bike/run bricks. Keep sessions under 45 min.',
    nutritionGuidance: 'Multiple daily sessions — fuel each. Carbs before and during long bricks. Recovery nutrition within 30–60 min. Sodium for sweat. Practice race-day fuelling in training.',
    recoveryGuidance: 'Sleep 7–9 hours. Easy days easy. Build volume gradually. Monitor fatigue across all three sports.',
    combineWithForma: 'FORMA fits well — use 2 sessions. Skip FORMA cardio. Prioritise exercises that support all three disciplines without adding bulk.',
    commonInjuries: ['IT band syndrome', 'Knee pain', 'Swimmer\'s shoulder', 'Lower back pain', 'Plantar fasciitis'],
  },

  // ─── TRACK & FIELD: Jumpers ─────────────────────────────────────────────────
  {
    id: 'track_jumpers',
    name: 'Jumpers (high, long, triple)',
    category: 'track_field',
    description: 'Explosive lower body power. Plyometric progression: broad jumps → depth jumps → reactive bounding. Approach run mechanics. Strength: power cleans, Bulgarian split squats, single-leg RDL, hip thrusts. Flexibility for approach and takeoff.',
    warmup: {
      title: 'Jumper warm-up',
      movements: [
        m('w1', 'Dynamic mobility', 'Leg swings, hip circles, ankle.'),
        m('w2', 'Build-up runs', '60–80% over 30–40 m. Approach mechanics.'),
        m('w3', 'Low-level plyos', 'Skip, pogo, A-skip. Prime the system.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-jump-power-clean', name: 'Power clean', loadCue: 'Explosive triple extension.', sets: 4, repRange: [3, 5] }),
      ex({ id: 'sp-jump-bss', name: 'Bulgarian split squat', exerciseId: 'adv-bulgarian-split-squat', loadCue: 'Single-leg power.', sets: 4, repRange: [6, 8] }),
      ex({ id: 'sp-jump-single-leg-rdl', name: 'Single-leg RDL', loadCue: 'Balance and posterior chain.', sets: 3, repRange: [8, 10] }),
      ex({ id: 'sp-jump-hip-thrust', name: 'Hip thrust', loadCue: 'Hip extension power.', sets: 4, repRange: [6, 8] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-jump-broad', name: 'Broad jump', loadCue: 'Max distance. 4–6 reps.', sets: 3, repRange: [4, 6] }),
      ex({ id: 'sp-jump-depth', name: 'Depth jump', loadCue: '12–18 in box. Explode up. 4–6 reps.', sets: 3, repRange: [4, 6] }),
      ex({ id: 'sp-jump-bounding', name: 'Reactive bounding', loadCue: 'Rhythm and stiffness. 6–8 bounds.', sets: 3, repRange: [6, 8] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Hamstrings', 'Hip internal/external rotation'],
      movements: [
        m('mo1', '90/90 hip stretch', '30–45s each.'),
        m('mo2', 'Couch stretch', '45s each.'),
        m('mo3', 'Hamstring stretch', '45s each.'),
      ],
    },
    weeklyStructure: '2–3 strength sessions. Plyometrics 2×/week, separate from max strength or after. Approach work is technical — fresh for it.',
    nutritionGuidance: 'Power demands adequate carbs and protein. 1.6–2.0 g/kg protein. Fuel before and after key sessions.',
    recoveryGuidance: 'Plyometrics are demanding — 48–72 hours between high-intensity jump sessions. Sleep 8+ hours.',
    combineWithForma: 'Use FORMA for heavy lower body. Add plyometrics as accessory. Skip FORMA cardio.',
    commonInjuries: ['Patellar tendinopathy', 'Hip flexor strain', 'Lower back pain', 'Knee pain'],
  },

  // ─── TRACK & FIELD: Throwers ────────────────────────────────────────────────
  {
    id: 'track_throwers',
    name: 'Throwers (shot, discus, javelin, hammer)',
    category: 'track_field',
    description: 'Rotational power. Upper body strength. Core anti-rotation and rotational power. Medicine ball throws. Olympic lift variations. Heavy strength. Flexibility for throwing range of motion.',
    warmup: {
      title: 'Thrower warm-up',
      movements: [
        m('w1', 'Thoracic rotations', '8 each side. Rotation is key.'),
        m('w2', 'Hip mobility', '90/90, leg swings.'),
        m('w3', 'Shoulder mobility', 'Dislocates, circles.'),
        m('w4', 'Light med ball throws', 'Rotational and overhead.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-throw-squat', name: 'Back squat', exerciseId: 'int-back-squat', loadCue: 'Heavy — base for power.', sets: 4, repRange: [4, 6] }),
      ex({ id: 'sp-throw-deadlift', name: 'Deadlift', exerciseId: 'int-deadlift', loadCue: 'Heavy posterior chain.', sets: 4, repRange: [4, 6] }),
      ex({ id: 'sp-throw-clean', name: 'Power clean / clean and jerk', loadCue: 'Explosive total body.', sets: 4, repRange: [3, 5] }),
      ex({ id: 'sp-throw-bench', name: 'Bench press', exerciseId: 'int-barbell-bench', loadCue: 'Upper body strength.', sets: 4, repRange: [6, 8] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-throw-medball-rot', name: 'Rotational med ball throw', loadCue: 'Max power. 6–8 each side.', sets: 3, repRange: [6, 8] }),
      ex({ id: 'sp-throw-pallof', name: 'Pallof press', loadCue: 'Anti-rotation. 10 each side.', sets: 3, repRange: [10, 12] }),
      ex({ id: 'sp-throw-ohp', name: 'Overhead press', exerciseId: 'int-ohp', loadCue: 'Shoulder strength.', sets: 3, repRange: [6, 8] }),
    ],
    mobility: {
      focus: ['Thoracic rotation', 'Hip rotation', 'Shoulder mobility'],
      movements: [
        m('mo1', 'Thoracic rotations', '8 each.'),
        m('mo2', '90/90 hip', '30s each.'),
        m('mo3', 'Shoulder dislocates', '10 reps.'),
      ],
    },
    weeklyStructure: '3–4 strength sessions. Heavy work separated by 48 hours. Med ball and throws can be more frequent.',
    nutritionGuidance: 'High calorie and protein for size and strength. 1.8–2.2 g/kg protein. Adequate carbs for heavy sessions.',
    recoveryGuidance: 'Heavy loading demands recovery. Sleep 8+ hours. Manage volume.',
    combineWithForma: 'FORMA provides structure. Add throws-specific med ball work. Use FORMA heavy compounds.',
    commonInjuries: ['Lower back strain', 'Rotator cuff', 'Elbow pain', 'Hip impingement'],
  },

  // ─── TRACK & FIELD: Pole vault ───────────────────────────────────────────────
  {
    id: 'track_pole_vault',
    name: 'Pole vault',
    category: 'track_field',
    description: 'Combined jumper and gymnast demands. Upper body pulling strength. Core strength. Speed. Plyometrics. Gymnastics strength for inversion at top of vault.',
    warmup: {
      title: 'Pole vault warm-up',
      movements: [
        m('w1', 'Dynamic mobility', 'Full body.'),
        m('w2', 'Shoulder prep', 'Circles, band work.'),
        m('w3', 'Hip and spine mobility', 'Rotation and flexion.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-pv-pullup', name: 'Weighted pull-up', exerciseId: 'adv-weighted-pullups', loadCue: 'Pulling power.', sets: 4, repRange: [5, 8] }),
      ex({ id: 'sp-pv-hip-thrust', name: 'Hip thrust', loadCue: 'Hip extension for drive.', sets: 4, repRange: [6, 8] }),
      ex({ id: 'sp-pv-core', name: 'Hanging leg raise / L-sit', loadCue: 'Core and inversion strength.', sets: 3, repRange: [8, 12] }),
      ex({ id: 'sp-pv-squat', name: 'Back squat', exerciseId: 'int-back-squat', loadCue: 'Leg drive.', sets: 4, repRange: [4, 6] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-pv-box-jump', name: 'Box jump', loadCue: 'Explosive. 4–6 reps.', sets: 3, repRange: [4, 6] }),
      ex({ id: 'sp-pv-medball', name: 'Med ball slams', loadCue: 'Power transfer.', sets: 3, repRange: [6, 8] }),
    ],
    mobility: {
      focus: ['Shoulders', 'Thoracic spine', 'Hip flexors'],
      movements: [
        m('mo1', 'Shoulder mobility', 'Dislocates, sleeper stretch.'),
        m('mo2', 'Thoracic extension', 'Cat-cow, rotations.'),
        m('mo3', 'Hip flexor stretch', 'Couch stretch.'),
      ],
    },
    weeklyStructure: '2–3 strength, 2 technical vault sessions. Plyometrics 1–2×. Gymnastics work integrated.',
    nutritionGuidance: 'Power and strength — adequate protein and carbs. 1.6–2.0 g/kg protein.',
    recoveryGuidance: 'Technical and power demands — recovery between intense sessions.',
    combineWithForma: 'FORMA for pulling and lower body. Add gymnastics progressions (skin the cat, etc.) as appropriate.',
    commonInjuries: ['Shoulder impingement', 'Lower back strain', 'Hip flexor strain'],
  },

  // ─── TRACK & FIELD: Hurdlers ────────────────────────────────────────────────
  {
    id: 'track_hurdlers',
    name: 'Hurdlers',
    category: 'track_field',
    description: 'Sprint speed plus flexibility. Hip flexor mobility. Single-leg power. Hurdle-specific drills — lead leg and trail leg mechanics. Sprint intervals with hurdle work.',
    warmup: {
      title: 'Hurdler warm-up',
      movements: [
        m('w1', 'Dynamic mobility', 'Leg swings — emphasis on hip flexor and hamstring.'),
        m('w2', 'Hurdle drills', 'Walk-over, lead leg, trail leg.'),
        m('w3', 'Builds', '60–80% over hurdles.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-hurdle-squat', name: 'Back squat', exerciseId: 'int-back-squat', loadCue: 'Power base.', sets: 4, repRange: [4, 6] }),
      ex({ id: 'sp-hurdle-single-leg', name: 'Single-leg work', loadCue: 'BSS or split squat. Trail/lead leg strength.', sets: 3, repRange: [8, 10] }),
      ex({ id: 'sp-hurdle-hip-thrust', name: 'Hip thrust', loadCue: 'Hip drive.', sets: 4, repRange: [6, 8] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-hurdle-bounding', name: 'Bounding', loadCue: 'Exaggerated stride. 6–8.', sets: 3, repRange: [6, 8] }),
      ex({ id: 'sp-hurdle-hurdle-hop', name: 'Hurdle hops', loadCue: 'Over low hurdles. Quick turnover.', sets: 3, repRange: [6, 8] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Hamstrings', 'Hip internal rotation'],
      movements: [
        m('mo1', 'Hip flexor stretch', 'Couch. 45s each.'),
        m('mo2', 'Hamstring stretch', '45s each.'),
        m('mo3', '90/90 hip', '30s each.'),
      ],
    },
    weeklyStructure: '2 strength, 2–3 hurdle technique, sprint work. Flexibility daily.',
    nutritionGuidance: 'Sprint and power nutrition. Adequate protein and carbs.',
    recoveryGuidance: 'Hip flexors and hamstrings take a beating — mobility and recovery prioritised.',
    combineWithForma: 'FORMA for strength. Skip cardio. Add hurdle drills separately.',
    commonInjuries: ['Hip flexor strain', 'Hamstring strain', 'Hip flexor tendinopathy'],
  },

  // ─── CYCLING: Road and endurance ─────────────────────────────────────────────
  {
    id: 'cycling_road',
    name: 'Road cyclist & endurance cyclist',
    category: 'cycling',
    description: 'Lower body strength: quad power and hip extension. Single-leg work for asymmetries. Core stability. Minimal upper body. Stretching: hip flexors and lower back. Nutrition for multi-hour efforts.',
    warmup: {
      title: 'Cyclist warm-up',
      movements: [
        m('w1', 'Hip circles', '8 each direction. Open hips after riding.'),
        m('w2', 'Glute activation', 'Banded bridges or clamshells. 10 each.'),
        m('w3', 'Cat-cow', 'Spine mobility. 8 reps.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-cyc-squat', name: 'Back squat or leg press', exerciseId: 'int-back-squat', loadCue: 'Quad power. Moderate-heavy.', sets: 4, repRange: [6, 10] }),
      ex({ id: 'sp-cyc-rdl', name: 'RDL', exerciseId: 'beg-rdl', loadCue: 'Hip extension. Hamstring balance.', sets: 4, repRange: [8, 12] }),
      ex({ id: 'sp-cyc-single-leg', name: 'Single-leg press or split squat', loadCue: 'Address cycling asymmetries.', sets: 3, repRange: [8, 12] }),
      ex({ id: 'sp-cyc-core', name: 'Dead bug / plank', loadCue: 'Core stability — aero position.', sets: 3, repRange: [10, 15] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-cyc-clam', name: 'Clamshell', loadCue: 'Glute medius. 15 each side.', sets: 2, repRange: [15, 20] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Lower back', 'Hamstrings', 'Glutes'],
      movements: [
        m('mo1', 'Hip flexor stretch', 'Critical — cycling shortens them. 60s each.'),
        m('mo2', 'Pigeon stretch', 'Glute and hip. 45s each.'),
        m('mo3', 'Lower back stretch', 'Child\'s pose, cat-cow.'),
        m('mo4', 'Hamstring stretch', '45s each.'),
      ],
    },
    weeklyStructure: '1–2 strength sessions. Off the bike or after easy rides. Never before key sessions.',
    nutritionGuidance: 'Multi-hour efforts: 60–90g carbs/hour. Train the gut. Recovery: carbs + protein within 30–60 min. Electrolytes for long rides.',
    recoveryGuidance: 'Hip flexors and lower back get very tight — stretch daily. Sleep 7–9 hours. Easy days easy.',
    combineWithForma: 'FORMA lower body and core. Skip upper body focus. No FORMA cardio.',
    commonInjuries: ['Lower back pain', 'Knee pain', 'IT band', 'Neck pain', 'Saddle sores'],
  },

  // ─── CYCLING: Mountain bike and criterium ────────────────────────────────────
  {
    id: 'cycling_mtb',
    name: 'Mountain biker & criterium racer',
    category: 'cycling',
    description: 'More upper body than road for bike handling. Explosive lower body for sprints and climbs. Core stability for rough terrain. Plyometrics for explosive pedalling.',
    warmup: {
      title: 'MTB/Crit warm-up',
      movements: [
        m('w1', 'Dynamic mobility', 'Hips, spine, shoulders.'),
        m('w2', 'Activation', 'Glutes, core.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-mtb-squat', name: 'Squat', exerciseId: 'int-back-squat', loadCue: 'Power for climbs and sprints.', sets: 4, repRange: [6, 8] }),
      ex({ id: 'sp-mtb-deadlift', name: 'Deadlift', exerciseId: 'int-deadlift', loadCue: 'Posterior chain.', sets: 4, repRange: [6, 8] }),
      ex({ id: 'sp-mtb-row', name: 'Row', exerciseId: 'beg-db-row', loadCue: 'Upper back for handling.', sets: 3, repRange: [8, 12] }),
      ex({ id: 'sp-mtb-core', name: 'Pallof press', loadCue: 'Anti-rotation for rough terrain.', sets: 3, repRange: [10, 12] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-mtb-box-jump', name: 'Box jump', loadCue: 'Explosive. 4–6 reps.', sets: 3, repRange: [4, 6] }),
      ex({ id: 'sp-mtb-pushup', name: 'Push-up', loadCue: 'Upper body for bike handling.', sets: 3, repRange: [10, 15] }),
    ],
    mobility: {
      focus: ['Hip flexors', 'Lower back', 'Thoracic spine'],
      movements: [
        m('mo1', 'Hip flexor stretch', '60s each.'),
        m('mo2', 'Thoracic rotations', '8 each.'),
      ],
    },
    weeklyStructure: '2 strength sessions. Balance with riding volume.',
    nutritionGuidance: 'Higher intensity — carb availability for hard efforts. Recovery nutrition.',
    recoveryGuidance: 'Impact and intensity — adequate recovery. Stretch hip flexors.',
    combineWithForma: 'FORMA fits — add plyometrics. Full body with upper body emphasis.',
    commonInjuries: ['Lower back pain', 'Knee pain', 'Shoulder', 'Wrist'],
  },

  // ─── ROWING ─────────────────────────────────────────────────────────────────
  {
    id: 'rowing',
    name: 'Rowing',
    category: 'rowing',
    description: 'Full body power endurance. Hip hinge: deadlifts, RDL, good mornings. Vertical pull: weighted pull-ups, lat pulldowns. Horizontal pull: barbell rows, cable rows. Core anti-rotation and flexion. Leg drive: squats, leg press. Thoracic extension and hamstring mobility for catch position.',
    warmup: {
      title: 'Rower warm-up',
      movements: [
        m('w1', 'Thoracic extension', 'Cat-cow, extension over foam roller. Catch position prep.'),
        m('w2', 'Hamstring mobility', 'Dynamic stretch. 8 each leg.'),
        m('w3', 'Hip hinge prep', 'Bodyweight RDL. 10 reps.'),
        m('w4', 'Lat activation', 'Band pull-aparts. 15 reps.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-row-deadlift', name: 'Deadlift', exerciseId: 'int-deadlift', loadCue: 'Hip hinge power.', sets: 4, repRange: [4, 8] }),
      ex({ id: 'sp-row-rdl', name: 'RDL', exerciseId: 'int-rdl', loadCue: 'Hamstring and hip.', sets: 4, repRange: [8, 12] }),
      ex({ id: 'sp-row-pullup', name: 'Weighted pull-up', exerciseId: 'adv-weighted-pullups', loadCue: 'Vertical pull.', sets: 4, repRange: [5, 10] }),
      ex({ id: 'sp-row-bbrow', name: 'Barbell row', exerciseId: 'int-barbell-row', loadCue: 'Horizontal pull.', sets: 4, repRange: [6, 10] }),
      ex({ id: 'sp-row-squat', name: 'Back squat', exerciseId: 'int-back-squat', loadCue: 'Leg drive.', sets: 4, repRange: [6, 10] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-row-pallof', name: 'Pallof press', loadCue: 'Anti-rotation. 10 each side.', sets: 3, repRange: [10, 12] }),
      ex({ id: 'sp-row-gm', name: 'Good morning', loadCue: 'Hip hinge endurance.', sets: 3, repRange: [8, 12] }),
    ],
    mobility: {
      focus: ['Thoracic extension', 'Hamstrings', 'Hip flexors'],
      movements: [
        m('mo1', 'Thoracic extension', 'Over foam roller. 60s.'),
        m('mo2', 'Hamstring stretch', '45–60s each. Catch position.'),
        m('mo3', 'Hip flexor stretch', '45s each.'),
      ],
    },
    weeklyStructure: '2–3 strength sessions. Away from key erg or water sessions. Rowing is demanding — prioritise recovery.',
    nutritionGuidance: 'High energy demand — adequate carbs and protein. 1.6–2.0 g/kg protein. Hydration and electrolytes for long sessions.',
    recoveryGuidance: 'Lower back and hamstrings take load. Stretch and mobility. Sleep 8+ hours.',
    combineWithForma: 'FORMA pulling and lower body align well. Add good mornings. Skip FORMA cardio — erg is enough.',
    commonInjuries: ['Lower back pain', 'Rib stress', 'Knee pain', 'Wrist/forearm'],
  },

  // ─── CROSSFIT & FUNCTIONAL FITNESS ──────────────────────────────────────────
  {
    id: 'crossfit',
    name: 'CrossFit & functional fitness',
    category: 'crossfit',
    description: 'Gymnastics, Olympic lifting, metabolic conditioning. Skill work on gymnastics. Olympic lift technique. Metcon conditioning. Mobility for overhead, squat depth, hip flexion.',
    warmup: {
      title: 'CrossFit warm-up',
      movements: [
        m('w1', 'General movement', 'Row, bike, or jump rope. 3–5 min.'),
        m('w2', 'Hip mobility', 'Squat hold, 90/90.'),
        m('w3', 'Shoulder mobility', 'Dislocates, pass-throughs.'),
        m('w4', 'Movement prep', 'Light reps of today\'s movements.'),
      ],
    },
    mainExercises: [
      ex({ id: 'sp-cf-squat', name: 'Back squat', exerciseId: 'int-back-squat', loadCue: 'Strength base.', sets: 4, repRange: [5, 8] }),
      ex({ id: 'sp-cf-clean', name: 'Power clean', loadCue: 'Olympic technique.', sets: 4, repRange: [3, 5] }),
      ex({ id: 'sp-cf-pullup', name: 'Pull-up', exerciseId: 'int-pullups', loadCue: 'Gymnastics strength.', sets: 4, repRange: [5, 10] }),
      ex({ id: 'sp-cf-pushup', name: 'Push-up / HSPU progression', loadCue: 'Pressing strength.', sets: 3, repRange: [8, 15] }),
    ],
    accessoryExercises: [
      ex({ id: 'sp-cf-core', name: 'Hollow body / L-sit', loadCue: 'Gymnastics core.', sets: 3, repRange: [20, 40] }),
      ex({ id: 'sp-cf-skill', name: 'Skill work', loadCue: 'Muscle-up, handstand, etc. As needed.', sets: 1, repRange: [1, 1] }),
    ],
    mobility: {
      focus: ['Overhead position', 'Squat depth', 'Hip flexion', 'Shoulders'],
      movements: [
        m('mo1', 'Overhead squat prep', 'PVC pass-throughs, squat holds.'),
        m('mo2', 'Shoulder mobility', 'Sleeper stretch, dislocates.'),
        m('mo3', 'Hip mobility', '90/90, couch stretch.'),
        m('mo4', 'Pigeon stretch', '45s each.'),
      ],
    },
    weeklyStructure: '3–5 sessions. Balance strength, skill, and metcon. Recovery days with mobility.',
    nutritionGuidance: 'High output — adequate carbs and protein. 1.6–2.0 g/kg protein. Fuel around training.',
    recoveryGuidance: 'Volume can be high. Sleep 7–9 hours. Scale when needed. Active recovery and mobility.',
    combineWithForma: 'FORMA can supplement strength. CrossFit may already provide structure — use FORMA when you want focused strength without a metcon.',
    commonInjuries: ['Lower back', 'Shoulder', 'Knee', 'Wrist', 'Rhabdomyolysis risk if uncontrolled'],
  },
]

/** Sport categories for grouping in UI. */
export const SPORT_CATEGORIES = [
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'track_field', name: 'Track & field', icon: '🏅' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'rowing', name: 'Rowing', icon: '🚣' },
  { id: 'crossfit', name: 'CrossFit', icon: '💪' },
]

export function getSportProgramById(id) {
  return SPORT_PROGRAMS.find((p) => p.id === id) || null
}

export function getSportProgramsByCategory(categoryId) {
  return SPORT_PROGRAMS.filter((p) => p.category === categoryId)
}
