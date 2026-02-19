'use client'

type StatusBadgeProps = {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    paid:    'bg-green-200 text-green-900',
    pending: 'bg-yellow-200 text-yellow-900',
    draft:   'bg-gray-300 text-gray-900',
    overdue: 'bg-red-200 text-red-900',
    trashed: 'bg-white/10 text-white/50',
  }

  const color = colorMap[status] ?? 'bg-white/10 text-white/50'
  const padding = size === 'sm' ? 'px-2' : 'px-3 py-1'
  const text    = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <span
      className={`${padding} inline-flex ${text} leading-5 font-semibold rounded-full capitalize ${color}`}
    >
      {status}
    </span>
  )
}
