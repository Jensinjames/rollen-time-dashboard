"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { useTracking } from "@/context/tracking-context"
import { useToast } from "@/components/ui/use-toast"

export function ValidateTrackingData() {
  const { validateAllSessions } = useTracking()
  const { toast } = useToast()
  const [isValidating, setIsValidating] = useState(false)
  const [lastValidationResult, setLastValidationResult] = useState<{ fixed: number; removed: number } | null>(null)

  const handleValidate = () => {
    setIsValidating(true)

    // Small timeout to show loading state
    setTimeout(() => {
      try {
        const result = validateAllSessions()
        setLastValidationResult(result)

        if (result.fixed === 0 && result.removed === 0) {
          toast({
            title: "All data is valid",
            description: "No issues found with your tracking data.",
            variant: "default",
          })
        } else {
          toast({
            title: "Data validation complete",
            description: `Fixed ${result.fixed} and removed ${result.removed} invalid tracking sessions.`,
            variant: result.removed > 0 ? "destructive" : "default",
          })
        }
      } catch (error) {
        console.error("Error validating sessions:", error)
        toast({
          title: "Validation error",
          description: "There was a problem validating your tracking data.",
          variant: "destructive",
        })
      } finally {
        setIsValidating(false)
      }
    }, 500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Data Validation
        </CardTitle>
        <CardDescription>Validate your tracking data to fix or remove any corrupted entries</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This will check all your tracking sessions for data integrity issues and fix them when possible. Any sessions
          that cannot be repaired will be removed to prevent errors.
        </p>

        {lastValidationResult && (
          <div className="mt-4 rounded-md border p-3">
            <div className="flex items-center gap-2">
              {lastValidationResult.fixed === 0 && lastValidationResult.removed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <h4 className="font-medium">Last validation result:</h4>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Fixed sessions: {lastValidationResult.fixed}</li>
              <li>Removed sessions: {lastValidationResult.removed}</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleValidate} disabled={isValidating}>
          {isValidating ? "Validating..." : "Validate Tracking Data"}
        </Button>
      </CardFooter>
    </Card>
  )
}
