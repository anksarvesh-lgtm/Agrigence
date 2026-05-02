import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { whatsappRouter } from './src/server/whatsapp/api.ts';

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

  // Helper to inject meta tags
  function injectMeta(html: string, title: string, description: string, image: string, url: string) {
    return html
      .replace(/<title>.*?<\/title>/, `<title>${title} | Agrigence</title>`)
      .replace(/<meta property="og:title" content=".*?"\/>/, `<meta property="og:title" content="${title}"/>`)
      .replace(/<meta property="og:description" content=".*?"\/>/, `<meta property="og:description" content="${description}"/>`)
      .replace(/<meta property="og:image" content=".*?"\/>/, `<meta property="og:image" content="${image}"/>`)
      .replace(/<meta property="og:url" content=".*?"\/>/, `<meta property="og:url" content="${url}"/>`);
  }

  // API routes
  app.use(express.json());

  // === WhatsApp Engine API ===
  app.use('/api/whatsapp', whatsappRouter);

  // === AI Scheme Extractor API && Chat API ===
  // Note: Using dynamic import as requested previously
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
         return res.status(500).json({ error: 'Gemini API key not configured' });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const SYSTEM_INSTRUCTION = `You are "Kisan Mitra", a highly knowledgeable, practical, and friendly agricultural assistant designed specifically for Indian farmers.

Your primary goal is to provide accurate, actionable, and easy-to-understand farming advice that helps farmers increase yield, reduce cost, and make better decisions.

-----------------------------------
🌾 CORE BEHAVIOR
-----------------------------------
- Always respond in simple, clear English (or Hinglish tone if user uses Hindi words).
- Avoid technical jargon unless necessary; explain simply.
- Be practical, not theoretical.
- Focus on Indian farming conditions (climate, soil, crops, government schemes).
- If location is known, tailor advice to that region.
- Keep answers structured and easy to follow.

-----------------------------------
🌱 EXPERTISE AREAS
-----------------------------------
1. Crop Farming
2. Soil & Fertility
3. Pest & Disease Management
4. Weather-Based Advisory
5. Market & Mandi Guidance
6. Government Schemes (India)
7. Agri Business

-----------------------------------
📊 RESPONSE FORMAT
-----------------------------------
Always structure answers like this:
1. Short Direct Answer
2. Step-by-Step Guidance
3. Tips (if applicable)
4. Warning / Mistakes to Avoid (if needed)

-----------------------------------
📍 LOCATION HANDLING
-----------------------------------
- If user mentions location -> give region-specific advice.
- If not -> ask: "Which state or district are you farming in?"

-----------------------------------
🚀 NEW ECOSYSTEM MODULES (GUIDANCE)
-----------------------------------
- If user asks about Equipment Rental, guide them to use 'Equip Rentals' tab to search for tractors/tools nearby.
- If they ask where to sell or buy crops directly, guide them to 'Marketplace'.
- If they ask about buying/leasing land, point them to 'Land Leasing'.
- If they ask about subsidies, PM-Kisan, or crop insurance, guide them to 'Gov Schemes'.
- If they want to post what they need (e.g., "I need a tractor", "I need seeds"), guide them to 'Post Requirement'.
- If they want to list their own assets for rent or sale (e.g., "I want to rent my tractor", "I want to sell my crop"), guide them to 'List Your Item'.
- Users can manage their active needs in 'My Requirements' and their listed items in 'My Inventory'.

-----------------------------------
🧠 INTELLIGENCE RULES
-----------------------------------
- If unsure -> say "Based on general Indian farming practices..."
- Never hallucinate government data.
- Prefer practical field advice over textbook knowledge.
- If question is unclear -> ask follow-up question.

-----------------------------------
🌿 PERSONALITY
-----------------------------------
- Supportive and respectful
- Speak like a helpful agri expert, not a robot
- Avoid long paragraphs
- Use bullet points

-----------------------------------
❌ STRICTLY AVOID
-----------------------------------
- No medical or legal advice
- No unrelated topics
- No over-complex explanations
- No guessing exact prices`;

      const formattedContents = (history || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      formattedContents.push({ role: 'user', parts: [{ text: message }] });

      const responseStream = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: formattedContents,
          config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7
          }
      });
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      for await (const chunk of responseStream) {
          res.write(chunk.text);
      }
      res.end();
      
    } catch (e: any) {
       console.error("Chat error:", e);
       if (!res.headersSent) {
          res.status(500).json({ error: e.message || 'Failed to generate chat response' });
       } else {
          res.end();
       }
    }
  });

  app.post('/api/extract-scheme-data', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text is required' });

      // Dynamic import to avoid early initialization issues or bundle errors
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
         return res.status(500).json({ error: 'Gemini API key not configured' });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
      Extract the following scheme details from the provided text and strictly output ONLY valid JSON.
      The JSON should match this TypeScript interface:
      {
        "title": "string (The name of the scheme)",
        "description": "string (Short description, 1-2 lines)",
        "detailedDesc": "string (Detailed explanation of the scheme)",
        "category": "string (Must be one of: SUBSIDY, LOAN, DEADLINE, OTHER)",
        "subsidyAmount": "string (Core benefit or amount, e.g. '₹6,000/year' or '50% subsidy')",
        "eligibility": "string (Who is eligible to apply)",
        "documents": ["string", "string"] (Array of required document names),
        "tags": ["string", "string"] (Array of tags related to agriculture)
      }

      Text to parse:
      """
      ${text}
      """
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      
      let aiText = response.text || '';
      // Clean up markdown markers if present
      if (aiText.includes('\`\`\`json')) {
         aiText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      } else if (aiText.includes('\`\`\`')) {
         aiText = aiText.replace(/\`\`\`/g, '').trim();
      }

      const jsonData = JSON.parse(aiText);
      res.json(jsonData);
    } catch (e: any) {
       console.error("AI Extractor error:", e);
       res.status(500).json({ error: e.message || 'Failed to extract data' });
    }
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
        '/sitemap',
        '/farmer-connect',
        '/govt-schemes',
        '/mobile-app',
        '/kisan',
        '/kisan/mandi',
        '/kisan/weather',
        '/kisan/schemes',
        '/kisan/equipment',
        '/kisan/marketplace',
        '/kisan/land',
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
      
      if (blogMatch || newsMatch) {
        const collection = blogMatch ? 'blogs' : 'news';
        const id = blogMatch ? blogMatch[1] : newsMatch![1];
        const doc = await getDoc(collection, id);
        if (doc) {
          const title = doc.title || 'Agrigence';
          const description = (doc.content || doc.description || '').substring(0, 150);
          const image = doc.featuredImage || doc.thumbnail || 'https://www.agrigence.in/logo.png';
          html = injectMeta(html, title, description, image, `https://www.agrigence.in${req.path}`);
        }
      }
      
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
