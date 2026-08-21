import fs from 'fs';
import path from 'path';

// Define the static routes and their priorities
const staticRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/courses', changefreq: 'daily', priority: 0.9 },
  { url: '/lms', changefreq: 'weekly', priority: 0.8 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.6 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', changefreq: 'yearly', priority: 0.3 },
];

const generateSitemap = () => {
  const baseUrl = 'https://www.kaizenq.in';
  
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static routes
  staticRoutes.forEach((route) => {
    sitemapContent += `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
  });

  // Extract dynamic course routes from courseService.ts
  const courseServicePath = path.join(__dirname, '../../../frontend/src/services/courseService.ts');
  if (fs.existsSync(courseServicePath)) {
    const courseServiceContent = fs.readFileSync(courseServicePath, 'utf8');
    const slugRegex = /slug:\s*'([^']+)'/g;
    let match;
    const addedSlugs = new Set();

    while ((match = slugRegex.exec(courseServiceContent)) !== null) {
      const slug = match[1];
      if (!addedSlugs.has(slug)) {
        addedSlugs.add(slug);
        sitemapContent += `  <url>
    <loc>${baseUrl}/course/${slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      }
    }
  } else {
    console.warn(`Could not find courseService.ts at ${courseServicePath}`);
  }

  sitemapContent += `</urlset>`;

  const outputPath = path.join(__dirname, '../../../frontend/public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapContent, 'utf8');
  console.log(`Sitemap successfully generated at: ${outputPath}`);
};

generateSitemap();
