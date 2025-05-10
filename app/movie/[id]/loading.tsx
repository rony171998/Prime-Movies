import { Skeleton } from "@/components/ui/skeleton"

export default function MovieLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Movie Poster Skeleton */}
        <div className="flex justify-center md:justify-start">
          <Skeleton className="h-[450px] w-[300px] rounded-lg" />
        </div>

        {/* Movie Info Skeleton */}
        <div className="md:col-span-2">
          <Skeleton className="mb-4 h-10 w-2/3" />
          <Skeleton className="mb-4 h-6 w-1/2" />

          <div className="mb-6">
            <Skeleton className="mb-2 h-6 w-1/4" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Skeleton className="mb-2 h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section Skeleton */}
      <div className="my-6">
        <Skeleton className="mb-4 h-8 w-1/6" />
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col">
              <Skeleton className="h-48 w-32 rounded-lg" />
              <Skeleton className="mt-2 h-4 w-24" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
