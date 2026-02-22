'use client'

export function InvoiceListSkeleton() {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-48 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="h-10 w-36 rounded-xl animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
      </div>

      {/* Filters skeleton */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900/70 ring-1 ring-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 flex-grow rounded-lg animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-10 w-40 rounded-lg animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl bg-slate-900/70 ring-1 ring-slate-800">
        <div className="min-w-full divide-y divide-slate-800">
          {/* Table header */}
          <div className="flex w-full">
            <div className="px-6 py-3 w-1/5">
              <div className="h-4 w-20 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="px-6 py-3 w-1/4">
              <div className="h-4 w-16 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="px-6 py-3 w-1/5">
              <div className="h-4 w-24 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="px-6 py-3 w-1/5">
              <div className="h-4 w-12 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="px-6 py-3 w-1/5">
              <div className="h-4 w-16 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="px-6 py-3 w-[10%]">
              <div className="h-4 w-10 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
          {/* Table body */}
          <div className="divide-y divide-slate-800">
            {[...Array(5)].map((_, i) => (
              <div className="flex w-full items-center" key={i}>
                <div className="px-6 py-4 w-1/5">
                  <div className="h-5 w-24 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="px-6 py-4 w-1/4">
                  <div className="h-5 w-32 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="px-6 py-4 w-1/5">
                  <div className="h-5 w-28 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="px-6 py-4 w-1/5">
                  <div className="h-5 w-20 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="px-6 py-4 w-1/5">
                  <div className="h-6 w-20 rounded-full animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="px-6 py-4 w-[10%] flex justify-end gap-4">
                  <div className="h-6 w-6 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-6 w-6 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
