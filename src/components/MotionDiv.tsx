'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionDivProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  x?: number
  y?: number
  scale?: number
  opacity?: number
  once?: boolean
}

export function MotionDiv({
  children,
  className,
  delay = 0,
  duration = 0.5,
  x = 0,
  y = 0,
  scale = 1,
  opacity = 1,
  once = true,
}: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    hidden: {
      x: shouldReduceMotion ? 0 : x,
      y: shouldReduceMotion ? 0 : y,
      scale: shouldReduceMotion ? 1 : scale,
      opacity: shouldReduceMotion ? 1 : 0,
    },
    visible: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration,
        delay,
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
