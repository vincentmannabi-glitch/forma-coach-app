import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDailyProteinTargetGrams } from '../utils/nutrition'
import { getRecipeById } from '../data/recipes'
import { getCachedThemealdbRecipeById } from '../utils/themealdbRecipes'
import { parseIngredientForDisplay } from '../utils/recipeScale'
import './RecipeDetail.css'

const DEFAULT_SNACKS = [
  { id: 'a', name: 'Greek Yogurt', brand: 'Chobani', protein: '15g', calories: '120' },
  { id: 'b', name: 'Beef Stick', brand: 'Chomps', protein: '10g', calories: '90' },
]

const SNACK_KEY = 'forma_snack_pairing_prefs'

function loadSnackPairing() {
  try {
    const raw = localStorage.getItem(SNACK_KEY)
    if (!raw) return DEFAULT_SNACKS
    const p = JSON.parse(raw)
    if (!Array.isArray(p) || p.length < 2) return DEFAULT_SNACKS
    return p.slice(0, 2).map((x, i) => ({
      id: x.id || `s${i}`,
      name: x.name || DEFAULT_SNACKS[i].name,
      brand: x.brand || DEFAULT_SNACKS[i].brand,
      protein: x.protein || DEFAULT_SNACKS[i].protein,
      calories: x.calories || DEFAULT_SNACKS[i].calories,
    }))
  } catch {
    return DEFAULT_SNACKS
  }
}

