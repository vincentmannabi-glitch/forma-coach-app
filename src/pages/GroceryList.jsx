import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentUserSync } from '../utils/auth'
import {
  getWeeklyProteinTargetGrams,
  isCookbookBelowProteinTarget,
} from '../utils/nutrition'
import { getRecipeById, DEFAULT_WEEK_RECIPE_IDS } from '../data/recipes'
import {
  aggregateGroceryItems,
  aggregateWeeklySnackGroceries,
  mergeGroceryLists,
  computeWeeklyTotals,
  groupByCategory,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  getSwapChoicesForSlot,
} from '../utils/groceryList'
import { isMomExperience, getHouseholdSize } from '../utils/momExperience'
import './GroceryList.css'

const LS_SERVINGS = 'forma-grocery-servings'
const LS_WEEK = 'forma-week-recipe-ids'
const LS_DONE = 'forma-grocery-done'
const LS_REMOVED = 'forma-grocery-removed'

function loadServings() {
  if (typeof window === 'undefined') return 1
  try {
    const u = getCurrentUserSync()
    if (u && isMomExperience(u)) {
      return Math.min(12, Math.max(2, getHouseholdSize(u)))
    }
  } catch {
    /* ignore */
  }
  const n = parseInt(localStorage.getItem(LS_SERVINGS) || '1', 10)
  return Math.min(6, Math.max(1, Number.isFinite(n) ? n : 1))
}

function loadWeekIds() {
  if (typeof window === 'undefined') return [...DEFAULT_WEEK_RECIPE_IDS]
  try {
    const raw = localStorage.getItem(LS_WEEK)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length === 4) return arr
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_WEEK_RECIPE_IDS]
}

function loadIdSet(key) {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return new Set(arr)
    }
  } catch {
    /* ignore */
  }
  return new Set()
}

function formatDateLabel() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
}

