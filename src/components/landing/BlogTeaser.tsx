import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MotionDiv } from '@/components/MotionDiv'
import { blogPosts } from '@/lib/blog-posts'

export function BlogTeaser() {
  // Show 3 latest posts (featured first, then by order)
  const featured = blogPosts.filter((p) => p.featured)
  const rest = blogPosts.filter((p) => !p.featured)
  const posts = [...featured, ...rest].slice(0, 3)

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <MotionDiv y={20} opacity={0}>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-10" style={{ background: 'rgba(196,156,80,0.4)' }} />
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#c49c50' }}
              >
                From the Blog
              </p>
              <div className="h-px w-10" style={{ background: 'rgba(196,156,80,0.4)' }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Guides for getting paid faster
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Cash flow, invoicing strategy, and AI — written for independent professionals.
            </p>
          </div>
        </MotionDiv>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <MotionDiv key={post.slug} y={20} opacity={0} delay={i * 0.1}>
              <Link
                href={`/blog/${post.slug}`}
                className="crystal-glow-card group flex flex-col h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors duration-300 hover:border-[rgba(196,156,80,0.25)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-medium uppercase tracking-wider px-2.5 py-1 rounded-full border"
                    style={{
                      color: '#c49c50',
                      background: 'rgba(196,156,80,0.08)',
                      borderColor: 'rgba(196,156,80,0.2)',
                    }}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-white/25">{post.readTime}</span>
                </div>

                <h3 className="text-base font-semibold text-white leading-snug mb-3 flex-1 group-hover:text-white/90 transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-white/40 leading-relaxed line-clamp-2 mb-5">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <time className="text-xs text-white/20">{post.date}</time>
                  <span
                    className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 group-hover:gap-1.5"
                    style={{ color: '#c49c50' }}
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </MotionDiv>
          ))}
        </div>

        {/* View all CTA */}
        <MotionDiv y={10} opacity={0} delay={0.35}>
          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:gap-3"
              style={{ color: '#c49c50' }}
            >
              View all posts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </MotionDiv>
      </div>
    </section>
  )
}
