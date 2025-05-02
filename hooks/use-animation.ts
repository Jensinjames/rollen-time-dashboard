"use client"

import { useState, useEffect, useRef } from "react"

// Hook for animating number counting
export function useCountUp(endValue: number, duration = 1500, startValue = 0, delay = 0) {
  const [count, setCount] = useState(startValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const startAnimation = () => {
      setIsAnimating(true)
      startTimeRef.current = null

      const step = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)

        setCount(Math.floor(progress * (endValue - startValue) + startValue))

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step)
        } else {
          setCount(endValue)
          setIsAnimating(false)
          animationRef.current = null
        }
      }

      animationRef.current = requestAnimationFrame(step)
    }

    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay)
    } else {
      startAnimation()
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [endValue, duration, startValue, delay]) // These dependencies are fine since they should be stable

  return { count, isAnimating }
}

// Hook for intersection observer animations
export function useIntersectionAnimation(threshold = 0.1, rootMargin = "0px") {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Clean up previous observer if it exists
    if (observerRef.current && ref.current) {
      observerRef.current.unobserve(ref.current)
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current && observerRef.current) {
            observerRef.current.unobserve(ref.current)
          }
        }
      },
      { threshold, rootMargin },
    )

    const currentRef = ref.current
    if (currentRef && observerRef.current) {
      observerRef.current.observe(currentRef)
    }

    return () => {
      if (currentRef && observerRef.current) {
        observerRef.current.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin])

  return { ref, isVisible }
}

// Hook for staggered animations
export function useStaggeredAnimation(itemCount: number, staggerDelay = 100, initialDelay = 0) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current = []

    // Reset visible items when itemCount changes
    setVisibleItems([])

    const newTimeouts: NodeJS.Timeout[] = []

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(
        () => {
          setVisibleItems((prev) => {
            // Only add if not already included
            if (prev.includes(i)) return prev
            return [...prev, i]
          })
        },
        initialDelay + i * staggerDelay,
      )

      newTimeouts.push(timeout)
    }

    timeoutsRef.current = newTimeouts

    return () => {
      newTimeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [itemCount, staggerDelay, initialDelay])

  const isItemVisible = (index: number) => visibleItems.includes(index)

  return { isItemVisible, visibleItems }
}
