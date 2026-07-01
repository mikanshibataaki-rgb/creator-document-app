import { motion } from 'motion/react'
import { Check, Minus } from 'lucide-react'
import { cardPop, fadeUp, stagger } from '../../animations/animations'
import { Card } from '../ui/Card'
import { SceneContainer } from '../ui/SceneContainer'
import { Subtitle } from '../ui/Subtitle'
import { Title } from '../ui/Title'
import type { PromoData } from '../../utils/promoTypes'

type ProblemSceneProps = {
  active: boolean
  data: PromoData['problem']
}

export function ProblemScene({ active, data }: ProblemSceneProps) {
  return (
    <SceneContainer active={active} className="problem-scene">
      <motion.div className="scene-heading" variants={stagger} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        <Title size="large">{data.title}</Title>
      </motion.div>
      <motion.div className="hearing-board" variants={stagger} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        {data.items.map((item) => (
          <Card className={`check-card ${item.checked ? 'check-card-on' : ''}`} key={item.label}>
            <span className="check-icon">
              {item.checked ? <Check aria-hidden="true" size={18} /> : <Minus aria-hidden="true" size={18} />}
            </span>
            <span>{item.label}</span>
          </Card>
        ))}
      </motion.div>
      <motion.div className="problem-message" variants={fadeUp} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        <Subtitle>{data.message}</Subtitle>
      </motion.div>
      <motion.div className="soft-panel panel-backdrop" variants={cardPop} initial="hidden" animate={active ? 'visible' : 'hidden'} />
    </SceneContainer>
  )
}
