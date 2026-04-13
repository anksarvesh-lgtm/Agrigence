import express from 'express';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.use(express.json());

  app.get('/api/projects', (req, res) => {
    res.json([{ id: '1', name: 'Agriculture Data Analysis' }]);
  });

  app.post('/api/pipelines', (req, res) => {
    res.status(201).json({ id: '1', ...req.body });
  });

  app.get('/ads.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send('google.com, pub-7206167612469004, DIRECT, f08c47fec0942fa0');
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = 'https://www.agrigence.in';
      const projectId = 'gen-lang-client-0276037966';
      
      const staticRoutes = [
        '',
        '/about-contact',
        '/tools',
        '/blogs',
        '/journals',
        '/products',
        '/submission',
        '/subscription',
        '/terms',
        '/privacy',
        '/author-guidelines',
        '/sitemap'
      ];

      let dynamicRoutes: string[] = [];

      try {
        // Fetch Blogs
        const blogsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blogs`);
        if (blogsRes.ok) {
          const blogsData = await blogsRes.json();
          if (blogsData.documents) {
            blogsData.documents.forEach((doc: any) => {
              const id = doc.name.split('/').pop();
              dynamicRoutes.push(`/blog/${id}`);
            });
          }
        }

        // Fetch News
        const newsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/news`);
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          if (newsData.documents) {
            newsData.documents.forEach((doc: any) => {
              const id = doc.name.split('/').pop();
              dynamicRoutes.push(`/news/${id}`);
            });
          }
        }

        // Fetch Products
        const productsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData.documents) {
            productsData.documents.forEach((doc: any) => {
              const id = doc.name.split('/').pop();
              dynamicRoutes.push(`/product/${id}`);
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch dynamic routes for sitemap", e);
      }

      const allRoutes = [...staticRoutes, ...dynamicRoutes];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>${staticRoutes.includes(route) ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : (staticRoutes.includes(route) ? '0.8' : '0.6')}</priority>
  </url>`).join('')}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
