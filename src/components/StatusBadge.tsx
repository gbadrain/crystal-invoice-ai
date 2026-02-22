'use client'

import { cn } from '@/utils/cn'

type Status = 'paid' | 'pending' | 'draft' | 'overdue' | 'trashed' | string

type StatusBadgeProps = {
  status: Status
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center font-semibold rounded-md'

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  }

  const colorClasses: Record<Status, string> = {
    paid: 'bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20',
    pending:
      'bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20',
    overdue: 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20',
    draft: 'bg-slate-400/10 text-slate-300 ring-1 ring-inset ring-slate-400/20',
    trashed:
      'bg-slate-400/10 text-slate-300 ring-1 ring-inset ring-slate-400/20',
  }

  const statusKey = status.toLowerCase() as Status
  const color =
    colorClasses[statusKey] ??
    'bg-slate-400/10 text-slate-300 ring-1 ring-inset ring-slate-400/20'

  return (
    <span className={cn(baseClasses, sizeClasses[size], color)}>
      {status}
    </span>
  )
}
