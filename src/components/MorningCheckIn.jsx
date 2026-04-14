import { useState, useCallback, useMemo, useEffect } from 'react'
import { getLastNightSleep } from '../utils/watchService'
import { dateKeyLocal } from '../utils/foodLog'
import {
  saveMorningCheckIn,
  applyCheckInAndStoreModifiers,
  injuryToRehabPhase,
} from '../utils/morningCheckIn'
import { buildPersonalizedMorningOpener } from '../utils/morningOpeners'
import { isMomExperience } from '../utils/momExperience'
import BodyDiagram, { BodyFaceToggle } from './BodyDiagram'
import './MorningCheckIn.css'

const HOME_HARMONY = [
  { id: 'calm', label: 'Calm' },
  { id: 'steady', label: 'Normal day' },
  { id: 'hectic', label: 'Hectic' },
  { id: 'rough', label: 'Rough night / big feelings' },
]

const SLEEP = [
  { id: 'poor', label: 'Poor' },
  { id: 'okay', label: 'Okay' },
  { id: 'good', label: 'Good' },
  { id: 'great', label: 'Great' },
]

const BODY = [
  { id: 'great', label: "Great — let's go" },
  { id: 'tired', label: 'A bit tired' },
  { id: 'sore', label: 'Something is sore' },
  { id: 'injury', label: 'I have an injury' },
]

const SIDES = [
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'both', label: 'Both' },
]

const SORE_LV = [
  {
    id: 1,
    label: '1 — A little tight',
    sub: 'Warming up should fix it',
  },
  {
    id: 2,
    label: '2 — Noticeably sore',
    sub: 'Needs managing today',
  },
  {
    id: 3,
    label: '3 — Really sore',
    sub: 'Avoid loading this area',
  },
]

const INJURY_DUR = [
  { id: 'just', label: 'Just happened' },
  { id: 'few', label: 'A few days' },
  { id: 'week', label: 'More than a week' },
]

/**
 * @param {{ onCompleted: () => void; user: object; programWeek: number; recentCheckIns?: Array; embedded?: boolean; onDismissInline?: () => void }}
 */
