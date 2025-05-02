"use client"

import { useState, useEffect, useRef } from "react"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWellness } from "@/context/wellness-context"
import { getDailyTrendData, getWeeklyTrendData } from "@/utils/chart-utils"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function WellnessTrends() {
  const { filteredEntries } = useWellness()
  const [activeTab, setActiveTab] = useState("daily")
  const [chartData, setChartData] = useState<any[]>([])

  // Use refs to track animation state instead of state to avoid re-renders
  const animationRef = useRef<{
    timer: NodeJS.Timeout | null
    isAnimating: boolean
  }>({
    timer: null,
    isAnimating: false,
  })

  // Memoize data to prevent recalculation on every render
  const weeklyData = getWeeklyTrendData(filteredEntries)
  const dailyData = getDailyTrendData(filteredEntries)
  const categoriesData = dailyData // Using daily data for categories tab

  // Get the appropriate data based on active tab
  const getDataForActiveTab = () => {
    switch (activeTab) {
      case "daily":
        return dailyData
      case "weekly":
        return weeklyData
      case "categories":
        return categoriesData
      default:
        return []
    }
  }

  // Handle tab change
  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current.timer) {
      clearInterval(animationRef.current.timer)
      animationRef.current.timer = null
    }

    const data = getDataForActiveTab()

    // If no data or already animating, just set the data directly
    if (data.length === 0 || animationRef.current.isAnimating) {
      setChartData(data)
      return
    }

    // Start animation
    animationRef.current.isAnimating = true
    setChartData([]) // Start with empty chart

    // Use a fixed number of steps rather than data.length to control animation speed
    const totalSteps = 10
    const animationDuration = 1000 // ms
    const interval = animationDuration / totalSteps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const pointsToShow = Math.ceil((currentStep / totalSteps) * data.length)
      setChartData(data.slice(0, pointsToShow))

      if (currentStep >= totalSteps) {
        clearInterval(timer)
        animationRef.current.isAnimating = false
        animationRef.current.timer = null
      }
    }, interval)

    animationRef.current.timer = timer

    // Cleanup
    return () => {
      if (animationRef.current.timer) {
        clearInterval(animationRef.current.timer)
        animationRef.current.timer = null
      }
    }
  }, [activeTab]) // Only depend on activeTab, not the data itself

  return (
    <div>
      <CardTitle className="text-xl font-bold mb-2">Wellness Trends</CardTitle>
      <CardDescription className="mb-4">Track your wellness metrics over time</CardDescription>
      <div className="bg-white rounded-xl shadow-md p-4">
        <Tabs
          defaultValue="daily"
          value={activeTab}
          onValueChange={setActiveTab}
          id="wellness-trend-tabs"
          className="bg-white rounded-xl"
        >
          <TabsList className="mb-4 bg-gray-100">
            <TabsTrigger value="daily" id="wellness-trend-daily">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" id="wellness-trend-weekly">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="categories" id="wellness-trend-categories">
              Categories
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke="#8884d8"
                    name="Overall"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false} // Disable recharts animation since we're doing our own
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="overall"
                    fill="#8884d8"
                    name="Overall"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false} // Disable recharts animation
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="categories" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="faith"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                    name="Faith"
                    isAnimationActive={false} // Disable recharts animation
                  />
                  <Area
                    type="monotone"
                    dataKey="life"
                    stackId="1"
                    stroke="#eab308"
                    fill="#eab308"
                    fillOpacity={0.6}
                    name="Life"
                    isAnimationActive={false} // Disable recharts animation
                  />
                  <Area
                    type="monotone"
                    dataKey="work"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Work"
                    isAnimationActive={false} // Disable recharts animation
                  />
                  <Area
                    type="monotone"
                    dataKey="health"
                    stackId="1"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.6}
                    name="Health"
                    isAnimationActive={false} // Disable recharts animation
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
