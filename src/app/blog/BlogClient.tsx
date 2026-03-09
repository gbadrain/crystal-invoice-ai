'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MotionDiv } from '@/components/MotionDiv'
import type { BlogPost } from '@/lib/blog-posts'

const ALL = 'All'

interface BlogClientProps {
  posts: BlogPost[]
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
      {category}
    </span>
  )
}

function PostCard({ post, delay = 0 }: { post: BlogPost; delay?: number }) {
  return (
    <MotionDiv y={20} opacity={0} delay={delay}>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[#13131c] p-6 transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_30px_rgba(196,156,80,0.08)] hover:-translate-y-1"
      >
        <div className="flex items-center justify-between mb-4">
          <CategoryBadge category={post.category} />
          <span className="text-xs text-white/30">{post.readTime} read</span>
        </div>

        <h3 className="font-cormorant text-xl font-semibold text-white leading-snug mb-3 group-hover:text-gold/90 transition-colors duration-200">
          {post.title}
        </h3>

        <p className="text-sm text-white/50 leading-relaxed flex-1 mb-5">{post.excerpt}</p>

        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <time className="text-xs text-white/25">{post.date}</time>
          <span className="flex items-center gap-1 text-xs text-gold/70 group-hover:text-gold transition-colors duration-200">
            Read more <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </MotionDiv>
  )
}

function HeroCard({ post }: { post: BlogPost }) {
  return (
    <MotionDiv y={20} opacity={0}>
      <Link
        href={`/blog/${post.slug}`}
        className="group block rounded-2xl border border-gold/20 bg-[#13131c] p-8 md:p-10 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_0_50px_rgba(196,156,80,0.1)] hover:-translate-y-1 mb-10"
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <CategoryBadge category={post.category} />
          <span className="text-xs font-semibold uppercase tracking-widest text-gold/60 border border-gold/20 px-2.5 py-1 rounded-full">
            Featured
          </span>
          <span className="text-xs text-white/30 ml-auto">{post.date} · {post.readTime} read</span>
        </div>

        <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-white leading-tight mb-4 group-hover:text-gold/90 transition-colors duration-200">
          {post.title}
        </h2>

        <p className="text-base text-white/50 leading-relaxed max-w-2xl mb-6">{post.excerpt}</p>

        <span className="inline-flex items-center gap-2 text-sm text-gold font-medium group-hover:gap-3 transition-all duration-200">
          Read the full guide <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    </MotionDiv>
  )
}

export function BlogClient({ posts }: BlogClientProps) {
  const categories = [ALL, ...Array.from(new Set(posts.map((p) => p.category)))]
  const [active, setActive] = useState(ALL)

  const filtered = active === ALL ? posts : posts.filter((p) => p.category === active)
  const hero = filtered.find((p) => p.featured)
  const grid = filtered.filter((p) => !p.featured || p !== hero)

  return (
    <div className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-white/30 hover:text-white/60 transition-colors mb-12 inline-flex items-center gap-1.5"
      >
        ← Crystal Invoice AI
      </Link>

      {/* Header */}
      <MotionDiv y={20} opacity={0}>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold/40" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">The Blog</p>
          </div>
          <h1 className="font-cormorant text-5xl md:text-6xl font-semibold text-white leading-tight mb-3">
            Insights for independent<br />professionals.
          </h1>
          <p className="text-white/40 text-lg">
            Cash flow, growth, and the tools that make running a freelance business easier.
          </p>
        </div>
      </MotionDiv>

      {/* Category filter */}
      <MotionDiv y={10} opacity={0} delay={0.1}>
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-xs font-medium uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                active === cat
                  ? 'bg-gold text-[#0a0a0f] border-gold font-semibold'
                  : 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:border-white/20 hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </MotionDiv>

      {/* Featured hero */}
      {hero && <HeroCard post={hero} />}

      {/* Post grid */}
      {grid.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {grid.map((post, i) => (
            <PostCard key={post.slug} post={post} delay={i * 0.07} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-white/30 py-20">No posts in this category yet.</p>
      )}
    </div>
  )
}
