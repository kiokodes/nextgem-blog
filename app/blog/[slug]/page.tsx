import { client } from '../../lib/sanity'
import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == "post"]{ "slug": slug.current }`)
  return posts.map((p: { slug: string }) => ({ slug: p.slug }))
}

async function getPost(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      title,
      publishedAt,
      body,
      metaDescription,
      "authorName": author->name,
      "categoryTitle": categories[0]->title,
      "imageUrl": mainImage.asset->url
    }`,
    { slug }
  )
}

async function getRecent(excludeSlug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current != $excludeSlug] | order(publishedAt desc) [0..3] {
      title, slug, publishedAt, "imageUrl": mainImage.asset->url
    }`,
    { excludeSlug }
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  const description = post.metaDescription || post.title
  return {
    title: `${post.title} — NextGem Foundation`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  }
}

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

// Portable Text component overrides — renders links, bold, etc.
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
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, margin: '40px 0 16px', color: '#1a1a1a' }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, margin: '32px 0 12px' }}>
        {children}
      </h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote style={{ borderLeft: '4px solid #1D56E8', padding: '16px 24px', background: '#eef3fd', borderRadius: '0 8px 8px 0', fontStyle: 'italic', color: '#555', margin: '28px 0' }}>
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p style={{ marginBottom: 22 }}>{children}</p>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null
      const ref = value.asset._ref
      const imgId = ref.replace('image-', '').replace(/-jpg$/, '.jpg').replace(/-png$/, '.png').replace(/-webp$/, '.webp')
      const url = `https://cdn.sanity.io/images/6l4myqih/production/${imgId}`
      return (
        <img
          src={`${url}?w=740&auto=format`}
          alt={value.alt || ''}
          loading="lazy"
          style={{ borderRadius: 10, margin: '32px 0', width: '100%' }}
        />
      )
    },
  },
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, recent] = await Promise.all([getPost(slug), getRecent(slug)])
  if (!post) notFound()

  const related = (recent ?? []).slice(0, 2)
  const sidebar = (recent ?? []).slice(0, 4)

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

        /* HERO */
        .article-hero-img { width: 100%; height: 480px; background: #d0d0d0; overflow: hidden; }
        .article-hero-img img { width: 100%; height: 100%; object-fit: cover; }

        /* LAYOUT */
        .article-wrap { display: grid; grid-template-columns: 1fr 340px; gap: 56px; max-width: 1140px; margin: 0 auto; padding: 56px 24px 88px; align-items: start; }
        .article-main { min-width: 0; }

        /* BREADCRUMB */
        .article-breadcrumb { font-size: 12px; color: var(--muted); margin-bottom: 20px; display: flex; align-items: center; gap: 6px; }
        .article-breadcrumb a { color: var(--blue); }
        .article-breadcrumb span { color: #ccc; }

        /* CATEGORY BADGE */
        .article-category { display: inline-block; padding: 4px 12px; background: var(--blue-lt); color: var(--blue); border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }

        /* TITLE + META */
        .article-title { font-family: 'Playfair Display', serif; font-size: clamp(26px, 3.5vw, 40px); font-weight: 900; line-height: 1.15; margin-bottom: 20px; }
        .article-meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--muted); padding-bottom: 24px; margin-bottom: 32px; border-bottom: 1px solid #e8e8e8; }
        .article-meta-author { font-weight: 700; color: var(--text); }
        .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #ccc; }

        /* BODY */
        .article-body { font-size: 16px; line-height: 1.85; color: #2a2a2a; }
        .article-body p { margin-bottom: 22px; }
        .article-body ul, .article-body ol { padding-left: 24px; margin-bottom: 22px; }
        .article-body li { margin-bottom: 8px; }
        .article-body a { color: var(--blue); text-decoration: underline; }

        /* INLINE DONATE CTA */
        .inline-donate-cta { background: var(--blue-lt); border: 1.5px solid var(--blue); border-radius: 10px; padding: 20px 24px; margin: 36px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .inline-donate-cta p { font-size: 14px; font-weight: 600; color: var(--blue); margin: 0; }
        .inline-donate-cta a { background: var(--blue); color: var(--white); padding: 10px 20px; border-radius: var(--radius); font-size: 13px; font-weight: 700; white-space: nowrap; }

        /* SHARE BAR */
        .share-bar { display: flex; align-items: center; gap: 12px; padding: 24px 0; border-top: 1px solid #e8e8e8; margin-top: 48px; flex-wrap: wrap; }
        .share-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
        .share-btn { padding: 8px 16px; border: 1.5px solid #e0e0e0; border-radius: 99px; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--white); color: var(--text); font-family: inherit; }
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
        .popup-freq-btn { flex: 1; padding: 9px; text-align: center; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--white); border: none; color: var(--muted); font-family: inherit; }
        .popup-freq-btn.active { background: var(--blue); color: var(--white); }
        .popup-amounts { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .popup-pill { flex: 1; min-width: 60px; padding: 8px 6px; border: 1.5px solid #e0e0e0; border-radius: 4px; font-size: 12px; font-weight: 700; text-align: center; cursor: pointer; background: var(--white); color: var(--text); }
        .popup-pill.active { background: var(--blue); color: var(--white); border-color: var(--blue); }
        .popup-custom { display: flex; align-items: center; border: 1.5px solid #e0e0e0; border-radius: var(--radius); overflow: hidden; margin-bottom: 14px; }
        .popup-custom span { padding: 0 10px; font-size: 14px; font-weight: 700; color: var(--muted); background: var(--gray); height: 38px; display: flex; align-items: center; border-right: 1px solid #e0e0e0; }
        .popup-custom input { flex: 1; padding: 0 10px; height: 38px; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .popup-email { width: 100%; padding: 10px 12px; border: 1.5px solid #e0e0e0; border-radius: var(--radius); font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; margin-bottom: 14px; }
        .popup-donate-btn { width: 100%; padding: 12px; background: var(--blue); color: var(--white); border: none; border-radius: var(--radius); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }
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
        .bank-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 999; align-items: center; justify-content: center; }
        .bank-modal-inner { background: #fff; border-radius: 14px; padding: 40px; max-width: 460px; width: 90%; position: relative; box-shadow: 0 24px 64px rgba(0,0,0,.2); }

        /* FOOTER */
        footer { background: var(--white); border-top: 1px solid #e8e8e8; padding: 64px 0 32px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .footer-brand-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .footer-brand-logo img { width: 36px; height: 36px; object-fit: contain; border-radius: 50%; }
        .footer-brand-name { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 15px; }
        .footer-desc { font-size: 13px; color: var(--muted); line-height: 1.7; max-width: 220px; margin-bottom: 20px; }
        .footer-socials { display: flex; gap: 14px; }
        .footer-socials a { width: 32px; height: 32px; border-radius: 50%; background: var(--gray); display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--text); }
        .footer-socials a:hover { background: var(--blue); color: var(--white); }
        .footer-col h4 { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 16px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col ul li a { font-size: 13px; color: var(--muted); }
        .footer-col ul li a:hover { color: var(--blue); }
        .footer-bottom { border-top: 1px solid #e8e8e8; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .footer-bottom p { font-size: 12px; color: var(--muted); }
        .footer-glory { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .article-wrap { grid-template-columns: 1fr; }
          .article-sidebar { position: static; }
          .nav-links { display: none; }
          .related-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .hamburger { display: flex; }
        }
      `}</style>

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
              <Link href="/blog">Blog</Link>
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
          <Link href="/blog">Blog</Link>
          <a href="/orphanages">Visit</a>
          <a href="/volunteer">Volunteer</a>
          <a href="/partner">Partner</a>
          <a href="/about">About</a>
          <a href="/#contact">Contact</a>
          <a href="/donate" className="mobile-donate-btn">Donate Now</a>
        </div>
      </nav>

      {/* HERO IMAGE */}
      {post.imageUrl && (
        <div className="article-hero-img">
          <img
            src={`${post.imageUrl}?w=1440&auto=format`}
            alt={post.title}
          />
        </div>
      )}

      {/* ARTICLE + SIDEBAR */}
      <div className="article-wrap">

        {/* MAIN */}
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
            <span className="article-meta-author">Author: {post.authorName ?? 'NextGEM Team'}</span>
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
            <a href="/donate">Donate Now ›</a>
          </div>

          {/* Share bar */}
          <div className="share-bar">
            <span className="share-label">Share</span>
            <button className="share-btn" id="share-twitter">𝕏</button>
            <button className="share-btn" id="share-facebook">f</button>
            <button className="share-btn" id="share-linkedin">in</button>
            <button className="share-btn" id="share-whatsapp">WhatsApp</button>
            <button className="share-btn" id="share-copy">Copy Link</button>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="related">
              <h3>More Stories</h3>
              <div className="related-grid">
                {related.map((p: any) => (
                  <Link key={p.slug.current} href={`/blog/${p.slug.current}`} className="related-card">
                    <div className="related-img">
                      {p.imageUrl && <img src={`${p.imageUrl}?w=300&auto=format`} alt={p.title} loading="lazy" />}
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

          {/* Donation card */}
          <div className="donate-popup-card" id="donate-card">
            <button className="popup-close" id="popup-close-btn">×</button>
            <h4>Your Donation Can Save<br /><em>An Orphan&apos;s Future</em></h4>
            <p className="popup-subtitle">
              You&apos;re making a <span id="popup-freq-label">monthly</span> donation of{' '}
              <span>₦</span><span id="popup-amount-display">5,000</span>
            </p>
            <div className="popup-freq">
              <button className="popup-freq-btn active" id="freq-monthly">Monthly</button>
              <button className="popup-freq-btn" id="freq-onetime">One-Time</button>
            </div>
            <div className="popup-amounts">
              <div className="popup-pill" id="amt-2500">₦2,500</div>
              <div className="popup-pill active" id="amt-5000">₦5,000</div>
              <div className="popup-pill" id="amt-10000">₦10,000</div>
              <div className="popup-pill" id="amt-other">Other</div>
            </div>
            <div className="popup-custom">
              <span>₦</span>
              <input type="number" id="popup-custom-amt" placeholder="Enter other amount" />
            </div>
            <input type="email" className="popup-email" id="popup-email" placeholder="Your email address *" />
            <button className="popup-donate-btn" id="popup-donate-btn">♥ Donate Now</button>
            <div className="popup-logos">
              <span>VISA</span><span>PayPal</span><span>GPay</span><span>APay</span>
            </div>
            <p className="popup-secure">🔒 Your donation is processed securely</p>
          </div>

          {/* About */}
          <div className="sidebar-about">
            <h4>About NextGEM</h4>
            <p>NextGEM Foundation provides structured support, educational funding, and talent platforms for orphaned children across Nigeria.</p>
            <a href="/about">Learn more →</a>
          </div>

          {/* Recent posts */}
          {sidebar.length > 0 && (
            <div className="sidebar-recent">
              <h4>Recent Stories</h4>
              {sidebar.map((p: any) => (
                <div key={p.slug.current} className="sidebar-post">
                  <div className="sidebar-post-img">
                    {p.imageUrl && <img src={`${p.imageUrl}?w=112&auto=format`} alt={p.title} loading="lazy" />}
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
      <div className="bank-modal" id="bank-modal">
        <div className="bank-modal-inner">
          <button id="close-bank-modal" style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#555' }}>×</button>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏦</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Make a Bank Transfer</h2>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>Please transfer directly to this account:</p>
          </div>
          <div style={{ background: '#eef3fd', border: '1.5px solid #1D56E8', borderRadius: 10, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>Bank</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>UBA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>Account Number</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#1D56E8' }}>2085268432</span>
                <button id="copy-acct-btn" style={{ background: '#1D56E8', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Copy</button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>Account Name</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Victoria Kiolawson</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>Your Amount</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1D56E8' }} id="modal-amount">—</span>
            </div>
          </div>
          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
              <strong style={{ color: '#1a1a1a' }}>After transferring:</strong><br />
              Send your name and receipt to{' '}
              <a href="mailto:nextgemfoundation@gmail.com" style={{ color: '#1D56E8', fontWeight: 600 }}>nextgemfoundation@gmail.com</a>
            </p>
          </div>
          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
            🔒 Personal account held by the Foundation&apos;s founder on behalf of NextGEM Foundation.
          </p>
        </div>
      </div>

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
                <li><Link href="/blog">Share the Story</Link></li>
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

      {/* CLIENT-SIDE SCRIPTS */}
      <script dangerouslySetInnerHTML={{ __html: `
        // Hamburger
        var hbtn = document.getElementById('hamburger');
        var hmenu = document.getElementById('mobile-menu');
        if (hbtn && hmenu) {
          hbtn.addEventListener('click', function() {
            var open = hmenu.style.display === 'flex';
            hmenu.style.display = open ? 'none' : 'flex';
            document.body.style.overflow = open ? '' : 'hidden';
          });
        }

        // Donation widget
        var popupAmount = 5000;
        var popupFreq = 'monthly';

        function setFreq(freq) {
          popupFreq = freq;
          document.getElementById('popup-freq-label').textContent = freq;
          document.getElementById('freq-monthly').classList.toggle('active', freq === 'monthly');
          document.getElementById('freq-onetime').classList.toggle('active', freq === 'one-time');
        }
        function selectAmt(amt) {
          popupAmount = amt;
          ['2500','5000','10000','other'].forEach(function(a) {
            document.getElementById('amt-' + a).classList.remove('active');
          });
          document.getElementById('amt-' + (amt === 0 ? 'other' : amt)).classList.add('active');
          if (amt === 0) document.getElementById('popup-custom-amt').focus();
          document.getElementById('popup-amount-display').textContent = popupAmount.toLocaleString();
        }

        document.getElementById('freq-monthly').addEventListener('click', function() { setFreq('monthly'); });
        document.getElementById('freq-onetime').addEventListener('click', function() { setFreq('one-time'); });
        document.getElementById('amt-2500').addEventListener('click', function() { selectAmt(2500); });
        document.getElementById('amt-5000').addEventListener('click', function() { selectAmt(5000); });
        document.getElementById('amt-10000').addEventListener('click', function() { selectAmt(10000); });
        document.getElementById('amt-other').addEventListener('click', function() { selectAmt(0); });
        document.getElementById('popup-custom-amt').addEventListener('input', function() {
          popupAmount = parseFloat(this.value) || 0;
          document.getElementById('popup-amount-display').textContent = popupAmount.toLocaleString();
        });

        // Donate button → bank modal
        document.getElementById('popup-donate-btn').addEventListener('click', function() {
          var email = document.getElementById('popup-email').value.trim();
          if (!email || !email.includes('@')) { alert('Please enter a valid email address.'); return; }
          if (!popupAmount || popupAmount < 100) { alert('Minimum donation is ₦100.'); return; }
          document.getElementById('modal-amount').textContent = '₦' + popupAmount.toLocaleString();
          document.getElementById('bank-modal').style.display = 'flex';
          document.body.style.overflow = 'hidden';
        });

        // Close donate card
        document.getElementById('popup-close-btn').addEventListener('click', function() {
          document.getElementById('donate-card').style.display = 'none';
        });

        // Bank modal close
        document.getElementById('close-bank-modal').addEventListener('click', function() {
          document.getElementById('bank-modal').style.display = 'none';
          document.body.style.overflow = '';
        });
        document.getElementById('bank-modal').addEventListener('click', function(e) {
          if (e.target === this) { this.style.display = 'none'; document.body.style.overflow = ''; }
        });

        // Copy account number
        document.getElementById('copy-acct-btn').addEventListener('click', function() {
          navigator.clipboard.writeText('2085268432').then(function() {
            var btn = document.getElementById('copy-acct-btn');
            btn.textContent = 'Copied!'; btn.style.background = '#16a34a';
            setTimeout(function() { btn.textContent = 'Copy'; btn.style.background = '#1D56E8'; }, 2000);
          });
        });

        // Share buttons
        document.getElementById('share-twitter').addEventListener('click', function() {
          window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(document.title), '_blank');
        });
        document.getElementById('share-facebook').addEventListener('click', function() {
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href), '_blank');
        });
        document.getElementById('share-linkedin').addEventListener('click', function() {
          window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href), '_blank');
        });
        document.getElementById('share-whatsapp').addEventListener('click', function() {
          window.open('https://wa.me/?text=' + encodeURIComponent(document.title + ' ' + location.href), '_blank');
        });
        document.getElementById('share-copy').addEventListener('click', function() {
          navigator.clipboard.writeText(location.href).then(function() { alert('Link copied!'); });
        });
      `}} />
    </>
  )
}