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
      <h1 className="post-body-h1">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="post-body-h2">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="post-body-h3">{children}</h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="post-body-p">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="post-body-blockquote">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="post-body-ul">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="post-body-ol">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="post-body-li">{children}</li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="post-body-li">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="post-body-strong">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em>{children}</em>
    ),
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a
        href={value?.href ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="post-body-link"
      >
        {children}
      </a>
    ),
  },
}

export default function BlogPostClient({ post, recent, slug: _slug }: BlogPostClientProps) {
  return (
    <>
      {/* ── NAVBAR ── */}
      <nav>
        <div className="container nav-inner">
          <a href="https://nextgemfoundation.com" className="nav-logo">
            <img
              src="https://nextgem.sirv.com/assets/logo.png"
              alt="NextGem Foundation"
            />
          </a>
          <div className="nav-links">
            <a href="https://nextgemfoundation.com">Home</a>
            <a href="https://nextgemfoundation.com/about">About</a>
            <a href="https://nextgemfoundation.com/programmes">Programmes</a>
            <a href="https://blog.nextgemfoundation.com" className="nav-active">Blog</a>
            <a href="https://nextgemfoundation.com/contact" className="btn-blue">Contact Us</a>
          </div>
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={(e) => {
              const btn = e.currentTarget
              const menu = document.querySelector('.mobile-menu')
              btn.classList.toggle('open')
              menu?.classList.toggle('open')
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className="mobile-menu">
        <a href="https://nextgemfoundation.com">Home</a>
        <a href="https://nextgemfoundation.com/about">About</a>
        <a href="https://nextgemfoundation.com/programmes">Programmes</a>
        <a href="https://blog.nextgemfoundation.com">Blog</a>
        <a href="https://nextgemfoundation.com/contact" className="mobile-donate-btn">Contact Us</a>
      </div>

      <main>
        {/* ── HERO ── */}
        <div className="post-hero">
          {post.imageUrl && (
            <div className="post-hero-img-wrap">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="post-hero-img"
                priority
              />
              <div className="post-hero-overlay" />
            </div>
          )}
          <div className={`post-hero-content${post.imageUrl ? ' post-hero-content--over-image' : ''}`}>
            <div className="container">
              {post.categoryTitle && (
                <span className="post-category">{post.categoryTitle}</span>
              )}
              <h1 className="post-hero-title">{post.title}</h1>
              <div className="post-meta">
                {post.authorName && (
                  <span className="post-meta-author">{post.authorName}</span>
                )}
                {post.authorName && <span className="post-meta-dot" />}
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="container">
          <div className="post-layout">
            {/* Article */}
            <article className="post-article">
              {post.body ? (
                <PortableText
                  value={post.body as Parameters<typeof PortableText>[0]['value']}
                  components={portableTextComponents}
                />
              ) : (
                <p className="post-body-p" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
                  No content available.
                </p>
              )}

              <div className="post-back-link">
                <Link href="/blog">← Back to Blog</Link>
              </div>
            </article>

            {/* Sidebar */}
            {recent.length > 0 && (
              <aside className="post-sidebar">
                <h3 className="post-sidebar-heading">More from NextGem</h3>
                <div className="post-sidebar-list">
                  {recent.map((r) => (
                    <Link
                      key={r.slug?.current}
                      href={`/blog/${r.slug?.current}`}
                      className="post-sidebar-card"
                    >
                      {r.imageUrl && (
                        <div className="post-sidebar-img-wrap">
                          <Image
                            src={r.imageUrl}
                            alt={r.title}
                            fill
                            className="post-sidebar-img"
                          />
                        </div>
                      )}
                      <div className="post-sidebar-text">
                        <p className="post-sidebar-title">{r.title}</p>
                        <p className="post-sidebar-date">{formatDate(r.publishedAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="cta-banner">
          <div className="container">
            <h2>Support a child&apos;s future today</h2>
            <p>Partner with NextGem Foundation to build lasting infrastructure for orphaned children across Nigeria.</p>
            <a href="https://nextgemfoundation.com/contact" className="btn-white-solid">Get Involved</a>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-logo">
                <img src="https://nextgem.sirv.com/assets/logo.png" alt="NextGem Foundation" />
              </div>
              <p className="footer-desc">
                Building structured platforms and pipelines for orphaned children across Nigeria.
              </p>
              <div className="footer-socials">
                <a href="https://linkedin.com/company/nextgemfoundation" aria-label="LinkedIn">in</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Foundation</h4>
              <ul>
                <li><a href="https://nextgemfoundation.com/about">About Us</a></li>
                <li><a href="https://nextgemfoundation.com/programmes">Programmes</a></li>
                <li><a href="https://nextgemfoundation.com/partners">Partners</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="https://blog.nextgemfoundation.com">Blog</a></li>
                <li><a href="https://nextgemfoundation.com/contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} NextGem Foundation. All rights reserved.</p>
            <span className="footer-glory">To God be the glory</span>
          </div>
        </div>
      </footer>
    </>
  )
}
