'use client'

import { useState, useCallback } from 'react'
import { parseAIResponse, type ParsedInvoice } from '@/utils/ai-parser'

const API_BASE =
  process.env.NEXT_PUBLIC_EXPRESS_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://crystal-invoice-ai-production.up.railway.app'
    : 'http://localhost:3001')

interface UseInvoiceAIReturn {
  /** Call this with natural language to generate an invoice */
  generateInvoiceFromText: (text: string) => Promise<ParsedInvoice | null>
  /** True while the AI request is in flight */
  isLoading: boolean
  /** Error message from the last failed request, or null */
  error: string | null
  /** The last successfully parsed invoice, or null */
  data: ParsedInvoice | null
}

export function useInvoiceAI(): UseInvoiceAIReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ParsedInvoice | null>(null)

  const generateInvoiceFromText = useCallback(
    async (text: string): Promise<ParsedInvoice | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        const body = await response.json()

        if (!response.ok) {
          const message = body.error || `Request failed (${response.status})`
          setError(message)
          setIsLoading(false)
          return null
        }

        if (!body.data) {
          setError('AI returned no data.')
          setIsLoading(false)
          return null
        }

        // Sanitize and validate through the parser
        const parsed = parseAIResponse(body.data)
        setData(parsed)
        setIsLoading(false)
        return parsed
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Network error. Is the server running?'
        setError(message)
        setIsLoading(false)
        return null
      }
    },
    []
  )

  return { generateInvoiceFromText, isLoading, error, data }
}
