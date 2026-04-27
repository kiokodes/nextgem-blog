import { client } from '../lib/sanity'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog & News — NextGEM Foundation | Orphan Support Nigeria',
  description:
    'Updates, impact stories, event coverage, and insights from NextGEM Foundation and our partner orphanages across Nigeria.',
}

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

async function getPosts(): Promise<Post[]> {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      "imageUrl": mainImage.asset->url,
      "authorName": author->name,
      "categoryTitle": categories[0]->title
    }
  `)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function esc(s?: string) {
  if (!s) return ''
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default async function BlogIndexPage() {
  const allPosts = await getPosts()
  const featured = allPosts[0] ?? null
  const rest = allPosts.slice(1)

  return (
    <>
      <style>{`
        :root {
          --blue:    #1D56E8;
          --blue-dk: #1440b8;
          --blue-lt: #eef3fd;
          --white:   #ffffff;
          --gray:    #f5f5f5;
          --text:    #1a1a1a;
          --muted:   #555555;
          --radius:  6px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--white); }
        a { text-decoration: none; color: inherit; }
        img { display: block; max-width: 100%; }
        .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

        /* NAVBAR */
        nav { position: sticky; top: 0; z-index: 100; background: var(--white); border-bottom: 1px solid #e8e8e8; }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .nav-logo img { width: 200px; height: 150px; object-fit: contain; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-links a { font-size: 13px; font-weight: 500; color: var(--text); transition: color .2s; }
        .nav-links a:hover { color: var(--blue); }
        .nav-links .btn-blue { background: var(--blue); color: var(--white); padding: 9px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; }
        .nav-dropdown { position: relative; }
        .dropdown-menu { position: absolute; top: 100%; left: 0; background: var(--white); border: 1px solid #e8e8e8; border-radius: 6px; display: none; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 200; }
        .dropdown-menu a { display: block; padding: 12px 16px; font-size: 13px; color: var(--text); }
        .dropdown-menu a:hover { background: var(--gray); color: var(--blue); }
        .nav-dropdown:hover .dropdown-menu { display: block; }
        .hamburger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 40px; height: 40px; cursor: pointer; background: none; border: none; padding: 4px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--text); border-radius: 99px; transition: all .3s; }
        .mobile-menu { display: none; position: fixed; top: 64px; left: 0; right: 0; bottom: 0; background: var(--white); z-index: 199; padding: 32px 24px; flex-direction: column; overflow-y: auto; border-top: 1px solid #e8e8e8; }
        .mobile-menu a { font-size: 18px; font-weight: 600; color: var(--text); padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
        .mobile-donate-btn { margin-top: 24px; background: var(--blue) !important; color: var(--white) !important; padding: 16px; border-radius: var(--radius); text-align: center; font-size: 16px; font-weight: 700; border-bottom: none !important; }

        /* PAGE HEADER */
        .page-header { padding: 72px 0 56px; border-bottom: 1px solid #e8e8e8; }
        .page-header-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: end; }
        .page-header h1 { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5vw, 56px); font-weight: 900; line-height: 1.05; margin-bottom: 16px; }
        .page-header h1 em { font-style: normal; color: var(--blue); }
        .page-header p { font-size: 15px; color: var(--muted); line-height: 1.7; max-width: 440px; }
        .header-stats { display: flex; gap: 32px; }
        .hstat-num { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: var(--blue); }
        .hstat-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

        /* FEATURED */
        .featured { padding: 64px 0 0; }
        .featured-label { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--blue); margin-bottom: 20px; }
        .featured-card { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e8e8e8; border-radius: 14px; overflow: hidden; transition: box-shadow .2s; }
        .featured-card:hover { box-shadow: 0 12px 48px rgba(29,86,232,.1); }
        .featured-img { width: 100%; height: 420px; background: #d0d0d0; overflow: hidden; }
        .featured-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
        .featured-card:hover .featured-img img { transform: scale(1.03); }
        .featured-body { padding: 48px 40px; display: flex; flex-direction: column; justify-content: center; }
        .post-category { display: inline-block; padding: 4px 12px; background: var(--blue-lt); color: var(--blue); border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
        .featured-body h2 { font-family: 'Playfair Display', serif; font-size: clamp(22px, 2.5vw, 32px); font-weight: 900; line-height: 1.25; margin-bottom: 16px; color: var(--text); }
        .featured-excerpt { font-size: 15px; color: var(--muted); line-height: 1.75; margin-bottom: 28px; }
        .post-meta { display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--muted); }
        .post-meta-author { font-weight: 600; color: var(--text); }
        .post-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #ccc; display: inline-block; }

        /* FILTER BAR */
        .filter-bar { padding: 48px 0 32px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .cat-pill { padding: 8px 18px; border: 1.5px solid #e0e0e0; border-radius: 99px; font-size: 13px; font-weight: 600; background: var(--white); color: var(--muted); }
        .search-wrap { margin-left: auto; }
        .search-input { padding: 9px 16px; border: 1.5px solid #e0e0e0; border-radius: var(--radius); font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; min-width: 220px; }

        /* BLOG GRID */
        .blog-grid-section { padding: 0 0 88px; }
        .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .blog-card { border-radius: 12px; overflow: hidden; border: 1px solid #e8e8e8; transition: box-shadow .2s, transform .2s; display: block; }
        .blog-card:hover { box-shadow: 0 8px 32px rgba(29,86,232,.1); transform: translateY(-3px); }
        .blog-card-img { width: 100%; height: 200px; background: #d0d0d0; overflow: hidden; }
        .blog-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
        .blog-card:hover .blog-card-img img { transform: scale(1.04); }
        .blog-card-body { padding: 22px; }
        .blog-card-title { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 17px; color: var(--text); margin: 10px 0 10px; line-height: 1.35; }
        .blog-card-excerpt { font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 16px; }
        .blog-card-meta { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; }

        /* CTA */
        .cta-banner { background: var(--blue); color: var(--white); padding: 64px 0; text-align: center; }
        .cta-banner h2 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; margin-bottom: 12px; }
        .cta-banner p { font-size: 15px; color: rgba(255,255,255,.8); margin-bottom: 28px; }
        .btn-white-solid { background: var(--white); color: var(--blue); padding: 13px 32px; border-radius: var(--radius); font-weight: 700; font-size: 15px; display: inline-block; }

        /* FOOTER */
        footer { background: var(--white); border-top: 1px solid #e8e8e8; padding: 64px 0 32px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .footer-brand-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .footer-brand-logo img { width: 36px; height: 36px; object-fit: contain; border-radius: 50%; }
        .footer-brand-name { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 15px; }
        .footer-desc { font-size: 13px; color: var(--muted); line-height: 1.7; max-width: 220px; margin-bottom: 20px; }
        .footer-socials { display: flex; gap: 14px; }
        .footer-socials a { width: 32px; height: 32px; border-radius: 50%; background: var(--gray); display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--text); transition: background .2s, color .2s; }
        .footer-socials a:hover { background: var(--blue); color: var(--white); }
        .footer-col h4 { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 16px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul li a { font-size: 13px; color: var(--muted); }
        .footer-col ul li a:hover { color: var(--blue); }
        .footer-bottom { border-top: 1px solid #e8e8e8; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .footer-bottom p { font-size: 12px; color: var(--muted); }
        .footer-glory { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .page-header-inner { grid-template-columns: 1fr; }
          .featured-card { grid-template-columns: 1fr; }
          .featured-img { height: 260px; }
          .blog-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .filter-bar { flex-direction: column; align-items: flex-start; }
          .search-wrap { margin-left: 0; width: 100%; }
          .search-input { width: 100%; }
          .hamburger { display: flex; }
        }
      `}</style>

      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* NAVBAR */}
      <nav>
        <div className="container">
          <div className="nav-inner">
            <a href="/" className="nav-logo">
              <img src="/assets/logo.png" alt="NextGEM Foundation Logo" />
            </a>
            <div className="nav-links">
              <div className="nav-dropdown">
                <a href="/#programs">Our Programs</a>
                <div className="dropdown-menu">
                  <a href="/orphanage-games">The Orphanage Games</a>
                </div>
              </div>
              <a href="/donate">Donate</a>
              <a href="/volunteer">Volunteer</a>
              <a href="/orphanages">Visit</a>
              <a href="/blog">Blog</a>
              <a href="/#contact">Contact</a>
              <a href="/partner">Partner</a>
              <a href="/about">Our Story</a>
              <a href="/donate" className="btn-blue">Donate Now</a>
            </div>
            <button className="hamburger" id="hamburger" aria-label="Open menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <div className="mobile-menu" id="mobile-menu">
          <a href="/#programs">Our Programs</a>
          <a href="/orphanage-games">The Orphanage Games</a>
          <a href="/blog">Blog</a>
          <a href="/orphanages">Visit</a>
          <a href="/volunteer">Volunteer</a>
          <a href="/partner">Partner</a>
          <a href="/about">About</a>
          <a href="/#contact">Contact</a>
          <a href="/donate" className="mobile-donate-btn">Donate Now</a>
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
                <div className="hstat-num">{allPosts.length}</div>
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

      {/* FEATURED */}
      <section className="featured">
        <div className="container">
          <p className="featured-label">Featured Story</p>
          {featured && (
            <Link href={`/blog/${featured.slug.current}`} className="featured-card">
              <div className="featured-img">
                {featured.imageUrl && (
                  <img
                    src={`${featured.imageUrl}?w=720&auto=format`}
                    alt={featured.title}
                  />
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
          )}
        </div>
      </section>

      {/* FILTER BAR — static labels, client filtering handled below */}
      <div className="container">
        <div className="filter-bar">
          <span className="cat-pill" style={{ background: 'var(--blue)', color: '#fff', borderColor: 'var(--blue)' }}>All</span>
          <span className="cat-pill">News</span>
          <span className="cat-pill">Events</span>
          <span className="cat-pill">Impact Stories</span>
          <span className="cat-pill">Volunteer</span>
          <span className="cat-pill">Orphanages</span>
          <div className="search-wrap">
            <input type="text" className="search-input" placeholder="Search articles..." readOnly />
          </div>
        </div>
      </div>

      {/* BLOG GRID */}
      <section className="blog-grid-section">
        <div className="container">
          <div className="blog-grid">
            {rest.map(post => (
              <Link key={post._id} href={`/blog/${post.slug.current}`} className="blog-card">
                <div className="blog-card-img">
                  {post.imageUrl && (
                    <img
                      src={`${post.imageUrl}?w=480&auto=format`}
                      alt={post.title}
                    />
                  )}
                </div>
                <div className="blog-card-body">
                  {post.categoryTitle && (
                    <span className="post-category" style={{ fontSize: 10 }}>{post.categoryTitle}</span>
                  )}
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">
                    {(post.excerpt ?? '').slice(0, 120)}{post.excerpt && post.excerpt.length > 120 ? '...' : ''}
                  </p>
                  <div className="blog-card-meta">
                    <span>{post.authorName ?? 'NextGEM Team'}</span>
                    <span className="post-meta-dot"></span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>Every Donation Gives an Orphan a Future</h2>
          <p>Your support funds education, healthcare, and opportunity for orphaned children across Nigeria.</p>
          <Link href="/donate" className="btn-white-solid">Donate Now →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-logo">
                <img src="/assets/logo.png" alt="NextGEM Logo" />
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
                <li><a href="/volunteer">NextGEM Refiners</a></li>
                <li><a href="/donate">NextGem Support</a></li>
                <li><a href="/#programs">NextGem Spotlight</a></li>
                <li><a href="/orphanage-games">The Orphanage Games</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Get Involved</h4>
              <ul>
                <li><a href="/donate">Donate</a></li>
                <li><a href="/volunteer">Volunteer</a></li>
                <li><a href="/partner">Partner with Us</a></li>
                <li><a href="/blog">Share the Story</a></li>
                <li><a href="/#contact">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:nextgemfoundation@gmail.com">nextgemfoundation@gmail.com</a></li>
                <li><a href="#">Yenagoa, Bayelsa, Nigeria</a></li>
                <li><a href="/publication">Publications</a></li>
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

      {/* Hamburger script */}
      <script dangerouslySetInnerHTML={{ __html: `
        var btn = document.getElementById('hamburger');
        var menu = document.getElementById('mobile-menu');
        if (btn && menu) {
          btn.addEventListener('click', function() {
            var open = menu.style.display === 'flex';
            menu.style.display = open ? 'none' : 'flex';
            document.body.style.overflow = open ? '' : 'hidden';
          });
        }
      `}} />
    </>
  )
}