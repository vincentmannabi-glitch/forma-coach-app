/**
 * Conversational movement coaching: assessments, progressions/regressions,
 * sport-specific starting points, and peer-level trainer mode.
 */

const CLOSING =
  'Does that make sense or would you like me to explain any part of that differently?'

const TRAINER_SELF =
  /\b(i'?m a|i am|work as a|certified)\s+(personal\s+trainer|pt|trainer|coach)\b|\bpersonal\s+trainer\b.*\b(i|my|me)\b|\bmy\s+clients?\b|\bprogramming\s+for\s+clients\b/i

const TRAINER_TECH =
  /\b(periodi[sz]ation|volume\s+landmark|minimum\s+effective\s+dose|maximum\s+recoverable\s+volume|\bmrv\b|\bmed\b|mesocycle|microcycle|autoregulation|conjugate|undulating|linear\s+periodi|accommodation|supercompensation|biomechan|kinesiology|anatomical|sagittal|frontal|transverse|moment\s+arm|length[- ]tension|force[- ]velocity)\b/i

const MOVEMENT_RECOMMEND =
  /\b(good|best|great)\s+(movement|movements|exercise|exercises|drill|drills)\b|\b(movement|exercise|exercises|drill|drills)\s+for\s+(my|the|a|an)?\s*|\bwhat\s+(is\s+a\s+)?(good|best)\s+(movement|exercise)\b|\b(recommend|suggest)\s+(a\s+)?(movement|exercise|drill)\b|\bwhat\s+should\s+i\s+(do|try)\s+for\b|\bexercises?\s+for\s+(my|building|strengthening)|\bwhat\s+('?s|is)\s+a\s+good\s+\w+\s+for\b/i

const LOWER_BACK_INTENT =
  /\b(strengthen|strengthening|help|fix|protect|work\s+on)\s+(my\s+)?(lower\s+back|lumbar|low\s+back)\b|\b(lower\s+back|lumbar|low\s+back)\s+(strength|exercise|movement|help)\b/i

const LOWER_BACK =
  /\b(lower\s+back|lumbar|low\s+back|l[- ]?spine|spinal\s+erectors?\s+for)\b/i

const CALISTHENICS_START =
  /\b(start|begin|get\s+into|want\s+to\s+try|want\s+to\s+learn|trying\s+to\s+learn)\b.*\b(calisthenics|bodyweight\s+skills|street\s+workout|muscle[\s-]?ups?|learn\s+(a\s+)?pull[\s-]?up)\b|\b(calisthenics|bodyweight\s+skills)\b.*\b(beginner|start|new\s+to)\b|\bnew\s+to\s+calisthenics\b/i

const FIGHTING_START =
  /\b(start|begin|get\s+into|try|want\s+to\s+try)\b.*\b(boxing|kickboxing|mma|bjj|brazilian\s+jiu|jiu[\s-]?jitsu|martial\s+arts?|fighting|combat\s+sport)\b|\b(i\s+want\s+to|thinking\s+about)\b.*\b(boxing|mma|bjj|kickboxing|martial)\b|\b(get\s+into|take\s+up)\s+(boxing|mma|bjj|kickboxing)\b/i

/** Let chatCoach start injury flow — unless user is classifying sore vs strengthen for lower back. */
const INJURY_DELEGATE =
  /\binjur(y|ed|ies)\b|\bhurt(s|ing)?\b|\bpain\b|\bstrain\b|\brolled\s+my\b|\btweaked\b/i

function getTier(user) {
  const exp = (user?.experience_level || '').toLowerCase()
  if (exp.includes('advanced')) return 'advanced'
  if (exp.includes('intermediate')) return 'intermediate'
  return 'beginner'
}

function tierStartLine(tier) {
  if (tier === 'advanced')
    return 'Given your experience level, you can run more volume and complexity — still earn the positions before you load them heavy.'
  if (tier === 'intermediate')
    return 'At your level, we anchor progress in quality reps and small weekly bumps — not hero sets.'
  return 'As someone building the basics, we start with patterns you can own every rep — confidence beats novelty.'
}

function isTrainerPeer(userMessage, ctx) {
  if (ctx?.trainerPeerMode) return true
  return TRAINER_SELF.test(userMessage) || TRAINER_TECH.test(userMessage)
}

/** @param {string} body */
function parseSoreVsStrengthen(body) {
  const t = body.toLowerCase()
  const sore =
    /\b(sore|hurts?|pain|aching|tweak|tight|flared|spasm|acute|right\s+now|today|this\s+week)\b/i.test(t) &&
    !/\b(long[\s-]?term|strength|strong|build|hypertrophy|muscle|prevent)\b/i.test(t)
  const strengthen =
    /\b(strength|strengthen|strengthening|strong|build|hypertrophy|muscle|long[\s-]?term|prevent|healthy|resilien|performance|deadlift|squat|sport)\b/i.test(t) ||
    /\b(no\s+pain|not\s+sore|fine\s+now|feel\s+ok)\b/i.test(t)
  if (sore && !strengthen) return 'sore'
  if (strengthen && !sore) return 'strengthen'
  if (/\b(sore|pain|hurt)\b/i.test(t)) return 'sore'
  if (/\b(strength|strong|build|long)\b/i.test(t)) return 'strengthen'
  return null
}

function parsePushupYes(body) {
  const t = body.toLowerCase()
  if (/\b(no|can'?t|cannot|not\s+yet|zero|struggle|barely)\b/i.test(t) && !/\b(yes|can)\b/i.test(t)) return false
  if (/\b(yes|yeah|yep|can\s+do|able|full\s+push|no\s+problem|easy|fine)\b/i.test(t)) return true
  return null
}

function parsePullupYes(body) {
  const t = body.toLowerCase()
  if (/\b(no|can'?t|cannot|not\s+yet|zero|use\s+a\s+band|assisted)\b/i.test(t) && !/\b(yes|can|unassisted)\b/i.test(t)) return false
  if (/\b(yes|yeah|can\s+do|strict|unassisted|bodyweight)\b/i.test(t)) return true
  return null
}

function fightingDraw(body) {
  const t = body.toLowerCase()
  if (/\b(self[\s-]?defen[cs]e|defend|street|real\s+fight|protect)\b/i.test(t)) return 'self_defence'
  if (/\b(compete|competition|fight\s+card|amateur|pro|belt|tournament)\b/i.test(t)) return 'competition'
  if (/\b(fitness|shape|conditioning|cardio|sweat|lose\s+weight|fun|stress)\b/i.test(t)) return 'fitness'
  return null
}

function lowerBackSoreBlock(trainer) {
  const core = `Bird dogs and dead bugs retrain timing between your deep abdominals and back extensors without loading the spine in flexion — that is often what a cranky low back wants first. Cat-cow is gentle motion nutrition for the spine: not forcing range, just fluid segmental movement. Easy hip flexor and quad stretches can help because a stiff anterior hip often pulls you into more lumbar extension when you stand — which feeds irritation.

What to avoid for now: max-effort deadlifts, deep good mornings, sit-ups and GHD sit-ups, and anything that spikes sharp pain or pins you into one position. If you are gasping for breath, numb, losing bowel/bladder control, have fever with back pain, or pain shoots below the knee with true neurological symptoms, stop and see a clinician urgently. If pain is severe, worsening over days, or you cannot find any position of relief, book a physiotherapist or doctor — that is not "being soft", that is triage.`

  if (trainer) {
    return `From a clinical-strength lens: prioritise anti-extension and anti-rotation stability (bird dog, dead bug) and graded spine mobility (cat-cow) before reintroducing axial load. Hip flexor length work often reduces passive extension demand on the lumbar segments. ${core}

${CLOSING}`
  }
  return `Before I load you heavy, I want your back to feel like it owns small positions — that is where bird dogs, dead bugs, cat-cow, and gentle hip flexor stretches come in. Every beginner was a beginner once; there is no shame in starting gentle.

${core}

${CLOSING}`
}

function lowerBackStrengthenBlock(tier, trainer) {
  const tierLine = tierStartLine(tier)
  const trainerLine = trainer
    ? 'Dose these across the week as a hinge-strength pattern plus anti-extension stability, then progress load only when spinal position stays consistent.'
    : tierLine
  return `For long-term lower-back strength, use:

Romanian deadlift — posterior chain strength. Cue: push hips back, keep ribs down, and keep the bar close.
Bird dog — anti-extension stability. Cue: reach long through heel and hand without arching your low back.
Good morning — spinal erector development. Cue: soft knees, hinge from hips, and keep your torso braced.
Deadlift (when ready) — full posterior-chain loading. Cue: wedge in, lock lats, and push the floor away.

${trainerLine}

Would you like me to add any of these to your program?`
}

function genericMovementAsk(regionLabel) {
  return `Before I recommend something, let me ask quickly — are you mainly after strength, muscle size, or feeling better day to day? And do you train mostly at home (limited gear) or do you have a full gym? Your answer changes the first exercises I would pick for ${regionLabel}.`
}

function genericMovementAnswer(regionKey, tier, trainer, body) {
  const t = body.toLowerCase()
  const home = /\b(home|dumbbell|band|no\s+bar|limited)\b/i.test(t)
  const gym = /\b(gym|barbell|cable|machine)\b/i.test(t)
  const strength = /\b(strength|strong|heavy|lift)\b/i.test(t)
  const size = /\b(size|muscle|hypertrophy|bigger|mass)\b/i.test(t)
  const feel = /\b(feel|health|posture|better|pain[\s-]?free)\b/i.test(t)

  const tierLine = tierStartLine(tier)

  const packs = {
    chest: {
      home: `Incline push-ups or dumbbell floor press if you have weights — they keep shoulders friendlier than max-depth flat pressing early on.`,
      gym: `A quality barbell or dumbbell bench with a controlled arch and leg drive fits most goals; add cable flies for volume without beating the joints.`,
      why: `Horizontal pressing hits pecs, front delts, and triceps together — efficient for strength and size when technique stays honest.`,
      prog: `If it feels too easy: add a slight incline or a pause 1 inch off the chest. If it feels too hard: hands-elevated push-up or dumbbell press with back on a bench to shorten the arm path.`,
    },
    shoulders: {
      home: `Pike push-ups or band pull-aparts plus lateral raises with whatever load you have — open the upper back before you press overhead.`,
      gym: `Landmine press or dumbbell overhead press for strength; lateral raises and face pulls for balance — most people need more pull than push volume.`,
      why: `Shoulders love gradual overhead loading paired with scapular control — rushing heavy OHP without upper-back balance invites grumpy cuffs.`,
      prog: `Too easy: half-kneeling or standing strict press with longer eccentrics. Too hard: landmine or single-arm supported DB press to reduce stability demand.`,
    },
    glutes: {
      home: `Hip bridges and single-leg hip thrust progressions — add a mini-band around knees for abduction if you have one.`,
      gym: `Barbell hip thrust and Romanian deadlift cover heavy hip extension; add lateral band walks as warm-up glue.`,
      why: `Glutes are primary hip extensors — strong hips protect knees and low back when squats and hinges get heavier.`,
      prog: `Too easy: single-leg thrust or deficit hip thrust. Too hard: bodyweight bridge holds and shorter ROM thrusts from a bench.`,
    },
    legs: {
      home: `Split squats and step-ups beat sloppy heavy squats when equipment is limited — load a backpack if needed.`,
      gym: `Back squat or leg press for strength; split squat for single-leg stability — both belong in a balanced block.`,
      why: `Knees and hips adapt together; unilateral work catches side-to-side gaps that hide in bilateral lifts.`,
      prog: `Too easy: front-foot elevated split squat. Too hard: box squat or leg press with reduced depth until pattern is clean.`,
    },
    core: {
      home: `Dead bugs, side planks, and slow bear planks — boring and effective.`,
      gym: `Pallof press, cable chops, and heavy carries — "core" is anti-movement as much as flexion.`,
      why: `A stiff, well-timed trunk lets limbs produce force without the spine paying the bill.`,
      prog: `Too easy: add RKC plank or weighted carries. Too hard: shorten lever — dead bug with arms only, or plank from knees.`,
    },
    arms: {
      home: `Tempo push-ups and table rows (inverted rows) — pull-to-push ratio matters more than curling random dumbbells.`,
      gym: `Close-grip bench or dips for triceps; chin-ups or rows for biceps — compound first, isolation to finish.`,
      why: `Arms grow best when elbows and shoulders stay healthy — volume without junk reps.`,
      prog: `Too easy: add band resistance or slow eccentrics. Too hard: reduce load and chase perfect reps.`,
    },
    back: {
      home: `Inverted rows and band pull-downs; single-arm rows if you have a dumbbell.`,
      gym: `Barbell row, chest-supported row, lat pulldown — mix horizontal and vertical pulls weekly.`,
      why: `A strong upper back keeps shoulders centred and makes pressing feel lighter.`,
      prog: `Too easy: chest-supported or one-arm row to reduce low-back demand. Too hard: pause rows or strict pull-ups when ready.`,
    },
    default: {
      home: `Push, pull, hinge, squat patterns with whatever you have — one clear hard set beats ten random exercises.`,
      gym: `Pick compound lifts you can repeat with good form and progress weekly — assistance work fills gaps.`,
      why: `Movement quality and consistency beat novelty — your body adapts to repeated good stress.`,
      prog: `Too easy: add load or a harder variation. Too hard: reduce range or use support — there is no shame in regressing.`,
    },
  }

  const p = packs[regionKey] || packs.default
  const place = home || !gym ? p.home : p.gym
  const goalHint = strength
    ? 'Since you leaned strength, bias fewer reps with heavier-ish loads when form is crisp — still leave reps in reserve early.'
    : size
      ? 'Since you leaned muscle, moderate reps with controlled eccentrics and proximity to failure (not failure every set) work well.'
      : feel
        ? 'Since you want to feel better, we prioritise positions you own and joints that stay quiet — intensity follows trust.'
        : 'We can blend strength and hypertrophy — the key is repeatable sessions, not one perfect workout.'

  if (trainer) {
    return `${goalHint} ${place} ${p.why}

${tierLine}

${p.prog}

${CLOSING}`
  }
  return `Here is how I would start for ${regionKey} — a tight line of attack, not a laundry list.

${goalHint}

${place}

${p.why}

${tierLine}

${p.prog}

${CLOSING}`
}

function calisthenicsPushupNo() {
  return `Calisthenics is one of the most rewarding disciplines you can pursue — and everyone starts somewhere. If a full push-up is not there yet, we build the press from the angle you can own: wall push-ups first, then hands on a bench or box (incline), then longer-range inclines, then negatives with a slow lower, then full push-ups. Only when that pattern is solid do we start layering pull work seriously — otherwise you are building a house on sand.

If that feels too easy: lower the incline a few inches or add a pause at the bottom. If it feels too hard: move hands higher on the wall or reduce how low you go — range beats ego.

${CLOSING}`
}

function calisthenicsPushupYes() {
  return `Nice — a solid push-up means we can screen the next bottleneck honestly. Can you do a strict pull-up (chin over bar, no kip) right now? If not, we start with hangs, scapular pull-downs, and band-assisted or eccentric pull-ups before we talk levers and muscle-ups.

${CLOSING}`
}

function calisthenicsPullupNo() {
  return `That is completely normal — pull strength often lags push for adults. Start with dead hangs for grip and shoulder patience, active scapular pull-downs, then band-assisted pull-ups or slow eccentrics from a box. Keep elbows and ribs organised — no wild kipping while you are building tissue tolerance.

If it feels too easy: fewer band colours or longer eccentrics. If it feels too hard: more assistance or shorter sets with perfect reps.

${CLOSING}`
}

function calisthenicsPullupYes() {
  return `Love it — you have vertical push and pull foundations. Next we layer rows, dips, and core compression work, then skill layers like L-sit progressions — always with patience. Gym strength does not automatically transfer to skill work; we still respect progressions.

If you want a concrete week-one focus: three sessions — push volume, pull volume, and one easy skill + mobility day — quality over novelty.

${CLOSING}`
}

function fightingAskDraw() {
  return `Sport-specific skill is separate from general fitness — a strong gym athlete is still a beginner at combinations and timing until they earn them. Combat sports reward consistency; before we pick a starting lane, what draws you most: fitness and conditioning, competition, or practical self defence? Your answer changes whether we emphasise footwork and combos, finding a gym and coach, or fundamentals that work under stress.`
}

function fightingFitness() {
  return `Fitness-first: start with stance and footwork drills (small steps, weight shifts), then basic jab–cross and hook combinations on a bag or shadow, then defensive movement — slips and rolls at slow speed before speed. Add skipping or bike intervals for conditioning, but keep technique clean — sloppy rounds just engrain bad habits.

If it feels too easy: add lateral movement or combo length. If it feels too hard: halve the volume and film 10 seconds of shadowboxing — small fixes beat big ego.

${CLOSING}`
}

function fightingCompetition() {
  return `Competition means you need live coaching — timing, reads, and safe hard sparring do not come from an app chat. If you already have a gym, tell your coach your goals and let FORMA handle strength and conditioning around their technical plan. If you do not, prioritise finding a reputable gym with real coaching; I can help you think through S and C structure while you search.

If you are training solo for now: polish basics and conditioning, but do not mistake bag work for fight IQ — get eyes on you when you can.

${CLOSING}`
}

function fightingSelfDefence() {
  return `For practical self defence, fundamentals beat flashy moves — distance management, simple striking, and clinch basics matter. Many people benefit from a few months of BJJ fundamentals (position, escapes, control) alongside basic boxing footwork and guard. That is not fear-mongering — it is building a small reliable toolkit.

If it feels too easy: add light partner drills with consent and gear. If it feels too hard: slow everything down — accuracy before power.

${CLOSING}`
}

function fightingFallback() {
  return `Thanks — I will blend conditioning, fundamentals, and safety. If you can join a class even once a week, you will progress faster than solo-only training. Want to narrow it to one art next — striking-heavy or grappling-heavy?

${CLOSING}`
}

function trainerPeerRdl() {
  return `Romanian deadlift: think long femoral lever with relatively isometric erector demand versus a squat — hips translate back until hamstrings limit further excursion without losing neutral-ish lumbar alignment (individual anthropometry varies). Load sits in the hands; knees unlock but do not hunt for excessive forward travel.

If it feels too easy: single-leg RDL for multi-planar stability and unilateral stiffness — or add pause or deficit to shift length-tension bias. If it feels too difficult: elevate plates or use dumbbells from a slight deficit reduction (hands on low pins or higher surface) to shorten effective ROM while you own the hinge.

Programming nods: slot hinges where fatigue from squats will not compromise spinal position; volume landmarks are individual — track bar speed and next-day tissue response more than arbitrary set counts.

${CLOSING}`
}

/**
 * @param {string} userMessage
 * @param {object | null} user
 * @param {object[]} messages
 * @param {string} hi
 * @param {object} ctx
 * @returns {{ type: 'text'; text: string; ctx: object } | null}
 */
export function handleMovementCoachFlow(userMessage, user, messages, hi, ctx) {
  const t = (userMessage || '').trim()
  if (!t) return null

  const next = { ...ctx }
  const tier = getTier(user)
  const trainer = isTrainerPeer(t, ctx)

  if (trainer && !next.trainerPeerMode) {
    next.trainerPeerMode = true
  }

  const flow = next.movementCoachFlow
  const inLowerBackClassify = flow?.kind === 'lower_back' && flow.step === 'ask_sore_vs_strength'

  if (INJURY_DELEGATE.test(t) && !inLowerBackClassify) {
    return null
  }

  // --- Continue active flows ---
  if (flow?.kind === 'lower_back' && flow.step === 'ask_sore_vs_strength') {
    const parsed = parseSoreVsStrengthen(t)
    if (!parsed) {
      next.movementCoachFlow = null
      return {
        type: 'text',
        text: `${hi}${lowerBackStrengthenBlock(tier, trainer)}`,
        ctx: next,
      }
    }
    next.movementCoachFlow = null
    const block = parsed === 'sore' ? lowerBackSoreBlock(trainer) : lowerBackStrengthenBlock(tier, trainer)
    return { type: 'text', text: `${hi}${block}`, ctx: next }
  }

  if (flow?.kind === 'generic' && flow.step === 'ask_clarify') {
    next.movementCoachFlow = null
    const body = genericMovementAnswer(flow.regionKey || 'default', tier, trainer, t)
    return { type: 'text', text: `${hi}${body}`, ctx: next }
  }

  if (flow?.kind === 'calisthenics') {
    if (flow.step === 'pushup') {
      const pu = parsePushupYes(t)
      if (pu === null) {
        return {
          type: 'text',
          text: `${hi}No rush — can you do one solid full push-up on the floor right now (chest touches, body moves as one piece)?${trainer ? ' Full ROM, no sagging hips.' : ''}`,
          ctx: next,
        }
      }
      if (pu === false) {
        next.movementCoachFlow = null
        return { type: 'text', text: `${hi}${calisthenicsPushupNo()}`, ctx: next }
      }
      next.movementCoachFlow = { kind: 'calisthenics', step: 'pullup' }
      return { type: 'text', text: `${hi}${calisthenicsPushupYes()}`, ctx: next }
    }
    if (flow.step === 'pullup') {
      const pl = parsePullupYes(t)
      if (pl === null) {
        return {
          type: 'text',
          text: `${hi}Got it — strict pull-up: chin over bar, no kip — is that in the tank today?${trainer ? ' (Supinated or neutral — pick consistent.)' : ''}`,
          ctx: next,
        }
      }
      next.movementCoachFlow = null
      const block = pl ? calisthenicsPullupYes() : calisthenicsPullupNo()
      return { type: 'text', text: `${hi}${block}`, ctx: next }
    }
  }

  if (flow?.kind === 'fighting') {
    if (flow.step === 'ask_draw') {
      const branch = fightingDraw(t)
      next.movementCoachFlow = null
      if (branch === 'fitness') return { type: 'text', text: `${hi}${fightingFitness()}`, ctx: next }
      if (branch === 'competition') return { type: 'text', text: `${hi}${fightingCompetition()}`, ctx: next }
      if (branch === 'self_defence') return { type: 'text', text: `${hi}${fightingSelfDefence()}`, ctx: next }
      return { type: 'text', text: `${hi}${fightingFallback()}`, ctx: next }
    }
  }

  // --- Start new flows (movement recommendation questions) ---
  const lowerIntent = MOVEMENT_RECOMMEND.test(t) || /\b(strengthen|help)\s+my\s+\w+\s+(back|shoulder|chest|legs|core)\b/i.test(t)
  const mentionsLb = LOWER_BACK.test(t)

  const lowerBackIntent = mentionsLb && (lowerIntent || LOWER_BACK_INTENT.test(t))

  if (lowerBackIntent) {
    const parsed = parseSoreVsStrengthen(t)
    if (parsed === 'sore' || parsed === 'strengthen') {
      next.movementCoachFlow = null
      const block = parsed === 'sore' ? lowerBackSoreBlock(trainer) : lowerBackStrengthenBlock(tier, trainer)
      return { type: 'text', text: `${hi}${block}`, ctx: next }
    }
    next.movementCoachFlow = { kind: 'lower_back', step: 'ask_sore_vs_strength' }
    return {
      type: 'text',
      text: `${hi}Before I recommend something, let me ask quickly — is your lower back sore or irritated right now, or are you looking to strengthen it for the long term?${trainer ? ' Symptom-modulation versus capacity-building changes the exercise menu.' : ''}`,
      ctx: next,
    }
  }

  if (lowerIntent) {
    const region = detectRegion(t)
    if (region) {
      next.movementCoachFlow = {
        kind: 'generic',
        step: 'ask_clarify',
        regionKey: region.key,
        regionLabel: region.label,
      }
      return {
        type: 'text',
        text: `${hi}${genericMovementAsk(region.label)}`,
        ctx: next,
      }
    }
  }

  if (CALISTHENICS_START.test(t)) {
    next.movementCoachFlow = { kind: 'calisthenics', step: 'pushup' }
    return {
      type: 'text',
      text: `${hi}Calisthenics is one of the most rewarding disciplines you can pursue — before we build your foundation, tell me honestly: can you do a full push-up on the floor right now with good form (body in one line, chest to depth you control)? Even if you are already strong in the gym, skill-specific work still starts at fundamentals — that is normal, not a step backwards.${trainer ? ' We screen push before pull because vertical pressing tolerance scales skill layers.' : ''}`,
      ctx: next,
    }
  }

  if (FIGHTING_START.test(t)) {
    next.movementCoachFlow = { kind: 'fighting', step: 'ask_draw' }
    return {
      type: 'text',
      text: `${hi}${fightingAskDraw()}`,
      ctx: next,
    }
  }

  // Trainer-specific: RDL deep dive without full exercise block
  if (trainer && /\bromanian\s+deadlift|\bRDL\b/i.test(t) && /\b(why|how|cue|program|progress|regress)/i.test(t)) {
    return { type: 'text', text: `${hi}${trainerPeerRdl()}`, ctx: next }
  }

  return null
}

function detectRegion(t) {
  const lower = t.toLowerCase()
  if (/\b(lower\s+back|lumbar|low\s+back)\b/.test(lower)) return { key: 'default', label: 'your lower back' }
  if (/\b(chest|pec)\b/.test(lower)) return { key: 'chest', label: 'chest' }
  if (/\b(shoulder|delt)\b/.test(lower)) return { key: 'shoulders', label: 'shoulders' }
  if (/\b(glute|butt)\b/.test(lower)) return { key: 'glutes', label: 'glutes' }
  if (/\b(leg|quad|hamstring|knee|squat|lunge)\b/.test(lower)) return { key: 'legs', label: 'legs' }
  if (/\b(core|abs|abdominal|trunk)\b/.test(lower)) return { key: 'core', label: 'core' }
  if (/\b(bicep|tricep|arm)\b/.test(lower)) return { key: 'arms', label: 'arms' }
  if (/\b(lat|upper\s+back|mid\s+back|trap|rhomboid)\b/.test(lower)) return { key: 'back', label: 'your back' }
  return null
}
