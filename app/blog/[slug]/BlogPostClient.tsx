'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'

interface Post {
  title: string
  publishedAt: string
  body: unknown
  metaDescription?: string
  authorName?: string
  categoryTitle?: string
  imageUrl?: string
}

interface RecentPost {
  title: string
  slug: { current: string }
  publishedAt: string
  imageUrl?: string
}

interface BlogPostClientProps {
  post: Post
  recent: RecentPost[]
  slug: string
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const portableTextComponents = {
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-3xl font-bold mt-10 mb-4 text-gray-900">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-bold mt-8 mb-3 text-gray-900">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-900">{children}</h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-5 leading-relaxed text-gray-700">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-emerald-500 pl-5 italic my-6 text-gray-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-2 text-gray-700">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-2 text-gray-700">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a
        href={value?.href ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-600 underline underline-offset-2 hover:text-emerald-800 transition-colors"
      >
        {children}
      </a>
    ),
  },
}

export default function BlogPostClient({ post, recent, slug: _slug }: BlogPostClientProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative w-full bg-gray-950">
        {post.imageUrl ? (
          <div className="relative w-full h-[420px] md:h-[520px]">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-[220px] bg-gradient-to-br from-emerald-900 to-gray-950" />
        )}

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-3xl mx-auto">
          {post.categoryTitle && (
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
              {post.categoryTitle}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-sm text-gray-400">
            {post.authorName && <span>{post.authorName}</span>}
            {post.authorName && <span>·</span>}
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose-sm md:prose">
          {post.body ? (
            <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} components={portableTextComponents} />
          ) : (
            <p className="text-gray-500 italic">No content available.</p>
          )}
        </article>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Recent Posts */}
        {recent.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">More from NextGem</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {recent.map((r) => (
                <Link
                  key={r.slug?.current}
                  href={`/blog/${r.slug?.current}`}
                  className="group flex gap-4 items-start rounded-xl border border-gray-100 p-4 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
                >
                  {r.imageUrl && (
                    <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={r.imageUrl}
                        alt={r.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(r.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
