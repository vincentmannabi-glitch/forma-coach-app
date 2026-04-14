/**
 * Thin session progress bar — fills smoothly as sets are completed.
 */
export default function TrainSessionProgressBar({ pct }) {
  const w = Math.min(100, Math.max(0, pct))
  return (
    <div
      className="train-session-progress"
      role="progressbar"
      aria-valuenow={Math.round(w)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="train-session-progress-fill" style={{ width: `${w}%` }} />
    </div>
  )
}
