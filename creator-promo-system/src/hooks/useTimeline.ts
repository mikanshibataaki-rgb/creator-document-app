import { useEffect, useMemo, useState } from 'react'
import { findSegment, segmentProgress, timelineSegments, totalDuration } from '../utils/timeline'

function readTimelineParams() {
  const params = new URLSearchParams(window.location.search)
  const requestedTime = Number(params.get('t') ?? 0)
  return {
    initialTime: Number.isFinite(requestedTime) ? Math.min(totalDuration - 0.01, Math.max(0, requestedTime)) : 0,
    paused: params.get('pause') === '1',
  }
}

export function useTimeline() {
  const timelineParams = useMemo(() => readTimelineParams(), [])
  const [time, setTime] = useState(timelineParams.initialTime)

  useEffect(() => {
    if (timelineParams.paused) {
      return undefined
    }

    let animationFrame = 0
    const startedAt = performance.now() - timelineParams.initialTime * 1000

    const tick = (now: number) => {
      const elapsed = ((now - startedAt) / 1000) % totalDuration
      setTime(elapsed)
      animationFrame = requestAnimationFrame(tick)
    }

    animationFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrame)
  }, [timelineParams])

  return useMemo(() => {
    const activeSegment = findSegment(time)
    return {
      time,
      duration: totalDuration,
      progress: time / totalDuration,
      activeSegment,
      activeProgress: segmentProgress(time, activeSegment),
      segments: timelineSegments,
    }
  }, [time])
}
