"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

export function ColorPicker({ color, onChange, label, className }: ColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(color)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Predefined color palette
  const colorPalette = [
    // Blues
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8",
    // Greens
    "#34d399",
    "#10b981",
    "#059669",
    "#047857",
    // Reds
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    // Yellows
    "#fbbf24",
    "#f59e0b",
    "#d97706",
    "#b45309",
    // Purples
    "#a78bfa",
    "#8b5cf6",
    "#7c3aed",
    "#6d28d9",
    // Pinks
    "#f472b6",
    "#ec4899",
    "#db2777",
    "#be185d",
    // Grays
    "#f8fafc",
    "#e2e8f0",
    "#94a3b8",
    "#475569",
    "#1e293b",
    "#0f172a",
  ]

  useEffect(() => {
    setCurrentColor(color)
  }, [color])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCurrentColor(newColor)
  }

  const handleColorSelect = (selectedColor: string) => {
    setCurrentColor(selectedColor)
    onChange(selectedColor)
  }

  const handleApply = () => {
    onChange(currentColor)
    setIsOpen(false)
  }

  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      {label && <Label htmlFor={`color-${label}`}>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal h-10" id={`color-${label}`}>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: currentColor }} />
              <span>{currentColor}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-8 gap-1">
              {colorPalette.map((paletteColor) => (
                <button
                  key={paletteColor}
                  type="button"
                  className={cn(
                    "h-6 w-6 rounded-md border",
                    currentColor === paletteColor ? "ring-2 ring-offset-2 ring-primary" : "border-gray-200",
                  )}
                  style={{ backgroundColor: paletteColor }}
                  onClick={() => handleColorSelect(paletteColor)}
                  aria-label={`Select color ${paletteColor}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md border border-gray-200" style={{ backgroundColor: currentColor }} />
              <Input ref={inputRef} type="text" value={currentColor} onChange={handleColorChange} className="h-8" />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  inputRef.current?.click()
                }}
              >
                Custom
              </Button>
              <Button size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
