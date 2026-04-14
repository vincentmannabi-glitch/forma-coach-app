import { useMemo, useRef, useEffect } from 'react'
import { buildCalendarWeekPlanFromProgram, ensureProgramLoaded } from '../utils/programBuilder.js'
import { dateKeyLocal } from '../utils/foodLog'
import { chipLabelToAbbrev } from '../utils/chipLabelAbbrev'

export default function TrainHubWeekStrip({
  user,
  selectedDateKey,
  onSelectDateKey,
  trainedDateKeys,
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
    el.children[idx]?.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [week, todayKey])

  if (!user || !week) return null

  return (
    <div className="train-hub-week-wrap">
      <div className="train-hub-week-scroll" ref={scrollRef}>
        {week.days.map((d) => {
          const isToday = d.dateKey === todayKey
          const trained = trainedDateKeys?.has?.(d.dateKey)
          const selected = selectedDateKey === d.dateKey
          const dateNum = String(Number(d.dateKey.slice(-2)))
          const abbr = chipLabelToAbbrev(d.chipLabel)
          return (
            <button
              key={d.dateKey}
              type="button"
              className={`train-hub-day ${selected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => onSelectDateKey(d.dateKey)}
            >
              {trained && (
                <span className="train-hub-day-check" aria-hidden>
                  ✓
                </span>
              )}
              <span className="train-hub-day-wd">{d.weekdayShort}</span>
              <span className="train-hub-day-num">{dateNum}</span>
              <span className="train-hub-day-abbr">{abbr}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
