"use client"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useWellness } from "@/context/wellness-context"

interface DateRangePickerProps {
  className?: string
}

export function DateRangePicker({ className }: DateRangePickerProps) {
  const { dateRange, setDateRange } = useWellness()

  // Simple date formatter function
  const formatDate = (date: Date) => {
    try {
      return format(date, "MMM d, yyyy")
    } catch (e) {
      // Fallback to built-in formatting if date-fns has issues
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
  }

  // Preset date ranges
  const presets = [
    {
      name: "Last 7 days",
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 7)
        return { from, to }
      },
    },
    {
      name: "Last 30 days",
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 30)
        return { from, to }
      },
    },
    {
      name: "This month",
      getValue: () => {
        const to = new Date()
        const from = new Date(to.getFullYear(), to.getMonth(), 1)
        return { from, to }
      },
    },
    {
      name: "Last month",
      getValue: () => {
        const to = new Date()
        to.setDate(0) // Last day of previous month
        const from = new Date(to.getFullYear(), to.getMonth(), 1)
        return { from, to }
      },
    },
  ]

  return (
    <div className={cn("flex items-center", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-normal",
              !dateRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 opacity-70" />
            <span>
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                  </>
                ) : (
                  formatDate(dateRange.from)
                )
              ) : (
                <span>Select date range</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="border-r p-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="ghost"
                  className="w-full justify-start text-left text-sm font-normal"
                  onClick={() => {
                    const range = preset.getValue()
                    setDateRange(range)
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(newDateRange) => {
                if (newDateRange?.from && newDateRange?.to) {
                  setDateRange({ from: newDateRange.from, to: newDateRange.to })
                }
              }}
              numberOfMonths={1}
              className="rounded-md border"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
