'use client'

import { useRef, useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, Camera } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const initials = email[0]?.toUpperCase() ?? 'U'

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load avatar on mount
  useEffect(() => {
    if (!session) return
    fetch('/api/profile/avatar')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.avatarUrl) setAvatarUrl(data.avatarUrl) })
      .catch(() => {})
  }, [session])

  function handleAvatarClick() {
    setAvatarError(null)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500_000) {
      setAvatarError(`Image too large (${(file.size / 1024).toFixed(0)} KB). Max allowed: 500 KB.`)
      e.target.value = ''
      return
    }

    setAvatarError(null)

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      try {
        const res = await fetch('/api/profile/avatar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: base64 }),
        })
        if (res.ok) {
          setAvatarUrl(base64)
        } else {
          const data = await res.json().catch(() => ({}))
          if (res.status === 413) {
            setAvatarError(`Image too large (${(file.size / 1024).toFixed(0)} KB). Max allowed: 500 KB — please use a smaller image.`)
          } else {
            setAvatarError(data.error ?? 'Upload failed. Please try again.')
          }
        }
      } finally {
        setUploading(false)
        // Reset so same file can be re-selected
        e.target.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

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

        {/* Avatar — click to upload */}
        <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Change profile picture">
          <div className={`w-11 h-11 rounded-full border-2 border-crystal-500/40 flex items-center justify-center overflow-hidden select-none transition-opacity ${uploading ? 'opacity-50' : ''}`}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-crystal-600/30 flex items-center justify-center text-sm font-bold text-crystal-300">
                {initials}
              </div>
            )}
          </div>
          {/* Camera overlay on hover */}
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Size error tooltip */}
        {avatarError && (
          <div className="absolute top-16 right-4 z-50 max-w-xs px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300 shadow-lg">
            {avatarError}
          </div>
        )}

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
