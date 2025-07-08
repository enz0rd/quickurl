/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.quickurl.com.br', // ✅ Troque para a URL real do seu site
    generateRobotsTxt: true, // ✅ Gera o robots.txt também
    changefreq: 'weekly',
    priority: 0.7,
    sitemapSize: 5000,
    exclude: ['/api'], // ❌ Páginas que você não quer incluir
  };