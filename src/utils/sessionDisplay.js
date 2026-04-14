/**
 * Display titles for training sessions from program chip labels.
 */
export function formatSessionTitleFromChip(chipLabel) {
  if (!chipLabel || typeof chipLabel !== 'string') return 'Training session'
  return chipLabel
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
}
