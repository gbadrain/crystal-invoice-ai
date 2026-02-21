'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'

interface LogoUploaderProps {
  logo: string | undefined
  onChange: (logo: string | undefined) => void
}

const MAX_SIZE = 500 * 1024 // 500 KB — keeps DB + email payloads lean

function formatKB(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${Math.round(bytes / 1024)} KB`
}

export function LogoUploader({ logo, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      setSizeError(null)
      if (!file.type.startsWith('image/')) return
      if (file.size > MAX_SIZE) {
        setSizeError(`File is ${formatKB(file.size)} — max allowed is 500 KB. Resize or compress your logo first.`)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result)
        }
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="glass-panel p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-white/90">Company Logo</h2>
        <span className="text-xs text-white/30">PNG · JPG · SVG &nbsp;·&nbsp; Max 500 KB &nbsp;·&nbsp; Best at 400 × 160 px</span>
      </div>

      {sizeError && (
        <div className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{sizeError}</p>
        </div>
      )}

      {logo ? (
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Logo preview"
            className="h-16 max-w-[200px] object-contain rounded-lg border border-white/10"
          />
          <button
            type="button"
            onClick={() => { onChange(undefined); setSizeError(null) }}
            className="p-2 text-white/40 hover:text-red-400 transition-colors"
            title="Remove logo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-crystal-500/30 hover:bg-white/[0.02] transition-colors"
        >
          <Upload className="w-6 h-6 text-white/30 mx-auto mb-2" />
          <p className="text-sm text-white/40">
            Drop your logo here or <span className="text-crystal-400">browse</span>
          </p>
          <p className="text-xs text-white/20 mt-1">Max 500 KB · Appears in PDF &amp; email</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      )}
    </div>
  )
}
