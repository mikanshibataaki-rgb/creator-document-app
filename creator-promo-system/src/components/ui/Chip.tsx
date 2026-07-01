import type { ComponentType, ReactNode } from 'react'
import type { LucideProps } from 'lucide-react'
import { motion } from 'motion/react'
import { cardPop } from '../../animations/animations'

type ChipProps = {
  children: ReactNode
  icon?: ComponentType<LucideProps>
  active?: boolean
  className?: string
}

export function Chip({ children, icon: Icon, active = false, className = '' }: ChipProps) {
  return (
    <motion.span className={`chip ${active ? 'chip-active' : ''} ${className}`} variants={cardPop}>
      {Icon ? <Icon aria-hidden="true" size={16} strokeWidth={1.8} /> : null}
      {children}
    </motion.span>
  )
}
