'use client'

import { useState, useCallback } from 'react'
import type { Invoice } from '@/utils/invoice-types'

const API_BASE = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL.replace(':3000', ':3001')
  : 'http://localhost:3001'

interface UsePDFReturn {
  /** Generate PDF and trigger browser download */
  generatePDF: (invoice: Invoice) => Promise<void>
  /** True while PDF is being generated */
  isLoading: boolean
  /** Error message from the last failed request, or null */
  error: string | null
}

export function usePDF(): UsePDFReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePDF = useCallback(async (invoice: Invoice): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/pdf/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      })

      if (!response.ok) {
        // Try to read JSON error, fall back to status text
        let message: string
        try {
          const body = await response.json()
          message = body.error || `PDF generation failed (${response.status})`
        } catch {
          message = `PDF generation failed (${response.status})`
        }
        setError(message)
        setIsLoading(false)
        return
      }

      // Receive the PDF as a blob
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Trigger browser download
      const filename = `invoice-${invoice.metadata?.invoiceNumber || 'draft'}.pdf`
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

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