export default function MorningCheckIn({
  onCompleted,
  user,
  programWeek,
  recentCheckIns = [],
  embedded = false,
  onDismissInline,
}) {
  const [step, setStep] = useState(() => (embedded ? 'sleep' : 'intro'))
  const [sleep, setSleep] = useState(null)
  const [body, setBody] = useState(null)
  const [face, setFace] = useState('front')
  const [region, setRegion] = useState(null)
  const [side, setSide] = useState(null)
  const [soreLevel, setSoreLevel] = useState(null)
  const [injuryDur, setInjuryDur] = useState(null)
  const [homeHarmony, setHomeHarmony] = useState(null)

  const momUser = isMomExperience(user)

  useEffect(() => {
    if (step === 'sleep') {
      const watchSleep = getLastNightSleep()
      if (watchSleep && SLEEP.some((s) => s.id === watchSleep)) setSleep(watchSleep)
    }
  }, [step])

  const opener = useMemo(
    () =>
      buildPersonalizedMorningOpener({
        user,
        programWeek,
        daysPerWeek: user?.days_per_week || 3,
        recentCheckIns,
      }),
    [user, programWeek, recentCheckIns],
  )

  const resetSore = useCallback(() => {
    setFace('front')
    setRegion(null)
    setSide(null)
    setSoreLevel(null)
  }, [])

  const runSubmit = useCallback(async () => {
    const dk = dateKeyLocal()
    const u = user
    /** @type {import('../utils/morningCheckIn').MorningCheckInEntry} */
    const entry = {
      dateKey: dk,
      sleep,
      body,
      soreRegion: body === 'sore' ? region : undefined,
      soreSide: body === 'sore' ? side : undefined,
      soreLevel: body === 'sore' ? soreLevel : undefined,
      injuryDuration: body === 'injury' ? injuryDur : undefined,
      rehabPhase: body === 'injury' ? injuryToRehabPhase(injuryDur) : undefined,
      homeHarmony: momUser ? homeHarmony || undefined : undefined,
    }
    await saveMorningCheckIn(entry)
    await applyCheckInAndStoreModifiers(entry, u)
    onCompleted()
  }, [sleep, body, region, side, soreLevel, injuryDur, onCompleted, user, homeHarmony, momUser])

  const canFinishSore = body === 'sore' && region && side && soreLevel
  const canFinishInjury = body === 'injury' && injuryDur
  const canFinishSimple = (body === 'great' || body === 'tired') && sleep

  const submit = useCallback(() => {
    runSubmit()
  }, [runSubmit])

  return (
    <section className={`morning-checkin ${embedded ? 'morning-checkin--embedded' : ''}`} aria-label="Morning check-in">
      {embedded && onDismissInline && (
        <button type="button" className="morning-checkin__later" onClick={onDismissInline}>
          Later
        </button>
      )}
      {step === 'intro' && (
        <div className="morning-checkin__intro">
          <p className="morning-checkin__opener">{opener}</p>
          <button type="button" className="morning-checkin__primary" onClick={() => setStep('sleep')}>
            Continue
          </button>
        </div>
      )}

      {step !== 'intro' && sleep && step !== 'sleep' && (
        <p className="morning-checkin__recap">
          Sleep: <strong>{SLEEP.find((s) => s.id === sleep)?.label}</strong>
          {momUser && homeHarmony ? (
            <>
              {' '}
              · Home: <strong>{HOME_HARMONY.find((h) => h.id === homeHarmony)?.label}</strong>
            </>
          ) : null}
          {body ? (
            <>
              {' '}
              · Body: <strong>{BODY.find((b) => b.id === body)?.label}</strong>
            </>
          ) : null}
        </p>
      )}

      {step !== 'intro' && (
        <>
          {step === 'home' && momUser && (
            <div className="morning-checkin__step">
              <p className="morning-checkin__q">How is everyone at home today?</p>
              <p className="morning-checkin__hint">No performance — just the truth. We use this to pace your day.</p>
              <div className="morning-checkin__pills morning-checkin__pills--body" role="group" aria-label="Home">
                {HOME_HARMONY.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`morning-checkin__pill morning-checkin__pill--wide ${homeHarmony === h.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setHomeHarmony(h.id)
                      setStep('body')
                    }}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'sleep' && (
            <div className="morning-checkin__step">
              <p className="morning-checkin__q">How did you sleep?</p>
              <div className="morning-checkin__pills" role="group" aria-label="Sleep quality">
                {SLEEP.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`morning-checkin__pill ${sleep === o.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSleep(o.id)
                      setStep(momUser ? 'home' : 'body')
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(step === 'body' ||
            step === 'ready-submit' ||
            step === 'sore-detail' ||
            step === 'injury-detail') &&
            step !== 'sleep' &&
            step !== 'home' &&
            sleep &&
            (!momUser || homeHarmony) && (
            <div className="morning-checkin__step">
              <p className="morning-checkin__q">How is the body feeling?</p>
              <div className="morning-checkin__pills morning-checkin__pills--body" role="group" aria-label="Body feeling">
                {BODY.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`morning-checkin__pill morning-checkin__pill--wide ${body === o.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setBody(o.id)
                      resetSore()
                      setInjuryDur(null)
                      if (o.id === 'sore') setStep('sore-detail')
                      else if (o.id === 'injury') setStep('injury-detail')
                      else setStep('ready-submit')
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'sore-detail' && body === 'sore' && (
            <div className="morning-checkin__sub">
              <p className="morning-checkin__hint">Tap where it bothers you — gold marks your spot.</p>
              <BodyFaceToggle face={face} onFace={setFace} />
              <BodyDiagram face={face} selectedId={region} onSelect={setRegion} />

              {region && (
                <>
                  <p className="morning-checkin__hint">Which side?</p>
                  <div className="morning-checkin__pills" role="group">
                    {SIDES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`morning-checkin__pill ${side === s.id ? 'is-selected' : ''}`}
                        onClick={() => setSide(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {region && side && (
                <>
                  <p className="morning-checkin__hint">How sore is it?</p>
                  <div className="morning-checkin__sore-levels">
                    {SORE_LV.map((lv) => (
                      <button
                        key={lv.id}
                        type="button"
                        className={`morning-checkin__level ${soreLevel === lv.id ? 'is-selected' : ''}`}
                        onClick={() => setSoreLevel(lv.id)}
                      >
                        <span className="morning-checkin__level-main">{lv.label}</span>
                        <span className="morning-checkin__level-sub">{lv.sub}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {canFinishSore && (
                <button type="button" className="morning-checkin__submit" onClick={submit}>
                  Save check-in
                </button>
              )}
            </div>
          )}

          {step === 'injury-detail' && body === 'injury' && (
            <div className="morning-checkin__sub">
              <p className="morning-checkin__hint">How long have you had it?</p>
              <div className="morning-checkin__pills morning-checkin__pills--body" role="group">
                {INJURY_DUR.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`morning-checkin__pill morning-checkin__pill--wide ${injuryDur === o.id ? 'is-selected' : ''}`}
                    onClick={() => setInjuryDur(o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {canFinishInjury && (
                <button type="button" className="morning-checkin__submit" onClick={submit}>
                  Save check-in
                </button>
              )}
            </div>
          )}

          {step === 'ready-submit' && canFinishSimple && (
            <button type="button" className="morning-checkin__submit" onClick={submit}>
              Save check-in
            </button>
          )}
        </>
      )}
    </section>
  )
}
