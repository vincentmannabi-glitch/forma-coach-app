/**
 * Split "1 lb chicken" → { qty: "1", unit: "lb", name: "chicken" } (best-effort for display + scaling).
 * @param {string} line
 * @param {number} factor — serves / baseServes
 */
export function parseIngredientForDisplay(line, factor = 1) {
  const raw = (line || '').trim()
  if (!raw) return { qty: '', name: '', full: '' }

  const m = raw.match(/^([\d./]+\s*(?:-\s*[\d./]+)?)\s*([a-zA-Z%°"'’]*)\s+(.+)$/)
  if (m) {
    const numPart = m[1].replace(/\s/g, '')
    const unit = (m[2] || '').trim()
    const name = (m[3] || '').trim()
    const scaled = scaleQuantityToken(numPart, factor)
    const qty = unit ? `${scaled} ${unit}`.trim() : scaled
    return { qty, name, full: raw }
  }

  const leadNum = raw.match(/^([\d./]+\s*(?:-\s*[\d./]+)?)\s+(.*)$/)
  if (leadNum) {
    const scaled = scaleQuantityToken(leadNum[1].replace(/\s/g, ''), factor)
    return { qty: scaled, name: leadNum[2].trim(), full: raw }
  }

  return { qty: '', name: raw, full: raw }
}

function scaleQuantityToken(token, factor) {
  if (!token || factor === 1) return token
  const range = token.split('-').map((p) => scaleSingleNumber(p.trim(), factor))
  if (range.length === 2) return `${range[0]}-${range[1]}`
  return range[0]
}

function scaleSingleNumber(s, factor) {
  if (!s) return s
  const frac = s.includes('/')
  if (frac) {
    const [a, b] = s.split('/').map(Number)
    if (b && Number.isFinite(a)) {
      const v = (a / b) * factor
      return formatAmount(v)
    }
  }
  const n = parseFloat(s)
  if (!Number.isFinite(n)) return s
  return formatAmount(n * factor)
}

function formatAmount(v) {
  if (v < 0.125) return v.toFixed(2).replace(/\.?0+$/, '')
  if (v < 10 && v % 1 !== 0) return Math.round(v * 100) / 100 === v ? String(v) : v.toFixed(1).replace(/\.0$/, '')
  return String(Math.round(v * 10) / 10).replace(/\.0$/, '')
}
