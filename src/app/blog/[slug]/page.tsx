import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { blogPosts, getBlogPost } from '@/lib/blog-posts'

const APP_URL = 'https://crystalinvoiceai.com'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      url: `${APP_URL}/blog/${post.slug}`,
    },
    alternates: {
      canonical: `${APP_URL}/blog/${post.slug}`,
    },
  }
}

/** Converts markdown-style [text](url) links to HTML anchor tags. */
function renderParagraph(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" class="text-gold hover:text-gold-light underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
  )
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  const paragraphs = post.fullContent.split('\n\n').filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'Crystal Invoice AI',
      url: APP_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Crystal Invoice AI',
      url: APP_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${APP_URL}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="text-sm text-white/30 hover:text-white/60 transition-colors mb-12 inline-flex items-center gap-1.5"
        >
          ← All posts
        </Link>

        <article>
          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                {post.category}
              </span>
              <span className="text-xs text-white/30">{post.readTime} read</span>
            </div>

            <h1 className="font-cormorant text-4xl md:text-5xl font-semibold text-white leading-tight mb-5">
              {post.title}
            </h1>

            <p className="text-lg text-white/50 leading-relaxed mb-6">{post.excerpt}</p>

            <div className="flex items-center gap-4 pt-5 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Image src="/icon.png" alt="Crystal Invoice AI" width={28} height={28} className="rounded-lg" />
                <span className="text-sm text-white/50">Crystal Invoice AI</span>
              </div>
              <time className="text-sm text-white/30" dateTime={post.date}>
                {post.date}
              </time>
            </div>
          </header>

          {/* Gold divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Body */}
          <div className="space-y-6">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-[15px] leading-[1.85] text-white/65"
                dangerouslySetInnerHTML={{ __html: renderParagraph(para) }}
              />
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/[0.06]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-white/25 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-gold/20 bg-[#13131c] p-8 text-center">
          <Image src="/icon.png" alt="Crystal Invoice AI" width={40} height={40} className="rounded-xl mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl font-semibold text-white mb-2">
            Ready to try it yourself?
          </h2>
          <p className="text-sm text-white/40 mb-5">
            Create your first AI invoice in 30 seconds. Free, no credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-[#0a0a0f] font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Start free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  )
}
