'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const initials = email[0]?.toUpperCase() ?? 'U'

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 flex items-center justify-between px-8 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      {/* Left slot — reserved for breadcrumbs or page title */}
      <div />

      {/* Right slot — user identity + logout */}
      <div className="flex items-center gap-3">
        {email && (
          <span className="hidden md:block text-sm text-white/40 truncate max-w-[200px]">
            {email}
          </span>
        )}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-crystal-600/30 border border-crystal-500/30 flex items-center justify-center text-xs font-semibold text-crystal-300 select-none">
          {initials}
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          title="Sign out"
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
