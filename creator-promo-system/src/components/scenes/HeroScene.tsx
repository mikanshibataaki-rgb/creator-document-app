import { motion } from 'motion/react'
import { ClipboardList } from 'lucide-react'
import { blurIn, fadeUp, stagger } from '../../animations/animations'
import { Chip } from '../ui/Chip'
import { SceneContainer } from '../ui/SceneContainer'
import { Subtitle } from '../ui/Subtitle'
import { Title } from '../ui/Title'
import type { PromoData } from '../../utils/promoTypes'

type HeroSceneProps = {
  active: boolean
  data: PromoData['hero']
}

export function HeroScene({ active, data }: HeroSceneProps) {
  return (
    <SceneContainer active={active} className="hero-scene">
      <motion.div className="center-stack" variants={stagger} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        <motion.div className="hero-orbit" variants={blurIn}>
          <ClipboardList aria-hidden="true" size={42} strokeWidth={1.3} />
        </motion.div>
        <Title size="hero">{data.title}</Title>
        <Subtitle>{data.product}</Subtitle>
        <motion.div variants={fadeUp}>
          <Chip active>{data.status}</Chip>
        </motion.div>
      </motion.div>
    </SceneContainer>
  )
}
