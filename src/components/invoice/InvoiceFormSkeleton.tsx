'use client'

export function InvoiceFormSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-64 rounded-md animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 rounded-xl animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-10 w-36 rounded-xl animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>

      <div className="space-y-8">
        {/* AI Generator Skeleton */}
        <div className="h-24 w-full rounded-xl ring-1 ring-slate-800 animate-pulse shadow-lg bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 bg-[length:200%_100%] animate-shimmer" />

        {/* Logo + Client/Metadata Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-48 w-full rounded-xl ring-1 ring-slate-800 animate-pulse shadow-lg bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-48 w-full rounded-xl ring-1 ring-slate-800 animate-pulse shadow-lg bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 bg-[length:200%_100%] animate-shimmer" />
        </div>

        {/* Line Items Skeleton */}
        {/* Line Items Skeleton */}
        <div className="h-64 w-full rounded-xl ring-1 ring-slate-800 animate-pulse shadow-lg bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 bg-[length:200%_100%] animate-shimmer" />

        {/* Notes + Summary Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-48 w-full rounded-xl ring-1 ring-slate-800 animate-pulse shadow-lg bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-48 w-full rounded-xl ring-1 ring-slate-800 animate-pulse shadow-lg bg-gradient-to-r from-slate-900/70 via-slate-800/70 to-slate-900/70 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
