import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid gap-6">
            {/* Daily Overview skeleton */}
            <section>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            </section>

            {/* Category Performance skeleton */}
            <section>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 rounded-xl" />
            </section>

            {/* Active Tracking skeleton */}
            <Skeleton className="h-48 rounded-xl" />

            {/* More sections */}
            {[1, 2, 3].map((i) => (
              <section key={i}>
                <Skeleton className="h-6 w-36 mb-4" />
                <Skeleton className="h-64 rounded-xl" />
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
