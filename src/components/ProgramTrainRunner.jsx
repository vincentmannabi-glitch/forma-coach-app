import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../pages/Train.css'
import { useAuth } from '../contexts/AuthContext'
import { saveSession } from '../utils/workouts'
import { safeSetCount } from '../utils/exerciseCardContent'
import { buildSafeHomeUser } from '../utils/homeSafeUser'
import TrainExerciseCard from './TrainExerciseCard'
import {
  appendCompletedSessionToProgram,
  appendSessionLog,
  getDefaultProgramProfile,
  hasProgramSessions,
  loadProgramFromStorage,
  resolveTrainSession,
  saveProgramToStorage,
} from '../utils/programBuilder'
import { buildProgramForProfile } from '../utils/programBuilderRouter'

function initLogs(exList) {
  const logs = {}
  ;(exList || []).forEach((ex) => {
    const n = safeSetCount(ex)
    logs[ex.id] = {
      sets: Array.from({ length: n }, () => ({
        weight: '',
        reps: '',
        completed: false,
      })),
    }
  })
  return logs
}

function ProtocolBlock({ title, protocol }) {
  if (!protocol?.steps?.length) return null
  return (
    <section className="train-protocol-block" aria-label={title}>
      <h2 className="train-protocol-title">{protocol.title || title}</h2>
      {protocol.protocolRef ? <p className="train-protocol-ref">{protocol.protocolRef}</p> : null}
      {protocol.homeNote ? <p className="train-protocol-note">{protocol.homeNote}</p> : null}
      {protocol.extraNote ? <p className="train-protocol-note">{protocol.extraNote}</p> : null}
      <ol className="train-protocol-steps">
        {protocol.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </section>
  )
}

function FinisherBlock({ label, finisher }) {
  if (!finisher?.movements?.length) return null
  return (
    <section className="train-protocol-block train-finisher" aria-label={label}>
      <h2 className="train-protocol-title">{label}</h2>
      {finisher.structure ? <p className="train-protocol-ref">{finisher.structure}</p> : null}
      {finisher.tier ? <p className="train-protocol-note">Tier: {finisher.tier}</p> : null}
      <ol className="train-protocol-steps">
        {finisher.movements.map((m, i) => (
          <li key={i}>
            {m.name} — {m.reps}
          </li>
        ))}
      </ol>
    </section>
  )
}

function prettyLabel(v) {
  const key = String(v || '').trim()
  const map = {
    fullBody: 'Full Body',
    calisthenics: 'Calisthenics',
    muscleBuilding: 'Muscle Building',
    fatLoss: 'Fat Loss',
    upperLower: 'Upper / Lower',
  }
  if (map[key]) return map[key]
  return key ? key.replace(/([A-Z])/g, ' $1').trim() : '—'
}

export default function ProgramTrainRunner({ styleId = 'program', title = 'Training session', showBackLink = true }) {
  const navigate = useNavigate()
  const { profile: authProfile } = useAuth()
  const safeUser = useMemo(() => buildSafeHomeUser(authProfile), [authProfile])

  const program = useMemo(() => {
    try {
      const stored = loadProgramFromStorage()
      if (hasProgramSessions(stored)) return stored
      const fallbackProfile = {
        ...getDefaultProgramProfile({ id: safeUser.id, name: safeUser.name }),
        ...authProfile,
      }
      const built = buildProgramForProfile(fallbackProfile)
      saveProgramToStorage(built)
      return built
    } catch {
      return buildProgramForProfile(getDefaultProgramProfile())
    }
  }, [safeUser.id, safeUser.name, authProfile])

  const { session: resolvedSession, fromCheckIn } = useMemo(
    () => resolveTrainSession(program, styleId, new Date()),
    [program, styleId],
  )
  const session = resolvedSession
  const exercises = useMemo(() => {
    const listed = session?.exercises || []
    if (listed.length > 0) return listed
    const key = session?.sessionKey
    if (!key) return listed
    const raw = program?.sessions?.[key]
    const moves = raw?.movements || []
    return moves.map((m, idx) => ({
      id: m.exerciseId || m.id || `ex-${idx}`,
      name: m.exerciseName || m.name || m.displayName || 'Exercise',
      displayName: m.exerciseName || m.displayName || m.name || 'Exercise',
      sets: m.sets,
      repRange: m.repRange,
      restSeconds: m.restSeconds,
      description: m.coachingCues || m.description || '',
      coachingCues: m.coachingCues || '',
      progression: m.progression,
      regression: m.regression,
      order: m.order ?? idx + 1,
    }))
  }, [session, program])
  const level = program?.profileSnapshot?.level || 'beginner'

  const [logs, setLogs] = useState(() => initLogs(exercises))
  const [expandedId, setExpandedId] = useState(null)
  const [restRemaining, setRestRemaining] = useState(null)
  const [skipTarget, setSkipTarget] = useState(null)
  const [skipReason, setSkipReason] = useState('')
  const [skipMap, setSkipMap] = useState({})
  const [painNote, setPainNote] = useState('')

  useEffect(() => {
    setLogs(initLogs(exercises))
    setExpandedId(null)
    setRestRemaining(null)
    setSkipMap({})
    setPainNote('')
  }, [session?.id, session?.dateKey, exercises.length])

  useEffect(() => {
    if (restRemaining == null || restRemaining <= 0) return
    const t = window.setInterval(() => {
      setRestRemaining((r) => (r == null || r <= 1 ? null : r - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [restRemaining])

  const updateSet = useCallback((exerciseId, setIndex, patch) => {
    setLogs((prev) => {
      const row = prev[exerciseId]
      if (!row) return prev
      return {
        ...prev,
        [exerciseId]: {
          sets: row.sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)),
        },
      }
    })
  }, [])

  const handleSetComplete = useCallback(
    (exerciseId, setIndex, completed) => {
      updateSet(exerciseId, setIndex, { completed })
      if (completed) {
        const ex = exercises.find((e) => e.id === exerciseId)
        const sec = ex?.restSeconds
        if (sec != null && Number(sec) > 0) setRestRemaining(Number(sec))
      }
    },
    [exercises, updateSet],
  )

  const flagSkip = useCallback((ex) => {
    setSkipTarget(ex)
    setSkipReason('')
  }, [])

  const handleFinishSession = async () => {
    const sessionExercises = exercises.filter((ex) => !skipMap[ex.id])
    const skipped = Object.entries(skipMap).map(([exerciseId, reason]) => ({ exerciseId, reason }))
    const exercisePayload = sessionExercises.map((ex) => ({
      exerciseId: ex.id,
      displayName: ex.displayName || ex.name,
      sets: (logs[ex.id]?.sets || []).map((s) => ({
        weight: s.weight === '' ? null : parseFloat(s.weight) || null,
        reps: s.reps === '' ? null : parseInt(s.reps, 10),
        completed: s.completed,
      })),
    }))

    await saveSession({
      sessionId: `${styleId}-${Date.now()}`,
      sessionName: session?.name || title,
      workoutType: styleId,
      level,
      exercises: exercisePayload,
      completedAt: new Date().toISOString(),
    })

    appendSessionLog({
      completedAt: new Date().toISOString(),
      styleId,
      sessionId: session?.id,
      exercises: exercisePayload,
      skipped,
      checkIn: session?.checkIn ?? null,
      painNote: painNote.trim() || null,
    })

    const latest = loadProgramFromStorage() || program
    appendCompletedSessionToProgram(latest, {
      completedAt: new Date().toISOString(),
      sessionKey: session?.sessionKey,
      sessionId: session?.id,
      sessionName: session?.name || title,
      styleId,
      exercises: exercisePayload,
      skipped,
      checkIn: session?.checkIn ?? null,
      painNote: painNote.trim() || null,
      fromCheckInAdjustment: fromCheckIn,
    })

    setLogs(initLogs(exercises))
    setExpandedId(null)
    setSkipMap({})
    setPainNote('')
    navigate('/progress')
  }

  if (session?.environment === 'rest') {
    return (
      <div className="train-page train-page-v2">
        {showBackLink ? (
          <Link to="/train" className="train-back-hub">← All workouts</Link>
        ) : null}
        <header className="train-v2-header">
          <h1 className="train-v2-title">{title}</h1>
          <p className="train-v2-subtitle">Today is a recovery day — light walk or mobility only if you feel like moving.</p>
        </header>
      </div>
    )
  }

  return (
    <div className="train-page train-page-v2">
      {restRemaining != null && restRemaining > 0 ? (
        <div className="train-rest-banner" role="status">
          Rest <strong>{restRemaining}</strong>s
          <button type="button" className="train-rest-dismiss" onClick={() => setRestRemaining(null)}>Skip</button>
        </div>
      ) : null}

      <header className="train-v2-header">
        {showBackLink ? (
          <Link to="/train" className="train-back-hub">← All workouts</Link>
        ) : null}
        <h1 className="train-v2-title">{session?.name || title}</h1>
        <p className="train-v2-subtitle">
          Goal {prettyLabel(program?.profileSnapshot?.goal)} · Level {prettyLabel(level)}
          {fromCheckIn ? <span className="train-checkin-badge"> · adjusted from check-in</span> : null}
        </p>
        {session?.estimatedDuration != null ? (
          <p className="train-v2-subtitle">About {session.estimatedDuration} min</p>
        ) : null}
      </header>

      <ProtocolBlock title="Warm-up" protocol={session?.warmUp} />

      <section className="train-v2-list">
        {exercises.length === 0 ? (
          <p className="train-empty-msg">No exercises scheduled for today.</p>
        ) : (
          exercises.map((ex) => {
            const skipped = !!skipMap[ex.id]
            return (
              <div key={ex.id} className={skipped ? 'train-ex-wrap train-ex-wrap--skipped' : 'train-ex-wrap'}>
                {skipped ? (
                  <p className="train-skipped-label">Skipped: {skipMap[ex.id]}</p>
                ) : (
                  <TrainExerciseCard
                    variant="gym"
                    trainLevel={level}
                    exercise={ex}
                    expanded={expandedId === ex.id}
                    onToggleExpand={() => setExpandedId((id) => (id === ex.id ? null : ex.id))}
                    sets={logs[ex.id]?.sets || []}
                    onUpdateSet={(i, p) => updateSet(ex.id, i, p)}
                    onSetComplete={(i, n) => handleSetComplete(ex.id, i, n)}
                    weightUnit="kg"
                  />
                )}
                {!skipped ? (
                  <>
                    <button type="button" className="train-skip-ex-btn" onClick={() => flagSkip(ex)}>
                      Skip exercise…
                    </button>
                    {skipTarget?.id === ex.id && (
                      <div className="train-skip-inline">
                        <input
                          type="text"
                          placeholder="Reason (equipment, pain, time…)"
                          value={skipReason}
                          onChange={(e) => setSkipReason(e.target.value)}
                          autoFocus
                        />
                        <button type="button" onClick={() => {
                          setSkipMap((m) => ({ ...m, [ex.id]: skipReason.trim() || 'unspecified' }))
                          setSkipTarget(null)
                          setSkipReason('')
                        }}>Confirm</button>
                        <button type="button" onClick={() => setSkipTarget(null)}>Cancel</button>
                      </div>
                    )}
                  </>
                ) : (
                  <button type="button" className="train-skip-ex-btn" onClick={() => setSkipMap((m) => { const n = { ...m }; delete n[ex.id]; return n })}>
                    Undo skip
                  </button>
                )}
              </div>
            )
          })
        )}
      </section>

      {session?.morningUnlock?.conditioningOptional && session?.conditioningFinisherOptional ? (
        <FinisherBlock label="Optional conditioning finisher (high energy day)" finisher={session.conditioningFinisherOptional} />
      ) : null}
      <FinisherBlock label="Conditioning finisher" finisher={session?.conditioningFinisher} />

      <label className="train-pain-field">
        Pain or flags for your coach (optional)
        <input
          type="text"
          value={painNote}
          onChange={(e) => setPainNote(e.target.value)}
          placeholder="e.g. sharp knee pain on set 3"
        />
      </label>

      <ProtocolBlock title="Cool-down" protocol={session?.coolDown} />

      <button type="button" className="train-complete-btn" onClick={handleFinishSession} style={{ marginTop: 16 }}>
        Complete session
      </button>
    </div>
  )
}
