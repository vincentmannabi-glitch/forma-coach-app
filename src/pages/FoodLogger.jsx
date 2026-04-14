import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  addFoodEntry,
  getDailyTotals,
  dateKeyLocal,
  getAllFoodEntries,
  deleteFoodEntry,
  getQuickLogPresets,
} from '../utils/foodLog'
import { searchFoods, fetchProductByBarcode } from '../utils/foodSearch'
import { getDailyMacroTargets } from '../utils/nutrition'
import './FoodLogger.css'

function debounce(fn, ms) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

export default function FoodLogger() {
  const navigate = useNavigate()
  const { profile: user } = useAuth()
  const [tab, setTab] = useState('search')
  const [query, setQuery] = useState('')
  const [searchLocal, setSearchLocal] = useState([])
  const [searchRemote, setSearchRemote] = useState([])
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [entries, setEntries] = useState([])

  const targets = useMemo(() => (user ? getDailyMacroTargets(user) : null), [user])

  const refresh = useCallback(async () => {
    const [t, all] = await Promise.all([getDailyTotals(dateKeyLocal()), getAllFoodEntries()])
    setTotals(t || { calories: 0, protein: 0, carbs: 0, fat: 0 })
    setEntries((all || []).filter((e) => e.dateKey === dateKeyLocal()))
  }, [])

  useEffect(() => {
    if (!user) return
    if (user.nutrition_tracker_enabled === false) {
      navigate('/home', { replace: true })
      return
    }
    refresh()
  }, [user, navigate, refresh])

  const runSearch = useMemo(
    () =>
      debounce(async (q) => {
        setLoading(true)
        try {
          const { local, remote } = await searchFoods(q)
          setSearchLocal(local)
          setSearchRemote(remote)
        } finally {
          setLoading(false)
        }
      }, 320),
    [],
  )

  useEffect(() => {
    runSearch(query)
  }, [query, runSearch])

  const logFood = async (item) => {
    await addFoodEntry({
      name: item.name,
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      source: item.source || 'search',
      dateKey: dateKeyLocal(),
    })
    await refresh()
  }

  const handleBarcode = async () => {
    setLoading(true)
    try {
      const p = await fetchProductByBarcode(barcode)
      if (p) logFood(p)
      else alert('Product not found. Try another barcode or use search.')
    } finally {
      setLoading(false)
    }
  }

  const [quickPresets, setQuickPresets] = useState([])
  useEffect(() => {
    getQuickLogPresets(14).then(setQuickPresets)
  }, [entries.length])

  if (!user) return null

  return (
    <div className="food-log-page">
      <header className="food-log-header">
        <button type="button" className="food-log-back" onClick={() => navigate('/home')} aria-label="Back">
          ←
        </button>
        <div>
          <h1 className="food-log-title">Food log</h1>
          <p className="food-log-sub">Today&apos;s running total updates as you log.</p>
        </div>
      </header>

      {targets && (
        <div className="food-log-running">
          <p className="food-log-running-label">Today so far</p>
          <p className="food-log-running-values">
            {totals.calories} / {targets.calories} kcal · P {totals.protein} / {targets.protein}g · C {totals.carbs} /{' '}
            {targets.carbs}g · F {totals.fat} / {targets.fat}g
          </p>
        </div>
      )}

      <div className="food-log-tabs">
        <button type="button" className={tab === 'search' ? 'active' : ''} onClick={() => setTab('search')}>
          Search
        </button>
        <button type="button" className={tab === 'barcode' ? 'active' : ''} onClick={() => setTab('barcode')}>
          Barcode
        </button>
        <button type="button" className={tab === 'quick' ? 'active' : ''} onClick={() => setTab('quick')}>
          Quick log
        </button>
      </div>

      {tab === 'search' && (
        <section className="food-log-panel">
          <input
            type="search"
            className="food-log-search"
            placeholder="Type any food…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <p className="food-log-hint">Searching…</p>}
          <ul className="food-log-results">
            {[...searchLocal, ...searchRemote].map((item, i) => (
              <li key={`${item.name}-${i}`}>
                <button type="button" className="food-log-result-btn" onClick={() => logFood(item)}>
                  <span className="food-log-result-name">{item.name}</span>
                  <span className="food-log-result-macros">
                    {item.calories} kcal · P {item.protein} · C {item.carbs} · F {item.fat}
                    {item.per100g ? ' / 100g' : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'barcode' && (
        <section className="food-log-panel">
          <p className="food-log-hint">Point your camera at a barcode or enter the number (EAN-13).</p>
          <div className="food-log-barcode-row">
            <input
              type="text"
              inputMode="numeric"
              className="food-log-barcode-input"
              placeholder="Barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
            <button type="button" className="food-log-barcode-go" onClick={handleBarcode} disabled={loading}>
              Look up
            </button>
          </div>
        </section>
      )}

      {tab === 'quick' && (
        <section className="food-log-panel">
          <p className="food-log-hint">Your most logged foods — one tap to add again.</p>
          <ul className="food-log-quick">
            {quickPresets.map((item) => (
              <li key={item.name}>
                <button type="button" className="food-log-quick-btn" onClick={() => logFood(item)}>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
          {quickPresets.length === 0 && <p className="food-log-hint">Log foods a few times and they will appear here.</p>}
        </section>
      )}

      <section className="food-log-today" aria-label="Logged today">
        <h2 className="food-log-h2">Logged today</h2>
        <ul className="food-log-entry-list">
          {entries.map((e) => (
            <li key={e.id} className="food-log-entry">
              <div>
                <span className="food-log-entry-name">{e.name}</span>
                <span className="food-log-entry-macros">
                  {e.calories} kcal · P {e.protein} · C {e.carbs} · F {e.fat}
                </span>
              </div>
              <button type="button" className="food-log-entry-del" onClick={async () => { await deleteFoodEntry(e.id); await refresh() }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        {entries.length === 0 && <p className="food-log-hint">Nothing logged yet today.</p>}
      </section>
    </div>
  )
}
