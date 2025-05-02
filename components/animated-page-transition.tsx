"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

interface AnimatedPageTransitionProps {
  children: React.ReactNode
}

export function AnimatedPageTransition({ children }: AnimatedPageTransitionProps) {
  const pathname = usePathname()
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsAnimating(true)

    const timeout = setTimeout(() => {
      setDisplayChildren(children)
      setIsAnimating(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [pathname, children])

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      {displayChildren}
    </div>
  )
}
