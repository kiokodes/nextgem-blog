import { MetadataRoute } from 'next'
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: '6l4myqih',
  dataset:'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published blog posts from Sanity
  const posts = await client.fetch(`
    *[_type == "post" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `)

  const postUrls = posts.map((post: { slug: string; _updatedAt: string }) => ({
    url: `https://blog.nextgemfoundation.com/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    priority: 0.6,
  }))

  return [
    {
      url: 'https://blog.nextgemfoundation.com',
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: 'https://blog.nextgemfoundation.com/blog',
      lastModified: new Date(),
      priority: 0.7,
    },
    ...postUrls,
  ]
}