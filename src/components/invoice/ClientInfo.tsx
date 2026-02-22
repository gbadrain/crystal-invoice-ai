'use client'

import type { ClientInfo as ClientInfoType } from '@/utils/invoice-types'

interface ClientInfoProps {
  client: ClientInfoType
  onChange: (client: ClientInfoType) => void
}

const inputClass = "block w-full rounded-md border-0 bg-slate-800/60 py-2.5 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500"
const labelClass = "block text-sm font-medium leading-6 text-slate-300"

export function ClientInfo({ client, onChange }: ClientInfoProps) {
  function update(field: keyof ClientInfoType, value: string) {
    onChange({ ...client, [field]: value })
  }

  return (
    <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white">Client Information</h3>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div className="sm:col-span-2">
            <label htmlFor="client-name" className={labelClass}>Client Name</label>
            <div className="mt-2">
              <input
                id="client-name"
                type="text"
                value={client.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="John Smith"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="client-email" className={labelClass}>Email</label>
            <div className="mt-2">
              <input
                id="client-email"
                type="email"
                value={client.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="john@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="client-phone" className={labelClass}>Phone</label>
            <div className="mt-2">
              <input
                id="client-phone"
                type="tel"
                value={client.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="client-address" className={labelClass}>Address</label>
            <div className="mt-2">
              <input
                id="client-address"
                type="text"
                value={client.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="123 Main St, Anytown, USA"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
