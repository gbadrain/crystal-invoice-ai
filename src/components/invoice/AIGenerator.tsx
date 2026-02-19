'use client'

import { useState, useRef } from 'react'
import { Sparkles, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react'
import { useInvoiceAI } from '@/ai/useInvoiceAI'
import type { ParsedInvoice } from '@/utils/ai-parser'

interface AIGeneratorProps {
  onGenerate: (invoice: ParsedInvoice) => void
}

const PLACEHOLDER = `Example: "I cleaned 3 HVAC units at $150 each for John Smith, john@smith.com, 123 Main St. Add 8% tax and a 5% loyalty discount."`

export function AIGenerator({ onGenerate }: AIGeneratorProps) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { generateInvoiceFromText, isLoading, error } = useInvoiceAI()

  function toggleListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const recognition: SpeechRecognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
    <div className="glass-panel p-6 border-crystal-500/20 bg-crystal-900/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-crystal-400" />
        <h2 className="text-lg font-semibold text-white/90">Generate with AI</h2>
      </div>

      <p className="text-sm text-white/40 mb-3">
        Describe your invoice in plain English — or use the mic to speak.
      </p>

      {/* Textarea with mic button inside */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER}
          rows={3}
          disabled={isLoading}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors resize-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={toggleListening}
          disabled={isLoading}
          title={isListening ? 'Stop recording' : 'Speak your invoice'}
          className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
            isListening
              ? 'bg-red-500/25 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20 animate-pulse'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/25 hover:bg-cyan-500/30 hover:shadow-cyan-500/40'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
          Listening… speak now, click mic to stop
        </p>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-white/25">
          {isLoading ? 'Generating...' : 'Cmd+Enter to generate'}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!text.trim() || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-crystal-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Invoice
            </>
          )}
        </button>
      </div>
    </div>
  )
}
