/**
 * Anatomical + coaching knowledge for FORMA chat (education, not medical diagnosis).
 * Depth is selected by experience tier in the engine.
 */

/** Seven fundamental patterns + detail. */
export const MOVEMENT_PATTERNS_DEEP = {
  squat: {
    title: 'Squat pattern (knee-dominant)',
    primary: 'Quadriceps, glutes, adductors (co-contract for control); trunk and calves support position.',
    beginner: `The squat pattern is mostly knee flexion and extension with the hips moving down and back together. You stay balanced over mid-foot. Ankle mobility often limits depth; hip structure affects comfortable stance width — not everyone should copy the same narrow stance. FORMA trains squats in your program so you build leg strength with controlled depth.`,
    advanced: `Biomechanics: ankle dorsiflexion (talocrural joint + tibial translation), knee flexion, hip flexion/extension; patellofemoral and hip joint loading scale with depth, load, and tempo. Torso angle varies by bar position (back vs front squat). Common faults: valgus knee collapse (often hip abductor/glute med weakness, ankle mobility, or load too heavy), excessive forward lean, loss of brace. Fix: tempo squats, pause squats, box squats, goblet pattern to own depth; cue “knees track over toes” with hip external rotation intent.`,
    formaNote: `FORMA programs balance squat volume with hinge and pull work so knees and back are not overloaded in one pattern.`,
  },
  hinge: {
    title: 'Hip hinge pattern (hip-dominant)',
    primary: 'Hamstrings, glutes, erector spinae (isometric in many hinges), adductors often assist.',
    beginner: `A hinge is “hips back” — hips travel backward with a relatively fixed knee angle compared to a squat. The squat is more knee-forward; the hinge is more hip-back. Mixing them up under load often means the low back does the work instead of the hips. Learn with RDLs, cable pull-throughs, or bodyweight hinges before heavy deadlifts.`,
    advanced: `Hip hinge mechanics: flexion at hips with spinal neutrality maintained by erectors + intra-abdominal pressure; hamstrings lengthen under load; glutes extend the hip. Versus squat: squat has more simultaneous knee and hip flexion; hinge is biased to hip flexion with less knee travel. Faults: rounding under load, squatting the hinge, bar drifting away. Teaching sequence: wall hinge → dowel RDL → loaded RDL/Deadlift.`,
    formaNote: `FORMA pairs hinges with squats so posterior chain and quads both develop.`,
  },
  push: {
    title: 'Push pattern (horizontal + vertical)',
    primary: 'Chest, shoulders, triceps (horizontal); shoulders, upper chest, triceps (vertical).',
    beginner: `Horizontal pushes (bench, push-ups) and vertical pushes (overhead press) both matter — they load the shoulder at different angles. Too much pushing without pulling rotates the shoulder forward over time. FORMA balances push with rows and vertical pulls.`,
    advanced: `Scapulohumeral rhythm: serratus and lower traps upwardly rotate; rotator cuff centers the humeral head. Push/pull ratio: many programs need more pulling volume than pushing for shoulder health. Faults: flared elbows, scapular winging, excessive lumbar arch in overhead work.`,
    formaNote: `FORMA addresses “overhead and bench” without letting you skip pull work.`,
  },
  pull: {
    title: 'Pull pattern (horizontal + vertical)',
    primary: 'Lats, rhomboids, traps, rear delts, biceps, forearms.',
    beginner: `Horizontal pulls (rows) build thickness and scapular control; vertical pulls (pulldowns, pull-ups) build lats and width. Most people push more than they pull — that imbalance can feed rounded shoulders. FORMA includes both pulls in your sessions.`,
    advanced: `Row mechanics: retraction, depression, and controlled scapular movement; vertical pulls emphasize lats and elbow path. Strengthening external rotators and lower traps supports cuff health. Faults: shrugging, cutting range, using momentum.`,
    formaNote: `FORMA’s upper-body days deliberately pair presses with rows and pulls.`,
  },
  carry: {
    title: 'Carry pattern',
    primary: 'Core (anti-lateral flexion + anti-extension), traps, grip, hips.',
    beginner: `Loaded carries are very “real world” — walking with weight trains your whole midline. Farmer carries, suitcase carries, and overhead carries each challenge stability differently. They are often underused.`,
    advanced: `Carry variations bias load: bilateral (symmetric), unilateral (QL and obliques fight lateral flexion), overhead (shoulder stability + ribs down).`,
    formaNote: `FORMA may use carries or similar core work depending on level; ask your coach for carry progressions.`,
  },
  rotation: {
    title: 'Rotation / anti-rotation pattern',
    primary: 'Obliques, transverse abdominis, deep core; thoracic spine mobility for true rotation.',
    beginner: `Rotation training is not just “twisting fast” — it includes resisting rotation (anti-rotation) like Pallof presses and controlled chops. That protects the spine and supports athletic movement.`,
    advanced: `Dissociation of thoracic rotation from lumbar compensation is key; cable woodchops and landmine rotations train sequencing when programmed correctly.`,
    formaNote: `FORMA programs core work that favors bracing and anti-rotation before advanced rotation.`,
  },
  brace: {
    title: 'Brace / anti-movement pattern',
    primary: 'Entire core system: diaphragm, TVA, obliques, pelvic floor, glutes — coordinated stiffness.',
    beginner: `Bracing is a skill: ribs stacked over pelvis, breathing behind the brace, not “sucking in.” Planks, dead bugs, bird dogs, hollow holds teach stiffness that transfers to squats and deadlifts. Crunches alone do not train this.`,
    advanced: `IAP (intra-abdominal pressure) and circumferential expansion; anti-extension, anti-flexion, anti-lateral flexion, anti-rotation categories.`,
    formaNote: `FORMA emphasizes hollow-body tension and bracing cues in compound lifts.`,
  },
}

