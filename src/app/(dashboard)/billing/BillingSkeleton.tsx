'use client'

export function BillingSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-48 rounded-lg bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer mb-2" />
        <div className="h-4 w-64 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
      </div>

      <div className="rounded-xl bg-slate-900/70 ring-1 ring-slate-800 shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="h-6 w-40 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-4 w-3/4 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
          <div className="h-10 w-48 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/70 ring-1 ring-slate-800 shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="h-6 w-56 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-4 w-5/6 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
          <div className="h-10 w-40 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
