import { HeroScene } from './components/scenes/HeroScene'
import { ProblemScene } from './components/scenes/ProblemScene'
import { CategoryScene } from './components/scenes/CategoryScene'
import { FeatureScene } from './components/scenes/FeatureScene'
import { FlowScene } from './components/scenes/FlowScene'
import { EndingScene } from './components/scenes/EndingScene'
import { Timeline } from './components/ui/Timeline'
import { useTimeline } from './hooks/useTimeline'
import { promoThemes, themeVars } from './theme/theme'
import { selectPromoFromUrl } from './utils/selectPromo'
import { segmentProgress, timelineSegments } from './utils/timeline'
import type { PromoData, SceneKind } from './utils/promoTypes'

const currentPromo = selectPromoFromUrl()
const exportMode = new URLSearchParams(window.location.search).get('export') === '1'

type SceneRendererProps = {
  promo: PromoData
  activeId: string
  time: number
}

const sceneRegistry = {
  hero: HeroScene,
  problem: ProblemScene,
  category: CategoryScene,
  feature: FeatureScene,
  flow: FlowScene,
  ending: EndingScene,
}

const sceneData = {
  hero: (promo: PromoData) => promo.hero,
  problem: (promo: PromoData) => promo.problem,
  category: (promo: PromoData) => promo.category,
  feature: (promo: PromoData) => promo.feature,
  flow: (promo: PromoData) => promo.flow,
  ending: (promo: PromoData) => promo.ending,
} satisfies Record<SceneKind, (promo: PromoData) => unknown>

function SceneRenderer({ promo, activeId, time }: SceneRendererProps) {
  return (
    <>
      {promo.scenes.map((scene) => {
        const Component = sceneRegistry[scene.kind]
        const segment = timelineSegments.find((item) => item.id === scene.id) ?? timelineSegments[0]
        return (
          <Component
            active={activeId === scene.id}
            data={sceneData[scene.kind](promo) as never}
            key={scene.id}
            progress={segmentProgress(time, segment)}
          />
        )
      })}
    </>
  )
}

function App() {
  const timeline = useTimeline()
  const theme = promoThemes[currentPromo.theme]

  return (
    <main className="promo-root" style={themeVars(theme)}>
      <div className="promo-stage">
        <SceneRenderer promo={currentPromo} activeId={timeline.activeSegment.id} time={timeline.time} />
        {exportMode ? null : <Timeline time={timeline.time} duration={timeline.duration} segments={timeline.segments} />}
      </div>
    </main>
  )
}

export default App
