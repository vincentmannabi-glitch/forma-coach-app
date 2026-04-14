function formatRepRange(ex) {
  const min = Number(ex?.repsMin) || Number(ex?.repMin) || Number(ex?.minReps) || 0
  const max = Number(ex?.repsMax) || Number(ex?.repMax) || Number(ex?.maxReps) || 0
  if (min > 0 && max > 0) return `${min}-${max}`
  if (max > 0) return `${max}`
  if (min > 0) return `${min}`
  return '-'
}

function sectionRows(section) {
  if (!section) return []
  if (Array.isArray(section.exercises) && section.exercises.length > 0) {
    return section.exercises.map((ex) => ({
      name: ex.displayName || ex.name || 'Exercise',
      right: `${ex.sets || 3} x ${formatRepRange(ex)}`,
    }))
  }
  if (section.type === 'warmup' && Array.isArray(section.content?.movements)) {
    return section.content.movements.map((m) => ({
      name: m.name,
      right: m.detail || '-',
    }))
  }
  if (section.type === 'core' && Array.isArray(section.content?.exercises)) {
    return section.content.exercises.map((m) => ({
      name: m.name,
      right: m.detail || '-',
    }))
  }
  if (section.type === 'cooldown' && Array.isArray(section.content?.stretches)) {
    return section.content.stretches.map((s) => ({
      name: s.name,
      right: s.detail || '-',
    }))
  }
  if (section.type === 'cardio' && section.content) {
    return [{ name: section.content.title || 'Cardio', right: section.content.duration || section.minutes || '-' }]
  }
  return []
}

const SECTION_IDS = ['warmup', 'main', 'accessory', 'core', 'cardio', 'cooldown']

export default function SessionPlanCards({ session }) {
  const sections = (session?.sections || []).filter((s) => SECTION_IDS.includes(s.id))
  if (!sections.length) return null

  return (
    <section className="session-plan-cards" aria-label="Session plan">
      {sections.map((section) => {
        const rows = sectionRows(section)
        if (!rows.length) return null
        return (
          <article key={section.id} className="session-plan-card">
            <h3 className="session-plan-card-title">{section.title.replace(/^\d+\.\s*/, '')}</h3>
            <div className="session-plan-rows">
              {rows.map((row, i) => (
                <div key={`${section.id}-${i}`} className="session-plan-row">
                  <span className="session-plan-row-name">{row.name}</span>
                  <span className="session-plan-row-meta">{row.right}</span>
                </div>
              ))}
            </div>
          </article>
        )
      })}
    </section>
  )
}
