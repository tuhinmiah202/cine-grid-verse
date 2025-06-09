const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = 'https://movieshubbd.onrender.com';

const visited = new Set();

async function crawl(url) {
  if (visited.has(url)) return [];
  visited.add(url);
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const links = new Set();
    $('a[href]').each((_, a) => {
      let href = $(a).attr('href');
      if (href && href.startsWith('/')) {
        const fullUrl = new URL(href, BASE_URL).toString();
        if (!visited.has(fullUrl)) {
          links.add(fullUrl);
        }
      }
    });
    return Array.from(links);
  } catch (err) {
    console.error(`Error crawling ${url}:`, err.message);
    return [];
  }
}

async function buildSitemap() {
  visited.clear();
  const queue = [BASE_URL];
  const urls = [];

  while (queue.length) {
    const current = queue.shift();
    urls.push(current);
    const newLinks = await crawl(current);
    queue.push(...newLinks);
  }

  const xmlUrls = urls.map(url => `
    <url>
      <loc>${url}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${xmlUrls}
  </urlset>`;
}

app.use(express.static(path.join(__dirname, '../client/dist'))); // Serve frontend

app.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await buildSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error generating sitemap');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
