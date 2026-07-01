import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { blurIn } from '../../animations/animations'

type TitleProps = {
  children: ReactNode
  size?: 'hero' | 'large' | 'medium'
  className?: string
}

export function Title({ children, size = 'large', className = '' }: TitleProps) {
  return (
    <motion.h1 className={`title title-${size} ${className}`} variants={blurIn}>
      {children}
    </motion.h1>
  )
}
