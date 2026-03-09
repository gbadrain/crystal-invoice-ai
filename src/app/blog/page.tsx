import type { Metadata } from 'next'
import { blogPosts } from '@/lib/blog-posts'
import { BlogClient } from './BlogClient'

export const metadata: Metadata = {
  title: 'Blog — Crystal Invoice AI',
  description:
    'Invoicing tips, cash flow strategies, and guides for freelancers and independent contractors.',
  openGraph: {
    title: 'Blog — Crystal Invoice AI',
    description:
      'Invoicing tips, cash flow strategies, and guides for freelancers and independent contractors.',
    type: 'website',
  },
}

export default function BlogPage() {
  return <BlogClient posts={blogPosts} />
}
