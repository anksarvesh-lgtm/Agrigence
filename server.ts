import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import cron from 'node-cron';
import { whatsappRouter } from './src/server/whatsapp/api.ts';
import { mandiPrices, schemes, cropAdvisory } from './src/data/agrigence_engine.ts';
import { processAndSaveMandiPage, MandiDataInput, processAndSaveDailyBlog } from './src/server/autoContentGenerator.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const projectId = 'gen-lang-client-0276037966';

  // Helper to fetch document
  async function getDoc(collection: string, id: string) {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    const doc: any = {};
    if (data.fields) {
      for (const [key, value] of Object.entries(data.fields)) {
        doc[key] = (value as any).stringValue || (value as any).integerValue || (value as any).booleanValue;
      }
    }
    return doc;
  }

  // Helper to inject meta tags and Schema
  function injectMeta(htmlContent: string, { title, description, image, url, schema, keywords }: { title: string, description: string, image: string, url: string, schema?: any, keywords?: string }) {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Agrigence",
      "url": "https://agrigence.in",
      "logo": "https://agrigence.in/logo.png"
    };

    const combinedSchemas = schema 
      ? (Array.isArray(schema) ? [orgSchema, ...schema] : [orgSchema, schema])
      : [orgSchema];

    let metaTags = `
    <title data-rh="true">${title} | Agrigence</title>
    <meta data-rh="true" name="robots" content="index, follow">
    <meta data-rh="true" name="description" content="${description}"/>
    <meta data-rh="true" name="keywords" content="${keywords || 'agriculture, farming, agritech, india, mandi bhav, gov schemes'}"/>
    <meta data-rh="true" property="og:title" content="${title} | Agrigence"/>
    <meta data-rh="true" property="og:description" content="${description}"/>
    <meta data-rh="true" property="og:image" content="${image}"/>
    <meta data-rh="true" property="og:url" content="${url}"/>
    <meta data-rh="true" property="og:type" content="website"/>
    <meta data-rh="true" name="twitter:card" content="summary_large_image"/>
    <meta data-rh="true" name="twitter:title" content="${title} | Agrigence"/>
    <meta data-rh="true" name="twitter:description" content="${description}"/>
    <meta data-rh="true" name="twitter:image" content="${image}"/>
    <link data-rh="true" rel="canonical" href="${url}" />
    ${combinedSchemas.map(s => `<script data-rh="true" type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
    `;

    return htmlContent
      .replace(/<title[^>]*>.*?<\/title>/g, '')
      .replace(/<meta[^>]*name="robots"[^>]*\/?>/g, '')
      .replace(/<meta[^>]*name="description"[^>]*\/?>/g, '')
      .replace(/<meta[^>]*name="keywords"[^>]*\/?>/g, '')
      .replace(/<meta[^>]*property="og:[^"]*"[^>]*\/?>/g, '')
      .replace(/<meta[^>]*name="twitter:[^"]*"[^>]*\/?>/g, '')
      .replace(/<link[^>]*rel="canonical"[^>]*\/?>/g, '')
      .replace(/<script[^>]*type="application\/ld\+json"[^>]*>.*?<\/script>/g, '')
      .replace('</head>', `${metaTags}</head>`);
  }

  // --- Automation Cron Jobs ---
  
  // 1. Mandi Bhav Update: 6:00 AM Daily
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily Mandi Bhav content update...');
    try {
      const sampleMandiUpdate: MandiDataInput = {
        city: 'Neemuch',
        state: 'Madhya Pradesh',
        crop: 'Soybean',
        min_price: 4300,
        max_price: 4950,
        arrival: '3200 Quintals',
        date: new Date().toISOString().split('T')[0]
      };
      await processAndSaveMandiPage(sampleMandiUpdate);
    } catch (err) {
      console.error('Mandi cron job failed:', err);
    }
  });

  // 2. Daily Trending Blog Generator: 7:00 AM Daily
  cron.schedule('0 7 * * *', async () => {
    console.log('Running daily Trending Blog generation...');
    try {
      await processAndSaveDailyBlog();
    } catch (err) {
      console.error('Blog cron job failed:', err);
    }
  });

  // API routes
  app.use(express.json());

  // Manual trigger endpoint for testing
  app.post('/api/admin/generate-daily-blog', async (req, res) => {
    try {
      // In production, add auth check here
      await processAndSaveDailyBlog();
      res.json({ message: 'Blog generation process started successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/trigger-mandi-update', async (req, res) => {
    try {
      // For now we just trigger one sample, but in real case it would loop through all cities
      const sampleMandiUpdate: MandiDataInput = {
        city: 'Neemuch',
        state: 'Madhya Pradesh',
        crop: 'Soybean',
        min_price: 4300,
        max_price: 4950,
        arrival: '3200 Quintals',
        date: new Date().toISOString().split('T')[0]
      };
      await processAndSaveMandiPage(sampleMandiUpdate);
      res.json({ message: 'Mandi update process started successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Allow: /api/
Allow: /mandi-bhav/
Allow: /scheme/
Allow: /crop/

User-agent: GPTBot
Allow: /

Sitemap: https://agrigence.in/sitemap.xml`);
  });

  // === WhatsApp Engine API ===
  app.use('/api/whatsapp', whatsappRouter);

  // Note: AI functionalities have been migrated to the frontend to fix API key issues.
  app.post('/api/chat', (req, res) => {
    res.status(410).json({ error: 'Endpoint migrated to frontend. Use frontend SDK directly.' });
  });

  app.post('/api/extract-scheme-data', (req, res) => {
    res.status(410).json({ error: 'Endpoint migrated to frontend.' });
  });

  // === AI Analysis & Generation Endpoints (Migrated to Frontend) ===
  app.post('/api/ai/analyze-soil', (req, res) => {
    res.status(410).json({ error: 'Endpoint migrated to frontend.' });
  });

  app.post('/api/ai/analyze-weather', (req, res) => {
    res.status(410).json({ error: 'Endpoint migrated to frontend.' });
  });

  app.post('/api/ai/generate-planner-plan', (req, res) => {
    res.status(410).json({ error: 'Endpoint migrated to frontend.' });
  });

  app.post('/api/ai/generate-admin-content', (req, res) => {
    res.status(410).json({ error: 'Endpoint migrated to frontend.' });
  });

  // === Razorpay Integration for Mobile App ===
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'dummy_key';
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
  let razorpayInstance: any = null;

  try {
    const Razorpay = (await import('razorpay')).default;
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  } catch (e) {
    console.warn("Razorpay SDK not installed or configured. Install with: npm install razorpay");
  }

  app.post('/api/mobile/razorpay/create-order', async (req, res) => {
    try {
      if (!razorpayInstance) {
         return res.status(500).json({ error: 'Razorpay SDK is not initialized on the server.' });
      }
      const { amount, currency = "INR", receipt } = req.body;
      
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
        currency,
        receipt: receipt || `receipt_${Date.now()}`
      };
      
      const order = await razorpayInstance.orders.create(options);
      res.json(order);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/mobile/razorpay/verify-payment', async (req, res) => {
    try {
      const crypto = await import('crypto');
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Verify the signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        // Payment is legit
        // NOTE: Here you would typically save the payment record to your database.
        // e.g., await mockBackend.addPaymentRecord(...)
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, error: "Invalid signature" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  // ===========================================

  app.get('/api/mobile/schemes', async (req, res) => {
    try {
      const resData = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/govt_schemes`);
      if (!resData.ok) {
        return res.status(500).json({ error: 'Failed to fetch' });
      }
      const data = await resData.json();
      const docs = data.documents ? data.documents.map((doc: any) => {
        const id = doc.name.split('/').pop();
        const fields: any = {};
        for (const [key, value] of Object.entries((doc.fields as any) || {})) {
           fields[key] = (value as any).stringValue ?? (value as any).integerValue ?? (value as any).booleanValue ?? (value as any).timestampValue;
        }
        return { id, ...fields };
      }) : [];
      res.json(docs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/mobile/farmer-questions', async (req, res) => {
    try {
      const resData = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/farmer_questions`);
      if (!resData.ok) {
        return res.status(500).json({ error: 'Failed to fetch' });
      }
      const data = await resData.json();
      const docs = data.documents ? data.documents.map((doc: any) => {
        const id = doc.name.split('/').pop();
        const fields: any = {};
        for (const [key, value] of Object.entries((doc.fields as any) || {})) {
           fields[key] = (value as any).stringValue ?? (value as any).integerValue ?? (value as any).booleanValue ?? (value as any).timestampValue;
        }
        return { id, ...fields };
      }) : [];
      res.json(docs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

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
      const baseUrl = 'https://agrigence.in';
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
        '/sitemap',
        '/farmer-connect',
        '/govt-schemes',
        '/mobile-app',
        '/kisan',
        '/kisan/mandi',
        '/kisan/ledger',
        '/kisan/sop',
        '/kisan/weather',
        '/kisan/schemes',
        '/kisan/equipment',
        '/kisan/marketplace',
        '/kisan/land',
        '/kisan/dashboard',
        '/kisan/post-requirement',
        '/kisan/my-requirements',
        '/kisan/my-listings',
        '/kisan/list-item',
        '/consultation',
        '/tools/seed-rate',
        '/tools/nutrient-req',
        '/tools/inm-planner',
        '/tools/water-req',
        '/tools/economics',
        '/tools/land-converter',
        '/tools/spray-calculator',
        '/tools/yield-estimator',
        '/tools/kpi-dashboard',
        '/tools/experiment-builder',
        '/tools/plot-dose',
        '/tools/factorial-generator',
        '/tools/climate-analyzer',
        '/tools/anova',
        '/tools/statistical-analysis',
        '/tools/auto-graph'
      ];

      let dynamicRoutes: string[] = [];

      try {
        // Add Mandi Routes
        mandiPrices.forEach(p => dynamicRoutes.push(`/mandi-bhav/${p.city.toLowerCase()}`));
        // Add Scheme Routes
        schemes.forEach(s => dynamicRoutes.push(`/scheme/${s.slug}`));
        // Add Crop Routes
        cropAdvisory.forEach(c => dynamicRoutes.push(`/crop/${c.slug}`));

        // Fetch Blogs (Now in articles collection)
        const blogsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/articles`);
        if (blogsRes.ok) {
          const blogsData = await blogsRes.json();
          if (blogsData.documents) {
            blogsData.documents.forEach((doc: any) => {
              const id = doc.name.split('/').pop();
              // Only include if it's a blog type
              if (doc.fields?.type?.stringValue === 'BLOG') {
                dynamicRoutes.push(`/blog/${id}`);
              }
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
    const indexPath = path.join(distPath, 'index.html');
    app.use(express.static(distPath));
    
    app.get('*all', async (req, res) => {
      let html = fs.readFileSync(indexPath, 'utf8');
      
      const blogMatch = req.path.match(/^\/blog\/(.+)$/);
      const newsMatch = req.path.match(/^\/news\/(.+)$/);
      const mandiMatch = req.path.match(/^\/mandi-bhav\/(.+)$/);
      const schemeMatch = req.path.match(/^\/scheme\/(.+)$/);
      const cropMatch = req.path.match(/^\/crop\/(.+)$/);
      
      if (blogMatch || newsMatch) {
        const collection = blogMatch ? 'articles' : 'news';
        const id = blogMatch ? blogMatch[1] : newsMatch![1];
        const doc = await getDoc(collection, id);
        if (doc) {
          const title = doc.title || 'Agrigence';
          const description = (doc.content || doc.description || '').substring(0, 150);
          const image = doc.featuredImage || doc.thumbnail || 'https://www.agrigence.in/logo.png';
          html = injectMeta(html, { title, description, image, url: `https://agrigence.in${req.path}` });
        }
      } else if (mandiMatch) {
        const city = mandiMatch[1];
        const price = mandiPrices.find(p => p.city.toLowerCase() === city.toLowerCase());
        if (price) {
          const dateStr = new Date().toISOString().split('T')[0];
          const title = `${price.city} Mandi Bhav Today (${dateStr}) | Latest ${price.crop} Prices`;
          const description = `Today's latest Mandi Bhav for ${price.city} as of ${dateStr}. Current ${price.crop} price: ₹${price.min_price} - ₹${price.max_price}. Get real-time price trends and arrivals at Agrigence.`;
          const schema = {
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": `${price.city} ${price.crop} Market Prices`,
            "description": description,
            "url": `https://agrigence.in${req.path}`,
            "publisher": { "@type": "Organization", "name": "Agrigence" }
          };
          html = injectMeta(html, { title, description, image: 'https://agrigence.in/mandi-meta.jpg', url: `https://agrigence.in${req.path}`, schema });
        }
      } else if (schemeMatch) {
        const slug = schemeMatch[1];
        const scheme = schemes.find(s => s.slug === slug);
        if (scheme) {
          const title = `${scheme.name} Eligibility & Benefits`;
          const description = scheme.benefits.substring(0, 160);
          const schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "publisher": { "@type": "Organization", "name": "Agrigence" }
          };
          html = injectMeta(html, { title, description, image: 'https://agrigence.in/scheme-meta.jpg', url: `https://agrigence.in${req.path}`, schema });
        }
      } else if (cropMatch) {
        const slug = cropMatch[1];
        const crop = cropAdvisory.find(c => c.slug === slug);
        if (crop) {
          const title = `${crop.name} Cultivation Guide & Advisory`;
          const description = `Learn how to grow ${crop.name} with Agrigence. Best soil: ${crop.soil_type}, Season: ${crop.season}. Direct answer to yield optimization.`;
          html = injectMeta(html, { title, description, image: 'https://agrigence.in/crop-meta.jpg', url: `https://agrigence.in${req.path}` });
        }
      } else if (req.path === '/' || req.path === '') {
        html = injectMeta(html, { 
          title: 'Agricultural Intelligence & Education Platform', 
          description: 'Smart agricultural tools, academic resources, and research insights for farmers and students. Optimize your farming and studies with data-driven decisions.', 
          image: 'https://agrigence.in/logo.png', 
          url: 'https://agrigence.in' 
        });
      } else if (req.path === '/about-contact') {
        html = injectMeta(html, { 
          title: 'About Us & Contact', 
          description: 'Learn about Agrigence, our mission, leadership, and how to get in touch with our team.', 
          image: 'https://agrigence.in/logo.png', 
          url: 'https://agrigence.in/about-contact' 
        });
      }
      
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
