import { useState } from 'react'

/**
 * Expandable session section — warmup, main, accessory, core, cardio, cooldown.
 */
export default function SessionSection({
  section,
  children,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { id, title, subtitle } = section
  const hasExercises = section.exercises?.length > 0
  const hasContent = section.content || hasExercises

  return (
    <section className={`session-section session-section--${id}`} aria-labelledby={`section-${id}`}>
      <button
        type="button"
        className="session-section-header"
        onClick={() => hasContent && setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls={`section-body-${id}`}
        id={`section-${id}`}
      >
        <span className="session-section-title">{title}</span>
        {subtitle && <span className="session-section-subtitle">{subtitle}</span>}
        {section.minutes && (
          <span className="session-section-meta">{section.minutes}</span>
        )}
        {hasContent && (
          <span className="session-section-chevron" aria-hidden>
            {expanded ? '▼' : '▶'}
          </span>
        )}
      </button>

      {hasContent && expanded && (
        <div
          id={`section-body-${id}`}
          className="session-section-body"
          role="region"
          aria-labelledby={`section-${id}`}
        >
          {children}
        </div>
      )}
    </section>
  )
}
