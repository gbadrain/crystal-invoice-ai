'use client'

export function ViewInvoiceSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 rounded-lg animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 rounded-xl animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-10 w-32 rounded-xl animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-10 w-24 rounded-xl animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="rounded-xl shadow-lg bg-slate-900/70 ring-1 ring-slate-800 p-8 md:p-12">
        {/* Invoice header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="h-10 w-64 rounded-lg animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer mb-3" />
            <div className="h-4 w-48 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          </div>
          <div className="h-8 w-24 rounded-full animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>

        {/* Client info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="rounded-lg bg-slate-800/50 p-6 border border-slate-700 shadow-md">
            <div className="space-y-3">
              <div className="h-5 w-32 rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-48 rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-56 rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-40 rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-6 border border-slate-700 shadow-md">
            <div className="space-y-3">
              <div className="h-5 w-40 rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-full rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-full rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-full rounded-md animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Line items table skeleton */}
        <div className="mb-10">
          <div className="min-w-full divide-y divide-slate-800">
            <div className="flex w-full text-left text-sm font-semibold text-slate-400 uppercase py-3">
              <div className="w-1/2 h-4 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
              <div className="w-1/6 text-right h-4 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
              <div className="w-1/6 text-right h-4 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
              <div className="w-1/6 text-right h-4 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="divide-y divide-slate-800">
              {[...Array(3)].map((_, i) => (
                <div className="flex w-full items-center py-4" key={i}>
                  <div className="w-1/2 h-5 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                  <div className="w-1/6 text-right h-5 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer ml-4" />
                  <div className="w-1/6 text-right h-5 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer ml-4" />
                  <div className="w-1/6 text-right h-5 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer ml-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary skeleton */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="h-5 w-full rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-5 w-full rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-5 w-full rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-8 w-full rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
