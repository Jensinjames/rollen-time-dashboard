"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, RefreshCw, Lock, Activity, CheckCircle2 } from "lucide-react"
import { VirtualizedList } from "@/components/virtualized-list"
import { memo, useMemo } from "react"

interface ActivityItem {
  date: string
  type: string
  details: string
}

interface ActivityTabProps {
  activityData: ActivityItem[]
}

export const ActivityTab = memo(function ActivityTab({ activityData }: ActivityTabProps) {
  // Memoize the activity item renderer to prevent unnecessary re-renders
  const renderActivityItem = useMemo(() => {
    return (activity: ActivityItem, index: number) => (
      <div key={index} className="flex items-start space-x-4 rounded-lg border p-4 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {activity.type === "login" && <User className="h-5 w-5 text-primary" />}
          {activity.type === "update" && <RefreshCw className="h-5 w-5 text-primary" />}
          {activity.type === "password" && <Lock className="h-5 w-5 text-primary" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {activity.type === "login" && "Login"}
              {activity.type === "update" && "Profile Update"}
              {activity.type === "password" && "Password Change"}
            </p>
            <Badge variant="outline">{activity.date}</Badge>
          </div>
          <p className="text-sm text-gray-500">{activity.details}</p>
        </div>
      </div>
    )
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Recent activity on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <VirtualizedList
            items={activityData}
            height={400}
            itemHeight={100}
            renderItem={renderActivityItem}
            className="pr-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Manage your active sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-gray-500">Chrome on Windows • IP: 192.168.1.1</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Safari on iPhone</p>
                    <p className="text-sm text-gray-500">Last active: 2 days ago • IP: 192.168.1.2</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Revoke
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Firefox on MacOS</p>
                    <p className="text-sm text-gray-500">Last active: 5 days ago • IP: 192.168.1.3</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Revoke
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="destructive">Revoke All Other Sessions</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
