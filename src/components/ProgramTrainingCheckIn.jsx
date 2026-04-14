import { useState } from 'react'
import './ProgramTrainingCheckIn.css'

const Q1 = [
  { id: 'great', label: 'Great' },
  { id: 'ok', label: 'OK' },
  { id: 'poor', label: 'Poor' },
]

const Q2 = [
  { id: 'none', label: 'Not sore' },
  { id: 'slight', label: 'Slightly sore' },
  { id: 'very', label: 'Very sore' },
]

const Q3 = [
  { id: 'high', label: 'High' },
  { id: 'normal', label: 'Normal' },
  { id: 'low', label: 'Low' },
]

const Q4 = [
  { id: 'none', label: 'No pain' },
  { id: 'minor', label: 'Minor discomfort' },
  { id: 'real', label: 'Real pain' },
]

const Q5 = [
  { id: 'ready', label: 'Ready to go' },
  { id: 'okay', label: 'Feeling okay' },
  { id: 'low', label: 'Really not feeling it' },
]

/**
 * Pre-training five-question check-in → adjustSessionForCheckIn + forma_today_session.
 * @param {{ onSubmit: (answers: object) => void; onSkip?: () => void; disabled?: boolean }}
 */
export default function ProgramTrainingCheckIn({ onSubmit, onSkip, disabled }) {
  const [q1, setQ1] = useState(null)
  const [q2, setQ2] = useState(null)
  const [q3, setQ3] = useState(null)
  const [q4, setQ4] = useState(null)
  const [q5, setQ5] = useState(null)
  const [painWhere, setPainWhere] = useState('')

  const canSubmit = q1 && q2 && q3 && q4 && q5

  const submit = () => {
    if (!canSubmit || disabled) return
    onSubmit({
      q1,
      q2,
      q3,
      q4,
      q5,
      ...(q4 === 'minor' ? { painLocation: painWhere.trim() || 'unspecified' } : {}),
    })
  }

  return (
    <section className="program-training-checkin" aria-label="Training check-in">
      <h3 className="program-training-checkin__title">Quick check-in</h3>
      <p className="program-training-checkin__hint">Five questions — we tune today&apos;s session to how you actually feel.</p>

      <div className="program-training-checkin__block">
        <p className="program-training-checkin__q">1. How did you sleep?</p>
        <div className="program-training-checkin__pills" role="group">
          {Q1.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`program-training-checkin__pill ${q1 === o.id ? 'is-on' : ''}`}
              onClick={() => setQ1(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="program-training-checkin__block">
        <p className="program-training-checkin__q">2. Soreness today?</p>
        <div className="program-training-checkin__pills" role="group">
          {Q2.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`program-training-checkin__pill ${q2 === o.id ? 'is-on' : ''}`}
              onClick={() => setQ2(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="program-training-checkin__block">
        <p className="program-training-checkin__q">3. Energy level?</p>
        <div className="program-training-checkin__pills" role="group">
          {Q3.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`program-training-checkin__pill ${q3 === o.id ? 'is-on' : ''}`}
              onClick={() => setQ3(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="program-training-checkin__block">
        <p className="program-training-checkin__q">4. Pain?</p>
        <div className="program-training-checkin__pills" role="group">
          {Q4.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`program-training-checkin__pill ${q4 === o.id ? 'is-on' : ''}`}
              onClick={() => setQ4(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {q4 === 'minor' && (
          <label className="program-training-checkin__field">
            Where?
            <input
              type="text"
              className="program-training-checkin__input"
              value={painWhere}
              onChange={(e) => setPainWhere(e.target.value)}
              placeholder="e.g. left knee, mid-back"
              autoComplete="off"
            />
          </label>
        )}
      </div>

      <div className="program-training-checkin__block">
        <p className="program-training-checkin__q">5. Motivation?</p>
        <div className="program-training-checkin__pills" role="group">
          {Q5.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`program-training-checkin__pill ${q5 === o.id ? 'is-on' : ''}`}
              onClick={() => setQ5(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="program-training-checkin__actions">
        <button type="button" className="program-training-checkin__primary" disabled={!canSubmit || disabled} onClick={submit}>
          Apply to today&apos;s session
        </button>
        {onSkip ? (
          <button type="button" className="program-training-checkin__secondary" onClick={onSkip}>
            Skip — use planned session
          </button>
        ) : null}
      </div>
    </section>
  )
}
