'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

export function DemoSection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-crystal-400 mb-3">
          See It In Action
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          From words to invoice in seconds
        </h2>
        <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
          Watch how Crystal Invoice AI turns a plain English job description into a professional,
          deliverable invoice — no forms, no fuss.
        </p>

        {/* Thumbnail / play button */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Play demo video"
          className="group relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-crystal-500/10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-crystal-400"
        >
          {/* Placeholder thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            {/* TODO: Replace this div with a real thumbnail image:
                <Image src="/demo-thumbnail.png" alt="Demo preview" fill className="object-cover" />
            */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-crystal-600/30 border border-crystal-500/30 flex items-center justify-center group-hover:bg-crystal-600/50 transition-colors duration-300">
                <Play className="w-8 h-8 text-crystal-300 ml-1" />
              </div>
              <p className="text-white/40 text-sm">Click to watch demo</p>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-crystal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* TODO: Replace the placeholder below with a real YouTube embed:
                <iframe
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
                  title="Crystal Invoice AI Demo"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full aspect-video"
                />
            */}
            <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center gap-4">
              <Play className="w-12 h-12 text-crystal-400" />
              <p className="text-white/50 text-sm">
                {/* TODO: Insert real YouTube link here */}
                Demo video coming soon
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
