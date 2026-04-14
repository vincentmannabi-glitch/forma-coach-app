/**
 * Exact exercise resolution: canonical defaults (bench = flat barbell, etc.),
 * abbreviation expansion, longest-match against app + 166 library, clarify when needed.
 */

import { getAllExercisesFlat, getExerciseById } from './exercises'
import { LIBRARY_EXTRA } from './movementLibraryExtra'

let _nameToLib = null
function libByName() {
  if (!_nameToLib) {
    _nameToLib = new Map()
    for (const lib of LIBRARY_EXTRA) {
      _nameToLib.set(lib.name.toLowerCase(), lib)
    }
  }
  return _nameToLib
}

export function findLibraryEntryByName(name) {
  if (!name) return null
  return libByName().get(name.trim().toLowerCase()) || null
}

/** Normalize punctuation and collapse spaces */
function normalizeWhitespace(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Expand common gym abbreviations (whole-word) before matching.
 */
export function expandExerciseAbbreviations(text) {
  let s = normalizeWhitespace(text)
  const replacements = [
    [/\brdl\b/g, 'romanian deadlift'],
    [/\bohp\b/g, 'overhead press'],
    [/\bmilitary press\b/g, 'overhead press'],
    [/\bshoulder press\b/g, 'overhead press'],
    [/\bcgbp\b/g, 'close grip bench press'],
    [/\bbp\b/g, 'bench press'],
    [/\btbar\b/g, 't-bar'],
    [/\binc\b/g, 'incline'],
    [/\bdec\b/g, 'decline'],
    [/\bdb\b/g, 'dumbbell'],
    [/\bbb\b/g, 'barbell'],
  ]
  for (const [re, rep] of replacements) {
    s = s.replace(re, rep)
  }
  return normalizeWhitespace(s)
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildRows() {
  const rows = []
  const flat = getAllExercisesFlat()
  for (const ex of flat) {
    const name = (ex.name || '').trim()
    if (!name) continue
    rows.push({
      kind: 'app',
      id: ex.id,
      name,
      nameLower: name.toLowerCase(),
      ex,
    })
  }
  for (const lib of LIBRARY_EXTRA) {
    const name = (lib.name || '').trim()
    if (!name) continue
    rows.push({
      kind: 'library',
      id: lib.id,
      name,
      nameLower: name.toLowerCase(),
      lib,
    })
  }
  return rows
}

let _rows = null
function getRows() {
  if (!_rows) _rows = buildRows()
  return _rows
}

/**
 * Longest substring match, then longest significant word match (≥5 chars).
 */
export function longestNameMatch(lower) {
  let best = null
  let bestLen = 0
  for (const row of getRows()) {
    const nm = row.nameLower
    if (nm.length < 4) continue
    if (lower.includes(nm) && nm.length > bestLen) {
      bestLen = nm.length
      best = row
    }
  }
  if (best) return best

  let bestWord = ''
  let bestWordRow = null
  for (const row of getRows()) {
    const nm = row.nameLower
    const words = nm.split(/\s+/).filter((w) => w.length >= 5)
    for (const w of words) {
      try {
        if (new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(lower)) {
          if (
            w.length > bestWord.length ||
            (w.length === bestWord.length && nm.length > (bestWordRow?.nameLower.length || 0))
          ) {
            bestWord = w
            bestWordRow = row
          }
        }
      } catch {
        /* ignore */
      }
    }
  }
  return bestWordRow
}

/**
 * "press" alone or with only vague words → ask which press.
 */
export function isAmbiguousPressQuery(normalized) {
  if (!/\bpress\b/.test(normalized)) return false
  if (PRESS_SPECIFIC.test(normalized)) return false
  // "bench press" etc. already expanded
  if (/\b(bench press|overhead press|leg press|close grip|incline|decline|floor|pin|spoto|jm press|pallof|landmine)\b/.test(normalized)) {
    return false
  }
  return true
}

/** Ordered canonical overrides — more specific phrases first. */
function applyCanonicalDefaults(norm) {
  const n = norm

  if (/\bbench press\b/.test(n)) {
    if (/\bincline\b/.test(n) && !/\bdumbbell\b/.test(n)) {
      const lib = findLibraryEntryByName('Incline Barbell Bench Press')
      if (lib) return { kind: 'library', id: lib.id, name: lib.name, lib }
    }
    if (/\bdecline\b/.test(n)) {
      const lib = findLibraryEntryByName('Decline Bench Press')
      if (lib) return { kind: 'library', id: lib.id, name: lib.name, lib }
    }
    if (/\bdumbbell\b/.test(n)) {
      const ex = getExerciseById('beg-db-bench')
      if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
    }
    if (/\bclose\b/.test(n)) {
      const ex = getExerciseById('adv-close-grip-bench')
      if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
    }
    if (!/\b(incline|decline|dumbbell|close|floor|spoto|paused|pin)\b/.test(n)) {
      const ex = getExerciseById('int-barbell-bench')
      if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
    }
  }

  // Deadlift family — conventional default
  if (/\bdeadlift\b/.test(n)) {
    const dlMods = /\b(romanian|rdl|sumo|trap|stiff|deficit|snatch|single|single-leg|block|rack)\b/.test(n)
    if (!dlMods) {
      const ex = getExerciseById('int-deadlift')
      if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
    }
    if (/\b(romanian|rdl)\b/.test(n)) {
      const ex = getExerciseById('int-rdl') || getExerciseById('beg-rdl')
      if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
    }
  }

  // Squat — back squat default
  if (/\bsquat\b/.test(n)) {
    const sqMods =
      /\b(goblet|front|hack|split|bulgarian|zercher|sissy|smith|pistol|overhead|box|cossack|anderson|pin|safety)\b/.test(
        n,
      )
    if (!sqMods) {
      const ex = getExerciseById('int-back-squat')
      if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
    }
  }

  // Row — barbell row default
  if (/\brow\b/.test(n)) {
    const rowMods =
      /\b(cable|seated|t-bar|tbar|machine|inverted|bent|pendlay|trx|ring|landmine|upright|face|single|lever|iso)\b/.test(
        n,
      )
    if (!rowMods) {
      const ex = getExerciseById('int-barbell-row')
      if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
    }
  }

  // Overhead press default
  if (/\b(overhead press|ohp)\b/.test(n) && !/\b(push press|push jerk|split jerk)\b/.test(n)) {
    const ex = getExerciseById('int-ohp')
    if (ex) return { kind: 'app', id: ex.id, name: ex.name, ex }
  }

  // Curl — barbell curl default (library)
  if (/\bcurl\b/.test(n)) {
    const curlMods =
      /\b(wrist|hammer|preacher|concentration|leg|spider|zottman|drag|rope|nordic|reverse|neck|lying|seated)\b/.test(
        n,
      )
    if (!curlMods) {
      const lib = findLibraryEntryByName('Barbell Curl')
      if (lib) return { kind: 'library', id: lib.id, name: lib.name, lib }
    }
  }

  return null
}

/**
 * @returns {{ type: 'resolved'; row: object } | { type: 'clarify'; text: string } | { type: 'none' }}
 */
export function resolveExerciseQuery(userMessage) {
  const raw = (userMessage || '').trim()
  if (!raw) return { type: 'none' }

  const expanded = expandExerciseAbbreviations(raw)

  if (isAmbiguousPressQuery(expanded)) {
    return {
      type: 'clarify',
      text: `You mentioned a press — did you mean bench press, overhead press, or something else? Reply with the exact movement (for example “barbell bench press” or “overhead press”).`,
    }
  }

  const forced = applyCanonicalDefaults(expanded)
  if (forced) {
    if (forced.kind === 'app') {
      const ex = getExerciseById(forced.id)
      if (ex) {
        return {
          type: 'resolved',
          row: {
            kind: 'app',
            id: forced.id,
            name: ex.name,
            nameLower: ex.name.toLowerCase(),
            ex,
          },
        }
      }
    }
    if (forced.kind === 'library' && forced.lib) {
      return {
        type: 'resolved',
        row: {
          kind: 'library',
          id: forced.id,
          name: forced.name,
          nameLower: forced.name.toLowerCase(),
          lib: forced.lib,
        },
      }
    }
  }

  const row = longestNameMatch(expanded)
  if (row) return { type: 'resolved', row }

  return { type: 'none' }
}

export function recomputeMatchForHistory(text) {
  const expanded = expandExerciseAbbreviations(text)
  return longestNameMatch(expanded)
}

/** Exact name match (for variation “Learn more” resolution). */
export function findRowByExactName(name) {
  if (!name) return null
  const ln = name.trim().toLowerCase()
  for (const row of getRows()) {
    if (row.nameLower === ln) return row
  }
  return null
}

/** Alias for coach / legacy imports. */
export const matchExerciseInText = (text) => longestNameMatch(expandExerciseAbbreviations(text))
