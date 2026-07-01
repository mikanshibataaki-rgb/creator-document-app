import { motion } from 'motion/react'
import { fadeUp, stagger } from '../../animations/animations'
import { Chip } from '../ui/Chip'
import { SceneContainer } from '../ui/SceneContainer'
import { Subtitle } from '../ui/Subtitle'
import { Title } from '../ui/Title'
import type { PromoData } from '../../utils/promoTypes'

type EndingSceneProps = {
  active: boolean
  data: PromoData['ending']
}

export function EndingScene({ active, data }: EndingSceneProps) {
  return (
    <SceneContainer active={active} className="ending-scene">
      <motion.div className="center-stack" variants={stagger} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        <Title size="large">{data.title}</Title>
        <Subtitle>{data.product}</Subtitle>
        <motion.p className="ending-url" variants={fadeUp}>
          {data.url}
        </motion.p>
        <motion.div variants={fadeUp}>
          <Chip active>{data.status}</Chip>
        </motion.div>
      </motion.div>
    </SceneContainer>
  )
}
