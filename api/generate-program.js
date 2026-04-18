/**
 * AI Program Generator — Vercel serverless function
 * Called once after onboarding. The AI reads the client's full profile
 * and uses its coaching knowledge to generate a truly personalized program.
 * Returns a structured program object that gets saved to localStorage.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API key' })
  }

  const { profile, fallbackProgram } = req.body

  if (!profile) {
    return res.status(400).json({ error: 'No profile provided' })
  }

  const systemPrompt = buildProgramGeneratorPrompt()
  const userMessage = buildClientProgramRequest(profile)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(200).json({ program: fallbackProgram, aiGenerated: false })
    }

    const text = data.content?.find(c => c.type === 'text')?.text?.trim()
    if (!text) {
      return res.status(200).json({ program: fallbackProgram, aiGenerated: false })
    }

    // Parse the JSON program from the AI response
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
    if (!jsonMatch) {
      return res.status(200).json({ program: fallbackProgram, aiGenerated: false })
    }

    try {
      const aiProgram = JSON.parse(jsonMatch[1] || jsonMatch[0])
      // Merge AI program with fallback to ensure required fields exist
      const mergedProgram = mergeWithFallback(aiProgram, fallbackProgram, profile)
      return res.status(200).json({ program: mergedProgram, aiGenerated: true })
    } catch (parseErr) {
      console.error('Failed to parse AI program JSON:', parseErr)
      return res.status(200).json({ program: fallbackProgram, aiGenerated: false })
    }

  } catch (err) {
    console.error('Program generation error:', err)
    return res.status(200).json({ program: fallbackProgram, aiGenerated: false })
  }
}

function buildProgramGeneratorPrompt() {
  return `You are an elite certified personal trainer and strength and conditioning coach building a custom training program for a client. You have deep knowledge of exercise science, periodization, sport-specific training, injury management, and nutrition.

Your job is to take a client profile and generate a complete, personalized weekly training program. You think like a real coach — you look at the full picture and make intelligent decisions, not generic ones.

PROGRAM GENERATION RULES:

1. MATCH EQUIPMENT EXACTLY. If they only have dumbbells, every exercise uses dumbbells. If they have a full gym, use barbell compounds. Never program equipment they don't have.

2. MATCH EXPERIENCE LEVEL. Beginners get fundamental movement patterns, higher reps, more rest. Advanced athletes get complex movements, heavier loading, shorter rest.

3. MATCH THE GOAL. Fat loss = higher rep ranges (12-20), shorter rest (45-60s), supersets and circuits. Muscle building = moderate reps (8-12), moderate rest (75-90s), progressive overload focus. Strength = lower reps (3-6), longer rest (2-3min), heavy compounds first.

4. RESPECT INJURIES. If they have knee issues — no deep squats, lunges, or jumping. Sub in hip hinges, upper body work, leg press if available. If shoulder issues — no overhead pressing. If lower back — no heavy axial loading.

5. SPORT SPECIFIC OVERLAY. If they do Race Fit — add sled pushes, farmers carries, wall balls, rowing intervals. If running — add single-leg work, hip drive exercises, plyometrics. If CrossFit — add conditioning finishers, Olympic lift progressions.

6. REALISTIC SESSION STRUCTURE. 30 min = 4 exercises. 45 min = 5 exercises. 60 min = 6-7 exercises. 75-90 min = 7-8 exercises. Always include warm-up steps and cool-down steps.

7. PROGRESSIVE ACROSS THE WEEK. Each day should have a different focus — don't repeat the same muscles back to back. Distribute push/pull/legs intelligently.

You must respond with ONLY a valid JSON object in this exact structure. No explanation, no preamble — just the JSON:

\`\`\`json
{
  "aiGenerated": true,
  "coachNote": "1-2 sentence note from the coach explaining the program approach for this specific client",
  "weeklySchedule": [
    {
      "day": "Monday",
      "sessionType": "push",
      "sessionName": "Monday — Push",
      "sessionKey": "sess-monday-0",
      "environment": "gym",
      "sessionDuration": 60
    }
  ],
  "sessions": {
    "sess-monday-0": {
      "name": "Monday — Push",
      "environment": "gym",
      "estimatedDuration": 60,
      "warmUp": {
        "title": "Warm up",
        "steps": ["Step 1", "Step 2"]
      },
      "movements": [
        {
          "order": 1,
          "exerciseName": "Barbell Back Squat",
          "exerciseId": "1",
          "sets": 4,
          "repRange": [8, 12],
          "restSeconds": 90,
          "coachingCues": "Specific cue for this client",
          "weightSuggestion": "Start at X% bodyweight",
          "progression": "When to increase",
          "regression": "Easier version if needed"
        }
      ],
      "coolDown": {
        "title": "Cool down",
        "steps": ["Step 1", "Step 2"]
      }
    }
  }
}
\`\`\`

Make every coaching cue, weight suggestion, and progression note specific to this client's profile — not generic.`
}

function buildClientProgramRequest(profile) {
  const equipment = profile.equipment || 'Not specified'
  const goal = profile.goal || 'general fitness'
  const level = profile.experience_level || 'Complete beginner'
  const days = profile.days_per_week || 3
  const duration = profile.session_minutes || 60
  const injuries = profile.injuries ? `Yes — ${profile.injuries_details || 'details not provided'}` : 'None'
  const bodyWeight = profile.body_weight ? `${profile.body_weight} lbs` : 'Not provided'
  const cardio = profile.cardio_type && profile.cardio_type !== 'none' ? profile.cardio_type : 'None'
  const sport = profile.sports_or_activities?.join(', ') || 'None'

  const trainingDays = {
    2: ['Monday', 'Thursday'],
    3: ['Monday', 'Wednesday', 'Friday'],
    4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    5: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  }[days] || ['Monday', 'Wednesday', 'Friday']

  const restDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    .filter(d => !trainingDays.includes(d))

  return `Build a complete personalized training program for this client:

NAME: ${profile.name || 'Client'}
GOAL: ${goal}
EXPERIENCE LEVEL: ${level}
BODY WEIGHT: ${bodyWeight}
EQUIPMENT AVAILABLE: ${equipment}
TRAINING DAYS PER WEEK: ${days} (${trainingDays.join(', ')})
SESSION DURATION: ${duration} minutes
INJURIES / LIMITATIONS: ${injuries}
CARDIO / SPORT TRAINING: ${cardio}${sport !== 'None' ? ` / ${sport}` : ''}

Rest days: ${restDays.join(', ')} — include these in weeklySchedule with sessionKey: null

IMPORTANT NOTES:
- This person ${level.includes('beginner') ? 'is new to training — prioritize form, foundational movements, and building confidence' : level.includes('intermediate') ? 'has training experience — they can handle moderate complexity and progressive loading' : 'is advanced — they can handle complex movements, high intensity, and sport-specific demands'}
- ${injuries !== 'None' ? `They have injuries: ${injuries}. Avoid any movements that could aggravate this. Substitute intelligently.` : 'No injuries — full movement selection available'}
- ${cardio !== 'None' ? `They do ${cardio} training — program the strength sessions to COMPLEMENT not compete with their cardio. Consider fatigue management.` : 'Strength only — full recovery between sessions'}
- Make the sessionKey format exactly: sess-[dayname lowercase]-[index starting at 0] (e.g., sess-monday-0, sess-wednesday-1)
- Include ALL 7 days in weeklySchedule (training days with sessions, rest days with sessionKey: null)
- Every exercise must match their available equipment exactly

Generate the program now.`
}

function mergeWithFallback(aiProgram, fallbackProgram, profile) {
  if (!fallbackProgram) return aiProgram

  return {
    // Core identity from fallback
    userId: fallbackProgram.userId || profile?.id || 'forma_local_user',
    goal: fallbackProgram.goal || aiProgram.goal || profile?.goal,
    trainingStyle: fallbackProgram.trainingStyle || 'gym',
    experienceLevel: fallbackProgram.experienceLevel || profile?.experience_level,
    sessionHistory: fallbackProgram.sessionHistory || [],
    progressiveOverload: fallbackProgram.progressiveOverload,
    snackRecommendations: fallbackProgram.snackRecommendations || [],
    nutritionPhilosophy: fallbackProgram.nutritionPhilosophy || '',
    weeklyVolume: fallbackProgram.weeklyVolume,
    profileSnapshot: fallbackProgram.profileSnapshot,
    formulas: fallbackProgram.formulas,
    createdAt: new Date().toISOString(),
    // AI generated content
    aiGenerated: true,
    coachNote: aiProgram.coachNote || '',
    weeklySchedule: aiProgram.weeklySchedule || fallbackProgram.weeklySchedule,
    sessions: aiProgram.sessions || fallbackProgram.sessions,
    sessionsList: Object.entries(aiProgram.sessions || {}).map(([key, s]) => ({
      id: key,
      name: s.name,
      environment: s.environment || 'gym',
      exercises: (s.movements || []).map((m, i) => ({
        id: m.exerciseId || `ai-ex-${i}`,
        name: m.exerciseName,
        displayName: m.exerciseName,
        sets: m.sets,
        repRange: m.repRange,
        restSeconds: m.restSeconds,
        coachingCues: m.coachingCues,
        description: m.coachingCues,
        weightSuggestion: m.weightSuggestion,
        progression: m.progression,
        regression: m.regression,
        order: m.order || i + 1,
        musclesWorked: [],
      })),
      warmUp: s.warmUp,
      coolDown: s.coolDown,
      estimatedDuration: s.estimatedDuration,
      sessionKey: key,
    })),
  }
}
