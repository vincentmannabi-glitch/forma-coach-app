/**
 * Warm, specific re-engagement copy — no guilt, no generic filler.
 */
import { loadCheckIns } from './morningCheckIn'

export function firstNameFromUser(user) {
  const n = (user?.name || '').trim()
  if (!n) return ''
  return n.split(/\s+/)[0]
}

export function getLastCheckInWarmLine() {
  const list = loadCheckIns()
  if (!list.length) return null
  const sorted = [...list].sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
  const last = sorted[0]
  if (!last) return null
  const sleep = last.sleep || '—'
  const body = last.body === 'great' ? 'ready' : last.body === 'tired' ? 'a bit tired' : last.body === 'sore' ? 'a little beat up' : last.body === 'injury' ? 'working through something' : 'checked in'
  return `Last time you checked in, sleep was ${sleep} and you said body felt ${body}.`
}

/**
 * @param {{ tier: '3'|'7'|'14'; daysAbsent: number; streak: number; user: object }} ctx
 */
export function buildReengagementOverlayMessage(ctx) {
  const n = firstNameFromUser(ctx.user) || 'there'
  const d = ctx.daysAbsent
  const streak = ctx.streak || 0
  const lastLine = getLastCheckInWarmLine()

  if (ctx.tier === '14') {
    return {
      headline: n,
      body: `${n}. We miss you. Your program is ready when you are. No judgment. No pressure. Just here.`,
      meta: lastLine,
    }
  }

  if (ctx.tier === '7') {
    return {
      headline: n,
      body: `${n}. It has been a week. We are not going anywhere — we wanted to check in. How are you doing — not just with training, everything?`,
      meta: lastLine,
    }
  }

  // Tier 3 — rotate by day so it does not feel stale
  const day = new Date().getDate()
  const idx = day % 3

  const streakLine =
    streak > 0
      ? `Your ${streak} day streak is still alive but it ends today if you do not show up.`
      : `Your program is exactly where you left it — nothing lost.`

  const variants = [
    `${n}. You have been quiet for ${d} days. ${streakLine} We built you a 20 minute session that fits into whatever kind of day you are having. No explanation needed. Just start.`,
    `${n}. Life gets busy. We get it. Your program is exactly where you left it. Here is a short session to get back into it — 20 minutes. That is all.`,
    `${n}. We noticed you have been away a few days. ${streak > 0 ? `That ${streak} day run still matters — one short session keeps the thread alive.` : 'Whenever you are ready, we are too.'} Twenty minutes, most important lifts only. No setup drama.`,
  ]

  return {
    headline: n,
    body: variants[idx],
    meta: lastLine,
  }
}

/**
 * Prefilled coach message when user taps "I need more time" (tier 3).
 */
export function buildReengagementChatMessageSoft(user) {
  const fn = firstNameFromUser(user) || 'there'
  return `Hey ${fn}. No pressure at all — what is going on? Sometimes life just gets in the way and that is completely okay. The program will be here whenever you are ready. Is there anything I can help with?`
}

/** Auto coach line when tier-7 user lands in chat (under overlay). */
export function buildReengagementChatMessageWeek(user) {
  const fn = firstNameFromUser(user) || 'there'
  return `${fn} — it has been a week. We are not going anywhere. We just wanted to check in properly. How are you doing — training aside, how is life treating you?`
}
