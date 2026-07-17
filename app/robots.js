export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: 'https://jobportal-topaz-nine.vercel.app/sitemap.xml',
  }
}