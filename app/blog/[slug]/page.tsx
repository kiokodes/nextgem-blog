import { Metadata } from 'next'
import { createClient } from 'next-sanity'
import BlogPostClient from './BlogPostClient'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2021-10-21',
  useCdn: true,
})

export const revalidate = 3600

// ✅ Pre-renders all posts at build time
export async function generateStaticParams() {
  const posts = await client.fetch(`
    *[_type == "post" && defined(slug.current)] {
      "slug": slug.current
    }
  `)
  return posts.map((post: { slug: string }) => ({ slug: post.slug }))
}

// ✅ Auto SEO metadata per post
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      title,
      metaDescription,
      "image": mainImage.asset->url
    }
  `, { slug: params.slug })

  if (!post) return {}

  return {
    title: `${post.title} | NextGem Foundation Blog`,
    description: post.metaDescription,
    openGraph: {
      title: `${post.title} | NextGem Foundation Blog`,
      description: post.metaDescription,
      url: `https://blog.nextgemfoundation.com/blog/${params.slug}`,
      siteName: 'NextGem Foundation',
      images: post.image
        ? [{ url: post.image, width: 1200, height: 630, alt: post.title }]
        : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | NextGem Foundation Blog`,
      description: post.metaDescription,
      images: post.image ? [post.image] : [],
    },
  }
}

// ✅ Fetch data server-side, pass to client component
export default async function BlogPostPage(
  { params }: { params: { slug: string } }
) {
  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      title, publishedAt, body, metaDescription,
      "authorName": author->name,
      "categoryTitle": categories[0]->title,
      "imageUrl": mainImage.asset->url
    }
  `, { slug: params.slug })

  const recent = await client.fetch(`
    *[_type == "post" && slug.current != $slug] | order(publishedAt desc) [0..3] {
      title, slug, publishedAt, "imageUrl": mainImage.asset->url
    }
  `, { slug: params.slug })

  if (!post) return <div>Post not found</div>

  return <BlogPostClient post={post} recent={recent} slug={params.slug} />
}