export default function PersonLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-6 w-24 bg-zinc-800 rounded animate-pulse mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left column skeleton */}
        <div className="md:col-span-1">
          <div className="rounded-2xl overflow-hidden mb-6 bg-zinc-800 aspect-[2/3] animate-pulse"></div>

          <div className="bg-zinc-800/50 rounded-2xl p-6 space-y-4">
            <div className="h-7 w-32 bg-zinc-700 rounded animate-pulse mb-4"></div>

            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse"></div>
                <div className="h-5 w-32 bg-zinc-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column skeleton */}
        <div className="md:col-span-3">
          <div className="h-10 w-48 bg-zinc-800 rounded animate-pulse mb-4"></div>

          <div className="mb-8">
            <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-zinc-800 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          <div>
            <div className="h-8 w-36 bg-zinc-800 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg overflow-hidden">
                    <div className="aspect-[2/3] bg-zinc-700 animate-pulse"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-3 w-12 bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
