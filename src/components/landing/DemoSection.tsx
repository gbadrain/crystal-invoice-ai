'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { MotionDiv } from '@/components/MotionDiv'
import { motion } from 'framer-motion'

// ─── VIDEO CONFIG ──────────────────────────────────────────────────────────────
// When your Pictory video is ready, set one of the two options below:
//
// Option A — Direct MP4 file (download from Pictory and upload to /public/demo.mp4)
//   const VIDEO_MP4 = '/demo.mp4'
//   const VIDEO_EMBED = ''
//
// Option B — Pictory hosted embed URL (share → copy embed URL from Pictory)
//   const VIDEO_MP4 = ''
//   const VIDEO_EMBED = 'https://pictory.ai/embed/YOUR_VIDEO_ID'
//
// Leave both empty to show the "coming soon" placeholder.
const VIDEO_MP4 = ''
const VIDEO_EMBED = 'https://www.youtube.com/embed/PsbUaLy8b1Y?autoplay=1'
// ──────────────────────────────────────────────────────────────────────────────

export function DemoSection() {
  const [open, setOpen] = useState(false)
  const hasVideo = VIDEO_MP4 || VIDEO_EMBED

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <MotionDiv y={20} opacity={0}>
          <p className="text-xs font-semibold uppercase tracking-widest text-crystal-400 mb-3">
            See It In Action
          </p>
        </MotionDiv>
        <MotionDiv y={20} opacity={0} delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            From words to invoice in seconds
          </h2>
        </MotionDiv>
        <MotionDiv y={20} opacity={0} delay={0.2}>
          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
            Watch how Crystal Invoice AI turns a plain English job description into a professional,
            deliverable invoice — no forms, no fuss.
          </p>
        </MotionDiv>

        {/* Thumbnail / play button */}
        <MotionDiv y={20} opacity={0} delay={0.3}>
          <motion.button
            onClick={() => setOpen(true)}
            aria-label="Play demo video"
            className="group relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-crystal-500/10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-crystal-400"
            whileHover={{ y: -7, scale: 1.01, boxShadow: '0 0 35px rgba(99,102,241,0.45), 0 0 70px rgba(99,102,241,0.18), 0 28px 55px rgba(0,0,0,0.55)' }}
            whileTap={{ y: 0, scale: 1, boxShadow: '0 8px 16px rgba(99,102,241,0.2)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-crystal-600/30 border border-crystal-500/30 flex items-center justify-center group-hover:bg-crystal-600/50 transition-colors duration-300">
                  <Play className="w-8 h-8 text-crystal-300 ml-1" />
                </div>
                <p className="text-white/40 text-sm">
                  {hasVideo ? 'Click to watch demo' : 'Demo video coming soon'}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-crystal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.button>
        </MotionDiv>
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

            {VIDEO_MP4 ? (
              // Option A: direct mp4 (Pictory download → /public/demo.mp4)
              <video
                src={VIDEO_MP4}
                controls
                autoPlay
                className="w-full aspect-video bg-black"
                title="Crystal Invoice AI Demo"
              />
            ) : VIDEO_EMBED ? (
              // Option B: Pictory hosted embed URL
              <iframe
                src={VIDEO_EMBED}
                title="Crystal Invoice AI Demo"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="w-full aspect-video"
              />
            ) : (
              // Placeholder — no video yet
              <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center gap-4">
                <Play className="w-12 h-12 text-crystal-400" />
                <p className="text-white/50 text-sm">Demo video coming soon</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