/** Regional muscle groups — full anatomical detail. */
export const REGIONAL_MUSCLES = {
  chest: {
    title: 'Chest',
    beginner: `Main chest muscle: pectoralis major (clavicular head up top, sternal head across the chest). Pectoralis minor sits underneath and pulls the scapula forward — important for posture. Serratus anterior wraps the ribs and supports the shoulder blade — “boxer’s muscle.” Best exercises: presses (horizontal and incline), fly patterns, push-ups. To feel stretch: control the lowering; arms open without shrugging. To feel contraction: think “push through the floor” or “bring biceps together” without losing elbow angle. Common mistakes: flaring elbows too wide, bouncing off the chest, losing upper-back tension — all steal tension from the pecs.`,
    advanced: `Pectoralis major: adduction and internal rotation of the humerus; clavicular head assists flexion; sternal head more horizontal adduction. Pectoralis minor: scapular protraction/downward rotation (postural). Serratus anterior: scapular upward rotation + protraction. Injury context (general): pec strains at musculotendinous junction; long-term shoulder impingement patterns can involve poor scapular mechanics. Mind-muscle: tempo eccentrics, slight pause at stretch, pre-fatigue with flyes sparingly.`,
  },
  back: {
    title: 'Back',
    beginner: `Big movers: latissimus dorsi (width), trapezius (upper shrugs, middle rows, lower scapular control), rhomboids (squeeze between shoulder blades), erector spinae (spinal extension / stability), multifidus (segmental spine stability). Teres major assists the lat; rotator cuff (teres minor, infraspinatus, supraspinatus, subscapularis) stabilizes the shoulder. You cannot train “the back” with one exercise — you need rows, pulls, extensions, and posture work.`,
    advanced: `Lats: humeral extension/adduction/internal rotation depending on line of pull. Traps: scapular elevation/retraction/depression by region. Rhomboids: retraction. Erector spinae group: iliocostalis, longissimus, spinalis — hip hinge and deadlift loading. Multifidus: local stabilizer with feed-forward activation. Rotator cuff: force couples with deltoids for head centering. Injury notes (general): cuff tendinopathy, lat strains, extension-intolerant backs — differentiate from medical care.`,
  },
  shoulders: {
    title: 'Shoulders',
    beginner: `Deltoids: anterior (front raises, pressing), lateral (abduction), posterior (reverse fly, face pull). Rotator cuff (supraspinatus, infraspinatus, teres minor, subscapularis) keeps the ball centered in the socket — critical for injury prevention. Many people overtrain anterior deltoids (pressing) and undertrain posterior deltoids and external rotators — FORMA balances horizontal push with rows and pulls to reduce that imbalance.`,
    advanced: `Glenohumeral joint: deltoids prime movement; cuff provides dynamic compression. Serratus + lower trap for upward rotation. Overhead work demands thoracic extension and core control. Posterior delt and rear delt work often needs higher reps and strict form.`,
  },
  arms: {
    title: 'Arms',
    beginner: `Biceps brachii long head and short head (elbow flexion + supination), brachialis (flexion without supination emphasis), brachioradialis (hammer grip). Triceps: long head (crosses shoulder — overhead work hits it), lateral and medial heads. Narrower grip on pressing can emphasize triceps; wider grip on curls can change biceps emphasis slightly — but the basics are still elbow flexion/extension.`,
    advanced: `Long head triceps: shoulder extension component — overhead triceps work and long ROM pressing. Brachialis grows well with neutral/hammer curls. Elbow flexor moment arms change with shoulder angle and forearm rotation.`,
  },
  core: {
    title: 'Core',
    beginner: `Rectus abdominis (“six-pack”), transverse abdominis (deep corset), internal/external obliques (rotation and side bending), quadratus lumborum (side stability), multifidus (spine), diaphragm (breathing + pressure), pelvic floor (works with diaphragm). The core is not “just abs.” Hollow-body tension and bracing beat endless crunches for lifting and back health.`,
    advanced: `Anti-extension (ribs down), anti-lateral flexion, anti-rotation categories; pressure management with coordinated diaphragm and pelvic floor.`,
  },
  legs: {
    title: 'Legs and hips',
    beginner: `Quads: rectus femoris (also hip flexion), vastus lateralis, vastus medialis (VMO), vastus intermedius. Hamstrings: biceps femoris, semitendinosus, semimembranosus. Glutes: maximus, medius, minimus. Hip flexors: iliopsoas, rectus femoris, TFL. Adductors and abductors stabilize the knee and hip. Calves: gastrocnemius (knee bent matters), soleus (deep postural). VMO development matters for knee tracking; weak glute medius often shows up as knee cave in squats — cue “spread the floor” and strengthen hips.`,
    advanced: `Knee biomechanics: Q-angle, valgus control, ankle mobility. Hip: external rotation strength, abduction endurance.`,
  },
}

