function sectionRows(dayPlan) {
  const rows = []
  if (dayPlan?.cardio) {
    rows.push({
      title: dayPlan.cardio.kind === 'hiit' ? 'Cardio' : dayPlan.cardio.kind === 'steady' ? 'Cardio' : 'Conditioning',
      items: [{ name: dayPlan.cardio.title || dayPlan.cardio.kind, meta: dayPlan.cardio.duration || '-' }],
    })
  }
  if (dayPlan?.functional?.exercises?.length) {
    rows.push({
      title: 'Main Work',
      items: dayPlan.functional.exercises.map((ex) => ({
        name: ex.name,
        meta: ex.detail || '-',
      })),
    })
  }
  if (dayPlan?.core?.exercises?.length) {
    rows.push({
      title: 'Core',
      items: dayPlan.core.exercises.map((ex) => ({
        name: ex.name,
        meta: ex.detail || '-',
      })),
    })
  }
  return rows
}

export default function ProgramSessionBlocks({ dayPlan }) {
  if (!dayPlan) return null
  const blocks = sectionRows(dayPlan)
  if (!blocks.length) return null
  return (
    <section className="program-session-blocks" aria-label="Program details">
      {blocks.map((block) => (
        <article key={block.title} className="program-block-card">
          <h4 className="program-block-h4">{block.title}</h4>
          <div className="program-plan-rows">
            {block.items.map((item, i) => (
              <div key={`${block.title}-${i}`} className="program-plan-row">
                <span className="program-plan-name">{item.name}</span>
                <span className="program-plan-meta">{item.meta}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}
