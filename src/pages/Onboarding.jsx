import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { completeOnboarding } from '../utils/auth'
import {
  buildProgram,
  saveProgramToStorage,
  profileTrainingFieldsFromEquipment,
  inferHomeEquipmentIdsFromEquipmentText,
} from '../utils/programBuilder'
import './Onboarding.css'

const PROFILE_KEY = 'forma_user_profile'

/** Multi-select → comma-separated string for programBuilder.detectTrainingStyle + parseEquipmentProfile */
const EQUIPMENT_OPTIONS = [
  {
    id: 'full_gym',
    label: 'Full gym',
    blurb: 'Barbell, rack, cables, machines',
    snippet: 'full gym, barbell, squat rack, cables, machines',
  },
  {
    id: 'dumbbells',
    label: 'Dumbbells & basics',
    blurb: 'Dumbbells, bench, kettlebell, pull-up bar',
    snippet: 'dumbbells, bench, kettlebell, pull-up bar',
  },
  { id: 'bands', label: 'Resistance bands', snippet: 'resistance bands' },
  { id: 'bodyweight', label: 'Bodyweight only', snippet: 'bodyweight only' },
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
    return true
  }, [step, name, goal, equipmentIds, experienceLevel, daysPerWeek, sessionDuration])

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true })
      return
    }
    if (profile?.onboarding_complete) {
      navigate('/home', { replace: true })
    }
  }, [user, profile, navigate])

  useEffect(() => {
    try {
      const tf = profileTrainingFieldsFromEquipment(equipmentString)
      const canonical = {
        name,
        goal,
        equipment: equipmentString,
        experienceLevel,
        daysPerWeek: Number(daysPerWeek) || 3,
        sessionDuration: Number(sessionDuration) || 60,
        ...tf,
      }
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          ...(profile && typeof profile === 'object' ? profile : {}),
          ...canonical,
          name,
          goal,
          equipment: equipmentString,
          training_style: tf.training_style,
          experience_level: experienceLevel,
          days_per_week: Number(daysPerWeek) || 3,
          session_minutes: Number(sessionDuration) || 60,
          sessionDuration: Number(sessionDuration) || 60,
          onboarding_complete: false,
        }),
      )
    } catch {
      /* noop */
    }
  }, [name, goal, equipmentString, experienceLevel, daysPerWeek, sessionDuration, profile])

  const nextStep = () => setStep((s) => Math.min(6, s + 1))
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const complete = async () => {
    const tf = profileTrainingFieldsFromEquipment(equipmentString)
    const homeEquipmentIds = inferHomeEquipmentIdsFromEquipmentText(equipmentString)
    const profilePayload = {
      goal,
      experienceLevel,
      daysPerWeek: Number(daysPerWeek) || 3,
      sessionDuration: Number(sessionDuration) || 60,
      goals: [goal],
      equipment: equipmentString,
      ...tf,
      experience_level: experienceLevel,
      experience_levels: [experienceLevel],
      days_per_week: Number(daysPerWeek) || 3,
      session_minutes: Number(sessionDuration) || 60,
      home_equipment_ids: homeEquipmentIds,
      home_equipment_id: homeEquipmentIds[0],
    }
    await completeOnboarding(name.trim(), profilePayload)
    const built = buildProgram({
      ...(profile && typeof profile === 'object' ? profile : {}),
      id: user?.id ?? profile?.id,
      userId: user?.id ?? profile?.id,
      name: name.trim(),
      goal,
      equipment: equipmentString,
      ...tf,
      experience_level: experienceLevel,
      days_per_week: Number(daysPerWeek) || 3,
      session_minutes: Number(sessionDuration) || 60,
      sessionDuration: Number(sessionDuration) || 60,
      home_equipment_ids: homeEquipmentIds,
      home_equipment_id: homeEquipmentIds[0],
    })
    saveProgramToStorage(built)
    navigate('/home', { replace: true })
  }

  return (
    <div className="onboarding-page">
      {step > 1 && (
        <button type="button" className="btn-back-fixed" onClick={prevStep} aria-label="Back">
          ←
        </button>
      )}
      <div className="onboarding-viewport">
        <div className="onboarding-screen onboarding-scroll">
          <h2 className="section-header accent">Setup your training profile</h2>
          <p className="screen-subtitle">Step {step} of 6</p>

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
                  <button key={g} type="button" className={`card-select ${goal === g ? 'selected' : ''}`} onClick={() => setGoal(g)}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="screen-section">
              <label className="screen-field-label">What equipment do you have?</label>
              <p className="screen-hint">Select all that apply — we&apos;ll match your program automatically.</p>
              <div className="cards-grid three-cols">
                {EQUIPMENT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`card-select ${equipmentIds.has(o.id) ? 'selected' : ''}`}
                    onClick={() => toggleEquipment(o.id)}
                  >
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
                  <button key={lvl} type="button" className={`card-select ${experienceLevel === lvl ? 'selected' : ''}`} onClick={() => setExperienceLevel(lvl)}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="screen-section">
              <label className="screen-field-label">Days per week</label>
              <div className="pills-row">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button key={n} type="button" className={`pill-select ${Number(daysPerWeek) === n ? 'selected' : ''}`} onClick={() => setDaysPerWeek(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="screen-section">
              <label className="screen-field-label">How much time do you have per session?</label>
              <div className="pills-row">
                {[30, 45, 60, 75, 90].map((n) => (
                  <button key={n} type="button" className={`pill-select ${Number(sessionDuration) === n ? 'selected' : ''}`} onClick={() => setSessionDuration(n)}>
                    {n} minutes
                  </button>
                ))}
              </div>
            </div>
          )}

          {step < 6 ? (
            <button type="button" className="btn-primary" onClick={nextStep} disabled={!canContinue}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={complete} disabled={!canContinue}>
              Finish onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
