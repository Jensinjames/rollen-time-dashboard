"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ButtonProps {
  rippleEffect?: boolean
  hoverScale?: boolean
  pressEffect?: boolean
}

export function AnimatedButton({
  children,
  className,
  rippleEffect = true,
  hoverScale = true,
  pressEffect = true,
  ...props
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleCount = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!rippleEffect || !buttonRef.current) return

    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = {
      x,
      y,
      id: rippleCount.current++,
    }

    setRipples((prevRipples) => [...prevRipples, ripple])

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((r) => r.id !== ripple.id))
    }, 600)
  }

  return (
    <Button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        hoverScale && "hover:scale-[1.03]",
        pressEffect && "active:scale-[0.97]",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {rippleEffect &&
        ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: "200px",
              height: "200px",
              marginLeft: "-100px",
              marginTop: "-100px",
              transform: "scale(0)",
              opacity: "1",
              animation: "ripple 600ms linear",
            }}
          />
        ))}
      {children}
    </Button>
  )
}
