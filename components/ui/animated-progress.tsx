"use client"

import { useState, useEffect } from "react"
import { Progress, type ProgressProps } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps extends ProgressProps {
  initialValue?: number
  animationDuration?: number
  delay?: number
  onAnimationComplete?: () => void
}

export function AnimatedProgress({
  value = 0,
  initialValue = 0,
  animationDuration = 1000,
  delay = 0,
  className,
  onAnimationComplete,
  ...props
}: AnimatedProgressProps) {
  const [currentValue, setCurrentValue] = useState(initialValue)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    let startTimestamp: number | null = null
    let animationFrameId: number | null = null
    let timeoutId: NodeJS.Timeout | null = null

    const startAnimation = () => {
      setIsAnimating(true)

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / animationDuration, 1)

        setCurrentValue(initialValue + progress * (value - initialValue))

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step)
        } else {
          setCurrentValue(value)
          setIsAnimating(false)
          if (onAnimationComplete) onAnimationComplete()
        }
      }

      animationFrameId = requestAnimationFrame(step)
    }

    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay)
    } else {
      startAnimation()
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [value, initialValue, animationDuration, delay, onAnimationComplete])

  return (
    <Progress
      value={currentValue}
      className={cn("transition-all", isAnimating ? "animate-pulse-subtle" : "", className)}
      {...props}
    />
  )
}
