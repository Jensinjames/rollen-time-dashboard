"use client"

import type React from "react"

import { useVirtualizedList } from "@/hooks/use-virtualized-list"
import { cn } from "@/lib/utils"

interface VirtualizedListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscan = 3,
}: VirtualizedListProps<T>) {
  const { containerRef, visibleItems, startIndex, totalHeight, offsetY, handleScroll } = useVirtualizedList(
    items,
    height,
    { itemHeight, overscan },
  )

  return (
    <div ref={containerRef} className={cn("overflow-auto", className)} style={{ height }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
        </div>
      </div>
    </div>
  )
}
