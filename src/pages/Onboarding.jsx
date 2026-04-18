import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { completeOnboarding } from '../utils/auth'
import {
  saveProgramToStorage,
  profileTrainingFieldsFromEquipment,
  inferHomeEquipmentIdsFromEquipmentText,
} from '../utils/programBuilder'
import { generateAIProgram } from '../utils/aiProgramGenerator'
import './Onboarding.css'

const PROFILE_KEY = 'forma_user_profile'
const TOTAL_STEPS = 9

const EQUIPMENT_OPTIONS = [
  { id: 'full_gym', label: 'Full gym', blurb: 'Barbell, rack, cables, machines', snippet: 'full gym, barbell, squat rack, cables, machines' },
  { id: 'dumbbells', label: 'Dumbbells & basics', blurb: 'Dumbbells, bench, kettlebell, pull-up bar', snippet: 'dumbbells, bench, kettlebell, pull-up bar' },
  { id: 'bands', label: 'Resistance bands', snippet: 'resistance bands' },
  { id: 'bodyweight', label: 'Bodyweight only', snippet: 'bodyweight only' },
]

const CARDIO_OPTIONS = [
  { id: 'none', label: 'None', blurb: 'Strength only' },
  { id: 'running', label: 'Running', blurb: 'Road or treadmill' },
  { id: 'race_fit', label: 'Race Fit', blurb: 'Hybrid race training' },
  { id: 'crossfit', label: 'CrossFit', blurb: 'WODs & metcons' },
  { id: 'cycling', label: 'Cycling', blurb: 'Road or indoor' },
  { id: 'rowing', label: 'Rowing', blurb: 'Erg or on-water' },
  { id: 'swimming', label: 'Swimming', blurb: 'Competitive or fitness' },
]

