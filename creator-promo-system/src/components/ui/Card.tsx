import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cardPop } from '../../animations/animations'

type CardProps = {
  children: ReactNode
  className?: string
  layoutId?: string
}

export function Card({ children, className = '', layoutId }: CardProps) {
  return (
    <motion.div className={`card ${className}`} layout layoutId={layoutId} variants={cardPop}>
      {children}
    </motion.div>
  )
}
