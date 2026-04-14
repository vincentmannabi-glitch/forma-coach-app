import { useMemo, useRef, useEffect, useState } from 'react'
import { buildCalendarWeekPlanFromProgram, ensureProgramLoaded } from '../utils/programBuilder.js'
import { dateKeyLocal } from '../utils/foodLog'

export default function HomeWeekStrip({ user, trainedDateKeys, onSelectDateKey, selectedDateKey }) {
  const week = useMemo(() => {
    if (!user) return null
    return buildCalendarWeekPlanFromProgram(ensureProgramLoaded())
  }, [user?.id, user?.days_per_week, user?.goal])
  const todayKey = dateKeyLocal(new Date())
  const scrollRef = useRef(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !week) return
    const idx = week.days.findIndex((d) => d.dateKey === todayKey)
    if (idx < 0) return
    el.children[idx]?.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [week, todayKey])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el || !week) return
    const w = el.offsetWidth
    const scrollW = el.scrollWidth
    if (scrollW <= w) {
      setPage(0)
      return
    }
    const segments = Math.ceil(scrollW / w)
    const p = Math.min(segments - 1, Math.floor(el.scrollLeft / (scrollW / segments)))
    setPage(p)
  }

  if (!user || !week) return null

  return (
    <div className="home-week-strip-wrap">
      <div className="home-week-scroll" ref={scrollRef} onScroll={onScroll}>
        {week.days.map((d) => {
          const isToday = d.dateKey === todayKey
          const trained = trainedDateKeys?.has?.(d.dateKey)
          const selected = selectedDateKey === d.dateKey
          const dateNum = String(Number(d.dateKey.slice(-2)))
          return (
            <button
              key={d.dateKey}
              type="button"
              className={`home-week-pill ${selected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => onSelectDateKey(d.dateKey)}
            >
              <span className="home-week-pill-wd">{d.weekdayShort}</span>
              <span className="home-week-pill-date">{dateNum}</span>
              <span
                className={`home-week-pill-dot ${trained ? 'is-on' : ''} ${isToday ? 'is-pulse' : ''}`}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
      <div className="home-week-dots" aria-hidden>
        <span className={`home-week-dot ${page === 0 ? 'is-on' : ''}`} />
        <span className={`home-week-dot ${page === 1 ? 'is-on' : ''}`} />
      </div>
    </div>
  )
}
