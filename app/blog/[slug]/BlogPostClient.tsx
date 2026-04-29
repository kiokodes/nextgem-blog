'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'

const SITE = 'https://www.nextgemfoundation.com'

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function readTime(body: any[]) {
  if (!body) return '1 min read'
  const text = body
    .map((b) => (b.children || []).map((c: any) => c.text || '').join(' '))
    .join(' ')
  return Math.max(1, Math.round(text.split(/\s+/).length / 200)) + ' min read'
}

const ptComponents = {
  marks: {
    link: ({ children, value }: any) => {
      const isExternal = value?.href?.startsWith('http')
      return (
        <a
          href={value?.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          style={{ color: '#1D56E8', textDecoration: 'underline' }}
        >
          {children}
        </a>
      )
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(22px,3vw,32px)',
          fontWeight: 900,
          margin: '40px 0 16px',
          color: '#1a1a1a',
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          margin: '32px 0 12px',
        }}
      >
        {children}
      </h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote
        style={{
          borderLeft: '4px solid #1D56E8',
          padding: '16px 24px',
          background: '#eef3fd',
          borderRadius: '0 8px 8px 0',
          fontStyle: 'italic',
          color: '#555',
          margin: '28px 0',
        }}
      >
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => <p style={{ marginBottom: 22 }}>{children}</p>,
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null
      const imgId = value.asset._ref
        .replace('image-', '')
        .replace(/-jpg$/, '.jpg')
        .replace(/-png$/, '.png')
        .replace(/-webp$/, '.webp')
      return (
        <img
          src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${imgId}?w=740&auto=format`}
          alt={value.alt || ''}
          loading="lazy"
          style={{ borderRadius: 10, margin: '32px 0', width: '100%' }}
        />
      )
    },
  },
}

interface BlogPostClientProps {
  post: any
  recent: any[]
  slug: string
}

export default function BlogPostClient({ post, recent, slug }: BlogPostClientProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [popupAmount, setPopupAmount] = useState(5000)
  const [popupFreq, setPopupFreq] = useState('monthly')
  const [customAmt, setCustomAmt] = useState('')
  const [email, setEmail] = useState('')
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [donateClosed, setDonateClosed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen || bankModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, bankModalOpen])

  function handleDonate() {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.')
      return
    }
    if (!popupAmount || popupAmount < 100) {
      alert('Minimum donation is ₦100.')
      return
    }
    setBankModalOpen(true)
  }

  function copyAccount() {
    navigator.clipboard.writeText('2085268432').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function share(platform: string) {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(document.title)
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
    }
    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))
    } else {
      window.open(links[platform], '_blank')
    }
  }

  const related = recent.slice(0, 2)
  const sidebar = recent.slice(0, 4)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --blue: #1D56E8;
          --blue-dk: #1440b8;
          --blue-lt: #eef3fd;
          --white: #ffffff;
          --gray: #f5f5f5;
          --text: #1a1a1a;
          --muted: #555555;
          --radius: 6px;
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
        .nav-logo img { width: 200px; height: 64px; object-fit: contain; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-links a { font-size: 13px; font-weight: 500; color: var(--text); transition: color .2s; }
        .nav-links a:hover { color: var(--blue); }
        .btn-blue { background: var(--blue) !important; color: var(--white) !important; padding: 9px 20px; border-radius: 6px; font-size: 13px; font-weight: 600 !important; }
        .nav-dropdown { position: relative; }
        .dropdown-menu { position: absolute; top: 100%; left: 0; background: var(--white); border: 1px solid #e8e8e8; border-radius: 6px; display: none; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 200; }
        .dropdown-menu a { display: block; padding: 12px 16px; font-size: 13px; color: var(--text); }
        .dropdown-menu a:hover { background: var(--gray); color: var(--blue); }
        .nav-dropdown:hover .dropdown-menu { display: block; }
        .hamburger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 40px; height: 40px; cursor: pointer; background: none; border: none; padding: 4px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--text); border-radius: 99px; transition: all .3s; }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mobile-menu { display: none; position: fixed; top: 64px; left: 0; right: 0; bottom: 0; background: var(--white); z-index: 199; padding: 32px 24px; flex-direction: column; overflow-y: auto; border-top: 1px solid #e8e8e8; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-size: 18px; font-weight: 600; color: var(--text); padding: 16px 0; border-bottom: 1px solid #f0f0f0; display: block; }
        .mobile-menu a:last-child { border-bottom: none; }
        .mobile-donate-btn { margin-top: 24px; background: var(--blue) !important; color: var(--white) !important; padding: 16px !important; border-radius: var(--radius); text-align: center; font-size: 16px !important; font-weight: 700 !important; border-bottom: none !important; }

        /* HERO */
        .article-hero-img { width: 100%; height: 480px; background: #d0d0d0; overflow: hidden; }
        .article-hero-img img { width: 100%; height: 100%; object-fit: cover; }

        /* LAYOUT */
        .article-wrap { display: grid; grid-template-columns: 1fr 340px; gap: 56px; max-width: 1140px; margin: 0 auto; padding: 56px 24px 88px; align-items: start; }
        .article-main { min-width: 0; }
        .article-breadcrumb { font-size: 12px; color: var(--muted); margin-bottom: 20px; display: flex; align-items: center; gap: 6px; }
        .article-breadcrumb a { color: var(--blue); }
        .article-category { display: inline-block; padding: 4px 12px; background: var(--blue-lt); color: var(--blue); border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
        .article-title { font-family: 'Playfair Display', serif; font-size: clamp(26px,3.5vw,40px); font-weight: 900; line-height: 1.15; margin-bottom: 20px; }
        .article-meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--muted); padding-bottom: 24px; margin-bottom: 32px; border-bottom: 1px solid #e8e8e8; }
        .article-meta-author { font-weight: 700; color: var(--text); }
        .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #ccc; display: inline-block; }
        .article-body { font-size: 16px; line-height: 1.85; color: #2a2a2a; }
        .article-body ul, .article-body ol { padding-left: 24px; margin-bottom: 22px; }
        .article-body li { margin-bottom: 8px; }
        .article-body a { color: var(--blue); text-decoration: underline; }

        /* INLINE DONATE CTA */
        .inline-donate-cta { background: var(--blue-lt); border: 1.5px solid var(--blue); border-radius: 10px; padding: 20px 24px; margin: 36px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .inline-donate-cta p { font-size: 14px; font-weight: 600; color: var(--blue); margin: 0; }
        .inline-donate-cta a { background: var(--blue); color: var(--white) !important; padding: 10px 20px; border-radius: var(--radius); font-size: 13px; font-weight: 700; white-space: nowrap; }

        /* SHARE BAR */
        .share-bar { display: flex; align-items: center; gap: 12px; padding: 24px 0; border-top: 1px solid #e8e8e8; margin-top: 48px; flex-wrap: wrap; }
        .share-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
        .share-btn { padding: 8px 16px; border: 1.5px solid #e0e0e0; border-radius: 99px; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--white); color: var(--text); font-family: inherit; transition: all .2s; }
        .share-btn:hover { border-color: var(--blue); color: var(--blue); }

        /* RELATED */
        .related { padding: 48px 0 0; border-top: 1px solid #e8e8e8; margin-top: 48px; }
        .related h3 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; margin-bottom: 24px; }
        .related-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
        .related-card { border: 1px solid #e8e8e8; border-radius: 10px; overflow: hidden; transition: box-shadow .2s; display: block; }
        .related-card:hover { box-shadow: 0 6px 24px rgba(29,86,232,.1); }
        .related-img { height: 140px; background: #d0d0d0; overflow: hidden; }
        .related-img img { width: 100%; height: 100%; object-fit: cover; }
        .related-body { padding: 16px; }
        .related-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; line-height: 1.3; margin-bottom: 6px; color: var(--text); }
        .related-date { font-size: 11px; color: var(--muted); }

        /* SIDEBAR */
        .article-sidebar { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 24px; }
        .donate-popup-card { background: var(--white); border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 24px rgba(0,0,0,.08); position: relative; }
        .popup-close { position: absolute; top: 12px; right: 14px; background: none; border: none; font-size: 18px; cursor: pointer; color: var(--muted); line-height: 1; }
        .donate-popup-card h4 { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
        .donate-popup-card h4 em { font-style: normal; color: var(--blue); }
        .popup-subtitle { font-size: 12px; color: var(--muted); text-align: center; margin-bottom: 16px; }
        .popup-subtitle span { color: var(--blue); font-weight: 600; }
        .popup-freq { display: flex; border: 1px solid #e0e0e0; border-radius: var(--radius); overflow: hidden; margin-bottom: 14px; }
        .popup-freq-btn { flex: 1; padding: 9px; text-align: center; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--white); border: none; color: var(--muted); font-family: inherit; transition: all .2s; }
        .popup-freq-btn.active { background: var(--blue); color: var(--white); }
        .popup-amounts { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .popup-pill { flex: 1; min-width: 60px; padding: 8px 6px; border: 1.5px solid #e0e0e0; border-radius: 4px; font-size: 12px; font-weight: 700; text-align: center; cursor: pointer; background: var(--white); color: var(--text); transition: all .2s; }
        .popup-pill.active { background: var(--blue); color: var(--white); border-color: var(--blue); }
        .popup-custom { display: flex; align-items: center; border: 1.5px solid #e0e0e0; border-radius: var(--radius); overflow: hidden; margin-bottom: 14px; }
        .popup-custom span { padding: 0 10px; font-size: 14px; font-weight: 700; color: var(--muted); background: var(--gray); height: 38px; display: flex; align-items: center; border-right: 1px solid #e0e0e0; }
        .popup-custom input { flex: 1; padding: 0 10px; height: 38px; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .popup-email { width: 100%; padding: 10px 12px; border: 1.5px solid #e0e0e0; border-radius: var(--radius); font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; margin-bottom: 14px; transition: border-color .2s; }
        .popup-email:focus { border-color: var(--blue); }
        .popup-donate-btn { width: 100%; padding: 12px; background: var(--blue); color: var(--white); border: none; border-radius: var(--radius); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; transition: background .2s; }
        .popup-donate-btn:hover { background: var(--blue-dk); }
        .popup-logos { display: flex; justify-content: center; gap: 6px; margin-bottom: 6px; }
        .popup-logos span { font-size: 10px; color: var(--muted); background: var(--gray); padding: 3px 7px; border-radius: 3px; font-weight: 600; }
        .popup-secure { font-size: 10px; color: var(--muted); text-align: center; }
        .sidebar-about { background: var(--gray); border-radius: 12px; padding: 24px; }
        .sidebar-about h4 { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; margin-bottom: 10px; }
        .sidebar-about p { font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 16px; }
        .sidebar-about a { font-size: 13px; font-weight: 700; color: var(--blue); }
        .sidebar-recent h4 { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; margin-bottom: 16px; }
        .sidebar-post { display: flex; gap: 12px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f0f0f0; }
        .sidebar-post:last-child { border-bottom: none; margin-bottom: 0; }
        .sidebar-post-img { width: 56px; height: 56px; border-radius: 6px; background: #d0d0d0; flex-shrink: 0; overflow: hidden; }
        .sidebar-post-img img { width: 100%; height: 100%; object-fit: cover; }
        .sidebar-post-title { font-size: 13px; font-weight: 600; line-height: 1.4; margin-bottom: 4px; }
        .sidebar-post-title a { color: var(--text); }
        .sidebar-post-title a:hover { color: var(--blue); }
        .sidebar-post-date { font-size: 11px; color: var(--muted); }

        /* BANK MODAL */
        .bank-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .bank-modal-inner { background: #fff; border-radius: 14px; padding: 40px; max-width: 460px; width: 100%; position: relative; box-shadow: 0 24px 64px rgba(0,0,0,.2); max-height: 90vh; overflow-y: auto; }

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
        .footer-col ul li a { font-size: 13px; color: var(--muted); transition: color .2s; }
        .footer-col ul li a:hover { color: var(--blue); }
        .footer-bottom { border-top: 1px solid #e8e8e8; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .footer-bottom p { font-size: 12px; color: var(--muted); }
        .footer-glory { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

        /* RESPONSIVE */
        @media(max-width: 960px) {
          .article-wrap { grid-template-columns: 1fr; }
          .article-sidebar { position: static; }
          .nav-links { display: none; }
          .related-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .hamburger { display: flex; }
        }
        @media(max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav>
        <div className="container">
          <div className="nav-inner">
            <a href={SITE} className="nav-logo">
              <img src="/assets/logo.png" alt="NextGEM Foundation Logo" />
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
              <Link href="/blog" style={{ color: 'var(--blue)', fontWeight: 700 }}>Blog</Link>
              <a href={`${SITE}/#contact`}>Contact</a>
              <a href={`${SITE}/partner.html`}>Partner</a>
              <a href={`${SITE}/about.html`}>Our Story</a>
              <a href={`${SITE}/donate.html`} className="btn-blue">Donate Now</a>
            </div>
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <a href={`${SITE}/#programs`} onClick={() => setMenuOpen(false)}>Our Programs</a>
          <a href={`${SITE}/orphanage-games.html`} onClick={() => setMenuOpen(false)}>The Orphanage Games</a>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
          <a href={`${SITE}/orphanages.html`} onClick={() => setMenuOpen(false)}>Visit</a>
          <a href={`${SITE}/volunteer.html`} onClick={() => setMenuOpen(false)}>Volunteer</a>
          <a href={`${SITE}/partner.html`} onClick={() => setMenuOpen(false)}>Partner</a>
          <a href={`${SITE}/about.html`} onClick={() => setMenuOpen(false)}>About</a>
          <a href={`${SITE}/#contact`} onClick={() => setMenuOpen(false)}>Contact</a>
          <a href={`${SITE}/donate.html`} className="mobile-donate-btn" onClick={() => setMenuOpen(false)}>
            Donate Now
          </a>
        </div>
      </nav>

      {/* HERO IMAGE */}
      {post.imageUrl && (
        <div className="article-hero-img">
          <img src={`${post.imageUrl}?w=1440&auto=format`} alt={post.title} />
        </div>
      )}

      {/* ARTICLE + SIDEBAR */}
      <div className="article-wrap">
        <main className="article-main">
          <div className="article-breadcrumb">
            <Link href="/blog">Blog</Link>
            <span>›</span>
            <span>{post.categoryTitle ?? 'Article'}</span>
          </div>

          {post.categoryTitle && (
            <span className="article-category">{post.categoryTitle}</span>
          )}

          <h1 className="article-title">{post.title}</h1>

          <div className="article-meta">
            <span className="article-meta-author">
              Author: {post.authorName ?? 'NextGEM Team'}
            </span>
            <span className="meta-dot"></span>
            <span>{formatDate(post.publishedAt)}</span>
            <span className="meta-dot"></span>
            <span>{readTime(post.body)}</span>
          </div>

          <div className="article-body">
            <PortableText value={post.body} components={ptComponents} />
          </div>

          {/* Inline donate CTA */}
          <div className="inline-donate-cta">
            <p>Your Donation can give an Orphan a Future</p>
            <a href={`${SITE}/donate.html`}>Donate Now ›</a>
          </div>

          {/* Share bar */}
          <div className="share-bar">
            <span className="share-label">Share</span>
            <button className="share-btn" onClick={() => share('twitter')}>𝕏</button>
            <button className="share-btn" onClick={() => share('facebook')}>f</button>
            <button className="share-btn" onClick={() => share('linkedin')}>in</button>
            <button className="share-btn" onClick={() => share('whatsapp')}>WhatsApp</button>
            <button className="share-btn" onClick={() => share('copy')}>Copy Link</button>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="related">
              <h3>More Stories</h3>
              <div className="related-grid">
                {related.map((p: any) => (
                  <Link
                    key={p.slug.current}
                    href={`/blog/${p.slug.current}`}
                    className="related-card"
                  >
                    <div className="related-img">
                      {p.imageUrl && (
                        <img
                          src={`${p.imageUrl}?w=300&auto=format`}
                          alt={p.title}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="related-body">
                      <div className="related-title">{p.title}</div>
                      <div className="related-date">{formatDate(p.publishedAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* SIDEBAR */}
        <aside className="article-sidebar">
          {!donateClosed && (
            <div className="donate-popup-card">
              <button className="popup-close" onClick={() => setDonateClosed(true)}>×</button>
              <h4>
                Your Donation Can Save<br />
                <em>An Orphan&apos;s Future</em>
              </h4>
              <p className="popup-subtitle">
                You&apos;re making a <span>{popupFreq}</span> donation of{' '}
                <span>₦{popupAmount.toLocaleString()}</span>
              </p>
              <div className="popup-freq">
                <button
                  className={`popup-freq-btn${popupFreq === 'monthly' ? ' active' : ''}`}
                  onClick={() => setPopupFreq('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`popup-freq-btn${popupFreq === 'one-time' ? ' active' : ''}`}
                  onClick={() => setPopupFreq('one-time')}
                >
                  One-Time
                </button>
              </div>
              <div className="popup-amounts">
                {[2500, 5000, 10000].map((amt) => (
                  <div
                    key={amt}
                    className={`popup-pill${popupAmount === amt && !customAmt ? ' active' : ''}`}
                    onClick={() => { setPopupAmount(amt); setCustomAmt('') }}
                  >
                    ₦{amt.toLocaleString()}
                  </div>
                ))}
                <div
                  className={`popup-pill${customAmt ? ' active' : ''}`}
                  onClick={() => { setPopupAmount(0); setCustomAmt('') }}
                >
                  Other
                </div>
              </div>
              <div className="popup-custom">
                <span>₦</span>
                <input
                  type="number"
                  placeholder="Enter other amount"
                  value={customAmt}
                  onChange={(e) => {
                    setCustomAmt(e.target.value)
                    setPopupAmount(parseFloat(e.target.value) || 0)
                  }}
                />
              </div>
              <input
                type="email"
                className="popup-email"
                placeholder="Your email address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="popup-donate-btn" onClick={handleDonate}>
                ♥ Donate Now
              </button>
              <div className="popup-logos">
                <span>VISA</span>
                <span>PayPal</span>
                <span>GPay</span>
                <span>APay</span>
              </div>
              <p className="popup-secure">🔒 Your donation is processed securely</p>
            </div>
          )}

          <div className="sidebar-about">
            <h4>About NextGEM</h4>
            <p>
              NextGEM Foundation provides structured support, educational funding, and talent
              platforms for orphaned children across Nigeria.
            </p>
            <a href={`${SITE}/about.html`}>Learn more →</a>
          </div>

          {sidebar.length > 0 && (
            <div className="sidebar-recent">
              <h4>Recent Stories</h4>
              {sidebar.map((p: any) => (
                <div key={p.slug.current} className="sidebar-post">
                  <div className="sidebar-post-img">
                    {p.imageUrl && (
                      <img
                        src={`${p.imageUrl}?w=112&auto=format`}
                        alt={p.title}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div>
                    <div className="sidebar-post-title">
                      <Link href={`/blog/${p.slug.current}`}>{p.title}</Link>
                    </div>
                    <div className="sidebar-post-date">{formatDate(p.publishedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* BANK TRANSFER MODAL */}
      {bankModalOpen && (
        <div
          className="bank-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setBankModalOpen(false) }}
        >
          <div className="bank-modal-inner">
            <button
              onClick={() => setBankModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#555' }}
            >
              ×
            </button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏦</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
                Make a Bank Transfer
              </h2>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                Please transfer directly to this account:
              </p>
            </div>
            <div style={{ background: '#eef3fd', border: '1.5px solid #1D56E8', borderRadius: 10, padding: 24, marginBottom: 20 }}>
              {[['Bank', 'UBA'], ['Account Name', 'Victoria Kiolawson']].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>{label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>
                  Account Number
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#1D56E8' }}>2085268432</span>
                  <button
                    onClick={copyAccount}
                    style={{ background: copied ? '#16a34a' : '#1D56E8', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>
                  Your Amount
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1D56E8' }}>
                  ₦{popupAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
                <strong style={{ color: '#1a1a1a' }}>After transferring:</strong>
                <br />
                Send your name and receipt to{' '}
                <a href="mailto:nextgemfoundation@gmail.com" style={{ color: '#1D56E8', fontWeight: 600 }}>
                  nextgemfoundation@gmail.com
                </a>
              </p>
            </div>
            <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
              🔒 Personal account held by the Foundation&apos;s founder on behalf of NextGEM Foundation.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-logo">
                <img src="/assets/logo.png" alt="NextGEM Logo" />
                <span className="footer-brand-name">NextGem Foundation</span>
              </div>
              <p className="footer-desc">
                NextGEM Foundation provides structured support, educational funding, and talent
                platforms for orphaned children.
              </p>
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
                <li><Link href="/blog">Share the Story</Link></li>
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