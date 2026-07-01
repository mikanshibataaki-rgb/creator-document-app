import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fade } from '../../animations/animations'

type SceneContainerProps = {
  active: boolean
  children: ReactNode
  className?: string
}

export function SceneContainer({ active, children, className = '' }: SceneContainerProps) {
  return (
    <motion.section
      aria-hidden={!active}
      className={`scene-container ${className}`}
      initial={false}
      animate={active ? 'visible' : 'hidden'}
      variants={fade}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      {children}
    </motion.section>
  )
}
