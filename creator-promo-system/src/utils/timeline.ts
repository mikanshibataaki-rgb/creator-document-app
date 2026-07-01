import type { SceneKind } from './promoTypes'

export type TimelineSegment = {
  id: string
  scene: SceneKind
  label: string
  start: number
  end: number
}

export const timelineSegments: TimelineSegment[] = [
  { id: 'scene-1', scene: 'hero', label: 'Scene 1', start: 0, end: 5 },
  { id: 'scene-2', scene: 'problem', label: 'Scene 2', start: 5, end: 11 },
  { id: 'scene-3', scene: 'category', label: 'Scene 3', start: 11, end: 17 },
  { id: 'scene-4', scene: 'feature', label: 'Scene 4', start: 17, end: 31 },
  { id: 'scene-5', scene: 'flow', label: 'Scene 5', start: 31, end: 36 },
  { id: 'scene-6', scene: 'ending', label: 'Scene 6', start: 36, end: 40 },
]

export const totalDuration = timelineSegments[timelineSegments.length - 1].end

export function findSegment(time: number) {
  return timelineSegments.find((segment) => time >= segment.start && time < segment.end) ?? timelineSegments[0]
}

export function segmentProgress(time: number, segment: TimelineSegment) {
  const length = segment.end - segment.start
  return Math.min(1, Math.max(0, (time - segment.start) / length))
}
