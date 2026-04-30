'use client'

import { useEffect, useState } from 'react'
import { createClient } from 'next-sanity'
import Link from 'next/link'
import '../styles.css'

const client = createClient({
  projectId: '6l4myqih',
  dataset: 'production',
  apiVersion: '2021-10-21',
  useCdn: true,
})


const SITE = 'https://www.nextgemfoundation.com'

interface Post {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  imageUrl?: string
  authorName?: string
  categoryTitle?: string
  excerpt?: string
}

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'News', value: 'news' },
  { label: 'Events', value: 'events' },
  { label: 'Impact Stories', value: 'impact' },
  { label: 'Volunteer', value: 'volunteer' },
  { label: 'Orphanages', value: 'orphanage' },
]

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function BlogIndexPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    client.fetch<Post[]>(`
      *[_type == "post"] | order(publishedAt desc) {
        _id, title, slug, publishedAt, excerpt,
        "imageUrl": mainImage.asset->url,
        "authorName": author->name,
        "categoryTitle": categories[0]->title
      }
    `).then(setAllPosts)
  }, [])

  // Filter logic
  const featured = allPosts[0] ?? null
  const rest = allPosts.slice(1).filter(post => {
    const matchCat = !activeCategory ||
      (post.categoryTitle ?? '').toLowerCase().includes(activeCategory)
    const matchSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  // Close menu when body overflow needed
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      {/* NAVBAR */}
      <nav>
        <div className="container">
          <div className="nav-inner">
            <a href={SITE} className="nav-logo">
              <img src="https://nextgem.sirv.com/assets/logo.png" alt="NextGEM Foundation Logo" width={200} height={64} />
            </a>
            <div className="nav-links">
              <div className="nav-dropdown">
                <a href={`${SITE}/#programs`}>Our Programs</a>
                <div className="dropdown-menu">
                  <a href={`${SITE}/orphanage-games.html`}>The Orphanage Games</a>
                </div>
              </div>
              <a href={`${SITE}/donate.html`}>Donate</a>
              <a href={`${SITE}/volunteer.html`}>Volunteer</a>
              <a href={`${SITE}/orphanages.html`}>Visit</a>
              <a href="/blog" className="nav-active">Blog</a>
              <a href={`${SITE}/#contact`}>Contact</a>
              <a href={`${SITE}/partner.html`}>Partner</a>
              <a href={`${SITE}/about.html`}>Our Story</a>
              <a href={`${SITE}/donate.html`} className="btn-blue">Donate Now</a>
            </div>
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <a href={`${SITE}/#programs`} onClick={() => setMenuOpen(false)}>Our Programs</a>
          <a href={`${SITE}/orphanage-games.html`} onClick={() => setMenuOpen(false)}>The Orphanage Games</a>
          <a href="/blog" onClick={() => setMenuOpen(false)}>Blog</a>
          <a href={`${SITE}/orphanages.html`} onClick={() => setMenuOpen(false)}>Visit</a>
          <a href={`${SITE}/volunteer.html`} onClick={() => setMenuOpen(false)}>Volunteer</a>
          <a href={`${SITE}/partner.html`} onClick={() => setMenuOpen(false)}>Partner</a>
          <a href={`${SITE}/about.html`} onClick={() => setMenuOpen(false)}>About</a>
          <a href={`${SITE}/#contact`} onClick={() => setMenuOpen(false)}>Contact</a>
          <a href={`${SITE}/donate.html`} className="mobile-donate-btn" onClick={() => setMenuOpen(false)}>Donate Now</a>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-inner">
            <div>
              <h1>Stories &<br /><em>Latest News</em></h1>
              <p>Updates, impact stories, event coverage, and insights from NextGEM Foundation and our partner orphanages.</p>
            </div>
            <div className="header-stats">
              <div>
                <div className="hstat-num">{allPosts.length || '—'}</div>
                <div className="hstat-label">Published Articles</div>
              </div>
              <div>
                <div className="hstat-num">2026</div>
                <div className="hstat-label">Year Founded</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED — always shows most recent post, unaffected by filters */}
      {featured && (
        <section className="featured">
          <div className="container">
            <p className="featured-label">Featured Story</p>
            <Link href={`/blog/${featured.slug.current}`} className="featured-card">
              <div className="featured-img">
                {featured.imageUrl && (
                  <img src={`${featured.imageUrl}?w=720&auto=format`} alt={featured.title} />
                )}
              </div>
              <div className="featured-body">
                {featured.categoryTitle && (
                  <span className="post-category">{featured.categoryTitle}</span>
                )}
                <h2>{featured.title}</h2>
                <p className="featured-excerpt">{featured.excerpt ?? ''}</p>
                <div className="post-meta">
                  <span className="post-meta-author">{featured.authorName ?? 'NextGEM Team'}</span>
                  <span className="post-meta-dot"></span>
                  <span>{formatDate(featured.publishedAt)}</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* FILTER BAR */}
      <div className="container">
        <div className="filter-bar">
          {CATEGORIES.map(cat => (
            <span
              key={cat.value}
              className={`cat-pill${activeCategory === cat.value ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </span>
          ))}
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* BLOG GRID */}
      <section className="blog-grid-section">
        <div className="container">
          <div className="blog-grid">
            {rest.length === 0 && allPosts.length > 0 ? (
              <div className="empty-state">
                <h3>No articles found</h3>
                <p>Try a different category or clear your search.</p>
              </div>
            ) : (
              rest.map(post => (
                <Link key={post._id} href={`/blog/${post.slug.current}`} className="blog-card">
                  <div className="blog-card-img">
                    {post.imageUrl && (
                      <img src={`${post.imageUrl}?w=480&auto=format`} alt={post.title} />
                    )}
                  </div>
                  <div className="blog-card-body">
                    {post.categoryTitle && (
                      <span className="post-category" style={{ fontSize: 10 }}>{post.categoryTitle}</span>
                    )}
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-card-excerpt">
                      {(post.excerpt ?? '').slice(0, 120)}{(post.excerpt?.length ?? 0) > 120 ? '...' : ''}
                    </p>
                    <div className="blog-card-meta">
                      <span>{post.authorName ?? 'NextGEM Team'}</span>
                      <span className="post-meta-dot"></span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>Every Donation Gives an Orphan a Future</h2>
          <p>Your support funds education, healthcare, and opportunity for orphaned children across Nigeria.</p>
          <a href={`${SITE}/donate.html`} className="btn-white-solid">Donate Now →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-logo">
                <img src="https://nextgem.sirv.com/assets/logo.png" alt="NextGEM Foundation Logo" width={200} height={64} />
                <span className="footer-brand-name">NextGem Foundation</span>
              </div>
              <p className="footer-desc">NextGEM Foundation provides structured support, educational funding, and talent platforms for orphaned children.</p>
              <div className="footer-socials">
                <a href="https://facebook.com/nextgemfoundation" target="_blank" rel="noopener noreferrer">f</a>
                <a href="https://instagram.com/nextgemfoundation" target="_blank" rel="noopener noreferrer">&#9741;</a>
                <a href="https://linkedin.com/company/nextgemfoundation" target="_blank" rel="noopener noreferrer">in</a>
                <a href="https://tiktok.com/@nextgemfoundation" target="_blank" rel="noopener noreferrer">&#9835;</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Our Focus</h4>
              <ul>
                <li><a href={`${SITE}/volunteer.html`}>NextGEM Refiners</a></li>
                <li><a href={`${SITE}/donate.html`}>NextGem Support</a></li>
                <li><a href={`${SITE}/#programs`}>NextGem Spotlight</a></li>
                <li><a href={`${SITE}/orphanage-games.html`}>The Orphanage Games</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Get Involved</h4>
              <ul>
                <li><a href={`${SITE}/donate.html`}>Donate</a></li>
                <li><a href={`${SITE}/volunteer.html`}>Volunteer</a></li>
                <li><a href={`${SITE}/partner.html`}>Partner with Us</a></li>
                <li><a href="/blog">Share the Story</a></li>
                <li><a href={`${SITE}/#contact`}>Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:nextgemfoundation@gmail.com">nextgemfoundation@gmail.com</a></li>
                <li><a href={`${SITE}/#contact`}>Yenagoa, Bayelsa, Nigeria</a></li>
                <li><a href={`${SITE}/publication.html`}>Publications</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 NextGem Foundation</p>
            <p className="footer-glory">TO GOD BE ALL THE GLORY</p>
            <p style={{ fontSize: 11, color: '#aaa' }}>
              Built by{' '}
              <a href="https://www.linkedin.com/in/abiye-lawson" style={{ color: 'var(--blue)' }}>Abiye</a>
              {' & '}
              <a href="https://www.linkedin.com/in/jeremiah-john-bb5436225" style={{ color: 'var(--blue)' }}>Jeremiah</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}