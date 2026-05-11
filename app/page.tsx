'use client'

import { useEffect, useState } from 'react'
import { createClient } from 'next-sanity'
import Link from 'next/link'
import './styles.css'

const client = createClient({
  projectId: '6l4myqih',
  dataset: 'production',
  apiVersion: '2021-10-21',
  useCdn: true,
})

const SITE = 'https://www.nextgemfoundation.com'
const POSTS_PER_PAGE = 12

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
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, searchQuery])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Featured is always the most recent post, unaffected by filters/pagination
  const featured = allPosts[0] ?? null

  // All posts except featured, filtered
  const filteredPosts = allPosts.slice(1).filter(post => {
    const matchCat = !activeCategory ||
      (post.categoryTitle ?? '').toLowerCase().includes(activeCategory)
    const matchSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  function scrollToGrid() {
    document.getElementById('blog-grid-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function goToPage(page: number) {
    setCurrentPage(page)
    scrollToGrid()
  }

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
                  <a href={`${SITE}/orphanage-games`}>The Orphanage Games</a>
                </div>
              </div>
              <a href={`${SITE}/donate`}>Donate</a>
              <a href={`${SITE}/volunteer`}>Volunteer</a>
              <a href={`${SITE}/orphanages`}>Visit</a>
              <a href="https://blog.nextgemfoundation.com" className="nav-active" target="_blank" rel="noopener noreferrer">
                Blog
              </a>
              <a href={`${SITE}/#contact`}>Contact</a>
              <a href={`${SITE}/partner`}>Partner</a>
              <a href={`${SITE}/about`}>Our Story</a>
              <a href={`${SITE}/donate`} className="btn-blue">Donate Now</a>
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
          <a href={`${SITE}/orphanage-games`} onClick={() => setMenuOpen(false)}>The Orphanage Games</a>
          <a href="https://blog.nextgemfoundation.com" onClick={() => setMenuOpen(false)} target="_blank" rel="noopener noreferrer">
            Blog
          </a>
          <a href={`${SITE}/orphanages`} onClick={() => setMenuOpen(false)}>Visit</a>
          <a href={`${SITE}/volunteer`} onClick={() => setMenuOpen(false)}>Volunteer</a>
          <a href={`${SITE}/partner`} onClick={() => setMenuOpen(false)}>Partner</a>
          <a href={`${SITE}/about`} onClick={() => setMenuOpen(false)}>About</a>
          <a href={`${SITE}/#contact`} onClick={() => setMenuOpen(false)}>Contact</a>
          <a href={`${SITE}/donate`} className="mobile-donate-btn" onClick={() => setMenuOpen(false)}>Donate Now</a>
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

      {/* FEATURED — always most recent, unaffected by filters */}
      {featured && (
        <section className="featured">
          <div className="container">
            <p className="featured-label">Featured Story</p>
            <Link href={`/blog/${featured.slug.current}`} className="featured-card">
              <div className="featured-img">
                {featured.imageUrl && (
                  <img src={`${featured.imageUrl}?w=720&auto=format`} alt={featured.title} fetchPriority="high" />
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
      <section className="blog-grid-section" id="blog-grid-section">
        <div className="container">
          <div className="blog-grid">
            {paginatedPosts.length === 0 && allPosts.length > 0 ? (
              <div className="empty-state">
                <h3>No articles found</h3>
                <p>Try a different category or clear your search.</p>
              </div>
            ) : (
              paginatedPosts.map(post => (
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

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-num${currentPage === page ? ' active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="page-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}

          {/* PAGE INFO */}
          {filteredPosts.length > 0 && (
            <p className="pagination-info">
              Showing {((currentPage - 1) * POSTS_PER_PAGE) + 1}–{Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} articles
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>Every Donation Gives an Orphan a Future</h2>
          <p>Your support funds education, healthcare, and opportunity for orphaned children across Nigeria.</p>
          <a href={`${SITE}/donate`} className="btn-white-solid">Donate Now →</a>
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
                <li><a href={`${SITE}/volunteer`}>NextGEM Refiners</a></li>
                <li><a href={`${SITE}/donate`}>NextGem Support</a></li>
                <li><a href={`${SITE}/#programs`}>NextGem Spotlight</a></li>
                <li><a href={`${SITE}/orphanage-games`}>The Orphanage Games</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Get Involved</h4>
              <ul>
                <li><a href={`${SITE}/donate`}>Donate</a></li>
                <li><a href={`${SITE}/volunteer`}>Volunteer</a></li>
                <li><a href={`${SITE}/partner`}>Partner with Us</a></li>
                <li><a href="/blog">Share the Story</a></li>
                <li><a href={`${SITE}/#contact`}>Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:nextgemfoundation@gmail.com">nextgemfoundation@gmail.com</a></li>
                <li><a href={`${SITE}/#contact`}>Yenagoa, Bayelsa, Nigeria</a></li>
                <li><a href={`${SITE}/publication`}>Publications</a></li>
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

      {/* PAGINATION STYLES */}
      <style>{`
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 56px;
          flex-wrap: wrap;
        }
        .page-btn {
          padding: 10px 20px;
          border: 1.5px solid #e0e0e0;
          border-radius: var(--radius);
          background: var(--white);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--blue);
          color: var(--blue);
        }
        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .page-numbers {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .page-num {
          width: 36px;
          height: 36px;
          border: 1.5px solid #e0e0e0;
          border-radius: var(--radius);
          background: var(--white);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-num:hover {
          border-color: var(--blue);
          color: var(--blue);
        }
        .page-num.active {
          background: var(--blue);
          border-color: var(--blue);
          color: #fff;
        }
        .pagination-info {
          text-align: center;
          font-size: 13px;
          color: var(--muted);
          margin-top: 16px;
        }
      `}</style>
    </>
  )
}
