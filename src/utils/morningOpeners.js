/**
 * Personalized morning check-in openers — varied, specific, never repeat the same line twice in the rotation window.
 */
import { dateKeyLocal } from './foodLog'
import { getCurrentStreakSync, getSessionsSync, getProgramContextSync } from './workouts'
import { isMomExperience } from './momExperience'
import { firstName } from './userContext'

const HISTORY_KEY = 'forma_morning_opener_hashes'
const MAX_HISTORY = 45

function emailKey() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('forma_auth') || '' : ''
}

function hashLine(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return String(h)
}

function getHistory() {
  const e = emailKey()
  if (!e) return []
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY}_${e}`)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function pushHistory(hash) {
  const e = emailKey()
  if (!e) return
  try {
    let next = [...getHistory(), hash]
    if (next.length > MAX_HISTORY) next = next.slice(-MAX_HISTORY)
    localStorage.setItem(`${HISTORY_KEY}_${e}`, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

/** @returns {{ exerciseNames: string[]; sessionLabel: string } | null} */
function getYesterdayTrainingSummaryLocal() {
  const sessions = getSessionsSync()
  if (!sessions.length) return null
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const yk = dateKeyLocal(y)
  const onDay = sessions.filter((s) => dateKeyLocal(new Date(s.completedAt)) === yk)
  if (!onDay.length) return null
  onDay.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  const last = onDay[0]
  const names = last.exercises?.map((e) => e.displayName || e.exerciseId).filter(Boolean) || []
  return {
    exerciseNames: names.slice(0, 8),
    sessionLabel: last.sessionName || 'Training session',
  }
}


function classifySessionFocus(y) {
  if (!y?.exerciseNames?.length) return null
  const s = y.exerciseNames.join(' ').toLowerCase()
  const lower = /squat|deadlift|leg|rdl|romanian|hamstring|glute|lunge|goblet|hip thrust|calf|lower|press.?leg|leg press/i
  const upper = /bench|press|row|pull|curl|overhead|lat|incline|fly|dip|pulldown|shoulder|upper|chest|tricep|bicep/i
  const l = lower.test(s)
  const u = upper.test(s)
  if (l && !u) return 'lower'
  if (u && !l) return 'upper'
  if (l && u) return 'mixed'
  return 'mixed'
}

function todaySessionLabel(dayInBlock, dpw) {
  const labels3 = [
    'a full-body strength day',
    'a lower-body emphasis day',
    'an upper-body emphasis day',
  ]
  const labels4 = ['lower body power', 'upper body push', 'lower volume', 'upper pull and arms']
  const arr = dpw <= 3 ? labels3 : labels4
  return arr[(Math.max(1, dayInBlock) - 1) % arr.length]
}

/** Find recent check-in (2–7 days ago) with sore region to reference. */
function getRecentSoreToReference(recentCheckIns) {
  if (!recentCheckIns?.length) return null
  const today = dateKeyLocal()
  for (let i = 1; i <= 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dk = dateKeyLocal(d)
    const c = recentCheckIns.find((x) => x.dateKey === dk)
    if (c?.body === 'sore' && c?.soreRegion) return { ...c, daysAgo: i }
  }
  return null
}

/** Find recent poor sleep pattern to reference. */
function getRecentPoorSleepToReference(recentCheckIns) {
  if (!recentCheckIns?.length) return null
  const recent = recentCheckIns.slice(0, 5).filter((c) => c.sleep === 'poor')
  return recent.length >= 2 ? { count: recent.length } : null
}

/**
 * @param {{ user: object; programWeek: number; daysPerWeek?: number; recentCheckIns?: Array }} ctx
 * @returns {string}
 */
export function buildPersonalizedMorningOpener(ctx) {
  const noSessions = !getSessionsSync().length
  const noCheckIns = !(ctx.recentCheckIns?.length)
  if (noSessions && noCheckIns) {
    return 'Welcome to FORMA Coach. Let us start with today. How are you feeling?'
  }

  const fn = firstName(ctx.user) || 'there'
  const wk = ctx.programWeek || 1
  const dpw = ctx.daysPerWeek || ctx.user?.days_per_week || 3
  const y = getYesterdayTrainingSummaryLocal()
  const focus = classifySessionFocus(y)
  const streak = getCurrentStreakSync()
  const pc = getProgramContextSync(dpw)
  const dayLabel = todaySessionLabel(pc.dayInBlock, dpw)
  const noTrainYesterday = !y
  const recentSore = getRecentSoreToReference(ctx.recentCheckIns)
  const poorSleepPattern = getRecentPoorSleepToReference(ctx.recentCheckIns)

  const candidates = []

  if (recentSore) {
    const region = recentSore.soreRegion?.replace(/_/g, ' ') || 'that area'
    const days = recentSore.daysAgo
    candidates.push(
      `Hey ${fn}. ${days} day${days > 1 ? 's' : ''} ago you mentioned your ${region} — how is it feeling today?`,
      `${fn}, last time we spoke you had some ${region} soreness. How is that area now — before we plan today?`,
    )
  }

  if (poorSleepPattern) {
    candidates.push(
      `${fn}, sleep has been rough a few nights running — how did last night go?`,
      `Hey ${fn}. We noticed a few tough sleep nights lately. How are you doing today?`,
    )
  }

  if (isMomExperience(ctx.user)) {
    candidates.push(
      `Morning ${fn}. You are already doing the hardest job in the world — however sleep went, it does not make you behind. How did you sleep?`,
      `${fn}, before the day runs away: how did you sleep — and we will pace training to match, not the other way around.`,
      `Hey ${fn}. Small check-in, big care: how was sleep? There is no “catching up” in motherhood — only showing up.`,
    )
  }

  if (noTrainYesterday && streak >= 1) {
    candidates.push(
      `Hey ${fn}. Rest day today — or at least no session logged yesterday. How is the body recovering?`,
      `${fn}, easy morning. No training on the log yesterday — recovery still counts. How did you sleep?`,
    )
  }

  if (y && focus === 'lower') {
    candidates.push(
      `Good morning ${fn}. You crushed legs yesterday. ${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)} is on deck. How did you sleep?`,
      `${fn}, solid lower day logged — ${y.sessionLabel}. Today we steer toward ${dayLabel}. How are you feeling?`,
    )
  }

  if (y && focus === 'upper') {
    candidates.push(
      `Morning ${fn}. Upper body work yesterday — nice. Today lines up as ${dayLabel}. How did you sleep last night?`,
      `${fn}, you put upper-body reps in the bank yesterday. Let's match today to how you feel — sleep first.`,
    )
  }

  if (wk >= 3) {
    candidates.push(
      `Morning ${fn}. Week ${wk} already — small habits stacking. How did you sleep?`,
      `${fn}, week ${wk} is where the plan stops being theoretical. Honest check-in — how was sleep?`,
    )
  }

  if (streak >= Math.max(5, dpw * 2)) {
    candidates.push(
      `${fn}, you have not missed a session in a while — that is rare air. How did you sleep?`,
      `Good morning ${fn}. Consistency is showing up on the calendar. Sleep honest — how was last night?`,
    )
  }

  candidates.push(
    `Good morning ${fn}. Quick pulse before the day runs away — how did you sleep?`,
    `${fn}, FORMA here — week ${wk}. Yesterday: ${y ? y.sessionLabel : 'no session logged'}. How are you feeling today?`,
    `Morning ${fn}. One honest check-in beats a perfect spreadsheet. Sleep first — how was it?`,
    `${fn}, light questions, big impact — how did sleep treat you?`,
    `Hey ${fn}. Before the world gets loud — how did you sleep, and how is the body?`,
    `${fn}, week ${wk} — we pace today to you, not a generic template. Sleep?`,
    `Good morning ${fn}. ${y ? `Yesterday you logged ${y.sessionLabel}.` : 'No session yesterday — that can be smart recovery.'} Let's tune today. How was sleep?`,
    `${fn}, another sunrise. ${y ? 'Training hit the log yesterday.' : 'Quiet day on the log.'} How did you sleep?`,
  )

  const used = new Set(getHistory())
  let pick = candidates.find((line) => !used.has(hashLine(line)))
  if (!pick) {
    pick = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0]
  }

  const h = hashLine(pick)
  if (!used.has(h)) pushHistory(h)

  return pick
}
