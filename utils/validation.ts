import type { TrackingSession } from "@/context/tracking-context"
import type { CategoryId } from "@/types/wellness"

/**
 * Validates a tracking session object
 * @param session The session to validate
 * @returns An object with validation result and error message
 */
export function validateTrackingSession(session: any): {
  isValid: boolean
  errors: string[]
  fixedSession?: TrackingSession
} {
  const errors: string[] = []
  const fixedSession: Partial<TrackingSession> = { ...session }
  let needsFix = false

  // Check if session is an object
  if (!session || typeof session !== "object") {
    return { isValid: false, errors: ["Session is not an object"] }
  }

  // Validate required fields
  if (!session.id) {
    errors.push("Session ID is missing")
    fixedSession.id = crypto.randomUUID()
    needsFix = true
  }

  if (!session.categoryId) {
    errors.push("Category ID is missing")
    // Can't fix this, but we'll keep validating other fields
  }

  if (!session.metricId) {
    errors.push("Metric ID is missing")
    // Can't fix this, but we'll keep validating other fields
  }

  // Validate startTime
  if (!session.startTime) {
    errors.push("Start time is missing")
    fixedSession.startTime = new Date()
    needsFix = true
  } else if (!(session.startTime instanceof Date) && typeof session.startTime === "string") {
    try {
      fixedSession.startTime = new Date(session.startTime)
      needsFix = true
    } catch (e) {
      errors.push("Start time is invalid")
      fixedSession.startTime = new Date()
      needsFix = true
    }
  } else if (!(session.startTime instanceof Date)) {
    errors.push("Start time is not a Date object")
    fixedSession.startTime = new Date()
    needsFix = true
  }

  // Validate endTime if present
  if (session.endTime !== undefined) {
    if (!(session.endTime instanceof Date) && typeof session.endTime === "string") {
      try {
        fixedSession.endTime = new Date(session.endTime)
        needsFix = true
      } catch (e) {
        errors.push("End time is invalid")
        delete fixedSession.endTime
        needsFix = true
      }
    } else if (session.endTime && !(session.endTime instanceof Date)) {
      errors.push("End time is not a Date object")
      delete fixedSession.endTime
      needsFix = true
    }
  }

  // Validate duration
  if (typeof session.duration !== "number") {
    errors.push("Duration is not a number")
    // Calculate duration if we have start and end times
    if (fixedSession.startTime && fixedSession.endTime) {
      fixedSession.duration = fixedSession.endTime.getTime() - fixedSession.startTime.getTime()
    } else {
      fixedSession.duration = 0
    }
    needsFix = true
  } else if (session.duration < 0) {
    errors.push("Duration is negative")
    fixedSession.duration = 0
    needsFix = true
  }

  // Validate isActive
  if (typeof session.isActive !== "boolean") {
    errors.push("isActive is not a boolean")
    fixedSession.isActive = false
    needsFix = true
  }

  // Validate notes if present
  if (session.notes !== undefined && typeof session.notes !== "string") {
    errors.push("Notes is not a string")
    fixedSession.notes = String(session.notes)
    needsFix = true
  }

  // Check for logical consistency
  if (
    fixedSession.startTime &&
    fixedSession.endTime &&
    fixedSession.startTime.getTime() > fixedSession.endTime.getTime()
  ) {
    errors.push("Start time is after end time")
    fixedSession.endTime = new Date(fixedSession.startTime.getTime() + (fixedSession.duration || 0))
    needsFix = true
  }

  // If session is active, it shouldn't have an end time
  if (fixedSession.isActive && fixedSession.endTime) {
    errors.push("Active session has an end time")
    delete fixedSession.endTime
    needsFix = true
  }

  // If we have critical errors that can't be fixed, return invalid
  if (!fixedSession.categoryId || !fixedSession.metricId) {
    return { isValid: false, errors }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fixedSession: needsFix ? (fixedSession as TrackingSession) : undefined,
  }
}

/**
 * Validates an array of tracking sessions
 * @param sessions The sessions to validate
 * @returns An array of valid sessions with fixes applied where possible
 */
export function validateTrackingSessions(sessions: any[]): {
  validSessions: TrackingSession[]
  invalidCount: number
  fixedCount: number
} {
  if (!Array.isArray(sessions)) {
    console.error("Sessions is not an array")
    return { validSessions: [], invalidCount: 1, fixedCount: 0 }
  }

  let invalidCount = 0
  let fixedCount = 0
  const validSessions: TrackingSession[] = []

  for (const session of sessions) {
    const { isValid, errors, fixedSession } = validateTrackingSession(session)

    if (isValid) {
      validSessions.push(session as TrackingSession)
    } else if (fixedSession) {
      console.warn(`Fixed session with ID ${session.id || "unknown"}:`, errors)
      validSessions.push(fixedSession)
      fixedCount++
    } else {
      console.error(`Invalid session:`, errors, session)
      invalidCount++
    }
  }

  return { validSessions, invalidCount, fixedCount }
}

/**
 * Validates a category ID
 * @param categoryId The category ID to validate
 * @param availableCategories Array of valid category IDs
 * @returns Whether the category ID is valid
 */
export function validateCategoryId(categoryId: any, availableCategories: CategoryId[]): boolean {
  if (typeof categoryId !== "string") return false
  return availableCategories.includes(categoryId as CategoryId)
}

/**
 * Validates a metric ID
 * @param metricId The metric ID to validate
 * @param categoryMetrics Object mapping category IDs to arrays of valid metric IDs
 * @param categoryId The category ID the metric belongs to
 * @returns Whether the metric ID is valid
 */
export function validateMetricId(
  metricId: any,
  categoryMetrics: Record<CategoryId, string[]>,
  categoryId: CategoryId,
): boolean {
  if (typeof metricId !== "string") return false
  if (!categoryMetrics[categoryId]) return false
  return categoryMetrics[categoryId].includes(metricId)
}
