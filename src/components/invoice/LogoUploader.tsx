'use client'

import { useCallback, useRef, useState } from 'react'
import { X, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface LogoUploaderProps {
  logo: string | undefined
  onChange: (logo: string | undefined) => void
}

const MAX_SIZE = 500 * 1024 // 500 KB

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
        setSizeError(`File is ${formatKB(file.size)}. Max size is 500 KB.`)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') onChange(reader.result)
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white">Company Logo</h3>
        <div className="mt-6">
          {logo ? (
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="Logo preview"
                className="h-16 max-w-[180px] object-contain rounded-lg bg-white/5 p-2"
              />
              <button
                type="button"
                onClick={() => { onChange(undefined); setSizeError(null) }}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                title="Remove logo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="relative block w-full rounded-lg border-2 border-dashed border-slate-700 p-8 text-center hover:border-crystal-500/40 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <ImageIcon className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-2 block text-sm font-semibold text-slate-300">
                Upload a logo
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG up to 500KB</p>
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
          {sizeError && (
            <div className="flex items-start gap-2 mt-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{sizeError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