/** Individual muscle deep-dive entries (matchNames longest-first in engine). */
export const MUSCLE_ENTRIES = [
  {
    matchNames: ['pectoralis major', 'pec major', 'pecs', 'chest muscle', 'pec'],
    keywords: ['pectoralis', 'pec', 'chest'],
    region: 'chest',
    beginner: `Pectoralis major is the big chest muscle. It has a clavicular head (upper chest) and a sternal head (mid/lower chest). It brings the arm across the body and rotates the arm inward. Feel it: slow lowering on presses, slight pause at the bottom, elbows under wrists.`,
    advanced: `Origin: clavicle, sternum, costal cartilages; insertion: lateral lip of bicipital groove. Actions: horizontal adduction, internal rotation, shoulder flexion from clavicular fibers. Synergy with anterior delt and triceps in pressing.`,
  },
  {
    matchNames: ['pectoralis minor', 'pec minor'],
    keywords: ['pectoralis', 'minor'],
    region: 'chest',
    beginner: `Pectoralis minor sits under the pec major. It pulls the shoulder blade forward and down. Tightness can contribute to rounded shoulders — balance with rows and external rotation.`,
    advanced: `Origin: ribs 3–5; insertion: coracoid process. Scapular protraction and downward rotation.`,
  },
  {
    matchNames: ['serratus anterior', 'serratus'],
    keywords: ['serratus'],
    region: 'chest',
    beginner: `Serratus anterior holds the shoulder blade against the rib cage and helps upward rotation when you reach overhead. “Punching” or protraction drills help you feel it.`,
    advanced: `Long thoracic nerve injury can cause scapular winging — medical diagnosis, not chat.`,
  },
  {
    matchNames: ['latissimus dorsi', 'latissimus', 'lats', 'lat '],
    keywords: ['latissimus', 'lat'],
    region: 'back',
    beginner: `The lats are large back muscles on the sides. They pull the upper arm down and back — think pull-ups and rows. Feel them by pulling elbows toward hips, not shrugging.`,
    advanced: `Actions: adduction, extension, internal rotation of humerus. Thoracodorsal nerve supply.`,
  },
  {
    matchNames: ['trapezius', 'traps', 'upper trap', 'middle trap', 'lower trap'],
    keywords: ['trapezius', 'trap'],
    region: 'back',
    beginner: `Traps are diamond-shaped: upper fibers shrug; middle fibers squeeze shoulder blades; lower fibers help rotate the scapula upward for overhead reach.`,
    advanced: `Different regions — different lines of pull.`,
  },
  {
    matchNames: ['rhomboid', 'rhomboids'],
    keywords: ['rhomboid'],
    region: 'back',
    beginner: `Rhomboids pull the shoulder blades together toward the spine. They work in rows and face pulls.`,
    advanced: `Major and minor — retraction + downward rotation.`,
  },
  {
    matchNames: ['erector spinae', 'erectors', 'spinal erectors'],
    keywords: ['erector', 'spinae'],
    region: 'back',
    beginner: `Erector spinae extend and stabilize the spine. They work hard in hinges and squats — isometrically if you stay neutral.`,
    advanced: `Iliocostalis, longissimus, spinalis columns.`,
  },
  {
    matchNames: ['multifidus'],
    keywords: ['multifidus'],
    region: 'back',
    beginner: `Multifidus are deep stabilizers along the spine. They matter for segmental control — often trained with bird dogs and anti-rotation work.`,
    advanced: `Local stabilizer with feed-forward activation before movement.`,
  },
  {
    matchNames: ['teres major', 'teres minor'],
    keywords: ['teres'],
    region: 'back',
    beginner: `Teres major assists the lat; teres minor is a rotator cuff muscle with external rotation.`,
    advanced: `Teres minor with infraspinatus in external rotation.`,
  },
  {
    matchNames: ['infraspinatus', 'subscapularis', 'supraspinatus', 'rotator cuff'],
    keywords: ['infraspinatus', 'subscapularis', 'supraspinatus', 'rotator'],
    region: 'shoulders',
    beginner: `Rotator cuff: supraspinatus (initiates abduction), infraspinatus, teres minor (external rotation), subscapularis (internal rotation). They keep the ball centered in the socket — critical for healthy pressing and pulling.`,
    advanced: `SITS muscles — cuff tear patterns are medical; strengthen with light external rotation, face pulls, Y-T-Ws.`,
  },
  {
    matchNames: ['anterior deltoid', 'front delt', 'lateral deltoid', 'side delt', 'posterior deltoid', 'rear delt', 'deltoid'],
    keywords: ['deltoid', 'delt'],
    region: 'shoulders',
    beginner: `Three heads: front (flexion/pressing), side (abduction), rear (horizontal abduction). Many people overtrain front and undertrain rear — rows and pulls help.`,
    advanced: `Deltoid anatomy: anterior from clavicle, lateral from acromion, posterior from spine of scapula.`,
  },
  {
    matchNames: ['biceps brachii', 'biceps', 'bicep'],
    keywords: ['biceps', 'bicep'],
    region: 'arms',
    beginner: `Biceps: long head and short head; elbow flexion + forearm supination. Hammer curls hit brachialis more; supinated curls hit biceps more.`,
    advanced: `Long head crosses shoulder — slight shoulder flexion in curl.`,
  },
  {
    matchNames: ['brachialis', 'brachioradialis'],
    keywords: ['brachialis', 'brachioradialis'],
    region: 'arms',
    beginner: `Brachialis underlies biceps; strong elbow flexor. Brachioradialis is prominent in hammer curls.`,
    advanced: `Biomechanics: line of pull vs elbow position.`,
  },
  {
    matchNames: ['triceps brachii', 'triceps', 'tricep'],
    keywords: ['triceps', 'tricep'],
    region: 'arms',
    beginner: `Three heads: long (often undertrained — overhead extension work), lateral, medial. Close-grip presses and overhead extensions emphasize triceps.`,
    advanced: `Long head crosses shoulder — shoulder position changes length-tension.`,
  },
  {
    matchNames: ['rectus abdominis', 'rectus abdominals', 'abs', 'six pack'],
    keywords: ['rectus', 'abdominis'],
    region: 'core',
    beginner: `Rectus abdominis flexes the trunk. Visible “abs” also depend on body fat. Bracing matters more than crunches for heavy lifts.`,
    advanced: `Linea alba separation; anti-extension vs flexion.`,
  },
  {
    matchNames: ['transverse abdominis', 'tva'],
    keywords: ['transverse'],
    region: 'core',
    beginner: `Deep “corset” muscle. Trained with bracing, dead bugs, and slow exhales.`,
    advanced: `Feed-forward activation before limb movement.`,
  },
  {
    matchNames: ['oblique', 'obliques', 'external oblique', 'internal oblique'],
    keywords: ['oblique'],
    region: 'core',
    beginner: `Obliques rotate and side-bend the trunk; resist rotation in anti-rotation work.`,
    advanced: `Fiber direction: external vs internal.`,
  },
  {
    matchNames: ['quadratus lumborum', 'ql'],
    keywords: ['quadratus', 'lumborum'],
    region: 'core',
    beginner: `QL side-bends the spine and stabilizes the pelvis. Often works in suitcase carries.`,
    advanced: `Common referral pattern for “back tightness” — distinguish from kidney/medical issues.`,
  },
  {
    matchNames: ['diaphragm', 'pelvic floor'],
    keywords: ['diaphragm', 'pelvic floor'],
    region: 'core',
    beginner: `Diaphragm and pelvic floor work with deep core for pressure. Breathing and bracing go together.`,
    advanced: `Pressure management with intra-abdominal pressure.`,
  },
  {
    matchNames: ['quadriceps', 'quad', 'quads', 'rectus femoris', 'vastus lateralis', 'vastus medialis', 'vastus intermedius', 'vmo'],
    keywords: ['quadriceps', 'quad', 'vastus', 'rectus femoris', 'vmo'],
    region: 'legs',
    beginner: `Quads extend the knee. VMO (inner quad) helps track the kneecap — squat depth and control matter for knee health.`,
    advanced: `Four heads; rectus femoris also hip flexes.`,
  },
  {
    matchNames: ['hamstring', 'hamstrings', 'biceps femoris', 'semitendinosus', 'semimembranosus'],
    keywords: ['hamstring', 'biceps femoris', 'semitendinosus', 'semimembranosus'],
    region: 'legs',
    beginner: `Hamstrings extend the hip and flex the knee. They lengthen in the bottom of a squat and load heavily in hinges.`,
    advanced: `Medial vs lateral hamstring lines.`,
  },
  {
    matchNames: ['gluteus maximus', 'gluteus medius', 'gluteus minimus', 'glutes', 'glute'],
    keywords: ['gluteus', 'glute'],
    region: 'legs',
    beginner: `Glute max: hip extension. Glute med/min: hip abduction and rotation — weak medius often shows as knee cave in squats — cue knees out, strengthen lateral hips.`,
    advanced: `Deep vs superficial glute med.`,
  },
  {
    matchNames: ['hip flexor', 'hip flexors', 'iliopsoas', 'psoas', 'tensor fasciae latae', 'tfl'],
    keywords: ['iliopsoas', 'psoas', 'flexor', 'tensor fasciae'],
    region: 'legs',
    beginner: `Hip flexors lift the thigh. Tight hip flexors can affect posture; stretching is individual — not everyone needs aggressive stretching.`,
    advanced: `Iliacus and psoas major; TFL works with IT band.`,
  },
  {
    matchNames: ['adductor', 'adductors', 'groin'],
    keywords: ['adductor', 'groin'],
    region: 'legs',
    beginner: `Adductors pull the leg toward midline; stabilize in squats.`,
    advanced: `Adductor magnus assists hip extension.`,
  },
  {
    matchNames: ['abductor', 'abductors', 'hip abduction'],
    keywords: ['abduct'],
    region: 'legs',
    beginner: `Abductors move the leg away from midline — glute medius and minimus are key.`,
    advanced: `Hip abduction endurance for knee stability.`,
  },
  {
    matchNames: ['gastrocnemius', 'soleus', 'calf', 'calves'],
    keywords: ['gastrocnemius', 'soleus', 'calf'],
    region: 'legs',
    beginner: `Gastroc crosses knee — bent-knee calf work hits soleus more; straight-leg hits gastroc more.`,
    advanced: `Achilles tendon loading.`,
  },
]

