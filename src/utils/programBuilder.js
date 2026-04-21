// ============================================================
// FORMA Coach — programBuilder.js
// Full exercise database + goal-first personalized programming
// ============================================================

// -----------------------------------------------------------
// MASTER EXERCISE DATABASE
// Organized by: muscle group → exercises
// Each exercise tagged: goals, levels, equipment, injuryFlags
// -----------------------------------------------------------

export const EXERCISE_DATABASE = {

  chest: [
    { name: 'Barbell Bench Press', equipment: ['barbell', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 4, reps: '6-8', rest: 120 },
    { name: 'Barbell Incline Bench Press', equipment: ['barbell', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 3, reps: '8-10', rest: 90 },
    { name: 'Dumbbell Bench Press', equipment: ['dumbbells', 'bench'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'compound', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Incline Press', equipment: ['dumbbells', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Fly', equipment: ['dumbbells', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Cable Chest Fly', equipment: ['cables'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Cable Crossover', equipment: ['cables'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Push-Up', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'compound', sets: 3, reps: '10-20', rest: 60 },
    { name: 'Incline Push-Up', equipment: [], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'compound', sets: 3, reps: '10-15', rest: 60 },
    { name: 'Diamond Push-Up', equipment: [], level: ['intermediate'], goals: ['muscleBuilding', 'fatLoss'], type: 'compound', sets: 3, reps: '8-12', rest: 60 },
    { name: 'Dip', equipment: ['dip_bars'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 3, reps: '8-12', rest: 90 },
  ],

  back: [
    { name: 'Barbell Bent Over Row', equipment: ['barbell'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 4, reps: '6-8', rest: 120 },
    { name: 'Barbell Deadlift', equipment: ['barbell'], level: ['intermediate', 'advanced'], goals: ['strength', 'muscleBuilding'], type: 'compound', sets: 4, reps: '4-6', rest: 180, injuryFlags: ['lower back', 'back'] },
    { name: 'Single Arm Dumbbell Row', equipment: ['dumbbells'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'compound', sets: 3, reps: '10-12', rest: 75 },
    { name: 'Dumbbell Romanian Deadlift', equipment: ['dumbbells'], level: ['beginner', 'intermediate'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'compound', sets: 3, reps: '10-12', rest: 90, injuryFlags: ['lower back', 'back'] },
    { name: 'Lat Pulldown', equipment: ['cables'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth', 'strength'], type: 'compound', sets: 4, reps: '8-12', rest: 90 },
    { name: 'Seated Cable Row', equipment: ['cables'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'compound', sets: 3, reps: '10-12', rest: 75 },
    { name: 'Cable Row Close Grip', equipment: ['cables'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'compound', sets: 3, reps: '10-12', rest: 75 },
    { name: 'Face Pull', equipment: ['cables'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'generalHealth', 'fatLoss'], type: 'isolation', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Pull-Up', equipment: ['pull_up_bar'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength', 'fatLoss'], type: 'compound', sets: 4, reps: '6-10', rest: 90 },
    { name: 'Chin-Up', equipment: ['pull_up_bar'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 3, reps: '6-10', rest: 90 },
    { name: 'Inverted Row', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'compound', sets: 3, reps: '10-15', rest: 60 },
    { name: 'Band Lat Pulldown', equipment: ['bands'], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'compound', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Band Pull Apart', equipment: ['bands'], level: ['beginner', 'intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'isolation', sets: 3, reps: '15-20', rest: 45 },
  ],

  shoulders: [
    { name: 'Barbell Overhead Press', equipment: ['barbell'], level: ['intermediate', 'advanced'], goals: ['strength', 'muscleBuilding'], type: 'compound', sets: 4, reps: '6-8', rest: 120, injuryFlags: ['shoulder'] },
    { name: 'Dumbbell Shoulder Press', equipment: ['dumbbells'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth', 'strength'], type: 'compound', sets: 3, reps: '10-12', rest: 90, injuryFlags: ['shoulder'] },
    { name: 'Dumbbell Lateral Raise', equipment: ['dumbbells'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'isolation', sets: 3, reps: '12-15', rest: 60, injuryFlags: ['shoulder'] },
    { name: 'Dumbbell Front Raise', equipment: ['dumbbells'], level: ['intermediate'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60, injuryFlags: ['shoulder'] },
    { name: 'Dumbbell Rear Delt Fly', equipment: ['dumbbells'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Cable Lateral Raise', equipment: ['cables'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60, injuryFlags: ['shoulder'] },
    { name: 'Pike Push-Up', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'compound', sets: 3, reps: '8-12', rest: 60, injuryFlags: ['shoulder'] },
    { name: 'Band Lateral Raise', equipment: ['bands'], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'isolation', sets: 3, reps: '15-20', rest: 45, injuryFlags: ['shoulder'] },
  ],

  triceps: [
    { name: 'Close Grip Bench Press', equipment: ['barbell', 'bench'], level: ['intermediate', 'advanced'], goals: ['strength', 'muscleBuilding'], type: 'compound', sets: 3, reps: '8-10', rest: 90 },
    { name: 'Skull Crusher', equipment: ['dumbbells', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '10-12', rest: 75, injuryFlags: ['elbow'] },
    { name: 'Tricep Pushdown', equipment: ['cables'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Overhead Tricep Extension Cable', equipment: ['cables'], level: ['intermediate'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Dumbbell Overhead Extension', equipment: ['dumbbells'], level: ['intermediate'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Band Tricep Pushdown', equipment: ['bands'], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'isolation', sets: 3, reps: '15-20', rest: 45 },
  ],

  biceps: [
    { name: 'Barbell Curl', equipment: ['barbell'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '10-12', rest: 75, injuryFlags: ['elbow'] },
    { name: 'Dumbbell Curl', equipment: ['dumbbells'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'isolation', sets: 3, reps: '10-12', rest: 60, injuryFlags: ['elbow'] },
    { name: 'Hammer Curl', equipment: ['dumbbells'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'isolation', sets: 3, reps: '10-12', rest: 60 },
    { name: 'Incline Dumbbell Curl', equipment: ['dumbbells', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '10-12', rest: 60 },
    { name: 'Cable Curl', equipment: ['cables'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Band Bicep Curl', equipment: ['bands'], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'isolation', sets: 3, reps: '15-20', rest: 45 },
  ],

  quads: [
    { name: 'Barbell Back Squat', equipment: ['barbell', 'squat_rack'], level: ['intermediate', 'advanced'], goals: ['strength', 'muscleBuilding'], type: 'compound', sets: 4, reps: '6-8', rest: 180, injuryFlags: ['knee'] },
    { name: 'Barbell Front Squat', equipment: ['barbell', 'squat_rack'], level: ['advanced'], goals: ['strength', 'muscleBuilding'], type: 'compound', sets: 4, reps: '5-6', rest: 180, injuryFlags: ['knee'] },
    { name: 'Dumbbell Goblet Squat', equipment: ['dumbbells'], level: ['beginner', 'intermediate'], goals: ['fatLoss', 'generalHealth', 'muscleBuilding'], type: 'compound', sets: 3, reps: '10-15', rest: 75, injuryFlags: ['knee'] },
    { name: 'Dumbbell Bulgarian Split Squat', equipment: ['dumbbells', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength', 'fatLoss'], type: 'compound', sets: 3, reps: '10-12', rest: 90, injuryFlags: ['knee'] },
    { name: 'Leg Press', equipment: ['machines'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'strength', 'fatLoss', 'generalHealth'], type: 'compound', sets: 4, reps: '10-12', rest: 90 },
    { name: 'Leg Extension', equipment: ['machines'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Bodyweight Squat', equipment: [], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'compound', sets: 3, reps: '15-20', rest: 60, injuryFlags: ['knee'] },
    { name: 'Reverse Lunge', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'compound', sets: 3, reps: '10-12', rest: 60, injuryFlags: ['knee'] },
    { name: 'Step Up', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'compound', sets: 3, reps: '10-12', rest: 60 },
  ],

  hamstrings: [
    { name: 'Barbell Romanian Deadlift', equipment: ['barbell'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 4, reps: '8-10', rest: 120, injuryFlags: ['lower back', 'back', 'hamstring'] },
    { name: 'Dumbbell Romanian Deadlift', equipment: ['dumbbells'], level: ['beginner', 'intermediate'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'compound', sets: 3, reps: '10-12', rest: 90, injuryFlags: ['lower back', 'back', 'hamstring'] },
    { name: 'Lying Leg Curl', equipment: ['machines'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'isolation', sets: 3, reps: '10-12', rest: 75, injuryFlags: ['hamstring'] },
    { name: 'Seated Leg Curl', equipment: ['machines'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 3, reps: '10-12', rest: 75, injuryFlags: ['hamstring'] },
    { name: 'Nordic Curl', equipment: [], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'isolation', sets: 3, reps: '6-8', rest: 90, injuryFlags: ['hamstring'] },
    { name: 'Glute Ham Raise', equipment: ['machines'], level: ['advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 3, reps: '8-10', rest: 90, injuryFlags: ['hamstring'] },
  ],

  glutes: [
    { name: 'Barbell Hip Thrust', equipment: ['barbell', 'bench'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss'], type: 'compound', sets: 4, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Hip Thrust', equipment: ['dumbbells', 'bench'], level: ['beginner', 'intermediate'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'compound', sets: 3, reps: '12-15', rest: 75 },
    { name: 'Cable Kickback', equipment: ['cables'], level: ['beginner', 'intermediate'], goals: ['fatLoss', 'generalHealth', 'muscleBuilding'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Glute Bridge', equipment: [], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'compound', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Single Leg Glute Bridge', equipment: [], level: ['intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'compound', sets: 3, reps: '12-15', rest: 60 },
  ],

  calves: [
    { name: 'Standing Calf Raise', equipment: ['machines'], level: ['beginner', 'intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss', 'generalHealth'], type: 'isolation', sets: 4, reps: '15-20', rest: 60 },
    { name: 'Seated Calf Raise', equipment: ['machines'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding'], type: 'isolation', sets: 4, reps: '15-20', rest: 60 },
    { name: 'Bodyweight Calf Raise', equipment: [], level: ['beginner'], goals: ['generalHealth', 'fatLoss'], type: 'isolation', sets: 3, reps: '20-25', rest: 45 },
    { name: 'Single Leg Calf Raise', equipment: [], level: ['intermediate'], goals: ['muscleBuilding', 'generalHealth'], type: 'isolation', sets: 3, reps: '12-15', rest: 45 },
  ],

  core: [
    { name: 'Plank', equipment: [], level: ['beginner', 'intermediate', 'advanced'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding', 'strength'], type: 'compound', sets: 3, reps: '30-60s', rest: 45, injuryFlags: ['lower back', 'back'] },
    { name: 'Dead Bug', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth', 'fatLoss', 'muscleBuilding'], type: 'compound', sets: 3, reps: '10 each', rest: 45 },
    { name: 'Cable Crunch', equipment: ['cables'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss'], type: 'isolation', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Ab Wheel Rollout', equipment: ['ab_wheel'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength'], type: 'compound', sets: 3, reps: '8-12', rest: 60, injuryFlags: ['lower back', 'back'] },
    { name: 'Hanging Leg Raise', equipment: ['pull_up_bar'], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'fatLoss'], type: 'compound', sets: 3, reps: '10-12', rest: 60 },
    { name: 'Copenhagen Plank', equipment: [], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength', 'generalHealth'], type: 'compound', sets: 3, reps: '20-30s each', rest: 60 },
    { name: 'Pallof Press', equipment: ['cables', 'bands'], level: ['intermediate'], goals: ['muscleBuilding', 'generalHealth', 'strength'], type: 'compound', sets: 3, reps: '12-15 each', rest: 60 },
  ],

  // Runner accessories — max 2 added to leg sessions only, never replace main program
  runnerSupport: [
    { name: 'Copenhagen Plank', equipment: [], level: ['intermediate', 'advanced'], goals: ['muscleBuilding', 'strength', 'generalHealth'], type: 'compound', sets: 3, reps: '20-30s each', rest: 60 },
    { name: 'Single Leg RDL', equipment: ['dumbbells'], level: ['intermediate'], goals: ['muscleBuilding', 'generalHealth'], type: 'compound', sets: 3, reps: '10-12 each', rest: 75 },
    { name: 'Calf Raise', equipment: [], level: ['beginner', 'intermediate'], goals: ['muscleBuilding', 'generalHealth', 'fatLoss'], type: 'isolation', sets: 4, reps: '15-20', rest: 45 },
    { name: 'Single Leg Balance', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth'], type: 'isolation', sets: 3, reps: '30s each', rest: 30 },
    { name: 'Tibialis Raise', equipment: [], level: ['beginner', 'intermediate'], goals: ['generalHealth'], type: 'isolation', sets: 3, reps: '15-20', rest: 30 },
  ],
};

// -----------------------------------------------------------
// EQUIPMENT TAGS
// -----------------------------------------------------------
export function detectEquipmentTags(equipmentString) {
  const e = (equipmentString || '').toLowerCase();
  const tags = [];

  if (e.includes('full gym') || e.includes('full_gym')) {
    return ['barbell', 'squat_rack', 'dumbbells', 'cables', 'machines', 'bench', 'pull_up_bar', 'dip_bars', 'bands', 'ab_wheel', 'bodyweight'];
  }

  if (e.includes('barbell')) tags.push('barbell');
  if (e.includes('squat rack') || e.includes('rack')) tags.push('squat_rack', 'barbell');
  if (e.includes('dumbbell')) tags.push('dumbbells');
  if (e.includes('cable') || e.includes('machines')) tags.push('cables', 'machines');
  if (e.includes('bench')) tags.push('bench');
  if (e.includes('pull-up') || e.includes('pullup') || e.includes('pull_up')) tags.push('pull_up_bar');
  if (e.includes('dip')) tags.push('dip_bars');
  if (e.includes('band') || e.includes('resistance band')) tags.push('bands');
  if (e.includes('ab wheel')) tags.push('ab_wheel');

  tags.push('bodyweight');
  return [...new Set(tags)];
}

// -----------------------------------------------------------
// GOAL + LEVEL NORMALIZERS
// -----------------------------------------------------------
export function normalizeGoal(goal) {
  if (!goal) return 'fatLoss';
  const g = goal.toLowerCase().replace(/[\s_-]/g, '');
  if (g.includes('muscle') || g.includes('build') || g.includes('hypertrophy') || g.includes('musclebuilding')) return 'muscleBuilding';
  if (g.includes('strength') || g.includes('strong') || g.includes('power')) return 'strength';
  if (g.includes('fat') || g.includes('weight') || g.includes('slim') || g.includes('lean') || g.includes('fatloss')) return 'fatLoss';
  if (g.includes('general') || g.includes('health') || g.includes('fitness') || g.includes('wellness')) return 'generalHealth';
  return 'fatLoss';
}

export function normalizeLevel(level) {
  if (!level) return 'beginner';
  const l = level.toLowerCase();
  if (l.includes('advanced') || l.includes('competitive') || l.includes('expert')) return 'advanced';
  if (l.includes('intermediate')) return 'intermediate';
  return 'beginner';
}

export function formatGoal(goal) {
  const map = { fatLoss: 'Fat Loss', muscleBuilding: 'Muscle Building', strength: 'Strength', generalHealth: 'General Health' };
  return map[normalizeGoal(goal)] || goal;
}

export function formatSplit(split) {
  const map = { fullBody: 'Full Body', upperLower: 'Upper / Lower', pushPullLegs: 'Push / Pull / Legs', push: 'Push', pull: 'Pull', legs: 'Legs', upper: 'Upper', lower: 'Lower' };
  return map[split] || split;
}

/** Merge common profile field aliases so buildProgram / prompts match app storage. */
export function normalizeUserProfileForProgram(profile = {}) {
  const p = profile && typeof profile === 'object' ? { ...profile } : {};
  if (p.bodyweight == null && p.body_weight != null) p.bodyweight = p.body_weight;
  if (p.body_weight == null && p.bodyweight != null) p.body_weight = p.bodyweight;
  if (!p.id) p.id = p.userId || 'forma_local_user';
  if (p.injuries_details == null && p.injury_details) p.injuries_details = p.injury_details;
  if (p.session_minutes == null && p.sessionDuration != null) p.session_minutes = p.sessionDuration;

  const expFromArray = Array.isArray(p.experience_levels)
    ? p.experience_levels.find((x) => x != null && String(x).trim() !== '')
    : null;
  p.experience_level = expFromArray || p.experience_level || p.experienceLevel || '';

  const dpwRaw = p.days_per_week ?? p.daysPerWeek;
  const dpwNum = Number.parseInt(String(dpwRaw ?? ''), 10);
  p.days_per_week = Number.isFinite(dpwNum) && dpwNum > 0
    ? Math.max(2, Math.min(6, dpwNum))
    : 3;

  const cardioRaw = p.cardio_type != null ? String(p.cardio_type) : '';
  const cardio = cardioRaw.toLowerCase() === 'none' ? '' : (p.cardio_type || '');
  const fromSportsArr = Array.isArray(p.sports_or_activities) && p.sports_or_activities.length
    ? p.sports_or_activities[0]
    : '';
  const sportMerged = p.sport_or_activity || cardio || fromSportsArr || '';
  p.sport_or_activity = sportMerged || null;

  return p;
}

function formatInjuriesLine(profile) {
  const details = String(profile?.injuries_details || '').trim();
  if (profile?.injuries === true && details) return `Yes — ${details}`;
  if (profile?.injuries === true) return 'Yes (see app for details)';
  if (details) return details;
  return 'none reported';
}

function formatFullWeekSchedule(program) {
  if (!program?.weeklySchedule?.length) return 'Program not loaded';
  const sessions = program.sessions || {};
  return program.weeklySchedule
    .map((s) => {
      if (s.sessionType === 'rest' || !s.sessionKey) {
        return `  - ${s.day}: Rest`;
      }
      const sess = sessions[s.sessionKey];
      const names = (sess?.movements || [])
        .map((m) => m.exerciseName || m.name)
        .filter(Boolean);
      const preview = names.length ? names.join(', ') : `${s.exerciseCount ?? 0} exercises`;
      return `  - ${s.day}: ${s.sessionName} — ${preview}`;
    })
    .join('\n');
}

// -----------------------------------------------------------
// EXERCISE SELECTOR
// -----------------------------------------------------------
export function selectExercisesForMuscle(muscleGroup, { goal, level, equipmentTags, injuries, count = 2 }) {
  const pool = EXERCISE_DATABASE[muscleGroup] || [];
  const injuryLower = (injuries || '').toLowerCase();

  const valid = pool.filter(ex => {
    const hasEquipment = ex.equipment.length === 0 || ex.equipment.every(eq => equipmentTags.includes(eq));
    const rightLevel = ex.level.includes(level);
    const rightGoal = ex.goals.includes(goal);
    const safeForInjury = !ex.injuryFlags || !ex.injuryFlags.some(flag => injuryLower.includes(flag));
    return hasEquipment && rightLevel && rightGoal && safeForInjury;
  });

  // Compounds first
  return valid.sort((a, b) => {
    if (a.type === 'compound' && b.type !== 'compound') return -1;
    if (a.type !== 'compound' && b.type === 'compound') return 1;
    return 0;
  }).slice(0, count);
}

// -----------------------------------------------------------
// SPLIT SELECTOR
// -----------------------------------------------------------
export function getSplit(goal, level, daysPerWeek) {
  const days = parseInt(daysPerWeek);
  if (level === 'beginner') return { type: 'fullBody', sessions: Math.min(days, 3) };
  if (level === 'intermediate') {
    if (days <= 3) return { type: 'fullBody', sessions: 3 };
    if (days === 4) return { type: 'upperLower', sessions: 4 };
    return { type: 'pushPullLegs', sessions: days };
  }
  if (level === 'advanced') {
    if (days <= 3) return { type: 'upperLower', sessions: days };
    if (days === 4) return { type: 'upperLower', sessions: 4 };
    return { type: 'pushPullLegs', sessions: days };
  }
  return { type: 'fullBody', sessions: 3 };
}

// -----------------------------------------------------------
// WEEKLY SCHEDULE BUILDER
// -----------------------------------------------------------
function buildWeeklySchedule(splitType, daysPerWeek) {
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule = [];

  const scheduleMap = {
    fullBody: [
      { day: 'Monday', type: 'fullBody', name: 'Full Body' },
      { day: 'Wednesday', type: 'fullBody', name: 'Full Body' },
      { day: 'Friday', type: 'fullBody', name: 'Full Body' },
    ],
    upperLower: [
      { day: 'Monday', type: 'upper', name: 'Upper' },
      { day: 'Tuesday', type: 'lower', name: 'Lower' },
      { day: 'Thursday', type: 'upper', name: 'Upper' },
      { day: 'Friday', type: 'lower', name: 'Lower' },
    ],
    pushPullLegs: parseInt(daysPerWeek) >= 6 ? [
      { day: 'Monday', type: 'push', name: 'Push' },
      { day: 'Tuesday', type: 'pull', name: 'Pull' },
      { day: 'Wednesday', type: 'legs', name: 'Legs' },
      { day: 'Thursday', type: 'push', name: 'Push' },
      { day: 'Friday', type: 'pull', name: 'Pull' },
      { day: 'Saturday', type: 'legs', name: 'Legs' },
    ] : [
      { day: 'Monday', type: 'push', name: 'Push' },
      { day: 'Tuesday', type: 'pull', name: 'Pull' },
      { day: 'Wednesday', type: 'legs', name: 'Legs' },
      { day: 'Thursday', type: 'upper', name: 'Upper' },
      { day: 'Friday', type: 'lower', name: 'Lower' },
    ],
  };

  const trainingDays = scheduleMap[splitType] || scheduleMap.fullBody;

  allDays.forEach(day => {
    const found = trainingDays.find(d => d.day === day);
    if (found) {
      schedule.push({ day, sessionType: found.type, sessionName: `${day} — ${found.name}` });
    } else {
      schedule.push({ day, sessionType: 'rest', sessionName: 'Rest Day', sessionKey: null });
    }
  });

  return schedule;
}

// -----------------------------------------------------------
// SESSION BUILDER
// -----------------------------------------------------------
function buildSession(sessionType, sessionName, { goal, level, equipmentTags, injuries, sport, sessionDuration }) {
  const isRunner = sport && (sport.toLowerCase().includes('run') || sport.toLowerCase().includes('marathon') || sport.toLowerCase().includes('race'));
  const isLegSession = ['lower', 'legs', 'fullBody'].includes(sessionType);

  const muscleGroupMap = {
    fullBody: [
      { group: 'quads', count: 1 },
      { group: 'hamstrings', count: 1 },
      { group: 'chest', count: 1 },
      { group: 'back', count: 1 },
      { group: 'shoulders', count: 1 },
      { group: 'core', count: 1 },
    ],
    upper: [
      { group: 'chest', count: 2 },
      { group: 'back', count: 2 },
      { group: 'shoulders', count: 1 },
      { group: 'triceps', count: 1 },
      { group: 'biceps', count: 1 },
    ],
    lower: [
      { group: 'quads', count: 2 },
      { group: 'hamstrings', count: 2 },
      { group: 'glutes', count: 1 },
      { group: 'calves', count: 1 },
      { group: 'core', count: 1 },
    ],
    push: [
      { group: 'chest', count: 3 },
      { group: 'shoulders', count: 2 },
      { group: 'triceps', count: 2 },
    ],
    pull: [
      { group: 'back', count: 3 },
      { group: 'biceps', count: 2 },
      { group: 'shoulders', count: 1 },
    ],
    legs: [
      { group: 'quads', count: 2 },
      { group: 'hamstrings', count: 2 },
      { group: 'glutes', count: 1 },
      { group: 'calves', count: 1 },
      { group: 'core', count: 1 },
    ],
  };

  const muscleGroups = muscleGroupMap[sessionType] || muscleGroupMap.fullBody;
  const movements = [];

  muscleGroups.forEach(({ group, count }) => {
    const exercises = selectExercisesForMuscle(group, { goal, level, equipmentTags, injuries, count });
    exercises.forEach(ex => {
      movements.push({
        order: movements.length + 1,
        exerciseName: ex.name,
        muscleGroup: group,
        type: ex.type,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.rest,
        equipment: ex.equipment,
      });
    });
  });

  // Add runner support to leg sessions — max 2 accessories, never replaces main program
  if (isRunner && isLegSession) {
    const injuryLower = (injuries || '').toLowerCase();
    const runnerExtras = EXERCISE_DATABASE.runnerSupport
      .filter(ex => {
        const hasEquipment = ex.equipment.length === 0 || ex.equipment.every(eq => equipmentTags.includes(eq));
        const safe = !ex.injuryFlags || !ex.injuryFlags.some(f => injuryLower.includes(f));
        return hasEquipment && safe;
      })
      .slice(0, 2);

    runnerExtras.forEach(ex => {
      movements.push({
        order: movements.length + 1,
        exerciseName: ex.name,
        muscleGroup: 'runnerSupport',
        type: ex.type,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.rest,
        equipment: ex.equipment,
        note: 'Running support',
      });
    });
  }

  return {
    name: sessionName,
    sessionType,
    sessionDuration,
    movements,
    exerciseCount: movements.length,
  };
}

// -----------------------------------------------------------
// MAIN PROGRAM BUILDER — call this with full user profile
// -----------------------------------------------------------
export function buildProgram(userProfile) {
  const userProfileN = normalizeUserProfileForProgram(userProfile || {});
  const {
    goal, experience_level, days_per_week, session_minutes,
    equipment, injuries_details, sport_or_activity, cardio_type, bodyweight,
  } = userProfileN;

  const normalizedGoal = normalizeGoal(goal);
  const normalizedLevel = normalizeLevel(experience_level);
  const equipmentTags = detectEquipmentTags(equipment);
  const sport = sport_or_activity || cardio_type || '';
  const sessionDuration = parseInt(session_minutes) || 60;

  const splitInfo = getSplit(normalizedGoal, normalizedLevel, days_per_week);
  const weeklySchedule = buildWeeklySchedule(splitInfo.type, days_per_week);

  const sessions = {};
  weeklySchedule
    .filter(s => s.sessionType !== 'rest')
    .forEach((s, i) => {
      const key = `sess-${s.day.toLowerCase()}-${i}`;
      sessions[key] = buildSession(s.sessionType, s.sessionName, {
        goal: normalizedGoal,
        level: normalizedLevel,
        equipmentTags,
        injuries: injuries_details,
        sport,
        sessionDuration,
      });
      s.sessionKey = key;
      s.sessionDuration = sessionDuration;
      s.exerciseCount = sessions[key].exerciseCount;
    });

  return {
    userId: userProfileN.id,
    goal: normalizedGoal,
    trainingStyle: equipmentTags.includes('barbell') ? 'gym' : equipmentTags.includes('dumbbells') ? 'home_equipped' : 'bodyweight',
    experienceLevel: normalizedLevel,
    split: splitInfo.type,
    daysPerWeek: parseInt(days_per_week),
    sessionMinutes: sessionDuration,
    weeklySchedule,
    sessions,
    sessionHistory: [],
    injuries: injuries_details || null,
    sport: sport || null,
    bodyweight: bodyweight || null,
    createdAt: new Date().toISOString(),
    profileSnapshot: { ...userProfileN },
  };
}

// -----------------------------------------------------------
// PROGRESSIVE OVERLOAD
// -----------------------------------------------------------
export function getProgressionDecision(lastSession) {
  const { allRepsHit, difficultyRating, sorenessScore, missedSessions } = lastSession;
  if (allRepsHit && difficultyRating === 'easy' && sorenessScore <= 3 && missedSessions === 0) {
    return { action: 'increase', suggestion: 'Add 5 lbs or 1 rep per set.', reason: 'You hit everything and recovered well.' };
  }
  if (!allRepsHit || difficultyRating === 'hard' || sorenessScore >= 7 || missedSessions >= 2) {
    return { action: 'decrease', suggestion: 'Drop weight 5 lbs or deload this week.', reason: 'Your body needs more recovery.' };
  }
  return { action: 'hold', suggestion: 'Keep the same weight, focus on form.', reason: 'Solid session. Lock in the technique.' };
}

// -----------------------------------------------------------
// INJURY TRIAGE
// -----------------------------------------------------------
export function triageInjury(injuryReport) {
  const report = (injuryReport || '').toLowerCase();
  const severeKeywords = ['sharp pain', 'pop', 'snap', 'swelling', "can't walk", 'numbness', 'tingling'];
  const moderateKeywords = ['week', 'chronic', 'keeps', "won't go away", 'pain during', 'pain on'];
  if (severeKeywords.some(k => report.includes(k))) {
    return { severity: 'severe', action: 'stop', message: 'Stop training and see a doctor before your next session.', continueProgram: false };
  }
  if (moderateKeywords.some(k => report.includes(k))) {
    return { severity: 'moderate', action: 'restructure', message: "I'll rebuild your program around this.", continueProgram: true };
  }
  return { severity: 'mild', action: 'swap', message: "I'll swap that exercise for something safer.", continueProgram: true };
}

// -----------------------------------------------------------
// PROGRAM EDITOR — called by chat when user requests changes
// This is what makes FORMA different from every other AI app
// -----------------------------------------------------------
export function applyProgramEdit(program, editInstruction) {
  const instruction = editInstruction.toLowerCase();
  const updatedProgram = JSON.parse(JSON.stringify(program));
  const changesMade = [];

  // SWAP: "replace X with Y" or "swap X for Y"
  const swapMatch = instruction.match(/(?:replace|swap|change|substitute)\s+(.+?)\s+(?:with|for)\s+(.+)/);
  if (swapMatch) {
    const removeEx = swapMatch[1].trim();
    const addEx = swapMatch[2].trim().replace(/[.,!?].*/, '');
    Object.entries(updatedProgram.sessions).forEach(([key, session]) => {
      session.movements?.forEach(movement => {
        if (movement.exerciseName.toLowerCase().includes(removeEx)) {
          const oldName = movement.exerciseName;
          movement.exerciseName = toTitleCase(addEx);
          changesMade.push(`Replaced "${oldName}" with "${movement.exerciseName}" in ${session.name}`);
        }
      });
    });
  }

  // REMOVE: "remove X" or "take out X"
  const removeMatch = instruction.match(/(?:remove|take out|delete|skip|no more)\s+(.+)/);
  if (removeMatch && !swapMatch) {
    const removeEx = removeMatch[1].trim().replace(/[.,!?].*/, '');
    Object.entries(updatedProgram.sessions).forEach(([key, session]) => {
      const before = session.movements?.length || 0;
      session.movements = session.movements?.filter(m =>
        !m.exerciseName.toLowerCase().includes(removeEx)
      ) || [];
      const after = session.movements.length;
      if (before !== after) {
        session.exerciseCount = after;
        changesMade.push(`Removed "${removeEx}" from ${session.name}`);
      }
    });
  }

  // ADD: "add X" or "add X to Monday"
  const addMatch = instruction.match(/add\s+(.+?)(?:\s+to\s+(.+))?$/);
  if (addMatch && !swapMatch && !removeMatch) {
    const exerciseToAdd = addMatch[1].trim().replace(/more\s+/, '').replace(/[.,!?].*/, '');
    const targetDay = addMatch[2]?.trim();
    Object.entries(updatedProgram.sessions).forEach(([key, session]) => {
      if (!targetDay || session.name.toLowerCase().includes(targetDay.toLowerCase())) {
        session.movements = session.movements || [];
        session.movements.push({
          order: session.movements.length + 1,
          exerciseName: toTitleCase(exerciseToAdd),
          muscleGroup: 'added',
          type: 'compound',
          sets: 3,
          reps: '10-12',
          restSeconds: 75,
          equipment: [],
          note: 'Added by coach',
        });
        session.exerciseCount = session.movements.length;
        changesMade.push(`Added "${toTitleCase(exerciseToAdd)}" to ${session.name}`);
      }
    });
  }

  return { updatedProgram, changesMade };
}

function toTitleCase(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// -----------------------------------------------------------
// CLAUDE API SYSTEM PROMPT BUILDER
// -----------------------------------------------------------
export function buildSystemPrompt(userProfile, program) {
  const profile = normalizeUserProfileForProgram(userProfile || {});
  const goal = formatGoal(program?.goal || profile?.goal);
  const level = normalizeLevel(profile?.experience_level);
  const bodyLb = profile.bodyweight ?? profile.body_weight;
  const proteinTarget = bodyLb != null && Number(bodyLb) > 0 ? Math.round(Number(bodyLb) * 0.8) : null;

  const weekSchedule = formatFullWeekSchedule(program);
  const splitLabel = program?.split ? formatSplit(program.split) : 'not set';

  return `You are the FORMA AI personal trainer — built by a competitive boxer and certified personal trainer with multi-sport experience.

USER PROFILE:
- Name: ${profile?.name || 'User'}
- Body weight: ${bodyLb != null && Number(bodyLb) > 0 ? `${bodyLb} lbs` : 'not provided'}
- Goal: ${goal}
- Experience: ${level}
- Training days/week: ${profile?.days_per_week ?? 'not set'}
- Session length: ${profile?.session_minutes || 60} min
- Equipment: ${profile?.equipment || 'not set'}
- Sport / cardio: ${profile?.sport_or_activity || profile?.cardio_type || 'none'}
- Injuries / limitations: ${formatInjuriesLine(profile)}
${proteinTarget ? `- Daily protein target: ${proteinTarget}g (0.8g per lb bodyweight)` : ''}

THIS WEEK'S PROGRAM (full week — training and rest):
- Split: ${splitLabel}
${weekSchedule}

YOUR RULES:
1. You have their full profile above — NEVER say you don't know their weight, goal, or injuries.
2. Always use their actual body weight for protein/calorie calculations.
3. Goal is ${goal} — every recommendation must serve this specific goal.
4. If injuries are listed, never recommend exercises that aggravate them.
5. When they ask to change their program, confirm what was changed and on which day.
6. Be direct and specific. Short responses unless they ask for detail.
7. You can actually edit their program — when you do, tell them exactly what changed.

NEVER:
- Say "I don't have access to your profile"
- Give generic advice that ignores their specific goal
- Recommend exercises that conflict with their injuries
- Suggest supplements beyond protein and creatine`.trim();
}

// -----------------------------------------------------------
// LEGACY COMPATIBILITY HELPERS
// -----------------------------------------------------------
export const PROGRAM_STORAGE_KEY = 'forma_user_program';
export const TODAY_SESSION_KEY = 'forma_today_session';
export const SESSION_LOG_KEY = 'forma_session_logs';

export function loadProgramFromStorage() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROGRAM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProgramToStorage(program) {
  if (typeof localStorage === 'undefined' || !program) return;
  try {
    localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(program));
  } catch {
    /* noop */
  }
}

export function hasProgramSessions(program) {
  return Boolean(program?.sessions && Object.keys(program.sessions).length > 0);
}

export function getDefaultProgramProfile(overrides = {}) {
  return {
    id: overrides.id ?? 'forma_local_user',
    name: overrides.name ?? 'Friend',
    goal: 'fat loss',
    training_style: 'gym',
    experience_level: 'Complete beginner',
    days_per_week: 3,
    session_minutes: 60,
    equipment: 'full gym',
    ...overrides,
  };
}

export function profileTrainingFieldsFromEquipment(equipment) {
  const tags = detectEquipmentTags(equipment || '');
  if (tags.includes('barbell')) {
    return { training_style: 'gym', training_styles: ['gym'], trainingStyle: 'gym' };
  }
  if (tags.includes('dumbbells') || tags.includes('bench')) {
    return { training_style: 'home workout', training_styles: ['home workout'], trainingStyle: 'home workout' };
  }
  return { training_style: 'calisthenics', training_styles: ['calisthenics'], trainingStyle: 'calisthenics' };
}

export function inferHomeEquipmentIdsFromEquipmentText(equipment) {
  const tags = detectEquipmentTags(equipment || '');
  if (tags.includes('barbell')) return ['full'];
  if (tags.includes('dumbbells')) return ['basics'];
  if (tags.includes('bands')) return ['bands'];
  return ['none'];
}

export function clearTodaySessionOverride() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(TODAY_SESSION_KEY);
  } catch {
    /* noop */
  }
}

function toTrainExercise(m, idx) {
  const parts = String(m?.reps || '').split('-').map((x) => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const repRange = parts.length === 2 ? parts : [8, 12];
  return {
    id: m.exerciseId || m.id || `ex-${idx}`,
    name: m.exerciseName || m.name || '',
    displayName: m.exerciseName || m.name || '',
    sets: m.sets,
    repRange,
    restSeconds: m.restSeconds,
    coachingCues: m.coachingCues || '',
    progression: m.progression || '',
    regression: m.regression || '',
  };
}

export function getTodaySessionWithOverride(program, date = new Date()) {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(TODAY_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.dateKey) {
        const dk = date.toISOString().slice(0, 10);
        if (parsed.dateKey === dk) return parsed;
      }
    } catch {
      /* noop */
    }
  }
  if (!program?.weeklySchedule || !program?.sessions) return null;
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const entry = program.weeklySchedule.find((d) => d.day === dayName);
  if (!entry?.sessionKey) {
    return { id: 'rest', name: 'Recovery day', environment: 'rest', exercises: [], style: 'rest' };
  }
  const sess = program.sessions[entry.sessionKey];
  if (!sess) return null;
  return {
    id: entry.sessionKey,
    sessionKey: entry.sessionKey,
    name: entry.sessionName || sess.name,
    environment: entry.environment || sess.environment || 'gym',
    exercises: (sess.movements || []).map(toTrainExercise),
    warmUp: sess.warmUp,
    coolDown: sess.coolDown,
    estimatedDuration: sess.sessionDuration || entry.sessionDuration || program.sessionMinutes || 60,
  };
}

export function resolveTrainSession(program, styleId = 'program', date = new Date()) {
  return { session: getTodaySessionWithOverride(program, date), fromCheckIn: false };
}

export function appendSessionLog(entry) {
  if (typeof localStorage === 'undefined' || !entry) return;
  try {
    const raw = localStorage.getItem(SESSION_LOG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(list) ? [entry, ...list].slice(0, 200) : [entry];
    localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function appendCompletedSessionToProgram(program, entry) {
  if (!program || typeof program !== 'object') return null;
  const next = {
    ...program,
    sessionHistory: [...(Array.isArray(program.sessionHistory) ? program.sessionHistory : []), entry].slice(-80),
  };
  saveProgramToStorage(next);
  clearTodaySessionOverride();
  return next;
}

export function buildAndSaveTodaySessionFromCheckIn(program, checkInUi, date = new Date()) {
  const session = getTodaySessionWithOverride(program, date);
  if (!session || session.environment === 'rest') return null;
  const payload = {
    ...session,
    dateKey: date.toISOString().slice(0, 10),
    checkIn: checkInUi || null,
  };
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(TODAY_SESSION_KEY, JSON.stringify(payload));
    } catch {
      /* noop */
    }
  }
  return payload;
}

export function ensureProgramLoaded() {
  let program = loadProgramFromStorage();
  if (hasProgramSessions(program)) return program;
  let storedProfile = {};
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('forma_user_profile') : null;
    storedProfile = raw ? JSON.parse(raw) : {};
  } catch {
    storedProfile = {};
  }
  const fallbackProfile = normalizeUserProfileForProgram({ ...getDefaultProgramProfile(), ...storedProfile });
  program = buildProgram(fallbackProfile);
  saveProgramToStorage(program);
  return program;
}

export function getProgramContextForWorkouts(program, fallbackDaysPerWeek = 3) {
  const resolved = hasProgramSessions(program) ? program : ensureProgramLoaded();
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const trainingEntries = (resolved?.weeklySchedule || []).filter((w) => w?.sessionKey);
  const daysPerWeek = Math.max(1, Number(resolved?.daysPerWeek) || trainingEntries.length || fallbackDaysPerWeek);
  const todayEntry = (resolved?.weeklySchedule || []).find((w) => w?.day === dayName);
  const dayInBlock = todayEntry?.sessionKey
    ? Math.max(1, trainingEntries.findIndex((w) => w.day === dayName) + 1)
    : 0;

  return {
    programWeek: 1,
    dayInBlock,
    daysPerWeek,
    weekday: dayName,
    todaySessionName: todayEntry?.sessionName || null,
    splitId: resolved?.split || null,
  };
}

export function getTodayTrainExercisesSync(styleId = 'gym', date = new Date()) {
  const program = ensureProgramLoaded();
  const { session } = resolveTrainSession(program, styleId, date);
  return (session?.exercises || []).map((ex, i) => ({
    id: ex.id || `ex-${i}`,
    displayName: ex.displayName || ex.name || 'Exercise',
    name: ex.name || ex.displayName || 'Exercise',
    sets: ex.sets || 3,
    repRange: ex.repRange || [8, 12],
    repsMin: ex.repRange?.[0] || 8,
    repsMax: ex.repRange?.[1] || 12,
    order: ex.order ?? i + 1,
    restSeconds: ex.restSeconds ?? 75,
    repsScheme: ex.repsScheme,
    repsPerSet: ex.repsPerSet,
    description: ex.description || ex.coachingCues || '',
    progression: ex.progression || '',
    regression: ex.regression || '',
    exerciseNumber: ex.exerciseNumber,
    musclesWorked: ex.musclesWorked || '',
    weightSuggestion: ex.weightSuggestion || '',
    equipmentRequired: ex.equipmentRequired || '',
  }));
}

export function buildCalendarWeekPlanFromProgram(program, anchorDate = new Date()) {
  const resolved = hasProgramSessions(program) ? program : ensureProgramLoaded();
  const start = new Date(anchorDate);
  start.setDate(anchorDate.getDate() - anchorDate.getDay());
  start.setHours(0, 0, 0, 0);

  const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    const dayIndex = d.getDay();
    const entry = (resolved?.weeklySchedule || []).find((w) => w.day === dayLong[dayIndex]);
    days.push({
      dateKey,
      dayIndex,
      weekdayShort: dayShort[dayIndex],
      chipLabel: entry?.sessionKey ? (entry?.sessionType || 'session') : 'Rest',
      sessionKey: entry?.sessionKey || null,
    });
  }

  return {
    weekStartDateKey: start.toISOString().slice(0, 10),
    days,
    goal: resolved?.goal,
    splitId: resolved?.split || null,
  };
}
