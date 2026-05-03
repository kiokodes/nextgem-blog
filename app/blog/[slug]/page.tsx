import { notFound } from 'next/navigation'
import { client } from '../../lib/sanity'
import BlogPostClient from './BlogPostClient'
import type { Metadata } from 'next'

async function getPost(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      title, publishedAt, body, metaDescription,
      "authorName": author->name,
      "categoryTitle": categories[0]->title,
      "imageUrl": mainImage.asset->url
    }`,
    { slug }
  )
}

async function getRecent(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current != $slug] | order(publishedAt desc) [0..3] {
      title, slug, publishedAt, "imageUrl": mainImage.asset->url
    }`,
    { slug }
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

export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == "post"]{ "slug": slug.current }`)
  return posts.map((p: { slug: string }) => ({ slug: p.slug }))
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, recent] = await Promise.all([getPost(slug), getRecent(slug)])
  if (!post) notFound()
  return <BlogPostClient post={post} recent={recent ?? []} slug={slug} />
}