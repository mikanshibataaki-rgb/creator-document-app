import type { Variants } from 'motion/react'

export const calmSpring = {
  type: 'spring',
  stiffness: 86,
  damping: 24,
  mass: 0.8,
} as const

export const slowSpring = {
  type: 'spring',
  stiffness: 58,
  damping: 22,
  mass: 1,
} as const

export const sharedTransition = {
  layout: {
    type: 'spring',
    stiffness: 72,
    damping: 24,
    mass: 0.9,
  },
  opacity: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
} as const

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.54, ease: [0.4, 0, 1, 1] } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: slowSpring },
  exit: { opacity: 0, y: -16, transition: { duration: 0.42 } },
}

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(18px)', scale: 0.98 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.86, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, filter: 'blur(14px)', scale: 0.99, transition: { duration: 0.48 } },
}

export const cardPop: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.965, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: calmSpring },
  exit: { opacity: 0, y: -12, scale: 0.985, transition: { duration: 0.34 } },
}

export const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.08,
    },
  },
} satisfies Variants

export const listReveal: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: calmSpring },
  exit: { opacity: 0, x: 12, transition: { duration: 0.3 } },
}
