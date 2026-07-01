import type { TimelineSegment } from '../../utils/timeline'

type TimelineProps = {
  time: number
  duration: number
  segments: TimelineSegment[]
}

export function Timeline({ time, duration, segments }: TimelineProps) {
  return (
    <div className="timeline" aria-label="promotion timeline">
      <div className="timeline-bar">
        <span className="timeline-progress" style={{ transform: `scaleX(${time / duration})` }} />
        {segments.map((segment) => (
          <span
            className="timeline-mark"
            key={segment.id}
            style={{ left: `${(segment.start / duration) * 100}%` }}
          />
        ))}
      </div>
      <div className="timeline-meta">
        <span>40s auto play</span>
        <span>{time.toFixed(1)}s</span>
      </div>
    </div>
  )
}
