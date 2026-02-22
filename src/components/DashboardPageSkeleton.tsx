'use client'



function StatCardSkeleton() {
  return (
    <div className="glass-panel p-6 border border-slate-800 rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-3 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
        <div className="h-3 w-20 rounded bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="h-6 w-24 rounded animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
      <div className="h-3 w-16 rounded mt-1 animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 rounded mb-1 animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-64 rounded animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="h-10 w-36 rounded-xl animate-pulse bg-gradient-to-r from-crystal-600/50 via-crystal-500/50 to-crystal-600/50 bg-[length:200%_100%] animate-shimmer" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Recent invoices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-32 rounded animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-20 rounded animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="glass-panel divide-y divide-white/[0.06] rounded-xl shadow-lg">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
                <div>
                  <div className="h-4 w-24 rounded mb-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-3 w-32 rounded bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-20 rounded mb-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
                <div className="h-3 w-16 rounded bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
