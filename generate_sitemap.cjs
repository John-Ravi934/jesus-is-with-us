const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.VITE_SITE_URL || 'https://jesusiswithuschurch.vercel.app';
const SITEMAP_PATH = path.join(__dirname, 'public', 'sitemap.xml');

// List of static routes in the React application
const staticRoutes = [
  '/',
  '/about',
  '/ministries',
  '/fellowship',
  '/rhema',
  '/gallery',
  '/resources',
  '/contact',
  '/donate'
];

function generateSitemap() {
  const currentDate = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static routes
  staticRoutes.forEach(route => {
    // Priority logic: Home is 1.0, important pages 0.8, others 0.6
    let priority = "0.8";
    let changefreq = "weekly";
    
    if (route === '/') {
      priority = "1.0";
      changefreq = "daily";
    } else if (['/rhema', '/gallery', '/resources'].includes(route)) {
      priority = "0.9";
      changefreq = "daily";
    }

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`✅ Sitemap successfully generated at ${SITEMAP_PATH}`);
}

generateSitemap();
