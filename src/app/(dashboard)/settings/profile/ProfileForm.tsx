'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'

const ACTION_LABELS: Record<string, string> = {
  'profile.update': 'Profile updated',
  'password.change': 'Password changed',
  'invoice_defaults.update': 'Invoice defaults updated',
  'account.delete': 'Account deletion requested',
}

interface AuditEntry {
  id: string
  action: string
  meta: Record<string, unknown> | null
  createdAt: string
}

export function ProfileForm({ email }: { email: string }) {
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<'success' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load current profile on mount
  useEffect(() => {
    fetch('/api/settings/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        setName(data.name ?? '')
        setCompanyName(data.companyName ?? '')
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl)
      })
      .catch(() => {})

    fetch('/api/settings/audit-log')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.logs) setAuditLogs(data.logs) })
      .catch(() => {})
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBanner(null)
    setSaving(true)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), companyName: companyName.trim() }),
      })
      if (res.ok) {
        setBanner('success')
        // Refresh audit log
        fetch('/api/settings/audit-log')
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => { if (data?.logs) setAuditLogs(data.logs) })
          .catch(() => {})
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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) {
      setErrorMsg(`Image too large (${(file.size / 1024).toFixed(0)} KB). Max 500 KB.`)
      setBanner('error')
      e.target.value = ''
      return
    }
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
          setBanner('success')
        } else {
          const data = await res.json().catch(() => ({})) as { error?: string }
          setErrorMsg(data.error ?? 'Avatar upload failed.')
          setBanner('error')
        }
      } finally {
        setUploading(false)
        e.target.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const initials = (name || email)[0]?.toUpperCase() ?? 'U'

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner === 'success' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-300">Saved successfully.</p>
        </div>
      )}
      {banner === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Avatar */}
      <div className="rounded-xl shadow-lg bg-slate-900/70 ring-1 ring-slate-800 p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-white mb-4">Profile Picture</h2>
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'h-20 w-20 rounded-full border-2 border-crystal-500/40 flex items-center justify-center overflow-hidden select-none bg-crystal-600/30 shrink-0',
              uploading && 'opacity-50'
            )}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-crystal-300">{initials}</span>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            <p className="mt-1.5 text-xs text-slate-500">PNG, JPG or WebP, max 500 KB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Profile fields */}
      <form onSubmit={handleSave} className="rounded-xl shadow-lg bg-slate-900/70 ring-1 ring-slate-800">
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className="block w-full rounded-md bg-slate-800/30 py-2.5 px-4 text-slate-400 ring-1 ring-inset ring-slate-700/50 cursor-not-allowed sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-slate-500">Email cannot be changed.</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Display name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Your name"
              className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-slate-500">Takes effect on next sign-in.</p>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
              Company name
            </label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={100}
              placeholder="Acme Corp"
              className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold py-2.5 px-5 bg-crystal-600 text-white hover:bg-crystal-500 disabled:opacity-50 shadow-lg shadow-crystal-600/20 transition-all duration-200"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>

      {/* Recent activity */}
      {auditLogs.length > 0 && (
        <div className="rounded-xl shadow-lg bg-slate-900/70 ring-1 ring-slate-800 p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {auditLogs.map((log) => (
              <li key={log.id} className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-300">{ACTION_LABELS[log.action] ?? log.action}</span>
                <span className="ml-auto text-xs text-slate-500">
                  {new Date(log.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