function buildEquipmentString(selectedIds) {
  const snippets = EQUIPMENT_OPTIONS.filter((o) => selectedIds.has(o.id)).map((o) => o.snippet)
  return snippets.join(', ')
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('fat loss')
  const [equipmentIds, setEquipmentIds] = useState(() => new Set())
  const [experienceLevel, setExperienceLevel] = useState('Complete beginner')
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  const [sessionDuration, setSessionDuration] = useState(60)
  const [cardioType, setCardioType] = useState('none')
  const [hasInjuries, setHasInjuries] = useState(false)
  const [injuryDetails, setInjuryDetails] = useState('')
  const [bodyWeight, setBodyWeight] = useState('')
  const [building, setBuilding] = useState(false)
  const [buildingMessage, setBuildingMessage] = useState('')

  const equipmentString = useMemo(() => buildEquipmentString(equipmentIds), [equipmentIds])

  const toggleEquipment = (id) => {
    setEquipmentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const canContinue = useMemo(() => {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return !!goal
    if (step === 3) return equipmentIds.size > 0
    if (step === 4) return !!experienceLevel
    if (step === 5) return Number(daysPerWeek) > 0
    if (step === 6) return [30, 45, 60, 75, 90].includes(Number(sessionDuration))
    if (step === 7) return !!cardioType
    if (step === 8) return true
    if (step === 9) return true
    return true
  }, [step, name, goal, equipmentIds, experienceLevel, daysPerWeek, sessionDuration, cardioType])

  useEffect(() => {
    if (!user) { navigate('/', { replace: true }); return }
    if (profile?.onboarding_complete) { navigate('/home', { replace: true }) }
  }, [user, profile, navigate])

  useEffect(() => {
    try {
      const tf = profileTrainingFieldsFromEquipment(equipmentString)
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        ...(profile && typeof profile === 'object' ? profile : {}),
        name, goal, equipment: equipmentString,
        training_style: tf.training_style,
        experience_level: experienceLevel,
        days_per_week: Number(daysPerWeek) || 3,
        session_minutes: Number(sessionDuration) || 60,
        sessionDuration: Number(sessionDuration) || 60,
        cardio_type: cardioType,
        injuries: hasInjuries,
        injuries_details: injuryDetails.trim() || null,
        body_weight: bodyWeight ? Number(bodyWeight) : null,
        onboarding_complete: false,
      }))
    } catch { /* noop */ }
  }, [name, goal, equipmentString, experienceLevel, daysPerWeek, sessionDuration, cardioType, hasInjuries, injuryDetails, bodyWeight, profile])

  const nextStep = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const complete = async () => {
    setBuilding(true)
    setBuildingMessage(`Building your program, ${name.trim()}...`)

    const tf = profileTrainingFieldsFromEquipment(equipmentString)
    const homeEquipmentIds = inferHomeEquipmentIdsFromEquipmentText(equipmentString)
    const sportsOrActivities = cardioType && cardioType !== 'none' ? [cardioType] : []

    const fullProfile = {
      id: user?.id ?? profile?.id,
      userId: user?.id ?? profile?.id,
      name: name.trim(),
      goal,
      equipment: equipmentString,
      ...tf,
      experience_level: experienceLevel,
      experience_levels: [experienceLevel],
      days_per_week: Number(daysPerWeek) || 3,
      session_minutes: Number(sessionDuration) || 60,
      sessionDuration: Number(sessionDuration) || 60,
      home_equipment_ids: homeEquipmentIds,
      home_equipment_id: homeEquipmentIds[0],
      cardio_type: cardioType,
      sports_or_activities: sportsOrActivities,
      sport_or_activity: sportsOrActivities[0] || null,
      injuries: hasInjuries,
      injuries_details: hasInjuries ? injuryDetails.trim() || null : null,
      body_weight: bodyWeight ? Number(bodyWeight) : null,
      body_weight_unit: 'lb',
      goals: [goal],
      experienceLevel,
    }

    try {
      await completeOnboarding(name.trim(), fullProfile)

      // Let the user know the AI is working
      setTimeout(() => setBuildingMessage('Analyzing your goals and experience...'), 1000)
      setTimeout(() => setBuildingMessage('Selecting the right movements for you...'), 2500)
      setTimeout(() => setBuildingMessage('Finalizing your personalized program...'), 4000)

      const { program, aiGenerated } = await generateAIProgram(fullProfile)
      saveProgramToStorage(program)

      navigate('/home', { replace: true })
    } catch (err) {
      console.error('Onboarding completion error:', err)
      setBuilding(false)
      navigate('/home', { replace: true })
    }
  }

  // Loading screen while building program
  if (building) {
    return (
      <div className="onboarding-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '3px solid #C8A040', borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite', margin: '0 auto',
            }} />
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', color: '#C8A040', marginBottom: 12 }}>
            Building your program
          </h2>
          <p style={{ color: '#aaa', fontSize: '1rem', maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
            {buildingMessage}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="onboarding-page">
      {step > 1 && (
        <button type="button" className="btn-back-fixed" onClick={prevStep} aria-label="Back">←</button>
      )}
      <div className="onboarding-viewport">
        <div className="onboarding-screen onboarding-scroll">
          <h2 className="section-header accent">Setup your training profile</h2>
          <p className="screen-subtitle">Step {step} of {TOTAL_STEPS}</p>

          {step === 1 && (
            <div className="screen-section">
              <label className="screen-field-label">What is your name?</label>
              <input className="input-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}

          {step === 2 && (
            <div className="screen-section">
              <label className="screen-field-label">Main goal</label>
              <div className="cards-grid three-cols">
                {['fat loss', 'muscle building', 'strength'].map((g) => (
                  <button key={g} type="button" className={`card-select ${goal === g ? 'selected' : ''}`} onClick={() => setGoal(g)}>{g}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="screen-section">
              <label className="screen-field-label">What equipment do you have?</label>
              <p className="screen-hint">Select all that apply.</p>
              <div className="cards-grid three-cols">
                {EQUIPMENT_OPTIONS.map((o) => (
                  <button key={o.id} type="button" className={`card-select ${equipmentIds.has(o.id) ? 'selected' : ''}`} onClick={() => toggleEquipment(o.id)}>
                    <span className="card-select-title">{o.label}</span>
                    {o.blurb ? <span className="card-select-blurb">{o.blurb}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="screen-section">
              <label className="screen-field-label">Experience level</label>
              <div className="cards-grid three-cols">
                {['Complete beginner', 'Intermediate', 'Advanced or competitive'].map((lvl) => (
                  <button key={lvl} type="button" className={`card-select ${experienceLevel === lvl ? 'selected' : ''}`} onClick={() => setExperienceLevel(lvl)}>{lvl}</button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="screen-section">
              <label className="screen-field-label">Days per week</label>
              <div className="pills-row">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button key={n} type="button" className={`pill-select ${Number(daysPerWeek) === n ? 'selected' : ''}`} onClick={() => setDaysPerWeek(n)}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="screen-section">
              <label className="screen-field-label">How long per session?</label>
              <div className="pills-row">
                {[30, 45, 60, 75, 90].map((n) => (
                  <button key={n} type="button" className={`pill-select ${Number(sessionDuration) === n ? 'selected' : ''}`} onClick={() => setSessionDuration(n)}>{n} min</button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="screen-section">
              <label className="screen-field-label">Cardio or sport training?</label>
              <p className="screen-hint">We'll integrate it into your program.</p>
              <div className="cards-grid three-cols">
                {CARDIO_OPTIONS.map((o) => (
                  <button key={o.id} type="button" className={`card-select ${cardioType === o.id ? 'selected' : ''}`} onClick={() => setCardioType(o.id)}>
                    <span className="card-select-title">{o.label}</span>
                    {o.blurb ? <span className="card-select-blurb">{o.blurb}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="screen-section">
              <label className="screen-field-label">Any injuries or limitations?</label>
              <p className="screen-hint">We'll modify your program to work around them.</p>
              <div className="cards-grid three-cols">
                {[
                  { id: false, label: 'No injuries', blurb: 'Training pain free' },
                  { id: true, label: 'Yes', blurb: 'I have something to flag' }
                ].map((o) => (
                  <button key={String(o.id)} type="button" className={`card-select ${hasInjuries === o.id ? 'selected' : ''}`} onClick={() => setHasInjuries(o.id)}>
                    <span className="card-select-title">{o.label}</span>
                    <span className="card-select-blurb">{o.blurb}</span>
                  </button>
                ))}
              </div>
              {hasInjuries && (
                <div style={{ marginTop: 16 }}>
                  <label className="screen-field-label">Tell us more</label>
                  <textarea
                    className="input-name"
                    style={{ minHeight: 80, resize: 'vertical' }}
                    value={injuryDetails}
                    onChange={(e) => setInjuryDetails(e.target.value)}
                    placeholder="e.g. left knee pain on squats, lower back issues"
                  />
                </div>
              )}
            </div>
          )}

          {step === 9 && (
            <div className="screen-section">
              <label className="screen-field-label">
                Body weight <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
              </label>
              <p className="screen-hint">Used for your protein target and load suggestions.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  className="input-name"
                  type="number"
                  min="50"
                  max="500"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  placeholder="e.g. 185"
                  style={{ flex: 1 }}
                />
                <span style={{ color: 'var(--color-text-secondary, #aaa)', fontSize: '1rem' }}>lbs</span>
              </div>
            </div>
          )}

          {step < TOTAL_STEPS ? (
            <button type="button" className="btn-primary" onClick={nextStep} disabled={!canContinue}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={complete} disabled={building}>
              Build my program
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
