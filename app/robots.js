const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asoftechinsightz.com'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/leadedge360', '/retailedge360', '/portal/', '/ops/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
