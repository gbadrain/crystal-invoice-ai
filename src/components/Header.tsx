'use client'

import { Search } from 'lucide-react'

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 flex items-center justify-between px-8 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-crystal-600/30 border border-crystal-500/30 flex items-center justify-center text-xs font-semibold text-crystal-300">
        U
      </div>
    </header>
  )
}
