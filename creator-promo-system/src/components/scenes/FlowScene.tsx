import { motion } from 'motion/react'
import { ClipboardList } from 'lucide-react'
import { cardPop, stagger } from '../../animations/animations'
import { Card } from '../ui/Card'
import { FlowLine } from '../ui/FlowLine'
import { SceneContainer } from '../ui/SceneContainer'
import { Title } from '../ui/Title'
import type { PromoData } from '../../utils/promoTypes'

type FlowSceneProps = {
  active: boolean
  data: PromoData['flow']
  progress: number
}

export function FlowScene({ active, data, progress }: FlowSceneProps) {
  return (
    <SceneContainer active={active} className="flow-scene">
      <motion.div className="flow-layout" variants={stagger} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        <Title size="medium">{data.title}</Title>
        <div className="flow-workspace">
          <Card className="intake-card">
            <ClipboardList aria-hidden="true" size={30} strokeWidth={1.35} />
            <span>{data.steps[0].label}</span>
            <small>{data.steps[0].note}</small>
          </Card>
          <motion.div
            className="data-pulse"
            animate={{ x: `${Math.min(100, progress * 124)}%`, opacity: progress > 0.88 ? 0 : 1 }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          />
          <FlowLine steps={data.steps} progress={progress} />
        </div>
        <motion.div className="archive-preview" variants={cardPop}>
          <span>保存・複製</span>
          <small>次の案件へ、同じ流れを使えます。</small>
        </motion.div>
      </motion.div>
    </SceneContainer>
  )
}
