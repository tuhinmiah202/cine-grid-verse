const express = require('express');
const next = require('next');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Example URLs to include in your sitemap
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  // Add dynamic URLs here as needed
];

app.prepare().then(() => {
  const server = express();

  server.get('/sitemap.xml', async (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    const stream = new SitemapStream({ hostname: 'https://movieshubbd.onrender.com' });
    const xmlString = await streamToPromise(Readable.from(links).pipe(stream)).then(data => data.toString());
    res.send(xmlString);
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
