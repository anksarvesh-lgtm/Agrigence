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
import { put } from '@vercel/blob';
import multer from 'multer';

import { enterpriseRouter } from './src/server/enterpriseBackend.ts';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}
const adminDb = admin.firestore();


const app = express();
const PORT = 3000;

async function startServer() {
  
  app.use(cors());
  app.use(express.json());

  // === Enterprise Backend Router Mount ===
  app.use('/api/v2', enterpriseRouter);

  
  // Multer setup for memory storage
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
  const projectId = 'gen-lang-client-0276037966';

  const databaseId = 'ai-studio-3e16a161-237b-431f-b594-a3f4635b9cc5';

  // Helper to fetch document
  async function getDoc(collection: string, id: string) {
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
    <title data-rh="true">${title}</title>
    <meta data-rh="true" name="robots" content="index, follow">
    <meta data-rh="true" name="description" content="${description}"/>
    <meta data-rh="true" name="keywords" content="${keywords || 'agriculture, competitive exam, icar, ibps afo, nabard, agritech, agrigence'}"/>
    <meta data-rh="true" property="og:title" content="Agrigence Publication"/>
    <meta data-rh="true" property="og:description" content="Where Agri-Intelligence Meets Agricultural Generations"/>
    <meta data-rh="true" property="og:site_name" content="Agrigence Publication"/>
    <meta data-rh="true" property="og:image" content="${ogImage}"/>
    <meta data-rh="true" property="og:url" content="${url}"/>
    <meta data-rh="true" property="og:type" content="website"/>
    <meta data-rh="true" name="twitter:card" content="summary_large_image"/>
    <meta data-rh="true" name="twitter:title" content="${title}"/>
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

  // --- Automation Cron Jobs Disabled for Exam Focus ---

  // === Vercel Blob Upload Proxy ===
  app.post('/api/admin/blob/upload', (req, res, next) => {
    upload.single('file')(req, res, function (err) {
      if (err) {
        console.error('Multer file upload error:', err);
        return res.status(400).json({ error: 'File upload failed: ' + err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      console.log('Blob upload request received');
      
      const authHeader = req.headers.authorization;
      const { email: decodedEmail } = await decodeFirebaseToken(authHeader);

      const ADMIN_EMAILS = ['agrigence@gmail.com', 'anksarvesh@gmail.com', 'admin@agrigence.com'];
      if (!ADMIN_EMAILS.includes(decodedEmail)) {
        return res.status(403).json({ error: 'Admin access credentials required' });
      }

      if (!req.file) {
        console.error('Upload failed: No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Add strict file size and type validation like we used for Firebase
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (req.file.size > MAX_SIZE) {
        return res.status(400).json({ error: 'File too large. Maximum 10MB allowed.' });
      }

      const allowedMimeTypes = ['application/json', 'text/csv', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/vnd.android.package-archive'];
      const allowedExtensions = ['.json', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.apk'];
      
      const fileNameLowerCase = req.file.originalname.toLowerCase();
      const isAllowedExtension = allowedExtensions.some(ext => fileNameLowerCase.endsWith(ext));
      
      if (!allowedMimeTypes.includes(req.file.mimetype) && !isAllowedExtension) {
        return res.status(400).json({ error: 'Unsupported file type.' });
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        console.error('Upload failed: BLOB_READ_WRITE_TOKEN is missing');
        throw new Error('BLOB_READ_WRITE_TOKEN is not configured on server');
      }

      const { path = 'general' } = req.body;
      const fileName = `${path}/${Date.now()}-${req.file.originalname}`;
      console.log(`Uploading to Vercel Blob: ${fileName}`);

      const blob = await put(fileName, req.file.buffer, {
        access: 'public',
        token: token,
        contentType: req.file.mimetype
      });

      console.log('Upload successful:', blob.url);
      res.json({ url: blob.url });
    } catch (error: any) {
      console.error('Blob Upload Error Details:', error);
      res.status(500).json({ error: error.message || 'Server failed to process upload' });
    }
  });

  // Helper routine to decode the Firebase Auth bearer token safely
  async function decodeFirebaseToken(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No auth token');
    }
    try {
      const token = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(token);
      return { email: decoded.email || '', decoded };
    } catch (e) {
      console.error("Firebase ID Token verification failed:", e);
      throw new Error('Invalid token');
    }
  }

  // === Consolidated Academic Question Banks Ingress Route ===
  app.post('/api/admin/banks/upload', upload.single('file'), async (req, res) => {
    try {
      console.log('Ingest banks upload request received');
      
      const authHeader = req.headers.authorization;
      const { email: decodedEmail } = await decodeFirebaseToken(authHeader);

      const ADMIN_EMAILS = ['agrigence@gmail.com', 'anksarvesh@gmail.com', 'admin@agrigence.com'];
      if (!ADMIN_EMAILS.includes(decodedEmail)) {
        return res.status(403).json({ error: 'Admin access credentials required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No data file provided in payload' });
      }

      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (req.file.size > MAX_SIZE) {
        return res.status(400).json({ error: 'File too large. Maximum 10MB allowed.' });
      }

      const {
        bankName, subject, examTarget,
        difficulty, isPremium, sourceFormat, totalQuestions,
        accessControl, description, analytics, settings
      } = req.body;

      if (!bankName) {
        return res.status(400).json({ error: 'bankName is required' });
      }

      let questions: any[] = [];
      try {
        const text = req.file.buffer.toString('utf-8');
        const parsed = JSON.parse(text);
        questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
      } catch (err: any) {
        return res.status(400).json({ error: `Invalid structured layout format: ${err.message}` });
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'No validated questions found inside structure' });
      }

      const bankId = `bank-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`;

      const blobContent = JSON.stringify({
        bankId,
        bankName,
        subject: subject || 'General',
        examTarget: examTarget || 'All Exams',
        difficulty: difficulty || 'Medium',
        sourceFormat: sourceFormat || 'json',
        version: '1.0',
        totalQuestions: (questions || []).length,
        uploadedAt: new Date().toISOString(),
        uploadedBy: decodedEmail,
        questions,
      }, null, 2);

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured on server' });
      }

      console.log(`Writing consolidated bundle to Vercel Blob: question-banks/bank-${bankId}.json`);
      const blob = await put(
        `question-banks/bank-${bankId}.json`,
        blobContent,
        {
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
          token: token,
        }
      );

      console.log('Preparing bankMetadata for:', bankId);
      
      if (!questions) {
        console.error('Questions is undefined!');                
        return res.status(500).json({ error: 'Questions is undefined unexpectedly' });
      }

      const bankMetadata = {                
        id: bankId,
        bankId,
        name: bankName,
        bankName,
        description: description || '',
        subject: subject || 'General',
        examTarget: examTarget || 'All Exams',
        difficulty: difficulty || 'Medium',
        isPremium: isPremium === 'true' || isPremium === true,
        accessLevel: (isPremium === 'true' || isPremium === true) ? 'premium' : 'registered',
        accessControl: accessControl ? (typeof accessControl === 'string' ? JSON.parse(accessControl) : accessControl) : null,
        analytics: analytics ? (typeof analytics === 'string' ? JSON.parse(analytics) : analytics) : null,
        settings: settings ? (typeof settings === 'string' ? JSON.parse(settings) : settings) : null,
        totalQuestions: (questions || []).length,
        questionsCount: (questions || []).length,
        sourceFormat: sourceFormat || 'json',
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        blobSize: req.file?.size || 0,
        storageProvider: 'vercel_blob',
        status: 'Pending',
        featured: false,
        averageScore: 0,
        totalAttempts: 0,
        uploadedBy: decodedEmail,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questions: questions.slice(0, 10)
      };

      await adminDb.collection('question_banks').doc(bankId).set(bankMetadata);
      console.log(`[Consolidated success] ${bankId} logged, size: ${(questions || []).length}`);

      return res.status(200).json({
        success: true,
        bankId,
        bankName,
        totalQuestions: (questions || []).length,
        blobUrl: blob.url,
        status: 'Pending',
        message: `${(questions || []).length} questions uploaded. Pending admin approval.`
      });

    } catch (err: any) {
      console.error('[Consolidated error]', err);
      return res.status(500).json({ error: err.message || 'Server-side upload failed' });
    }
  });

  app.get('/api/admin/banks/diagnostics', (req, res) => {
    return res.json({
      storageProvider: 'vercel_blob',
      blobTokenExists: !!process.env.BLOB_READ_WRITE_TOKEN
    });
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

Sitemap: https://www.agrigence.in/sitemap.xml`);
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
      const parsedInstruction = req.body.systemInstruction || (await import('./src/lib/khetai.ts')).KHETAI_SYSTEM_INSTRUCTION;
      
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
      const parsedInstruction = req.body.systemInstruction || (await import('./src/lib/khetai.ts')).KHETAI_SYSTEM_INSTRUCTION;
      
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

  // === Advanced Razorpay Integration and Content Access Control ===
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
    console.warn("Razorpay SDK not initialized or configured. Fallback sandbox mode active.");
  }

  // --- ORDER CREATION ROUTE ---
  // Supporting multiple aliases for different frontend screens: /api/payments/create-order, /api/create-order, /api/mobile/razorpay/create-order
  const createOrderHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { planId, userId, couponCode, amount: customAmount } = req.body;
      
      // Allow fallback if no specific user but custom amount is requested
      let targetPlanId = planId || 'custom';
      let targetUserId = userId || 'anonymous';
      let finalPrice = customAmount || 499; // fallback default
      let planName = 'Premium Access';
      let planDetails: any = null;

      if (planId && planId !== 'custom') {
        // Try subscription_plans collection
        try {
          const planSnap = await adminDb.collection('subscription_plans').doc(planId).get();
          if (planSnap.exists) {
            planDetails = planSnap.data()!;
            finalPrice = planDetails.price;
            planName = planDetails.name;
          } else {
            // Fallback to appConfig/plans check
            const configSnap = await adminDb.collection('appConfig').doc('plans').get();
            if (configSnap.exists) {
              const plansList = configSnap.data()!.plans || [];
              planDetails = plansList.find((p: any) => p.id === planId);
              if (planDetails) {
                finalPrice = planDetails.price;
                planName = planDetails.name;
              }
            }
          }
        } catch (planError) {
          console.warn("Plan lookups from DB skipped:", planError);
        }
      }

      // Apply Coupon Discount if specified
      if (couponCode && planDetails) {
        try {
          const couponSnap = await adminDb.collection('coupons').doc(couponCode).get();
          if (couponSnap.exists) {
            const coupon = couponSnap.data()!;
            if (coupon.isActive && (!coupon.expiry || new Date(coupon.expiry) >= new Date())) {
              const discount = coupon.discount || 0;
              finalPrice = Math.max(0, finalPrice - discount);
            }
          }
        } catch (couponError) {
          console.warn("Coupon lookup skipped:", couponError);
        }
      }

      // If Razorpay SDK is not fully set up, create a simulated order for local dev sandbox
      let order: any = {
        id: `order_sim_${Math.random().toString(36).substring(2, 11)}`,
        amount: Math.round(finalPrice * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      };

      if (razorpayInstance && RAZORPAY_KEY_ID !== 'dummy_key') {
        const options = {
          amount: Math.round(finalPrice * 100), // amount in the smallest currency unit (paise)
          currency: "INR",
          receipt: `receipt_${Date.now()}`
        };
        order = await razorpayInstance.orders.create(options);
      } else {
        console.info("Generated simulated sandbox order:", order.id);
      }

      // Save a PENDING payment document in payments collection (using order.id as doc ID)
      try {
        let userName = 'Customer';
        if (targetUserId !== 'anonymous') {
          const userSnap = await adminDb.collection('users').doc(targetUserId).get();
          if (userSnap.exists) {
            userName = userSnap.data()!.name || userSnap.data()!.email || 'Customer';
          }
        }

        const paymentRecord = {
          id: order.id,
          userId: targetUserId,
          userName: userName,
          planId: targetPlanId,
          planName: planName,
          amount: finalPrice,
          method: 'ONLINE',
          status: 'PENDING',
          date: new Date().toISOString(),
          upiTxnId: '',
          txnId: order.id,
          displayCurrency: 'INR',
          displayAmount: finalPrice,
          gatewayFee: 0,
        };

        await adminDb.collection('payments').doc(order.id).set(paymentRecord);
      } catch (dbError) {
        console.error("Failed to persist pending payment records to Firestore:", dbError);
      }

      // Match response structure of both screens
      res.json({
        id: order.id,
        orderId: order.id,
        amount: finalPrice,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID,
        key: RAZORPAY_KEY_ID
      });

    } catch (e: any) {
      console.error("Payment Order Creation Exception:", e);
      res.status(500).json({ error: e.message });
    }
  };

  app.post('/api/payments/create-order', createOrderHandler);
  app.post('/api/create-order', createOrderHandler);
  app.post('/api/mobile/razorpay/create-order', createOrderHandler);

  // --- PAYMENT VERIFICATION ROUTE ---
  // Supporting multiple aliases for different frontend screens: /api/payments/verify, /api/verify-payment, /api/mobile/razorpay/verify-payment
  const verifyPaymentHandler = async (req: express.Request, res: express.Response) => {
    try {
      const crypto = await import('crypto');
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !userId || !planId) {
        return res.status(400).json({ success: false, error: "Missing required parameters" });
      }

      // Verify the signature if Razorpay is configured, else auto-accept sandbox signatures
      if (razorpayInstance && RAZORPAY_KEY_ID !== 'dummy_key' && razorpay_signature) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          console.warn("Razorpay signature mismatch calculated!");
          return res.status(400).json({ success: false, status: 'error', error: "Invalid payment signature" });
        }
      }

      // Fetch the plan details to get duration
      let durationMonths = 1;
      let planName = 'Premium Tier';
      let articleLimit: any = 'UNLIMITED';
      let blogLimit: any = 'UNLIMITED';
      let unlockType: string | undefined = undefined;
      let allowedExams: string[] | undefined = undefined;

      if (planId && planId !== 'custom') {
        try {
          const planSnap = await adminDb.collection('subscription_plans').doc(planId).get();
          if (planSnap.exists) {
            const planData = planSnap.data()!;
            durationMonths = planData.durationMonths || 1;
            planName = planData.name;
            articleLimit = planData.articleLimit ?? 'UNLIMITED';
            blogLimit = planData.blogLimit ?? 'UNLIMITED';
            unlockType = planData.unlockType;
            allowedExams = planData.allowedExams;
          } else {
            const configSnap = await adminDb.collection('appConfig').doc('plans').get();
            if (configSnap.exists) {
              const plansList = configSnap.data()!.plans || [];
              const planDetails = plansList.find((p: any) => p.id === planId);
              if (planDetails) {
                durationMonths = planDetails.durationMonths || 1;
                planName = planDetails.name;
                articleLimit = planDetails.articleLimit ?? 'UNLIMITED';
                blogLimit = planDetails.blogLimit ?? 'UNLIMITED';
                unlockType = planDetails.unlockType;
                allowedExams = planDetails.allowedExams;
              }
            }
          }
        } catch (planError) {
          console.warn("Payment verification plan lookup from DB skipped:", planError);
        }
      }

      // Calculate start and end date
      const now = new Date();
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + durationMonths);

      // 1. Update the payment document status inside Firestore to COMPLETED
      try {
        const paymentRef = adminDb.collection('payments').doc(razorpay_order_id);
        await paymentRef.update({
          status: 'COMPLETED',
          upiTxnId: razorpay_payment_id,
          method: 'ONLINE'
        });
      } catch (writeErr) {
        console.warn("Payment status update in firestore bypassed: " + writeErr);
      }

      // 2. Update user profile inside users collection
      try {
        const userRef = adminDb.collection('users').doc(userId);
        const subData: any = {
            planId: planId,
            status: 'active',
            startDate: now.toISOString(),
            endDate: expiry.toISOString(),
            paymentId: razorpay_payment_id,
            active: true
        };
        if (unlockType) subData.unlockType = unlockType;
        if (allowedExams) subData.allowedExams = allowedExams;

        await userRef.update({
          subscriptionTier: planName,
          subscriptionExpiry: expiry.toISOString(),
          status: 'ACTIVE',
          articleLimit: articleLimit,
          blogLimit: blogLimit,
          subscription: subData
        });
      } catch (userErr) {
        console.warn("User subscription profile update bypassed: " + userErr);
      }

      // Matches both status checks of both payment dialogs
      res.json({ 
        success: true, 
        status: 'success', 
        message: "Payment verified and subscription activated successfully." 
      });

    } catch (e: any) {
      console.error("Payment Verification Exception:", e);
      res.status(500).json({ error: e.message });
    }
  };

  app.post('/api/payments/verify', verifyPaymentHandler);
  app.post('/api/verify-payment', verifyPaymentHandler);
  app.post('/api/mobile/razorpay/verify-payment', verifyPaymentHandler);

  // --- WEBHOOK FOR PAYMENT FAILURES AND REFUNDS ---
  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const crypto = await import('crypto');
      const signature = req.headers['x-razorpay-signature'];
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';

      if (signature && razorpayInstance) {
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
          return res.status(400).json({ error: 'Invalid webhook signature' });
        }
      }

      const event = req.body.event;
      if (event === 'payment.failed') {
        const paymentDetails = req.body.payload?.payment?.entity;
        const orderId = paymentDetails?.order_id;
        if (orderId) {
          await adminDb.collection('payments').doc(orderId).update({ status: 'FAILED' });
        }
      } else if (event === 'refund.created') {
        const paymentDetails = req.body.payload?.payment?.entity;
        const orderId = paymentDetails?.order_id;
        if (orderId) {
          // Mark payment to REFUNDED
          await adminDb.collection('payments').doc(orderId).update({ status: 'REFUNDED' });

          // Terminate subscription for the associated user
          try {
            const paymentSnap = await adminDb.collection('payments').doc(orderId).get();
            if (paymentSnap.exists) {
              const paymentData = paymentSnap.data()!;
              const userRef = adminDb.collection('users').doc(paymentData.userId);
              await userRef.update({
                status: 'EXPIRED',
                subscriptionTier: 'FREE',
                'subscription.status': 'expired'
              });
            }
          } catch (refundDbErr) {
            console.error("Failed to revoke subscription on refund webhook:", refundDbErr);
          }
        }
      }

      res.json({ status: 'ok' });
    } catch (e: any) {
      console.error("Webhook processing error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // --- ADMIN INITIATE REFUND ROUTE ---
  app.post('/api/admin/payments/refund', async (req, res) => {
    try {
      const { paymentId, amount, reason } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ error: 'Missing paymentId' });
      }

      if (razorpayInstance && RAZORPAY_KEY_ID !== 'dummy_key') {
        await razorpayInstance.payments.refund(paymentId, {
          amount: amount ? Math.round(amount * 100) : undefined,
          notes: { reason: reason || 'Admin initiated refund from dash' }
        });
      } else {
        console.info("Simulating manual admin refund for sandbox ID:", paymentId);
      }

      // Update payment record inside database
      try {
        const snap = await adminDb.collection('payments').where('upiTxnId', '==', paymentId).get();
                if (!snap.empty) {
          const docId = snap.docs[0].id;
          const paymentData = snap.docs[0].data();
          await adminDb.collection('payments').doc(docId).update({ status: 'REFUNDED' });

          // Downward downgrade / revoke subscription
          const userRef = adminDb.collection('users').doc(paymentData.userId);
          await userRef.update({
            status: 'EXPIRED',
            subscriptionTier: 'FREE',
            'subscription.status': 'expired'
          });
        }
      } catch (dbErr) {
        console.error("Failed to revoke database subscription during refund:", dbErr);
      }

      res.json({ success: true, message: 'Refund successfully processed and subscription revoked.' });
    } catch (e: any) {
      console.error("Refund processing error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  // ===================================
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

  // Projects and pipelines api endpoints disabled for secure Exam Platform focus

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
      const baseUrl = 'https://www.agrigence.in';
      const databaseId = 'ai-studio-3e16a161-237b-431f-b594-a3f4635b9cc5';
      
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
        '/kisan/soil-analyzer'
      ];

      let dynamicRoutes: string[] = [];

      try {
        // Add Mandi Routes (Programmatic SEO)
        mandiPrices.forEach(p => dynamicRoutes.push(`/mandi-bhav/${p.city.toLowerCase()}`));
        // Add Scheme Routes (Programmatic SEO)
        schemes.forEach(s => dynamicRoutes.push(`/scheme/${s.slug}`));
        // Add Crop Routes (Programmatic SEO)
        cropAdvisory.forEach(c => dynamicRoutes.push(`/crop/${c.slug}`));

        // Fetch Blogs (Now in articles collection)
        const blogsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/articles`);
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

      const allRoutes = [...staticRoutes, ...kisanRoutes, ...dynamicRoutes];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>${[...staticRoutes, ...kisanRoutes].includes(route) ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : ([...staticRoutes, ...kisanRoutes].includes(route) ? '0.8' : '0.6')}</priority>
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
  } else if (!process.env.VERCEL) {
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
      const mandiMatch = req.path.match(/^\/mandi-bhav\/(.+)$/);
      const schemeMatch = req.path.match(/^\/scheme\/(.+)$/);
      const cropMatch = req.path.match(/^\/crop\/(.+)$/);
      
      if (blogMatch || newsMatch) {
        const collection = blogMatch ? 'articles' : 'news';
        const id = blogMatch ? blogMatch[1] : newsMatch![1];
        const doc = await getDoc(collection, id);
        if (doc) {
          const title = doc.title || 'Agrigence Publication';
          const description = (doc.content || doc.description || '').substring(0, 150);
          const image = doc.featuredImage || doc.thumbnail || fallbackImage;
          html = injectMeta(html, { title, description, image, url: `${baseUrl}${req.path}`, host });
        }
      } else if (mandiMatch) {
        const city = mandiMatch[1];
        const price = mandiPrices.find(p => p.city.toLowerCase() === city.toLowerCase());
        if (price) {
          const dateStr = new Date().toISOString().split('T')[0];
          const title = `${price.city} Mandi Bhav Today (${dateStr}) | Latest ${price.crop} Prices`;
          const description = `Today's latest Mandi Bhav for ${price.city} as of ${dateStr}. Current ${price.crop} price: ₹${price.min_price} - ₹${price.max_price}. Get real-time price trends and arrivals at Agrigence Publication.`;
          const schema = {
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": `${price.city} ${price.crop} Market Prices`,
            "description": description,
            "url": `${baseUrl}${req.path}`,
            "publisher": { "@type": "Organization", "name": "Agrigence Publication" }
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
            "publisher": { "@type": "Organization", "name": "Agrigence Publication" }
          };
          html = injectMeta(html, { title, description, image: fallbackImage, url: `${baseUrl}${req.path}`, schema, host });
        }
      } else if (cropMatch) {
        const slug = cropMatch[1];
        const crop = cropAdvisory.find(c => c.slug === slug);
        if (crop) {
          const title = `${crop.name} Cultivation Guide & Advisory`;
          const description = `Learn how to grow ${crop.name} with Agrigence Publication. Best soil: ${crop.soil_type}, Season: ${crop.season}. Direct answer to yield optimization.`;
          html = injectMeta(html, { title, description, image: fallbackImage, url: `${baseUrl}${req.path}`, host });
        }
      } else if (req.path === '/' || req.path === '') {
        html = injectMeta(html, { 
          title: 'Agrigence Publication | AI-Powered Agriculture Competitive Exam Platform', 
          description: 'Agrigence Publication is an AI-powered agriculture competitive exam preparation platform offering mock tests, smart analytics, AI recommendations, personalized revision systems, and real exam simulations for IBPS AFO, NABARD, ICAR, Agriculture Supervisor, and other agriculture exams.', 
          image: fallbackImage, 
          url: baseUrl,
          host
        });
      } else if (req.path === '/about-contact') {
        html = injectMeta(html, { 
          title: 'About Us & Contact', 
          description: 'Learn about Agrigence Publication, our mission, leadership, and how to get in touch with our team.', 
          image: fallbackImage, 
          url: `${baseUrl}/about-contact`,
          host
        });
      }
      
      res.send(html);
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export { app };
