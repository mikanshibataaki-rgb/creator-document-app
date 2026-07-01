import { motion } from 'motion/react'
import { cardPop, stagger } from '../../animations/animations'
import { Card } from '../ui/Card'
import { iconMap } from '../ui/iconMap'
import { SceneContainer } from '../ui/SceneContainer'
import { Title } from '../ui/Title'
import type { PromoData } from '../../utils/promoTypes'

type CategorySceneProps = {
  active: boolean
  data: PromoData['category']
}

export function CategoryScene({ active, data }: CategorySceneProps) {
  return (
    <SceneContainer active={active} className="category-scene">
      <motion.div className="category-layout" variants={stagger} initial="hidden" animate={active ? 'visible' : 'hidden'}>
        <div className="category-title">
          <Title size="medium">{data.title}</Title>
        </div>
        <motion.div className="category-grid" variants={stagger}>
          {data.categories.map((category) => {
            const Icon = iconMap[category.icon]
            return (
              <Card className="category-card" key={category.label}>
                <Icon aria-hidden="true" size={22} strokeWidth={1.45} />
                <span>{category.label}</span>
                <small>{category.note}</small>
              </Card>
            )
          })}
        </motion.div>
        <motion.div className="category-glance" variants={cardPop}>
          <span>{data.categories.length}</span>
          <small>roles prepared</small>
        </motion.div>
      </motion.div>
    </SceneContainer>
  )
}
