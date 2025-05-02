"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useWellness } from "./wellness-context"
import type { CategoryId } from "@/types/wellness"
import { validateTrackingSessions, validateTrackingSession } from "@/utils/validation"
import { toast } from "@/components/ui/use-toast"

// Types for tracking
export interface TrackingSession {
  id: string
  categoryId: CategoryId
  metricId: string
  startTime: Date
  endTime?: Date
  duration: number // in milliseconds
  isActive: boolean
  notes?: string
}

interface TrackingContextType {
  activeSessions: TrackingSession[]
  recentSessions: TrackingSession[]
  startTracking: (categoryId: CategoryId, metricId: string, notes?: string) => string
  pauseTracking: (sessionId: string) => void
  resumeTracking: (sessionId: string) => void
  stopTracking: (sessionId: string) => void
  discardTracking: (sessionId: string) => void
  updateNotes: (sessionId: string, notes: string) => void
  getSessionById: (sessionId: string) => TrackingSession | undefined
  getTotalTrackedTimeToday: (categoryId: CategoryId, metricId: string) => number // in milliseconds
  validateAllSessions: () => { fixed: number; removed: number }
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

// Number of recent sessions to keep in memory
const MAX_RECENT_SESSIONS = 20

// Local storage keys
const ACTIVE_SESSIONS_KEY = "wellness_active_sessions"
const RECENT_SESSIONS_KEY = "wellness_recent_sessions"

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { addEntry, categories } = useWellness()
  const [activeSessions, setActiveSessions] = useState<TrackingSession[]>([])
  const [recentSessions, setRecentSessions] = useState<TrackingSession[]>([])

  // Create a ref to track if we've shown validation notifications
  const hasShownValidationNotice = useRef(false)

  // Build a map of valid metric IDs for each category
  const categoryMetricsMap = useRef<Record<CategoryId, string[]>>({})

  useEffect(() => {
    const metricsMap: Record<CategoryId, string[]> = {}
    categories.forEach((category) => {
      metricsMap[category.id] = category.metrics.map((metric) => metric.id)
    })
    categoryMetricsMap.current = metricsMap
  }, [categories])

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const savedActiveSessions = localStorage.getItem(ACTIVE_SESSIONS_KEY)
      const savedRecentSessions = localStorage.getItem(RECENT_SESSIONS_KEY)

      if (savedActiveSessions) {
        const parsed = JSON.parse(savedActiveSessions)

        // Validate active sessions
        const { validSessions, invalidCount, fixedCount } = validateTrackingSessions(parsed)

        // Convert string dates back to Date objects (already done in validation)
        setActiveSessions(validSessions)

        // Show notification if we fixed or removed sessions
        if ((invalidCount > 0 || fixedCount > 0) && !hasShownValidationNotice.current) {
          toast({
            title: "Session data validated",
            description: `Fixed ${fixedCount} and removed ${invalidCount} invalid tracking sessions.`,
            variant: invalidCount > 0 ? "destructive" : "default",
          })
          hasShownValidationNotice.current = true
        }
      }

