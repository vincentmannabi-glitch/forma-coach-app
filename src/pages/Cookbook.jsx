import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildSafeHomeUser } from '../utils/homeSafeUser'
import { getRecipePool } from '../utils/dailyNutritionCoach'
import { RECIPES } from '../data/recipes'
import { recipeMatchesCookbookFilter } from '../utils/recipeMealCategory'
import { loadThemealdbWeekRecipes } from '../utils/themealdbRecipes'
import './Cookbook.css'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'pre_workout', label: 'Pre Workout' },
  { id: 'post_workout', label: 'Post Workout' },
]

function proteinGrams(recipe) {
  const n = parseInt(String(recipe?.protein || '').replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

function goalBucket(goalRaw) {
  const g = String(goalRaw || '').toLowerCase()
  if (g.includes('fat') || g.includes('lose') || g.includes('lean')) return 'fat_loss'
  if (g.includes('muscle') || g.includes('build') || g.includes('hypertrophy') || g.includes('strength') || g.includes('strong')) return 'muscle_building'
  return 'general'
}

function rankRecipesForGoal(recipes, goalRaw) {
  const goal = goalBucket(goalRaw)
  return [...(recipes || [])].sort((a, b) => {
    const aProtein = proteinGrams(a)
    const bProtein = proteinGrams(b)
    const aCal = Number(a?.calories) || 0
    const bCal = Number(b?.calories) || 0

    if (goal === 'fat_loss') {
      const aPreferred = aCal < 500 && aProtein >= 20
      const bPreferred = bCal < 500 && bProtein >= 20
      if (aPreferred !== bPreferred) return aPreferred ? -1 : 1
      if (aProtein !== bProtein) return bProtein - aProtein
      return aCal - bCal
    }
    if (goal === 'muscle_building') {
      const aPreferred = aCal >= 500 && aProtein >= 25
      const bPreferred = bCal >= 500 && bProtein >= 25
      if (aPreferred !== bPreferred) return aPreferred ? -1 : 1
      if (aProtein !== bProtein) return bProtein - aProtein
      return bCal - aCal
    }
    return bProtein - aProtein
  })
}

export default function Cookbook() {
  const navigate = useNavigate()
  const { profile: authProfile } = useAuth()
  const user = useMemo(() => buildSafeHomeUser(authProfile), [authProfile])
  const [filter, setFilter] = useState('all')
  const [themealdbExtras, setThemealdbExtras] = useState([])

  useEffect(() => {
    let cancelled = false
    loadThemealdbWeekRecipes()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setThemealdbExtras(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const eligiblePool = useMemo(() => {
    try {
      return getRecipePool(user)
    } catch {
      return RECIPES
    }
  }, [user])

  const fullPool = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const r of [...eligiblePool, ...themealdbExtras]) {
      if (!r?.id || seen.has(r.id)) continue
      seen.add(r.id)
      out.push(r)
    }
    return rankRecipesForGoal(out, user?.goal)
  }, [eligiblePool, themealdbExtras, user?.goal])

  const featured = useMemo(() => {
    return fullPool[0] || null
  }, [fullPool])

  const filteredRows = useMemo(() => {
    if (filter === 'all') {
      return fullPool.slice(0, 9)
    }
    return fullPool
      .filter((r) => recipeMatchesCookbookFilter(r, filter))
      .slice(0, 9)
  }, [filter, fullPool])

  const openRecipe = (id) => {
    navigate(`/cookbook/${id}`)
  }

  const featuredMacros = useMemo(() => {
    if (!featured) return []
    const cal = featured.nutrition?.find((n) => n.label === 'Calories')
    return [
      { key: 'p', text: `${featured.protein} protein` },
      { key: 'c', text: cal ? `${cal.value} ${cal.unit || 'kcal'}` : `${featured.calories} kcal` },
      { key: 't', text: featured.prepTime },
    ]
  }, [featured])

  return (
    <div className="cookbook-page">
      {featured && (
        <button type="button" className="cookbook-featured" onClick={() => openRecipe(featured.id)}>
          <img className="cookbook-featured-img" src={featured.image} alt="" loading="lazy" />
          <div className="cookbook-featured-gradient" aria-hidden />
          <span className="cookbook-featured-badge">This week</span>
          <div className="cookbook-featured-overlay">
            <span className="cookbook-featured-name">{featured.name}</span>
            <div className="cookbook-featured-macros">
              {featuredMacros.map((p) => (
                <span key={p.key} className="cookbook-macro-pill">
                  {p.text}
                </span>
              ))}
            </div>
          </div>
        </button>
      )}

      <div className="cookbook-filters" role="tablist" aria-label="Filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`cookbook-filter-pill ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="cookbook-list">
        {filteredRows.map((recipe) => (
          <li key={recipe.id}>
            <button type="button" className="cookbook-row" onClick={() => openRecipe(recipe.id)}>
              <img className="cookbook-row-img" src={recipe.image} alt="" loading="lazy" />
              <div className="cookbook-row-body">
                <p className="cookbook-row-name">{recipe.name}</p>
                <p className="cookbook-row-meta">
                  <span>{recipe.protein} protein</span>
                  <span>{recipe.calories} kcal</span>
                  <span>{recipe.prepTime}</span>
                </p>
              </div>
              <span className="cookbook-row-chevron" aria-hidden>
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
