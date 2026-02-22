'use client'

import { Fragment, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Trash,
  Settings,
  CreditCard,
  X,
} from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { cn } from '@/utils/cn'
import { UsageBanner } from '@/components/UsageBanner'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'New Invoice', href: '/invoices/new', icon: FilePlus },
  { label: 'Trash', href: '/trash', icon: Trash },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Settings', href: '/settings/profile', icon: Settings },
]

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const [trashCount, setTrashCount] = useState(0)

  const fetchTrashCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices?status=trashed`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setTrashCount(data.total ?? 0)
      }
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    fetchTrashCount()
    const interval = setInterval(fetchTrashCount, 5000)
    return () => clearInterval(interval)
  }, [fetchTrashCount])

  useEffect(() => {
    const handler = () => fetchTrashCount()
    window.addEventListener('trash-updated', handler)
    return () => window.removeEventListener('trash-updated', handler)
  }, [fetchTrashCount])

  const navigationContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
      <div className="h-16 shrink-0 items-center flex justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Crystal Invoice AI"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-crystal-400">Crystal</span>
              <span className="text-white/80">Invoice</span>
            </h1>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/settings/password'
                    ? (pathname ?? '').startsWith('/settings')
                    : item.href === '/billing'
                    ? (pathname ?? '').startsWith('/billing')
                    : pathname === item.href

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800/40 hover:pl-4',
                        isActive
                          ? 'bg-crystal-600/20 text-white'
                          : 'text-slate-400 hover:text-white',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500'
                      )}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.label}
                      {item.href === '/trash' && trashCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {trashCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          <li className="mt-auto">
            <UsageBanner />
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {navigationContent}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900/10 px-6 pb-4 ring-1 ring-white/10 backdrop-blur-lg">
          <Link href="/" className="flex h-16 shrink-0 items-center gap-3">
            <Image
              src="/icon.png"
              alt="Crystal Invoice AI"
              width={32}
              height={32}
              className="rounded-lg"
              priority
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                <span className="text-crystal-400">Crystal</span>
                <span className="text-white/80">Invoice</span>
              </h1>
            </div>
          </Link>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navItems.map((item) => {
                    const isActive =
                      item.href === '/settings/password'
                        ? (pathname ?? '').startsWith('/settings')
                        : item.href === '/billing'
                        ? (pathname ?? '').startsWith('/billing')
                        : pathname === item.href

                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800/40 hover:pl-4',
                            isActive
                              ? 'bg-crystal-600/20 text-white'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.label}
                          {item.href === '/trash' && trashCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {trashCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto -mx-2">
                <UsageBanner />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
