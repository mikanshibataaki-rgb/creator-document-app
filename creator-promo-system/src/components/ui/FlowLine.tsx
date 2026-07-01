import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { cardPop, stagger } from '../../animations/animations'
import type { FlowStep } from '../../utils/promoTypes'

type FlowLineProps = {
  steps: FlowStep[]
  progress: number
}

export function FlowLine({ steps, progress }: FlowLineProps) {
  return (
    <motion.div className="flow-line" variants={stagger} initial="hidden" animate="visible">
      {steps.map((step, index) => {
        const isLit = progress * steps.length >= index
        return (
          <motion.div className="flow-step-wrap" key={step.label} variants={cardPop}>
            <div className={`flow-step ${isLit ? 'flow-step-active' : ''}`}>
              <span>{step.label}</span>
              <small>{step.note}</small>
            </div>
            {index < steps.length - 1 ? <ArrowRight aria-hidden="true" className="flow-arrow" size={22} /> : null}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
