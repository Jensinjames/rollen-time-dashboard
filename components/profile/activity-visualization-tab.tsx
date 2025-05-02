"use client"

import { memo } from "react"
import { ActivityVisualization } from "./activity-visualization"
import { type ActivityItem, generateMockActivityData } from "@/utils/profile-activity-utils"

interface ActivityVisualizationTabProps {
  activityData?: ActivityItem[]
}

export const ActivityVisualizationTab = memo(function ActivityVisualizationTab({
  activityData = generateMockActivityData(90),
}: ActivityVisualizationTabProps) {
  return <ActivityVisualization activityData={activityData} />
})
