'use client'

import { useCallback, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface LogoUploaderProps {
  logo: string | undefined
  onChange: (logo: string | undefined) => void
}

const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export function LogoUploader({ logo, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > MAX_SIZE) {
        alert('Logo must be under 2MB.')
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
      <h2 className="text-lg font-semibold mb-4 text-white/90">Company Logo</h2>

      {logo ? (
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Logo preview"
            className="h-16 max-w-[200px] object-contain rounded-lg border border-white/10"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="p-2 text-white/40 hover:text-red-400 transition-colors"
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
          <p className="text-xs text-white/20 mt-1">PNG, JPG up to 2MB</p>
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
