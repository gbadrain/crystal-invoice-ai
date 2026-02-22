'use client'

import { useState, useRef } from 'react'
import { Sparkles, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react'
import { useInvoiceAI } from '@/ai/useInvoiceAI'
import type { ParsedInvoice } from '@/utils/ai-parser'
import { cn } from '@/utils/cn'

interface AIGeneratorProps {
  onGenerate: (invoice: ParsedInvoice) => void
}

const PLACEHOLDER = `Example: "Invoice John Smith at john@smith.com for 3 HVAC units at $150 each. Add 8% tax and a 5% discount."`

export function AIGenerator({ onGenerate }: AIGeneratorProps) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { generateInvoiceFromText, isLoading, error } = useInvoiceAI()

  function toggleListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition: any = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setText(transcript)
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  async function handleGenerate() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
    if (!text.trim() || isLoading) return
    const result = await generateInvoiceFromText(text.trim())
    if (result) onGenerate(result)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="rounded-xl shadow-lg shadow-crystal-950/40 bg-gradient-to-br from-crystal-900/30 to-slate-900/30 ring-1 ring-crystal-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-crystal-400" />
          <h3 className="text-lg font-semibold text-white">Generate with AI</h3>
        </div>
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER}
            rows={3}
            disabled={isLoading}
            className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 pr-12 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6 resize-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500"
          />
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            title={isListening ? 'Stop recording' : 'Record audio'}
            className={cn(
              'absolute bottom-2.5 right-2.5 p-2 rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
              isListening
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30 animate-pulse'
                : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
            )}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 mt-3 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
      <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          {isLoading ? 'Generating...' : 'Press Cmd+Enter to generate'}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!text.trim() || isLoading}
          className="inline-flex items-center justify-center rounded-lg text-sm font-semibold py-2 px-4 bg-crystal-600 text-white hover:bg-crystal-500 disabled:opacity-50 shadow-lg shadow-crystal-600/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate
        </button>
      </div>
    </div>
  )
}
