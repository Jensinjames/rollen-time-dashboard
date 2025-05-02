"use client"

import { useState, useRef, useEffect } from "react"
import { Card, type CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends CardProps {
  animationVariant?: "fade-in" | "scale-in" | "slide-in-right" | "slide-in-left" | "none"
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "none"
  animationDelay?: number
  interactive?: boolean
}

export function AnimatedCard({
  children,
  className,
  animationVariant = "fade-in",
  hoverEffect = "lift",
  animationDelay = 0,
  interactive = true,
  ...props
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection observer to trigger animation when card comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  // Generate animation class based on variant
  const getAnimationClass = () => {
    if (animationVariant === "none") return ""

    return (
      {
        "fade-in": "animate-fade-in",
        "scale-in": "animate-scale-in",
        "slide-in-right": "animate-slide-in-right",
        "slide-in-left": "animate-slide-in-left",
      }[animationVariant] || "animate-fade-in"
    )
  }

  // Generate hover effect class
  const getHoverClass = () => {
    if (!interactive || hoverEffect === "none") return ""

    return (
      {
        lift: "hover:-translate-y-1 hover:shadow-lg",
        glow: "hover:shadow-md hover:shadow-primary/25",
        border: "hover:border-primary/50",
        scale: "hover:scale-[1.02]",
      }[hoverEffect] || ""
    )
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "transition-all duration-300 ease-in-out",
        isVisible ? getAnimationClass() : "opacity-0",
        getHoverClass(),
        className,
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: "forwards",
      }}
      {...props}
    >
      {children}
    </Card>
  )
}
