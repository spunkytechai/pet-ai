import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pet-ai-chi.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/analyze', '/history', '/pet/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