      if (savedRecentSessions) {
        const parsed = JSON.parse(savedRecentSessions)

        // Validate recent sessions
        const { validSessions, invalidCount, fixedCount } = validateTrackingSessions(parsed)

        // Convert string dates back to Date objects (already done in validation)
        setRecentSessions(validSessions)

        // Show notification if we fixed or removed sessions
        if ((invalidCount > 0 || fixedCount > 0) && !hasShownValidationNotice.current) {
          toast({
            title: "Session data validated",
            description: `Fixed ${fixedCount} and removed ${invalidCount} invalid tracking sessions.`,
            variant: invalidCount > 0 ? "destructive" : "default",
          })
          hasShownValidationNotice.current = true
        }
      }
    } catch (error) {
      console.error("Error loading tracking sessions:", error)
      // Initialize with empty arrays in case of error
      setActiveSessions([])
      setRecentSessions([])

      toast({
        title: "Error loading tracking data",
        description: "There was a problem loading your tracking data. Starting with empty data.",
        variant: "destructive",
      })
    }
  }, [])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(activeSessions))
    } catch (error) {
      console.error("Error saving active sessions:", error)
      toast({
        title: "Error saving tracking data",
        description: "There was a problem saving your active tracking sessions.",
        variant: "destructive",
      })
    }
  }, [activeSessions])

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SESSIONS_KEY, JSON.stringify(recentSessions))
    } catch (error) {
      console.error("Error saving recent sessions:", error)
      toast({
        title: "Error saving tracking data",
        description: "There was a problem saving your recent tracking sessions.",
        variant: "destructive",
      })
    }
  }, [recentSessions])

  // Update active sessions every second to keep duration current
  useEffect(() => {
    if (activeSessions.length === 0) return

    const interval = setInterval(() => {
      setActiveSessions((prev) =>
        prev.map((session) => {
          if (!session.isActive) return session

          const now = new Date()
          const duration = now.getTime() - session.startTime.getTime()
          return { ...session, duration }
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSessions])

  // Validate all sessions and fix/remove invalid ones
  const validateAllSessions = useCallback(() => {
    let fixedCount = 0
    let removedCount = 0

    // Validate active sessions
    const {
      validSessions: validActiveSessions,
      invalidCount: activeInvalidCount,
      fixedCount: activeFixedCount,
    } = validateTrackingSessions(activeSessions)

    // Validate recent sessions
    const {
      validSessions: validRecentSessions,
      invalidCount: recentInvalidCount,
      fixedCount: recentFixedCount,
    } = validateTrackingSessions(recentSessions)

    fixedCount = activeFixedCount + recentFixedCount
    removedCount = activeInvalidCount + recentInvalidCount

    if (activeInvalidCount > 0 || activeFixedCount > 0) {
      setActiveSessions(validActiveSessions)
    }

    if (recentInvalidCount > 0 || recentFixedCount > 0) {
      setRecentSessions(validRecentSessions)
    }

    return { fixed: fixedCount, removed: removedCount }
  }, [activeSessions, recentSessions])

  // Start tracking a new activity
  const startTracking = useCallback(
    (categoryId: CategoryId, metricId: string, notes?: string): string => {
      // Validate inputs
      if (!categoryId || !metricId) {
        console.error("Invalid category or metric ID", { categoryId, metricId })
        toast({
          title: "Cannot start tracking",
          description: "Invalid category or metric selected.",
          variant: "destructive",
        })
        return ""
      }

      // Check if category and metric exist
      const categoryExists = categories.some((c) => c.id === categoryId)
      const metricExists = categories.find((c) => c.id === categoryId)?.metrics.some((m) => m.id === metricId)

      if (!categoryExists || !metricExists) {
        console.error("Category or metric does not exist", { categoryId, metricId })
        toast({
          title: "Cannot start tracking",
          description: "The selected category or metric does not exist.",
          variant: "destructive",
        })
        return ""
      }

      const now = new Date()
      const newSession: TrackingSession = {
        id: crypto.randomUUID(),
        categoryId,
        metricId,
        startTime: now,
        duration: 0,
        isActive: true,
        notes,
      }

      // Validate the new session
      const { isValid, errors, fixedSession } = validateTrackingSession(newSession)

      if (!isValid) {
        console.error("Invalid session data", errors)
        toast({
          title: "Cannot start tracking",
          description: "There was a problem creating the tracking session.",
          variant: "destructive",
        })
        return ""
      }

      setActiveSessions((prev) => [...prev, fixedSession || newSession])
      return newSession.id
    },
    [categories],
  )

  // Pause an active tracking session
  const pauseTracking = useCallback((sessionId: string) => {
    if (!sessionId) {
      console.error("Invalid session ID", sessionId)
      return
    }

    setActiveSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId)
      if (!session) {
        console.error("Session not found", sessionId)
        return prev
      }

      return prev.map((session) => {
        if (session.id === sessionId && session.isActive) {
          return { ...session, isActive: false }
        }
        return session
      })
    })
  }, [])

  // Resume a paused tracking session
  const resumeTracking = useCallback((sessionId: string) => {
    if (!sessionId) {
      console.error("Invalid session ID", sessionId)
      return
    }

    setActiveSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId)
      if (!session) {
        console.error("Session not found", sessionId)
        return prev
      }

      return prev.map((session) => {
        if (session.id === sessionId && !session.isActive) {
          return { ...session, isActive: true }
        }
        return session
      })
    })
  }, [])

  // Stop tracking and save the session
  const stopTracking = useCallback(
    (sessionId: string) => {
      if (!sessionId) {
        console.error("Invalid session ID", sessionId)
        return
      }

      const session = activeSessions.find((s) => s.id === sessionId)
      if (!session) {
        console.error("Session not found", sessionId)
        return
      }

      const now = new Date()
      const endTime = now
      const finalDuration = session.isActive ? now.getTime() - session.startTime.getTime() : session.duration

      const completedSession: TrackingSession = {
        ...session,
        endTime,
        duration: finalDuration,
        isActive: false,
      }

      // Validate the completed session
      const { isValid, errors, fixedSession } = validateTrackingSession(completedSession)

      if (!isValid && !fixedSession) {
        console.error("Invalid completed session", errors)
        toast({
          title: "Error completing session",
          description: "There was a problem completing the tracking session.",
          variant: "destructive",
        })
        return
      }

      const validCompletedSession = fixedSession || completedSession

      // Add to recent sessions
      setRecentSessions((prev) => {
        const updated = [validCompletedSession, ...prev.slice(0, MAX_RECENT_SESSIONS - 1)]
        return updated
      })

      // Remove from active sessions
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId))

      // Convert duration from milliseconds to hours for the entry
      const durationHours = validCompletedSession.duration / (1000 * 60 * 60)

      // Add the tracked time to the wellness entry
      addEntry({
        id: crypto.randomUUID(),
        date: new Date(),
        metrics: [
          {
            categoryId: validCompletedSession.categoryId,
            metricId: validCompletedSession.metricId,
            value: durationHours,
          },
        ],
      })
    },
    [activeSessions, addEntry],
  )

  // Discard a tracking session without saving
  const discardTracking = useCallback((sessionId: string) => {
    if (!sessionId) {
      console.error("Invalid session ID", sessionId)
      return
    }

    setActiveSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId)
      if (!session) {
        console.error("Session not found", sessionId)
        return prev
      }

      return prev.filter((s) => s.id !== sessionId)
    })
  }, [])

  // Update notes for a session
  const updateNotes = useCallback((sessionId: string, notes: string) => {
    if (!sessionId) {
      console.error("Invalid session ID", sessionId)
      return
    }

    if (typeof notes !== "string") {
      console.error("Invalid notes", notes)
      notes = String(notes)
    }

    setActiveSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId)
      if (!session) {
        console.error("Session not found", sessionId)
        return prev
      }

      return prev.map((session) => {
        if (session.id === sessionId) {
          return { ...session, notes }
        }
        return session
      })
    })
  }, [])

  // Get a session by ID
  const getSessionById = useCallback(
    (sessionId: string) => {
      if (!sessionId) {
        console.error("Invalid session ID", sessionId)
        return undefined
      }

      return activeSessions.find((s) => s.id === sessionId) || recentSessions.find((s) => s.id === sessionId)
    },
    [activeSessions, recentSessions],
  )

  // Get total tracked time for a specific category and metric today
  const getTotalTrackedTimeToday = useCallback(
    (categoryId: CategoryId, metricId: string): number => {
      if (!categoryId || !metricId) {
        console.error("Invalid category or metric ID", { categoryId, metricId })
        return 0
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Include active sessions
      const activeTime = activeSessions
        .filter((s) => s.categoryId === categoryId && s.metricId === metricId)
        .reduce((total, session) => {
          return total + session.duration
        }, 0)

      // Include completed sessions from today
      const completedTime = recentSessions
        .filter(
          (s) =>
            s.categoryId === categoryId &&
            s.metricId === metricId &&
            s.endTime &&
            s.endTime.getTime() >= today.getTime(),
        )
        .reduce((total, session) => {
          return total + session.duration
        }, 0)

      return activeTime + completedTime
    },
    [activeSessions, recentSessions],
  )

  const value = {
    activeSessions,
    recentSessions: recentSessions || [], // Ensure recentSessions is always an array
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    discardTracking,
    updateNotes,
    getSessionById,
    getTotalTrackedTimeToday,
    validateAllSessions,
  }

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (context === undefined) {
    throw new Error("useTracking must be used within a TrackingProvider")
  }
  return context
}