/** Mind–muscle cues by exercise keyword (partial match). */
export const MIND_MUSCLE_CUES = [
  {
    match: ['barbell bench', 'bench press', 'db bench', 'dumbbell bench'],
    chest: `Pin shoulder blades down, touch chest lightly, think “press away from the floor” while keeping wrists stacked.`,
    back: `Keep upper back tight — “bend the bar” to engage lats.`,
    triceps: `Tuck elbows slightly; finish with lockout without flaring.`,
  },
  { match: ['squat', 'back squat'], quads: `Drive knees out over toes; feel pressure mid-foot.`, glutes: `Stand up by pushing the floor away.`, knee: `Track knee over second toe — not caving.` },
  { match: ['deadlift', 'rdl', 'romanian'], hamstrings: `Push hips back — you should feel hamstrings in lengthening.`, glutes: `Finish with hips under shoulders, squeeze glutes.`, back: `Bar stays close; lats engaged.` },
  { match: ['row', 'barbell row'], lats: `Pull elbow toward hip pocket; pause at top.`, rhomboids: `Squeeze shoulder blades together without shrugging.` },
  { match: ['pull-up', 'pullup', 'lat pulldown'], lats: `Depress shoulders first; pull elbows to ribs.`, biceps: `Don’t curl with hands — drive elbows.` },
  { match: ['overhead press', 'ohp', 'shoulder press'], shoulder: `Ribs down; press bar in a straight line; head through at top.` },
]
