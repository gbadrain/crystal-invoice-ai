'use client'

import { Fragment, useRef, useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Menu, Transition } from '@headlessui/react'
import {
  LogOut,
  Camera,
  Menu as MenuIcon,
  User,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const initials = email[0]?.toUpperCase() ?? 'U'

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) return
    fetch('/api/profile/avatar')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.avatarUrl) setAvatarUrl(data.avatarUrl)
      })
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
      setAvatarError(
        `Image too large (${(file.size / 1024).toFixed(
          0
        )} KB). Max allowed: 500 KB.`
      )
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
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          if (res.status === 413) {
            setAvatarError(
              `Image too large (${(file.size / 1024).toFixed(
                0
              )} KB). Max allowed: 500 KB — please use a smaller image.`
            )
          } else {
            setAvatarError(data.error ?? 'Upload failed. Please try again.')
          }
        }
      } finally {
        setUploading(false)
        e.target.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-800 bg-slate-900/10 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 backdrop-blur-lg">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-400 lg:hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div
          className="h-6 w-px bg-slate-800 lg:hidden"
          aria-hidden="true"
        />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="-m-1.5 flex items-center p-1.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <span className="sr-only">Open user menu</span>
                <div
                  className={cn(
                    'h-10 w-10 rounded-full border-2 border-crystal-500/40 flex items-center justify-center overflow-hidden select-none bg-crystal-600/30',
                    uploading && 'opacity-50'
                  )}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-crystal-300">
                      {initials}
                    </span>
                  )}
                </div>
                <span className="hidden lg:flex lg:items-center">
                  <span
                    className="ml-4 text-sm font-semibold leading-6 text-slate-300"
                    aria-hidden="true"
                  >
                    {session?.user?.name || email}
                  </span>
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-64 origin-top-right rounded-xl bg-slate-900/95 backdrop-blur-lg py-2 shadow-lg ring-1 ring-slate-800 focus:outline-none">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="truncate text-sm text-slate-400">{email}</p>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleAvatarClick}
                          className={cn(
                            'w-full text-left flex items-center px-4 py-2 text-sm transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]',
                            active ? 'bg-slate-800 text-white' : 'text-slate-300',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500'
                          )}
                        >
                          <Camera className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                          <span>Change Picture</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings/password"
                          className={cn(
                            'flex items-center px-4 py-2 text-sm transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]',
                            active ? 'bg-slate-800 text-white' : 'text-slate-300',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500'
                          )}
                        >
                          <User className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                          <span>Account Settings</span>
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/billing"
                          className={cn(
                            'flex items-center px-4 py-2 text-sm transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]',
                            active ? 'bg-slate-800 text-white' : 'text-slate-300',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500'
                          )}
                        >
                          <CreditCard className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                          <span>Billing</span>
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className={cn(
                            'w-full text-left flex items-center px-4 py-2 text-sm transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]',
                            active ? 'bg-slate-800 text-white' : 'text-slate-300',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500'
                          )}
                        >
                          <LogOut className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                          <span>Sign out</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error toast */}
      {avatarError && (
        <div className="fixed top-20 right-5 z-50 max-w-xs rounded-lg bg-red-900/50 border border-red-700 text-sm text-red-200 shadow-xl p-3 transition-all duration-300 ease-out">
          {avatarError}
        </div>
      )}
    </>
  )
}