function parseProteinG(str) {
  const n = parseInt(String(str || '').replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatClockLabel(seconds) {
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)} hr`
  if (seconds >= 60) return `${Math.ceil(seconds / 60)} min`
  return `${seconds}s`
}

export default function RecipeDetail() {
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const recipe = useMemo(
    () => getRecipeById(recipeId) || getCachedThemealdbRecipeById(recipeId),
    [recipeId],
  )
  const { profile: user } = useAuth()

  const [serves, setServes] = useState(1)
  const [checked, setChecked] = useState(() => ({}))
  const [snacks] = useState(() => loadSnackPairing())

  const [timer, setTimer] = useState(null)

  const dailyProteinTarget = useMemo(() => {
    const g = user ? getDailyProteinTargetGrams(user) : null
    return g != null && g > 0 ? g : 150
  }, [user])

  useEffect(() => {
    if (!timer || timer.paused) return
    const id = setInterval(() => {
      setTimer((t) => {
        if (!t || t.paused) return t
        if (t.remaining <= 1) return null
        return { ...t, remaining: t.remaining - 1 }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timer])

  const closeRecipe = useCallback(() => {
    navigate('/cookbook')
  }, [navigate])

  const toggleIngredient = useCallback((index) => {
    setChecked((c) => ({ ...c, [index]: !c[index] }))
  }, [])

  const nutritionSnapshot = useMemo(() => {
    if (!recipe) return { protein: 0, calories: 0, carbs: 0, fat: 0 }
    const n = recipe.nutrition || []
    const find = (label) => n.find((x) => x.label === label)
    const cal = find('Calories')
    const carbs = find('Carbs')
    const fat = find('Fat')
    const prot = find('Protein')
    return {
      protein: prot ? parseFloat(String(prot.value).replace(/[^\d.]/g, '')) || parseProteinG(recipe.protein) : parseProteinG(recipe.protein),
      calories: cal ? parseFloat(String(cal.value).replace(/[^\d.]/g, '')) || recipe.calories : recipe.calories,
      carbs: carbs ? parseFloat(String(carbs.value).replace(/[^\d.]/g, '')) : 0,
      fat: fat ? parseFloat(String(fat.value).replace(/[^\d.]/g, '')) : 0,
    }
  }, [recipe])

  const scaled = useMemo(() => {
    const m = Math.max(0.25, serves)
    return {
      protein: Math.round(nutritionSnapshot.protein * m * 10) / 10,
      calories: Math.round(nutritionSnapshot.calories * m),
      carbs: Math.round(nutritionSnapshot.carbs * m * 10) / 10,
      fat: Math.round(nutritionSnapshot.fat * m * 10) / 10,
    }
  }, [nutritionSnapshot, serves])

  const proteinPct = useMemo(() => {
    if (!dailyProteinTarget) return 0
    return Math.min(100, Math.round((scaled.protein / dailyProteinTarget) * 1000) / 10)
  }, [scaled.protein, dailyProteinTarget])

  const heroPills = useMemo(() => {
    if (!recipe) return []
    return [
      `${Math.round(scaled.protein)}g protein`,
      `${scaled.calories} kcal`,
      recipe.prepTime || '—',
    ]
  }, [recipe, scaled])

  const startTimer = useCallback((stepIndex, seconds, label) => {
    if (!seconds || seconds <= 0) return
    setTimer({
      stepIndex,
      remaining: seconds,
      total: seconds,
      label: label || `Step ${stepIndex + 1}`,
      paused: false,
    })
  }, [])

  const pauseTimer = useCallback(() => {
    setTimer((t) => (t ? { ...t, paused: !t.paused } : t))
  }, [])

  const doneTimer = useCallback(() => setTimer(null), [])

  if (!recipe) {
    return (
      <div className="recipe-detail recipe-detail--empty">
        <button type="button" className="recipe-detail-nav-btn" onClick={closeRecipe}>
          ‹
        </button>
      </div>
    )
  }

  return (
    <div className={`recipe-detail recipe-detail--sheet ${timer ? 'recipe-detail--timer-on' : ''}`}>
      <div className="recipe-detail-top-nav">
        <button type="button" className="recipe-detail-nav-btn recipe-detail-nav-btn--back" onClick={closeRecipe} aria-label="Back">
          ‹
        </button>
        <button type="button" className="recipe-detail-nav-btn recipe-detail-nav-btn--close" onClick={closeRecipe} aria-label="Close">
          ×
        </button>
      </div>

      <div className="recipe-detail-scroll">
        <section className="recipe-hero">
          <img className="recipe-hero-img" src={recipe.image} alt="" loading="lazy" />
          <div className="recipe-hero-gradient" aria-hidden />
          <div className="recipe-hero-text">
            <h1 className="recipe-hero-title">{recipe.name}</h1>
            <div className="recipe-hero-pills">
              {heroPills.map((t) => (
                <span key={t} className="recipe-hero-pill">
                  {t}
                </span>
              ))}
            </div>
            <div className="recipe-serves">
              <button
                type="button"
                className="recipe-serves-btn"
                onClick={() => setServes((s) => Math.max(1, s - 1))}
                aria-label="Fewer servings"
              >
                −
              </button>
              <span className="recipe-serves-num">{serves}</span>
              <button type="button" className="recipe-serves-btn" onClick={() => setServes((s) => s + 1)} aria-label="More servings">
                +
              </button>
            </div>
          </div>
        </section>

        <section className="recipe-quick-stats" aria-label="Macros">
          <div className="recipe-stat-box">
            <span className="recipe-stat-val">{Math.round(scaled.protein)}g</span>
            <span className="recipe-stat-lbl">Protein</span>
          </div>
          <div className="recipe-stat-box">
            <span className="recipe-stat-val">{scaled.calories}</span>
            <span className="recipe-stat-lbl">Calories</span>
          </div>
          <div className="recipe-stat-box">
            <span className="recipe-stat-val">{scaled.carbs}g</span>
            <span className="recipe-stat-lbl">Carbs</span>
          </div>
          <div className="recipe-stat-box">
            <span className="recipe-stat-val">{scaled.fat}g</span>
            <span className="recipe-stat-lbl">Fat</span>
          </div>
        </section>

        <section className="recipe-pair-card">
          <p className="recipe-pair-h">Pair with</p>
          {snacks.map((s) => (
            <div key={s.id} className="recipe-pair-row">
              <div className="recipe-pair-text">
                <span className="recipe-pair-name">{s.name}</span>
                <span className="recipe-pair-brand">{s.brand}</span>
              </div>
              <div className="recipe-pair-pills">
                <span className="recipe-pair-mini">{s.protein}</span>
                <span className="recipe-pair-mini">{s.calories} cal</span>
              </div>
            </div>
          ))}
        </section>

        <section className="recipe-ing-block">
          <h2 className="recipe-sec-title">Ingredients</h2>
          <ul className="recipe-ing-list">
            {recipe.ingredients.map((line, i) => {
              const { qty, name } = parseIngredientForDisplay(line, serves)
              const done = !!checked[i]
              return (
                <li key={i} className={`recipe-ing-li ${done ? 'is-done' : ''}`}>
                  <label className="recipe-ing-label">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleIngredient(i)}
                      className="recipe-ing-check"
                    />
                    <span className="recipe-ing-qty">{qty}</span>
                    <span className="recipe-ing-name">{name || line}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="recipe-steps-block">
          <h2 className="recipe-sec-title">How to make it</h2>
          <ol className="recipe-step-list">
            {recipe.steps.map((step, i) => {
              const sec = typeof step.timerSeconds === 'number' ? step.timerSeconds : 0
              return (
                <li key={i} className="recipe-step-li">
                  <div className="recipe-step-row">
                    <span className="recipe-step-badge">{i + 1}</span>
                    <p className="recipe-step-copy">{step.text}</p>
                  </div>
                  {sec > 0 && (
                    <button
                      type="button"
                      className="recipe-step-timer-pill"
                      onClick={() => startTimer(i, sec, `Step ${i + 1}`)}
                    >
                      <span className="recipe-step-clock" aria-hidden>
                        ⏱
                      </span>
                      {formatClockLabel(sec)}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <section className="recipe-daily">
          <div className="recipe-daily-bar-track">
            <div className="recipe-daily-bar-fill" style={{ width: `${Math.min(100, proteinPct)}%` }} />
          </div>
          <p className="recipe-daily-caption">
            This meal covers {proteinPct}% of your daily protein target.
          </p>
        </section>
      </div>

      {timer && (
        <div className="recipe-timer-banner">
          <div className="recipe-timer-info">
            <span className="recipe-timer-name">{timer.label}</span>
            <span className="recipe-timer-count" aria-live="polite">
              {formatTime(timer.remaining)}
            </span>
          </div>
          <div className="recipe-timer-actions">
            <button type="button" className="recipe-timer-act" onClick={pauseTimer}>
              {timer.paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="recipe-timer-act recipe-timer-act--done" onClick={doneTimer}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
