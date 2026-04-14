import { useState } from 'react'
import './CoachExerciseMessage.css'

/**
 * Renders structured exercise answer + variation cards (Learn more).
 */
export default function CoachExerciseMessage({ message }) {
  const b = message.exerciseBlock
  if (!b) return <p className="chat-bubble-text">{message.text}</p>

  const [expanded, setExpanded] = useState({})
  const mid = message.id || 'm'

  const toggleLearn = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="coach-exercise">
      <section className="coach-exercise__section">
        <h3 className="coach-exercise__h">Identifying the movement</h3>
        <p className="coach-exercise__p">
          <strong>{b.movementTitle}</strong>. {b.identityLine}
        </p>
      </section>

      <section className="coach-exercise__section">
        <h3 className="coach-exercise__h">Muscles</h3>
        <p className="coach-exercise__p">{b.musclesLine}</p>
      </section>

      <section className="coach-exercise__section">
        <h3 className="coach-exercise__h">Setup</h3>
        <p className="coach-exercise__p">{b.setup}</p>
      </section>

      <section className="coach-exercise__section">
        <h3 className="coach-exercise__h">Step-by-step</h3>
        <ol className="coach-exercise__ol">
          {b.steps.map((s, i) => (
            <li key={i} className="coach-exercise__li">
              {s}
            </li>
          ))}
        </ol>
      </section>

      <section className="coach-exercise__section">
        <h3 className="coach-exercise__h">Common mistakes</h3>
        <ul className="coach-exercise__ul">
          {b.mistakes.map((s, i) => (
            <li key={i} className="coach-exercise__li">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="coach-exercise__section">
        <h3 className="coach-exercise__h">What it should feel like when done correctly</h3>
        <p className="coach-exercise__p">{b.feelsLike}</p>
      </section>

      <section className="coach-exercise__section coach-exercise__section--variations">
        <h3 className="coach-exercise__h">You can also perform this movement like this</h3>
        <div className="coach-exercise__cards" role="list">
          {b.variations.map((v) => {
            const ek = `${mid}-${v.key}`
            const isOpen = expanded[ek]
            return (
              <div key={v.key} className="coach-ex-card" role="listitem">
                <div className="coach-ex-card__head">
                  <h4 className="coach-ex-card__title">{v.name}</h4>
                  <p className="coach-ex-card__diff">{v.diffLine}</p>
                </div>
                <div className="coach-ex-card__actions">
                  <button
                    type="button"
                    className="coach-ex-card__btn coach-ex-card__btn--learn"
                    aria-expanded={isOpen}
                    onClick={() => toggleLearn(ek)}
                  >
                    Learn more
                  </button>
                </div>
                {isOpen && (
                  <div className="coach-ex-card__more">
                    <p className="coach-ex-card__more-text">{v.learnMoreText}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <p className="coach-exercise__sr-hint" aria-hidden>
        Full text of this answer is also available in the message for copy and search.
      </p>
    </div>
  )
}
