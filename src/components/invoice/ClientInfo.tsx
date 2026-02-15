'use client'

import type { ClientInfo as ClientInfoType } from '@/utils/invoice-types'

interface ClientInfoProps {
  client: ClientInfoType
  onChange: (client: ClientInfoType) => void
}

export function ClientInfo({ client, onChange }: ClientInfoProps) {
  function update(field: keyof ClientInfoType, value: string) {
    onChange({ ...client, [field]: value })
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Client Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/50 mb-1.5">Client Name</label>
          <input
            type="text"
            value={client.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="John Doe"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1.5">Email</label>
          <input
            type="email"
            value={client.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="john@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1.5">Phone</label>
          <input
            type="tel"
            value={client.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1.5">Address</label>
          <input
            type="text"
            value={client.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="123 Main St, City, State"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
