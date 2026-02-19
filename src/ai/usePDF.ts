'use client'

import { useState, useCallback } from 'react'
import type { Invoice } from '@/utils/invoice-types'

const API_BASE =
  process.env.NEXT_PUBLIC_EXPRESS_URL ??
  (process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL.replace(':3000', ':3001')
    : 'http://localhost:3001')

interface UsePDFReturn {
  generatePDF: (invoice: Invoice) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function usePDF(): UsePDFReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePDF = useCallback(async (invoice: Invoice): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: POST invoice data → server generates PDF and returns a download URL
      const response = await fetch(`${API_BASE}/api/pdf/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      })

      if (!response.ok) {
        let message: string
        const ct = response.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const body = await response.json()
          message = body.error || `PDF generation failed (${response.status})`
        } else {
          message = response.status === 413
            ? 'Invoice data too large. Try removing or reducing the logo image.'
            : `PDF generation failed (${response.status})`
        }
        setError(message)
        setIsLoading(false)
        return
      }

      const { downloadUrl, error: serverError } = await response.json()

      if (serverError || !downloadUrl) {
        setError(serverError || 'Server did not return a download URL.')
        setIsLoading(false)
        return
      }

      // Step 2: Open the download URL directly — the browser handles the PDF natively
      // This is the same mechanism that works when you visit /api/pdf/test in Safari
      window.open(`${API_BASE}${downloadUrl}`, '_blank')

      setIsLoading(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Network error. Is the server running?'
      setError(message)
      setIsLoading(false)
    }
  }, [])

  return { generatePDF, isLoading, error }
}
