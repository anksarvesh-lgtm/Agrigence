import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SEO Helper Functions ---
async function fetchArticles() {
  try {
    const response = await fetch('https://firestore.googleapis.com/v1/projects/gen-lang-client-0276037966/databases/(default)/documents/articles');
    if (!response.ok) return [];
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

async function fetchArticle(slug: string) {
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/gen-lang-client-0276037966/databases/(default)/documents/articles/${slug}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

async function fetchSiteIdentity() {
  try {
    const response = await fetch('https://firestore.googleapis.com/v1/projects/gen-lang-client-0276037966/databases/(default)/documents/site_identity/global');
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching site identity:", error);
    return null;
  }
}

function escapeHtml(unsafe: string) {
  return (unsafe || '').replace(/[&<"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}
// ----------------------------

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SHIcdrtKQLFYHv",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "zapH3GUcbswAUneaU9VA9SV2",
  });

  // API routes
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, planId, userId } = req.body;
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          planId,
          userId,
        },
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay Order Creation Error:", error);
      res.status(500).json({ error: "Failed to create order", details: error.message });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body;
      const key_secret = process.env.RAZORPAY_KEY_SECRET || "zapH3GUcbswAUneaU9VA9SV2";

      const generated_signature = crypto
        .createHmac("sha256", key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature === razorpay_signature) {
        res.json({ status: "success" });
      } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
      }
    } catch (error: any) {
      console.error("Razorpay Verification Error:", error);
      res.status(500).json({ error: "Verification failed", details: error.message });
    }
  });

  // --- SEO Routes ---
  
  // 5. robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: https://www.agrigence.in/sitemap.xml`);
  });

  // 4. sitemap.xml
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const articles = await fetchArticles();
      let urls = '';
      
      const staticRoutes = ['/', '/about', '/submit', '/editorial-board'];
      for (const route of staticRoutes) {
        urls += `
  <url>
    <loc>https://www.agrigence.in${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
      }

      for (const article of articles) {
        const slug = article.name.split('/').pop();
        const updateTime = article.updateTime || new Date().toISOString();
        urls += `
  <url>
    <loc>https://www.agrigence.in/article/${slug}</loc>
    <lastmod>${updateTime}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      res.status(500).end();
    }
  });

  // 1, 2, 3, 6. HTML Injection Middleware
  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom to handle HTML ourselves
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files EXCEPT index.html
    app.use(express.static("dist", { index: false }));
  }

  app.use(async (req, res, next) => {
    // Only intercept GET requests that accept HTML
    if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
      return next();
    }

    try {
      let template = '';
      if (process.env.NODE_ENV !== "production") {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');
      }

      const canonicalUrl = `https://www.agrigence.in${req.path}`;
      let injectedTags = `\n    <!-- SEO Injections -->\n    <link rel="canonical" href="${canonicalUrl}" />\n`;

      let html = template;

      const siteIdentity = await fetchSiteIdentity();
      const logoUrl = siteIdentity?.fields?.logoUrl?.stringValue || 'https://www.agrigence.in/logo.png';
      
      html = html.replace(/<link id="dynamic-favicon".*?>/i, '');
      html = html.replace(/<meta property="og:image".*?>/i, '');
      html = html.replace(/<meta name="twitter:image".*?>/i, '');

      injectedTags += `    <link id="dynamic-favicon" rel="icon" type="image/png" href="${escapeHtml(logoUrl)}" />\n`;
      injectedTags += `    <meta property="og:image" content="${escapeHtml(logoUrl)}">\n`;
      injectedTags += `    <meta name="twitter:image" content="${escapeHtml(logoUrl)}">\n`;

      if (req.path === '/') {
        // Remove existing tags
        html = html.replace(/<title>.*?<\/title>/i, '');
        html = html.replace(/<meta name="description" content=".*?">/i, '');
        html = html.replace(/<meta property="og:title" content=".*?">/i, '');
        html = html.replace(/<meta property="og:description" content=".*?">/i, '');

        injectedTags += `    <title>Agrigence - International Agriculture Journal</title>
    <meta name="description" content="Agrigence is an international platform for agricultural research, innovation, and scholarly publication connecting authors, reviewers, and institutions worldwide.">
    <meta property="og:title" content="Agrigence - Global Agricultural Research & Publication">
    <meta property="og:description" content="Join the premier international ecosystem for agricultural knowledge, research publishing, and global innovation.">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Agrigence",
      "url": "https://www.agrigence.in/"
    }
    </script>\n`;
      } else if (req.path.startsWith('/article/') || req.path.startsWith('/view-document/')) {
        const slug = req.path.split('/').pop();
        if (slug) {
          const articleData = await fetchArticle(slug);
          if (articleData && articleData.fields) {
            // Remove existing tags
            html = html.replace(/<title>.*?<\/title>/i, '');
            html = html.replace(/<meta name="description" content=".*?">/i, '');
            html = html.replace(/<meta property="og:title" content=".*?">/i, '');
            html = html.replace(/<meta property="og:description" content=".*?">/i, '');

            const title = escapeHtml(articleData.fields.title?.stringValue || 'Article');
            let rawAbstract = articleData.fields.abstract?.stringValue || articleData.fields.content?.stringValue || '';
            const abstract = escapeHtml(rawAbstract.substring(0, 160).replace(/\n/g, ' '));
            const authorName = escapeHtml(articleData.fields.authorName?.stringValue || 'Unknown');
            const datePublished = escapeHtml(articleData.fields.submissionDate?.stringValue || articleData.createTime || '');

            injectedTags += `    <title>${title} | Agrigence</title>
    <meta name="description" content="${abstract}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${abstract}">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": "${title}",
      "author": {
        "@type": "Person",
        "name": "${authorName}"
      },
      "datePublished": "${datePublished}",
      "description": "${abstract}",
      "url": "https://www.agrigence.in/article/${slug}"
    }
    </script>\n`;
          }
        }
      }

      // Inject before </head>
      html = html.replace('</head>', `${injectedTags}  </head>`);
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
