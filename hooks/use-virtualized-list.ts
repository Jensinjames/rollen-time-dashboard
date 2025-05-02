"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface UseVirtualizedListOptions {
  itemHeight: number
  overscan?: number
}

export function useVirtualizedList<T>(items: T[], containerHeight: number, options: UseVirtualizedListOptions) {
  const { itemHeight, overscan = 3 } = options
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible items based on scroll position
  const visibleItemCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount - 1)

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1)

  // Calculate total height
  const totalHeight = items.length * itemHeight

  // Calculate offset for visible items
  const offsetY = startIndex * itemHeight

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  // Update scroll position if container ref changes
  useEffect(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [containerRef])

  return {
    containerRef,
    visibleItems,
    startIndex,
    totalHeight,
    offsetY,
    handleScroll,
  }
}
