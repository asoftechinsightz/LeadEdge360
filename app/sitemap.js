const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asoftechinsightz.com'



const ROUTES = [

  '',

  '/about',

  '/company',

  '/solutions',

  '/services',

  '/industries',

  '/pricing',

  '/products',

  '/products/leadedge360',

  '/products/retailedge360',

  '/products/trinetra360',

  '/book-demo',

  '/customers',

  '/resources',

  '/blog',

  '/contact',

  '/growth-audit',

  '/partners',

  '/privacy',

  '/terms',

  '/refund-policy',

  '/cancellation-policy',

  '/cookie-policy',

  '/shipping-delivery',

  '/acceptable-use',

  '/download',

]



export default function sitemap() {

  const lastModified = new Date()

  return ROUTES.map((path) => ({

    url: `${SITE_URL}${path}`,

    lastModified,

    changeFrequency: path === '' ? 'weekly' : 'monthly',

    priority: path === '' ? 1 : path.startsWith('/products') ? 0.9 : 0.7,

  }))

}