export default function GroceryList() {
  const navigate = useNavigate()
  const { profile: user } = useAuth()
  const [servings, setServings] = useState(loadServings)
  const [weekRecipeIds, setWeekRecipeIds] = useState(loadWeekIds)
  const [doneIds, setDoneIds] = useState(() => loadIdSet(LS_DONE))
  const [removedIds, setRemovedIds] = useState(() => loadIdSet(LS_REMOVED))
  const [swapSlot, setSwapSlot] = useState(null)

  useEffect(() => {
    localStorage.setItem(LS_SERVINGS, String(servings))
  }, [servings])

  useEffect(() => {
    localStorage.setItem(LS_WEEK, JSON.stringify(weekRecipeIds))
  }, [weekRecipeIds])

  useEffect(() => {
    localStorage.setItem(LS_DONE, JSON.stringify([...doneIds]))
  }, [doneIds])

  useEffect(() => {
    localStorage.setItem(LS_REMOVED, JSON.stringify([...removedIds]))
  }, [removedIds])

  const aggregated = useMemo(() => {
    const meals = aggregateGroceryItems(weekRecipeIds, servings)
    const snacks = aggregateWeeklySnackGroceries(user)
    return mergeGroceryLists([meals, snacks])
  }, [weekRecipeIds, servings, user])

  const { totalCost: baseCost, weeklyProteinFromMeals } = useMemo(
    () => computeWeeklyTotals(weekRecipeIds, servings),
    [weekRecipeIds, servings],
  )

  const snackCostEstimate = useMemo(() => {
    return aggregateWeeklySnackGroceries(user).reduce((s, r) => s + (r.lineCost || 0), 0)
  }, [user])

  const weeklyProteinTarget = useMemo(() => getWeeklyProteinTargetGrams(user), [user])

  const showProteinSnackHint = useMemo(
    () =>
      user &&
      weeklyProteinTarget != null &&
      isCookbookBelowProteinTarget(user, weekRecipeIds, servings),
    [user, weeklyProteinTarget, weekRecipeIds, servings],
  )

  useEffect(() => {
    const valid = new Set(aggregated.map((i) => i.id))
    setDoneIds((prev) => new Set([...prev].filter((id) => valid.has(id))))
    setRemovedIds((prev) => new Set([...prev].filter((id) => valid.has(id))))
  }, [aggregated])

  const removedCost = useMemo(() => {
    let sum = 0
    for (const id of removedIds) {
      const row = aggregated.find((a) => a.id === id)
      if (row) sum += row.lineCost
    }
    return sum
  }, [aggregated, removedIds])

  const estimatedTotal = Math.max(0, baseCost + snackCostEstimate - removedCost)

  const grouped = useMemo(() => groupByCategory(aggregated), [aggregated])

  const activeByCategory = useMemo(() => {
    /** @type {Record<string, typeof aggregated>} */
    const out = {}
    for (const cat of CATEGORY_ORDER) out[cat] = []
    for (const cat of CATEGORY_ORDER) {
      out[cat] = grouped[cat].filter((i) => !removedIds.has(i.id) && !doneIds.has(i.id))
    }
    return out
  }, [grouped, removedIds, doneIds])

  const doneItems = useMemo(
    () => aggregated.filter((i) => doneIds.has(i.id) && !removedIds.has(i.id)),
    [aggregated, doneIds, removedIds],
  )

  const adjustServings = (delta) => {
    setServings((s) => Math.min(6, Math.max(1, s + delta)))
  }

  const toggleDone = (id) => {
    setDoneIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeHave = (id) => {
    setRemovedIds((prev) => new Set(prev).add(id))
    setDoneIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const swapRecipe = (slotIndex, newId) => {
    setWeekRecipeIds((ids) => {
      const next = [...ids]
      next[slotIndex] = newId
      return next
    })
    setSwapSlot(null)
  }

  const shareList = useCallback(async () => {
    const lines = []
    lines.push("This Week's Grocery List")
    lines.push(formatDateLabel())
    lines.push('')
    lines.push(`Serves: ${servings}`)
    lines.push(`Estimated total: $${estimatedTotal.toFixed(2)}`)
    lines.push(
      weeklyProteinTarget != null
        ? `Weekly protein target (from your body weight): ${weeklyProteinTarget}g`
        : 'Weekly protein target: add body weight to your profile',
    )
    lines.push(`Protein from this week's planned meals: ${weeklyProteinFromMeals}g`)
    lines.push('')

    for (const cat of CATEGORY_ORDER) {
      const active = grouped[cat].filter((i) => !removedIds.has(i.id) && !doneIds.has(i.id))
      if (!active.length) continue
      lines.push(CATEGORY_LABELS[cat].toUpperCase())
      for (const item of active) {
        lines.push(`- [ ] ${item.displayLine}`)
      }
      lines.push('')
    }

    if (doneItems.length) {
      lines.push('DONE')
      for (const item of doneItems) {
        lines.push(`- [x] ${item.displayLine}`)
      }
    }

    const text = lines.join('\n').trim()

    try {
      if (navigator.share) {
        await navigator.share({ title: "This Week's Grocery List", text })
        return
      }
    } catch (e) {
      if (e?.name === 'AbortError') return
    }

    try {
      await navigator.clipboard.writeText(text)
      alert('List copied to clipboard.')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      alert('List copied to clipboard.')
    }
  }, [servings, estimatedTotal, weeklyProteinTarget, weeklyProteinFromMeals, grouped, removedIds, doneIds, doneItems])

  return (
    <div className="grocery-page">
      <header className="grocery-top">
        <div className="grocery-toolbar">
          <button type="button" className="grocery-icon-btn" onClick={() => navigate('/cookbook')} aria-label="Back">
            ←
          </button>
          <button type="button" className="grocery-share-btn" onClick={shareList}>
            Share
          </button>
        </div>
        <h1 className="grocery-h1">This Week&apos;s Grocery List</h1>
        <p className="grocery-date">{formatDateLabel()}</p>
        <p className="grocery-snack-note">
          Includes ingredients for your planned main meals plus snacks for the week (from your preferences and daily
          targets).
        </p>

        <div className="grocery-serves">
          <span className="grocery-serves-label">Serves</span>
          <div className="grocery-serves-controls">
            <button
              type="button"
              className="grocery-stepper"
              onClick={() => adjustServings(-1)}
              disabled={servings <= 1}
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="grocery-serves-num">{servings}</span>
            <button
              type="button"
              className="grocery-stepper"
              onClick={() => adjustServings(1)}
              disabled={servings >= 6}
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>

        <div className="grocery-stats">
          <div className="grocery-stat">
            <span className="grocery-stat-label">Est. total</span>
            <span className="grocery-stat-value">${estimatedTotal.toFixed(2)}</span>
          </div>
          <div className="grocery-stat">
            <span className="grocery-stat-label">Weekly protein target</span>
            <span className="grocery-stat-value">
              {weeklyProteinTarget != null ? `${weeklyProteinTarget}g` : '—'}
            </span>
            <span className="grocery-stat-sub">7× your daily target</span>
          </div>
        </div>
        {weeklyProteinTarget != null && (
          <p className="grocery-protein-meals">
            From this week&apos;s meals: <strong>{weeklyProteinFromMeals}g</strong> protein
          </p>
        )}
        {showProteinSnackHint && (
          <div className="grocery-protein-alert" role="status">
            <p className="grocery-protein-alert-title">Boost your protein</p>
            <p className="grocery-protein-alert-text">
              Your planned meals average less than your daily target. Add a protein-rich snack or shake
              (Greek yogurt, cottage cheese, whey, or a protein smoothie) to close the gap.
            </p>
          </div>
        )}
      </header>

      <section className="grocery-meals" aria-label="Weekly meals">
        <h2 className="grocery-section-title">Meals this week</h2>
        <div className="grocery-meal-grid">
          {weekRecipeIds.map((rid, slot) => {
            const r = getRecipeById(rid)
            if (!r) return null
            return (
              <div key={`${slot}-${rid}`} className="grocery-meal-card">
                <img className="grocery-meal-img" src={r.image} alt="" loading="lazy" />
                <div className="grocery-meal-body">
                  <p className="grocery-meal-name">{r.name}</p>
                  <p className="grocery-meal-meta">
                    {r.protein} · {r.calories} cal
                  </p>
                  <button type="button" className="grocery-swap-btn" onClick={() => setSwapSlot(slot)}>
                    Meal swap
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {swapSlot !== null && (
        <div
          className="grocery-modal-backdrop"
          role="presentation"
          onClick={() => setSwapSlot(null)}
        >
          <div
            className="grocery-modal"
            role="dialog"
            aria-labelledby="swap-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="swap-title" className="grocery-modal-title">
              Swap meal
            </h3>
            <p className="grocery-modal-sub">Similar macros — list updates instantly.</p>
            <ul className="grocery-swap-list">
              {getSwapChoicesForSlot(swapSlot, weekRecipeIds[swapSlot]).map((id) => {
                const r = getRecipeById(id)
                if (!r) return null
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="grocery-swap-option"
                      onClick={() => swapRecipe(swapSlot, id)}
                    >
                      <img src={r.image} alt="" className="grocery-swap-option-img" />
                      <div>
                        <p className="grocery-swap-option-name">{r.name}</p>
                        <p className="grocery-swap-option-meta">
                          {r.protein} protein · {r.calories} cal
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
            <button type="button" className="grocery-modal-close" onClick={() => setSwapSlot(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grocery-list-wrap">
        {CATEGORY_ORDER.map((cat) => {
          const items = activeByCategory[cat]
          if (!items?.length) return null
          return (
            <section key={cat} className="grocery-cat">
              <h2 className="grocery-cat-title">{CATEGORY_LABELS[cat]}</h2>
              <ul className="grocery-items">
                {items.map((item) => (
                  <li key={item.id} className="grocery-item">
                    <button
                      type="button"
                      className="grocery-item-check"
                      onClick={() => toggleDone(item.id)}
                      aria-pressed={doneIds.has(item.id)}
                      aria-label={`Got ${item.label}`}
                    >
                      <span className="grocery-checkbox" aria-hidden />
                    </button>
                    <span className="grocery-item-text">{item.displayLine}</span>
                    <button type="button" className="grocery-have-btn" onClick={() => removeHave(item.id)}>
                      Already have it
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        {doneItems.length > 0 && (
          <section className="grocery-cat grocery-cat--done">
            <h2 className="grocery-cat-title">Done</h2>
            <ul className="grocery-items">
              {doneItems.map((item) => (
                <li key={item.id} className="grocery-item grocery-item--done">
                  <button
                    type="button"
                    className="grocery-item-check grocery-item-check--on"
                    onClick={() => toggleDone(item.id)}
                    aria-pressed
                    aria-label={`Undo ${item.label}`}
                  >
                    <span className="grocery-checkbox grocery-checkbox--on" aria-hidden />
                  </button>
                  <span className="grocery-item-text">{item.displayLine}</span>
                  <button type="button" className="grocery-have-btn" onClick={() => removeHave(item.id)}>
                    Already have it
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
