import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '../../animations/animations'

type SubtitleProps = {
  children: ReactNode
  className?: string
}

export function Subtitle({ children, className = '' }: SubtitleProps) {
  return (
    <motion.p className={`subtitle ${className}`} variants={fadeUp}>
      {children}
    </motion.p>
  )
}
