import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { completeOnboarding } from '../utils/auth'
import { buildProgram, saveProgramToStorage } from '../utils/programBuilder'
import './Onboarding.css'

const PROFILE_KEY = 'forma_user_profile'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const trainingStyleForProgram = (s) => {
    if (s === 'home workout') return 'home'
    return s === 'calisthenics' ? 'calisthenics' : 'gym'
  }
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('fat loss')
  const [trainingStyle, setTrainingStyle] = useState('gym')
  const [experienceLevel, setExperienceLevel] = useState('Complete beginner')
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  const [sessionDuration, setSessionDuration] = useState(60)

  const canContinue = useMemo(() => {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return !!goal
    if (step === 3) return !!trainingStyle
    if (step === 4) return !!experienceLevel
    if (step === 5) return Number(daysPerWeek) > 0
    if (step === 6) return [30, 45, 60, 75, 90].includes(Number(sessionDuration))
    return true
  }, [step, name, goal, trainingStyle, experienceLevel, daysPerWeek, sessionDuration])

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
      const canonical = {
        name,
        goal,
        trainingStyle,
        experienceLevel,
        daysPerWeek: Number(daysPerWeek) || 3,
        sessionDuration: Number(sessionDuration) || 60,
      }
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          ...(profile && typeof profile === 'object' ? profile : {}),
          ...canonical,
          name,
          goal,
          training_style: trainingStyle,
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
  }, [name, goal, trainingStyle, experienceLevel, daysPerWeek, sessionDuration, profile])

  const nextStep = () => setStep((s) => Math.min(6, s + 1))
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const complete = async () => {
    const profilePayload = {
      goal,
      trainingStyle,
      experienceLevel,
      daysPerWeek: Number(daysPerWeek) || 3,
      sessionDuration: Number(sessionDuration) || 60,
      goals: [goal],
      training_style: trainingStyleForProgram(trainingStyle),
      training_styles: [trainingStyleForProgram(trainingStyle)],
      experience_level: experienceLevel,
      experience_levels: [experienceLevel],
      days_per_week: Number(daysPerWeek) || 3,
      session_minutes: Number(sessionDuration) || 60,
    }
    await completeOnboarding(name.trim(), profilePayload)
    const built = buildProgram({
      ...(profile && typeof profile === 'object' ? profile : {}),
      id: user?.id ?? profile?.id,
      userId: user?.id ?? profile?.id,
      name: name.trim(),
      goal,
      training_style: trainingStyleForProgram(trainingStyle),
      experience_level: experienceLevel,
      days_per_week: Number(daysPerWeek) || 3,
      session_minutes: Number(sessionDuration) || 60,
      sessionDuration: Number(sessionDuration) || 60,
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
          <h2 className="section-header gold">Setup your training profile</h2>
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
              <label className="screen-field-label">Training style</label>
              <div className="cards-grid three-cols">
                {['gym', 'calisthenics', 'home workout'].map((s) => (
                  <button key={s} type="button" className={`card-select ${trainingStyle === s ? 'selected' : ''}`} onClick={() => setTrainingStyle(s)}>
                    {s}
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
            <button type="button" className="btn-gold" onClick={nextStep} disabled={!canContinue}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn-gold" onClick={complete} disabled={!canContinue}>
              Finish onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
