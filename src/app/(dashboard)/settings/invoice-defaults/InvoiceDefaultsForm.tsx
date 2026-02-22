'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'CAD', label: 'CAD — Canadian Dollar (C$)' },
  { code: 'AUD', label: 'AUD — Australian Dollar (A$)' },
  { code: 'JPY', label: 'JPY — Japanese Yen (¥)' },
  { code: 'CHF', label: 'CHF — Swiss Franc (Fr)' },
  { code: 'INR', label: 'INR — Indian Rupee (₹)' },
]

const DUE_PRESETS = [7, 14, 30, 45, 60, 90]

export function InvoiceDefaultsForm() {
  const [currency, setCurrency] = useState('USD')
  const [dueDays, setDueDays] = useState(30)
  const [footer, setFooter] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<'success' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/settings/invoice-defaults')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        setCurrency(data.invoiceCurrency ?? 'USD')
        setDueDays(data.invoiceDueDays ?? 30)
        setFooter(data.invoiceFooter ?? '')
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBanner(null)
    setSaving(true)
    try {
      const res = await fetch('/api/settings/invoice-defaults', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceCurrency: currency, invoiceDueDays: dueDays, invoiceFooter: footer }),
      })
      if (res.ok) {
        setBanner('success')
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setErrorMsg(data.error ?? 'Failed to save.')
        setBanner('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setBanner('error')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) {
    return (
      <div className="rounded-xl bg-slate-900/70 ring-1 ring-slate-800 p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {banner === 'success' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-300">Invoice defaults saved. New invoices will use these settings.</p>
        </div>
      )}
      {banner === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-xl shadow-lg bg-slate-900/70 ring-1 ring-slate-800">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-300 mb-2">
              Default currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 px-4 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Due days */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default payment terms (days)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {DUE_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDueDays(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dueDays === d
                      ? 'bg-crystal-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={dueDays}
              onChange={(e) => setDueDays(Math.max(1, Math.min(365, Number(e.target.value))))}
              className="block w-32 rounded-md border-0 bg-slate-800/60 py-2.5 px-4 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              New invoices will default to {dueDays} day{dueDays !== 1 ? 's' : ''} from issue date.
            </p>
          </div>

          {/* Footer */}
          <div>
            <label htmlFor="footer" className="block text-sm font-medium text-slate-300 mb-2">
              Default invoice footer / notes
            </label>
            <textarea
              id="footer"
              rows={3}
              maxLength={500}
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="e.g. Thank you for your business. Payment due within the stated terms."
              className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm resize-none"
            />
            <p className="mt-1.5 text-xs text-slate-500">{footer.length}/500 — pre-fills the Notes field on new invoices.</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold py-2.5 px-5 bg-crystal-600 text-white hover:bg-crystal-500 disabled:opacity-50 shadow-lg shadow-crystal-600/20 transition-all duration-200"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save defaults
          </button>
        </div>
      </form>
    </div>
  )
}
