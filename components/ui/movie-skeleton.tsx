interface MovieSkeletonProps {
  count?: number
  className?: string
}

export function MovieSkeleton({
  count = 8,
  className = "",
}: MovieSkeletonProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg border bg-background animate-pulse"
        >
          <div className="aspect-[2/3] bg-muted"></div>
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 bg-muted rounded"></div>
            <div className="flex justify-between">
              <div className="h-4 w-1/4 bg-muted rounded"></div>
              <div className="h-4 w-1/4 bg-muted rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-1/3 bg-muted rounded-full"></div>
              <div className="h-6 w-1/3 bg-muted rounded-full"></div>
            </div>
            <div className="h-8 w-full bg-muted rounded mt-3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
