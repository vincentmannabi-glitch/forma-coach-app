import { useMemo, useRef, useEffect } from 'react'
import { buildCalendarWeekPlanFromProgram, ensureProgramLoaded } from '../utils/programBuilder.js'
import { dateKeyLocal } from '../utils/foodLog'

/**
 * Horizontal 7-day calendar strip (Sun–Sat) for the current week.
 * @param {{ user: object | null; selectedDateKey: string; onSelectDateKey: (k: string) => void; trainedDateKeys?: Set<string>; variant?: 'default' | 'home' }} props
 */
export default function WeekProgramStrip({
  user,
  selectedDateKey,
  onSelectDateKey,
  trainedDateKeys,
  variant = 'default',
}) {
  const week = useMemo(() => {
    if (!user) return null
    return buildCalendarWeekPlanFromProgram(ensureProgramLoaded())
  }, [user?.id, user?.days_per_week, user?.goal])
  const todayKey = dateKeyLocal(new Date())
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !week) return
    const idx = week.days.findIndex((d) => d.dateKey === todayKey)
    if (idx < 0) return
    const child = el.children[idx]
    if (child && typeof child.scrollIntoView === 'function') {
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [week, todayKey])

  if (!user || !week) return null

  const stripClass =
    variant === 'home' ? 'week-program-strip week-program-strip--home' : 'week-program-strip'

  return (
    <section className={stripClass} aria-label="Weekly program calendar">
      <div className="week-program-scroll" ref={scrollRef}>
        {week.days.map((d) => {
          const selected = selectedDateKey === d.dateKey
          const isToday = d.dateKey === todayKey
          const isFuture = d.dateKey > todayKey
          const trained = trainedDateKeys?.has?.(d.dateKey)
          const isDone = !!trained
          const dateNum = d.dateKey.slice(-2)
          const chip = (d.chipLabel || '').split('·')[0].trim()
          return (
            <button
              key={d.dateKey}
              type="button"
              className={`week-program-day ${selected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${
                isDone ? 'is-done' : ''
              } ${isFuture ? 'is-future' : ''}`}
              onClick={() => onSelectDateKey(d.dateKey)}
            >
              <span className="week-program-wd">{d.weekdayShort}</span>
              <span className="week-program-date">{dateNum}</span>
              <span className="week-program-chip">{chip || 'Session'}</span>
              {isDone && (
                <span className="week-program-done" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
