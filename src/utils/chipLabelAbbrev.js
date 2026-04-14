/**
 * Short labels for train week cards (UPR, LWR, HIIT, REST, MOBL).
 */
export function chipLabelToAbbrev(chipLabel) {
  const s = (chipLabel || '').toLowerCase()
  if (/rest|recovery/.test(s) && !/active/.test(s)) return 'REST'
  if (/active recovery|mobility|mobil|walk|hike|swim/.test(s)) return 'MOBL'
  if (/hiit|interval|conditioning/.test(s)) return 'HIIT'
  if (/steady|zone 2|cardio/.test(s) && !/hiit/.test(s)) return 'CARD'
  if (/upper|push|pull/.test(s)) return 'UPR'
  if (/lower|leg|squat|hinge/.test(s)) return 'LWR'
  if (/full/.test(s)) return 'FULL'
  if (/core|abs|trunk/.test(s)) return 'CORE'
  return 'SESS'
}
