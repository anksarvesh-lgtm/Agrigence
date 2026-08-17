import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import cron from 'node-cron';
import { whatsappRouter } from './src/server/whatsapp/api.ts';
import { mandiPrices, schemes, cropAdvisory } from './src/data/agrigence_engine.ts';
import { processAndSaveMandiPage, MandiDataInput, processAndSaveDailyBlog } from './src/server/autoContentGenerator.ts';
import { GoogleGenAI } from "@google/genai";
import { put, del } from '@vercel/blob';
import multer from 'multer';
import * as dotenv from 'dotenv';
// Security enhancement: Require admin authentication for all /api/admin/* endpoints
import { requireAdminAuth } from './src/middleware/auth.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Multer setup for memory storage
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
  const projectId = 'gen-lang-client-0276037966';
  const databaseId = '(default)';

  // Helper to fetch document
  async function getDoc(collection: string, id: string) {
    try {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collection}/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      const doc: any = {};
      if (data.fields) {
        for (const [key, value] of Object.entries(data.fields)) {
          doc[key] = (value as any).stringValue || (value as any).integerValue || (value as any).booleanValue;
        }
      }
      return doc;
    } catch (err) {
      console.error(`Error fetching meta doc ${collection}/${id}:`, err);
      return null;
    }
  }

  // Helper to inject meta tags and Schema
  function injectMeta(htmlContent: string, { title, description, image, url, schema, keywords, host }: { title: string, description: string, image: string, url: string, schema?: any, keywords?: string, host?: string }) {
    const baseUrl = host ? `https://${host}` : 'https://www.agrigence.in';
    const fallbackImage = "https://kpnttmkkjq9kpa0f.public.blob.vercel-storage.com/settings/1778090902639-WhatsApp_Image_2026-04-05_at_21.20.18-removebg-preview.png";
    const ogImage = image && !image.includes('null') && !image.includes('undefined') ? image : fallbackImage;

    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Agrigence Publication",
      "url": baseUrl,
      "logo": fallbackImage
    };

    const combinedSchemas = schema 
      ? (Array.isArray(schema) ? [orgSchema, ...schema] : [orgSchema, schema])
      : [orgSchema];

    let metaTags = `
    <title data-rh="true">${title} | Agrigence Publication</title>
    <meta data-rh="true" name="robots" content="index, follow">
    <meta data-rh="true" name="description" content="${description}"/>
    <meta data-rh="true" name="keywords" content="${keywords || 'agriculture, farming, agritech, india, mandi bhav, gov schemes'}"/>
    <meta data-rh="true" property="og:title" content="${title} | Agrigence Publication"/>
    <meta data-rh="true" property="og:description" content="${description}"/>
    <meta data-rh="true" property="og:image" content="${ogImage}"/>
    <meta data-rh="true" property="og:url" content="${url}"/>
    <meta data-rh="true" property="og:type" content="website"/>
    <meta data-rh="true" name="twitter:card" content="summary_large_image"/>
    <meta data-rh="true" name="twitter:title" content="${title} | Agrigence Publication"/>
    <meta data-rh="true" name="twitter:description" content="${description}"/>
    <meta data-rh="true" name="twitter:image" content="${ogImage}"/>
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

  // === Vercel Blob Upload Proxy ===
  app.post('/api/admin/blob/upload', requireAdminAuth, upload.single('file'), async (req, res) => {
    try {
      console.log('Blob upload request received');
      const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
      
      // Diagnostics for the token
      if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        console.error('CRITICAL: Vercel Blob Token is strictly required for logo uploads but is missing.');
        return res.status(500).json({ 
          error: 'Vercel Blob Storage is not configured on the server. Please check environment variables.',
          code: 'MISSING_BLOB_TOKEN'
        });
      }

      if (!req.file) {
        console.error('Upload failed: No file in request');
        return res.status(400).json({ error: 'No file detected. Please ensure you selected an image.' });
      }
      
      const { path = 'general' } = req.body;
      
      // Branding assets specific validation
      if (path.startsWith('branding/')) {
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({ error: 'File is too large. Max size is 5MB for branding assets.' });
        }
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/x-icon'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
           return res.status(400).json({ error: 'Invalid file format. Allowed formats are PNG, JPG, JPEG, SVG, WEBP.' });
        }
      }

      // Sanitize filename to avoid weird characters in URL
      const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${path}/${Date.now()}-${sanitizedName}`;
      
      console.log(`Starting Vercel Blob put: ${fileName} (${req.file.size} bytes)`);

      const blob = await put(fileName, req.file.buffer, {
        access: 'public',
        token: token,
        contentType: req.file.mimetype
      });

      console.log('Upload successful:', blob.url);
      res.json({ url: blob.url });
    } catch (error: any) {
      console.error('BLOB_UPLOAD_STRICT_FAILURE:', error);
      res.status(500).json({ 
        error: error.message || 'Server failed to process upload',
        code: 'UPLOAD_PROCESSING_ERROR'
      });
    }
  });

  app.post('/api/admin/blob/delete', requireAdminAuth, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'URL is required' });
      
      const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
      if (!token) {
        return res.status(500).json({ error: 'Blob token missing' });
      }

      await del(url, { token });
      res.json({ success: true });
    } catch (error: any) {
      console.error('BLOB_DELETE_ERROR:', error);
      res.status(500).json({ error: error.message || 'Failed to delete blob' });
    }
  });

  // API routes
  // express.json() moved to top

  // Manual trigger endpoint for testing
  app.post('/api/admin/generate-daily-blog', requireAdminAuth, async (req, res) => {
    try {
      await processAndSaveDailyBlog();
      res.json({ message: 'Blog generation process started successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/trigger-mandi-update', requireAdminAuth, async (req, res) => {
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
    const host = req.get('host') || 'www.agrigence.in';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Allow: /api/
Allow: /mandi-bhav/
Allow: /scheme/
Allow: /crop/

User-agent: GPTBot
Allow: /

Sitemap: ${protocol}://${host}/sitemap.xml`);
  });

  // === WhatsApp Engine API ===
  app.use('/api/whatsapp', whatsappRouter);

  // === AI API Proxy ===
  let googleAI: any = null;

  function getAI() {
    if (googleAI) return googleAI;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    googleAI = new GoogleGenAI({ apiKey });
    return googleAI;
  }

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const ai = getAI();
      const { messages, model = 'gemini-1.5-flash' } = req.body;
      const parsedInstruction = req.body.systemInstruction || (await import('./src/lib/agrigenceAssistant.ts')).AGRIGENCE_ASSISTANT_SYSTEM_INSTRUCTION;
      
      const result = await ai.models.generateContentStream({
        model,
        contents: messages,
        config: {
          systemInstruction: parsedInstruction 
        }
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of result) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/generate', async (req, res) => {
    try {
      const ai = getAI();
      const { prompt, image, model = 'gemini-1.5-flash', jsonMode = false } = req.body;
      const parsedInstruction = req.body.systemInstruction || (await import('./src/lib/agrigenceAssistant.ts')).AGRIGENCE_ASSISTANT_SYSTEM_INSTRUCTION;
      
      let contents: any[] = [];
      if (typeof prompt === 'string') {
        contents.push({ text: prompt });
      } else if (Array.isArray(prompt)) {
        contents = prompt;
      }

      if (image) {
        // image is { data: string, mimeType: string }
        contents.push({
          inlineData: image
        });
      }

      const result = await ai.models.generateContent({
        model,
        contents: { parts: contents },
        config: {
          systemInstruction: parsedInstruction,
          responseMimeType: jsonMode ? 'application/json' : undefined
        }
      });

      const text = result.text || '';
      
      if (jsonMode) {
         try {
           res.json(JSON.parse(text));
         } catch (e) {
           res.json({ text });
         }
      } else {
        res.json({ text });
      }
    } catch (error: any) {
      console.error('AI Generate Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/chat', (req, res) => {
    res.status(410).json({ error: 'Endpoint migrated. Use /api/ai/chat instead.' });
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
  const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || 'dummy_key').trim().replace(/['"]/g, '');
  const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim().replace(/['"]/g, '');
  let razorpayInstance: any = null;

  try {
    const Razorpay = (await import('razorpay')).default;
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID.trim(),
      key_secret: RAZORPAY_KEY_SECRET.trim(),
    });
  } catch (e) {
    console.warn("Razorpay SDK not installed or configured. Install with: npm install razorpay");
  }

  app.post('/api/mobile/razorpay/create-order', async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: "Invalid amount provided." });
      }

      const safeReceipt = (receipt || `rcpt_${Date.now()}`).toString().replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 40);
      const safeCurrency = (currency || "INR").toString().replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();

      const options = {
        amount: Math.round(Number(amount) * 100), // amount in the smallest currency unit (paise)
        currency: safeCurrency,
        receipt: safeReceipt
      };

      const isValidKeys = RAZORPAY_KEY_ID && RAZORPAY_KEY_ID.startsWith('rzp_') && RAZORPAY_KEY_SECRET && RAZORPAY_KEY_SECRET !== 'dummy_secret';

      if (!razorpayInstance || !isValidKeys) {
        // Return a mock order if no valid keys are present to allow UI checkout to "succeed" in demo mode
        console.warn("Using mock Razorpay order since real keys aren't fully configured. Key must start with rzp_");
        return res.json({ 
          success: true,
          id: `order_mock_${Date.now()}`,
          entity: "order",
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: "created",
          created_at: Math.floor(Date.now() / 1000),
          key_id: "rzp_test_dummy"
        });
      }
      
      const order = await razorpayInstance.orders.create(options);
      // Return order along with public key_id
      res.json({ success: true, ...order, key_id: RAZORPAY_KEY_ID });
    } catch (e: any) {
      console.error("Razorpay API Error:", e);
      const errMsg = e.error?.description || e.message || "Unknown error occurred";
      if (errMsg.toLowerCase().includes('authentication failed')) {
         return res.status(500).json({ success: false, error: "Razorpay authentication failed. Please check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are configured correctly.", details: e.error || e });
      }
      res.status(500).json({ success: false, error: errMsg, details: e.error || e });
    }
  });

  app.post('/api/mobile/razorpay/verify-payment', async (req, res) => {
    try {
      const crypto = await import('crypto');
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return res.status(400).json({ success: false, error: "Missing verification parameters" });
      }

      const safeOrderId = razorpay_order_id.toString().replace(/[^a-zA-Z0-9_-]/g, '');
      const safePaymentId = razorpay_payment_id.toString().replace(/[^a-zA-Z0-9_-]/g, '');
      const safeSignature = razorpay_signature.toString().replace(/[^a-zA-Z0-9_-]/g, '');

      // Verify the signature
      const body = safeOrderId + "|" + safePaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === safeSignature || RAZORPAY_KEY_SECRET === 'dummy_secret') {
        // Payment is legit (mock passed if dummy_secret)
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, error: "Invalid payment signature" });
      }
    } catch (e: any) {
      console.error("Razorpay Verify Error:", e);
      res.status(500).json({ success: false, error: e.message || "Failed to verify signature" });
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

  // Secure PDF Proxy Route
  // Completely hides Google Drive URL and avoids CORS issues on the frontend
  app.get('/api/pdf/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;
      const isDownload = req.query.download === 'true';
      const range = req.headers.range;
      
      const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
      
      const fetchOptions: any = {
        method: 'GET',
        headers: {}
      };
      
      if (range) {
        fetchOptions.headers['Range'] = range;
      }
      
      const response = await fetch(driveUrl, fetchOptions);
      
      if (!response.ok && response.status !== 206) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      
      // Pass through important headers
      res.setHeader('Content-Type', 'application/pdf');
      const dispositionPattern = isDownload ? 'attachment' : 'inline';
      res.setHeader('Content-Disposition', `${dispositionPattern}; filename="document-${fileId}.pdf"`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Accept-Ranges', 'bytes');
      
      if (response.status === 206) {
        res.status(206);
        const contentRange = response.headers.get('content-range');
        if (contentRange) res.setHeader('Content-Range', contentRange);
      }
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      
      if (response.body) {
        // @ts-ignore
        const { Readable } = require('node:stream');
        Readable.fromWeb(response.body).pipe(res);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error('PDF Proxy error:', err);
      res.status(500).send('Failed to load secure PDF document.');
    }
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const host = req.get('host') || 'www.agrigence.in';
      const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      const today = new Date().toISOString().split('T')[0];
      
      const staticRoutes = [
        '',
        '/about-journal',
        '/aim-scope',
        '/editorial-board',
        '/publication-ethics',
        '/author-guidelines',
        '/journals',
        '/consultation',
        '/about-contact',
        '/sitemap',
        '/terms',
        '/privacy',
        '/img',
        '/submission',
        '/subscription',
        '/tools',
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

      const kisanRoutes = [
        '/kisan',
        '/kisan/login',
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
        '/kisan/crop-planner',
        '/kisan/soil-analyzer',
        '/kisan/farmer-connect',
        '/kisan/mobile-app'
      ];

      let dynamicRoutes: string[] = [];

      try {
        // Add Mandi Routes (Programmatic SEO)
        mandiPrices.forEach(p => dynamicRoutes.push(`/kisan/mandi-bhav/${p.city.toLowerCase()}`));
        // Add Scheme Routes (Programmatic SEO)
        schemes.forEach(s => dynamicRoutes.push(`/kisan/scheme/${s.slug}`));
        // Add Crop Routes (Programmatic SEO)
        cropAdvisory.forEach(c => dynamicRoutes.push(`/kisan/crop/${c.slug}`));

        // Fetch All Articles (Blogs + Journals)
        const blogsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/articles`);
        if (blogsRes.ok) {
          const blogsData = await blogsRes.json();
          if (blogsData.documents) {
            blogsData.documents.forEach((doc: any) => {
              const id = doc.name.split('/').pop();
              const type = doc.fields?.type?.stringValue;
              const status = doc.fields?.status?.stringValue;
              
              // Only include published content
              if (status === 'PUBLISHED' || status === 'APPROVED') {
                if (type === 'BLOG') {
                  // Wait, rule: "Remove these URLs completely from sitemap: /blogs"
                  // Let's not include blog dynamic routes either, or did they mean the `/blogs` parent? "Remove these URLs completely from sitemap: /blogs, /products"
                  // If we need to completely remove /blogs, we'll exclude `/blog/*` and `/blogs`
                  // dynamicRoutes.push(`/blog/${id}`);
                } else {
                  dynamicRoutes.push(`/view-document/${id}`);
                }
              }
            });
          }
        }

        // Fetch News
        const newsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/news`);
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

      // Deduplicate all routes
      const uniqueRoutes = [...new Set([...staticRoutes, ...kisanRoutes, ...dynamicRoutes])];

      const getPriority = (route: string) => {
        if (route === '') return '1.0';
        if (['/journals', '/kisan', '/img'].includes(route)) return '0.9';
        if (['/terms', '/privacy', '/publication-ethics', '/about-contact', '/author-guidelines', '/editorial-board', '/aim-scope', '/about-journal'].includes(route)) return '0.5';
        if (staticRoutes.includes(route) || kisanRoutes.includes(route)) return '0.8';
        return '0.6';
      };

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes.map(route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${getPriority(route) === '0.5' ? 'monthly' : ([...staticRoutes, ...kisanRoutes].includes(route) ? 'daily' : 'weekly')}</changefreq>
    <priority>${getPriority(route)}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.status(200).send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).header('Content-Type', 'text/plain').send('Error generating sitemap');
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
      const fallbackImage = "https://kpnttmkkjq9kpa0f.public.blob.vercel-storage.com/settings/1778090902639-WhatsApp_Image_2026-04-05_at_21.20.18-removebg-preview.png";
      const host = req.get('host') || 'www.agrigence.in';
      const baseUrl = `https://${host}`;

      // If the request is for a file (has an extension) but reached here, it means it's missing.
      // We should return a 404 instead of index.html for non-html assets to avoid SEO issues.
      const parsedPath = path.parse(req.path);
      if (parsedPath.ext && !['', '.html'].includes(parsedPath.ext)) {
        return res.status(404).end();
      }

      let html = fs.readFileSync(indexPath, 'utf8');
      
      const blogMatch = req.path.match(/^\/blog\/(.+)$/);
      const newsMatch = req.path.match(/^\/news\/(.+)$/);
      const viewDocumentMatch = req.path.match(/^\/view-document\/(.+)$/);
      const mandiMatch = req.path.match(/^\/(?:kisan\/)?mandi-bhav\/(.+)$/);
      const schemeMatch = req.path.match(/^\/(?:kisan\/)?scheme\/(.+)$/);
      const cropMatch = req.path.match(/^\/(?:kisan\/)?crop\/(.+)$/);
      
      if (blogMatch || newsMatch || viewDocumentMatch) {
        const collection = blogMatch || viewDocumentMatch ? 'articles' : 'news';
        const id = blogMatch ? blogMatch[1] : (newsMatch ? newsMatch[1] : viewDocumentMatch![1]);
        const doc = await getDoc(collection, id);
        if (doc) {
          const title = doc.seoTitle || doc.title || 'Agrigence';
          const description = (doc.metaDescription || doc.excerpt || doc.content || '').substring(0, 160);
          const image = doc.featuredImage || doc.thumbnail || fallbackImage;
          html = injectMeta(html, { title, description, image, url: `${baseUrl}${req.path}`, host });
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
            "url": `${baseUrl}${req.path}`,
            "publisher": { "@type": "Organization", "name": "Agrigence" }
          };
          html = injectMeta(html, { title, description, image: fallbackImage, url: `${baseUrl}${req.path}`, schema, host });
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
          html = injectMeta(html, { title, description, image: fallbackImage, url: `${baseUrl}${req.path}`, schema, host });
        }
      } else if (cropMatch) {
        const slug = cropMatch[1];
        const crop = cropAdvisory.find(c => c.slug === slug);
        if (crop) {
          const title = `${crop.name} Cultivation Guide & Advisory`;
          const description = `Learn how to grow ${crop.name} with Agrigence. Best soil: ${crop.soil_type}, Season: ${crop.season}. Direct answer to yield optimization.`;
          html = injectMeta(html, { title, description, image: fallbackImage, url: `${baseUrl}${req.path}`, host });
        }
      } else if (req.path === '/' || req.path === '') {
        html = injectMeta(html, { 
          title: 'Agrigence Publication', 
          description: 'Smart agricultural tools, academic resources, and research insights for farmers and students. Optimize your farming and studies with data-driven decisions.', 
          image: fallbackImage, 
          url: baseUrl, 
          host
        });
      } else if (req.path === '/tools') {
        html = injectMeta(html, { 
          title: 'Agricultural Data Analysis Tools', 
          description: 'Free scientific tools for farmers and researchers: Seed Rate Calculator, Fertilizer Requirements, Yield Estimators, and Statistical Analysis (ANOVA).', 
          image: fallbackImage, 
          url: `${baseUrl}/tools`,
          host
        });
      } else if (req.path === '/author-guidelines') {
        html = injectMeta(html, { 
          title: 'Author Guidelines & Submission Process', 
          description: 'Detailed instructions for authors on preparing and submitting manuscripts to Agrigence Publication.', 
          image: fallbackImage, 
          url: `${baseUrl}/author-guidelines`,
          host
        });
      } else if (req.path === '/img') {
        const imgSchema = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Agrigence Image & AI Tools",
          "url": `${baseUrl}/img`,
          "applicationCategory": "MultimediaApplication",
          "description": "Free AI-powered image tools for agriculture: image compressor, resizer, infographic maker, and vector graphics.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        };

        html = injectMeta(html, { 
          title: 'AI Image Tools for Agriculture | Compress, Resize & Vectors', 
          description: 'Free AI-powered image tools for agriculture: image compressor, resizer, infographic maker, and vector graphics. Optimize photos for websites and journals easily.', 
          keywords: 'image compressor, image resizer, agriculture graphics, AI image tools, infographic maker, crop infographics, vector graphics, image tools, free image tools',
          image: fallbackImage, 
          url: `${baseUrl}/img`,
          host,
          schema: imgSchema
        });
      } else if (req.path === '/editorial-board') {
        html = injectMeta(html, { 
          title: 'Editorial Board & Leadership', 
          description: 'Meet the expert editorial board members and academic leadership behind Agrigence Publication.', 
          image: fallbackImage, 
          url: `${baseUrl}/editorial-board`,
          host
        });
      } else if (req.path === '/aim-scope') {
        html = injectMeta(html, { 
          title: 'Aim & Scope of the Journal', 
          description: 'Explore the research areas and scholarly objectives of Agrigence Publication.', 
          image: fallbackImage, 
          url: `${baseUrl}/aim-scope`,
          host
        });
      } else if (req.path === '/publication-ethics') {
        html = injectMeta(html, { 
          title: 'Publication Ethics & Malpractice Statement', 
          description: 'Our commitment to ethical standards in research publishing, peer review, and academic integrity.', 
          image: fallbackImage, 
          url: `${baseUrl}/publication-ethics`,
          host
        });
      } else if (req.path === '/journals') {
        html = injectMeta(html, { 
          title: 'Journal Archive & Current Issues', 
          description: 'Access the latest and archived upcoming issues, manuscripts and research on Agrigence Publication.', 
          image: fallbackImage, 
          url: `${baseUrl}/journals`,
          host
        });
      } else if (req.path === '/about-contact') {
        html = injectMeta(html, { 
          title: 'About Us & Contact', 
          description: 'Learn about Agrigence, our mission, leadership, and how to get in touch with our team.', 
          image: fallbackImage, 
          url: `${baseUrl}/about-contact`,
          host
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
